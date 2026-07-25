import { motion, Variants } from 'framer-motion';
import { FaUniversity } from 'react-icons/fa';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1.0] as const },
  },
};

const MissionSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className='py-20 px-4 sm:px-6 relative overflow-hidden bg-slate-50'
    >
      <div className='max-w-5xl mx-auto'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          className='bg-white p-8 md:p-16 rounded-[2.5rem] border border-slate-200/80 shadow-xl relative overflow-hidden'
        >
          {/* Floating subtle background element */}
          <motion.div
            animate={{ rotate: [0, 8, 0], scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
            className='absolute top-6 right-6 p-8 text-blue-600/5 pointer-events-none'
          >
            <FaUniversity size={130} />
          </motion.div>

          <div className='relative z-10 space-y-10'>
            <motion.div variants={itemVariants} className='space-y-4'>
              <h3 className='text-xl md:text-3xl font-bold text-slate-900 leading-tight tracking-tight'>
                Menavigasi Persimpangan Jalan Siswa <br className='hidden md:block' />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
                  Setelah Lulus Sekolah
                </span>
              </h3>
              <div className='w-16 h-1.5 bg-blue-600 rounded-full'></div>
            </motion.div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-10 items-start'>
              <motion.div variants={itemVariants} className='space-y-4'>
                <motion.p
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className='text-sm md:text-base text-slate-600 leading-relaxed italic border-l-4 border-blue-500/40 pl-6 bg-slate-50/70 py-4 pr-4 rounded-r-2xl font-medium shadow-sm cursor-default'
                >
                  "Masa transisi setelah SMA adalah persimpangan jalan yang menantang. Tanpa data yang terintegrasi, siswa seringkali melangkah tanpa arah, sementara hubungan berharga dengan alumni terputus begitu saja."
                </motion.p>
              </motion.div>
              <motion.div variants={itemVariants} className='space-y-6 pt-2'>
                <p className='text-sm md:text-base font-semibold text-slate-700 leading-relaxed'>
                  Tracer Study SMANTA hadir untuk{' '}
                  <span className='text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded'>
                    mengubah data menjadi peta jalan
                  </span>
                  , memastikan setiap jejak alumni menjadi inspirasi dan panduan nyata bagi adik-adik yang akan menyusul ke jenjang berikutnya.
                </p>
                <div className='flex items-center gap-4 pt-2'>
                  <div className='flex -space-x-2'>
                    {[
                      { text: 'Data', bg: 'bg-blue-600' },
                      { text: 'Peta', bg: 'bg-indigo-600' },
                      { text: 'Arah', bg: 'bg-violet-600' }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.25, zIndex: 10, rotate: i % 2 === 0 ? 5 : -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className={`w-10 h-10 rounded-full border-2 border-white ${item.bg} flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-pointer relative`}
                      >
                        {item.text}
                      </motion.div>
                    ))}
                  </div>
                  <span className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest'>
                    Inspirasi & Panduan
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MissionSection;

