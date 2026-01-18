import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaSearch, FaUsers } from 'react-icons/fa';

import { useAuth } from '../../contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';
import SmartLoader from '@/components/SmartLoader';

interface MajorData {
  _id: string;
  count: number;
  alumni: {
    id: string;
    name: string;
    university: string;
    graduationYear: number;
  }[];
}

const StudentMajors = () => {
  const { user } = useAuth();
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
      major._id.toLowerCase().includes(lowerTerm),
    );
    setFilteredMajors(filtered);
  }, [searchTerm, majors]);

  if (loading) {
    return <SmartLoader />;
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in'>
      {/* Header Section */}
      <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='text-center md:text-left mb-2'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Jurusan & Program Studi
          </h1>
          <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
            Persebaran Alumni berdasarkan jurusan
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
            <FaBook className='text-lg md:text-4xl text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-[color:var(--text-primary)]'>
            Tidak ditemukan
          </h3>
          <p className='text-gray-500'>
            Belum ada data jurusan yang sesuai dengan pencarian Anda.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredMajors.map((major, index) => (
            <div
              key={index}
              onClick={() => {
                navigate(
                  `/student/alumni?major=${encodeURIComponent(major._id)}`,
                );
              }}
              className='group relative cursor-pointer overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--primary-light)]'
            >
              <div className='mb-4 min-h-[8rem]'>
                <h3 className='line-clamp-4 text-xs md:text-lg font-semibold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors !mb-2'>
                  {major._id}
                </h3>

                {/* Universities List */}
                <div className='flex flex-wrap gap-1.5 mt-2'>
                  {(() => {
                    const uniqueUnivs = Array.from(
                      new Set(major.alumni?.map((a) => a.university)),
                    ).filter(Boolean);
                    return (
                      <>
                        {uniqueUnivs.slice(0, 3).map((univ, i) => (
                          <span
                            key={i}
                            className='text-[7px] md:text-xs px-2 py-0.5 rounded-full bg-blue-50/50 border border-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-400'
                          >
                            {univ}
                          </span>
                        ))}
                        {uniqueUnivs.length > 3 && (
                          <span className='text-[6px] md:text-[10px] text-[color:var(--text-tertiary)] flex items-center ml-0.5'>
                            +{uniqueUnivs.length - 3} lainnya
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className='flex items-center justify-between border-t border-[color:var(--border-color)] pt-4'>
                <div className='flex items-center gap-2 text-xs md:text-sm font-medium text-[color:var(--text-secondary)]'>
                  <FaUsers className='text-gray-400 group-hover:text-[var(--primary-light)] transition-colors' />
                  <span>Total Alumni</span>
                </div>
                <span className='text-sm md:text-lg font-bold text-[var(--primary)]'>
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
