import { motion } from 'framer-motion';
import { FaUniversity } from 'react-icons/fa';

const MissionSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className='py-20 px-4 sm:px-6 relative overflow-hidden'
    >
      <div className='max-w-5xl mx-auto'>
        <div className='bg-gradient-to-br from-[color:var(--bg-card)] to-[color:var(--bg-secondary)] p-8 md:p-16 rounded-[40px] border border-[color:var(--border-color)] shadow-2xl relative'>
          <div className='absolute top-0 right-0 p-8 opacity-5'>
            <FaUniversity size={120} />
          </div>

          <div className='relative z-10 space-y-10'>
            <div className='space-y-4'>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className='text-xl md:text-3xl font-black text-[color:var(--text-primary)] leading-tight'
              >
                Menavigasi Persimpangan Jalan Siswa <br className='hidden md:block' />
                <span className='text-[var(--primary)]'>Setelah Lulus Sekolah</span>
              </motion.h3>
              <div className='w-16 h-1 bg-[var(--primary)] rounded-full'></div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-10 items-start'>
              <div className='space-y-4'>
                <p className='text-sm md:text-lg text-[color:var(--text-secondary)] leading-relaxed italic border-l-4 border-blue-500/30 pl-6'>
                  "Masa transisi setelah SMA adalah persimpangan jalan yang menantang. Tanpa data yang terintegrasi, siswa seringkali melangkah tanpa arah, sementara hubungan berharga dengan alumni terputus begitu saja."
                </p>
              </div>
              <div className='space-y-6'>
                <p className='text-sm md:text-lg font-medium text-[color:var(--text-primary)] leading-relaxed'>
                  Tracer Study SMANTA hadir untuk{' '}
                  <span className='text-blue-400 font-bold'>
                    mengubah data menjadi peta jalan
                  </span>
                  , memastikan setiap jejak alumni menjadi inspirasi dan panduan nyata bagi adik-adik yang akan menyusul ke jenjang berikutnya.
                </p>
                <div className='flex items-center gap-4 pt-2'>
                  <div className='flex -space-x-2'>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className='w-10 h-10 rounded-full border-2 border-[color:var(--bg-card)] bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white'
                      >
                        {i === 1 ? 'Data' : i === 2 ? 'Peta' : 'Arah'}
                      </div>
                    ))}
                  </div>
                  <span className='text-xs font-bold text-[color:var(--text-tertiary)] uppercase tracking-widest'>
                    Inspirasi & Panduan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default MissionSection;
