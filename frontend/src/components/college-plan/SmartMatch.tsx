import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaGraduationCap,
  FaUserGraduate,
  FaBriefcase,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaMagic,
  FaBuilding,
  FaInfoCircle,
} from 'react-icons/fa';

interface AlumniItem {
  _id: string;
  fullName: string;
  graduationYear?: number;
  universityName?: string;
  major: string;
  position: string;
  institution?: string;
  isMentor?: boolean;
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
  };
  email?: string;
}

interface CareerOutcome {
  title: string;
  count: number;
  percentage: number;
}

interface AlternativeUniv {
  name: string;
  isSameMajor?: boolean;
  alumniCount: number;
  mentorCount: number;
  alumniList?: AlumniItem[];
}

interface MatchData {
  hasPlan: boolean;
  message?: string;
  targetUniversity?: string;
  targetMajor?: string;
  matchScore?: number;
  alumniCount?: number;
  exactMatchAlumniCount?: number;
  mentorCount?: number;
  alumniNetwork?: AlumniItem[];
  mentors?: AlumniItem[];
  careerOutcomes?: CareerOutcome[];
  topInstitutions?: string[];
  alternativeUniversities?: AlternativeUniv[];
}

const SmartMatch: React.FC = () => {
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchData();
  }, []);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/student/college-plan/match');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch smart match data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] animate-pulse space-y-4'>
        <div className='h-8 bg-gray-700/40 rounded-xl w-1/3'></div>
        <div className='h-32 bg-gray-700/30 rounded-2xl'></div>
      </div>
    );
  }

  if (!data || !data.hasPlan) {
    return (
      <div className='p-8 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)] text-center space-y-4'>
        <div className='inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 text-3xl'>
          <FaMagic />
        </div>
        <h3 className='text-base md:text-lg font-bold text-[var(--text-primary)]'>
          Analisis Smart Match Belum Aktif
        </h3>
        <p className='text-xs md:text-sm text-[var(--text-secondary)] max-w-md mx-auto'>
          {data?.message ||
            'Silakan pilih target Perguruan Tinggi dan Jurusan impianmu pada form di atas untuk mengaktifkan analisa kecocokan & rekomendasi alumni.'}
        </p>
      </div>
    );
  }

  const score = data.matchScore || 50;

  const getScoreBadge = (val: number) => {
    if (val >= 75) {
      return {
        label: 'Sangat Cocok',
        color: 'bg-emerald text-emerald-400',
      };
    }
    if (val >= 50) {
      return {
        label: 'Cukup Potensial',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
    }
    return {
      label: 'Tantangan Tinggi',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    };
  };

  const badge = getScoreBadge(score);

  return (
    <div className='space-y-6 animate-fade-in'>
      {/* Header   */}
      <div className='p-6 md:p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm relative z-20'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10'>
          <div className='space-y-2'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'>
              <FaMagic className='text-indigo-400' /> Smart Match Analytics
            </div>
            <h2 className='text-xl md:text-2xl font-bold text-[var(--text-primary)]'>
              {data.targetUniversity}
            </h2>
            <p className='text-sm text-[var(--text-secondary)] flex items-center gap-2'>
              <FaGraduationCap className='text-indigo-400 text-base' /> {data.targetMajor}
            </p>
          </div>

          {/* Match Score Indicator */}
          <div className='flex items-center gap-4 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-color)] relative z-30'>
            <div className='relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-2xl font-extrabold text-[var(--primary)]'>
              {score}
              <span className='text-xs font-normal opacity-70'>%</span>
            </div>
            <div>
              <div className='group relative flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold cursor-pointer'>
                <span>Match Score</span>
                <FaInfoCircle className='text-indigo-400 text-sm group-hover:scale-110 transition-transform' />

                {/* Hover Tooltip */}
                <div className='absolute right-0 top-full mt-2 w-72 md:w-80 p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-[9999] normal-case text-left font-normal space-y-2.5'>
                  <div className='flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2'>
                    <FaInfoCircle className='text-indigo-400 text-sm' />
                    <span>Penjelasan Match Score</span>
                  </div>

                  <p className='text-xs text-[var(--text-secondary)] leading-relaxed'>
                    Indikator kelayakan rencana studi berdasarkan ketersediaan alumni & mentor SMANTA:
                  </p>

                  <ul className='text-[11px] text-[var(--text-secondary)] space-y-1.5 list-disc pl-4'>
                    <li><strong>Skor Dasar:</strong> 50 Poin</li>
                    <li><strong>Alumni Sejurusan:</strong> hingga +35 Poin (≥5 alumni SMANTA sejurusan)</li>
                    <li><strong>Mentor Aktif:</strong> hingga +15 Poin (≥3 mentor aktif)</li>
                  </ul>

                  <div className='pt-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-tertiary)] font-semibold flex justify-between gap-1'>
                    <span>🟢 ≥75%: Sangat Cocok</span>
                    <span>🟡 50-74%: Cukup Cocok</span>
                  </div>
                </div>
              </div>
              <div
                className={`mt-1 text-xs font-bold ${badge.color}`}
              >
                {badge.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom untuk Mentor & Realita Karir */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Card 1: Mentors & Alumni Network */}
        <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
              Jaringan Alumni & Mentor
            </h3>
            <span className='text-xs text-indigo-400 border px-2.5 py-1 rounded-full font-bold'>
              {data.exactMatchAlumniCount} Alumni Sejurusan
            </span>
          </div>

          {(() => {
            const displayAlumni =
              data.alumniNetwork && data.alumniNetwork.length > 0
                ? data.alumniNetwork
                : data.mentors || [];

            if (displayAlumni.length === 0) {
              return (
                <div className='p-6 text-center text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/30 rounded-2xl border border-dashed border-[var(--border-color)] space-y-1'>
                  <FaUserGraduate className='mx-auto text-2xl opacity-40 mb-1' />
                  <p className='text-xs font-medium'>Belum ada alumni terdaftar untuk jurusan ini.</p>
                  <p className='text-[11px] opacity-70'>
                    Total {data.alumniCount} alumni terdaftar di {data.targetUniversity}.
                  </p>
                </div>
              );
            }

            return (
              <div className='space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar'>
                {displayAlumni.map((m) => (
                  <div
                    key={m._id}
                    className='p-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)] hover:border-indigo-500/40 transition-all space-y-2'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h4 className='text-sm font-bold text-[var(--text-primary)]'>
                            {m.fullName}
                          </h4>
                          {m.isMentor ? (
                            <span className='px-2 py-0.5 rounded-full text-[10px] font-bold text-green-400 border'>
                              ✨ Mentor
                            </span>
                          ) : (
                            <span className='px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-400 border'>
                              🎓 Alumni
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-[var(--text-secondary)] mt-0.5'>
                          {m.universityName ? `${m.universityName} • ` : ''}
                          <span className='font-bold text-[var(--text-primary)]'>{m.major}</span>{' '}
                          <span className='text-[var(--text-tertiary)]'>({m.graduationYear || 'Alumni'})</span>
                        </p>
                        <p className='text-xs text-brown-300 font-medium mt-0.5'>
                          💼 {m.position} {m.institution && m.institution !== '-' ? `di ${m.institution}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 pt-2 border-t border-[var(--border-color)]/50'>
                      <span className='text-[10px] text-[var(--text-tertiary)] font-semibold'>Kontak:</span>
                      {m.email || m.socialMedia?.linkedin || m.socialMedia?.instagram ? (
                        <>
                          {m.email && (
                            <a
                              href={`mailto:${m.email}`}
                              target='_blank'
                              rel='noreferrer'
                              className='p-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-indigo-600/30 text-[var(--text-secondary)] hover:text-indigo-300 transition-colors text-xs border border-[var(--border-color)]'
                              title={m.email}
                            >
                              <FaEnvelope />
                            </a>
                          )}
                          {m.socialMedia?.instagram && (
                            <a
                              href={
                                m.socialMedia.instagram.startsWith('http')
                                  ? m.socialMedia.instagram
                                  : `https://instagram.com/${m.socialMedia.instagram.replace('@', '')}`
                              }
                              target='_blank'
                              rel='noreferrer'
                              className='p-1.5 rounded-lg hover:bg-pink-600/30 text-pink-400 transition-colors text-xs border border-pink-500/20'
                              title='Instagram'
                            >
                              <FaInstagram />
                            </a>
                          )}
                          {m.socialMedia?.linkedin && (
                            <a
                              href={m.socialMedia.linkedin}
                              target='_blank'
                              rel='noreferrer'
                              className='p-1.5 rounded-lg hover:bg-blue-600/30 text-blue-400 transition-colors text-xs border border-blue-500/20'
                              title='LinkedIn'
                            >
                              <FaLinkedin />
                            </a>
                          )}
                        </>
                      ) : (
                        <span className='text-[10px] italic text-[var(--text-tertiary)] opacity-70'>
                          Belum menyantumkan kontak
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Card 2: Realita Prospek Karir Alumni */}
        <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-4'>
          <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
            Realita Karir Alumni SMANTA
          </h3>

          {data.careerOutcomes && data.careerOutcomes.length > 0 ? (
            <div className='space-y-4'>
              <div className='space-y-3'>
                {data.careerOutcomes.map((c, idx) => (
                  <div key={idx} className='space-y-1'>
                    <div className='flex justify-between text-xs font-semibold'>
                      <span className='text-[var(--text-primary)]'>{c.title}</span>
                      <span className='text-emerald-400 font-bold'>{c.percentage}% ({c.count} alumni)</span>
                    </div>
                    <div className='w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500'
                        style={{ width: `${Math.max(c.percentage, 8)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {data.topInstitutions && data.topInstitutions.length > 0 && (
                <div className='pt-3 border-t border-[var(--border-color)]'>
                  <div className='text-xs text-[var(--text-secondary)] font-semibold mb-2 flex items-center gap-1.5'>
                    <FaBuilding className='text-teal-400' /> Top Tempat Kerja Alumni:
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {data.topInstitutions.map((inst, idx) => (
                      <span
                        key={idx}
                        className='text-blue text-xs font-medium'
                      >
                        💼 {inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='p-6 text-center text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/30 rounded-2xl border border-dashed border-[var(--border-color)] space-y-1'>
              <FaBriefcase className='mx-auto text-2xl opacity-40 mb-1' />
              <p className='text-xs font-medium'>Data karir lulusan jurusan ini belum cukup melimpah.</p>
              <p className='text-[11px] opacity-70'>
                Alumni SMANTA yang lulus dari jurusan ini sebagian besar masih menempuh studi aktif.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card 3 (Full Width): Rekomendasi Kampus Alternatif Sejurusan */}
      <div className='p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm space-y-5'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <h3 className='text-base font-bold text-[var(--text-primary)] flex items-center gap-2'>
            Kampus Alternatif untuk Jurusan {data.targetMajor}
          </h3>
          <span className='text-xs text-[var(--text-tertiary)]'>
            Berdasarkan sebaran alumni SMANTA sejurusan
          </span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {data.alternativeUniversities && data.alternativeUniversities.length > 0 ? (
            data.alternativeUniversities.map((alt, idx) => (
              <div
                key={idx}
                className='p-5 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)] hover:border-blue-500/40 transition-all space-y-3'
              >
                <div className='flex items-center justify-between pb-2 border-b border-[var(--border-color)]/60'>
                  <h4 className='text-sm font-bold text-[var(--text-primary)] line-clamp-1'>
                    {alt.name}
                  </h4>
                  <div className='flex items-center gap-2 text-xs'>
                    <span className='px-2.5 py-0.5 rounded-full text-indigo-400 border font-bold'>
                      {alt.isSameMajor !== false
                        ? `${alt.alumniCount} Alumni Sejurusan`
                        : `${alt.alumniCount} Alumni Kampus Ini`}
                    </span>
                    <span className='px-2.5 py-0.5 rounded-full text-[#703f1d] border font-bold'>
                      {alt.mentorCount} Mentor
                    </span>
                  </div>
                </div>

                {/* List Alumni di Kampus Alternatif Ini */}
                {alt.alumniList && alt.alumniList.length > 0 ? (
                  <div className='space-y-2 pt-1'>
                    <div className='text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider'>
                      {alt.isSameMajor !== false
                        ? `Daftar Alumni Sejurusan (${data.targetMajor}):`
                        : `Daftar Alumni di ${alt.name}:`}
                    </div>
                    <div className='space-y-1.5 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar'>
                      {alt.alumniList.map((a) => (
                        <div
                          key={a._id}
                          className='flex items-start justify-between p-2.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]/60 text-xs gap-2'
                        >
                          <div>
                            <span className='font-bold text-[var(--text-primary)]'>
                              {a.fullName}
                            </span>
                            <span className='text-[var(--text-tertiary)] ml-1'>
                              ({a.graduationYear || 'Alumni'})
                            </span>
                            <p className='text-[11px] font-bold text-blue-400 mt-0.5 flex items-center gap-1'>
                              🎓 {a.major}
                            </p>
                            {a.position && (
                              <p className='text-[11px] text-[var(--text-secondary)] font-medium mt-0.5'>
                                💼 {a.position} {a.institution && a.institution !== '-' ? `di ${a.institution}` : ''}
                              </p>
                            )}
                          </div>
                          {a.isMentor && (
                            <span className='px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 border rounded-lg shrink-0 mt-0.5'>
                              Mentor
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className='text-xs text-[var(--text-tertiary)] italic'>
                    Belum ada detail alumni sejurusan di kampus ini.
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className='text-xs text-[var(--text-tertiary)] col-span-2'>
              Belum ada alternatif kampus yang terdeteksi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartMatch;
