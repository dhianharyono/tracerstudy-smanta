import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createPortal } from 'react-dom';
import {
  FaUniversity,
  FaSearch,
  FaUsers,
  FaGraduationCap,
  FaBook,
  FaTimes,
  FaArrowRight,
  FaTrophy,
  FaBuilding,
  FaMapMarkedAlt,
  FaCalendarAlt,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';
import { isUniversityIncomplete, isNameIncomplete } from '@/utils/validation';
import SmartLoader from '@/components/SmartLoader';
import Card from '@/components/common/Card';

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
}

const UniversityDetailModal = ({
  university,
  isOpen,
  onClose,
  onViewAll,
}: UniversityDetailModalProps) => {
  if (!isOpen || !university) return null;

  const majorStats = university.alumni.reduce((acc: any, curr) => {
    acc[curr.major] = (acc[curr.major] || 0) + 1;
    return acc;
  }, {});

  const topMajors = Object.entries(majorStats)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 4);

  const brandColor = 'text-blue-600';
  const brandBg = 'bg-blue-50';
  const brandBorder = 'border-blue-200/60';
  const headerGradient = 'from-blue-600 to-blue-700';
  const buttonBg = 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20';
  const avatarGradient = 'from-blue-500 to-blue-600';

  return createPortal(
    <AnimatePresence>
      <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='absolute inset-0 bg-black/60 backdrop-blur-sm'
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className='relative w-full max-w-2xl bg-[color:var(--bg-card)] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'
        >
          {/* Hero Header */}
          <div
            className={`relative h-48 bg-gradient-to-br ${headerGradient} p-8 flex flex-col justify-end`}
          >
            <div className='absolute top-6 right-6'>
              <button
                onClick={onClose}
                className='p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all'
              >
                <FaTimes />
              </button>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl'>
                <FaUniversity className='text-3xl text-white' />
              </div>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-md border border-white/20'>
                    {university._id.type || 'Swasta'}
                  </span>
                </div>
                <h2 className='text-xl md:text-2xl font-bold text-white leading-tight'>
                  {university._id.name}
                </h2>
              </div>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-8 custom-scrollbar'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Stats Left */}
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-4'>
                  <div
                    className={`p-6 rounded-3xl ${brandBg} border ${brandBorder} flex items-center justify-between`}
                  >
                    <div>
                      <p className='text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1'>
                        Jumlah Alumni
                      </p>
                      <p className={`text-3xl font-bold ${brandColor}`}>
                        {university.count}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${brandBg} flex items-center justify-center`}
                    >
                      <FaUsers className={`${brandColor} text-xl`} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='text-xs font-bold text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2'>
                    <FaBook className={brandColor} /> Jurusan Terpopuler
                  </h3>
                  <div className='space-y-2'>
                    {topMajors.map(([major, count]: any, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:${brandBorder} transition-colors`}
                      >
                        <span className='text-[11px] font-bold text-text-secondary truncate pr-2'>
                          {major}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${brandColor} whitespace-nowrap ${brandBg} px-2 py-0.5 rounded-lg`}
                        >
                          {count} Siswa
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right List */}
              <div>
                <h3 className='text-xs font-bold text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2'>
                  <FaGraduationCap className={brandColor} /> Alumni Terbaru
                </h3>
                <div className='space-y-3'>
                  {university.alumni.slice(0, 4).map((alum, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-2xl border border-slate-200/60 bg-slate-50/50 hover:${brandBorder} transition-colors`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white font-bold text-xs shadow-lg`}
                      >
                        {alum.name.charAt(0)}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-bold text-text-primary truncate'>
                          {alum.name}
                        </p>
                        <p className='text-[10px] font-bold text-text-tertiary truncate'>
                          {alum.major}
                        </p>
                        <p
                          className={`text-[9px] font-bold ${brandColor} uppercase mt-1`}
                        >
                          Angkatan {alum.graduationYear}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='p-6 bg-slate-50/50 border-t border-slate-200/60'>
            <button
              onClick={() => onViewAll(university._id.name)}
              className={`w-full py-4 ${buttonBg} text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]`}
            >
              Lihat Informasi Selengkapnya <FaArrowRight />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

const StudentUniversities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<UniversityAggregate[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUni, setSelectedUni] = useState<UniversityAggregate | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, [selectedYear]);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedYear) {
        params.graduationYear = selectedYear;
      }
      const response = await axios.get<UniversityAggregate[]>(
        '/api/student/universities',
        { params },
      );
      setUniversities(response.data);

      if (availableYears.length === 0) {
        const currentYear = new Date().getFullYear();
        const defaultYears = Array.from({ length: 15 }, (_, i) => currentYear - i);
        const extractedYears = new Set<number>();
        response.data.forEach((uni) => {
          uni.alumni?.forEach((alum) => {
            if (alum.graduationYear) extractedYears.add(Number(alum.graduationYear));
          });
        });
        const combined = Array.from(new Set([...extractedYears, ...defaultYears])).sort(
          (a, b) => b - a,
        );
        setAvailableYears(combined);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityClick = (uni: UniversityAggregate) => {
    setSelectedUni(uni);
    setIsModalOpen(true);
  };

  const handleViewAllAlumni = (uniName: string) => {
    navigate(`/${user?.role}/alumni?university=${encodeURIComponent(uniName)}`);
  };

  if (loading) return <SmartLoader />;

  if (user?.role === 'admin' || user?.role === 'school') {
    // Admin and school monitoring profiles do not need completeness verification
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
    if (!isStudentProfileComplete(user))
      return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch = uni._id?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === 'all' || (uni._id?.type || 'swasta') === filterType;
    return matchesSearch && matchesType;
  });

  const topUniversity =
    filteredUniversities.length > 0 ? filteredUniversities[0] : null;

  return (
    <div className='p-4 sm:p-6 lg:p-8 min-h-screen page-fade-in space-y-6'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-lg md:text-2xl font-extrabold text-[color:var(--text-primary)] tracking-tight !mb-0'>
            Perguruan Tinggi
          </h1>
          <p className='text-[color:var(--text-secondary)] text-xs sm:text-sm mt-1'>
            Daftar perguruan tinggi tempat alumni melanjutkan studi beserta statistik kelulusan.
          </p>
        </div>

        {/* Filter Tahun */}
        <div className='flex items-center gap-2.5 self-start sm:self-auto shrink-0 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] px-3.5 py-2 rounded-2xl shadow-sm'>
          <FaCalendarAlt className='text-blue-600 text-sm' />
          <span className='text-xs sm:text-sm font-semibold text-[color:var(--text-secondary)] whitespace-nowrap'>
            Tahun:
          </span>
          <select
            id='year-filter'
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

      {topUniversity && (
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
                  ✨ Kampus Terfavorit Alumni
                </span>
              </div>

              <h3
                className='text-lg sm:text-2xl font-black text-white truncate tracking-tight'
                title={topUniversity._id.name}
              >
                {topUniversity._id.name}
              </h3>

              <div className='flex items-center gap-3 mt-2 flex-wrap'>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${topUniversity._id.type === 'negeri'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : topUniversity._id.type === 'kedinasan'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    }`}
                >
                  {topUniversity._id.type || 'Swasta'}
                </span>
                <span className='text-xs sm:text-sm font-medium text-blue-100/90 flex items-center gap-1.5'>
                  <span className='text-amber-400 font-extrabold text-base sm:text-xl'>{topUniversity.count}</span>
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
                Total Perguruan Tinggi
              </p>
              <h3 className='text-3xl font-extrabold text-white tracking-tight'>
                {universities.length}
              </h3>
            </div>
            <div className='p-3.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 text-white shadow-inner'>
              <FaUniversity size={22} />
            </div>
          </div>
        </div>

        <div className='relative overflow-hidden rounded-2xl bg-[color:var(--bg-card)] border border-[color:var(--border-color)] p-5 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[color:var(--text-tertiary)] text-[10px] font-extrabold uppercase tracking-widest mb-1'>
                PT Negeri (PTN)
              </p>
              <h3 className='text-3xl font-extrabold text-emerald-600 tracking-tight'>
                {universities.filter((u) => u._id.type === 'negeri').length}
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
                PT Swasta (PTS)
              </p>
              <h3 className='text-3xl font-extrabold text-indigo-600 tracking-tight'>
                {
                  universities.filter(
                    (u) => !u._id.type || u._id.type === 'swasta',
                  ).length
                }
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
                Kedinasan
              </p>
              <h3 className='text-3xl font-extrabold text-amber-600 tracking-tight'>
                {universities.filter((u) => u._id.type === 'kedinasan').length}
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
        <div className='flex flex-col gap-5 mb-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <h2 className='text-lg sm:text-xl font-extrabold text-[color:var(--text-primary)] tracking-tight'>
                Peringkat Universitas & Perguruan Tinggi
              </h2>
              <p className='text-xs text-[color:var(--text-tertiary)] mt-0.5'>
                Klik kartu universitas untuk melihat jurusan favorit & alumni terdaftar.
              </p>
            </div>

            <div className='relative w-full md:w-80 shrink-0'>
              <FaSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm' />
              <input
                type='text'
                placeholder='Cari nama universitas...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium outline-none focus:border-blue-600 focus:bg-[color:var(--bg-card)] text-[color:var(--text-primary)] transition-all shadow-sm'
              />
            </div>
          </div>

          <div className='flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide'>
            {[
              { id: 'all', label: 'Semua Perguruan Tinggi' },
              { id: 'negeri', label: 'PT Negeri (PTN)' },
              { id: 'swasta', label: 'PT Swasta (PTS)' },
              { id: 'kedinasan', label: 'Kedinasan' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${filterType === type.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-secondary)] hover:text-[color:var(--text-primary)] border border-[color:var(--border-color)]'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {filteredUniversities.length === 0 ? (
          <div className='text-center py-16 px-4 bg-[color:var(--bg-tertiary)]/50 rounded-3xl border-2 border-dashed border-[color:var(--border-color)] text-[color:var(--text-tertiary)]'>
            <FaMapMarkedAlt size={48} className='mx-auto mb-4 opacity-20' />
            <p className='text-sm font-medium'>Tidak ada perguruan tinggi yang ditemukan.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
            {filteredUniversities.map((univ, idx) => (
              <motion.div
                layout
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                onClick={() => handleUniversityClick(univ)}
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
                          title={univ._id.name}
                        >
                          {univ._id.name}
                        </h4>
                        <span
                          className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${univ._id.type === 'negeri'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : univ._id.type === 'kedinasan'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                        >
                          {univ._id.type || 'Swasta'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='pt-3.5 border-t border-[color:var(--border-color)] flex justify-between items-center mt-4'>
                  <div className='flex items-baseline gap-1.5'>
                    <span className='text-2xl font-extrabold text-blue-600 group-hover:scale-105 transition-transform'>
                      {univ.count}
                    </span>
                    <span className='text-[10px] font-bold text-[color:var(--text-tertiary)] uppercase tracking-wider'>
                      Alumni
                    </span>
                  </div>
                  <div className='text-xs text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 font-bold flex items-center gap-1'>
                    Detail <FaArrowRight className='text-[10px]' />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {selectedUni && (
        <UniversityDetailModal
          university={selectedUni}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onViewAll={handleViewAllAlumni}
        />
      )}
    </div>
  );
};

export default StudentUniversities;
