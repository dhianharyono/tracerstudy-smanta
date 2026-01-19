import { useEffect, useState } from 'react';
import axios from 'axios';
import SmartLoader from '@/components/SmartLoader';
import {
  FaUniversity,
  FaGraduationCap,
  FaSearch,
  FaUsers,
  FaBriefcase,
  FaLinkedin,
  FaInstagram,
  FaFilter,
  FaComments,
  FaCrown,
  FaMedal,
} from 'react-icons/fa';
import Toast from '@/components/toast';

interface Badge {
  _id: string;
  name: string;
  description: string;
  code: string;
  expiredDate: string;
}

interface AlumniData {
  _id: string;
  username: string;
  profile?: {
    fullName?: string;
    gender?: string;
    graduationYear?: number;
  };
  university?: {
    name?: string;
    type?: string;
    major?: string;
  };
  job?: {
    position?: string;
    institution?: string;
  };
  socialMedia?: {
    email?: string;
    linkedin?: string;
    instagram?: string;
  };
  isMentor?: boolean;
  badges?: Badge[];
}

interface UniversityOption {
  name: string;
  type?: string;
  count: number;
}

interface MajorOption {
  name: string;
  count: number;
}

import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';

const CollegePlan = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [majors, setMajors] = useState<MajorOption[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [isMentorFilter, setIsMentorFilter] = useState(false);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniData[]>([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchUniversities(), fetchBadges()]);
    };
    initData();
  }, [selectedMajor]);

  useEffect(() => {
    fetchMajors();
  }, [selectedUniversity]);

  useEffect(() => {
    if (
      selectedUniversity ||
      selectedMajor ||
      isMentorFilter ||
      selectedBadge
    ) {
      fetchAlumni();
    } else {
      setFilteredAlumni([]);
    }
  }, [selectedUniversity, selectedMajor, isMentorFilter, selectedBadge]);

  const fetchBadges = async () => {
    try {
      const res = await axios.get('/api/student/badges');
      setBadges(res.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const params: any = {};
      if (selectedMajor) params.major = selectedMajor;
      const res = await axios.get('/api/alumni/universities', { params });
      setUniversities(res.data);
      if (loading) setLoading(false);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const fetchMajors = async () => {
    try {
      const params: any = {};
      if (selectedUniversity) params.university = selectedUniversity;
      const res = await axios.get('/api/alumni/majors', { params });
      setMajors(res.data);
      if (loading) setLoading(false);
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };

  const fetchAlumni = async () => {
    try {
      setLoadingAlumni(true);
      const params: any = {};
      if (selectedUniversity) params.university = selectedUniversity;
      if (selectedMajor) params.major = selectedMajor;
      if (isMentorFilter) params.isMentor = 'true';
      if (selectedBadge) params.badgeId = selectedBadge;

      const response = await axios.get('/api/student/alumni', { params });
      if (response.data && response.data.alumni) {
        setFilteredAlumni(response.data.alumni);
      } else if (Array.isArray(response.data)) {
        setFilteredAlumni(response.data);
      } else {
        setFilteredAlumni([]);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
      Toast('Gagal mengambil data alumni', 'error');
    } finally {
      setLoadingAlumni(false);
    }
  };

  if (loading) {
    return (
      <SmartLoader
        messages={[
          'Mengumpulkan data universitas...',
          'Mencari jejak alumni...',
          'Menyiapkan statistik...',
        ]}
      />
    );
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='p-4 md:p-8 animate-fade-in'>
      <div className='text-center md:text-left mb-8'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Rencana Kuliah
        </h1>
        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
          Jelajahi jejak alumni dan temukan alumni yang sesuai dengan rencana
          kuliah Anda
        </p>
      </div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className='text-xs md:text-sm mb-6 lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold shadow-sm active:scale-95 transition-all'
      >
        <FaFilter /> {showFilters ? 'Tutup Pencarian' : 'Cari Jejak Alumni'}
      </button>

      <div className='flex flex-col lg:flex-row gap-10'>
        {/* Left Side: Clean Filter Card */}
        <div
          className={`w-full lg:w-80 shrink-0 ${
            showFilters ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className='bg-[color:var(--bg-card)] rounded-3xl border border-[color:var(--border-color)] overflow-hidden shadow-sm lg:sticky lg:top-8'>
            <div className='p-6 border-b border-[color:var(--border-color)]'>
              <div className='flex items-center gap-3'>
                <FaFilter className='text-[var(--primary)] text-sm' />
                <h2 className='text-sm font-bold tracking-wider text-[color:var(--text-primary)] !mb-0'>
                  Cari Jejak Alumni
                </h2>
              </div>
            </div>

            <div className='p-6 space-y-8'>
              {/* University Select */}
              <div className='space-y-3'>
                <label className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-widest'>
                  Universitas
                </label>
                <div className='relative'>
                  <select
                    className='w-full pl-4 pr-10 py-3 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] appearance-none focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer text-sm font-medium'
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                  >
                    <option value=''>Semua Universitas</option>
                    {universities.map((u, i) => (
                      <option key={i} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-tertiary)]'>
                    <FaUniversity className='text-xs' />
                  </div>
                </div>
              </div>

              {/* Major Select */}
              <div className='space-y-3'>
                <label className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-widest'>
                  Jurusan
                </label>
                <div className='relative'>
                  <select
                    className='w-full pl-4 pr-10 py-3 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] appearance-none focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer text-sm font-medium'
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                  >
                    <option value=''>Semua Jurusan</option>
                    {majors.map((m, i) => (
                      <option key={i} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-tertiary)]'>
                    <FaGraduationCap className='text-xs' />
                  </div>
                </div>
              </div>

              {/* Badge Select */}
              <div className='space-y-3'>
                <label className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-widest'>
                  Badge Expo
                </label>
                <div className='relative'>
                  <select
                    className='w-full pl-4 pr-10 py-3 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] appearance-none focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer text-sm font-medium'
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                  >
                    <option value=''>Semua Badge</option>
                    {badges.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-tertiary)]'>
                    <FaMedal className='text-xs' />
                  </div>
                </div>
              </div>

              {/* Mentor Filter Toggle */}
              <div className='flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10'>
                <div className='flex items-center gap-3'>
                  <FaCrown className='text-amber-500 text-sm' />
                  <span className='text-xs font-bold text-[color:var(--text-primary)]'>
                    Hanya Mentor
                  </span>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    checked={isMentorFilter}
                    onChange={(e) => setIsMentorFilter(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {(selectedUniversity ||
                selectedMajor ||
                isMentorFilter ||
                selectedBadge) && (
                <button
                  onClick={() => {
                    setSelectedUniversity('');
                    setSelectedMajor('');
                    setIsMentorFilter(false);
                    setSelectedBadge('');
                  }}
                  className='w-full py-3 text-xs font-bold text-red-500 bg-red-50 transition-all rounded-2xl border border-red-100 dark:bg-red-500/5 dark:border-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/10'
                >
                  Hapus Semua Filter
                </button>
              )}

              <div className='pt-6 border-t border-[color:var(--border-color)]'>
                <h4 className='text-xs font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2'>
                  <FaCrown className='text-amber-500' /> Program Mentorship
                </h4>
                <div className='p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10'>
                  <p className='text-[10px] leading-relaxed text-amber-800 dark:text-amber-300'>
                    Alumni dengan <strong>warna profil berbeda</strong> dan
                    memiliki <strong>kontak sosial media</strong> adalah Mentor
                    yang bersedia membimbing Anda secara langsung.
                  </p>
                </div>
              </div>
              <div>
                <h4 className='text-xs font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2'>
                  <FaMedal className='text-blue-500' /> Alumni dengan Badge
                </h4>
                <div className='p-4 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10'>
                  <p className='text-[10px] leading-relaxed text-blue-800 dark:text-blue-300'>
                    <span className='font-bold flex items-center gap-1'>
                      Alumni dengan Badge adalah alumni yang telah terverifikasi
                      memiliki prestasi atau kontribusi khusus pada Expo Campus.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Modern Minimalist Content */}
        <div className='flex-1'>
          {!selectedUniversity &&
          !selectedMajor &&
          !isMentorFilter &&
          !selectedBadge ? (
            <div className='h-[500px] flex flex-col items-center justify-center text-center p-8 bg-[color:var(--bg-card)] rounded-3xl border border-[color:var(--border-color)] shadow-sm'>
              <div className='w-16 h-16 bg-[color:var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-6 border border-[color:var(--border-color)]'>
                <FaSearch className='text-2xl text-[color:var(--text-tertiary)]' />
              </div>
              <h3 className='text-xl font-bold text-[color:var(--text-primary)] mb-2'>
                Pilih Universitas atau Jurusan
              </h3>
              <p className='text-[color:var(--text-secondary)] max-w-sm'>
                Gunakan filter untuk melihat daftar alumni yang pernah menempuh
                jalur tersebut.
              </p>
            </div>
          ) : (
            <div className='space-y-0 md:space-y-8 animate-fade-in'>
              {/* Simple Results Summary */}
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <h2 className='text-sm md:text-lg font-bold text-[color:var(--text-primary)]'>
                    Ditemukan {filteredAlumni.length} Alumni
                  </h2>
                  <p className='text-sm text-[color:var(--text-secondary)] mt-1 hidden sm:block'>
                    Daftar alumni yang sesuai dengan kriteria filter Anda.
                  </p>
                </div>
                <div className='flex gap-2 flex-wrap justify-end'>
                  {selectedUniversity && (
                    <span className='px-3 py-1.5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-lg uppercase'>
                      {selectedUniversity}
                    </span>
                  )}
                  {selectedMajor && (
                    <span className='px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white text-[10px] font-bold rounded-lg uppercase'>
                      {selectedMajor}
                    </span>
                  )}
                  {selectedBadge && (
                    <span className='px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg uppercase flex items-center gap-1'>
                      <FaMedal /> Badge
                    </span>
                  )}
                </div>
              </div>

              {loadingAlumni ? (
                <div className='py-32 flex flex-col items-center justify-center'>
                  <div className='h-8 w-8 border-4 border-[color:var(--border-color)] border-t-[var(--primary)] rounded-full animate-spin mb-4' />
                  <p className='text-sm font-medium text-[color:var(--text-secondary)]'>
                    Memuat data alumni...
                  </p>
                </div>
              ) : filteredAlumni.length > 0 ? (
                <div className='grid grid-cols-2 gap-3 md:gap-5'>
                  {filteredAlumni.map((alumni) => (
                    <div
                      key={alumni._id}
                      className={`p-3 md:p-6 rounded-2xl md:rounded-3xl border transition-all group relative flex flex-col ${
                        alumni.isMentor
                          ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 hover:border-amber-400'
                          : 'bg-[color:var(--bg-card)] border-[color:var(--border-color)] hover:border-[var(--primary)]'
                      }`}
                    >
                      {/* Mentor Badge - Absolute on Mobile, Relative/Flex on Desktop if needed or always absolute for consistency */}
                      {alumni.isMentor && (
                        <div
                          className='absolute top-3 right-3 md:top-6 md:right-6'
                          title='Tersedia sebagai Mentor'
                        >
                          <div className='w-6 h-6 md:w-8 md:h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20'>
                            <FaCrown className='text-amber-500 text-[10px] md:text-sm' />
                          </div>
                        </div>
                      )}

                      {/* Avatar & Name */}
                      <div className='flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-3 md:gap-4 mb-4 md:mb-6'>
                        <div className='invisible md:visible w-0 h-0 md:w-12 md:h-12 shrink-0 rounded-full bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] flex items-center justify-center text-[color:var(--text-primary)] font-bold group-hover:bg-[var(--primary)] group-hover:text-white transition-colors text-sm md:text-base'>
                          {(alumni.profile?.fullName || alumni.username)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className='min-w-0 w-full mt-4 md:mt-0'>
                          <div className='font-bold text-[color:var(--text-primary)] text-xs md:text-base line-clamp-3 md:line-clamp-1'>
                            {alumni.profile?.fullName || alumni.username}
                          </div>
                          <p className='text-[10px] md:text-xs font-semibold text-[color:var(--text-tertiary)] uppercase tracking-wider mt-0.5'>
                            Lulus {alumni.profile?.graduationYear || '-'}
                          </p>
                        </div>
                      </div>

                      {/* Badge Display */}
                      {alumni.badges && alumni.badges.length > 0 && (
                        <div className='flex flex-wrap justify-center md:justify-start gap-1.5 md:gap-2 mb-4'>
                          {alumni.badges.map((badge) => (
                            <div
                              key={badge._id}
                              className='inline-flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-500/20 rounded md:rounded-lg'
                              title={badge.description}
                            >
                              <FaMedal className='text-blue-600 dark:text-blue-400 text-[8px] md:text-xs' />
                              <span className='text-[8px] md:text-[10px] font-bold text-blue-800 dark:text-blue-200'>
                                {badge.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Minimal Data List */}
                      <div className='space-y-3 md:space-y-4 mb-4 md:mb-8 flex-1'>
                        <div className='flex flex-col items-center md:items-start md:flex-row gap-1 md:gap-4 text-center md:text-left'>
                          <FaUniversity className='text-gray-400 text-xs md:text-base md:mt-1 shrink-0 hidden md:block' />
                          <div>
                            <p className='text-[10px] md:text-sm font-bold text-[color:var(--text-primary)] line-clamp-2'>
                              {alumni.university?.name || '-'}
                            </p>
                            {alumni.university?.type && (
                              <p className='text-[8px] md:text-[10px] font-bold text-[color:var(--text-tertiary)] uppercase mt-0.5 tracking-tight'>
                                {alumni.university.major || '-'}
                              </p>
                            )}
                          </div>
                        </div>

                        {alumni.job?.position && (
                          <div className='flex flex-col items-center md:items-start md:flex-row gap-1 md:gap-4 text-center md:text-left'>
                            <FaBriefcase className='text-gray-400 text-xs md:text-base md:mt-1 shrink-0 hidden md:block' />
                            <div>
                              <p className='text-[10px] md:text-sm font-bold text-[color:var(--text-primary)] line-clamp-2'>
                                {alumni.job.position}
                              </p>
                              <p className='text-[8px] md:text-[10px] font-bold text-[color:var(--text-tertiary)] uppercase mt-0.5 tracking-tight'>
                                {alumni.job.institution || 'Instansi Terdaftar'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className='flex flex-col md:flex-row items-center gap-2 md:gap-3 border-t border-[color:var(--border-color)] pt-3 md:pt-5 w-full'>
                        <div className='flex gap-2 w-full md:w-auto justify-center'>
                          {alumni.isMentor && alumni.socialMedia?.linkedin && (
                            <a
                              href={alumni.socialMedia.linkedin}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl bg-white dark:bg-gray-800 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-[color:var(--border-color)]'
                            >
                              <FaLinkedin className='text-xs md:text-base' />
                            </a>
                          )}
                          {alumni.isMentor && alumni.socialMedia?.instagram && (
                            <a
                              href={alumni.socialMedia.instagram}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-xl bg-white dark:bg-gray-800 text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-all border border-[color:var(--border-color)]'
                            >
                              <FaInstagram className='text-xs md:text-base' />
                            </a>
                          )}
                        </div>

                        {alumni.isMentor ? (
                          <a
                            href={
                              alumni.socialMedia?.instagram ||
                              alumni.socialMedia?.linkedin ||
                              `mailto:${alumni.socialMedia?.email}`
                            }
                            target='_blank'
                            rel='noopener noreferrer'
                            className='w-full md:flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-2.5 bg-amber-600 text-white text-[10px] md:text-xs font-bold rounded-xl md:rounded-2xl hover:bg-amber-700 shadow-sm transition-all'
                          >
                            <FaComments className='text-[10px] md:text-xs' />{' '}
                            <span className='hidden sm:inline'>
                              Tanya Mentor
                            </span>
                            <span className='sm:hidden'>Tanya</span>
                          </a>
                        ) : (
                          <div className='w-full md:flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 bg-gray-50/50 dark:bg-gray-800/50 text-[color:var(--text-tertiary)] text-[10px] font-bold rounded-xl md:rounded-2xl border border-dashed border-[color:var(--border-color)]'>
                            <span className='hidden sm:inline'>
                              Kontak Terkunci
                            </span>
                            <span className='sm:hidden'>Terkunci</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-24 text-center p-8 bg-[color:var(--bg-card)] rounded-3xl border border-[color:var(--border-color)]'>
                  <FaUsers className='text-4xl text-[color:var(--text-tertiary)] mx-auto mb-4 opacity-30' />
                  <h3 className='text-lg font-bold text-[color:var(--text-primary)]'>
                    Data Belum Tersedia
                  </h3>
                  <p className='text-[color:var(--text-secondary)]'>
                    Belum ada alumni yang terdaftar untuk filter ini.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegePlan;
