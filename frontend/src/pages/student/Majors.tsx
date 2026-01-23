import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createPortal } from 'react-dom';
import {
  FaBook,
  FaSearch,
  FaUsers,
  FaGraduationCap,
  FaTimes,
  FaArrowRight,
  FaChartPie,
} from 'react-icons/fa';

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

interface MajorDetailModalProps {
  major: MajorData | null;
  isOpen: boolean;
  onClose: () => void;
  onViewAll: (majorName: string) => void;
}

const MajorDetailModal = ({
  major,
  isOpen,
  onClose,
  onViewAll,
}: MajorDetailModalProps) => {
  if (!isOpen || !major) return null;

  // Calculate top universities
  const universityStats = major.alumni.reduce((acc: any, curr) => {
    if (curr.university) {
      acc[curr.university] = (acc[curr.university] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedUniversities = Object.entries(universityStats).sort(
    ([, a]: any, [, b]: any) => b - a,
  );

  const top3Universities = sortedUniversities.slice(0, 3);
  const otherUniversities = sortedUniversities.slice(3);

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200'>
      <div
        className='relative w-full max-w-3xl bg-[color:var(--bg-card)] rounded-2xl shadow-xl border border-[color:var(--border-color)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with background pattern/color */}
        <div className='relative overflow-hidden bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white p-8 mb-0'>
          <div className='absolute top-0 right-0 -mt-4 -mr-4 text-white/10'>
            <FaBook size={150} />
          </div>

          <div className='relative z-10 flex justify-between items-start'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <span className='bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/30'>
                  Program Studi
                </span>
              </div>
              <h2 className='text-sm md:text-2xl font-bold leading-tight mb-2'>
                {major._id}
              </h2>
              <div className='flex items-center gap-2 text-white/80 mb-10 md:mb-0'>
                <FaUsers />
                <span className='font-medium text-xs md:text-base'>{major.count} Alumni Terdaftar</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md'
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className='p-6 overflow-y-auto bg-[color:var(--bg-secondary)]/30 flex-1'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

            {/* Main Content: University Distribution */}
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-[color:var(--bg-card)] p-5 rounded-xl border border-[color:var(--border-color)] shadow-sm'>
                <h3 className='font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2'>
                  <FaChartPie className='text-[var(--primary)]' /> Sebaran Universitas
                </h3>

                {/* Top 3 Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6'>
                  {top3Universities.map(([univ, count]: any, idx) => (
                    <div key={idx} className='bg-[color:var(--bg-tertiary)]/50 p-4 rounded-xl border border-[color:var(--border-color)] relative overflow-hidden'>
                      <div className='absolute right-0 top-0 p-2 text-[color:var(--text-tertiary)] opacity-10 font-bold text-5xl'>
                        #{idx + 1}
                      </div>
                      <div className='relative z-10'>
                        <div className='text-2xl font-bold text-[var(--primary)] mb-1'>{count}</div>
                        <div className='text-xs font-medium text-[color:var(--text-primary)] line-clamp-2 h-8 leading-tight' title={univ}>
                          {univ}
                        </div>
                        <div className='mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-[var(--primary)] rounded-full'
                            style={{ width: `${(count / major.count) * 100}%` }}
                          ></div>
                        </div>
                        <div className='mt-1 text-[10px] text-[color:var(--text-secondary)] text-right'>
                          {Math.round((count / major.count) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* List of others */}
                {otherUniversities.length > 0 && (
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium text-[color:var(--text-secondary)]'>Universitas Lainnya</h4>
                    <div className='max-h-[200px] overflow-y-auto pr-2 space-y-2'>
                      {otherUniversities.map(([univ, count]: any, idx) => (
                        <div key={idx} className='flex items-center justify-between p-3 bg-[color:var(--bg-tertiary)]/30 rounded-lg text-sm'>
                          <span className='truncate flex-1 pr-4' title={univ}>{univ}</span>
                          <span className='font-semibold text-[color:var(--text-primary)]'>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Recent Alumni & Action */}
            <div className='space-y-6'>
              <div className='bg-[color:var(--bg-card)] p-5 rounded-xl border border-[color:var(--border-color)] shadow-sm h-full flex flex-col'>
                <h3 className='font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2'>
                  <FaGraduationCap className='text-[var(--primary)]' /> Alumni Terbaru
                </h3>

                <div className='space-y-4 flex-1'>
                  {major.alumni.slice(0, 5).map((alum, idx) => (
                    <div key={idx} className='flex gap-3 items-start'>
                      <div className='w-2 h-2 mt-2 rounded-full bg-[var(--primary)] shrink-0'></div>
                      <div className='min-w-0'>
                        <div className='font-medium text-sm text-[color:var(--text-primary)] truncate'>
                          {alum.name}
                        </div>
                        <div className='text-xs text-[color:var(--text-secondary)] line-clamp-1' title={alum.university}>
                          {alum.university}
                        </div>
                        <div className='text-[10px] text-[color:var(--text-tertiary)]'>
                          Lulus {alum.graduationYear}
                        </div>
                      </div>
                    </div>
                  ))}

                  {major.alumni.length > 5 && (
                    <div className='pt-2 text-center text-xs text-[color:var(--text-secondary)] italic'>
                      +{major.alumni.length - 5} alumni lainnya
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onViewAll(major._id)}
                  className='mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-medium shadow-md shadow-[var(--primary)]/20 active:scale-95 text-sm'
                >
                  Lihat Semua Data <FaArrowRight />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const StudentMajors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [majors, setMajors] = useState<MajorData[]>([]);
  const [filteredMajors, setFilteredMajors] = useState<MajorData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedMajor, setSelectedMajor] = useState<MajorData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleMajorClick = (major: MajorData) => {
    setSelectedMajor(major);
    setIsModalOpen(true);
  };

  const handleViewAllAlumni = (majorName: string) => {
    navigate(`/student/alumni?major=${encodeURIComponent(majorName)}`);
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
              onClick={() => handleMajorClick(major)}
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

      {/* Major Detail Modal */}
      <MajorDetailModal
        major={selectedMajor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onViewAll={handleViewAllAlumni}
      />
    </div>
  );
};


export default StudentMajors;
