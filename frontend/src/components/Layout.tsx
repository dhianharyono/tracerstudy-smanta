import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import {
  FaChartBar,
  FaEdit,
  FaUser,
  FaNewspaper,
  FaCommentDots,
  FaUsers,
  FaGraduationCap,
  FaUserTie,
  FaChartLine,
  FaUniversity,
  FaBook,
  FaSignOutAlt,
  FaMedal,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaCrown,
  FaChartPie,
  FaHome,
} from 'react-icons/fa';
import './Layout.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedbackMenuVisible, setFeedbackMenuVisible] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkFeedbackVisibility = async () => {
      try {
        const response = await axios.get(
          '/api/admin/settings/feedback-visible',
        );
        setFeedbackMenuVisible(response.data.visible);
      } catch (error) {
        setFeedbackMenuVisible(true);
      }
    };
    checkFeedbackVisibility();
  }, []);

  // Log page visit
  useEffect(() => {
    // Menu mapping for readable analytics
    const menuMap: { [key: string]: string } = {
      // Alumni
      '/alumni': 'Dashboard Alumni',
      '/alumni/questionnaire': 'Kuesioner',
      '/alumni/events': 'Event Alumni',
      '/alumni/mutual-alumni': 'Rekan Seangkatan',
      '/alumni/news': 'Berita Alumni',
      '/alumni/feedback': 'Kritik & Saran',
      '/alumni/claim-badge': 'Claim Badge',
      '/alumni/profile': 'Profil Alumni',

      // Admin
      '/admin': 'Dashboard Admin',
      '/admin/alumni': 'Data Alumni',
      '/admin/students': 'Data Student',
      '/admin/admins': 'Data Admin',
      '/admin/mentors': 'Kelola Mentor',
      '/admin/events': 'Manajemen Event',
      '/admin/badges': 'Kelola Badge',
      '/admin/news': 'Kelola Berita',
      '/admin/stats': 'Statistik Website',
      '/admin/reports': 'Laporan',
      '/admin/feedback': 'Kritik & Saran Admin',
      '/admin/profile': 'Profil Admin',

      // Student
      '/student': 'Dashboard Siswa',
      '/student/universities': 'Perguruan Tinggi',
      '/student/majors': 'Jurusan',
      '/student/alumni': 'Alumni',
      '/student/college-plan': 'Rencana Angkatan',
      '/student/events': 'Event Siswa',
      '/student/news': 'Berita Siswa',
      '/student/feedback': 'Kritik & Saran Siswa',
      '/student/profile': 'Profil Siswa',
      '/student/alumni-contact': 'Hubungi Alumni',
    };

    if (
      user &&
      user.role !== 'admin' &&
      location.pathname !== '/login' &&
      location.pathname !== '/register'
    ) {
      // Find exact match first, or partial match for dynamic routes if needed
      let menuName = menuMap[location.pathname];

      // Fallback for dynamic routes or unknown paths
      if (!menuName) {
        if (location.pathname.startsWith('/student/events/'))
          menuName = 'Detail Event Siswa';
        else if (location.pathname.startsWith('/alumni/events/'))
          menuName = 'Detail Event Alumni';
        else if (location.pathname.startsWith('/alumni/news/'))
          menuName = 'Detail Berita Alumni';
        else if (location.pathname.startsWith('/student/news/'))
          menuName = 'Detail Berita Siswa';
        else menuName = 'Halaman Lain';
      }

      axios
        .post('/api/analytics/log', {
          path: location.pathname,
          menuName: menuName,
        })
        .catch((err) => console.error('Failed to log visit', err));
    }
  }, [location.pathname, user]);

  const NavLink = ({
    to,
    icon: Icon,
    label,
    activeCheck = false,
  }: {
    to: string;
    icon: any;
    label: string;
    activeCheck?: boolean;
  }) => {
    const isActive = activeCheck
      ? location.pathname.startsWith(to)
      : location.pathname === to;

    return (
      <Link
        to={to}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
            : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] hover:text-[color:var(--text-primary)]'
        }`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            isActive
              ? 'bg-white/20'
              : 'bg-[color:var(--bg-tertiary)] group-hover:bg-white/50 dark:group-hover:bg-black/20'
          }`}
        >
          <Icon className='text-lg' />
        </span>
        <span className='font-medium text-sm'>{label}</span>
        {isActive && <FaChevronRight className='ml-auto text-xs opacity-60' />}
      </Link>
    );
  };

  const getNavLinks = () => {
    if (user?.role === 'alumni') {
      return (
        <div className='space-y-1'>
          <NavLink to='/' icon={FaHome} label='Halaman Utama' />
          <div className='my-2 border-b border-[color:var(--border-color)] opacity-50' />
          <NavLink to='/alumni' icon={FaChartBar} label='Dashboard' />
          <NavLink to='/alumni/questionnaire' icon={FaEdit} label='Kuesioner' />
          <NavLink to='/alumni/events' icon={FaChartBar} label='Event' />
          <NavLink
            to='/alumni/mutual-alumni'
            icon={FaUsers}
            label='Rekan Seangkatan'
          />
          <NavLink
            to='/alumni/news'
            icon={FaNewspaper}
            label='News'
            activeCheck
          />
          {feedbackMenuVisible && (
            <NavLink
              to='/alumni/feedback'
              icon={FaCommentDots}
              label='Kritik & Saran'
            />
          )}
          <NavLink
            to='/alumni/claim-badge'
            icon={FaMedal}
            label='Claim Badge'
          />
          <NavLink to='/alumni/profile' icon={FaUser} label='Profil' />
        </div>
      );
    }

    if (user?.role === 'admin') {
      return (
        <div className='space-y-1'>
          <NavLink to='/' icon={FaHome} label='Halaman Utama' />
          <div className='my-2 border-b border-[color:var(--border-color)] opacity-50' />
          <NavLink to='/admin' icon={FaChartBar} label='Dashboard' />
          <NavLink to='/admin/alumni' icon={FaUsers} label='Data Alumni' />
          <NavLink
            to='/admin/students'
            icon={FaGraduationCap}
            label='Data Student'
          />
          <NavLink
            to='/admin/college-plans'
            icon={FaUniversity}
            label='Rencana Kuliah'
          />
          <NavLink to='/admin/admins' icon={FaUserTie} label='Data Admin' />
          <NavLink to='/admin/mentors' icon={FaCrown} label='Kelola Mentor' />
          <NavLink
            to='/admin/events'
            icon={FaChartBar}
            label='Manajemen Event'
          />
          <NavLink to='/admin/badges' icon={FaMedal} label='Kelola Badge' />
          <NavLink to='/admin/news' icon={FaNewspaper} label='Kelola Berita' />
          <NavLink
            to='/admin/stats'
            icon={FaChartPie}
            label='Statistik Website'
          />
          <NavLink to='/admin/reports' icon={FaChartLine} label='Laporan' />
          <NavLink
            to='/admin/feedback'
            icon={FaCommentDots}
            label='Kritik & Saran'
          />
          <NavLink to='/admin/profile' icon={FaUser} label='Profil' />
        </div>
      );
    }

    if (user?.role === 'student') {
      return (
        <div className='space-y-1'>
          <NavLink to='/' icon={FaHome} label='Halaman Utama' />
          <div className='my-2 border-b border-[color:var(--border-color)] opacity-50' />
          <NavLink to='/student' icon={FaChartBar} label='Dashboard' />
          <NavLink
            to='/student/universities'
            icon={FaUniversity}
            label='Perguruan Tinggi'
          />
          <NavLink to='/student/majors' icon={FaBook} label='Jurusan' />
          <NavLink to='/student/alumni' icon={FaUsers} label='Alumni' />
          <NavLink
            to='/student/alumni-contact'
            icon={FaUserTie}
            label='Hubungi Alumni'
          />
          <NavLink
            to='/student/college-plan'
            icon={FaGraduationCap}
            label='Rencana Angkatan'
          />
          <NavLink to='/student/events' icon={FaChartBar} label='Event' />
          <NavLink
            to='/student/news'
            icon={FaNewspaper}
            label='News'
            activeCheck
          />
          {feedbackMenuVisible && (
            <NavLink
              to='/student/feedback'
              icon={FaCommentDots}
              label='Kritik & Saran'
            />
          )}
          <NavLink to='/student/profile' icon={FaUser} label='Profil' />
        </div>
      );
    }
    return null;
  };

  const getUserInitial = () => user?.username?.charAt(0).toUpperCase() || 'U';

  const getRoleName = () => {
    const roles: { [key: string]: string } = {
      admin: 'Administrator',
      alumni: 'Alumni',
      student: 'Siswa',
    };
    return roles[user?.role || ''] || 'User';
  };

  return (
    <div className='flex h-screen overflow-hidden bg-[color:var(--bg-secondary)]'>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 transform bg-[color:var(--bg-card)] border-r border-[color:var(--border-color)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='p-6'>
            <div className='flex items-center gap-1'>
              <div className='flex items-center justify-center'>
                <img src='/logo.png' alt='Logo' className='h-10 w-1h-10' />
              </div>
              <div className='mt-1'>
                <h1 className='!mb-0 text-lg font-bold leading-tight tracking-tight text-[color:var(--text-primary)]'>
                  TRACER STUDY
                </h1>
                <p className='text-[10px] font-medium text-[color:var(--text-secondary)] uppercase tracking-wider'>
                  SMA N 1 TAWANGSARI
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className='flex-1 overflow-y-auto px-4 py-4 scrollbar-hide'>
            <p className='mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-tertiary)]'>
              Menu Utama
            </p>
            {getNavLinks()}
          </nav>

          {/* User Profile */}
          <div className='border-t border-[color:var(--border-color)] p-4'>
            <div className='rounded-xl bg-[color:var(--bg-tertiary)] p-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white font-bold text-sm'>
                  {getUserInitial()}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold text-[color:var(--text-primary)]'>
                    {user?.profile?.fullName || user?.username}
                  </p>
                  <p className='truncate text-xs text-[color:var(--text-secondary)]'>
                    {getRoleName()}
                  </p>
                </div>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-white/50 dark:hover:bg-black/20 transition-colors'
                  title='Logout'
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className='flex w-0 flex-1 flex-col'>
        {/* Mobile Header */}
        <div className='flex items-center justify-between border-b border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-4 lg:hidden sticky top-0 z-30'>
          <div className='flex items-center gap-1'>
            <div className='flex items-center justify-center'>
              <img src='/logo.png' alt='Logo' className='h-10 w-1h-10' />
            </div>
            <div className='mt-1'>
              <div className='!mb-0 text-sm font-bold leading-tight tracking-tight text-[color:var(--text-primary)]'>
                TRACER STUDY
              </div>
              <p className='text-[8px] font-medium text-[color:var(--text-secondary)] uppercase tracking-wider'>
                SMA N 1 TAWANGSARI
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='rounded-lg p-2 text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)]'
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Page Content */}
        <main
          ref={mainRef}
          className='flex-1 flex flex-col overflow-y-auto scroll-smooth'
        >
          <div className='mx-auto max-w-7xl w-full flex-grow animate-fade-in pb-8'>
            <ToastContainer stacked={false} />
            <Outlet />
          </div>
          <div className='w-full shrink-0 py-4 text-center text-[10px] md:text-sm text-[color:var(--text-tertiary)] bg-[color:var(--bg-card)] border-t border-[color:var(--border-color)]'>
            &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari
          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title='Konfirmasi Logout'
        message='Apakah Anda yakin ingin keluar dari aplikasi?'
        confirmText='Ya, Keluar'
        cancelText='Batal'
      />
    </div>
  );
};

export default Layout;
