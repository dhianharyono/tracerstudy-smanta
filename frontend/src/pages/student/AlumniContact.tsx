import { useEffect, useState } from 'react';
import axios from 'axios';
import SmartLoader from '@/components/SmartLoader';
import {
  FaUniversity,
  FaGraduationCap,
  FaSearch,
  FaCrown,
  FaMedal,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
} from 'react-icons/fa';
import Toast from '@/components/toast';
import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';

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

const AlumniContact = () => {
  const { user } = useAuth();

  // Alumni Search State
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

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchUniversities(), fetchBadges()]);
      setLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    fetchMajors();
  }, [selectedUniversity]);

  // Fetch when page or filters change
  // Using a single effect to handle both pagination and filter changes would be cleaner if we reset page on filter change.
  useEffect(() => {
    fetchAlumni();
  }, [pagination.page]);

  // Reset pagination when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    } else {
      // If already page 1, we still need to fetch if filters changed (and page didn't change).
      // But wait, the previous effect only runs on pagination.page.
      // If filters change, we need to trigger fetch too.
      fetchAlumni();
    }
  }, [selectedUniversity, selectedMajor, isMentorFilter, selectedBadge]);

  const getSocialUrl = (type: 'linkedin' | 'instagram', value: string) => {
    if (!value) return '#';
    let cleanValue = value.trim();
    if (cleanValue.startsWith('http://') || cleanValue.startsWith('https://')) {
      return cleanValue;
    }
    if (type === 'linkedin') {
      if (cleanValue.includes('linkedin.com')) return `https://${cleanValue}`;
      return `https://www.linkedin.com/in/${cleanValue}`;
    }
    if (type === 'instagram') {
      if (cleanValue.includes('instagram.com')) return `https://${cleanValue}`;
      return `https://instagram.com/${cleanValue.replace('@', '')}`;
    }
    return value;
  };

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
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };

  const fetchAlumni = async () => {
    try {
      setLoadingAlumni(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (selectedUniversity) params.university = selectedUniversity;
      if (selectedMajor) params.major = selectedMajor;
      if (isMentorFilter) params.isMentor = 'true';
      if (selectedBadge) params.badgeId = selectedBadge;

      const response = await axios.get('/api/student/alumni', { params });

      if (response.data && response.data.alumni) {
        setFilteredAlumni(response.data.alumni);
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
        }));
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

  const resetFilters = () => {
    setSelectedUniversity('');
    setSelectedMajor('');
    setIsMentorFilter(false);
    setSelectedBadge('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <SmartLoader
        messages={[
          'Mengumpulkan data alumni...',
          'Menyiapkan daftar kontak...',
        ]}
      />
    );
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='p-4 md:p-8 animate-fade-in space-y-6'>
      <div className='text-center md:text-left'>
        <h1 className='text-xl md:text-2xl font-bold text-[color:var(--text-primary)]'>
          Hubungi Alumni
        </h1>
        <p className='text-[color:var(--text-secondary)] text-sm mt-1'>
          Cari dan hubungi alumni berdasarkan universitas dan jurusan tujuanmu.
        </p>
      </div>

      {/* Filters Section (SNBP/SNBT Style) */}
      <div className='bg-[color:var(--bg-card)] p-4 md:p-6 rounded-2xl border border-[color:var(--border-color)] shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* University Select */}
          <div className='space-y-2'>
            <label className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-wider'>
              Universitas
            </label>
            <div className='relative'>
              <select
                className='w-full pl-4 pr-10 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] appearance-none focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all text-sm'
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
              <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-tertiary)]'>
                <FaUniversity className='text-xs' />
              </div>
            </div>
          </div>

          {/* Major Select */}
          <div className='space-y-2'>
            <label className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-wider'>
              Jurusan
            </label>
            <div className='relative'>
              <select
                className='w-full pl-4 pr-10 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] appearance-none focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all text-sm'
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
              <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-tertiary)]'>
                <FaGraduationCap className='text-xs' />
              </div>
            </div>
          </div>
          {/* Badge Select */}
          <div className='space-y-2'>
            <label className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-wider'>
              Badge
            </label>
            <div className='relative'>
              <select
                className='w-full pl-4 pr-10 py-2.5 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] appearance-none focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all text-sm'
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
              <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--text-tertiary)]'>
                <FaMedal className='text-xs' />
              </div>
            </div>
          </div>

          {/* Mentor Toggle */}
          <div className='space-y-2 flex flex-col justify-end pb-1'>
            <div className='flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20'>
              <div className='flex items-center gap-2'>
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
                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] shadow-sm overflow-hidden min-h-[400px]'>
        <div className='p-4 border-b border-[color:var(--border-color)] flex justify-between items-center bg-[color:var(--bg-secondary)]'>
          <div className='font-bold text-[color:var(--text-primary)] flex items-center gap-2'>
            <FaSearch className='text-[var(--primary)] text-xs md:text-sm' />
            Hasil Pencarian
          </div>
          {(selectedUniversity ||
            selectedMajor ||
            isMentorFilter ||
            selectedBadge) && (
            <button
              onClick={resetFilters}
              className='text-xs text-red-500 font-bold hover:underline'
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='border-b border-[color:var(--border-color)] text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-wider bg-[color:var(--bg-secondary)]/50'>
                <th className='p-4'>No</th>
                <th className='p-4'>Nama Alumni</th>
                <th className='p-4'>Universitas & Jurusan</th>
                <th className='p-4 text-center'>Media Sosial</th>
              </tr>
            </thead>
            <tbody>
              {loadingAlumni ? (
                <tr>
                  <td colSpan={6} className='p-12 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='h-8 w-8 border-4 border-[color:var(--border-color)] border-t-[var(--primary)] rounded-full animate-spin mb-4' />
                      <p className='text-sm text-[color:var(--text-secondary)]'>
                        Mencari data alumni...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredAlumni.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='p-12 text-center text-[color:var(--text-secondary)]'
                  >
                    <p className='font-medium'>
                      Tidak mendatukan alumni dengan kriteria tersebut.
                    </p>
                    <p className='text-sm mt-1'>
                      Coba ubah filter pencarian Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((alumni, index) => (
                  <tr
                    key={alumni._id}
                    className='border-b border-[color:var(--border-color)] last:border-0 hover:bg-[color:var(--bg-secondary)]/30 transition-colors'
                  >
                    <td className='p-4 text-sm text-[color:var(--text-secondary)] w-12'>
                      {index + 1}
                    </td>
                    <td className='p-4'>
                      <div className='flex items-center gap-3'>
                        <div>
                          <div className='font-bold text-[color:var(--text-primary)] text-sm'>
                            {alumni.profile?.fullName || alumni.username}
                            {alumni.isMentor && (
                              <FaCrown
                                className='inline-block ml-1 text-amber-500 text-xs'
                                title='Mentor Alumni'
                              />
                            )}
                          </div>
                          <div className='text-xs text-[color:var(--text-tertiary)]'>
                            Lulus {alumni.profile?.graduationYear || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='p-4'>
                      <div className='text-sm font-medium text-[color:var(--text-primary)]'>
                        {alumni.university?.name || '-'}
                      </div>
                      <div className='text-xs text-[color:var(--text-secondary)]'>
                        {alumni.university?.major || '-'}
                      </div>
                    </td>
                    <td className='p-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <>
                          {alumni.socialMedia?.linkedin && (
                            <a
                              href={getSocialUrl(
                                'linkedin',
                                alumni.socialMedia.linkedin,
                              )}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all'
                              title='LinkedIn'
                            >
                              <FaLinkedin />
                            </a>
                          )}
                          {alumni.socialMedia?.instagram && (
                            <a
                              href={getSocialUrl(
                                'instagram',
                                alumni.socialMedia.instagram,
                              )}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-2 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-all'
                              title='Instagram'
                            >
                              <FaInstagram />
                            </a>
                          )}
                          {/* Fallback to mail if no social media but is mentor */}
                          {!alumni.socialMedia?.linkedin &&
                            !alumni.socialMedia?.instagram && (
                              <a
                                href={`mailto:${alumni.socialMedia?.email}`}
                                className='p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-all'
                                title='Email Mentor'
                              >
                                <FaEnvelope />
                              </a>
                            )}
                        </>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <div className='text-sm text-[color:var(--text-secondary)]'>
          Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
          {pagination.total} data
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={pagination.page === 1}
            className='px-4 py-2 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Previous
          </button>
          <span className='px-4 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium'>
            Page {pagination.page} of {pagination.pages || 1}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.pages || 1, prev.page + 1),
              }))
            }
            disabled={pagination.page >= (pagination.pages || 1)}
            className='px-4 py-2 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
export default AlumniContact;
