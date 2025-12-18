import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaFilter, FaTimes, FaTrash, FaEnvelope, FaLinkedin, FaInstagram, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AdminAlumni = () => {
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
    fetchAlumni();
  }, [pagination.page, filters]);

  const fetchAlumni = async () => {
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
        `/api/admin/alumni?${params.toString()}`
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
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({ university: '', graduationYear: '', major: '' });
    setPagination({ ...pagination, page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alumni?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/alumni/${id}`);
      toast.success('Alumni berhasil dihapus!');
      fetchAlumni();
    } catch (error: any) {
      console.error('Error deleting alumni:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus alumni');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='mb-2 text-center md:text-left'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>Kelola Data Alumni</h1>
          <p className='text-sm text-[color:var(--text-secondary)] text-sm md:text-base'>Memantau dan mengelola data alumni terdaftar</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='max-w-sm flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white hover:bg-[var(--primary-dark)] md:hidden'
        >
          <FaFilter /> {showFilters ? 'Tutup Filter' : 'Filter Data'}
        </button>
      </div>

      {/* Filters */}
      <div className={`mb-6 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 shadow-sm transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='relative'>
            <select
              value={filters.university}
              onChange={(e) => handleFilterChange('university', e.target.value)}
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Semua Universitas</option>
              {filterOptions.universities.map((univ) => (
                <option key={univ} value={univ}>{univ}</option>
              ))}
            </select>
            <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /></svg>
            </div>
          </div>

          <div className='relative'>
            <select
              value={filters.graduationYear}
              onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Semua Tahun</option>
              {filterOptions.graduationYears.map((year) => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
            <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /></svg>
            </div>
          </div>

          <div className='relative'>
            <select
              value={filters.major}
              onChange={(e) => handleFilterChange('major', e.target.value)}
              className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-4 pr-8 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
            >
              <option value=''>Semua Jurusan</option>
              {filterOptions.majors.map((major) => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
            <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' /></svg>
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className='flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
          >
            <FaTimes /> Reset Filter
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className='max-w-sm md:max-w-full overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] uppercase tracking-wider font-medium border-b border-[color:var(--border-color)]'>
              <tr>
                <th className='px-6 py-4'>Nama & Email</th>
                <th className='px-6 py-4'>Pendidikan</th>
                <th className='px-6 py-4'>Status</th>
                <th className='px-6 py-4'>Sosial</th>
                <th className='px-6 py-4'>Survei</th>
                <th className='px-6 py-4'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[color:var(--border-color)]'>
              {alumni.length === 0 ? (
                <tr>
                  <td colSpan={6} className='p-8 text-center text-[color:var(--text-secondary)]'>
                    Tidak ada data alumni yang ditemukan.
                  </td>
                </tr>
              ) : (
                alumni.map((alum) => (
                  <tr key={alum._id} className='hover:bg-[color:var(--bg-tertiary)]/50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div>
                        <div className='font-semibold text-[color:var(--text-primary)]'>{alum.profile?.fullName || '-'}</div>
                        <div className='text-xs text-[color:var(--text-secondary)]'>{alum.email}</div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='max-w-[200px]'>
                        <div className='font-medium text-[color:var(--text-primary)] truncate' title={alum.university?.name}>{alum.university?.name || '-'}</div>
                        <div className='text-xs text-[color:var(--text-secondary)] truncate' title={alum.university?.major}>
                          {alum.university?.major || '-'} <span className='mx-1'>•</span> {alum.profile?.graduationYear}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      {alum.profile?.isWorking ? (
                        <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300'>Bekerja</span>
                      ) : alum.profile?.isStudying ? (
                        <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>Kuliah</span>
                      ) : (
                        <span className='inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300'>-</span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-2'>
                        {alum.socialMedia?.linkedin && (
                          <a href={(alum.socialMedia.linkedin.startsWith('http') ? '' : 'https://') + alum.socialMedia.linkedin} target='_blank' rel='noreferrer' className='text-blue-600 hover:text-blue-800'>
                            <FaLinkedin size={16} />
                          </a>
                        )}
                        {alum.socialMedia?.instagram && (
                          <a href={alum.socialMedia.instagram} target='_blank' rel='noreferrer' className='text-pink-600 hover:text-pink-800'>
                            <FaInstagram size={16} />
                          </a>
                        )}
                        {alum.socialMedia?.email && (
                          <a href={`mailto:${alum.socialMedia.email}`} className='text-gray-600 hover:text-gray-800 dark:text-gray-400'>
                            <FaEnvelope size={16} />
                          </a>
                        )}
                        {(!alum.socialMedia?.linkedin && !alum.socialMedia?.instagram && !alum.socialMedia?.email) && (
                          <span className='text-xs text-gray-400'>-</span>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      {alum.questionnaireCompleted ? (
                        <span className='flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400'>
                          <FaCheckCircle /> Lengkap
                        </span>
                      ) : (
                        <span className='flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400'>
                          <FaTimesCircle /> Belum
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => handleDelete(alum._id)}
                        className='rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors dark:hover:bg-red-900/20'
                        title="Hapus Alumni"
                      >
                        <FaTrash size={14} />
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
          Menampilkan <span className='font-medium'>{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className='font-medium'>{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className='font-medium'>{pagination.total}</span> data
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
            disabled={pagination.page === 1}
            className='rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Previous
          </button>
          <span className='rounded-lg bg-[var(--primary)]/10 px-4 py-2 text-sm font-medium text-[var(--primary)]'>
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
            disabled={pagination.page >= pagination.pages}
            className='rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAlumni;
