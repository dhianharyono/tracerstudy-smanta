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
                  <span className='px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black text-white uppercase tracking-wider backdrop-blur-md border border-white/20'>
                    {university._id.type || 'Swasta'}
                  </span>
                </div>
                <h2 className='text-xl md:text-2xl font-black text-white leading-tight'>
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
                      <p className='text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1'>
                        Jumlah Alumni
                      </p>
                      <p className={`text-3xl font-black ${brandColor}`}>
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
                  <h3 className='text-xs font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2'>
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
                          className={`text-[10px] font-black ${brandColor} whitespace-nowrap ${brandBg} px-2 py-0.5 rounded-lg`}
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
                <h3 className='text-xs font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2'>
                  <FaGraduationCap className={brandColor} /> Alumni Terbaru
                </h3>
                <div className='space-y-3'>
                  {university.alumni.slice(0, 4).map((alum, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-2xl border border-slate-200/60 bg-slate-50/50 hover:${brandBorder} transition-colors`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white font-black text-xs shadow-lg`}
                      >
                        {alum.name.charAt(0)}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-black text-text-primary truncate'>
                          {alum.name}
                        </p>
                        <p className='text-[10px] font-bold text-text-tertiary truncate'>
                          {alum.major}
                        </p>
                        <p
                          className={`text-[9px] font-black ${brandColor} uppercase mt-1`}
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
              className={`w-full py-4 ${buttonBg} text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]`}
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
    const hasUniversityData = !!user?.university?.name;
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
    <div className='p-4 md:p-8 page-fade-in space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Perguruan Tinggi
          </h1>
          <p className='text-[color:var(--text-secondary)] text-sm md:text-base mt-1'>
            Daftar perguruan tinggi tempat alumni melanjutkan studi dan
            statistikanya.
          </p>
        </div>

        {/* Filter Tahun */}
        <div className='flex items-center gap-2.5 self-start sm:self-auto shrink-0 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] px-3.5 py-2 rounded-2xl shadow-sm'>
          <FaCalendarAlt className='text-blue-500 text-sm' />
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

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        <Card className='bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <FaUniversity size={20} />
            </div>
            <div>
              <p className='text-blue-100 text-[10px] font-bold uppercase tracking-wider'>
                Total PT Terdata
              </p>
              <h3 className='text-2xl font-black !text-white'>
                {universities.length}
              </h3>
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
                PT Negeri (PTN)
              </p>
              <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
                {universities.filter((u) => u._id.type === 'negeri').length}
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
                PT Swasta (PTS)
              </p>
              <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
                {
                  universities.filter(
                    (u) => !u._id.type || u._id.type === 'swasta',
                  ).length
                }
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
                Kedinasan
              </p>
              <h3 className='text-2xl font-black text-[color:var(--text-primary)]'>
                {universities.filter((u) => u._id.type === 'kedinasan').length}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {topUniversity && (
        <Card className='bg-gradient-to-r from-amber-500/5 to-transparent border-l-4 border-l-amber-500 mb-8'>
          <div className='flex items-center gap-6'>
            <div className='hidden sm:flex p-5 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30'>
              <FaTrophy size={28} />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <FaTrophy className='text-amber-500 sm:hidden' />
                <p className='text-amber-600 text-xs font-bold uppercase tracking-widest'>
                  Kampus Terfavorit Alumni
                </p>
              </div>
              <h3
                className='text-xl md:text-2xl font-black text-[color:var(--text-primary)] truncate'
                title={topUniversity._id.name}
              >
                {topUniversity._id.name}
              </h3>
              <div className='flex items-center gap-3 mt-2'>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border
                           ${
                             topUniversity._id.type === 'negeri'
                               ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                               : topUniversity._id.type === 'kedinasan'
                                 ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                 : 'bg-pink-50 text-pink-700 border-pink-200/50'
                           }`}
                >
                  {topUniversity._id.type || 'Swasta'}
                </span>
                <span className='text-sm font-bold text-[color:var(--text-secondary)]'>
                  <span className='text-amber-500'>{topUniversity.count}</span>{' '}
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
              Peringkat Universitas
            </h2>

            <div className='relative w-full md:w-72 shrink-0'>
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
              <input
                type='text'
                placeholder='Cari nama universitas...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)] transition-colors'
              />
            </div>
          </div>

          <div className='flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide'>
            {[
              { id: 'all', label: 'Semua PT' },
              { id: 'negeri', label: 'PT Negeri' },
              { id: 'swasta', label: 'PT Swasta' },
              { id: 'kedinasan', label: 'Kedinasan' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  filterType === type.id
                    ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
                    : 'bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-secondary)] hover:text-[color:var(--text-primary)] border border-[color:var(--border-color)]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {filteredUniversities.length === 0 ? (
          <div className='text-center py-16 px-4 bg-[color:var(--bg-tertiary)] rounded-2xl border-2 border-dashed border-[color:var(--border-color)] text-[color:var(--text-tertiary)]'>
            <FaMapMarkedAlt size={48} className='mx-auto mb-4 opacity-20' />
            <p>Tidak ada perguruan tinggi yang ditemukan.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredUniversities.map((univ, idx) => (
              <motion.div
                layout
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleUniversityClick(univ)}
                className='flex flex-col justify-between p-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] hover:border-[var(--primary)] hover:shadow-md transition-all group cursor-pointer'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3 w-full pr-2'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-bold text-sm shrink-0 uppercase'>
                      #{idx + 1}
                    </div>
                    <div className='min-w-0'>
                      <h4
                        className='font-bold text-[color:var(--text-primary)] text-sm md:text-base leading-tight truncate'
                        title={univ._id.name}
                      >
                        {univ._id.name}
                      </h4>
                      <span
                        className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border
                                    ${
                                      univ._id.type === 'negeri'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                        : univ._id.type === 'kedinasan'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                          : 'bg-pink-50 text-pink-700 border-pink-200/50'
                                    }`}
                      >
                        {univ._id.type || 'Swasta'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='pt-4 border-t border-[color:var(--border-color)] flex justify-between items-end'>
                  <div>
                    <span className='text-2xl font-black text-[var(--primary)] group-hover:scale-110 transition-transform inline-block'>
                      {univ.count}
                    </span>
                    <span className='text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider ml-2'>
                      Alumni
                    </span>
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
