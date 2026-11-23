import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import {
  FaMagic,
  FaGraduationCap,
  FaUniversity,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaInfoCircle,
  FaRedo,
  FaUsers,
  FaUserGraduate,
  FaCompass,
  FaCalendarAlt,
  FaBuilding,
  FaBriefcase,
} from 'react-icons/fa';

const AI_MATCH_ENDPOINT = '/api/student/college-plan/ai-match';
const REQUEST_TIMEOUT_MS = 60000;

const LOADING_MESSAGES = [
  'Mengambil data alumni SMANTA...',
  'Menganalisis data alumni...',
  'Menghitung peluang dan peminat...',
  'Menyusun strategi dan alternatif...',
];

type PeluangLabel = 'Tinggi' | 'Sedang' | 'Rendah';

interface AiStrategy {
  judul: string;
  detail: string;
}

interface AiAlternativeCampus {
  nama: string;
  jurusan: string;
  alasan: string;
}

interface AiAlternativeMajor {
  nama: string;
  alasan: string;
}

interface AiAnalysis {
  ringkasan: string;
  peluangLabel: PeluangLabel;
  peluangAlasan: string[];
  kekuatan: string[];
  risiko: string[];
  strategi: AiStrategy[];
  alternatifKampus: AiAlternativeCampus[];
  jurusanAlternatif: AiAlternativeMajor[];
  langkah: string[];
  catatanData: string;
}

interface CareerOutcome {
  title: string;
  count: number;
  percentage: number;
}

interface MatchStats {
  alumniTotal: number;
  exactAlumni: number;
  sameMajorAlumni: number;
  mentors: number;
  peminat: number;
  topInstitutions: string[];
  careerOutcomes: CareerOutcome[];
}

interface AiMatchResponse {
  hasPlan: boolean;
  message?: string;
  targetUniversity?: string | null;
  targetMajor?: string | null;
  rumpun?: string | null;
  entryPath?: string | null;
  readinessStatus?: string | null;
  ai?: AiAnalysis;
  stats?: MatchStats;
  generatedAt?: string;
  cached?: boolean;
}

const PELUANG_STYLES: Record<
  PeluangLabel,
  { badge: string; dot: string; label: string }
> = {
  Tinggi: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Peluang Tinggi',
  },
  Sedang: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
    label: 'Peluang Sedang',
  },
  Rendah: {
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
    label: 'Peluang Rendah',
  },
};

const normalizeLabel = (label?: string): PeluangLabel =>
  label === 'Tinggi' || label === 'Rendah' ? label : 'Sedang';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data && typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (error.code === 'ECONNABORTED') {
      return 'Analisis AI melebihi batas waktu. Coba lagi beberapa saat.';
    }
    if (!error.response) {
      return 'Tidak dapat terhubung ke server. Periksa koneksimu lalu coba lagi.';
    }
  }
  return 'Gagal membuat analisis AI. Coba lagi sebentar.';
};

const formatGeneratedAt = (value?: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return date.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return date.toLocaleString();
  }
};

const LoadingSkeleton = ({
  step,
  refresh,
}: {
  step: number;
  refresh: boolean;
}) => (
  <div className='space-y-6 animate-fade-in'>
    <div className='p-6 md:p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-5'>
      <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'>
        <FaMagic /> Smart Match AI
      </div>
      <div className='h-7 bg-gray-700/40 rounded-xl w-2/3 max-w-sm' />
      <div className='h-4 bg-gray-700/30 rounded-xl w-1/3 max-w-[180px]' />

      <div className='flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20'>
        <span className='mt-0.5 inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0' />
        <div className='space-y-1'>
          <p className='text-xs md:text-sm font-bold text-[var(--text-primary)]'>
            {refresh ? 'Memperbarui analisis...' : LOADING_MESSAGES[step]}
          </p>
          <p className='text-[11px] md:text-xs text-[var(--text-secondary)]'>
            Proses ini biasanya 5-25 detik karena AI membaca data alumni dan
            peminat. Mohon jangan tutup halaman.
          </p>
        </div>
      </div>

      <div className='space-y-2 animate-pulse'>
        <div className='h-3 bg-gray-700/30 rounded w-full' />
        <div className='h-3 bg-gray-700/30 rounded w-11/12' />
        <div className='h-3 bg-gray-700/30 rounded w-4/5' />
      </div>
    </div>

    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {[0, 1].map((index) => (
        <div
          key={index}
          className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4 animate-pulse'
        >
          <div className='h-5 bg-gray-700/40 rounded-lg w-1/3' />
          <div className='h-3 bg-gray-700/30 rounded w-full' />
          <div className='h-3 bg-gray-700/30 rounded w-10/12' />
          <div className='h-3 bg-gray-700/30 rounded w-9/12' />
        </div>
      ))}
    </div>
  </div>
);

const NoticeState = ({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) => (
  <div className='p-8 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)] text-center space-y-4 animate-fade-in'>
    <div className='inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 text-3xl'>
      {icon}
    </div>
    <h3 className='text-base md:text-lg font-bold text-[var(--text-primary)]'>
      {title}
    </h3>
    <p className='text-xs md:text-sm text-[var(--text-secondary)] max-w-md mx-auto'>
      {message}
    </p>
    {action}
  </div>
);

const StatChip = ({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) => (
  <div className='flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] min-w-0'>
    <span className='text-indigo-400 text-base shrink-0'>{icon}</span>
    <div className='min-w-0'>
      <p className='text-sm font-extrabold text-[var(--text-primary)] leading-tight'>
        {value}
      </p>
      <p className='text-[10px] md:text-[11px] text-[var(--text-tertiary)] leading-tight truncate'>
        {label}
      </p>
    </div>
  </div>
);

const SmartMatch = () => {
  const [data, setData] = useState<AiMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const requestIdRef = useRef(0);

  const fetchAnalysis = useCallback(async (refresh = false) => {
    const requestId = ++requestIdRef.current;
    setError(null);
    setLoading(true);
    setRefreshing(refresh);

    try {
      const res = await axios.post<AiMatchResponse>(
        AI_MATCH_ENDPOINT,
        refresh ? { refresh: true } : {},
        { timeout: REQUEST_TIMEOUT_MS },
      );
      if (requestId !== requestIdRef.current) return;
      setData(res.data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to fetch AI match analysis:', err);
      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchAnalysis();
  }, [fetchAnalysis]);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 4000);
    return () => window.clearInterval(timer);
  }, [loading]);

  if (loading) {
    return <LoadingSkeleton step={loadingStep} refresh={refreshing} />;
  }

  if (error) {
    return (
      <div className='space-y-4'>
        <NoticeState
          icon={<FaExclamationTriangle />}
          title='Analisis AI belum berhasil'
          message={error}
          action={
            <button
              type='button'
              onClick={() => void fetchAnalysis()}
              className='inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all bg-[var(--primary)] text-white hover:bg-opacity-90 active:scale-95 shadow-md shadow-[var(--primary)]/20'
            >
              <FaRedo /> Coba Lagi
            </button>
          }
        />
      </div>
    );
  }

  if (!data || !data.hasPlan) {
    return (
      <NoticeState
        icon={<FaMagic />}
        title='Smart Match AI Belum Aktif'
        message={
          data?.message ||
          'Silakan pilih target Perguruan Tinggi dan Jurusan impianmu pada form di atas untuk memulai analisis AI berbasis data alumni.'
        }
      />
    );
  }

  const ai = data.ai;
  const stats = data.stats;
  const label = normalizeLabel(ai?.peluangLabel);
  const style = PELUANG_STYLES[label];
  const generatedAt = formatGeneratedAt(data.generatedAt);

  if (!ai) {
    return (
      <NoticeState
        icon={<FaExclamationTriangle />}
        title='Respons analisis tidak lengkap'
        message='Server tidak mengirimkan hasil analisis AI. Coba jalankan analisis ulang.'
        action={
          <button
            type='button'
            onClick={() => void fetchAnalysis(true)}
            className='inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all bg-[var(--primary)] text-white hover:bg-opacity-90 active:scale-95 shadow-md shadow-[var(--primary)]/20'
          >
            <FaSyncAlt /> Analisis Ulang
          </button>
        }
      />
    );
  }

  const hasKekuatan = ai.kekuatan.length > 0;
  const hasRisiko = ai.risiko.length > 0;

  return (
    <div className='space-y-6 animate-fade-in'>
      {/* Header: target + label peluang */}
      <div className='p-6 md:p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-5'>
        <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-5'>
          <div className='space-y-2 min-w-0'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'>
              <FaMagic className='text-indigo-400' /> Smart Match AI
            </div>
            <h2 className='text-xl md:text-2xl font-bold text-[var(--text-primary)] break-words'>
              {data.targetUniversity || 'Target kampus belum diisi'}
            </h2>
            <p className='text-sm text-[var(--text-secondary)] flex items-start gap-2'>
              <FaGraduationCap className='text-indigo-400 text-base mt-0.5 shrink-0' />
              <span className='break-words'>
                {data.targetMajor || 'Target jurusan belum diisi'}
                {data.entryPath ? ` • Jalur ${data.entryPath}` : ''}
              </span>
            </p>
          </div>

          <div className='flex flex-col items-start md:items-end gap-2 shrink-0'>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs md:text-sm font-extrabold ${style.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              {style.label}
            </span>
            <button
              type='button'
              onClick={() => void fetchAnalysis(true)}
              disabled={refreshing}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
              Analisis Ulang
            </button>
            {data.cached && (
              <span className='inline-flex items-center gap-1.5 text-[10px] md:text-[11px] text-[var(--text-tertiary)]'>
                <FaInfoCircle /> Hasil tersimpan (cache 30 menit)
              </span>
            )}
          </div>
        </div>

        {ai.ringkasan && (
          <p className='text-sm md:text-base text-[var(--text-secondary)] leading-relaxed'>
            {ai.ringkasan}
          </p>
        )}

        {ai.peluangAlasan.length > 0 && (
          <ul className='space-y-1.5'>
            {ai.peluangAlasan.map((reason, index) => (
              <li
                key={index}
                className='flex items-start gap-2 text-xs md:text-sm text-[var(--text-secondary)]'
              >
                <FaCheckCircle className='text-indigo-400 text-[11px] mt-1 shrink-0' />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}

        {stats && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1'>
            <StatChip
              icon={<FaUserGraduate />}
              value={stats.exactAlumni}
              label='Alumni sejurusan & kampus'
            />
            <StatChip
              icon={<FaUsers />}
              value={stats.sameMajorAlumni}
              label='Alumni sejurusan'
            />
            <StatChip
              icon={<FaCompass />}
              value={stats.mentors}
              label='Mentor aktif'
            />
            <StatChip
              icon={<FaMagic />}
              value={stats.peminat}
              label='Peminat target ini'
            />
          </div>
        )}
      </div>

      {/* Kekuatan vs Risiko */}
      {(hasKekuatan || hasRisiko) && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-3'>
            <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
              <FaCheckCircle className='text-emerald-400' /> Kekuatan
            </h3>
            {hasKekuatan ? (
              <ul className='space-y-2'>
                {ai.kekuatan.map((item, index) => (
                  <li
                    key={index}
                    className='flex items-start gap-2.5 text-xs md:text-sm text-[var(--text-secondary)] p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15'
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-xs text-[var(--text-tertiary)] italic'>
                Data kekuatan belum cukup untuk dianalisis.
              </p>
            )}
          </div>

          <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-3'>
            <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
              <FaExclamationTriangle className='text-rose-400' /> Risiko
            </h3>
            {hasRisiko ? (
              <ul className='space-y-2'>
                {ai.risiko.map((item, index) => (
                  <li
                    key={index}
                    className='flex items-start gap-2.5 text-xs md:text-sm text-[var(--text-secondary)] p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15'
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-xs text-[var(--text-tertiary)] italic'>
                Tidak ada risiko khusus yang terdeteksi dari data.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Strategi */}
      {ai.strategi.length > 0 && (
        <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4'>
          <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
            <FaLightbulb className='text-amber-400' /> Strategi Masuk
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {ai.strategi.map((item, index) => (
              <div
                key={index}
                className='p-4 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] space-y-1.5'
              >
                <p className='text-sm font-bold text-[var(--text-primary)]'>
                  {item.judul}
                </p>
                <p className='text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed'>
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatif kampus & jurusan */}
      {(ai.alternatifKampus.length > 0 || ai.jurusanAlternatif.length > 0) && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {ai.alternatifKampus.length > 0 && (
            <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4'>
              <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
                <FaUniversity className='text-indigo-400' /> Alternatif Kampus
              </h3>
              <div className='space-y-3'>
                {ai.alternatifKampus.map((item, index) => (
                  <div
                    key={index}
                    className='p-4 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] space-y-1'
                  >
                    <p className='text-sm font-bold text-[var(--text-primary)]'>
                      {item.nama}
                    </p>
                    {item.jurusan && (
                      <p className='text-[11px] md:text-xs font-semibold text-indigo-400'>
                        {item.jurusan}
                      </p>
                    )}
                    <p className='text-xs text-[var(--text-secondary)] leading-relaxed'>
                      {item.alasan}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ai.jurusanAlternatif.length > 0 && (
            <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4'>
              <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
                <FaGraduationCap className='text-teal-400' /> Jurusan Alternatif
              </h3>
              <div className='space-y-3'>
                {ai.jurusanAlternatif.map((item, index) => (
                  <div
                    key={index}
                    className='p-4 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] space-y-1'
                  >
                    <p className='text-sm font-bold text-[var(--text-primary)]'>
                      {item.nama}
                    </p>
                    <p className='text-xs text-[var(--text-secondary)] leading-relaxed'>
                      {item.alasan}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Langkah berikutnya */}
      {ai.langkah.length > 0 && (
        <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4'>
          <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
            <FaCalendarAlt className='text-emerald-400' /> Langkah 1-3 Bulan ke
            Depan
          </h3>
          <ol className='space-y-2.5'>
            {ai.langkah.map((item, index) => (
              <li
                key={index}
                className='flex items-start gap-3 text-xs md:text-sm text-[var(--text-secondary)]'
              >
                <span className='w-6 h-6 shrink-0 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-[11px] font-extrabold flex items-center justify-center'>
                  {index + 1}
                </span>
                <span className='pt-0.5'>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Data pendukung: prospek karir & institusi */}
      {stats &&
        (stats.careerOutcomes.length > 0 ||
          stats.topInstitutions.length > 0) && (
          <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4'>
            <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
              <FaBriefcase className='text-teal-400' /> Prospek Karir Alumni
            </h3>

            {stats.careerOutcomes.length > 0 && (
              <div className='space-y-3'>
                {stats.careerOutcomes.map((item, index) => (
                  <div key={index} className='space-y-1'>
                    <div className='flex justify-between gap-3 text-xs font-semibold'>
                      <span className='text-[var(--text-primary)] truncate'>
                        {item.title}
                      </span>
                      <span className='text-emerald-400 font-bold whitespace-nowrap'>
                        {item.percentage}% ({item.count} alumni)
                      </span>
                    </div>
                    <div className='w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500'
                        style={{ width: `${Math.max(item.percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {stats.topInstitutions.length > 0 && (
              <div className='pt-3 border-t border-[var(--border-color)] space-y-2'>
                <p className='text-xs text-[var(--text-secondary)] font-semibold flex items-center gap-1.5'>
                  <FaBuilding className='text-teal-400' /> Institusi tempat kerja
                  alumni:
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {stats.topInstitutions.map((institution, index) => (
                    <span
                      key={index}
                      className='text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)]'
                    >
                      {institution}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Footer catatan data */}
      <div className='flex flex-col gap-2 px-1 pb-2 text-[10px] md:text-[11px] text-[var(--text-tertiary)]'>
        {ai.catatanData && (
          <p className='flex items-start gap-2'>
            <FaInfoCircle className='mt-0.5 shrink-0' />
            <span>{ai.catatanData}</span>
          </p>
        )}
        <p className='opacity-80'>
          Analisis dihasilkan AI dari data alumni SMANTA
          {generatedAt ? ` • ${generatedAt}` : ''}
          {data.cached ? ' • dari cache' : ''}
        </p>
      </div>
    </div>
  );
};

export default SmartMatch;
