import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  FaGraduationCap,
  FaFilter,
  FaSearch,
  FaTimes,
  FaMedal,
  FaCrown,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
} from 'react-icons/fa';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Pagination from '@/components/common/Pagination';
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from '@/components/common/Table';

import { useAuth } from '../../contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete, getSocialUrl } from '@/utils/helpers';
import { isUniversityIncomplete, isNameIncomplete } from '@/utils/validation';

const StudentAlumni = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alumni, setAlumni] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
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
    isMentor: searchParams.get('isMentor') || '',
  });
  const [filterOptions, setFilterOptions] = useState({
    universities: [] as string[],
    graduationYears: [] as number[],
    majors: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('name') || '');
  const [debouncedName, setDebouncedName] = useState(searchTerm);

  useEffect(() => {
    const university = searchParams.get('university') || '';
    const major = searchParams.get('major') || '';
    const graduationYear = searchParams.get('graduationYear') || '';
    const name = searchParams.get('name') || '';
    const isMentor = searchParams.get('isMentor') || '';

    setFilters({
      university,
      graduationYear,
      major,
      name,
      isMentor,
    });
    setSearchTerm(name);
    setDebouncedName(name);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedName !== filters.name) {
      handleFilterChange('name', debouncedName);
    }
  }, [debouncedName]);

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
      if (filters.isMentor) params.append('isMentor', filters.isMentor);

      const response = await axios.get(
        `/api/student/alumni?${params.toString()}`,
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
    setFilters({
      university: '',
      graduationYear: '',
      major: '',
      name: '',
      isMentor: '',
    });
    setPagination({ ...pagination, page: 1 });
    setSearchParams({});
  };

  if (user?.isHidden) {
    return <RestrictedAccess type='hidden_user' role={user.role as any} />;
  }

  if (user?.role === 'admin' || user?.role === 'school') {
    // Admin and school monitoring profiles do not need completeness verification
  } else if (user?.role === 'alumni') {
    if (!user?.questionnaireCompleted) {
      return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
    }
    if (isNameIncomplete(user?.profile)) {
      return <RestrictedAccess type='name_incomplete' role='alumni' />;
    }
    if (isUniversityIncomplete(user)) {
      return <RestrictedAccess type='university_incomplete' role='alumni' />;
    }
  } else {
    if (!isStudentProfileComplete(user)) {
      return <RestrictedAccess type='profile_incomplete' role='student' />;
    }
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in'>
      {/* Header Section */}
      <PageHeader
        title='Data Lengkap Alumni'
        description='Temukan informasi lengkap tentang Alumni disini, data yang ditampilkan adalah alumni yang sudah mengisi kuesioner secara lengkap'
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='max-w-sm md:hidden flex items-center justify-center gap-2 w-full py-2 bg-[var(--primary)] text-white rounded-lg'
        >
          <FaFilter /> {showFilters ? 'Tutup Filter' : 'Filter Alumni'}
        </button>
      </PageHeader>

      {/* Filters & Search - Desktop: Sidebar/TopBar Hybrid, Mobile: Collapsible */}
      <Card
        className={`mb-8 p-4 transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'
          }`}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
          {/* Search Name */}
          <div className='relative'>
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Cari Nama Alumni...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Mentor Filter */}
          <div className='relative'>
            <select
              value={filters.isMentor}
              onChange={(e) => handleFilterChange('isMentor', e.target.value)}
              className='w-full appearance-none rounded-lg bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none cursor-pointer border border-transparent focus:border-[var(--primary)] focus:bg-[color:var(--bg-card)] transition-all'
            >
              <option value=''>Semua Status Mentor</option>
              <option value='true'>Khusus Mentor Active</option>
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

          {/* Year Filter & Reset */}
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
      </Card>

      {/* Alumni Table */}
      {!loading && alumni.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-[color:var(--bg-card)] p-12 text-center dark:border-gray-700'>
          <div className='mb-4 rounded-full bg-slate-200/40 p-4 dark:bg-slate-200/40'>
            <FaGraduationCap className='text-4xl text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-slate'>
            Tidak ditemukan
          </h3>
          <p className='text-gray-500'>Coba sesuaikan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className='max-w-sm md:max-w-full'>
          <TableContainer>
            <TableHeader>
              <TableHeadCell className='w-16'>No</TableHeadCell>
              <TableHeadCell>Nama Alumni</TableHeadCell>
              <TableHeadCell>Tahun</TableHeadCell>
              <TableHeadCell>Pendidikan</TableHeadCell>
              <TableHeadCell>Sosial Media</TableHeadCell>
              <TableHeadCell>Pekerjaan</TableHeadCell>
            </TableHeader>
            <TableBody>
              {loading
                ? // Premium SMANTA Transparent Skeleton Loading Rows
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className='h-4 w-6 bg-slate-200/40 dark:bg-slate-700/25 rounded-md animate-pulse'></div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-slate-200/40 dark:bg-slate-700/25 animate-pulse shrink-0'></div>
                        <div className='flex flex-col gap-1.5'>
                          <div className='h-4 w-36 bg-slate-200/40 dark:bg-slate-700/25 rounded-md animate-pulse'></div>
                          <div className='h-3 w-24 bg-blue-100/40 dark:bg-blue-950/20 rounded-md animate-pulse'></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='h-6 w-16 bg-slate-200/40 dark:bg-slate-700/25 rounded-full animate-pulse'></div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1.5'>
                        <div className='h-4 w-32 bg-slate-200/40 dark:bg-slate-700/25 rounded-md animate-pulse'></div>
                        <div className='h-3 w-20 bg-slate-100/60 dark:bg-slate-800/20 rounded-md animate-pulse'></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        <div className='h-7 w-7 bg-slate-200/40 dark:bg-slate-700/25 rounded-full animate-pulse'></div>
                        <div className='h-7 w-7 bg-slate-200/40 dark:bg-slate-700/25 rounded-full animate-pulse'></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1.5'>
                        <div className='h-4 w-28 bg-slate-200/40 dark:bg-slate-700/25 rounded-md animate-pulse'></div>
                        <div className='h-3 w-20 bg-slate-100/60 dark:bg-slate-800/20 rounded-md animate-pulse'></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                : alumni.map((alum, index) => (
                  <TableRow key={alum._id} className='group'>
                    <TableCell className='text-sm text-[color:var(--text-secondary)]'>
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <div className='font-semibold text-[color:var(--text-primary)]'>
                              {alum.profile?.fullName || '-'}
                            </div>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-[color:var(--text-secondary)]'>
                            {alum.isMentor && (
                              <span className='flex items-center gap-1 text-amber-600 font-bold'>
                                <FaCrown className='text-xs' />
                                Mentor
                              </span>
                            )}
                            {alum.isMentor &&
                              alum.badges &&
                              alum.badges.length > 0 && (
                                <span className='text-gray-600 font-bold'>
                                  •
                                </span>
                              )}
                            {alum.badges && alum.badges.length > 0 && (
                              <div className='flex gap-1 items-center'>
                                {alum.badges.map(
                                  (badge: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className='text-blue-500'
                                      title={badge.name}
                                    >
                                      <FaMedal className='text-xs' />
                                    </div>
                                  ),
                                )}
                                {alum.badges.map(
                                  (badge: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className='text-xs text-blue-500'
                                    >
                                      {badge.name}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/50'>
                        {alum.profile?.graduationYear || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col min-w-[200px]'>
                        <span
                          className='font-medium text-[color:var(--text-primary)] '
                          title={alum.university?.name}
                        >
                          {alum.university?.name || '-'}
                        </span>
                        <span
                          className='text-xs text-[color:var(--text-secondary)]'
                          title={alum.university?.major}
                        >
                          {alum.university?.major || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {alum.socialMedia?.instagram && (
                          <a
                            href={getSocialUrl(
                              'instagram',
                              alum.socialMedia.instagram,
                            )}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-pink-600 hover:text-pink-700 transition-colors p-1.5 rounded-lg'
                            title={`Instagram: ${alum.socialMedia.instagram}`}
                          >
                            <FaInstagram className='text-base' />
                          </a>
                        )}
                        {alum.socialMedia?.linkedin && (
                          <a
                            href={getSocialUrl(
                              'linkedin',
                              alum.socialMedia.linkedin,
                            )}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:text-blue-700 transition-colors p-1.5 rounded-lg'
                            title={`LinkedIn: ${alum.socialMedia.linkedin}`}
                          >
                            <FaLinkedin className='text-base' />
                          </a>
                        )}
                        {alum.email && (
                          <a
                            href={`mailto:${alum.email}`}
                            className='text-gray-300 hover:text-[color:var(--text-primary)] transition-colors rounded-lg'
                            title={`Email: ${alum.email}`}
                          >
                            <FaEnvelope size={16} />
                          </a>
                        )}
                        {!alum.socialMedia?.instagram &&
                          !alum.socialMedia?.linkedin && (
                            <span className='text-[color:var(--text-secondary)] italic'>
                              -
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </TableContainer>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) =>
              setPagination({
                ...pagination,
                page,
              })
            }
          />
        </div>
      )}
    </div>
  );
};

export default StudentAlumni;
