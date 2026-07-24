import { motion } from 'framer-motion';
import { FaGraduationCap, FaUsers, FaSchool } from 'react-icons/fa';

const FeaturesSection = () => {
  return (
    <section className='py-20 px-4 sm:px-6 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-20 space-y-4'
        >
          <h3 className='text-3xl md:text-4xl font-bold text-slate-900 tracking-tight'>
            Fitur Siswa, Alumni, dan Sekolah
          </h3>
          <div className='w-16 md:w-20 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 mx-auto rounded-full'></div>
          <p className='text-sm md:text-base text-slate-500 max-w-2xl mx-auto font-medium'>
            Dirancang untuk memudahkan interaksi dan memberikan manfaat nyata bagi seluruh ekosistem SMANTA.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10'>
          {/* Student Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='bg-blue-50/30 p-6 md:p-8 rounded-[2.5rem] border border-blue-100/70 shadow-md relative overflow-hidden group hover:shadow-2xl hover:bg-white hover:scale-[1.03] transition-all duration-300'
          >
            <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full group-hover:scale-110 transition-transform'></div>
            <div className='relative z-10'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-12 h-12 md:w-14 md:h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300'>
                  <FaGraduationCap size={24} className='md:w-[28px] md:h-[28px]' />
                </div>
                <h4 className='text-xl md:text-2xl font-bold text-slate-900'>
                  Untuk Siswa
                </h4>
              </div>
              <ul className='space-y-4 md:space-y-5'>
                {[
                  {
                    title: 'Eksplorasi Kampus',
                    desc: 'Lihat data persebaran alumni di berbagai universitas favorit.',
                  },
                  {
                    title: 'Daftar Jurusan',
                    desc: 'Identifikasi jurusan paling populer dan diminati alumni.',
                  },
                  {
                    title: 'Informasi Pekerjaan Alumni',
                    desc: 'Temukan informasi pekerjaan yang diminati oleh alumni.',
                  },
                  {
                    title: 'Hubungi Alumni',
                    desc: 'Konsultasi langsung dengan alumni yang berpengalaman.',
                  },
                  {
                    title: 'Berita Terkini',
                    desc: 'Dapatkan informasi terbaru seputar SMANTA.',
                  },
                ].map((f, i) => (
                  <li key={i} className='flex gap-4 group/item'>
                    <div className='mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0 group-hover/item:scale-125 transition-transform'></div>
                    <div>
                      <p className='text-sm md:text-base font-extrabold text-slate-800 mb-0.5 group-hover/item:text-blue-600 transition-colors'>
                        {f.title}
                      </p>
                      <p className='text-xs text-slate-500 leading-relaxed font-medium'>
                        {f.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Alumni Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className='bg-indigo-50/30 p-6 md:p-8 rounded-[2.5rem] border border-indigo-100/70 shadow-md relative overflow-hidden group hover:shadow-2xl hover:bg-white hover:scale-[1.03] transition-all duration-300'
          >
            <div className='absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full group-hover:scale-110 transition-transform'></div>
            <div className='relative z-10'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-12 h-12 md:w-14 md:h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300'>
                  <FaUsers size={24} className='md:w-[28px] md:h-[28px]' />
                </div>
                <h4 className='text-xl md:text-2xl font-bold text-slate-900'>
                  Untuk Alumni
                </h4>
              </div>
              <ul className='space-y-4 md:space-y-5'>
                {[
                  {
                    title: 'Tracer Survey',
                    desc: 'Laporkan perkembangan karir Anda untuk data sekolah.',
                  },
                  {
                    title: 'Rekan Seangkatan',
                    desc: 'Temukan dan terhubung kembali dengan teman lama.',
                  },
                  {
                    title: 'Badge Prestasi',
                    desc: 'Dapatkan lencana penghargaan atas kontribusi Anda untuk SMANTA.',
                  },
                  {
                    title: 'Program Mentorship',
                    desc: 'Berikan bimbingan kepada adik-adik kelas SMANTA.',
                  },
                  {
                    title: 'Bursa Lowongan Kerja',
                    desc: 'Cari dan dapatkan informasi lowongan kerja yang sesuai.',
                  },
                ].map((f, i) => (
                  <li key={i} className='flex gap-4 group/item'>
                    <div className='mt-2 w-2 h-2 rounded-full bg-indigo-500 shrink-0 group-hover/item:scale-125 transition-transform'></div>
                    <div>
                      <p className='text-sm md:text-base font-extrabold text-slate-800 mb-0.5 group-hover/item:text-indigo-600 transition-colors'>
                        {f.title}
                      </p>
                      <p className='text-xs text-slate-500 leading-relaxed font-medium'>
                        {f.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* School Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='bg-emerald-50/30 p-6 md:p-8 rounded-[2.5rem] border border-emerald-100/70 shadow-md relative overflow-hidden group hover:shadow-2xl hover:bg-white hover:scale-[1.03] transition-all duration-300 md:col-span-2 lg:col-span-1'
          >
            <div className='absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform'></div>
            <div className='relative z-10'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-12 h-12 md:w-14 md:h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300'>
                  <FaSchool size={24} className='md:w-[28px] md:h-[28px]' />
                </div>
                <h4 className='text-xl md:text-2xl font-bold text-slate-900'>
                  Untuk Sekolah
                </h4>
              </div>
              <ul className='space-y-4 md:space-y-5'>
                {[
                  {
                    title: 'Monitoring Real-time',
                    desc: 'Pantau perkembangan data alumni secara langsung dan akurat.',
                  },
                  {
                    title: 'Statistik Pendidikan',
                    desc: 'Analisis persebaran alumni di berbagai perguruan tinggi favorit.',
                  },
                  {
                    title: 'Statistik Jurusan',
                    desc: 'Analisis jurusan yang diminati oleh alumni.',
                  },
                  {
                    title: 'Validasi Data',
                    desc: 'Verifikasi kevalidan data alumni untuk keperluan administrasi.',
                  },
                  {
                    title: 'Manajemen Data',
                    desc: 'Kelola dan organisir data alumni untuk keperluan sekolah.',
                  },
                ].map((f, i) => (
                  <li key={i} className='flex gap-4 group/item'>
                    <div className='mt-2 w-2 h-2 rounded-full bg-emerald-500 shrink-0 group-hover/item:scale-125 transition-transform'></div>
                    <div>
                      <p className='text-sm md:text-base font-extrabold text-slate-800 mb-0.5 group-hover/item:text-emerald-600 transition-colors'>
                        {f.title}
                      </p>
                      <p className='text-xs text-slate-500 leading-relaxed font-medium'>
                        {f.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
