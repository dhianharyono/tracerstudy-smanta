import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

const AdminAlumni = () => {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
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
    return (
      <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
        <div className='flex items-center gap-3 text-lg font-medium text-gray-400'>
          <FaSpinner className='animate-spin text-xl' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='page-header'>
        <h1 className='text-xl md:text-2xl'>Data Alumni</h1>
      </div>

      <div className='card mb-6 max-w-sm md:max-w-md lg:max-w-full'>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
          Filter
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='form-group'>
            <label>Universitas</label>
            <select
              value={filters.university}
              onChange={(e) => handleFilterChange('university', e.target.value)}
            >
              <option value=''>Semua Universitas</option>
              {filterOptions.universities.map((univ) => (
                <option key={univ} value={univ}>
                  {univ}
                </option>
              ))}
            </select>
          </div>
          <div className='form-group'>
            <label>Tahun Lulus</label>
            <select
              value={filters.graduationYear}
              onChange={(e) =>
                handleFilterChange('graduationYear', e.target.value)
              }
            >
              <option value=''>Semua Tahun</option>
              {filterOptions.graduationYears.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className='form-group'>
            <label>Jurusan</label>
            <select
              value={filters.major}
              onChange={(e) => handleFilterChange('major', e.target.value)}
            >
              <option value=''>Semua Jurusan</option>
              {filterOptions.majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
          <div
            className='form-group'
            style={{ display: 'flex', alignItems: 'flex-end' }}
          >
            <button
              onClick={handleClearFilters}
              className='btn btn-secondary'
              style={{ width: '100%' }}
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>

      <div className='card mb-6 max-w-sm md:max-w-md lg:max-w-full'>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Tahun Lulus</th>
                <th>Universitas</th>
                <th>Jurusan</th>
                <th>Status</th>
                <th>Email</th>
                <th>Linkedin</th>
                <th>Instagram</th>
                <th>Kuesioner</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((alum) => (
                <tr key={alum._id}>
                  <td>{alum.profile?.fullName || '-'}</td>
                  <td>{alum.email}</td>
                  <td>{alum.profile?.graduationYear || '-'}</td>
                  <td>{alum.university?.name || '-'}</td>
                  <td>{alum.university?.major || '-'}</td>
                  <td>
                    {alum.profile?.isWorking
                      ? 'Bekerja'
                      : alum.profile?.isStudying
                      ? 'Kuliah'
                      : '-'}
                  </td>
                  <td>{alum.socialMedia?.email || '-'}</td>
                  <td>
                    {alum.socialMedia?.linkedin ? (
                      <a
                        href={`mailto:${alum.socialMedia.linkedin}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-purple-500'
                      >
                        {alum.socialMedia.linkedin}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {alum.socialMedia?.instagram ? (
                      <a
                        href={`mailto:${alum.socialMedia.instagram}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-purple-500'
                      >
                        {alum.socialMedia.instagram}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{alum.questionnaireCompleted ? 'Lengkap' : 'Belum'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(alum._id)}
                      className='btn btn-secondary'
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='flex flex-wrap gap-3 justify-center items-center mt-6'>
          <button
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
            disabled={pagination.page === 1}
            className='btn btn-secondary max-w-fit lg:mx-0'
            style={{ opacity: pagination.page === 1 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <span className='p-2 lg:py-3 lg:px-3 bg-gray-100 rounded-lg font-semibold text-gray-700'>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
            disabled={pagination.page >= pagination.pages}
            className='btn btn-secondary max-w-fit lg:mx-0'
            style={{ opacity: pagination.page >= pagination.pages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAlumni;
