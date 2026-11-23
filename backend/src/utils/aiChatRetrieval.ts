import User from '../models/User';

export type ChatIntent =
  | 'GREETING'
  | 'CAMPUS_INQUIRY'
  | 'MAJOR_INQUIRY'
  | 'CAREER_INQUIRY'
  | 'ADMISSION_INQUIRY'
  | 'GRADUATION_BATCH'
  | 'OUT_OF_SCOPE';

export interface ChatRetrievalFilter {
  query: string;
  intent?: ChatIntent;
  role?: 'student' | 'alumni' | 'admin' | 'school';
  userProfile?: {
    fullName?: string;
    graduationYear?: number;
    university?: string;
    major?: string;
  };
}

export interface AlumniRecommendationCard {
  title: string;
  subtitle?: string;
  category?: 'kampus' | 'jurusan' | 'karir' | 'alumni';
  peluangLabel?: 'Peluang Tinggi' | 'Peluang Sedang' | 'Kompetitif';
  statsInfo?: string;
  description?: string;
  actionText?: string;
}

export interface AlumniCitation {
  totalCount: number;
  label: string;
  cohortRange?: string;
  details?: string[];
}

export interface ChatContextResult {
  contextSummary: string;
  citation: AlumniCitation;
  recommendations: AlumniRecommendationCard[];
  isGeneralGreeting: boolean;
}

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const clean = (val?: string | null): string =>
  typeof val === 'string' ? val.trim() : '';

const safeName = (val?: string | null): string => {
  const c = clean(val);
  if (!c || ['-', 'null', 'undefined', '.'].includes(c.toLowerCase())) return '';
  // Sensor ketat: jika berisi email (@), nomor telepon, atau karakter url, jangan dianggap sebagai nama posisi/kampus yang valid
  if (/@|\.com|\.id|\.org|\.net|\.co|http:\/\/|https:\/\/|^\+?\d{8,}/i.test(c)) {
    return '';
  }
  return c;
};

// Check if query is just a greeting/casual opening
export const checkIsGreeting = (query: string): boolean => {
  const q = query.toLowerCase().trim();
  const greetingPatterns = [
    /^(hai|halo|helo|hello|hi|hey|pagi|siang|sore|malam|assalamu['a-z]*|tes|test|p)(\s+.*)?$/i,
    /^(apa kabar|siapa kamu|kamu siapa|bisa bantu apa|menu|help|bantuan)(\s+.*)?$/i,
  ];
  return greetingPatterns.some((pattern) => pattern.test(q)) && q.split(/\s+/).length <= 4;
};

/**
 * Intent Classifier / Router untuk SMANTA AI
 * Mendeteksi intent pertanyaan pengguna sebelum query ke database MongoDB / LLM.
 */
export const classifyChatIntent = (query: string): ChatIntent => {
  const q = query.toLowerCase().trim();

  // 1. Sapaan / Greeting
  if (checkIsGreeting(q)) {
    return 'GREETING';
  }

  // Kata kunci in-domain seputar SMANTA, sekolah, kuliah, dan karir
  const isDomainRelated =
    /\b(smanta|sma\s*1\s*tawangsari|alumni|lulusan|sekolah|studi|kuliah|kampus|univ|universitas|ptn|pts|jurusan|prodi|fakultas|snbt|snbp|mandiri|span-ptkin|jalur|karir|karier|pekerjaan|kerja|profesi|gaji|instansi|perusahaan|kantor|angkatan|tahun kelulusan|rekap|tracer|tracer study)\b/i.test(
      q,
    );

  // 2. Jalur Masuk (SNBP, SNBT, Mandiri)
  if (
    /\b(snbp|snbt|mandiri|span-ptkin|utbk|tes masuk|jalur masuk|jalur seleksi|kuota jalur|lewat jalur)\b/i.test(
      q,
    )
  ) {
    return 'ADMISSION_INQUIRY';
  }

  // 3. Angkatan / Tahun Kelulusan
  if (
    /\b(angkatan|tahun lulus|tahun kelulusan|lulus tahun|lulusan tahun|batch|cohort)\b/i.test(
      q,
    ) ||
    (/\b(alumni|lulusan)\b/i.test(q) && /\b(201\d|202\d)\b/.test(q))
  ) {
    return 'GRADUATION_BATCH';
  }

  // 4. Karir & Pekerjaan
  if (
    /\b(karir|karier|kerja|pekerjaan|profesi|bidang kerja|bidang profesi|perusahaan|kantor|instansi|gaji|penghasilan|industri|loker|lowongan|wirausaha|bisnis)\b/i.test(
      q,
    )
  ) {
    return 'CAREER_INQUIRY';
  }

  // 5. Jurusan / Program Studi
  if (
    /\b(jurusan|prodi|program studi|fakultas|mata kuliah|kuliah di bidang|linjur|lintas jurusan)\b/i.test(
      q,
    ) ||
    (/\b(informatika|kedokteran|hukum|teknik|manajemen|akuntansi|psikologi|ilmu komunikasi|biologi|farmasi|keperawatan|pendidikan|sastra)\b/i.test(
      q,
    ) && !/\b(universitas|kampus|institut|politeknik)\b/i.test(q))
  ) {
    return 'MAJOR_INQUIRY';
  }

  // 6. Kampus / Perguruan Tinggi
  if (
    /\b(kampus|universitas|univ|ptn|pts|institut|politeknik|ugm|undip|uns|unnes|itb|ui|its|unair|brawijaya|ub|upn|isi|uty|ums|unissula)\b/i.test(
      q,
    )
  ) {
    return 'CAMPUS_INQUIRY';
  }

  // 7. Pola Out-Of-Scope eksplisit
  const outOfScopePatterns = [
    // Resep / Masakan
    /\b(resep|bumbu|masak|nasi goreng|kue|mie|minuman|cara membuat (roti|makanan|nasi|kue|jus))\b/i,
    // Coding / Software development murni tanpa kaitan tracer study
    /\b(function|console\.log|write a python|buatkan script|buatkan kode|syntax|html\b|css\b|javascript|regex|sql injection|buat website|docker|kubernetes)\b/i,
    // Matematika / Sains teoritis random
    /\b(hitunglah|integral|turunan|rumus fisika|hukum newton|pythagoras|persamaan kuadrat)\b/i,
    // Politik, Berita umum dunia, Cuaca, Gosip
    /\b(pemilu|presiden|pilpres|cuaca hari ini|gempa bumi|perang|kurs dollar|bitcoin|crypto|horoskop|zodiak)\b/i,
    // Game, entertainment, lirik lagu
    /\b(game online|mobile legends|ff|free fire|chord gitar|lirik lagu|sinopsis film)\b/i,
  ];

  if (outOfScopePatterns.some((pattern) => pattern.test(q))) {
    return 'OUT_OF_SCOPE';
  }

  // Jika tidak menyebut satupun domain tracer study/sekolah/kuliah/karir dan pertanyaan bersifat instruktif umum/luar konteks
  if (!isDomainRelated) {
    // Pertanyaan yang sama sekali tidak berhubungan dengan konteks SMANTA tracer study
    return 'OUT_OF_SCOPE';
  }

  // Default fallback jika terkait domain tapi umum (misal: "rekomendasi untuk saya", "apa saja data alumni?")
  return 'CAMPUS_INQUIRY';
};

// Keyword extractor for academic & career queries
const extractKeywords = (query: string): string[] => {
  const stopWords = new Set([
    'apa', 'siapa', 'dimana', 'bagaimana', 'kenapa', 'mengapa', 'jalur', 'lewat', 'masuk',
    'yang', 'di', 'ke', 'dari', 'dan', 'atau', 'untuk', 'pada', 'dengan', 'ada', 'bisa',
    'saya', 'mau', 'ingin', 'kuliah', 'rekomendasi', 'jurusan', 'kampus', 'universitas',
    'alumni', 'smanta', 'kerja', 'prospek', 'karir', 'lulusan', 'sebaran', 'angkatan',
    'hai', 'halo', 'hello', 'pagi', 'siang', 'sore', 'malam', 'tes', 'tolong', 'bantu'
  ]);

  const words = query
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return Array.from(new Set(words));
};

export const retrieveChatbotKnowledge = async (
  input: ChatRetrievalFilter,
): Promise<ChatContextResult> => {
  const query = clean(input.query);
  const detectedIntent = input.intent || classifyChatIntent(query);
  const isGreeting = detectedIntent === 'GREETING';
  const keywords = isGreeting ? [] : extractKeywords(query);

  const baseAlumniFilter: Record<string, unknown> = {
    role: 'alumni',
    isHidden: { $ne: true },
  };

  // Build targeted or fuzzy regex if keywords exist, disesuaikan dengan Intent
  let keywordFilter: Record<string, unknown>[] = [];
  if (keywords.length > 0) {
    const regexOr = keywords.map((kw) => new RegExp(escapeRegex(kw), 'i'));

    if (detectedIntent === 'CAMPUS_INQUIRY') {
      keywordFilter = [
        { 'university.name': { $in: regexOr } },
      ];
    } else if (detectedIntent === 'MAJOR_INQUIRY') {
      keywordFilter = [
        { 'university.major': { $in: regexOr } },
      ];
    } else if (detectedIntent === 'CAREER_INQUIRY') {
      keywordFilter = [
        { 'job.position': { $in: regexOr } },
        { 'job.institution': { $in: regexOr } },
        { 'job.jobTitle': { $in: regexOr } },
      ];
    } else if (detectedIntent === 'ADMISSION_INQUIRY') {
      keywordFilter = [
        { 'university.entryPath': { $in: regexOr } },
      ];
    } else if (detectedIntent === 'GRADUATION_BATCH') {
      const yearNumbers = query.match(/\b(201\d|202\d)\b/g);
      if (yearNumbers && yearNumbers.length > 0) {
        keywordFilter = [
          { 'profile.graduationYear': { $in: yearNumbers.map(Number) } },
        ];
      } else {
        keywordFilter = [
          { 'university.name': { $in: regexOr } },
          { 'university.major': { $in: regexOr } },
        ];
      }
    } else {
      // General / Multi-match fallback
      keywordFilter = [
        { 'university.name': { $in: regexOr } },
        { 'university.major': { $in: regexOr } },
        { 'job.position': { $in: regexOr } },
        { 'job.institution': { $in: regexOr } },
        { 'job.jobTitle': { $in: regexOr } },
      ];
    }
  }

  const queryCondition =
    keywordFilter.length > 0
      ? { ...baseAlumniFilter, $or: keywordFilter }
      : baseAlumniFilter;

  // Retrieve relevant alumni only if keywords exist (not just raw 50 on greeting)
  const matchedAlumni =
    keywords.length > 0
      ? await User.find(queryCondition)
        .select(
          'profile.fullName profile.graduationYear ' +
          'university.name university.major university.entryPath ' +
          'job.position job.jobTitle job.institution isMentor'
        )
        .limit(20)
        .lean()
      : [];

  // Selective Aggregations berdasarkan Intent agar query hemat resource & fokus:
  const shouldFetchUniversities =
    isGreeting ||
    detectedIntent === 'CAMPUS_INQUIRY' ||
    detectedIntent === 'ADMISSION_INQUIRY' ||
    detectedIntent === 'GRADUATION_BATCH';

  const shouldFetchMajors =
    isGreeting ||
    detectedIntent === 'MAJOR_INQUIRY' ||
    detectedIntent === 'CAMPUS_INQUIRY';

  const shouldFetchCareers =
    isGreeting ||
    detectedIntent === 'CAREER_INQUIRY';

  const [totalAlumniCount, topUniversitiesAgg, topMajorsAgg, topJobsAgg] = await Promise.all([
    User.countDocuments(baseAlumniFilter),
    shouldFetchUniversities
      ? User.aggregate([
        { $match: { role: 'alumni', isHidden: { $ne: true }, 'university.name': { $exists: true, $ne: '' } } },
        { $group: { _id: '$university.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      : Promise.resolve([]),
    shouldFetchMajors
      ? User.aggregate([
        { $match: { role: 'alumni', isHidden: { $ne: true }, 'university.major': { $exists: true, $ne: '' } } },
        { $group: { _id: '$university.major', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      : Promise.resolve([]),
    shouldFetchCareers
      ? User.aggregate([
        {
          $match: {
            role: 'alumni',
            isHidden: { $ne: true },
            $or: [{ 'job.position': { $exists: true, $ne: '' } }, { 'job.institution': { $exists: true, $ne: '' } }],
          },
        },
        {
          $group: {
            _id: {
              pos: { $ifNull: ['$job.position', '$job.jobTitle'] },
              inst: '$job.institution',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      : Promise.resolve([]),
  ]);

  // Aggregate stats from matched sample
  const sampleData = matchedAlumni.map((a: any) => ({
    name: a?.profile?.fullName || 'Alumni SMANTA',
    gradYear: a?.profile?.graduationYear || null,
    university: safeName(a?.university?.name),
    major: safeName(a?.university?.major),
    entryPath: safeName(a?.university?.entryPath),
    isMentor: Boolean(a?.isMentor),
    position: safeName(a?.job?.position || a?.job?.jobTitle),
    institution: safeName(a?.job?.institution),
  }));

  // Build recommendation cards ONLY if there are specific query matches and not just a greeting
  const recommendations: AlumniRecommendationCard[] = [];

  if (!isGreeting && matchedAlumni.length > 0) {
    const univMap = new Map<string, number>();
    const careerMap = new Map<string, number>();

    matchedAlumni.forEach((al: any) => {
      const u = safeName(al?.university?.name);
      const c = safeName(al?.job?.position || al?.job?.jobTitle);
      if (u) univMap.set(u, (univMap.get(u) || 0) + 1);
      if (c) careerMap.set(c, (careerMap.get(c) || 0) + 1);
    });

    const sortedUnivs = Array.from(univMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2);
    sortedUnivs.forEach(([univ, cnt]) => {
      recommendations.push({
        title: univ,
        subtitle: 'Perguruan Tinggi Terkait',
        category: 'kampus',
        peluangLabel: cnt >= 5 ? 'Peluang Tinggi' : 'Peluang Sedang',
        statsInfo: `${cnt} Alumni SMANTA tercatat di sini`,
        actionText: 'Lihat Kampus',
      });
    });

    const sortedCareers = Array.from(careerMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 1);
    sortedCareers.forEach(([pos, cnt]) => {
      recommendations.push({
        title: pos,
        subtitle: 'Profesi Terkait',
        category: 'karir',
        statsInfo: `${cnt} alumni bekerja pada bidang ini`,
        actionText: 'Eksplor Karir',
      });
    });
  }

  // Citation calculations: concise label without bloated text
  const citation: AlumniCitation = {
    totalCount: matchedAlumni.length > 0 ? matchedAlumni.length : totalAlumniCount,
    label:
      matchedAlumni.length > 0
        ? `${matchedAlumni.length} Data Alumni Terkait`
        : `Database ${totalAlumniCount} Alumni SMANTA`,
    cohortRange: '2018 - 2025',
    details: sampleData.slice(0, 5).map(
      (s) => `${s.university || 'PTN/PTS'} - ${s.major || 'Umum'} (${s.gradYear ? 'Angk. ' + s.gradYear : 'Alumni'})`,
    ),
  };

  const contextSummaryObj = isGreeting
    ? {
      isGreeting: true,
      instructionForGreeting:
        'Pengguna hanya menyapa atau memulai obrolan. Jangan berasumsi pengguna memilih kampus atau jurusan tertentu. Jawab dengan sapaan hangat, perkenalkan diri sebagai SMANTA AI (konselor alumni & karir SMANTA), dan tawarkan topik yang bisa dibantu (kampus alumni, jurusan kuliah, jalur masuk SNBP/SNBT, atau sebaran profesi alumni).',
      totalAlumniInDb: totalAlumniCount,
    }
    : {
      isGreeting: false,
      totalAlumniInDb: totalAlumniCount,
      relevantAlumniCount: matchedAlumni.length,
      matchedAlumniSample: sampleData.slice(0, 10),
      topUniversitiesAgg: topUniversitiesAgg.map((u: any) => ({ name: u._id, alumni: u.count })),
      topMajorsAgg: topMajorsAgg.map((m: any) => ({ major: m._id, alumni: m.count })),
      topCareersAgg: topJobsAgg.map((j: any) => ({
        position: j._id?.pos || '-',
        institution: j._id?.inst || '-',
        alumni: j.count,
      })),
      userProfileContext: input.userProfile ? { fullName: input.userProfile.fullName } : null,
    };

  return {
    contextSummary: JSON.stringify(contextSummaryObj, null, 2),
    citation,
    recommendations: recommendations.slice(0, 3),
    isGeneralGreeting: isGreeting,
  };
};
