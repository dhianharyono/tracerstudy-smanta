import axios from 'axios';
import AiConfig from '../models/AiConfig';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-1.5-flash';
const PER_MODEL_TIMEOUT_MS = 12000; // Cepat & responsif (12s per model attempt)

// List of fallback models when primary model fails due to 404, 503, 429, or timeout.
// Urutan diprioritaskan ke model dengan limit kuota RPM/RPD Free Tier tertinggi & paling stabil:
// 1. gemini-1.5-flash (15 RPM, kuota paling luas di Google AI Studio free tier)
// 2. gemini-flash-lite-latest / gemini-2.5-flash-lite (Hemat token & kuota)
// 3. gemini-2.0-flash / gemini-flash-latest
// 4. gemini-3.5-flash-lite / gemini-3.6-flash / gemini-1.5-pro
const FALLBACK_MODELS = [
  'gemini-1.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-1.5-pro',
];

export class GeminiError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

/**
 * Mendapatkan konfigurasi AI aktif dari database AiConfig (dengan fallback ke file environment .env).
 */
export const getActiveAiConfig = async (): Promise<{
  apiKey: string;
  apiKeys: string[];
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}> => {
  try {
    const config = await AiConfig.findOne().sort({ updatedAt: -1 }).lean();
    if (config) {
      const singleKey = config.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim() || '';
      const rawKeys: string[] = [];
      if (Array.isArray(config.apiKeys)) {
        config.apiKeys.forEach((k) => {
          if (typeof k === 'string' && k.trim()) rawKeys.push(k.trim());
        });
      }
      if (singleKey) {
        // Mendukung multiple keys yang dipisahkan koma atau newline pada field singleKey
        singleKey.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean).forEach((k) => rawKeys.push(k));
      }
      const uniqueKeys = Array.from(new Set(rawKeys));

      return {
        apiKey: uniqueKeys[0] || singleKey,
        apiKeys: uniqueKeys.length > 0 ? uniqueKeys : (singleKey ? [singleKey] : []),
        selectedModel: config.selectedModel || process.env.GEMINI_MODEL || DEFAULT_MODEL,
        temperature: typeof config.temperature === 'number' ? config.temperature : 0.7,
        maxTokens: typeof config.maxTokens === 'number' ? config.maxTokens : 2048,
        isActive: config.isActive !== false,
      };
    }
  } catch (err) {
    console.error('Error fetching AiConfig from DB, using env fallback:', err);
  }

  const envKey = process.env.GEMINI_API_KEY?.trim() || '';
  const envKeys = envKey ? envKey.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean) : [];

  return {
    apiKey: envKeys[0] || envKey,
    apiKeys: envKeys,
    selectedModel: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    temperature: 0.7,
    maxTokens: 2048,
    isActive: true,
  };
};

export const isGeminiConfigured = (): boolean =>
  Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());

export interface GenerateJsonOptions {
  systemInstruction: string;
  prompt: string;
  responseSchema: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  apiKeyOverride?: string;
  modelOverride?: string;
}

// In-memory key failure tracker (to rotate API keys on 429 quota exhaustion)
const keyCooldownMap = new Map<string, number>();
const KEY_COOLDOWN_MS = 60 * 1000; // 1 menit cooldown per API key saat terkena 429

/**
 * Calls Gemini generateContent and returns the parsed JSON response.
 * Mendukung rotasi multi-API key & model fallback cascade saat 429/503/timeout.
 */
export const generateGeminiJson = async <T>(
  options: GenerateJsonOptions,
): Promise<T> => {
  const activeConfig = await getActiveAiConfig();

  if (!activeConfig.isActive) {
    throw new GeminiError('Fitur asisten AI sedang dinonaktifkan sementara oleh administrator.', 503);
  }

  // Siapkan daftar API keys yang tersedia
  let candidateKeys: string[] = [];
  if (options.apiKeyOverride && options.apiKeyOverride.trim()) {
    candidateKeys = [options.apiKeyOverride.trim()];
  } else {
    candidateKeys = activeConfig.apiKeys && activeConfig.apiKeys.length > 0
      ? [...activeConfig.apiKeys]
      : (activeConfig.apiKey ? [activeConfig.apiKey] : []);
  }

  if (candidateKeys.length === 0) {
    throw new GeminiError('Fitur AI belum dikonfigurasi (Kunci API Gemini belum diatur).', 503);
  }

  // Urutkan key: utamakan key yang belum terkena cooldown 429
  const now = Date.now();
  candidateKeys.sort((a, b) => {
    const aCooldown = (keyCooldownMap.get(a) || 0) > now ? 1 : 0;
    const bCooldown = (keyCooldownMap.get(b) || 0) > now ? 1 : 0;
    return aCooldown - bCooldown;
  });

  const preferredModel = (options.modelOverride || activeConfig.selectedModel || DEFAULT_MODEL).trim();
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: any = null;

  // Coba kombinasi (API Key -> Models)
  for (const currentApiKey of candidateKeys) {
    for (const model of modelsToTry) {
      const url = `${API_BASE}/models/${encodeURIComponent(model)}:generateContent`;
      try {
        const response = await axios.post(
          url,
          {
            systemInstruction: {
              parts: [{ text: options.systemInstruction }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: options.prompt }],
              },
            ],
            generationConfig: {
              temperature: options.temperature ?? 0.4,
              maxOutputTokens: options.maxOutputTokens ?? 2048,
              responseMimeType: 'application/json',
              responseSchema: options.responseSchema,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
          },
          {
            timeout: PER_MODEL_TIMEOUT_MS,
            headers: { 'Content-Type': 'application/json' },
            params: { key: currentApiKey },
          },
        );

        const candidate = response.data?.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const text = (candidate?.content?.parts || [])
          .map((part: { text?: string }) => part?.text || '')
          .join('')
          .trim();

        if (!text) {
          if (finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT') {
            throw new GeminiError('Permintaan diblokir oleh filter keamanan AI.', 422);
          }
          throw new GeminiError('AI tidak mengembalikan jawaban. Coba lagi sebentar.', 502);
        }

        try {
          return JSON.parse(text) as T;
        } catch {
          const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
          const start = cleaned.indexOf('{');
          const end = cleaned.lastIndexOf('}');
          if (start !== -1 && end > start) {
            return JSON.parse(cleaned.slice(start, end + 1)) as T;
          }
          throw new GeminiError('Format jawaban AI tidak valid.', 502);
        }
      } catch (error: any) {
        if (error instanceof GeminiError && error.status === 422) {
          throw error;
        }
        lastError = error;
        const status = error?.response?.status;
        const errorMsg = error?.response?.data?.error?.message || error?.message || '';
        console.warn(`[GeminiClient] Model ${model} failed (status: ${status}, code: ${error?.code}): ${errorMsg}. Trying fallback...`);

        // Jika terkena 429 Too Many Requests: tandai key ini sedang cooldown
        if (status === 429) {
          keyCooldownMap.set(currentApiKey, Date.now() + KEY_COOLDOWN_MS);
          // Jika masih ada API key lain di candidateKeys, langsung coba API key berikutnya!
          if (candidateKeys.length > 1 && currentApiKey !== candidateKeys[candidateKeys.length - 1]) {
            console.warn(`[GeminiClient] API Key hit 429 limit. Rotating to next available API Key...`);
            break; // Keluar dari loop model untuk beralih ke next API key
          }
        }

        // If 404, 503 (high demand spike), 429, or network timeout, try next fallback model immediately
        if (status === 404 || status === 503 || status === 429 || error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
          await new Promise((r) => setTimeout(r, 120));
          continue;
        }

        // If 400 or 403, bad api key - jika ada key lain, coba key lain
        if (status === 400 || status === 403) {
          if (candidateKeys.length > 1) {
            break; // coba key berikutnya
          }
          throw new GeminiError(
            'Kunci API AI ditolak. Periksa kembali konfigurasi GEMINI_API_KEY.',
            502,
          );
        }
      }
    }
  }

  const status = lastError?.response?.status;
  const detailedMsg = lastError?.response?.data?.error?.message;
  if (status === 429) {
    throw new GeminiError(
      'Kuota AI sedang penuh atau mencapai batas limit. Mohon coba beberapa saat lagi.',
      429,
    );
  }
  if (status === 503) {
    throw new GeminiError(
      'Layanan AI Google saat ini sedang mengalami lonjakan beban tinggi (503). Sistem telah mencoba model alternatif namun semua model sedang padat. Coba beberapa saat lagi.',
      503,
    );
  }
  if (status === 400 || status === 403) {
    throw new GeminiError(
      'Kunci API AI ditolak. Periksa kembali konfigurasi GEMINI_API_KEY.',
      502,
    );
  }
  if (lastError?.code === 'ECONNABORTED' || lastError?.code === 'ETIMEDOUT') {
    throw new GeminiError('AI memerlukan waktu lebih lama dari batas timeout. Silakan ulangi pertanyaan Anda.', 504);
  }
  throw new GeminiError(
    detailedMsg ? `Gagal menghubungi layanan AI: ${detailedMsg}` : 'Gagal menghubungi layanan AI. Coba lagi.',
    502,
  );
};
