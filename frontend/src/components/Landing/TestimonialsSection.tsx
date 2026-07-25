import { motion } from 'framer-motion';
import { FaQuoteLeft } from 'react-icons/fa';

import { Testimonial } from '@/types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  loading: boolean;
}

const TestimonialsSection = ({ testimonials, loading }: TestimonialsSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className='py-20 px-4 sm:px-6 bg-white border-t border-slate-200/50'
    >
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16 space-y-4'
        >
          <h3 className='text-3xl md:text-4xl font-bold text-slate-900 tracking-tight'>
            Apa Kata Alumni & Siswa?
          </h3>
          <div className='w-16 md:w-20 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 mx-auto rounded-full'></div>
          <p className='text-sm md:text-base text-slate-500 font-medium'>
            Suara komunitas tentang peran Tracer Study bagi kemajuan SMANTA.
          </p>
        </motion.div>

        {loading ? (
          <div className='flex overflow-x-auto pt-4 pb-8 px-2 -mt-4 gap-6 md:gap-8 snap-x no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='min-w-[280px] sm:min-w-[320px] md:min-w-[400px] snap-center bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-md animate-pulse flex flex-col h-[250px] md:h-[300px]'>
                <div className='w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full mb-4 md:mb-6'></div>
                <div className='space-y-3 mb-6 md:mb-8 flex-grow mt-2'>
                  <div className='h-3 md:h-4 bg-slate-100 rounded w-full'></div>
                  <div className='h-3 md:h-4 bg-slate-100 rounded w-5/6'></div>
                  <div className='h-3 md:h-4 bg-slate-100 rounded w-4/5'></div>
                </div>
                <div className='flex items-center gap-3 md:gap-4 mt-auto'>
                  <div className='w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 shrink-0'></div>
                  <div className='space-y-2 flex-grow'>
                    <div className='h-3 md:h-4 bg-slate-100 rounded w-32'></div>
                    <div className='h-2 md:h-3 bg-slate-100 rounded w-20'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex overflow-x-auto pt-4 pb-8 px-2 -mt-4 gap-6 md:gap-8 snap-x no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
            {testimonials.length > 0 ? (
              testimonials.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.92, x: 30 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.215, 0.61, 0.355, 1.0] }}
                  whileHover={{ y: -4, scale: 1.015 }}
                  className='min-w-[280px] sm:min-w-[320px] md:min-w-[400px] snap-center bg-slate-50/40 p-6 md:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col hover:bg-white hover:shadow-xl transition-all duration-300 cursor-default group'
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <FaQuoteLeft className='text-3xl md:text-4xl text-blue-500/20 group-hover:text-blue-500/40 mb-4 md:mb-6 transition-colors' />
                  </motion.div>
                  <p className='text-sm md:text-base text-slate-700 italic leading-relaxed mb-6 md:mb-8 flex-grow font-medium'>
                    "
                    {item.kritik ||
                      item.saran ||
                      'Tracer Study ini sangat membantu kami untuk tetap terhubung dan berbagi informasi.'}
                    "
                  </p>
                  <div className='flex items-center gap-3 md:gap-4 mt-auto relative z-10'>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className='w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-650 flex items-center justify-center text-white font-bold text-lg shadow-md'
                    >
                      A
                    </motion.div>
                    <div>
                      <h6 className='text-sm md:text-base font-extrabold text-slate-900'>
                        Anonymous
                      </h6>
                      <p className='text-[10px] md:text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5'>
                        {item.user?.role === 'student' ? 'Siswa' : item.user?.role === 'school' ? 'Sekolah' : 'Alumni'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className='w-full text-center py-16 md:py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200/70'>
                <p className='text-xs md:text-sm text-slate-400 font-semibold italic'>
                  Belum ada testimoni terbaru.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;

