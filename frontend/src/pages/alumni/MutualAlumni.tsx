import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaUserGraduate,
  FaUniversity,
  FaBuilding,
  FaUserCircle,
  FaLinkedin,
  FaInstagram,
  FaCrown,
  FaMedal,
  FaUserPlus,
  FaShareAlt,
} from 'react-icons/fa';

interface AlumniData {
  _id: string;
  profile?: {
    fullName?: string;
    graduationYear?: number;
    gender?: 'male' | 'female';
  };
  university?: {
    name?: string;
    major?: string;
  };
  job?: {
    position?: string;
    institution?: string;
  };
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
  };
  isMentor?: boolean;
  badges?: any[];
}

import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import SmartLoader from '@/components/SmartLoader';
import { isUniversityIncomplete, isNameIncomplete } from '@/utils/validation';

const MutualAlumni = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleShareLink = async () => {
    const inviteText = `Halo rekan seangkatan SMANTA! 👋\n\nYuk bergabung di Tracer Study SMANTA (SMA Negeri 1 Talun) untuk saling terhubung, berjejaring, dan membantu sekolah melacak sebaran alumni. Daftar sekarang melalui tautan berikut:\n👉 ${window.location.origin}/register\n\nTerima kasih!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tracer Study SMANTA',
          text: inviteText,
          url: `${window.location.origin}/register`
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(inviteText);
        Toast('Pesan ajakan berhasil disalin ke clipboard! Bagikan sekarang ke rekan Anda.', 'success');
      } catch (err) {
        Toast('Gagal menyalin teks.', 'error');
      }
    }
  };

  useEffect(() => {
    const fetchMutualAlumni = async () => {
      try {
        const response = await axios.get('/api/alumni/mutual-alumni');
        setAlumni(response.data);
      } catch (error) {
        console.error('Error fetching mutual alumni:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMutualAlumni();
  }, []);

  if (loading) {
    return <SmartLoader />;
  }

  if (!user?.questionnaireCompleted) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  if (user && isNameIncomplete(user.profile || user)) {
    return <RestrictedAccess type='name_incomplete' role='alumni' />;
  }

  if (user && isUniversityIncomplete(user)) {
    return <RestrictedAccess type='university_incomplete' role='alumni' />;
  }

  return (
    <div className='p-3 sm:p-6 lg:p-8 min-h-screen page-fade-in'>
      <div className='mb-6 md:mb-8 text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-1 flex items-center justify-center md:justify-start gap-2'>
          Rekan Seangkatan
          {!loading && (
            <span className='font-bold'>
              {`(${alumni.length})`}
            </span>
          )}
        </h1>
        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
          Alumni yang lulus pada tahun yang sama dengan Anda
        </p>
      </div>

      {/* Invitation Share Banner */}
      <div className='mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center gap-4 text-center md:text-left flex-col md:flex-row'>
          <div className='p-3 bg-white/10 rounded-xl shrink-0'>
            <FaUserPlus className='text-2xl text-white' />
          </div>
          <div>
            <h2 className='text-base text-white md:text-lg font-extrabold mb-1'>Ajak Teman Seangkatan Bergabung!</h2>
            <p className='text-xs md:text-sm !text-blue-100 max-w-xl'>
              Bantu sekolah melacak sebaran alumni dan perkuat jejaring alumni dengan membagikan link pendaftaran Tracer Study Smanta kepada rekan seangkatan Anda.
            </p>
          </div>
        </div>
        <button
          onClick={handleShareLink}
          className='w-full md:w-auto shrink-0 px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm'
        >
          <FaShareAlt /> Bagikan Link Pendaftaran
        </button>
      </div>

      {alumni.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-[color:var(--bg-card)] p-8 md:p-12 text-center dark:border-gray-700'>
          <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
            <FaUserGraduate className='text-4xl text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-[color:var(--text-primary)]'>
            Belum ada data
          </h3>
          <p className='text-gray-500 text-sm'>
            Tidak ditemukan rekan alumni dari tahun kelulusan yang sama.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4'>
          {alumni.map((person) => (
            <div
              key={person._id}
              className='group relative overflow-hidden rounded-xl md:rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-3 md:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col'
            >
              <div className='mb-3 md:mb-4 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 md:gap-4'>
                <div className='flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-md relative'>
                  <FaUserCircle className='text-2xl md:text-3xl' />
                  {person.isMentor && (
                    <div
                      className='absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-white'
                      title='Mentor'
                    >
                      <FaCrown className='text-[8px] md:text-[10px] text-white' />
                    </div>
                  )}
                </div>
                <div className='min-w-0 w-full'>
                  <div className='flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-1'>
                    <h3 className='text-xs md:text-sm font-bold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 !mb-0 w-full truncate'>
                      {person.profile?.fullName || 'Anonymous'}
                    </h3>
                  </div>
                  <p className='text-[10px] md:text-xs text-[color:var(--text-tertiary)] hidden sm:block'>
                    Lulus Tahun {person.profile?.graduationYear}
                  </p>
                </div>
              </div>

              <div className='flex flex-wrap justify-center sm:justify-start gap-1 mt-0 mb-3 md:my-3'>
                {person.isMentor && (
                  <span
                    className='inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-amber-50 text-amber-700 text-[9px] md:text-xs font-bold border border-amber-200/50'
                    title='Mentor'
                  >
                    <FaCrown className='text-[8px] md:text-[10px]' />
                    Mentor
                  </span>
                )}

                {person.badges && person.badges.length > 0 && (
                  <>
                    {person.badges.map((badge: any, idx: number) => (
                      <span
                        key={idx}
                        className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50'
                        title={badge.name}
                      >
                        <FaMedal className='text-[9px] md:text-[10px]' />
                        <span className='hidden sm:inline'>{badge.name}</span>
                      </span>
                    ))}
                  </>
                )}
              </div>

              <div className='space-y-2 md:space-y-3 flex-1'>
                {person.university?.name && (
                  <div className='flex items-start gap-2 md:gap-3'>
                    <FaUniversity className='mt-0.5 md:mt-1 shrink-0 text-blue-500 text-xs md:text-base' />
                    <div className='min-w-0'>
                      <p className='text-[9px] md:text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider hidden sm:block'>
                        Pendidikan
                      </p>
                      <p className='text-xs md:text-sm text-[color:var(--text-primary)] font-medium leading-tight line-clamp-4'>
                        {person.university.name}
                      </p>
                      <p className='text-[9px] md:text-[10px] text-[color:var(--text-tertiary)] truncate'>
                        {person.university.major}
                      </p>
                    </div>
                  </div>
                )}

                {person.job?.institution && (
                  <div className='flex items-start gap-2 md:gap-3'>
                    <FaBuilding className='mt-0.5 md:mt-1 shrink-0 text-green-500 text-xs md:text-base' />
                    <div className='min-w-0'>
                      <p className='text-[9px] md:text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider hidden sm:block'>
                        Pekerjaan
                      </p>
                      <p className='text-xs md:text-sm text-[color:var(--text-primary)] font-medium leading-tight line-clamp-2'>
                        {person.job.institution}
                      </p>
                      <p className='text-[9px] md:text-[10px] text-[color:var(--text-tertiary)] line-clamp-2'>
                        {person.job.position}
                      </p>
                    </div>
                  </div>
                )}

                {!person.university?.name && !person.job?.institution && (
                  <div className='py-2 text-center h-full flex items-center justify-center'>
                    <p className='text-[10px] md:text-xs italic text-[color:var(--text-tertiary)]'>
                      Data belum lengkap
                    </p>
                  </div>
                )}
              </div>

              {(person.socialMedia?.linkedin ||
                person.socialMedia?.instagram) && (
                  <div className='mt-3 md:mt-6 pt-3 md:pt-4 border-t border-[color:var(--border-color)] flex flex-wrap items-center justify-center sm:justify-start gap-2'>
                    {person.socialMedia.linkedin && (
                      <a
                        href={
                          person.socialMedia.linkedin.startsWith('http')
                            ? person.socialMedia.linkedin
                            : `https://linkedin.com/in/${person.socialMedia.linkedin}`
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-semibold text-slate-700 hover:text-[#0077b5] transition-colors bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200'
                      >
                        <FaLinkedin className='text-xs md:text-sm' />
                        <span className='sm:inline'>LinkedIn</span>
                      </a>
                    )}
                    {person.socialMedia.instagram && (
                      <a
                        href={
                          person.socialMedia.instagram.startsWith('http')
                            ? person.socialMedia.instagram
                            : `https://instagram.com/${person.socialMedia.instagram.replace(
                              '@',
                              '',
                            )}`
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-semibold text-slate-700 hover:text-[#e1306c] transition-colors bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200'
                      >
                        <FaInstagram className='text-xs md:text-sm' />
                        <span className='sm:inline'>Instagram</span>
                      </a>
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MutualAlumni;
