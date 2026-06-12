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
    <div className='bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-blue-600 selection:text-white'>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-md border-b border-slate-200/50 py-2.5'
          : 'bg-transparent py-4'
          }`}
      >
        <div className='w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 flex justify-between items-center transition-all duration-300'>
          <div className='flex items-center gap-2 md:gap-3'>
            <img
              src='/logo.png'
              alt='Smanta Logo'
              className='h-8 w-8 md:h-12 md:w-12 filter drop-shadow-sm'
            />
            <div className='block'>
              <div className={`text-xs md:text-lg font-black leading-none tracking-tight transition-colors duration-300 ${isScrolled ? 'text-slate-900' : 'text-white'
                }`}>
                TRACER STUDY
              </div>
              <p className={`text-[7px] md:text-[10px] uppercase font-bold tracking-wider mt-0.5 transition-colors duration-300 ${isScrolled ? 'text-slate-500' : 'text-blue-100/80'
                }`}>
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
                  className={`flex items-center gap-1.5 text-[10px] md:text-sm font-bold px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-lg transition-all hover:scale-105 duration-300 ${isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/45'
                    : 'bg-white text-blue-600 shadow-black/10 hover:bg-blue-50'
                    }`}
                >
                  <span className='whitespace-nowrap'>Dashboard</span>
                </Link>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className={`text-[10px] md:text-sm font-semibold transition-colors px-1 md:px-4 py-2 ${isScrolled ? 'text-red-500 hover:text-red-650' : 'text-red-200 hover:text-red-100'
                    }`}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  className={`flex items-center gap-1 text-[10px] md:text-sm font-semibold transition-colors px-2 md:px-4 py-2 ${isScrolled ? 'text-slate-650 hover:text-blue-600' : 'text-white/90 hover:text-white'
                    }`}
                >
                  <span>Login</span>
                </Link>
                <Link
                  to='/register'
                  className={`flex items-center gap-1 text-[10px] md:text-sm font-extrabold px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-lg transition-all hover:scale-105 duration-300 ${isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-605 text-white shadow-blue-500/25 hover:shadow-blue-500/45'
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

      <HeroSection stats={stats} loading={loading} />
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
        className='py-24 px-4 sm:px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden'
      >
        {/* Modern decorative rings */}
        <div className='absolute top-[-50px] left-[-50px] w-96 h-96 border-4 border-white/5 rounded-full pointer-events-none'></div>
        <div className='absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] border-8 border-white/5 rounded-full pointer-events-none'></div>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none'></div>

        <div className='max-w-4xl mx-auto text-center relative z-10 space-y-8 md:space-y-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className='text-2xl md:text-5xl font-black text-white leading-tight tracking-tight'
          >
            Siap Menjadi Bagian Dari Perubahan Besar?
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='text-sm md:text-xl text-blue-100/90 max-w-2xl mx-auto px-4 md:px-0 font-medium leading-relaxed'
          >
            Mari berkontribusi untuk SMANTA, almamater kita tercinta. Daftar dan
            berikan kontribusi Anda sekarang juga, hanya butuh waktu 2 menit!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='flex flex-row gap-4 justify-center px-4 md:px-0'
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
                className='bg-white text-blue-700 px-6 py-3.5 md:px-10 md:py-4.5 rounded-full font-black text-sm md:text-base shadow-xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200'
              >
                Kembali ke Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to='/register'
                  className='bg-white text-blue-700 px-6 py-3.5 md:px-8 md:py-4.5 rounded-full font-black text-xs md:text-base shadow-xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200'
                >
                  Kontribusi Sekarang
                </Link>
                <Link
                  to='/login'
                  className='bg-blue-800/40 backdrop-blur-md text-white border-2 border-white/30 px-6 py-3 md:px-8 md:py-4 rounded-full font-black text-xs md:text-base hover:bg-blue-800/60 hover:scale-105 active:scale-95 transition-all duration-200'
                >
                  Masuk Kembali
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Premium Footer */}
      <footer className='bg-white border-t border-slate-200/80 pt-16 pb-12 px-4 sm:px-6 relative z-10'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100'>
            {/* Branding Column */}
            <div className='md:col-span-6 space-y-4 text-center md:text-left'>
              <div className='flex items-center justify-center md:justify-start gap-3'>
                <img src='/logo.png' alt='Logo' className='h-12 w-12 filter drop-shadow-sm' />
                <div>
                  <h5 className='text-base font-extrabold text-slate-900 tracking-tight leading-none'>
                    TRACER STUDY SMANTA
                  </h5>
                  <p className='text-[10px] text-slate-400 font-black tracking-wider mt-1.5 uppercase'>
                    SMAN 1 Tawangsari
                  </p>
                </div>
              </div>
              <p className='text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto md:mx-0'>
                Platform pemetaan studi lanjut alumni untuk mewujudkan kolaborasi nyata antara sekolah, siswa, dan alumni.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className='md:col-span-3 text-center md:text-left' />

            {/* Developed By Column */}
            <div className='md:col-span-3 text-center md:text-left space-y-3'>
              <h6 className='text-xs font-black text-slate-400 uppercase tracking-widest mb-4'>
                Pengembang
              </h6>
              <p className='text-sm text-slate-500 font-medium leading-relaxed'>
                Aplikasi ini dikembangkan untuk mendukung digitalisasi data alumni SMANTA.
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
          <div className='pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 text-center md:text-left'>
            <div>
              &copy; {new Date().getFullYear()} SMAN 1 Tawangsari. All rights reserved.
            </div>
            <div className='flex gap-6'>
              <span className='hover:text-slate-600 transition-colors cursor-pointer'>
                Syarat & Ketentuan
              </span>
              <span className='hover:text-slate-600 transition-colors cursor-pointer'>
                Kebijakan Privasi
              </span>
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
      />
    </div>
  );
};

export default LandingPage;
