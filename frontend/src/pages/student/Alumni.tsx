import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  FaGraduationCap,
  FaFilter,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';

const StudentAlumni = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [alumni, setAlumni] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: searchParams.get('university') || '',
    graduationYear: searchParams.get('graduationYear') || '',
    major: searchParams.get('major') || '',
    name: searchParams.get('name') || '',
  });
  const [filterOptions, setFilterOptions] = useState({
    universities: [] as string[],
    graduationYears: [] as number[],
    majors: [] as string[],
  });

  useEffect(() => {
    const university = searchParams.get('university') || '';
    const major = searchParams.get('major') || '';
    const graduationYear = searchParams.get('graduationYear') || '';
    const name = searchParams.get('name') || '';

    setFilters({
      university,
      graduationYear,
      major,
      name,
    });
  }, [searchParams]);

  useEffect(() => {
    fetchAlumni();
  }, [pagination.page, filters]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.university) params.append('university', filters.university);
      if (filters.graduationYear)
        params.append('graduationYear', filters.graduationYear);
      if (filters.major) params.append('major', filters.major);
      if (filters.name) params.append('name', filters.name);

      const response = await axios.get(
        `/api/student/alumni?${params.toString()}`
      );
      setAlumni(response.data.alumni);
      setPagination(response.data.pagination);
      if (response.data.filters) {
        setFilterOptions(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });

    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k as keyof typeof newFilters]) {
        params.set(k, newFilters[k as keyof typeof newFilters]);
      }
    });
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({ university: '', graduationYear: '', major: '', name: '' });
    setPagination({ ...pagination, page: 1 });
    setSearchParams({});
  };

  if (loading && alumni.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in'>
      {/* Header Section */}
      <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='text-center md:text-left mb-2'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Data Alumni
          </h1>
          <p className='text-[color:var(--text-secondary)]'>
            Temukan informasi Alumni
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className='max-w-sm md:hidden flex items-center justify-center gap-2 w-full py-2 bg-[var(--primary)] text-white rounded-lg'
        >
          <FaFilter /> {showFilters ? 'Tutup Filter' : 'Filter Alumni'}
        </button>
      </div>

      {/* Filters & Search - Desktop: Sidebar/TopBar Hybrid, Mobile: Collapsible */}
      <div
        className={`mb-8 p-4 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl shadow-sm transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'
          }`}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Search Name */}
          <div className='relative'>
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Cari Nama Alumni...'
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              className='w-full rounded-lg bg-[color:var(--bg-tertiary)] py-2 pl-9 pr-4 text-sm outline-none border border-transparent focus:border-[var(--primary)] focus:bg-[color:var(--bg-card)] transition-all'
            />
          </div>

          {/* University Filter */}
          <div className='relative'>
            <select
              value={filters.university}
              onChange={(e) => handleFilterChange('university', e.target.value)}
              className='w-full appearance-none rounded-lg bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none cursor-pointer border border-transparent focus:border-[var(--primary)] focus:bg-[color:var(--bg-card)] transition-all'
            >
              <option value=''>Semua Universitas</option>
              {filterOptions.universities.map((univ) => (
                <option key={univ} value={univ}>
                  {univ}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>

          {/* Major Filter */}
          <div className='relative'>
            <select
              value={filters.major}
              onChange={(e) => handleFilterChange('major', e.target.value)}
              className='w-full appearance-none rounded-lg bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none cursor-pointer border border-transparent focus:border-[var(--primary)] focus:bg-[color:var(--bg-card)] transition-all'
            >
              <option value=''>Semua Jurusan</option>
              {filterOptions.majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>

          {/* Year Filter */}
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <select
                value={filters.graduationYear}
                onChange={(e) =>
                  handleFilterChange('graduationYear', e.target.value)
                }
                className='w-full appearance-none rounded-lg bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none cursor-pointer border border-transparent focus:border-[var(--primary)] focus:bg-[color:var(--bg-card)] transition-all'
              >
                <option value=''>Tahun Lulus</option>
                {filterOptions.graduationYears.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={handleClearFilters}
              title='Reset Filter'
              className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors'
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>

      {/* Alumni Table */}
      {alumni.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-[color:var(--bg-card)] p-12 text-center dark:border-gray-700'>
          <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
            <FaGraduationCap className='text-4xl text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-[color:var(--text-primary)]'>
            Tidak ditemukan
          </h3>
          <p className='text-gray-500'>Coba sesuaikan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className='max-w-sm md:max-w-full'>
          <div className='overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-sm'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] uppercase tracking-wider font-medium border-b border-[color:var(--border-color)]'>
                  <tr>
                    <th className='px-6 py-4'>Nama Alumni</th>
                    <th className='px-6 py-4'>Tahun</th>
                    <th className='px-6 py-4'>Pendidikan Lanjutan</th>
                    <th className='px-6 py-4'>Pekerjaan Saat Ini</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[color:var(--border-color)]'>
                  {alumni.map((alum) => (
                    <tr
                      key={alum._id}
                      className='group hover:bg-[color:var(--bg-tertiary)]/50 transition-colors duration-200'
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-10 w-10 shrink-0 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-lg'>
                            {alum.profile?.fullName?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className='font-semibold text-[color:var(--text-primary)]'>
                              {alum.profile?.fullName || '-'}
                            </div>
                            <div className='text-xs text-[color:var(--text-secondary)]'>
                              Alumni
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>
                          {alum.profile?.graduationYear || '-'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-col max-w-[200px]'>
                          <span
                            className='font-medium text-[color:var(--text-primary)] truncate'
                            title={alum.university?.name}
                          >
                            {alum.university?.name || '-'}
                          </span>
                          <span
                            className='text-xs text-[color:var(--text-secondary)] truncate'
                            title={alum.university?.major}
                          >
                            {alum.university?.major || '-'}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {alum.job?.position || alum.job?.institution ? (
                          <div className='flex flex-col max-w-[200px]'>
                            <span
                              className='font-medium text-[color:var(--text-primary)] truncate'
                              title={alum.job?.position}
                            >
                              {alum.job?.position || 'Bekerja'}
                            </span>
                            <span
                              className='text-xs text-[color:var(--text-secondary)] truncate'
                              title={alum.job?.institution}
                            >
                              {alum.job?.institution || '-'}
                            </span>
                          </div>
                        ) : (
                          <span className='text-[color:var(--text-secondary)] italic'>
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className='mt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-sm text-[color:var(--text-secondary)]'>
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              dari {pagination.total} data
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
                className='px-4 py-2 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Previous
              </button>
              <div className='flex items-center gap-1'>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_) => {
                  return null;
                })}
                <span className='px-4 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium'>
                  Page {pagination.page} of {pagination.pages}
                </span>
              </div>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    page: Math.min(pagination.pages, pagination.page + 1),
                  })
                }
                disabled={pagination.page >= pagination.pages}
                className='px-4 py-2 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Next
              </button>
            </div>
          </div>
        </div >
      )}
    </div >
  );
};

export default StudentAlumni;
