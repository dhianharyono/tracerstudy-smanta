import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BsInstagram } from 'react-icons/bs';

const StudentAlumni = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [alumni, setAlumni] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    university: searchParams.get('university') || '',
    graduationYear: searchParams.get('graduationYear') || '',
    major: searchParams.get('major') || '',
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

    setFilters({
      university,
      graduationYear,
      major,
    });
  }, [searchParams]);

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
    if (newFilters.university) params.set('university', newFilters.university);
    if (newFilters.major) params.set('major', newFilters.major);
    if (newFilters.graduationYear)
      params.set('graduationYear', newFilters.graduationYear);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({ university: '', graduationYear: '', major: '' });
    setPagination({ ...pagination, page: 1 });
    setSearchParams({});
  };

  const renderFilter = () => {
    return (
      <div className='card mb-6 max-w-sm md:max-w-md lg:max-w-full'>
        <h2 className='text-xl font-semibold mb-4'>Filter</h2>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-1 lg:gap-5'>
          <div className='form-group'>
            <label>Universitas</label>
            <select
              value={filters.university}
              onChange={(e) => handleFilterChange('university', e.target.value)}
              className='w-full'
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
              className='w-full'
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
              className='w-full'
            >
              <option value=''>Semua Jurusan</option>
              {filterOptions.majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
          <div className='form-group flex items-end'>
            <button
              onClick={handleClearFilters}
              className='btn btn-secondary w-full'
              type='button'
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    return (
      <div className='card mb-6 max-w-sm md:max-w-md lg:max-w-full'>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Tahun Lulus</th>
                <th>Universitas</th>
                <th>Jurusan</th>
                <th>Pekerjaan</th>
                <th>Tempat Kerja</th>
                <th>IG</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((alum) => (
                <tr key={alum._id}>
                  <td>{alum.profile?.fullName || '-'}</td>
                  <td>{alum.profile?.graduationYear || '-'}</td>
                  <td>{alum.university?.name || '-'}</td>
                  <td>{alum.university?.major || '-'}</td>
                  <td>{alum.job?.position || '-'}</td>
                  <td>{alum.job?.institution || '-'}</td>
                  <td>
                    {alum.socialMedia?.instagram ? (
                      <a
                        href={`mailto:${alum.socialMedia?.instagram}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <div className='flex items-center'>
                          <BsInstagram size={15} />
                        </div>
                      </a>
                    ) : (
                      '-'
                    )}
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
            style={{
              opacity: pagination.page === 1 ? 0.5 : 1,
              cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
            }}
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
            style={{
              opacity: pagination.page >= pagination.pages ? 0.5 : 1,
              cursor:
                pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
            }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className='loading'>Loading...</div>;
  }

  return (
    <div>
      <div className='page-header'>
        <h1 className='page-title'>Data Alumni</h1>
      </div>
      {renderFilter()}
      {renderTable()}
    </div>
  );
};

export default StudentAlumni;
