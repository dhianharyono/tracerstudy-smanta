import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatUniversityType } from '../../utils/helpers';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  FaUniversity,
  FaSearch,
  FaFilter,
  FaUsers,
} from 'react-icons/fa';

interface UniversityAggregate {
  _id: {
    name: string;
    type: string;
  };
  count: number;
}

const StudentUniversities = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<UniversityAggregate[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    UniversityAggregate[]
  >([]);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniversities();
  }, [filterType]);

  useEffect(() => {
    // Client-side search filtering
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = universities.filter((uni) =>
      uni._id.name.toLowerCase().includes(lowerTerm)
    );
    setFilteredUniversities(filtered);
  }, [searchTerm, universities]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const url = filterType
        ? `/api/student/universities?type=${filterType}`
        : '/api/student/universities';
      const response = await axios.get<UniversityAggregate[]>(url);
      setUniversities(response.data);
      setFilteredUniversities(response.data);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversities([]);
      setFilteredUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type: string) => {
    const t = type?.toLowerCase();
    if (t === 'negeri')
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (t === 'swasta')
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    if (t === 'kedinasan')
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in'>
      {/* Header Section */}
      <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='text-center md:text-left mb-2'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Perguruan Tinggi
          </h1>
          <p className='text-[color:var(--text-secondary)]'>
            Persebaran Alumni berdasarkan Universitas
          </p>
        </div>

        {/* Controls */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center bg-[color:var(--bg-card)] p-2 rounded-xl shadow-sm border border-[color:var(--border-color)]'>
          <div className='relative group'>
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors' />
            <input
              type='text'
              placeholder='Cari Universitas...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full sm:w-64 rounded-lg bg-[color:var(--bg-tertiary)] py-2 pl-10 pr-4 text-sm outline-none ring-1 ring-transparent focus:ring-[var(--primary)] transition-all'
            />
          </div>
          <div className='h-8 w-[1px] bg-gray-200 dark:bg-gray-700 hidden sm:block'></div>
          <div className='relative'>
            <FaFilter className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='w-full cursor-pointer appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2 pl-10 pr-10 text-sm text-[color:var(--text-primary)] outline-none transition-colors hover:border-[var(--primary)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] sm:w-auto'
            >
              <option
                className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)]'
                value=''
              >
                Semua Jenis
              </option>
              <option
                className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)]'
                value='negeri'
              >
                Negeri
              </option>
              <option
                className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)]'
                value='swasta'
              >
                Swasta
              </option>
              <option
                className='bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)]'
                value='kedinasan'
              >
                Kedinasan
              </option>
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
        </div>
      </div>

      {/* Content Grid */}
      {filteredUniversities.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-[color:var(--bg-card)] p-12 text-center dark:border-gray-700'>
          <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
            <FaUniversity className='text-4xl text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-[color:var(--text-primary)]'>
            Tidak ditemukan
          </h3>
          <p className='text-gray-500'>
            Belum ada data universitas yang sesuai dengan filter Anda.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredUniversities.map((uni, index) => (
            <div
              key={index}
              onClick={() => {
                navigate(
                  `/student/alumni?university=${encodeURIComponent(
                    uni._id.name
                  )}`
                );
              }}
              className='group relative cursor-pointer overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--primary-light)]'
            >
              <div className='flex items-start justify-between'>
                <div className='rounded-lg bg-[var(--primary-light)]/10 p-3 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300'>
                  <FaUniversity className='text-xl' />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${getBadgeColor(
                    uni._id.type
                  )}`}
                >
                  {uni._id.type || 'Umum'}
                </span>
              </div>

              <div className='mt-4'>
                <h3 className='line-clamp-2 text-lg font-semibold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors'>
                  {uni._id.name}
                </h3>
                <p className='mt-1 text-sm text-[color:var(--text-secondary)] line-clamp-1'>
                  {formatUniversityType(uni._id.type)}
                </p>
              </div>

              <div className='mt-5 flex items-center justify-between border-t border-[color:var(--border-color)] pt-3'>
                <div className='flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)]'>
                  <FaUsers className='text-gray-400 group-hover:text-[var(--primary-light)] transition-colors' />
                  <span>Total Alumni</span>
                </div>
                <span className='text-lg font-bold text-[var(--primary)]'>
                  {uni.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentUniversities;
