import { useState, useEffect } from 'react';
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
  FaBars,
  FaTimes,
  FaChevronRight,
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedbackMenuVisible, setFeedbackMenuVisible] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkFeedbackVisibility = async () => {
      try {
        const response = await axios.get(
          '/api/admin/settings/feedback-visible'
        );
        setFeedbackMenuVisible(response.data.visible);
      } catch (error) {
        setFeedbackMenuVisible(true);
      }
    };
    checkFeedbackVisibility();
  }, []);

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
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
          ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
          : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] hover:text-[color:var(--text-primary)]'
          }`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isActive
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
          <NavLink to='/alumni' icon={FaChartBar} label='Dashboard' />
          <NavLink to='/alumni/questionnaire' icon={FaEdit} label='Kuesioner' />
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
          <NavLink to='/alumni/mutual-alumni' icon={FaUser} label='Rekan Sepantaran' />
          <NavLink to='/alumni/profile' icon={FaUser} label='Profil' />
        </div>
      );
    }

    if (user?.role === 'admin') {
      return (
        <div className='space-y-1'>
          <NavLink to='/admin' icon={FaChartBar} label='Dashboard' />
          <NavLink to='/admin/alumni' icon={FaUsers} label='Data Alumni' />
          <NavLink
            to='/admin/students'
            icon={FaGraduationCap}
            label='Data Student'
          />
          <NavLink to='/admin/admins' icon={FaUserTie} label='Data Admin' />
          <NavLink to='/admin/news' icon={FaNewspaper} label='Kelola Berita' />
          <NavLink to='/admin/reports' icon={FaChartLine} label='Laporan' />
          <NavLink
            to='/admin/feedback'
            icon={FaCommentDots}
            label='Kritik & Saran'
          />
        </div>
      );
    }

    if (user?.role === 'student') {
      return (
        <div className='space-y-1'>
          <NavLink to='/student' icon={FaChartBar} label='Dashboard' />
          <NavLink
            to='/student/universities'
            icon={FaUniversity}
            label='Perguruan Tinggi'
          />
          <NavLink to='/student/majors' icon={FaBook} label='Jurusan' />
          <NavLink to='/student/alumni' icon={FaUsers} label='Alumni' />
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
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 transform bg-[color:var(--bg-card)] border-r border-[color:var(--border-color)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='p-6'>
            <div className='flex items-center gap-3 px-2'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--primary)] to-blue-400 text-white shadow-lg shadow-blue-500/30'>
                <FaChartLine className='text-lg' />
              </div>
              <div>
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
                    {user?.username}
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
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white'>
              <FaChartLine className='text-sm' />
            </div>
            <span className='font-bold text-[color:var(--text-primary)]'>
              Tracer Study
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='rounded-lg p-2 text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)]'
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Page Content */}
        <main className='flex-1 flex flex-col overflow-y-auto scroll-smooth'>
          <div className='mx-auto max-w-7xl w-full flex-grow animate-fade-in pb-8'>
            <Outlet />
          </div>
          <div className='w-full shrink-0 py-4 text-center text-[10px] md:text-sm text-[color:var(--text-tertiary)] bg-[color:var(--bg-card)] border-t border-[color:var(--border-color)]'>
            &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari |
            SMANTAUPDATE
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
