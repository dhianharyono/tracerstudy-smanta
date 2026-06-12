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
  FaTrophy,
  FaBuilding,
} from 'react-icons/fa';

import { useAuth } from '../../contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';
import { isUniversityIncomplete, isNameIncomplete } from '@/utils/validation';
import SmartLoader from '@/components/SmartLoader';
import Card from '@/components/common/Card';

interface MajorData {
  _id: string;
  count: number;
  alumni: {
    id: string;
    name: string;
    university: string;
    universityType?: string;
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
        className='relative w-full max-w-3xl bg-[color:var(--bg-card)] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]'
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
                        <div className='text-xs font-medium text-[color:var(--text-primary)] line-clamp-4 h-8 leading-tight' title={univ}>
                          {univ}
                        </div>
                        <div className='mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden'>
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
                        <div key={idx} className='flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-lg text-sm'>
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

  const topMajor = filteredMajors.length > 0 ? filteredMajors[0] : null;

  const ptnMajorsCount = majors.filter((m) =>
    m.alumni.some((a) => a.universityType === 'negeri'),
  ).length;
  const ptsMajorsCount = majors.filter((m) =>
    m.alumni.some((a) => !a.universityType || a.universityType === 'swasta' || a.universityType === ''),
  ).length;
  const kedinasanMajorsCount = majors.filter((m) =>
    m.alumni.some((a) => a.universityType === 'kedinasan'),
  ).length;

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
    navigate(`/${user?.role}/alumni?major=${encodeURIComponent(majorName)}`);
  };


  if (loading) {
    return <SmartLoader />;
  }

  if (user?.role === 'school') {
    // School monitoring user does not need to complete profile or questionnaire
  } else if (user?.role === 'alumni') {
    const hasUniversityData = !!(user?.university?.name);
    if (user?.questionnaireCompleted === false && !hasUniversityData) {
      return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
    }
    if (isNameIncomplete(user?.profile)) {
      return <RestrictedAccess type='name_incomplete' role='alumni' />;
    }
    if (isUniversityIncomplete(user)) {
      return <RestrictedAccess type='university_incomplete' role='alumni' />;
    }
  } else {
    if (!isStudentProfileComplete(user)) {
      return <RestrictedAccess type='profile_incomplete' role='student' />;
    }
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in relative space-y-6'>
      {/* Header Section */}
      <div className='mb-6'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Jurusan & Program Studi
        </h1>
        <p className='text-[color:var(--text-secondary)] text-sm md:text-base mt-1'>
          Persebaran Alumni berdasarkan jurusan dan statistikanya.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        <Card className='bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <FaBook size={20} />
            </div>
            <div>
              <p className='text-blue-100 text-[10px] font-bold uppercase tracking-wider'>
                Total Jurusan Terdata
              </p>
              <h3 className='text-2xl font-black !text-white'>{majors.length}</h3>
            </div>
          </div>
        </Card>

        <Card className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-amber-500/10 text-amber-500 rounded-xl'>
              <FaBuilding size={20} />
            </div>
            <div>
              <p className='text-[color:var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider'>
                Jurusan di PTN
              </p>
              <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
                {ptnMajorsCount}
              </h3>
            </div>
          </div>
        </Card>

        <Card className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-pink-500/10 text-pink-500 rounded-xl'>
              <FaBuilding size={20} />
            </div>
            <div>
              <p className='text-[color:var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider'>
                Jurusan di PTS
              </p>
              <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
                {ptsMajorsCount}
              </h3>
            </div>
          </div>
        </Card>

        <Card className='bg-[color:var(--bg-card)] border border-[color:var(--border-color)] shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-emerald-500/10 text-emerald-500 rounded-xl'>
              <FaGraduationCap size={20} />
            </div>
            <div>
              <p className='text-[color:var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider'>
                Jurusan Kedinasan
              </p>
              <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
                {kedinasanMajorsCount}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {topMajor && (
        <Card className='bg-gradient-to-r from-amber-500/5 to-transparent border-l-4 border-l-amber-500 mb-8'>
          <div className='flex items-center gap-6'>
            <div className='hidden sm:flex p-5 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30'>
              <FaTrophy size={28} />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <FaTrophy className='text-amber-500 sm:hidden' />
                <p className='text-amber-600 text-xs font-bold uppercase tracking-widest'>
                  Jurusan Terfavorit Alumni
                </p>
              </div>
              <h3
                className='text-xl md:text-2xl font-black text-[color:var(--text-primary)] truncate'
                title={topMajor._id}
              >
                {topMajor._id}
              </h3>
              <div className='flex items-center gap-3 mt-2'>
                <span className='text-sm font-bold text-[color:var(--text-secondary)]'>
                  <span className='text-amber-500'>{topMajor.count}</span>{' '}
                  Alumni Bergabung
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search and List */}
      <Card className='min-h-[500px]'>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <h2 className='text-xl font-bold text-[color:var(--text-primary)]'>
              Peringkat Jurusan & Program Studi
            </h2>

            <div className='relative w-full md:w-72 shrink-0'>
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
              <input
                type='text'
                placeholder='Cari Jurusan...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)] transition-colors'
              />
            </div>
          </div>
        </div>

        {filteredMajors.length === 0 ? (
          <div className='text-center py-16 px-4 bg-[color:var(--bg-tertiary)] rounded-2xl border-2 border-dashed border-[color:var(--border-color)] text-[color:var(--text-tertiary)]'>
            <FaBook size={48} className='mx-auto mb-4 opacity-20' />
            <p>Tidak ada jurusan yang ditemukan.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredMajors.map((major, idx) => (
              <div
                key={idx}
                onClick={() => handleMajorClick(major)}
                className='flex flex-col justify-between p-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] hover:border-[var(--primary)] hover:shadow-md transition-all group cursor-pointer'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3 w-full pr-2'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-bold text-sm shrink-0 uppercase'>
                      #{idx + 1}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h4
                        className='font-bold text-[color:var(--text-primary)] text-sm md:text-base leading-tight line-clamp-2'
                        title={major._id}
                      >
                        {major._id}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Universities list summary */}
                <div className='flex flex-wrap gap-1.5 mb-4'>
                  {(() => {
                    const uniqueUnivs = Array.from(
                      new Set(major.alumni?.map((a) => a.university)),
                    ).filter(Boolean);
                    return (
                      <>
                        {uniqueUnivs.slice(0, 2).map((univ, i) => (
                          <span
                            key={i}
                            className='text-[10px] px-2.5 py-0.5 rounded bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-[color:var(--text-secondary)] font-medium truncate max-w-[150px]'
                            title={univ}
                          >
                            {univ}
                          </span>
                        ))}
                        {uniqueUnivs.length > 2 && (
                          <span className='text-[10px] text-[color:var(--text-tertiary)] flex items-center ml-0.5'>
                            +{uniqueUnivs.length - 2} kampus
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className='pt-4 border-t border-[color:var(--border-color)] flex justify-between items-end'>
                  <div>
                    <span className='text-2xl font-black text-[var(--primary)] group-hover:scale-110 transition-transform inline-block'>
                      {major.count}
                    </span>
                    <span className='text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider ml-2'>
                      Alumni
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

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
