import express, { Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import {
  retrieveChatbotKnowledge,
  classifyChatIntent,
  ChatIntent,
  AlumniRecommendationCard,
} from '../utils/aiChatRetrieval';
import {
  GeminiError,
  generateGeminiJson,
  isGeminiConfigured,
  getActiveAiConfig,
} from '../utils/geminiClient';
import AiLog from '../models/AiLog';

// In-memory response cache untuk kueri agregasi umum (TTL 10 menit)
interface CachedAiResponse {
  reply: string;
  citation?: any;
  recommendations: AlumniRecommendationCard[];
  followUpSuggestions: string[];
  timestamp: number;
}
const aiResponseCache = new Map<string, CachedAiResponse>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit

const router = express.Router();

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatbotResponsePayload {
  reply: string;
  followUpSuggestions: string[];
  recommendations?: AlumniRecommendationCard[];
}

const CHAT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    reply: {
      type: 'string',
      description:
        'Jawaban ramah, memotivasi, dan faktual menggunakan format markdown (bullet points, bold highlights).',
    },
    followUpSuggestions: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Daftar 2-3 tombol saran pertanyaan tindak lanjut yang relevan dan singkat.',
    },
  },
  required: ['reply', 'followUpSuggestions'],
};

const SYSTEM_INSTRUCTION_CONSULTANT = `Kamu adalah "SMANTA AI", asisten resmi konseling alumni dan eksplorasi karir SMA Negeri 1 Tawangsari (SMANTA).
Kamu bertugas melayani:
1. Siswa: Menjawab pertanyaan seputar perguruan tinggi, gambaran jurusan kuliah, jalur masuk (SNBP/SNBT/Mandiri), dan prospek profesi/karir nyata alumni SMANTA.
2. Alumni: Memberikan wawasan jejaring sesama alumni SMANTA, sebaran profesi, instansi/perusahaan, dan peluang kolaborasi.

Aturan Sangat Penting:
- Jangan pernah berasumsi siswa sudah memilih atau berencana masuk ke jurusan/kampus tertentu jika siswa belum menyebutkannya dalam percakapan!
- Jika pengguna hanya menyapa (misalnya: "hai", "halo", "selamat pagi", "assalamu'alaikum", dsb.), balas secara ramah dan natural. Sapa balik, perkenalkan diri secara singkat sebagai SMANTA AI, dan tanyakan apa yang ingin dieksplorasi (misal: info kampus alumni SMANTA, prospek karir jurusan tertentu, atau jalur masuk kuliah). JANGAN langsung membahas kampus/jurusan tertentu saat user hanya menyapa.
- Dasarkan data HANYA pada fakta alumni SMANTA yang disediakan dalam Konteks RAG. Jangan mengarang nama kampus, profesi, atau jumlah alumni.
- Jaga privasi: jangan sebutkan nomor kontak pribadi, email, atau alamat rumah alumni.
- Gunakan bahasa Indonesia yang ramah, sopan, memotivasi, dan terstruktur rapi dengan markdown (bullet points dan bolding).`;

// In-flight deduplication / simple throttle per user: max 12 queries / minute
const lastRequestByUser = new Map<string, number[]>();

const isThrottled = (userId: string): boolean => {
  const now = Date.now();
  const timestamps = (lastRequestByUser.get(userId) || []).filter(
    (t) => now - t < 60 * 1000,
  );
  if (timestamps.length >= 12) {
    return true;
  }
  timestamps.push(now);
  lastRequestByUser.set(userId, timestamps);
  return false;
};

/**
 * GET /status
 * Cek ketersediaan AI Chatbot
 */
router.get('/status', async (_req, res: Response) => {
  const activeConfig = await getActiveAiConfig();
  res.json({
    enabled: Boolean(activeConfig.apiKey && activeConfig.isActive),
    isActive: activeConfig.isActive,
    model: activeConfig.selectedModel,
    features: ['student-consultant', 'alumni-networking', 'rag-evidence'],
  });
});

/**
 * POST /
 * Main Chat Endpoint: POST /api/smart-match/chat
 */
router.post(
  '/',
  authenticate,
  authorize('student', 'alumni', 'admin', 'school'),
  async (req: AuthRequest, res: Response) => {
    const startTime = Date.now();
    let currentQuery = '';
    let sanitizedModel: string | undefined;
    const user = req.user;

    try {
      if (!user) {
        return res.status(401).json({ message: 'Autentikasi diperlukan.' });
      }

      const userId = String(user._id);
      if (isThrottled(userId)) {
        return res.status(429).json({
          message:
            'Terlalu banyak pesan dalam waktu singkat. Mohon tunggu beberapa detik sebelum mengirim pesan lagi.',
        });
      }

      const { messages, message, userRole, selectedModel: clientModel } = req.body;
      currentQuery = typeof message === 'string' && message.trim()
        ? message.trim()
        : Array.isArray(messages) && messages.length > 0
          ? messages[messages.length - 1]?.content || ''
          : '';

      if (!currentQuery) {
        return res.status(400).json({ message: 'Pesan pertanyaan tidak boleh kosong.' });
      }

      // Validasi dan sanitasi pilihan model dari client
      const ALLOWED_MODELS = [
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-3.6-flash',
        'gemini-1.5-pro',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
        'gemini-flash-latest',
      ];

      const activeAiConfig = await getActiveAiConfig();
      sanitizedModel =
        typeof clientModel === 'string' && ALLOWED_MODELS.includes(clientModel.trim())
          ? clientModel.trim()
          : activeAiConfig.selectedModel || 'gemini-flash-lite-latest';

      const userProfile = {
        fullName: user.profile?.fullName,
        graduationYear: user.profile?.graduationYear,
        university: user.university?.name,
        major: user.university?.major,
      };

      const normalizedRole = (userRole || user.role || 'student').toLowerCase();
      const userName = user.profile?.fullName ? user.profile.fullName.split(' ')[0] : 'Sobat';

      // ==========================================
      // INTENT CLASSIFICATION & ROUTING
      // ==========================================
      const detectedIntent: ChatIntent = classifyChatIntent(currentQuery);

      // 1. FAST-PATH GREETING DETECTOR (< 50ms)
      if (detectedIntent === 'GREETING') {
        let reply = '';
        let followUpSuggestions: string[] = [];

        if (normalizedRole === 'admin' || normalizedRole === 'school') {
          reply = `Halo **${userName}**! 👋 Saya **SMANTA AI**, asisten cerdas pemantauan tracer study dan direktori alumni SMA Negeri 1 Tawangsari.\n\nSaya siap membantu Anda meninjau rekapitulasi data tracer study, sebaran kampus dan jurusan alumni, statistik serapan kerja, hingga verifikasi data alumni. Apa yang ingin Anda pantau hari ini?`;
          followUpSuggestions = [
            'Bagaimana ringkasan rekapitulasi data tracer study saat ini?',
            'Kampus mana saja yang paling mendominasi tujuan kuliah alumni SMANTA?',
            'Bagaimana statistik serapan kerja alumni dan bidang profesi terbanyak?',
          ];
        } else if (normalizedRole === 'alumni') {
          reply = `Halo Kak **${userName}**! 👋 Senang berjumpa kembali di Tracer Study SMANTA. Saya **SMANTA AI**, siap membantu Anda mengeksplorasi jejaring almamater, sebaran perguruan tinggi, direktori profesi & pekerjaan, hingga statistik angkatan kelulusan alumni SMANTA.\n\nAda topik atau data alumni yang ingin Kakak telusuri hari ini?`;
          followUpSuggestions = [
            'Perguruan tinggi mana saja yang paling banyak menjadi almamater alumni SMANTA?',
            'Apa saja bidang pekerjaan atau profesi yang paling banyak ditekuni alumni saat ini?',
            'Berapa banyak alumni SMANTA yang melanjutkan kuliah di UNS dan Undip?',
          ];
        } else {
          // Default role: student
          reply = `Halo **${userName}**! 👋 Selamat datang di **SMANTA AI**, asisten resmi konseling alumni dan eksplorasi karir SMAN 1 Tawangsari.\n\nSaya siap membantumu mencari info kampus favorit alumni, peluang lolos jurusan impian via jalur SNBP/SNBT, hingga prospek karir nyata dari para alumni SMANTA. Apa yang ingin kamu tanyakan hari ini?`;
          followUpSuggestions = [
            'Kampus mana saja yang paling banyak dituju alumni SMANTA?',
            'Jurusan apa yang paling favorit dipilih alumni?',
            'Bagaimana persebaran alumni yang lolos jalur SNBP dan SNBT?',
          ];
        }

        const latencyMs = Date.now() - startTime;

        // Log fast-path greeting to AiLog
        AiLog.create({
          user: {
            userId: user._id,
            fullName: user.profile?.fullName || user.username || 'Pengguna',
            username: user.username,
            email: user.email,
            role: user.role,
            nip: (user as any).nip,
          },
          query: currentQuery,
          responsePreview: reply.slice(0, 300),
          aiModel: 'fast-path-greeting',
          status: 'success',
          latencyMs,
          tokensEstimated: {
            promptChars: currentQuery.length,
            responseChars: reply.length,
            totalChars: currentQuery.length + reply.length,
          },
          hasCitation: false,
          recommendationsCount: 0,
          ipAddress: req.ip || req.socket.remoteAddress,
        }).catch((err) => console.error('[FastPathGreeting] Log error:', err));

        return res.json({
          reply,
          citation: undefined,
          recommendations: [],
          followUpSuggestions,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. OUT-OF-SCOPE HANDLER (Tanpa beban query berat ke Database & LLM luas)
      if (detectedIntent === 'OUT_OF_SCOPE') {
        const reply =
          `Maaf, saya adalah asisten **SMANTA AI** yang dikhususkan untuk membantu informasi seputar tracer study alumni, perguruan tinggi tujuan, pemilihan jurusan kuliah, jalur masuk seleksi (SNBP, SNBT, Mandiri), dan prospek karir alumni **SMA Negeri 1 Tawangsari**.\n\n` +
          `Apakah pertanyaan Anda berkaitan dengan salah satu topik tersebut? Silakan tanyakan hal seputar rencana studi lanjut atau jejak karir alumni SMANTA yang ingin Anda ketahui!`;

        const followUpSuggestions = [
          'Kampus mana saja yang paling banyak dituju alumni SMANTA?',
          'Jurusan apa yang paling populer di kalangan alumni?',
          'Bagaimana peluang kelulusan lewat jalur SNBP dan SNBT?',
        ];

        const latencyMs = Date.now() - startTime;

        AiLog.create({
          user: {
            userId: user._id,
            fullName: user.profile?.fullName || user.username || 'Pengguna',
            username: user.username,
            email: user.email,
            role: user.role,
            nip: (user as any).nip,
          },
          query: currentQuery,
          responsePreview: reply.slice(0, 300),
          aiModel: 'fast-path-out-of-scope',
          status: 'success',
          latencyMs,
          tokensEstimated: {
            promptChars: currentQuery.length,
            responseChars: reply.length,
            totalChars: currentQuery.length + reply.length,
          },
          hasCitation: false,
          recommendationsCount: 0,
          ipAddress: req.ip || req.socket.remoteAddress,
        }).catch((err) => console.error('[OutOfScope] Log error:', err));

        return res.json({
          reply,
          citation: undefined,
          recommendations: [],
          followUpSuggestions,
          timestamp: new Date().toISOString(),
        });
      }

      // 3. IN-DOMAIN INTENT RETRIEVAL (Terarah sesuai intent)
      // Cek Cache Cerdas: jika pertanyaan umum yang sama/mirip diajukan dalam kurun waktu 10 menit
      const normalizedQueryKey = `${normalizedRole}:${detectedIntent}:${currentQuery.trim().toLowerCase().replace(/\s+/g, ' ')}`;
      const cached = aiResponseCache.get(normalizedQueryKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        const latencyMs = Date.now() - startTime;
        return res.json({
          reply: cached.reply,
          citation: cached.citation,
          recommendations: cached.recommendations,
          followUpSuggestions: cached.followUpSuggestions,
          timestamp: new Date().toISOString(),
          isCached: true,
        });
      }

      const ragKnowledge = await retrieveChatbotKnowledge({
        query: currentQuery,
        intent: detectedIntent,
        role: (userRole || user.role) as any,
        userProfile,
      });

      // Construct prompt with history context
      const historyExcerpt = Array.isArray(messages)
        ? messages
          .slice(-6)
          .map((m: any) => `${m.role === 'user' ? 'Pengguna' : 'SMANTA AI'}: ${m.content}`)
          .join('\n')
        : '';

      const fullPrompt = `Konteks Pengguna:
- Peran Login: ${user.role} (${user.profile?.fullName || 'Pengguna'})
${user.university?.name ? `- Kampus Alumni Pengguna: ${user.university?.name} (${user.university?.major || ''})` : ''}

Konteks Database Alumni SMANTA (Hasil RAG Retrieval):
${ragKnowledge.contextSummary}

${historyExcerpt ? `Riwayat Percakapan Sebelumnya:\n${historyExcerpt}\n` : ''}
Pertanyaan Terbaru Pengguna:
"${currentQuery}"

Instruksi Tambahan:
${ragKnowledge.isGeneralGreeting
          ? '- Pengguna sedang menyapa. Balas dengan sapaan hangat, perkenalkan diri sebagai SMANTA AI, dan tanyakan hal yang ingin diketahui siswa/alumni seputar kampus, jurusan, atau karir. Jangan tampilkan rekomendasi kampus/jurusan dulu.'
          : '- Berikan respon cerdas, faktual, terstruktur rapi dengan markdown, dan cantumkan bukti alumni dari data di atas jika relevan.'}
Berikan juga 2-3 ide saran pertanyaan lanjutan di 'followUpSuggestions'.`;

      const aiResult = await generateGeminiJson<ChatbotResponsePayload>({
        systemInstruction: SYSTEM_INSTRUCTION_CONSULTANT,
        prompt: fullPrompt,
        responseSchema: CHAT_RESPONSE_SCHEMA,
        temperature: activeAiConfig.temperature ?? 0.5,
        maxOutputTokens: activeAiConfig.maxTokens ?? 2048,
        modelOverride: sanitizedModel,
      });

      // Show recommendation cards only when relevant and not greeting
      const finalRecommendations: AlumniRecommendationCard[] = ragKnowledge.isGeneralGreeting
        ? []
        : [...(ragKnowledge.recommendations || [])];

      const latencyMs = Date.now() - startTime;
      const promptChars = fullPrompt.length;
      const responseChars = (aiResult.reply || '').length;

      // Asynchronously log the AI interaction to MongoDB
      AiLog.create({
        user: {
          userId: user._id,
          fullName: user.profile?.fullName || user.username || 'Pengguna',
          username: user.username,
          email: user.email,
          role: user.role,
        },
        query: currentQuery,
        responsePreview: (aiResult.reply || '').slice(0, 300),
        aiModel: sanitizedModel,
        status: 'success',
        latencyMs,
        tokensEstimated: {
          promptChars,
          responseChars,
          totalChars: promptChars + responseChars,
        },
        hasCitation: Boolean(ragKnowledge.citation),
        recommendationsCount: finalRecommendations.length,
        ipAddress: req.ip || req.socket.remoteAddress,
      }).catch((logErr) => console.error('Error logging successful AI interaction:', logErr));

      // Simpan ke cache cerdas
      aiResponseCache.set(normalizedQueryKey, {
        reply: aiResult.reply,
        citation: ragKnowledge.citation,
        recommendations: finalRecommendations,
        followUpSuggestions: aiResult.followUpSuggestions || [],
        timestamp: Date.now(),
      });

      return res.json({
        reply: aiResult.reply,
        citation: ragKnowledge.citation,
        recommendations: finalRecommendations,
        followUpSuggestions: aiResult.followUpSuggestions || [],
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = error?.message || 'Unknown error';
      console.error('[SmartMatchChat] Error processing AI chat query:', {
        query: currentQuery,
        error: errorMsg,
        details: error?.response?.data || error?.stack,
      });

      let loggedModel = sanitizedModel || 'gemini-flash-lite-latest';
      try {
        if (!loggedModel) {
          const activeCfg = await getActiveAiConfig();
          loggedModel = activeCfg.selectedModel || 'gemini-flash-lite-latest';
        }
      } catch {
        // Fallback model default jika pembacaan AiConfig gagal
      }

      if (user && currentQuery) {
        AiLog.create({
          user: {
            userId: user._id,
            fullName: user.profile?.fullName || user.username || 'Pengguna',
            username: user.username,
            email: user.email,
            role: user.role,
            nip: (user as any).nip,
          },
          query: currentQuery,
          aiModel: loggedModel,
          status: 'error',
          errorMessage: errorMsg.slice(0, 500),
          latencyMs,
          tokensEstimated: {
            promptChars: currentQuery.length,
            responseChars: 0,
            totalChars: currentQuery.length,
          },
          hasCitation: false,
          recommendationsCount: 0,
          ipAddress: req.ip || req.socket.remoteAddress,
        }).catch((logErr) => console.error('Error logging failed AI interaction:', logErr));
      }

      if (error instanceof GeminiError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Chatbot RAG API error:', error);
      return res.status(500).json({
        message:
          'Terjadi gangguan saat memproses konsultasi AI. Silakan coba kembali nanti.',
      });
    }
  },
);

export default router;
