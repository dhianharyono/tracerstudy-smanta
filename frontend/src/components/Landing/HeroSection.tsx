import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { LandingPageStats } from '@/types';

interface HeroSectionProps {
  stats: LandingPageStats | null;
  loading: boolean;
}

const HeroSection = ({ stats, loading }: HeroSectionProps) => {
  return (
    <section className='relative min-h-[85vh] lg:min-h-[100vh] flex items-center pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden px-4 sm:px-6 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 text-white'>
      {/* Dot Grid Pattern Overlay */}
      <div className='absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0'></div>

      {/* Geometric Hexagon Outlines (Inspired by tracerstudy.co.id) */}
      <div className='absolute inset-y-0 right-0 w-1/2 overflow-hidden pointer-events-none opacity-20 lg:opacity-25 hidden lg:block z-0'>
        <svg
          className='absolute right-[-10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] text-white'
          fill='none'
          stroke='currentColor'
          strokeWidth='1'
          viewBox='0 0 100 100'
        >
          <polygon
            points='50,5 90,25 90,75 50,95 10,75 10,25'
            className='stroke-white/10'
          />
          <polygon
            points='50,15 80,30 80,70 50,85 20,70 20,30'
            className='stroke-white/15'
          />
          <polygon
            points='50,25 70,35 70,65 50,75 30,65 30,35'
            className='stroke-white/20'
          />
          <line
            x1='50'
            y1='5'
            x2='50'
            y2='95'
            className='stroke-white/5'
            strokeDasharray='2 2'
          />
          <line
            x1='10'
            y1='25'
            x2='90'
            y2='75'
            className='stroke-white/5'
            strokeDasharray='2 2'
          />
          <line
            x1='10'
            y1='75'
            x2='90'
            y2='25'
            className='stroke-white/5'
            strokeDasharray='2 2'
          />
        </svg>
      </div>

      {/* Concentric Circle Accents */}
      <div className='absolute right-[-10%] top-[10%] lg:right-[5%] lg:top-[5%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] pointer-events-none z-0 opacity-40 lg:opacity-50'>
        <div className='absolute inset-0 border border-white/10 rounded-full animate-[spin_120s_linear_infinite]'></div>
        <div className='absolute inset-[12%] border border-white/10 rounded-full border-dashed animate-[spin_80s_linear_infinite]'></div>
        <div className='absolute inset-[28%] border border-white/5 rounded-full'></div>
      </div>

      {/* Soft Glow effects */}
      <div className='absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-400/15 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0'></div>
      <div className='absolute bottom-[-15%] right-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-indigo-400/20 rounded-full blur-[60px] md:blur-[100px] pointer-events-none z-0'></div>

      <div className='max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10'>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='space-y-6 md:space-y-8 text-center lg:text-left lg:col-span-7'
        >
          <div className='inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-[10px] md:text-xs font-extrabold uppercase tracking-widest mx-auto lg:mx-0 shadow-inner'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
            </span>
            Tracer Study SMANTA
          </div>

          <h1 className='text-4xl sm:text-6xl lg:text-6xl font-black leading-[1.08] tracking-tight text-white'>
            Membangun <br className='hidden lg:block' />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-50'>
              Database & Kolaborasi
            </span>{' '}
            Alumni SMANTA
          </h1>

          <p className='text-sm sm:text-base md:text-lg text-blue-50/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium'>
            Bukan sekadar database alumni, tapi jembatan komunikasi dan
            kolaborasi yang nyata antara siswa, alumni, dan sekolah SMAN 1
            Tawangsari.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 sm:px-0 pt-2 h-auto sm:h-14'>
            <Link
              to='/register'
              className='text-xs md:text-base flex items-center justify-center gap-2 bg-white text-blue-600 hover:text-blue-700 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black shadow-xl shadow-blue-950/20 hover:scale-105 active:scale-95 transition-all duration-200 group'
            >
              Mulai Kontribusi
            </Link>
            <a
              href='#stats'
              className='text-xs md:text-base flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 hover:border-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200'
            >
              Lihat Statistik
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='relative lg:col-span-5 flex justify-center lg:justify-end mt-4 lg:mt-0'
        >
          {/* Main Visual Wrapper with concentric rotating outer rings */}
          <div className='relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px] flex items-center justify-center'>
            {/* Outer animated dashed ring */}
            <div className='absolute w-full h-full border-2 border-dashed border-white/20 rounded-full animate-[spin_80s_linear_infinite] pointer-events-none'></div>
            {/* Inner reverse rotating dashed ring */}
            <div className='absolute w-[90%] h-[90%] border border-white/10 rounded-full border-dotted animate-[spin_50s_linear_infinite_reverse] pointer-events-none'></div>
            {/* Soft border ring */}
            <div className='absolute w-[82%] h-[82%] border-2 border-white/5 rounded-full pointer-events-none'></div>

            {/* Circular School Image Frame */}
            <div className='absolute w-[76%] h-[76%] rounded-full overflow-hidden border-[6px] border-white/20 shadow-2xl bg-white/5 backdrop-blur-sm group z-10'>
              <div className='absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent group-hover:from-blue-900/10 transition-all duration-500 z-10'></div>
              <img
                src='/smanta.webp'
                alt='Alumni SMANTA'
                className='w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-all duration-700'
              />
            </div>

            {/* Floating glass badge: Total Alumni */}
            <div className='absolute top-[8%] left-[-2%] z-20 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 text-slate-800 shadow-xl flex items-center gap-2.5 animate-bounce [animation-duration:6s]'>
              <div className='flex -space-x-2 md:-space-x-2.5'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='w-6 h-6 rounded-full border border-white bg-slate-200 overflow-hidden shrink-0 shadow-sm'
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 20}`}
                      alt='Alumni Avatar'
                      className='w-full h-full object-cover'
                    />
                  </div>
                ))}
              </div>
              <div className='text-left'>
                <p className='text-[8px] font-extrabold uppercase tracking-wider text-blue-600'>
                  Total Alumni
                </p>
                <p className='text-[10px] font-black text-slate-800'>
                  +{loading ? '...' : stats?.totalAlumni || 0} Alumni
                </p>
              </div>
            </div>

            {/* Floating glass badge: Data Accuracy */}
            <div className='absolute bottom-[10%] right-[-4%] z-20 py-2.5 px-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 text-slate-800 shadow-xl flex items-center gap-2 animate-bounce [animation-duration:5s] [animation-delay:1.5s]'>
              <div className='p-1 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0 border border-green-100'>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='3'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <div className='text-left'>
                <p className='text-[8px] font-extrabold uppercase tracking-wider text-green-600'>
                  Status Data
                </p>
                <p className='text-[10px] font-black text-slate-800'>
                  100% Terverifikasi
                </p>
              </div>
            </div>

            {/* Floating text badge: SMANTA Juara */}
            <div className='absolute top-[16%] right-[0%] z-20 py-1.5 px-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-lg flex items-center gap-1 animate-pulse [animation-duration:4s]'>
              <span className='text-[9px] font-black tracking-widest uppercase'>
                SMANTA Juara!
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
