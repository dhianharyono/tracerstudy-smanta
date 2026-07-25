import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaCalendarAlt,
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
    <AnimatePresence>
      <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='absolute inset-0 bg-slate-900/60 backdrop-blur-sm'
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className='relative w-full max-w-3xl bg-[color:var(--bg-card)] rounded-[2rem] shadow-2xl overflow-hidden border border-[color:var(--border-color)] flex flex-col max-h-[90vh] z-10'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient pattern */}
          <div className='relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shrink-0'>
            <div className='absolute top-0 right-0 -mt-6 -mr-6 text-white/10 pointer-events-none'>
              <FaBook size={180} />
            </div>

            <div className='relative z-10 flex justify-between items-start'>
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/30 tracking-wide'>
                    Program Studi
                  </span>
                </div>
                <h2 className='text-lg sm:text-2xl font-extrabold leading-tight mb-2 text-white'>
                  {major._id}
                </h2>
                <div className='flex items-center gap-2 text-blue-100 font-medium text-xs sm:text-sm'>
                  <FaUsers className='text-blue-200' />
                  <span>{major.count} Alumni Terdaftar</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className='p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-md hover:scale-105 active:scale-95'
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className='p-6 overflow-y-auto bg-[color:var(--bg-primary)]/50 flex-1 space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Main Content: University Distribution */}
              <div className='lg:col-span-2 space-y-6'>
                <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm'>
                  <h3 className='font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2 text-sm sm:text-base'>
                    <FaChartPie className='text-blue-600' /> Sebaran Universitas
                  </h3>

                  {/* Top 3 Cards */}
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6'>
                    {top3Universities.map(([univ, count]: any, idx) => (
                      <div
                        key={idx}
                        className='bg-[color:var(--bg-tertiary)]/70 p-4 rounded-xl border border-[color:var(--border-color)] relative overflow-hidden group hover:border-blue-500/40 transition-all'
                      >
                        <div className='absolute right-2 top-1 text-[color:var(--text-tertiary)] opacity-15 font-black text-4xl select-none'>
                          #{idx + 1}
                        </div>
                        <div className='relative z-10'>
                          <div className='text-2xl font-extrabold text-blue-600 mb-1'>
                            {count}
                          </div>
                          <div
                            className='text-xs font-semibold text-[color:var(--text-primary)] line-clamp-2 h-8 leading-tight'
                            title={univ}
                          >
                            {univ}
                          </div>
                          <div className='mt-3 h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden'>
                            <div
                              className='h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full'
                              style={{ width: `${(count / major.count) * 100}%` }}
                            ></div>
                          </div>
                          <div className='mt-1 text-[10px] font-semibold text-[color:var(--text-tertiary)] text-right'>
                            {Math.round((count / major.count) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* List of others */}
                  {otherUniversities.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='text-xs font-bold uppercase tracking-wider text-[color:var(--text-tertiary)] mb-2'>
                        Universitas Lainnya
                      </h4>
                      <div className='max-h-[180px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin'>
                        {otherUniversities.map(([univ, count]: any, idx) => (
                          <div
                            key={idx}
                            className='flex items-center justify-between p-2.5 bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)] rounded-xl text-xs font-medium'
                          >
                            <span className='truncate flex-1 pr-4 text-[color:var(--text-primary)]' title={univ}>
                              {univ}
                            </span>
                            <span className='font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100'>
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Recent Alumni & Action */}
              <div className='space-y-6'>
                <div className='bg-[color:var(--bg-card)] p-5 rounded-2xl border border-[color:var(--border-color)] shadow-sm h-full flex flex-col justify-between'>
                  <div>
                    <h3 className='font-bold text-[color:var(--text-primary)] mb-4 flex items-center gap-2 text-sm sm:text-base'>
                      <FaGraduationCap className='text-blue-600' /> Alumni Terbaru
                    </h3>

                    <div className='space-y-3'>
                      {major.alumni.slice(0, 5).map((alum, idx) => (
                        <div key={idx} className='flex gap-3 items-start p-2 rounded-xl hover:bg-[color:var(--bg-tertiary)]/60 transition-colors'>
                          <div className='w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0 shadow-sm shadow-blue-500/50'></div>
                          <div className='min-w-0 flex-1'>
                            <div className='font-bold text-xs text-[color:var(--text-primary)] truncate'>
                              {alum.name}
                            </div>
                            <div className='text-[11px] text-[color:var(--text-secondary)] truncate' title={alum.university}>
                              {alum.university}
                            </div>
                            <div className='text-[10px] text-[color:var(--text-tertiary)] mt-0.5 font-medium'>
                              Lulus {alum.graduationYear}
                            </div>
                          </div>
                        </div>
                      ))}

                      {major.alumni.length > 5 && (
                        <div className='pt-1 text-center text-xs text-[color:var(--text-tertiary)] italic'>
                          +{major.alumni.length - 5} alumni lainnya
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onViewAll(major._id)}
                    className='mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-bold active:scale-95 text-xs sm:text-sm'
                  >
                    Lihat Semua Alumni <FaArrowRight className='text-xs' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

const StudentMajors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [majors, setMajors] = useState<MajorData[]>([]);
  const [filteredMajors, setFilteredMajors] = useState<MajorData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
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
    fetchMajors();
  }, [selectedYear]);

  const fetchMajors = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedYear) {
        params.graduationYear = selectedYear;
      }
      const response = await axios.get<MajorData[]>('/api/student/majors', { params });
      setMajors(response.data);
      setFilteredMajors(response.data);

      if (availableYears.length === 0) {
        const currentYear = new Date().getFullYear();
        const defaultYears = Array.from({ length: 15 }, (_, i) => currentYear - i);
        const extractedYears = new Set<number>();
        response.data.forEach((m) => {
          m.alumni?.forEach((alum) => {
            if (alum.graduationYear) extractedYears.add(Number(alum.graduationYear));
          });
        });
        const combined = Array.from(new Set([...extractedYears, ...defaultYears])).sort(
          (a, b) => b - a,
        );
        setAvailableYears(combined);
      }
    } catch (error) {
      console.error('Error fetching majors:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (user?.role === 'admin' || user?.role === 'school') {
    // Admin and school monitoring user do not need to complete profile or questionnaire
  } else if (user?.role === 'alumni') {
    if (!user?.questionnaireCompleted) {
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
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Jurusan & Program Studi
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base mt-1'>
            Persebaran Alumni berdasarkan jurusan dan statistikanya.
          </p>
        </div>

        {/* Filter Tahun */}
        <div className='flex items-center gap-2.5 self-start sm:self-auto shrink-0 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] px-3.5 py-2 rounded-2xl shadow-sm'>
          <FaCalendarAlt className='text-blue-500 text-sm' />
          <span className='text-xs sm:text-sm font-semibold text-[color:var(--text-secondary)] whitespace-nowrap'>
            Tahun:
          </span>
          <select
            id='major-year-filter'
            aria-label='Filter Berdasarkan Tahun'
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className='bg-transparent text-[color:var(--text-primary)] text-xs sm:text-sm font-medium focus:outline-none cursor-pointer pr-1'
          >
            <option value='' className='bg-[color:var(--bg-card)] text-[color:var(--text-primary)]'>
              Semua Tahun
            </option>
            {availableYears.map((year) => (
              <option
                key={year}
                value={year}
                className='bg-[color:var(--bg-card)] text-[color:var(--text-primary)]'
              >
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {topMajor && (
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 border border-blue-800/40 p-5 sm:p-7 shadow-xl shadow-blue-950/20 mb-6'>
          <div className='absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none' />
          <div className='absolute -left-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none' />

          <div className='relative z-10 flex items-center gap-4 sm:gap-6'>
            <div className='flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/25 shrink-0 border border-amber-300/40'>
              <FaTrophy className='text-xl sm:text-2xl text-amber-950' />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1.5'>
                <span className='inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider backdrop-blur-md'>
                  ✨ Jurusan Terfavorit Alumni
                </span>
              </div>

              <h3
                className='text-lg sm:text-2xl font-black text-white truncate tracking-tight'
                title={topMajor._id}
              >
                {topMajor._id}
              </h3>

              <div className='flex items-center gap-3 mt-2'>
                <span className='text-xs sm:text-sm font-medium text-blue-100/90 flex items-center gap-1.5'>
                  <span className='text-amber-400 font-extrabold text-base sm:text-xl'>{topMajor.count}</span>
                  <span>Alumni Bergabung</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6'>
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg shadow-blue-500/20'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100 text-[10px] font-extrabold uppercase tracking-widest mb-1'>
                Total Jurusan
              </p>
              <h3 className='text-3xl font-extrabold text-white tracking-tight'>{majors.length}</h3>
            </div>
            <div className='p-3.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 text-white shadow-inner'>
              <FaBook size={22} />
            </div>
          </div>
        </div>

        <div className='relative overflow-hidden rounded-2xl bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-5 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[color:var(--text-tertiary)] text-[10px] font-extrabold uppercase tracking-widest mb-1'>
                Jurusan di PTN
              </p>
              <h3 className='text-3xl font-extrabold text-emerald-600 tracking-tight'>
                {ptnMajorsCount}
              </h3>
            </div>
            <div className='p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100'>
              <FaBuilding size={22} />
            </div>
          </div>
        </div>

        <div className='relative overflow-hidden rounded-2xl bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-5 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[color:var(--text-tertiary)] text-[10px] font-extrabold uppercase tracking-widest mb-1'>
                Jurusan di PTS
              </p>
              <h3 className='text-3xl font-extrabold text-indigo-600 tracking-tight'>
                {ptsMajorsCount}
              </h3>
            </div>
            <div className='p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100'>
              <FaBuilding size={22} />
            </div>
          </div>
        </div>

        <div className='relative overflow-hidden rounded-2xl bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-5 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[color:var(--text-tertiary)] text-[10px] font-extrabold uppercase tracking-widest mb-1'>
                Jurusan Kedinasan
              </p>
              <h3 className='text-3xl font-extrabold text-amber-600 tracking-tight'>
                {kedinasanMajorsCount}
              </h3>
            </div>
            <div className='p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100'>
              <FaGraduationCap size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and List */}
      <Card className='min-h-[500px] border border-[color:var(--border-color)] shadow-sm rounded-3xl p-6 sm:p-8'>
        <div className='flex flex-col gap-4 mb-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <h2 className='text-lg sm:text-xl font-extrabold text-[color:var(--text-primary)] tracking-tight'>
                Peringkat Jurusan & Program Studi
              </h2>
              <p className='text-xs text-[color:var(--text-tertiary)] mt-0.5'>
                Klik pada kartu jurusan untuk melihat sebaran universitas & daftar alumni.
              </p>
            </div>

            <div className='relative w-full md:w-80 shrink-0'>
              <FaSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm' />
              <input
                type='text'
                placeholder='Cari Jurusan...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium outline-none focus:border-blue-600 focus:bg-[color:var(--bg-card)] text-[color:var(--text-primary)] transition-all shadow-sm'
              />
            </div>
          </div>
        </div>

        {filteredMajors.length === 0 ? (
          <div className='text-center py-16 px-4 bg-[color:var(--bg-tertiary)]/50 rounded-3xl border-2 border-dashed border-[color:var(--border-color)] text-[color:var(--text-tertiary)]'>
            <FaBook size={48} className='mx-auto mb-4 opacity-20' />
            <p className='text-sm font-medium'>Tidak ada jurusan yang ditemukan.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
            {filteredMajors.map((major, idx) => (
              <div
                key={idx}
                onClick={() => handleMajorClick(major)}
                className='flex flex-col justify-between p-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group cursor-pointer relative overflow-hidden'
              >
                <div>
                  <div className='flex items-start justify-between mb-3.5'>
                    <div className='flex items-center gap-3 w-full pr-2'>
                      <div className='flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 font-extrabold text-xs shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors'>
                        #{idx + 1}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h4
                          className='font-bold text-[color:var(--text-primary)] text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors'
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
                              className='text-[10px] px-2.5 py-1 rounded-lg bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-[color:var(--text-secondary)] font-medium truncate max-w-[150px]'
                              title={univ}
                            >
                              {univ}
                            </span>
                          ))}
                          {uniqueUnivs.length > 2 && (
                            <span className='text-[10px] font-semibold text-[color:var(--text-tertiary)] bg-slate-100 px-2 py-1 rounded-lg border border-slate-200'>
                              +{uniqueUnivs.length - 2} kampus
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className='pt-3.5 border-t border-[color:var(--border-color)] flex justify-between items-center'>
                  <div className='flex items-baseline gap-1.5'>
                    <span className='text-2xl font-extrabold text-blue-600 group-hover:scale-105 transition-transform'>
                      {major.count}
                    </span>
                    <span className='text-[10px] font-bold text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                      Alumni
                    </span>
                  </div>
                  <div className='text-xs text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 font-bold flex items-center gap-1'>
                    Detail <FaArrowRight className='text-[10px]' />
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
