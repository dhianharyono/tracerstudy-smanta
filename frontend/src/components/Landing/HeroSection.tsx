import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { LandingPageStats } from '@/types';

interface HeroSectionProps {
  stats: LandingPageStats | null;
  loading: boolean;
}

const HeroSection = ({ stats, loading }: HeroSectionProps) => {
  return (
    <section className='relative pt-32 pb-20 md:pt-44 md:pb-36 overflow-hidden px-4 sm:px-6 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 text-white'>
      {/* Concentric Circle Accents (Matching the Reference Image Concept) */}
      <div className='absolute right-[-10%] top-[10%] lg:right-[5%] lg:top-[5%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] pointer-events-none -z-0 opacity-40 lg:opacity-60'>
        <div className='absolute inset-0 border border-white/10 rounded-full animate-[spin_120s_linear_infinite]'></div>
        <div className='absolute inset-[10%] border border-white/15 rounded-full border-dashed animate-[spin_80s_linear_infinite]'></div>
        <div className='absolute inset-[25%] border border-white/10 rounded-full'></div>
        <div className='absolute inset-[40%] border border-white/15 rounded-full border-dotted'></div>
        <div className='absolute inset-[55%] border border-white/5 rounded-full'></div>
      </div>

      {/* Soft Glow effects */}
      <div className='absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-400/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none'></div>
      <div className='absolute bottom-[-15%] right-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-indigo-400/25 rounded-full blur-[60px] md:blur-[100px] pointer-events-none'></div>

      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10'>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='space-y-6 md:space-y-8 text-center lg:text-left lg:col-span-7'
        >
          <div className='inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-[10px] md:text-xs font-extrabold uppercase tracking-widest mx-auto lg:mx-0'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
            </span>
            Tracer Study SMANTA
          </div>

          <h1 className='text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] md:leading-[1.1] tracking-tight text-white'>
            Membangun <br className='hidden md:block' />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-50 to-blue-100'>
              Database dan Kolaborasi
            </span>{' '}
            Alumni SMANTA
          </h1>

          <p className='text-sm md:text-lg text-blue-50/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium'>
            Bukan sekadar database alumni, tapi jembatan komunikasi dan kolaborasi yang nyata antara siswa, alumni, dan sekolah SMAN 1 Tawangsari.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 sm:px-0'>
            <Link
              to='/register'
              className='text-xs md:text-base flex items-center justify-center gap-2 bg-white text-blue-600 hover:text-blue-700 px-8 py-4 rounded-full font-black shadow-xl shadow-blue-950/20 hover:scale-105 active:scale-95 transition-all duration-200'
            >
              Mulai Kontribusi
            </Link>
            <a
              href='#stats'
              className='text-xs md:text-base flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 hover:border-white px-8 py-4 rounded-full font-black hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200'
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
          className='relative lg:col-span-5 flex justify-center lg:justify-end'
        >
          {/* Main School visual wrapper with curved outline design */}
          <div className='relative z-10 w-full max-w-[450px] aspect-[4/3] sm:aspect-square md:aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 bg-white/5 backdrop-blur-sm group'>
            <div className='absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent group-hover:from-blue-900/10 transition-all duration-500 z-10'></div>
            <img
              src='/smanta.webp'
              alt='Alumni SMANTA'
              className='w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-all duration-700'
            />

            {/* Floating glass card showing connected alumni */}
            <div className='absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white text-slate-800 shadow-xl z-20 transition-all duration-300 group-hover:translate-y-[-4px]'>
              <p className='text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-1.5'>
                SMANTA Juara!
              </p>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-2.5'>
                  <div className='flex -space-x-2 md:-space-x-3'>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className='w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shrink-0 shadow-sm'
                      >
                        <img
                          src={`https://i.pravatar.cc/100?img=${i + 20}`}
                          alt='Alumni Avatar'
                          className='w-full h-full object-cover'
                        />
                      </div>
                    ))}
                  </div>
                  <span className='text-[10px] md:text-xs font-black text-slate-700 whitespace-nowrap'>
                    +{loading ? '...' : (stats?.totalAlumni || 0)} Alumni
                  </span>
                </div>
                <span className='text-[9px] md:text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100'>
                  Terhubung
                </span>
              </div>
            </div>
          </div>

          {/* Extra decorative blobs */}
          <div className='absolute -top-6 -left-6 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl pointer-events-none'></div>
          <div className='absolute -bottom-6 -right-6 w-28 h-28 bg-blue-300/30 rounded-full blur-2xl pointer-events-none'></div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
