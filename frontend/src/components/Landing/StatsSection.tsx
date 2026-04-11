import { motion } from 'framer-motion';
import { FaGraduationCap, FaUsers, FaBriefcase, FaUniversity } from 'react-icons/fa';
import StatCard from '../common/StatCard';
import { LandingPageStats } from '@/types';

interface StatsSectionProps {
  stats: LandingPageStats | null;
  loading: boolean;
}

const StatsSection = ({ stats, loading }: StatsSectionProps) => {
  return (
    <section id='stats' className='py-20 px-4 sm:px-6 relative bg-[color:var(--bg-secondary)]/20 scroll-mt-24'>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className='text-center mb-16 space-y-4'
        >
          <h3 className='text-2xl md:text-4xl font-black text-[color:var(--text-primary)]'>
            Statistik Tracer Study
          </h3>
          <div className='w-16 md:w-20 h-1.5 bg-gradient-to-r from-[var(--primary)] to-blue-500 mx-auto rounded-full'></div>
          <p className='text-sm md:text-base text-[color:var(--text-secondary)] max-w-2xl mx-auto'>
            Pantau pencapaian alumni kita di berbagai sektor dan perguruan tinggi favorit.
          </p>
        </motion.div>

        {loading ? (
          <div className='w-full animate-pulse'>
            {/* Stats Cards Skeleton */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='bg-[color:var(--bg-card)] p-5 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl'>
                  <div className='w-10 h-10 md:w-14 md:h-14 bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-2xl mb-4 md:mb-6'></div>
                  <div className='h-8 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-2'></div>
                  <div className='h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4'></div>
                </div>
              ))}
            </div>

            {/* Distribusi Perguruan Tinggi Skeleton */}
            <div className='mb-12'>
              <div className='mb-8 text-center md:text-left'>
                <div className='h-8 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 md:w-96 mb-3 mx-auto md:mx-0'></div>
                <div className='h-4 md:h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 md:w-72 mx-auto md:mx-0'></div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='p-6 md:p-8 bg-[color:var(--bg-card)] rounded-[2rem] border border-[color:var(--border-color)] flex flex-col'>
                    <div className='h-4 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-24'></div>
                    <div className='flex items-baseline gap-2'>
                      <div className='h-10 md:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-16'></div>
                      <div className='h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-12'></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Colleges & Majors Skeleton */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8'>
              <div className='bg-[color:var(--bg-card)] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl'>
                <div className='flex items-center justify-between mb-6 md:mb-8'>
                  <div className='h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 md:w-64'></div>
                  <div className='w-8 h-8 md:w-9 md:h-9 bg-gray-200 dark:bg-gray-700 rounded-full'></div>
                </div>
                <div className='space-y-4 md:space-y-6'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <div className='h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                        <div className='h-2 md:h-3 bg-gray-200 dark:bg-gray-700 rounded w-16'></div>
                      </div>
                      <div className='w-full h-1.5 md:h-2.5 bg-[color:var(--bg-tertiary)] rounded-full'></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-[color:var(--bg-card)] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl'>
                <div className='flex items-center justify-between mb-6 md:mb-8'>
                  <div className='h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-40 md:w-48'></div>
                  <div className='w-8 h-8 md:w-9 md:h-9 bg-gray-200 dark:bg-gray-700 rounded-full'></div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className='p-5 bg-[color:var(--bg-tertiary)] rounded-[1.5rem] border border-[color:var(--border-color)] flex items-start justify-between'>
                      <div className='flex-1 mr-4 space-y-3'>
                        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-16'></div>
                        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-full'></div>
                        <div className='space-y-2 mt-2'>
                          <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
                          <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6'></div>
                          <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                        </div>
                      </div>
                      <div className='w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-[1rem] shrink-0'></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12'>
              <StatCard
                icon={FaUsers}
                label="Total Alumni"
                value={stats?.totalAlumni || 0}
                color="text-blue-500"
                bgColor="bg-blue-500/10"
                delay={0.1}
              />
              <StatCard
                icon={FaBriefcase}
                label="Alumni Bekerja"
                value={stats?.workingAlumni || 0}
                color="text-green-500"
                bgColor="bg-green-500/10"
                delay={0.2}
              />
              <StatCard
                icon={FaGraduationCap}
                label="Alumni Kuliah"
                value={stats?.studyingAlumni || 0}
                color="text-purple-500"
                bgColor="bg-purple-500/10"
                delay={0.3}
              />
              <StatCard
                icon={FaUniversity}
                label="Kampus Teregistrasi"
                value={stats?.totalConnectedUniversities || 0}
                color="text-amber-500"
                bgColor="bg-amber-500/10"
                delay={0.4}
              />
            </div>

            <div className='mb-12'>
              <div className='mb-8 text-center md:text-left'>
                <h3 className='text-2xl md:text-3xl font-black text-[color:var(--text-primary)]'>
                  Distribusi Perguruan Tinggi
                </h3>
                <p className='text-sm md:text-base text-[color:var(--text-secondary)] mt-2'>
                  Persebaran alumni SMANTA berdasarkan tipe institusi pendidikan tinggi.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8'>
                {[
                  { label: 'PTN (Negeri)', val: stats?.ptnCount, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
                  { label: 'PTS (Swasta)', val: stats?.ptsCount, color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/20' },
                  { label: 'Kedinasan', val: stats?.kedinasanCount, color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className={`flex flex-col p-6 md:p-8 bg-[color:var(--bg-card)] rounded-[2rem] border ${item.border} ${item.bg} shadow-sm group hover:scale-[1.02] transition-all`}
                  >
                    <span className='text-xs md:text-sm font-bold text-[color:var(--text-tertiary)] uppercase tracking-widest mb-2'>
                      {item.label}
                    </span>
                    <div className='flex items-baseline gap-2'>
                      <span className={`text-3xl md:text-5xl font-black ${item.color}`}>
                        {item.val || 0}
                      </span>
                      <span className='text-xs md:text-sm font-bold text-[color:var(--text-tertiary)]'>
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
              className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8'
            >
              <div className='bg-[color:var(--bg-card)] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl shadow-black/5'>
                <div className='flex items-center justify-between mb-6 md:mb-8'>
                  <h5 className='text-lg md:text-xl font-black text-[color:var(--text-primary)]'>
                    Top 10 Perguruan Tinggi
                  </h5>
                  <div className='p-1.5 md:p-2 bg-[color:var(--bg-tertiary)] rounded-full text-[var(--primary)]'>
                    <FaUniversity className='w-4 h-4 md:w-5 md:h-5' />
                  </div>
                </div>
                <div className='space-y-4 md:space-y-6'>
                  {stats?.topUniversities?.map((uni: any, idx: number) => (
                    <div key={idx} className='group'>
                      <div className='flex justify-between items-center mb-1.5'>
                        <span className='text-xs md:text-sm font-bold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate max-w-[70%]'>
                          {uni._id}
                        </span>
                        <span className='text-[10px] md:text-xs font-bold text-[color:var(--text-tertiary)] shrink-0'>
                          {uni.count} Alumni
                        </span>
                      </div>
                      <div className='w-full bg-[color:var(--bg-tertiary)] h-1.5 md:h-2.5 rounded-full overflow-hidden'>
                        <div
                          className='bg-gradient-to-r from-[var(--primary)] to-blue-400 h-full rounded-full transition-all duration-1000 ease-out'
                          style={{
                            width: (stats?.totalAlumni || 0) > 0 ? `${(uni.count / stats!.totalAlumni) * 100 * 2}%` : '0%',
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-[color:var(--bg-card)] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[color:var(--border-color)] shadow-xl shadow-black/5'>
                <div className='flex items-center justify-between mb-6 md:mb-8'>
                  <h5 className='text-lg md:text-xl font-black text-[color:var(--text-primary)]'>
                    Jurusan Populer
                  </h5>
                  <div className='p-1.5 md:p-2 bg-[color:var(--bg-tertiary)] rounded-full text-indigo-500'>
                    <FaGraduationCap className='w-4 h-4 md:w-5 md:h-5' />
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
                  {stats?.topMajors?.map((major: any, idx: number) => (
                    <div
                      key={idx}
                      className='relative p-5 bg-[color:var(--bg-tertiary)] rounded-[1.5rem] border border-[color:var(--border-color)] overflow-hidden group hover:border-[var(--primary)] transition-all'
                    >
                      <div className='absolute -right-2 -bottom-2 text-6xl font-black text-white/5 group-hover:text-[var(--primary)]/10 transition-colors pointer-events-none'>
                        #{idx + 1}
                      </div>

                      <div className='flex items-start justify-between relative z-10'>
                        <div className='flex flex-col min-w-0 flex-1 mr-4'>
                          <div className='flex items-center gap-2 mb-2.5'>
                            <span className='px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] md:text-[10px] font-bold rounded-md uppercase tracking-widest border border-indigo-500/10'>
                              Rank #{idx + 1}
                            </span>
                          </div>

                          <h6 className='text-sm md:text-base font-black text-[color:var(--text-primary)] mb-3 group-hover:text-[var(--primary)] transition-colors truncate max-w-full leading-tight'>
                            {major._id}
                          </h6>

                          <div className='flex flex-col gap-1.5'>
                            {major.universities.slice(0, 3).map((uni: string, i: number) => (
                              <div key={i} className='flex items-start gap-2.5 min-w-0'>
                                <div className='w-1.5 h-1.5 rounded-full bg-[var(--primary)]/40 mt-1.5 shrink-0 shadow-sm'></div>
                                <span className='text-[10px] md:text-[11px] font-medium text-[color:var(--text-tertiary)] truncate leading-relaxed line-clamp-1'>
                                  {uni}
                                </span>
                              </div>
                            ))}
                            {major.universities.length > 3 && (
                              <span className='text-[9px] md:text-[10px] font-bold text-indigo-500/50 ml-4 italic'>
                                + {major.universities.length - 3} Perguruan Tinggi Lainnya
                              </span>
                            )}
                          </div>
                        </div>

                        <div className='flex flex-col items-center justify-center bg-[color:var(--bg-card)] px-3 py-2.5 rounded-[1rem] border border-[color:var(--border-color)] shadow-sm shrink-0 min-w-[3.5rem] group-hover:border-[var(--primary)] transition-colors'>
                          <span className='text-lg md:text-xl font-black text-[color:var(--text-primary)]'>
                            {major.count}
                          </span>
                          <span className='text-[8px] font-bold text-[color:var(--text-tertiary)] uppercase leading-none mt-1'>
                            Alumni
                          </span>
                        </div>
                      </div>
                    </div>
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
