import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaUserGraduate,
  FaUniversity,
  FaBuilding,
  FaUserCircle,
  FaLinkedin,
  FaInstagram,
  FaCrown,
  FaMedal,
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

const MutualAlumni = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (user?.questionnaireCompleted === false) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in'>
      <div className='mb-8 text-center md:text-left'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Rekan Seangkatan
        </h1>
        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
          Alumni yang lulus pada tahun yang sama dengan Anda
        </p>
      </div>

      {alumni.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-[color:var(--bg-card)] p-12 text-center dark:border-gray-700'>
          <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
            <FaUserGraduate className='text-4xl text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-[color:var(--text-primary)]'>
            Belum ada data
          </h3>
          <p className='text-gray-500'>
            Tidak ditemukan rekan alumni dari tahun kelulusan yang sama.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {alumni.map((person) => (
            <div
              key={person._id}
              className='group relative overflow-hidden rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col'
            >
              <div className='mb-4 flex items-center gap-4'>
                <div className='flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-md relative'>
                  <FaUserCircle className='text-lg md:text-3xl' />
                  {person.isMentor && (
                    <div
                      className='absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-white dark:border-gray-800'
                      title='Mentor'
                    >
                      <FaCrown className='text-[8px] md:text-[10px] text-white' />
                    </div>
                  )}
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-sm md:text-lg font-bold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-1 !mb-0'>
                      {person.profile?.fullName || 'Anonymous'}
                    </h3>
                  </div>
                  <p className='text-[10px] md:text-xs text-[color:var(--text-tertiary)]'>
                    Lulus Tahun {person.profile?.graduationYear}
                  </p>
                </div>
              </div>

              <div className='flex flex-wrap gap-1 mt-1 mb-3'>
                {person.isMentor && (
                  <span
                    className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/20'
                    title='Mentor'
                  >
                    <FaCrown className='text-[10px]' />
                    Mentor
                  </span>
                )}

                {person.badges && person.badges.length > 0 && (
                  <>
                    {person.badges.map((badge: any, idx: number) => (
                      <span
                        key={idx}
                        className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        title={badge.name}
                      >
                        <FaMedal className='text-[10px]' />
                        {badge.name}
                      </span>
                    ))}
                  </>
                )}
              </div>

              <div className='space-y-3 flex-1'>
                {person.university?.name && (
                  <div className='flex items-start gap-3'>
                    <FaUniversity className='mt-1 shrink-0 text-blue-500' />
                    <div>
                      <p className='text-[10px] md:text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider'>
                        Pendidikan
                      </p>
                      <p className='text-xs md:text-sm text-[color:var(--text-primary)] font-medium leading-tight'>
                        {person.university.name}
                      </p>
                      <p className='text-[9px] md:text-[10px] text-[color:var(--text-tertiary)]'>
                        {person.university.major}
                      </p>
                    </div>
                  </div>
                )}

                {person.job?.institution && (
                  <div className='flex items-start gap-3'>
                    <FaBuilding className='mt-1 shrink-0 text-green-500' />
                    <div>
                      <p className='text-[10px] md:text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider'>
                        Pekerjaan
                      </p>
                      <p className='text-xs md:text-sm text-[color:var(--text-primary)] font-medium leading-tight'>
                        {person.job.institution}
                      </p>
                      <p className='text-[9px] md:text-[10px] text-[color:var(--text-tertiary)]'>
                        {person.job.position}
                      </p>
                    </div>
                  </div>
                )}

                {!person.university?.name && !person.job?.institution && (
                  <div className='py-2 text-center h-full flex items-center justify-center'>
                    <p className='text-xs italic text-[color:var(--text-tertiary)]'>
                      Belum melengkapi data kuesioner
                    </p>
                  </div>
                )}
              </div>

              {(person.socialMedia?.linkedin ||
                person.socialMedia?.instagram) && (
                <div className='mt-6 pt-4 border-t border-[color:var(--border-color)] flex items-center gap-3'>
                  {person.socialMedia.linkedin && (
                    <a
                      href={
                        person.socialMedia.linkedin.startsWith('http')
                          ? person.socialMedia.linkedin
                          : `https://linkedin.com/in/${person.socialMedia.linkedin}`
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 text-xs font-medium text-[color:var(--text-secondary)] hover:text-[#0077b5] transition-colors bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full'
                    >
                      <FaLinkedin className='text-sm' />
                      LinkedIn
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
                      className='flex items-center gap-2 text-xs font-medium text-[color:var(--text-secondary)] hover:text-[#e1306c] transition-colors bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full'
                    >
                      <FaInstagram className='text-sm' />
                      Instagram
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
