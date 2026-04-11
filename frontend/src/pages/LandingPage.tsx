import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    };
    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='bg-[color:var(--bg-primary)] min-h-screen font-sans selection:bg-[var(--primary)] selection:text-white'>
      {/* Navigation Overlay */}
      <motion.nav
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[color:var(--bg-card)]/80 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center'>
          <div className='flex items-center gap-2 md:gap-3'>
            <img
              src='/logo.png'
              alt='Smanta Logo'
              className='h-8 w-8 md:h-12 md:w-12'
            />
            <div className='block'>
              <div className='text-xs md:text-lg font-bold text-[color:var(--text-primary)] leading-none tracking-tight'>
                TRACER STUDY
              </div>
              <p className='text-[7px] md:text-[10px] text-[color:var(--text-secondary)] uppercase font-semibold'>
                SMAN 1 Tawangsari
              </p>
            </div>
          </div>
          <div className='flex items-center gap-1.5 md:gap-4'>
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
                  className='flex items-center gap-1.5 text-[10px] md:text-sm font-bold bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white px-3 md:px-6 py-1.5 md:py-2.5 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all'
                >
                  <span className='whitespace-nowrap'>Dashboard</span>
                </Link>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className='text-[10px] md:text-sm font-medium text-red-500 hover:text-red-600 transition-colors px-1 md:px-4 py-2'
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  className='flex items-center gap-1 text-[10px] md:text-sm font-medium text-[color:var(--text-secondary)] hover:text-[var(--primary)] transition-colors px-1 md:px-4 py-2'
                >
                  <span className='sm:inline'>Login</span>
                </Link>
                <Link
                  to='/register'
                  className='flex items-center gap-1 text-[10px] md:text-sm font-bold bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white px-3 md:px-6 py-1.5 md:py-2.5 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all'
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

      <HeroSection stats={stats} loading={loading} />
      <MissionSection />
      <FeaturesSection />
      <StatsSection stats={stats} loading={loading} />
      <TestimonialsSection testimonials={testimonials} loading={loading} />

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className='py-20 px-4 sm:px-6 bg-[var(--primary)] relative overflow-hidden'
      >
        <div className='absolute top-0 right-0 w-[400px] md:w-[600px] h-full bg-blue-400 skew-x-[-20deg] translate-x-1/2 opacity-20 hidden md:block'></div>
        <div className='max-w-4xl mx-auto text-center relative z-10 space-y-8 md:space-y-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className='text-2xl md:text-4xl font-black text-white leading-tight'
          >
            Siap Menjadi Bagian Dari Perubahan Besar?
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-base md:text-xl text-blue-50/80 max-w-2xl mx-auto px-4 md:px-0'
          >
            Mari berkontribusi untuk SMANTA, almamater kita tercinta. Daftar dan
            berikan kontribusi Anda sekarang juga, hanya butuh waktu 2 menit!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='flex flex-col-2 sm:flex-row gap-4 md:gap-6 justify-center px-6 md:px-0'
          >
            {user ? (
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : user.role === 'student'
                      ? '/student'
                      : '/alumni'
                }
                className='bg-white text-[var(--primary)] px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-3xl font-black text-sm md:text-lg shadow-2xl hover:scale-105 transition-all'
              >
                Kembali ke Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to='/register'
                  className='text-xs md:text-sm bg-white text-[var(--primary)] px-3 py-3 md:px-10 md:py-5 rounded-xl md:rounded-3xl font-black text-lg md:text-xl shadow-2xl hover:scale-105 transition-all'
                >
                  Kontribusi Sekarang
                </Link>
                <Link
                  to='/login'
                  className='text-xs md:text-sm bg-blue-700/30 backdrop-blur-md text-white border-2 border-white/30 px-3 py-3 md:px-10 md:py-5 rounded-xl md:rounded-3xl font-black text-lg md:text-xl hover:bg-blue-700/50 transition-all'
                >
                  Masuk Kembali
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Simple Footer */}
      <footer className='py-10 md:py-12 border-t border-[color:var(--border-color)] px-4 sm:px-6'>
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8'>
          <div className='flex flex-col md:flex-row items-center gap-4 md:gap-4'>
            <div className='flex items-center gap-3'>
              <img src='/logo.png' alt='Logo' className='h-14 w-14' />
            </div>
            <div className='text-xs text-[color:var(--text-tertiary)] font-bold text-center md:text-left'>
              &copy; {new Date().getFullYear()} SMAN 1 Tawangsari
            </div>
          </div>

          <div className='flex items-center gap-1 text-[10px] md:text-xs font-bold text-[color:var(--text-tertiary)] opacity-60 hover:opacity-100 transition-opacity'>
            <span>Developed by</span>
            <a
              href='https://cetha-tech.vercel.app/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[color:var(--text-secondary)] hover:text-[var(--primary)] transition-colors'
            >
              Cetha Technologies
            </a>
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
      />
    </div>
  );
};

export default LandingPage;
