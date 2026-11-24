import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import ConfirmationModal from '@/components/ConfirmationModal';
import 'react-toastify/dist/ReactToastify.css';

import HeroSection from '@/components/Landing/HeroSection';
import MissionSection from '@/components/Landing/MissionSection';
import FeaturesSection from '@/components/Landing/FeaturesSection';
import StatsSection from '@/components/Landing/StatsSection';
import TestimonialsSection from '@/components/Landing/TestimonialsSection';
import { useLandingPageData } from '@/hooks/useLandingPageData';

const LandingPage = () => {
  const { user, logout } = useAuth();
  const { stats, testimonials, loading } = useLandingPageData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout. Sampai jumpa lagi!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 300);
    };
    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-blue-600 selection:text-white'>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-md border-b border-slate-200/50 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.625rem)]'
          : 'bg-transparent pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]'
          }`}
      >
        <div className='w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 flex justify-between items-center transition-all duration-300'>
          <div className='flex items-center gap-1.5 sm:gap-2 md:gap-3'>
            <img
              src='/logo.png'
              alt='Smanta Logo'
              className='h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 filter drop-shadow-sm'
            />
            <div className='block'>
              <div
                className={`text-[10px] sm:text-xs md:text-lg font-bold leading-none tracking-tight transition-colors duration-300 ${isScrolled ? 'text-slate-900' : 'text-white'
                  }`}
              >
                TRACER STUDY
              </div>
              <p
                className={`text-[7.5px] sm:text-[9px] md:text-[10px] uppercase font-bold tracking-wider mt-0.5 transition-colors duration-300 ${isScrolled ? 'text-slate-500' : 'text-blue-100/80'
                  }`}
              >
                SMAN 1 Tawangsari
              </p>
            </div>
          </div>
          <div className='flex items-center gap-1 sm:gap-1.5 md:gap-4'>
            {user ? (
              <>
                <Link
                  to={
                    user.role === 'admin'
                      ? '/admin'
                      : user.role === 'student'
                        ? '/student'
                        : '/alumni'
                  }
                  className={`flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-bold px-2.5 py-1 min-h-[26px] sm:px-4 sm:py-1.5 sm:min-h-[32px] md:px-6 md:py-2.5 md:min-h-[40px] rounded-full shadow-md transition-all hover:scale-105 duration-300 ${isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/45'
                    : 'bg-white text-blue-600 shadow-black/10 hover:bg-blue-50'
                    }`}
                >
                  <span className='whitespace-nowrap'>Dashboard</span>
                </Link>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className={`text-[11px] sm:text-xs md:text-sm font-semibold transition-colors px-1.5 sm:px-2.5 md:px-4 min-h-[26px] sm:min-h-[32px] md:min-h-[40px] inline-flex items-center cursor-pointer ${isScrolled
                    ? 'text-red-500 hover:text-red-650'
                    : 'text-red-200 hover:text-red-100'
                    }`}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  className={`flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-semibold transition-colors px-1.5 sm:px-2.5 md:px-3.5 min-h-[26px] sm:min-h-[32px] md:min-h-[40px] ${isScrolled
                    ? 'text-slate-650 hover:text-blue-600'
                    : 'text-white/90 hover:text-slate-300'
                    }`}
                >
                  <span>Login</span>
                </Link>
                <Link
                  to='/register'
                  className={`flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-extrabold px-2.5 py-1 min-h-[26px] sm:px-4 sm:py-1.5 sm:min-h-[32px] md:px-6 md:py-2.5 md:min-h-[40px] rounded-full shadow-md transition-all hover:scale-105 duration-300 ${isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/45'
                    : 'bg-white text-blue-600 shadow-black/10 hover:bg-blue-50'
                    }`}
                >
                  <span className='whitespace-nowrap sm:inline hidden'>
                    Kontribusi Sekarang
                  </span>
                  <span className='whitespace-nowrap sm:hidden inline'>
                    Kontribusi
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      <HeroSection stats={stats} loading={loading} user={user} />
      <MissionSection />
      <FeaturesSection />
      <StatsSection stats={stats} loading={loading} />
      <TestimonialsSection testimonials={testimonials} loading={loading} />

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className='py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden'
      >
        {/* Modern decorative rings */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 90, ease: 'linear' }}
          className='absolute top-[-50px] left-[-50px] w-96 h-96 border-4 border-white/5 rounded-full pointer-events-none'
        />
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ repeat: Infinity, duration: 120, ease: 'linear' }}
          className='absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] border-8 border-white/5 rounded-full pointer-events-none'
        />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none'></div>

        <div className='max-w-4xl mx-auto text-center relative z-10 space-y-8 md:space-y-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-xl sm:text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight'
          >
            Siap jadi Bagian Dari Perubahan ?
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-xs sm:text-base md:text-xl text-blue-100/90 max-w-2xl mx-auto px-2 md:px-0 font-medium leading-relaxed'
          >
            Mari berkontribusi untuk SMANTA, almamater kita tercinta.{' '}
            <br className='hidden sm:block' />
            Daftar dan berikan kontribusi Anda sekarang juga,{' '}
            <br className='hidden sm:block' />
            hanya butuh waktu 2 menit!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 md:px-0 max-w-xs sm:max-w-none mx-auto'
          >
            {user ? (
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className='w-full sm:w-auto'
              >
                <Link
                  to={
                    user.role === 'admin'
                      ? '/admin'
                      : user.role === 'student'
                        ? '/student'
                        : '/alumni'
                  }
                  className='w-full sm:w-auto bg-white text-blue-700 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full font-bold text-xs sm:text-sm md:text-base shadow-xl hover:bg-slate-50 transition-colors inline-flex justify-center items-center'
                >
                  Kembali ke Dashboard
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className='w-full sm:w-auto'
                >
                  <Link
                    to='/register'
                    className='w-full sm:w-auto bg-white text-blue-700 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full font-bold text-xs sm:text-sm md:text-base shadow-xl hover:bg-slate-50 transition-colors inline-flex justify-center items-center'
                  >
                    Kontribusi Sekarang
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className='w-full sm:w-auto'
                >
                  <Link
                    to='/login'
                    className='w-full sm:w-auto bg-blue-800/40 backdrop-blur-md text-white border-2 border-white/30 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full font-bold text-xs sm:text-sm md:text-base hover:bg-blue-800/60 transition-colors inline-flex justify-center items-center'
                  >
                    Masuk Kembali
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Premium Footer */}
      <footer className='bg-white border-t border-slate-200/80 pt-12 sm:pt-16 pb-24 sm:pb-12 px-4 sm:px-6 relative z-10'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100'>
            {/* Branding Column */}
            <div className='md:col-span-6 space-y-4 text-center md:text-left'>
              <div className='flex items-center justify-center md:justify-start gap-3'>
                <img
                  src='/logo.png'
                  alt='Logo'
                  className='h-12 w-12 filter drop-shadow-sm'
                />
                <div>
                  <h5 className='text-base font-extrabold text-slate-900 tracking-tight leading-none'>
                    TRACER STUDY SMANTA
                  </h5>
                  <p className='text-[10px] text-slate-400 font-bold tracking-wider mt-1.5 uppercase'>
                    SMAN 1 Tawangsari
                  </p>
                </div>
              </div>
              <p className='text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto md:mx-0'>
                Platform Tracer Study ini dibuat untuk memudahkan pemetaan lulusan SMA Negeri 1 Tawangsari dan dapat digunakan sebagai referensi para siswa dalam menentukan arah studi lanjut.
              </p>
            </div>

            {/* Quick Links Column (placeholder, hanya untuk ruang di desktop) */}
            <div className='hidden md:block md:col-span-3' />

            {/* Developed By Column */}
            <div className='md:col-span-3 text-center md:text-left space-y-3'>
              <h6 className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-4'>
                Pengembang
              </h6>
              <p className='text-sm text-slate-500 font-medium leading-relaxed'>
                Aplikasi ini dikembangkan untuk mendukung digitalisasi data
                alumni SMANTA.
              </p>
              <div className='inline-flex items-center justify-center md:justify-start gap-1 text-xs font-bold text-slate-400'>
                <span>Developed by</span>
                <a
                  href='https://cetha-tech.vercel.app/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-slate-600 hover:text-blue-600 transition-colors border-b border-dashed border-slate-300 hover:border-blue-600 font-extrabold pb-0.5'
                >
                  Cetha Technologies
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className='pt-8 pb-4 sm:pb-0 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 text-center md:text-left'>
            <div>
              &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari.
            </div>
            <div className='flex flex-wrap justify-center gap-6'>
              <button
                type='button'
                className='hover:text-slate-600 focus:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded transition-colors cursor-pointer py-1'
              >
                Syarat &amp; Ketentuan
              </button>
              <button
                type='button'
                className='hover:text-slate-600 focus:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded transition-colors cursor-pointer py-1'
              >
                Kebijakan Privasi
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Logout Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          handleLogout();
          setIsLogoutModalOpen(false);
        }}
        title='Konfirmasi Keluar'
        message='Apakah Anda yakin ingin keluar dari akun Anda?'
        confirmText='Ya, Keluar'
        cancelText='Batal'
        variant='danger'
        theme='light'
      />

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 sm:bottom-6 sm:right-6 z-50 p-3 sm:p-4 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all border border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 flex items-center justify-center'
            aria-label='Scroll to top'
          >
            <FaArrowUp className='text-lg' />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
