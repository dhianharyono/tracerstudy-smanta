import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatUniversityType } from '../../utils/helpers';
import { FaUniversity, FaSpinner } from 'react-icons/fa';

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
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniversities();
  }, [filterType]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const url = filterType
        ? `/api/student/universities?type=${filterType}`
        : '/api/student/universities';
      const response = await axios.get<UniversityAggregate[]>(url);
      setUniversities(response.data);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversities([]);
    } finally {
      setLoading(false);
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
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='page-header'>
        <h1 className='text-xl md:text-2xl'>Perguruan Tinggi</h1>
      </div>
      <div className='card'>
        <div className='form-group w-full max-w-xs'>
          <label>Filter berdasarkan jenis:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value=''>Semua</option>
            <option value='negeri'>Negeri</option>
            <option value='swasta'>Swasta</option>
            <option value='kedinasan'>Kedinasan</option>
          </select>
        </div>
      </div>

      <div className='card mt-6'>
        <h2 className='mb-6 text-lg md:text-xl flex items-center gap-3 font-semibold'>
          <FaUniversity />
          <span>Daftar Perguruan Tinggi</span>
        </h2>
        {universities.length === 0 ? (
          <p className='p-10 text-center text-gray-500'>No data available</p>
        ) : (
          <div className='grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {universities.map((uni, index) => (
              <div
                key={index}
                onClick={() => {
                  navigate(
                    `/student/alumni?university=${encodeURIComponent(
                      uni._id.name
                    )}`
                  );
                }}
                className='cursor-pointer rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-4 transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-md hover:border-[#8884d8]'
              >
                <div className='mb-2 flex items-center gap-2'>
                  <FaUniversity className='text-lg text-[var(--primary-light)]' />
                  <h3 className='m-0 text-base font-semibold text-[color:var(--text-primary)]'>
                    {uni._id.name}
                  </h3>
                </div>
                <div className='mb-2 text-xs text-[color:var(--text-secondary)]'>
                  {formatUniversityType(uni._id.type)}
                </div>
                <div className='text-xl font-bold text-[var(--primary-light)]'>
                  {uni.count} Alumni
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentUniversities;
