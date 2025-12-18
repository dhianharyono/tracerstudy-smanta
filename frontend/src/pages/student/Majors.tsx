import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaSpinner, FaSearch, FaUsers, FaGraduationCap } from 'react-icons/fa';

interface MajorData {
  _id: string;
  count: number;
}

const StudentMajors = () => {
  const navigate = useNavigate();
  const [majors, setMajors] = useState<MajorData[]>([]);
  const [filteredMajors, setFilteredMajors] = useState<MajorData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await axios.get<MajorData[]>('/api/student/majors');
        setMajors(response.data);
        setFilteredMajors(response.data);
      } catch (error) {
        console.error('Error fetching majors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMajors();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = majors.filter((major) =>
      major._id.toLowerCase().includes(lowerTerm)
    );
    setFilteredMajors(filtered);
  }, [searchTerm, majors]);

  // Function to generate deterministic colors based on string
  const getBadgeColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in'>
      {/* Header Section */}
      <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-[color:var(--text-primary)] sm:text-3xl'>
            Jurusan & Program Studi
          </h1>
          <p className='mt-1 text-sm text-[color:var(--text-secondary)]'>
            Eksplorasi sebaran alumni berdasarkan jurusan
          </p>
        </div>

        {/* Search Control */}
        <div className='flex items-center bg-[color:var(--bg-card)] p-2 rounded-xl shadow-sm border border-[color:var(--border-color)]'>
          <div className='relative w-full md:w-auto'>
            <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Cari Jurusan...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full sm:w-64 rounded-lg bg-[color:var(--bg-tertiary)] py-2 pl-10 pr-4 text-sm outline-none ring-1 ring-transparent focus:ring-[var(--primary)] transition-all'
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {filteredMajors.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-[color:var(--bg-card)] p-12 text-center dark:border-gray-700'>
          <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
            <FaBook className='text-4xl text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-[color:var(--text-primary)]'>
            Tidak ditemukan
          </h3>
          <p className='text-gray-500'>
            Belum ada data jurusan yang sesuai dengan pencarian Anda.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredMajors.map((major, index) => (
            <div
              key={index}
              onClick={() => {
                navigate(
                  `/student/alumni?major=${encodeURIComponent(major._id)}`
                );
              }}
              className='group relative cursor-pointer overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--primary-light)]'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className={`rounded-lg p-3 ${getBadgeColor(major._id)} transition-colors duration-300`}>
                  <FaGraduationCap className='text-xl' />
                </div>
              </div>

              <div className='mb-4 min-h-[3.5rem]'>
                <h3 className='line-clamp-2 text-lg font-semibold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors'>
                  {major._id}
                </h3>
              </div>

              <div className='flex items-center justify-between border-t border-[color:var(--border-color)] pt-4'>
                <div className='flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)]'>
                  <FaUsers className='text-gray-400 group-hover:text-[var(--primary-light)] transition-colors' />
                  <span>Total Alumni</span>
                </div>
                <span className='text-lg font-bold text-[var(--primary)]'>
                  {major.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMajors;
