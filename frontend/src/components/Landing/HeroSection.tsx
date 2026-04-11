import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { LandingPageStats } from '@/types';

interface HeroSectionProps {
  stats: LandingPageStats | null;
  loading: boolean;
}

const HeroSection = ({ stats, loading }: HeroSectionProps) => {
  return (
    <section className='relative pt-24 pb-16 md:pt-32 md:pb-32 overflow-hidden px-4 sm:px-6'>
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px]'></div>
        <div className='absolute bottom-[-5%] left-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-indigo-500/10 rounded-full blur-[60px] md:blur-[100px]'></div>
      </div>

      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center'>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='space-y-6 md:space-y-8 text-center lg:text-left'
        >
          <div className='inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border border-blue-500/20 mx-auto lg:mx-0'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500'></span>
            </span>
            Tracker Study SMANTA
          </div>
          <div className='text-3xl sm:text-4xl md:text-6xl font-black text-[color:var(--text-primary)] leading-[1.2] md:leading-[1.1] tracking-tight'>
            Membangun{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-blue-500'>
              Database dan Kolaborasi
            </span>{' '}
            Alumni SMANTA
          </div>
          <p className='text-sm md:text-lg text-[color:var(--text-secondary)] leading-relaxed max-w-2xl mx-auto lg:mx-0 px-4 sm:px-0'>
            Bukan sekedar database alumni, tapi jembatan komunikasi dan informasi antara siswa, alumni, dan sekolah.
          </p>
          <div className='flex flex-col-2 sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start px-4 sm:px-0'>
            <Link
              to='/register'
              className='text-xs md:text-lg flex items-center justify-center bg-[var(--primary)] text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-blue-500/40 hover:bg-blue-600 hover:shadow-blue-500/60 hover:-translate-y-1 transition-all'
            >
              Mulai Kontribusi
            </Link>
            <a
              href='#stats'
              className='text-xs md:text-lg flex items-center justify-center bg-[color:var(--bg-card)] text-[color:var(--text-primary)] px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg border border-[color:var(--border-color)] hover:bg-[color:var(--bg-tertiary)] transition-all'
            >
              Lihat Statistik
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='relative pt-10 lg:pt-0'
        >
          <div className='relative z-10 w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 md:border-4 border-white/10 group bg-[color:var(--bg-tertiary)]'>
            <div className='absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-all duration-300'></div>
            <img
              src='/smanta.webp'
              alt='Alumni SMANTA'
              className='w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-all duration-700 min-h-[250px] md:min-h-[400px]'
            />
            <div className='absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 p-4 md:p-6 rounded-xl md:rounded-2xl bg-[color:var(--bg-card)]/80 backdrop-blur-md border border-white/10 text-white'>
              <p className='text-xs md:text-sm font-medium italic opacity-90'>
                "SMANTA Juara! SMA Kita Tercinta"
              </p>
              <div className='flex items-center gap-3 md:gap-4 mt-2'>
                <div className='flex -space-x-2 md:-space-x-3'>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className='w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-indigo-400 bg-gray-200 overflow-hidden'
                    >
                      <img
                        src={`https://i.pravatar.cc/100?img=${i + 20}`}
                        alt='avatar'
                      />
                    </div>
                  ))}
                </div>
                <span className='text-[10px] md:text-xs font-bold text-blue-200'>
                  +{loading ? '...' : (stats?.totalAlumni || 0)} Alumni Terhubung
                </span>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className='absolute -top-6 -left-6 md:-top-10 md:-left-10 w-24 h-24 md:w-32 md:h-32 bg-blue-500/20 rounded-full -z-10 blur-xl md:blur-2xl'></div>
          <div className='absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-32 h-32 md:w-48 md:h-48 bg-indigo-500/20 rounded-full -z-10 blur-2xl md:blur-3xl'></div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
