import { motion } from 'framer-motion';
import {
  FaGraduationCap,
  FaUsers,
  FaUserGraduate,
  FaUniversity,
  FaBookOpen,
} from 'react-icons/fa';
import StatCard from '../common/StatCard';
import { LandingPageStats } from '@/types';

interface StatsSectionProps {
  stats: LandingPageStats | null;
  loading: boolean;
}

const StatsSection = ({ stats, loading }: StatsSectionProps) => {
  return (
    <section
      id='stats'
      className='py-20 px-4 sm:px-6 relative bg-slate-50 border-t border-slate-200/50 scroll-mt-24'
    >
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className='text-center mb-16 space-y-4'
        >
          <h3 className='text-3xl md:text-4xl font-bold text-slate-900 tracking-tight'>
            Statistik Tracer Study
          </h3>
          <div className='w-16 md:w-20 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 mx-auto rounded-full'></div>
          <p className='text-sm md:text-base text-slate-500 max-w-2xl mx-auto font-medium'>
            Pantau pencapaian alumni kita di berbagai sektor dan perguruan
            tinggi favorit.
          </p>
        </motion.div>

        {loading ? (
          <div className='w-full animate-pulse'>
            {/* Stats Cards Skeleton */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-md'
                >
                  <div className='w-10 h-10 md:w-14 md:h-14 bg-slate-100 rounded-2xl mb-4 md:mb-6'></div>
                  <div className='h-8 md:h-10 bg-slate-100 rounded-lg w-1/2 mb-2'></div>
                  <div className='h-3 md:h-4 bg-slate-100 rounded-lg w-3/4'></div>
                </div>
              ))}
            </div>

            {/* Distribusi Perguruan Tinggi Skeleton */}
            <div className='mb-12'>
              <div className='mb-8 text-center md:text-left'>
                <div className='h-8 md:h-10 bg-slate-100 rounded-lg w-64 md:w-96 mb-3 mx-auto md:mx-0'></div>
                <div className='h-4 md:h-5 bg-slate-100 rounded-lg w-48 md:w-72 mx-auto md:mx-0'></div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='p-6 md:p-8 bg-white rounded-[2rem] border border-slate-200 flex flex-col'
                  >
                    <div className='h-4 mb-4 bg-slate-100 rounded-lg w-24'></div>
                    <div className='flex items-baseline gap-2'>
                      <div className='h-10 md:h-12 bg-slate-100 rounded-lg w-16'></div>
                      <div className='h-3 md:h-4 bg-slate-100 rounded-lg w-12'></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Colleges & Majors Skeleton */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8'>
              <div className='bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-md'>
                <div className='flex items-center justify-between mb-6 md:mb-8'>
                  <div className='h-6 md:h-8 bg-slate-100 rounded-lg w-48 md:w-64'></div>
                  <div className='w-8 h-8 md:w-9 md:h-9 bg-slate-100 rounded-full'></div>
                </div>
                <div className='space-y-4 md:space-y-6'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <div className='h-3 md:h-4 bg-slate-100 rounded w-1/2'></div>
                        <div className='h-2 md:h-3 bg-slate-100 rounded w-16'></div>
                      </div>
                      <div className='w-full h-1.5 md:h-2.5 bg-slate-100 rounded-full'></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-md'>
                <div className='flex items-center justify-between mb-6 md:mb-8'>
                  <div className='h-6 md:h-8 bg-slate-100 rounded-lg w-40 md:w-48'></div>
                  <div className='w-8 h-8 md:w-9 md:h-9 bg-slate-100 rounded-full'></div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className='p-5 bg-slate-50 rounded-[1.5rem] border border-slate-200 flex items-start justify-between'
                    >
                      <div className='flex-1 mr-4 space-y-3'>
                        <div className='h-3 bg-slate-100 rounded w-16'></div>
                        <div className='h-4 bg-slate-100 rounded w-full'></div>
                        <div className='space-y-2 mt-2'>
                          <div className='h-2 bg-slate-100 rounded w-3/4'></div>
                          <div className='h-2 bg-slate-100 rounded w-1/2'></div>
                        </div>
                      </div>
                      <div className='w-14 h-14 bg-slate-100 rounded-[1rem] shrink-0'></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16'>
              <StatCard
                icon={FaUsers}
                label='Total Siswa'
                value={stats?.totalStudents || 0}
                color='text-emerald-600'
                bgColor='bg-emerald-500/10'
                delay={0.1}
              />
              <StatCard
                icon={FaUserGraduate}
                label='Total Alumni'
                value={stats?.totalAlumni || 0}
                color='text-blue-600'
                bgColor='bg-blue-600/10'
                delay={0.05}
              />
              <StatCard
                icon={FaUniversity}
                label='Kampus Terdaftar'
                value={stats?.totalConnectedUniversities || 0}
                color='text-amber-600'
                bgColor='bg-amber-500/10'
                delay={0.2}
              />
              <StatCard
                icon={FaBookOpen}
                label='Jurusan Terdaftar'
                value={stats?.totalMajors || 0}
                color='text-violet-600'
                bgColor='bg-violet-500/10'
                delay={0.15}
              />
            </div>

            <div className='mb-16'>
              <div className='mb-8 text-center md:text-left'>
                <h4 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>
                  Distribusi Perguruan Tinggi
                </h4>
                <p className='text-sm md:text-base text-slate-500 mt-2 font-medium'>
                  Persebaran alumni SMANTA berdasarkan tipe institusi pendidikan
                  tinggi.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8'>
                {[
                  {
                    label: 'PTN (Negeri)',
                    val: stats?.ptnCount,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50/50',
                    border: 'border-blue-100',
                  },
                  {
                    label: 'PTS (Swasta)',
                    val: stats?.ptsCount,
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50/50',
                    border: 'border-indigo-100',
                  },
                  {
                    label: 'Kedinasan',
                    val: stats?.kedinasanCount,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50/50',
                    border: 'border-amber-100',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`flex flex-col p-6 md:p-8 bg-white rounded-[2rem] border ${item.border} ${item.bg} shadow-sm group hover:shadow-md transition-all duration-300 cursor-default`}
                  >
                    <span className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-2'>
                      {item.label}
                    </span>
                    <div className='flex items-baseline gap-2'>
                      <span
                        className={`text-3xl md:text-5xl font-bold ${item.color}`}
                      >
                        {item.val || 0}
                      </span>
                      <span className='text-xs font-bold text-slate-500'>
                        Alumni
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8'
            >
              {/* Top Colleges panel */}
              <div className='bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/80 shadow-md shadow-slate-100/50'>
                <div className='flex items-center justify-between mb-8'>
                  <h5 className='text-lg md:text-xl font-bold text-slate-900 tracking-tight'>
                    Top 10 Perguruan Tinggi
                  </h5>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    className='p-2 bg-blue-50 rounded-full text-blue-600 shadow-inner'
                  >
                    <FaUniversity className='w-4.5 h-4.5 md:w-5 md:h-5' />
                  </motion.div>
                </div>
                <div className='space-y-5 md:space-y-6'>
                  {stats?.topUniversities?.map((uni: any, idx: number) => (
                    <div key={idx} className='group'>
                      <div className='flex justify-between items-center mb-1.5'>
                        <span className='text-xs md:text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[70%]'>
                          {uni._id}
                        </span>
                        <span className='text-[10px] md:text-xs font-bold text-slate-400 shrink-0'>
                          {uni.count} Alumni
                        </span>
                      </div>
                      <div className='w-full bg-slate-100 h-2 md:h-2.5 rounded-full overflow-hidden'>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width:
                              (stats?.totalAlumni || 0) > 0
                                ? `${(uni.count / stats!.totalAlumni) * 100 * 2}%`
                                : '0%',
                          }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.2,
                            delay: 0.1 * idx,
                            ease: [0.215, 0.61, 0.355, 1.0],
                          }}
                          className='bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full'
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Majors panel */}
              <div className='bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/80 shadow-md shadow-slate-100/50'>
                <div className='flex items-center justify-between mb-8'>
                  <h5 className='text-lg md:text-xl font-bold text-slate-900 tracking-tight'>
                    Jurusan Populer
                  </h5>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    className='p-2 bg-indigo-50 rounded-full text-indigo-600 shadow-inner'
                  >
                    <FaGraduationCap className='w-4.5 h-4.5 md:w-5 md:h-5' />
                  </motion.div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {stats?.topMajors?.map((major: any, idx: number) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className='relative p-5 bg-slate-50/50 hover:bg-white rounded-[1.5rem] border border-slate-200/80 overflow-hidden group hover:border-blue-500/50 hover:shadow-md transition-all duration-200 cursor-default'
                    >
                      {/* Stylized background watermark for rank */}
                      <div className='absolute -right-1.5 -bottom-2.5 text-6xl font-bold text-slate-100/80 group-hover:text-blue-500/5 transition-colors pointer-events-none'>
                        #{idx + 1}
                      </div>

                      <div className='flex items-start justify-between relative z-10'>
                        <div className='flex flex-col min-w-0 flex-1 mr-3'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='px-2 py-0.5 bg-indigo-50 border border-indigo-100/50 text-indigo-650 text-[8px] md:text-[9px] font-bold rounded uppercase tracking-wider'>
                              Rank #{idx + 1}
                            </span>
                          </div>

                          <h6 className='text-sm md:text-base font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors truncate max-w-full leading-tight'>
                            {major._id}
                          </h6>

                          <div className='flex flex-col gap-1.5'>
                            {major.universities
                              .slice(0, 3)
                              .map((uni: string, i: number) => (
                                <div
                                  key={i}
                                  className='flex items-center gap-1.5 min-w-0'
                                >
                                  <div className='w-1.5 h-1.5 rounded-full bg-blue-500/50 shrink-0 shadow-sm'></div>
                                  <span className='text-[10px] md:text-[11px] font-semibold text-slate-500 truncate leading-none'>
                                    {uni}
                                  </span>
                                </div>
                              ))}
                            {major.universities.length > 3 && (
                              <span className='text-[9px] md:text-[10px] font-bold text-indigo-500/50 ml-3.5 italic'>
                                + {major.universities.length - 3} PT Lainnya
                              </span>
                            )}
                          </div>
                        </div>

                        <div className='flex flex-col items-center justify-center bg-white px-2.5 py-2 rounded-[1rem] border border-slate-200 shadow-sm shrink-0 min-w-[3.25rem] group-hover:border-blue-500/50 transition-all duration-200'>
                          <span className='text-base md:text-lg font-bold text-slate-800 leading-none'>
                            {major.count}
                          </span>
                          <span className='text-[7px] font-extrabold text-slate-400 uppercase tracking-widest mt-1'>
                            Alumni
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default StatsSection;
