import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaDownload,
  FaTimes,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';
import Card from '@/components/common/Card';
import { isUniversityIncomplete } from '@/utils/validation';

const SchoolAlumniList = () => {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [surveyFilter, setSurveyFilter] = useState('completed');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0,
  });

  const handleClearFilters = () => {
    setSearch('');
    setGraduationYear('');
    setStatusFilter('');
    setSurveyFilter('completed');
    setPagination({ ...pagination, page: 1 });
  };

  useEffect(() => {
    fetchAlumni();
  }, [pagination.page, graduationYear, statusFilter, surveyFilter, search]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/school/alumni', {
        params: {
          search,
          graduationYear,
          status: statusFilter,
          surveyStatus: surveyFilter,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      setAlumni(response.data.alumni);
      setPagination({
        ...pagination,
        total: response.data.total,
        pages: response.data.pages,
      });
    } catch (error) {
      console.error('Error fetching school alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = [
      'Nama Lengkap',
      'Angkatan',
      'Email',
      'Status Survei',
      'Status Alumni',
      'Universitas',
      'Jurusan',
      'Instansi Kerja',
      'Posisi',
    ];
    const csvData = alumni.map((person) => [
      person.profile?.fullName || 'Anonim',
      person.profile?.graduationYear || '-',
      person.email || '-',
      !isUniversityIncomplete(person) ? 'Lengkap' : 'Belum Lengkap',
      person.profile?.isStudying && person.profile?.isWorking
        ? 'Kuliah & Kerja'
        : person.profile?.isStudying
          ? 'Kuliah'
          : person.profile?.isWorking
            ? 'Bekerja'
            : 'Belum Terdata',
      person.university?.name || '-',
      person.university?.major || '-',
      person.job?.institution || '-',
      person.job?.position || '-',
    ]);

    const csvContent = [headers, ...csvData].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `data_alumni_smanta_${new Date().toLocaleDateString()}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='p-6 page-fade-in bg-[color:var(--bg-secondary)] min-h-screen'>
      <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='mb-2 md:mb-0'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Data Alumni SMANTA
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base mt-1'>
            Manajemen dan rekap data keterserapan alumni secara real-time.
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className='w-full text-sm flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/20 self-start md:self-auto'
        >
          <FaDownload /> Download CSV
        </button>
      </div>

      {/* Filter Section - Admin Style */}
      <Card className='mb-6 transition-all duration-300 block'>
        <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4'>
          {/* Search */}
          <div className='relative'>
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Cari Nama...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-9 pr-4 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            />
          </div>

          {/* Filter Graduation Year */}
          <div className='relative'>
            <select
              value={graduationYear}
              onChange={(e) => {
                setGraduationYear(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Semua Angkatan</option>
              {Array.from(
                { length: 15 },
                (_, i) => new Date().getFullYear() - i,
              ).map((year) => (
                <option key={year} value={year}>
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

          {/* Filter Status Alumni */}
          <div className='relative'>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Status Alumni</option>
              <option value='studying'>Kuliah</option>
              <option value='working'>Bekerja</option>
              <option value='both'>Keduanya</option>
              <option value='none'>Belum Terdata</option>
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

          {/* Filter Status Survei */}
          <div className='relative'>
            <select
              value={surveyFilter}
              onChange={(e) => {
                setSurveyFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Status Survei</option>
              <option value='completed'>Lengkap</option>
              <option value='not_completed'>Belum Lengkap</option>
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
            className='flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
          >
            <FaTimes className='text-xs' /> Reset
          </button>
        </div>
      </Card>

      {/* Table Content */}
      <div className='bg-[color:var(--bg-card)] rounded-2xl border border-[color:var(--border-color)] shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] border-b border-[color:var(--border-color)]'>
              <tr>
                <th className='px-6 py-4 font-bold uppercase tracking-wider'>
                  Nama & Email
                </th>
                <th className='px-6 py-4 font-bold uppercase tracking-wider'>
                  Angkatan
                </th>
                <th className='px-6 py-4 font-bold uppercase tracking-wider'>
                  Perguruan Tinggi
                </th>
                <th className='px-6 py-4 font-bold uppercase tracking-wider'>
                  Pekerjaan
                </th>
                <th className='px-6 py-4 font-bold uppercase tracking-wider'>
                  Kelengkapan Data
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {loading ? (
                <tr>
                  <td colSpan={5} className='p-12 text-center'>
                    <div className='inline-flex items-center gap-3 text-[color:var(--text-secondary)]'>
                      <div className='w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
                      Memuat Data...
                    </div>
                  </td>
                </tr>
              ) : alumni.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='p-12 text-center text-[color:var(--text-tertiary)]'
                  >
                    Tidak ada data alumni ditemukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                alumni.map((person) => (
                  <tr
                    key={person._id}
                    className='hover:bg-[color:var(--bg-tertiary)]/30 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center font-bold'>
                          {person.profile?.fullName?.charAt(0) || (
                            <FaUser size={12} />
                          )}
                        </div>
                        <div>
                          <p className='font-bold text-[color:var(--text-primary)]'>
                            {person.profile?.fullName || 'Anonim'}
                          </p>
                          <p className='text-xs text-[color:var(--text-secondary)] mt-0.5'>
                            {person.email || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-[color:var(--text-secondary)]'>
                        {person.profile?.graduationYear || '-'}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      {person.profile?.isStudying ? (
                        <div>
                          <p className='font-bold text-[color:var(--text-primary)] max-w-[200px] whitespace-normal break-words leading-tight'>
                            {person.university?.name}
                          </p>
                          <p className='text-xs text-[color:var(--text-secondary)] max-w-[200px] whitespace-normal w-full break-words leading-tight mt-1'>
                            {person.university?.major}
                          </p>
                        </div>
                      ) : (
                        <span className='text-[color:var(--text-tertiary)] italic'>
                          -
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      {person.profile?.isWorking ? (
                        <div>
                          <p className='font-bold text-[color:var(--text-primary)] max-w-[200px] whitespace-normal break-words leading-tight'>
                            {person.job?.institution}
                          </p>
                          <p className='text-xs text-[color:var(--text-secondary)] max-w-[200px] whitespace-normal w-full break-words leading-tight mt-1'>
                            {person.job?.position}
                          </p>
                        </div>
                      ) : (
                        <span className='text-[color:var(--text-tertiary)] italic'>
                          -
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      {!isUniversityIncomplete(person) ? (
                        <div className='flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold'>
                          <FaCheckCircle size={14} />
                          <span>Lengkap</span>
                        </div>
                      ) : (
                        <div className='flex items-center gap-2 text-amber-500 font-bold'>
                          <FaClock size={14} />
                          <span>Belum</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      <div className='mt-8 flex items-center justify-between'>
        <p className='text-sm text-[color:var(--text-tertiary)]'>
          Menampilkan{' '}
          <span className='font-bold text-[color:var(--text-primary)]'>
            {alumni.length}
          </span>{' '}
          dari{' '}
          <span className='font-bold text-[color:var(--text-primary)]'>
            {pagination.total}
          </span>{' '}
          alumni
        </p>
        <div className='flex gap-2'>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                page: Math.max(1, pagination.page - 1),
              })
            }
            disabled={pagination.page === 1}
            className='p-2 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] disabled:opacity-50 text-[color:var(--text-primary)]'
          >
            <FaChevronLeft />
          </button>
          <div className='px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-bold text-sm'>
            {pagination.page} / {pagination.pages || 1}
          </div>
          <button
            onClick={() =>
              setPagination({
                ...pagination,
                page: Math.min(pagination.pages, pagination.page + 1),
              })
            }
            disabled={pagination.page >= pagination.pages}
            className='p-2 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] disabled:opacity-50 text-[color:var(--text-primary)]'
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolAlumniList;
