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
      className='py-20 px-4 sm:px-6'
    >
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-16 space-y-4'
        >
          <h3 className='text-2xl md:text-4xl font-black text-[color:var(--text-primary)]'>
            Apa Kata Alumni & Siswa?
          </h3>
          <div className='w-16 md:w-20 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full'></div>
          <p className='text-sm md:text-base text-[color:var(--text-secondary)]'>
            Suara komunitas tentang peran Tracer Study bagi kemajuan SMANTA.
          </p>
        </motion.div>

        {loading ? (
          <div className='flex overflow-x-auto pb-12 gap-6 md:gap-8 snap-x no-scrollbar w-full'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='min-w-[280px] sm:min-w-[320px] md:min-w-[400px] snap-center bg-[color:var(--bg-card)] p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-[color:var(--border-color)] shadow-xl animate-pulse flex flex-col h-[250px] md:h-[300px]'>
                <div className='w-8 h-8 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 md:mb-6'></div>
                <div className='space-y-3 mb-6 md:mb-8 flex-grow mt-2'>
                  <div className='h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-full'></div>
                  <div className='h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6'></div>
                  <div className='h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5'></div>
                </div>
                <div className='flex items-center gap-3 md:gap-4 mt-auto'>
                  <div className='w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-200 dark:bg-gray-700 shrink-0'></div>
                  <div className='space-y-2 flex-grow'>
                    <div className='h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-32'></div>
                    <div className='h-2 md:h-3 bg-gray-200 dark:bg-gray-700 rounded w-20'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex overflow-x-auto pb-12 gap-6 md:gap-8 snap-x no-scrollbar'>
            {testimonials.length > 0 ? (
              testimonials.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className='min-w-[280px] sm:min-w-[320px] md:min-w-[400px] snap-center bg-[color:var(--bg-card)] p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-[color:var(--border-color)] shadow-xl relative overflow-hidden flex flex-col'
                >
                  <FaQuoteLeft className='text-3xl md:text-4xl text-blue-50/20 mb-4 md:mb-6' />
                  <p className='text-sm md:text-base text-[color:var(--text-primary)] italic leading-relaxed mb-6 md:mb-8 flex-grow'>
                    "
                    {item.kritik ||
                      item.saran ||
                      'Tracer Study ini sangat membantu kami untuk tetap terhubung dan berbagi informasi.'}
                    "
                  </p>
                  <div className='flex items-center gap-3 md:gap-4 mt-auto'>
                    <div className='w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg'>
                      A
                    </div>
                    <div>
                      <h6 className='text-sm md:text-base font-bold text-[color:var(--text-primary)]'>
                        Anonymous
                      </h6>
                      <p className='text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-widest'>
                        {item.user?.role || 'Alumni'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className='w-full text-center py-16 md:py-20 bg-[color:var(--bg-tertiary)] rounded-2xl border-2 border-dashed border-[color:var(--border-color)]'>
                <p className='text-xs md:text-sm text-[color:var(--text-tertiary)] italic'>
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
