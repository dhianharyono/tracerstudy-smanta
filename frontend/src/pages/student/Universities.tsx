import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createPortal } from 'react-dom';
import {
  FaUniversity,
  FaSearch,
  FaFilter,
  FaUsers,
  FaGraduationCap,
  FaBook,
  FaTimes,
  FaArrowRight,
} from 'react-icons/fa';

import { useAuth } from '../../contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';
import SmartLoader from '@/components/SmartLoader';

interface UniversityAggregate {
  _id: {
    name: string;
    type: string;
  };
  count: number;
  alumni: {
    id: string;
    name: string;
    graduationYear: number;
    major: string;
  }[];
}

interface UniversityDetailModalProps {
  university: UniversityAggregate | null;
  isOpen: boolean;
  onClose: () => void;
  onViewAll: (universityName: string) => void;
  getBadgeColor: (type: string) => string;
}

const UniversityDetailModal = ({
  university,
  isOpen,
  onClose,
  onViewAll,
}: UniversityDetailModalProps) => {
  if (!isOpen || !university) return null;

  // Calculate top majors
  const majorStats = university.alumni.reduce((acc: any, curr) => {
    acc[curr.major] = (acc[curr.major] || 0) + 1;
    return acc;
  }, {});

  const topMajors = Object.entries(majorStats)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5);

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'>
      <div
        className='relative w-full max-w-2xl bg-[color:var(--bg-card)] rounded-2xl shadow-xl border border-[color:var(--border-color)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='p-6 border-b border-[color:var(--border-color)] flex justify-between items-start bg-[color:var(--bg-tertiary)]/30'>
          <div className='flex gap-1 items-center'>
            <div className='h-10 w-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0'>
              <FaUniversity className='text-lg md:text-xl text-[var(--primary)]' />
            </div>
            <div>
              {/* <div className='flex items-center gap-2 mb-2 text-sm'>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeColor(
                    university._id.type,
                  )}`}
                >
                  {university._id.type
                    ? university._id.type.charAt(0).toUpperCase() +
                    university._id.type.slice(1)
                    : 'Umum'}
                </span>
              </div> */}
              <div className='text-sm md:text-xl font-bold text-[color:var(--text-primary)] leading-tight'>
                {university._id.name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-[color:var(--bg-tertiary)] rounded-full transition-colors text-[color:var(--text-secondary)]'
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className='p-6 overflow-y-auto max-h-[70vh]'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Left Column: Stats */}
            <div className='space-y-6'>
              <div className='bg-[color:var(--bg-tertiary)]/50 rounded-xl p-4 border border-[color:var(--border-color)]'>
                <div className='flex items-center gap-2 text-[color:var(--text-secondary)] mb-2'>
                  <FaUsers />
                  <span className='font-medium text-sm md:text-xl'>
                    Total Alumni
                  </span>
                </div>
                <div className='text-2xl md:text-3xl font-bold text-[var(--primary)]'>
                  {university.count}
                </div>
                <div className='text-xs text-[color:var(--text-secondary)] mt-1'>
                  Terdaftar di sistem
                </div>
              </div>

              <div>
                <h3 className='font-semibold text-[color:var(--text-primary)] flex items-center gap-2'>
                  <FaBook className='text-[var(--primary)]' />
                  <div className='flex flex-col ml-1'>
                    <p className='text-sm md:text-xl'>Jurusan Terpopuler</p>
                    <p className='text-[10px] md:text-[10px] text-[color:var(--text-secondary)]'>
                      Berdasarkan jumlah alumni yang terdaftar
                    </p>
                  </div>
                </h3>
                <div className='space-y-1'>
                  {topMajors.map(([major, count]: any, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between text-sm p-2 rounded-lg hover:bg-[color:var(--bg-tertiary)] transition-colors'
                    >
                      <span
                        className='text-[color:var(--text-primary)] truncate max-w-[180px] text-xs md:text-sm'
                        title={major}
                      >
                        {major}
                      </span>
                      <span className='font-medium bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full text-xs'>
                        {count} Alumni
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Recent Alumni */}
            <div>
              <h3 className='font-semibold text-[color:var(--text-primary)] mb-4 flex items-center gap-2'>
                <FaGraduationCap className='text-[var(--primary)]' />
                <p className='text-sm md:text-xl'>Alumni Terbaru</p>
              </h3>
              <div className='space-y-3'>
                {university.alumni.slice(0, 5).map((alum, idx) => (
                  <div
                    key={idx}
                    className='flex items-start gap-3 p-3 rounded-xl border border-[color:var(--border-color)] hover:border-[var(--primary)] transition-colors bg-[color:var(--bg-card)]'
                  >
                    <div className='h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-gray-500 shrink-0'>
                      {alum.name.charAt(0)}
                    </div>
                    <div className='min-w-0'>
                      <div className='font-medium text-sm text-[color:var(--text-primary)] truncate'>
                        {alum.name}
                      </div>
                      <div className='text-xs text-[color:var(--text-secondary)] truncate'>
                        {alum.major}
                      </div>
                      <div className='text-[10px] text-[color:var(--text-secondary)] mt-0.5 inline-block bg-gray-100 dark:bg-gray-800 rounded'>
                        Lulus {alum.graduationYear}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/30 flex justify-end'>
          <button
            onClick={() => onViewAll(university._id.name)}
            className='flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-xs md:text-sm text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-medium shadow-md shadow-[var(--primary)]/20 active:scale-95'
          >
            Lihat Semua Alumni <FaArrowRight />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const StudentUniversities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<UniversityAggregate[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    UniversityAggregate[]
  >([]);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedUni, setSelectedUni] = useState<UniversityAggregate | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, [filterType]);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = universities.filter((uni) =>
      uni._id?.name?.toLowerCase().includes(lowerTerm),
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
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    if (t === 'swasta')
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    if (t === 'kedinasan')
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleUniversityClick = (uni: UniversityAggregate) => {
    setSelectedUni(uni);
    setIsModalOpen(true);
  };

  const handleViewAllAlumni = (uniName: string) => {
    navigate(`/student/alumni?university=${encodeURIComponent(uniName)}`);
  };

  if (loading) {
    return <SmartLoader />;
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in relative'>
      {/* Header Section */}
      <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='text-center md:text-left mb-2'>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Perguruan Tinggi
          </h1>
          <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
            Persebaran alumni berdasarkan universitas, klik untuk melihat detailnya
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
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredUniversities.map((uni, index) => (
            <div
              key={index}
              onClick={() => handleUniversityClick(uni)}
              className='group relative cursor-pointer overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--primary-light)]'
            >
              <div className='flex items-start justify-between'>
                <div className='rounded-lg bg-[var(--primary)] p-3 text-[var(--primary)]/10 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300'>
                  <FaUniversity className='text-sm md:text-xl' />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${getBadgeColor(
                    uni._id.type,
                  )}`}
                >
                  {uni._id.type
                    ? uni._id.type.charAt(0).toUpperCase() +
                    uni._id.type.slice(1)
                    : 'Umum'}
                </span>
              </div>

              <div className='mt-4 mb-4 min-h-[4rem]'>
                <h3 className='line-clamp-3 text-xs md:text-lg font-semibold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors'>
                  {uni._id.name}
                </h3>
              </div>

              <div className='flex items-center justify-between border-t border-[color:var(--border-color)] pt-4'>
                <div className='flex items-center gap-2 text-xs md:text-sm font-medium text-[color:var(--text-secondary)]'>
                  <FaUsers className='text-gray-400 group-hover:text-[var(--primary-light)] transition-colors' />
                  <span>Total Alumni</span>
                </div>
                <span className='text-sm md:text-lg font-bold text-[var(--primary)]'>
                  {uni.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* University Detail Modal */}
      <UniversityDetailModal
        university={selectedUni}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onViewAll={handleViewAllAlumni}
        getBadgeColor={getBadgeColor}
      />
    </div>
  );
};

export default StudentUniversities;
