import express, { Response } from 'express';
import CollegePlan from '../models/CollegePlan';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { buildMatchContext, MatchStats } from '../utils/aiMatchRetrieval';
import {
  GeminiError,
  generateGeminiJson,
  isGeminiConfigured,
} from '../utils/geminiClient';

const router = express.Router();

interface AiMatchPayload {
  ringkasan: string;
  peluangLabel: string;
  peluangAlasan: string[];
  kekuatan: string[];
  risiko: string[];
  strategi: { judul: string; detail: string }[];
  alternatifKampus: { nama: string; jurusan: string; alasan: string }[];
  jurusanAlternatif: { nama: string; alasan: string }[];
  langkah: string[];
  catatanData: string;
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    ringkasan: { type: 'string' },
    peluangLabel: { type: 'string', enum: ['Tinggi', 'Sedang', 'Rendah'] },
    peluangAlasan: { type: 'array', items: { type: 'string' } },
    kekuatan: { type: 'array', items: { type: 'string' } },
    risiko: { type: 'array', items: { type: 'string' } },
    strategi: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          judul: { type: 'string' },
          detail: { type: 'string' },
        },
        required: ['judul', 'detail'],
      },
    },
    alternatifKampus: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nama: { type: 'string' },
          jurusan: { type: 'string' },
          alasan: { type: 'string' },
        },
        required: ['nama', 'jurusan', 'alasan'],
      },
    },
    jurusanAlternatif: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nama: { type: 'string' },
          alasan: { type: 'string' },
        },
        required: ['nama', 'alasan'],
      },
    },
    langkah: { type: 'array', items: { type: 'string' } },
    catatanData: { type: 'string' },
  },
  required: [
    'ringkasan',
    'peluangLabel',
    'peluangAlasan',
    'kekuatan',
    'risiko',
    'strategi',
    'langkah',
    'catatanData',
  ],
};

const SYSTEM_INSTRUCTION = `Kamu adalah konselor akademik dan karier untuk siswa SMA Negeri 1 Tawangsari (SMANTA), Indonesia.
Tugasmu menilai rencana studi seorang siswa memakai DATA ALUMNI yang diberikan dalam JSON.

Aturan wajib:
- Gunakan HANYA angka dan fakta dari JSON konteks. Jangan mengarang jumlah alumni, nama kampus, atau profesi.
- Jika data untuk suatu bagian kosong atau sedikit, katakan datanya terbatas, jangan menutupinya dengan klaim.
- Sapa siswa dengan "kamu", nada hangat, realistis, dan memotivasi. Bahasa Indonesia.
- Sebut angka konkret (jumlah alumni, mentor, peminat) saat relevan.
- Jangan pernah menyebut email, media sosial, atau data pribadi alumni.
- Total seluruh teks maksimal sekitar 350 kata. Kalimat pendek dan mudah dipahami siswa kelas 12.`;

const buildPrompt = (
  context: string,
  extra: { name?: string; entryPath?: string; readiness?: string },
): string => `Data konteks alumni (JSON):
${context}

Profil singkat siswa:
- Nama panggilan: ${extra.name || 'siswa'}
- Jalur masuk yang dipertimbangkan: ${extra.entryPath || 'belum ditentukan'}
- Tingkat keyakinan: ${extra.readiness || 'belum diisi'}

Buat analisis dengan aturan berikut:
1. ringkasan: 2-3 kalimat gambaran peluang target kampus/jurusan berdasarkan data.
2. peluangLabel: "Tinggi", "Sedang", atau "Rendah" mengikuti kekuatan data alumni (bukan opini umum).
3. peluangAlasan: 2-4 poin berisi angka pendukung.
4. kekuatan & risiko: masing-masing 2-4 poin spesifik dari data.
5. strategi: 3-4 langkah nyata untuk SNBP/SNBT/mandiri sesuai jalur siswa.
6. alternatifKampus: maksimal 3 kampus lain dari data alternativeUniversities, kosongkan jika tidak ada.
7. jurusanAlternatif: maksimal 3, kosongkan jika tidak ada.
8. langkah: 3-5 aksi konkret dalam 1-3 bulan ke depan.
9. catatanData: satu kalimat tentang cakupan/keterbatasan data alumni yang dipakai.`;

const toStringList = (value: unknown, max: number): string[] =>
  Array.isArray(value)
    ? value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, max)
    : [];

const normalize = (raw: Partial<AiMatchPayload>): AiMatchPayload => {
  const strategi = Array.isArray(raw.strategi)
    ? raw.strategi
      .filter((item) => item && typeof item.judul === 'string')
      .map((item) => ({
        judul: String(item.judul).trim(),
        detail: String(item.detail || '').trim(),
      }))
      .filter((item) => item.judul && item.detail)
      .slice(0, 4)
    : [];

  const alternatifKampus = Array.isArray(raw.alternatifKampus)
    ? raw.alternatifKampus
      .filter((item) => item && typeof item.nama === 'string')
      .map((item) => ({
        nama: String(item.nama).trim(),
        jurusan: String(item.jurusan || '').trim(),
        alasan: String(item.alasan || '').trim(),
      }))
      .filter((item) => item.nama)
      .slice(0, 3)
    : [];

  const jurusanAlternatif = Array.isArray(raw.jurusanAlternatif)
    ? raw.jurusanAlternatif
      .filter((item) => item && typeof item.nama === 'string')
      .map((item) => ({
        nama: String(item.nama).trim(),
        alasan: String(item.alasan || '').trim(),
      }))
      .filter((item) => item.nama)
      .slice(0, 3)
    : [];

  const label = ['Tinggi', 'Sedang', 'Rendah'].includes(raw.peluangLabel || '')
    ? (raw.peluangLabel as string)
    : 'Sedang';

  return {
    ringkasan: String(raw.ringkasan || '').trim(),
    peluangLabel: label,
    peluangAlasan: toStringList(raw.peluangAlasan, 4),
    kekuatan: toStringList(raw.kekuatan, 4),
    risiko: toStringList(raw.risiko, 4),
    strategi,
    alternatifKampus,
    jurusanAlternatif,
    langkah: toStringList(raw.langkah, 5),
    catatanData: String(raw.catatanData || '').trim(),
  };
};

// Simple in-memory cache: the alumni snapshot changes slowly, an AI answer is
// expensive, and the same target usually gets requested repeatedly.
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const cache = new Map<string, { payload: unknown; expiresAt: number }>();
const inFlight = new Map<string, Promise<unknown>>();

// Per-user throttle so one account cannot burn the AI quota.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 8;
const rateBuckets = new Map<string, number[]>();

const isRateLimited = (userId: string): boolean => {
  const now = Date.now();
  const recent = (rateBuckets.get(userId) || []).filter(
    (timestamp) => now - timestamp < RATE_WINDOW_MS,
  );
  if (recent.length >= RATE_MAX_REQUESTS) {
    rateBuckets.set(userId, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(userId, recent);
  return false;
};

const readCache = (key: string): unknown | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.payload;
};

const writeCache = (key: string, payload: unknown): void => {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { payload, expiresAt: Date.now() + CACHE_TTL_MS });
};

router.post(
  '/',
  authenticate,
  authorize('student'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({
          message:
            'Fitur AI belum aktif. Hubungi admin untuk mengatur GEMINI_API_KEY di server.',
        });
      }

      const body = req.body || {};
      const plan = await CollegePlan.findOne({ user: req.user!._id }).lean();

      const targetUniversity = String(
        body.targetUniversity || plan?.targetUniversity || '',
      ).trim();
      const targetMajor = String(
        body.targetMajor || plan?.targetMajor || '',
      ).trim();

      if (!targetUniversity && !targetMajor) {
        return res.json({
          hasPlan: false,
          message:
            'Belum ada rencana studi. Atur target perguruan tinggi dan jurusan dulu untuk memulai analisis AI.',
        });
      }

      const cacheKey = [
        targetUniversity.toLowerCase(),
        targetMajor.toLowerCase(),
        String(plan?.rumpun || '').toLowerCase(),
        String(body.entryPath || plan?.entryPath || '').toLowerCase(),
        body.refresh ? String(Date.now()) : '',
      ].join('|');

      if (!body.refresh) {
        const cached = readCache(cacheKey);
        if (cached) {
          return res.json({ ...(cached as object), cached: true });
        }
      }

      const userId = String(req.user!._id);
      if (isRateLimited(userId)) {
        return res.status(429).json({
          message:
            'Terlalu banyak permintaan analisis AI. Tunggu beberapa menit lalu coba lagi.',
        });
      }

      const runAnalysis = async () => {
        const { context, stats } = await buildMatchContext({
          targetUniversity,
          targetMajor,
          rumpun: plan?.rumpun,
          entryPath: body.entryPath || plan?.entryPath,
          readinessStatus: plan?.readinessStatus,
        });

        const raw = await generateGeminiJson<Partial<AiMatchPayload>>({
          systemInstruction: SYSTEM_INSTRUCTION,
          prompt: buildPrompt(context, {
            name: req.user?.profile?.fullName?.split(' ')[0],
            entryPath: body.entryPath || plan?.entryPath,
            readiness: plan?.readinessStatus,
          }),
          responseSchema: RESPONSE_SCHEMA,
        });

        return {
          hasPlan: true,
          targetUniversity,
          targetMajor,
          rumpun: plan?.rumpun || null,
          entryPath: body.entryPath || plan?.entryPath || null,
          readinessStatus: plan?.readinessStatus || null,
          ai: normalize(raw),
          stats: stats as MatchStats,
          generatedAt: new Date().toISOString(),
          cached: false,
        };
      };

      let pending = inFlight.get(cacheKey) as Promise<unknown> | undefined;
      if (!pending) {
        pending = runAnalysis().finally(() => inFlight.delete(cacheKey));
        inFlight.set(cacheKey, pending);
      }

      const payload = await pending;
      writeCache(cacheKey, payload);
      return res.json(payload);
    } catch (error: any) {
      if (error instanceof GeminiError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('AI match error:', error);
      return res.status(500).json({
        message: 'Gagal membuat analisis AI. Coba lagi sebentar.',
      });
    }
  },
);

// Lightweight readiness probe for the frontend.
router.get('/status', async (_req, res: Response) => {
  res.json({ enabled: isGeminiConfigured() });
});

export default router;
