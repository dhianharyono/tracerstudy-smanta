import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaFilter,
  FaTimes,
  FaTrash,
  FaEnvelope,
  FaLinkedin,
  FaInstagram,
  FaChevronLeft,
  FaChevronRight,
  FaCrown,
} from 'react-icons/fa';
import SmartLoader from '@/components/SmartLoader';

const AdminMentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: '',
    graduationYear: '',
    major: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    universities: [] as string[],
    graduationYears: [] as number[],
    majors: [] as string[],
  });

  useEffect(() => {
    fetchMentors();
  }, [pagination.page, filters]);

  const fetchMentors = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.university) params.append('university', filters.university);
      if (filters.graduationYear)
        params.append('graduationYear', filters.graduationYear);
      if (filters.major) params.append('major', filters.major);

      const response = await axios.get(
        `/api/admin/mentors?${params.toString()}`,
      );
      setMentors(response.data.mentors);
      setPagination(response.data.pagination);
      if (response.data.filters) {
        setFilterOptions(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      Toast('Gagal mengambil data mentor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({
      university: '',
      graduationYear: '',
      major: '',
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Hapus status mentor alumni ini? Alumni tidak akan lagi tampil sebagai mentor.',
      )
    ) {
      return;
    }

    try {
      await axios.put(`/api/admin/alumni/${id}`, { isMentor: false });
      Toast('Status mentor berhasil dinonaktifkan!', 'success');
      fetchMentors();
    } catch (error: any) {
      console.error('Error updating mentor status:', error);
      Toast(
        error.response?.data?.message || 'Gagal merubah status mentor',
        'error',
      );
    }
  };

  if (loading) {
    return <SmartLoader />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='mb-2 text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0 flex items-center justify-center md:justify-start gap-3'>
            Daftar Mentor Alumni
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/20'>
              <FaCrown className='text-[10px]' /> {pagination.total} Aktif
            </span>
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base'>
            Daftar alumni yang bersedia menjadi mentor bagi siswa
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='max-w-sm flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white hover:bg-[var(--primary-dark)] md:hidden'
        >
          <FaFilter /> {showFilters ? 'Tutup Filter' : 'Filter Data'}
        </button>
      </div>

      {/* Filters */}
      <div
        className={`mb-6 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 shadow-sm transition-all duration-300 ${
          showFilters ? 'block' : 'hidden md:block'
        }`}
      >
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='relative'>
            <select
              value={filters.university}
              onChange={(e) => handleFilterChange('university', e.target.value)}
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Semua Universitas</option>
              {filterOptions.universities.map((univ) => (
                <option key={univ} value={univ}>
                  {univ}
                </option>
              ))}
            </select>
          </div>

          <div className='relative'>
            <select
              value={filters.graduationYear}
              onChange={(e) =>
                handleFilterChange('graduationYear', e.target.value)
              }
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Semua Tahun Lulus</option>
              {filterOptions.graduationYears.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className='relative'>
            <select
              value={filters.major}
              onChange={(e) => handleFilterChange('major', e.target.value)}
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Semua Jurusan</option>
              {filterOptions.majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            className='flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
          >
            <FaTimes className='text-xs' /> Reset Filter
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className='overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] uppercase tracking-wider font-medium border-b border-[color:var(--border-color)]'>
              <tr>
                <th className='px-6 py-4'>Mentor</th>
                <th className='px-6 py-4'>Pendidikan</th>
                <th className='px-6 py-4'>Pekerjaan</th>
                <th className='px-6 py-4'>Media Sosial</th>
                <th className='px-6 py-4'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {mentors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='p-8 text-center text-[color:var(--text-secondary)]'
                  >
                    Belum ada alumni yang terdaftar sebagai mentor.
                  </td>
                </tr>
              ) : (
                mentors.map((mentor) => (
                  <tr
                    key={mentor._id}
                    className='hover:bg-[color:var(--bg-tertiary)]/50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div>
                        <div className='font-semibold text-[color:var(--text-primary)]'>
                          {mentor.profile?.fullName || '-'}
                        </div>
                        <div className='text-xs text-[color:var(--text-secondary)]'>
                          {mentor.email}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='max-w-[200px]'>
                        <div
                          className='font-medium text-[color:var(--text-primary)] truncate'
                          title={mentor.university?.name}
                        >
                          {mentor.university?.name || '-'}
                        </div>
                        <div
                          className='text-xs text-[color:var(--text-secondary)] truncate'
                          title={mentor.university?.major}
                        >
                          {mentor.university?.major || '-'}{' '}
                          <span className='mx-1'>•</span>{' '}
                          {mentor.profile?.graduationYear}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='max-w-[150px]'>
                        <div className='font-medium text-[color:var(--text-primary)] truncate'>
                          {mentor.job?.position || '-'}
                        </div>
                        <div className='text-xs text-[color:var(--text-secondary)] truncate'>
                          {mentor.job?.institution || '-'}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 shadow-none'>
                      <div className='flex gap-2'>
                        {mentor.socialMedia?.linkedin && (
                          <a
                            href={
                              (mentor.socialMedia.linkedin.startsWith('http')
                                ? ''
                                : 'https://') + mentor.socialMedia.linkedin
                            }
                            target='_blank'
                            rel='noreferrer'
                            className='text-blue-600 hover:text-blue-800'
                          >
                            <FaLinkedin size={16} />
                          </a>
                        )}
                        {mentor.socialMedia?.instagram && (
                          <a
                            href={
                              mentor.socialMedia.instagram.startsWith('http')
                                ? mentor.socialMedia.instagram
                                : `https://instagram.com/${mentor.socialMedia.instagram.replace('@', '')}`
                            }
                            target='_blank'
                            rel='noreferrer'
                            className='text-pink-600 hover:text-pink-800'
                          >
                            <FaInstagram size={16} />
                          </a>
                        )}
                        {mentor.socialMedia?.email && (
                          <a
                            href={`mailto:${mentor.socialMedia.email}`}
                            className='text-gray-600 hover:text-gray-800 dark:text-gray-400'
                          >
                            <FaEnvelope size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => handleDelete(mentor._id)}
                        className='inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline'
                      >
                        <FaTrash className='text-[10px]' /> Nonaktifkan Mentor
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className='mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row'>
        <div className='text-sm text-[color:var(--text-secondary)]'>
          Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
          {pagination.total} mentor
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                page: Math.max(1, pagination.page - 1),
              })
            }
            disabled={pagination.page === 1}
            className='rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-2 hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50'
          >
            <FaChevronLeft />
          </button>
          <span className='text-sm font-medium'>
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                page: Math.min(pagination.pages, pagination.page + 1),
              })
            }
            disabled={pagination.page === pagination.pages}
            className='rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-2 hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50'
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminMentors;
