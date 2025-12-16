import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaSpinner } from 'react-icons/fa';

interface MajorData {
  _id: string;
  count: number;
}

const StudentMajors = () => {
  const navigate = useNavigate();
  const [majors, setMajors] = useState<MajorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await axios.get<MajorData[]>('/api/student/majors');
        setMajors(response.data);
      } catch (error) {
        console.error('Error fetching majors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMajors();
  }, []);

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
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='page-header'>
        <h1 className='text-xl md:text-2xl'>Jurusan</h1>
      </div>
      <div className='card'>
        <h2 className='mb-6 text-lg md:text-xl flex items-center gap-3 font-semibold'>
          <FaBook />
          <span>Daftar Jurusan</span>
        </h2>
        {majors.length === 0 ? (
          <p className='p-10 text-center text-gray-500'>No data available</p>
        ) : (
          <div className='grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {majors.map((major, index) => (
              <div
                key={index}
                onClick={() => {
                  navigate(
                    `/student/alumni?major=${encodeURIComponent(major._id)}`
                  );
                }}
                className='cursor-pointer rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-4 transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-md hover:border-[color:var(--success)]'
              >
                <div className='mb-2 flex items-center gap-2'>
                  <FaBook className='text-lg text-[var(--primary-light)]' />
                  <h3 className='m-0 text-base font-semibold text-[color:var(--text-primary)]'>
                    {major._id}
                  </h3>
                </div>
                <div className='text-xl font-bold text-[var(--primary-light)]'>
                  {major.count} Alumni
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMajors;
