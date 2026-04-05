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
   FaChevronRight,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
               className='relative w-full max-w-2xl bg-[color:var(--bg-card)] rounded-[2rem] shadow-2xl border border-[color:var(--border-color)] overflow-hidden flex flex-col max-h-[90vh]'
            >
               {/* Hero Header */}
               <div className='relative h-48 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-8 flex flex-col justify-end'>
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
                              {university._id.type || 'Umum'}
                           </span>
                        </div>
                        <h2 className='text-xl md:text-2xl font-black text-white leading-tight'>{university._id.name}</h2>
                     </div>
                  </div>
               </div>

               <div className='flex-1 overflow-y-auto p-8 custom-scrollbar'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                     {/* Stats Left */}
                     <div className='space-y-6'>
                        <div className='grid grid-cols-1 gap-4'>
                           <div className='p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between'>
                              <div>
                                 <p className='text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1'>Jumlah Alumni</p>
                                 <p className='text-3xl font-black text-[color:var(--primary)]'>{university.count}</p>
                              </div>
                              <div className='w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center'>
                                 <FaUsers className='text-blue-500 text-xl' />
                              </div>
                           </div>
                        </div>

                        <div>
                           <h3 className='text-xs font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2'>
                              <FaBook className='text-indigo-500' /> Jurusan Terpopuler
                           </h3>
                           <div className='space-y-2'>
                              {topMajors.map(([major, count]: any, idx) => (
                                 <div key={idx} className='flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-700'>
                                    <span className='text-[11px] font-bold text-text-secondary truncate pr-2'>{major}</span>
                                    <span className='text-[10px] font-black text-blue-500 whitespace-nowrap bg-blue-500/10 px-2 py-0.5 rounded-lg'>{count} Siswa</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Right List */}
                     <div>
                        <h3 className='text-xs font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2'>
                           <FaGraduationCap className='text-indigo-500' /> Alumni Terbaru
                        </h3>
                        <div className='space-y-3'>
                           {university.alumni.slice(0, 4).map((alum, idx) => (
                              <div key={idx} className='flex items-center gap-3 p-3 rounded-2xl border border-gray-700 bg-gray-50 dark:bg-gray-800/30'>
                                 <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-lg'>
                                    {alum.name.charAt(0)}
                                 </div>
                                 <div className='min-w-0'>
                                    <p className='text-sm font-black text-text-primary truncate'>{alum.name}</p>
                                    <p className='text-[10px] font-bold text-text-tertiary truncate'>{alum.major}</p>
                                    <p className='text-[9px] font-black text-indigo-500 uppercase mt-1'>Angkatan {alum.graduationYear}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className='p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-700'>
                  <button
                     onClick={() => onViewAll(university._id.name)}
                     className='w-full py-4 bg-[color:var(--primary)] hover:bg-[color:var(--primary-dark)] text-white rounded-2xl font-black shadow-xl shadow-[var(--primary)]/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]'
                  >
                     Lihat Informasi Selengkapnya <FaArrowRight />
                  </button>
               </div>
            </motion.div>
         </div>
      </AnimatePresence>,
      document.body
   );
};

const StudentUniversities = () => {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [universities, setUniversities] = useState<UniversityAggregate[]>([]);
   const [filteredUniversities, setFilteredUniversities] = useState<UniversityAggregate[]>([]);
   const [filterType, setFilterType] = useState('');
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(true);
   const [selectedUni, setSelectedUni] = useState<UniversityAggregate | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   useEffect(() => {
      fetchUniversities();
   }, [filterType]);

   useEffect(() => {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = universities.filter((uni) =>
         uni._id?.name?.toLowerCase().includes(lowerTerm)
      );
      setFilteredUniversities(filtered);
   }, [searchTerm, universities]);

   const fetchUniversities = async () => {
      setLoading(true);
      try {
         const url = filterType ? `/api/student/universities?type=${filterType}` : '/api/student/universities';
         const response = await axios.get<UniversityAggregate[]>(url);
         setUniversities(response.data);
         setFilteredUniversities(response.data);
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
      navigate(`/student/alumni?university=${encodeURIComponent(uniName)}`);
   };

   if (loading) return <SmartLoader />;
   if (!isStudentProfileComplete(user)) return <RestrictedAccess type='profile_incomplete' role='student' />;

   const typeConfig = [
      { value: '', label: 'Semua Kampus', icon: <FaUniversity />, bg: 'bg-gray-500' },
      { value: 'negeri', label: 'PTN', icon: <div className='w-2 h-2 rounded-full bg-amber-600' />, bg: 'bg-amber-500/10', color: 'text-amber-600' },
      { value: 'swasta', label: 'PTS', icon: <div className='w-2 h-2 rounded-full bg-pink-500' />, bg: 'bg-pink-500/10', color: 'text-pink-600' },
      { value: 'kedinasan', label: 'Kedinasan', icon: <div className='w-2 h-2 rounded-full bg-emerald-500' />, bg: 'bg-emerald-500/10', color: 'text-emerald-600' },
   ];

   return (
      <div className='p-4 md:p-8 page-fade-in space-y-8'>
         {/* Hero Search Section */}
         <div className='relative rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-800 p-6 md:p-10 overflow-hidden shadow-2xl shadow-blue-500/20'>
            <div className='absolute inset-0 bg-grid-white/5'></div>
            <div className='relative z-10 max-w-2xl'>
               <h1 className='text-xl md:text-2xl font-black text-white mb-3 leading-tight'>
                  Eksplorasi Kampus Impianmu
               </h1>
               <p className='text-blue-100 text-xs md:text-sm mb-6 max-w-xl font-medium opacity-90 leading-relaxed'>
                  Temukan ribuan alumni SMANTA yang tersebar di berbagai universitas terbaik.
               </p>

               <div className='relative max-w-xl group'>
                  <div className='absolute inset-y-0 left-0 flex items-center pl-5 text-white/50 group-focus-within:text-white transition-colors'>
                     <FaSearch className='text-base' />
                  </div>
                  <input
                     type="text"
                     placeholder='Cari nama perguruan tinggi...'
                     className='w-full py-3.5 pl-12 pr-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all text-base font-medium'
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
            <div className='absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4'>
               <FaUniversity size={250} className='text-white' />
            </div>
         </div>

         {/* Filter Chips */}
         <div className='flex flex-wrap items-center gap-3 px-2'>
            {typeConfig.map((config) => (
               <button
                  key={config.value}
                  onClick={() => setFilterType(config.value)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full text-xs font-black transition-all ${filterType === config.value
                     ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                     : 'bg-white dark:bg-gray-800 text-text-secondary border border-gray-700 hover:border-[var(--primary)]'
                     }`}
               >
                  {config.icon} {config.label}
               </button>
            ))}
         </div>

         {/* Main Grid */}
         {filteredUniversities.length === 0 ? (
            <div className='py-20 text-center space-y-4'>
               <div className='w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400'>
                  <FaUniversity size={32} />
               </div>
               <p className='text-text-tertiary font-bold tracking-widest uppercase text-xs'>Kampus tidak ditemukan</p>
            </div>
         ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
               {filteredUniversities.map((uni, idx) => (
                  <motion.div
                     layout
                     key={idx}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     onClick={() => handleUniversityClick(uni)}
                     className='group relative bg-[color:var(--bg-card)] rounded-[2rem] p-6 border border-[color:var(--border-color)] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full'
                  >
                     {/* Top Content */}
                     <div className='flex-grow'>
                        <div className='flex justify-between items-start mb-4'>
                           <span className={`rounded-full text-[9px] font-black uppercase tracking-wider ${uni._id.type?.toLowerCase() === 'negeri' ? 'text-amber-600' :
                              uni._id.type?.toLowerCase() === 'swasta' ? 'text-pink-600' :
                                 'text-emerald-600'
                              }`}>
                              {uni._id.type || 'Umum'}
                           </span>
                        </div>

                        <div className='mb-6'>
                           <h3 className='text-lg font-black text-text-primary leading-tight line-clamp-3 group-hover:text-blue-600 transition-colors'>
                              {uni._id.name}
                           </h3>
                        </div>
                     </div>

                     {/* Bottom Footer */}
                     <div className='flex items-center justify-between pt-5 border-t border-[color:var(--border-color)]/20 mt-auto'>
                        <div className='space-y-0.5'>
                           <p className='text-[10px] font-bold text-text-tertiary uppercase tracking-tighter'>Jumlah Alumni</p>
                           <p className='text-lg font-black text-text-primary'>{uni.count} <span className='text-[10px] uppercase'>Alumni</span></p>
                        </div>
                        <div className='w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all'>
                           <FaChevronRight />
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}

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
