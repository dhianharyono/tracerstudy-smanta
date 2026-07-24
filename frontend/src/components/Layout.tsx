import { useState, useEffect, useRef, Suspense } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import SmartLoader from './SmartLoader';
import RestrictedAccess from './RestrictedAccess';
import { isNameIncomplete, isUniversityIncomplete } from '../utils/validation';
import { isStudentProfileComplete } from '../utils/helpers';
import {
  FaChartBar,
  FaEdit,
  FaUser,
  FaNewspaper,
  FaCommentDots,
  FaUsers,
  FaGraduationCap,
  FaUserTie,
  FaUniversity,
  FaBuilding,
  FaBook,
  FaSignOutAlt,
  FaMedal,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaCrown,
  FaChartPie,
  FaHome,
  FaSync,
  FaBriefcase,
  FaUserShield,
  FaHistory,
} from 'react-icons/fa';
import './Layout.css';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedbackMenuVisible, setFeedbackMenuVisible] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [sidebarCounts, setSidebarCounts] = useState<{
    unrepliedFeedback: number;
    pendingJobs: number;
  }>({ unrepliedFeedback: 0, pendingJobs: 0 });
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
    if (user?.role === 'admin') {
      fetchSidebarCounts();
      const interval = setInterval(fetchSidebarCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [location.pathname, user]);

  const fetchSidebarCounts = async () => {
    try {
      const response = await axios.get('/api/admin/sidebar-counts');
      setSidebarCounts({
        unrepliedFeedback: response.data.unrepliedFeedback || 0,
        pendingJobs: response.data.pendingJobs || 0,
      });
    } catch (error) {
      console.error('Error fetching admin sidebar counts:', error);
    }
  };

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
      '/alumni/universities': 'Perguruan Tinggi',
      '/alumni/majors': 'Jurusan',
      '/alumni/alumni': 'Alumni',

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
      '/admin/manage-universities': 'Kelola Universitas',
      '/admin/universities': 'Perguruan Tinggi',
      '/admin/majors': 'Jurusan',
      '/admin/feedback': 'Kritik & Saran Admin',
      '/admin/profile': 'Profil Admin',

      // Student
      '/student': 'Dashboard Siswa',
      '/student/universities': 'Perguruan Tinggi',
      '/student/majors': 'Jurusan',
      '/student/alumni': 'Alumni',

      '/student/events': 'Event Siswa',
      '/student/news': 'Berita Siswa',
      '/student/feedback': 'Kritik & Saran Siswa',
      '/student/profile': 'Profil Siswa',

      // School
      '/school': 'Dashboard Sekolah',
      '/school/alumni': 'Data Alumni Sekolah',
      '/school/universities': 'Perguruan Tinggi Sekolah',
      '/school/majors': 'Jurusan Sekolah',
      '/school/feedback': 'Kritik & Saran Sekolah',
      '/school/profile': 'Profil Monitoring',
      '/jobs': 'Bursa Kerja',
      '/alumni/jobs': 'Kelola Loker Saya',
      '/admin/jobs': 'Bursa Kerja',
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
    badgeCount,
    activeCheck = false,
  }: {
    to: string;
    icon: any;
    label: string;
    badgeCount?: number;
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
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <span className='ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-sm shadow-red-500/50 animate-pulse'>
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
        {isActive && (!badgeCount || badgeCount <= 0) && (
          <FaChevronRight className='ml-auto text-xs opacity-60' />
        )}
      </Link>
    );
  };

  const getNavLinks = () => {
    const SectionLabel = ({ label }: { label: string }) => (
      <p className='mt-6 mb-2 px-4 text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-tertiary)] opacity-80'>
        {label}
      </p>
    );

    if (user?.role === 'alumni') {
      return (
        <div className='space-y-1 pb-4'>
          <NavLink to='/' icon={FaHome} label='Halaman Utama' />

          <SectionLabel label='Dashboard' />
          <NavLink to='/alumni' icon={FaChartBar} label='Dashboard' />
          <NavLink to='/alumni/questionnaire' icon={FaEdit} label='Kuesioner' />

          <SectionLabel label='Eksplorasi' />
          <NavLink
            to='/alumni/universities'
            icon={FaUniversity}
            label='Perguruan Tinggi'
          />
          <NavLink to='/alumni/majors' icon={FaBook} label='Jurusan' />
          <NavLink to='/alumni/alumni' icon={FaUsers} label='Alumni' />
          <NavLink
            to='/alumni/mutual-alumni'
            icon={FaUsers}
            label='Rekan Seangkatan'
          />

          <SectionLabel label='Sosial & Berita' />
          <NavLink to='/alumni/events' icon={FaChartBar} label='Event' />
          <NavLink
            to='/alumni/news'
            icon={FaNewspaper}
            label='News'
            activeCheck
          />

          <SectionLabel label='Karir & Bursa Kerja' />
          <NavLink to='/jobs' icon={FaBriefcase} label='Bursa Kerja' />
          <NavLink to='/alumni/jobs' icon={FaBriefcase} label='Loker Saya' />

          <SectionLabel label='Lainnya' />
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
        <div className='space-y-1 pb-4'>
          <NavLink to='/' icon={FaHome} label='Halaman Utama' />

          <SectionLabel label='Dashboard & Statistik' />
          <NavLink to='/admin' icon={FaChartBar} label='Dashboard' />
          <NavLink
            to='/admin/stats'
            icon={FaChartPie}
            label='Statistik Website'
          />

          <SectionLabel label='Manajemen Pengguna' />
          <NavLink to='/admin/alumni' icon={FaUsers} label='Data Alumni' />
          <NavLink
            to='/admin/students'
            icon={FaGraduationCap}
            label='Data Student'
          />
          <NavLink to='/admin/admins' icon={FaUserShield} label='Data Admin' />
          <NavLink to='/admin/mentors' icon={FaCrown} label='Kelola Mentor' />
          <NavLink
            to='/admin/school-users'
            icon={FaUserTie}
            label='Kelola User Sekolah'
          />

          <SectionLabel label='Eksplorasi & Data' />
          <NavLink
            to='/admin/universities'
            icon={FaUniversity}
            label='Perguruan Tinggi'
          />
          <NavLink to='/admin/majors' icon={FaBook} label='Jurusan' />
          <NavLink
            to='/admin/manage-universities'
            icon={FaBuilding}
            label='Kelola Universitas'
            activeCheck
          />

          <SectionLabel label='Konten & Moderasi' />
          <NavLink
            to='/admin/events'
            icon={FaChartBar}
            label='Manajemen Event'
          />
          <NavLink to='/admin/badges' icon={FaMedal} label='Kelola Badge' />
          <NavLink to='/admin/news' icon={FaNewspaper} label='Kelola Berita' />
          <NavLink
            to='/admin/jobs'
            icon={FaBriefcase}
            label='Bursa Kerja'
            badgeCount={sidebarCounts.pendingJobs}
          />

          <SectionLabel label='Audit & Feedback' />
          <NavLink
            to='/admin/verification-logs'
            icon={FaHistory}
            label='Verifikasi Data'
          />
          <NavLink
            to='/admin/feedback'
            icon={FaCommentDots}
            label='Kritik & Saran'
            badgeCount={sidebarCounts.unrepliedFeedback}
          />

          <SectionLabel label='Akun' />
          <NavLink to='/admin/profile' icon={FaUser} label='Profil' />
        </div>
      );
    }

    if ((user?.role as string) === 'school') {
      return (
        <div className='space-y-1 pb-4'>
          <NavLink to='/' icon={FaHome} label='Halaman Utama' />

          <SectionLabel label='Monitoring' />
          <NavLink to='/school' icon={FaChartBar} label='Dashboard' />
          <NavLink to='/school/alumni' icon={FaUsers} label='Data Alumni' />
          <NavLink
            to='/school/universities'
            icon={FaUniversity}
            label='Perguruan Tinggi'
          />
          <NavLink to='/school/majors' icon={FaBook} label='Jurusan' />
          <NavLink
            to='/school/verification'
            icon={FaSync}
            label={user?.schoolRole === 'bk' ? 'Verifikasi Data' : 'Monitoring Sync Data'}
          />
          <SectionLabel label='Lainnya' />
          <NavLink
            to='/school/feedback'
            icon={FaCommentDots}
            label='Kritik & Saran'
          />
          <NavLink to='/school/profile' icon={FaUser} label='Profil' />
        </div>
      );
    }

    if (user?.role === 'student') {
      return (
        <div className='space-y-1 pb-4'>
          <NavLink to='/' icon={FaHome} label='Halaman Utama' />

          <SectionLabel label='Eksplorasi Alumni' />
          <NavLink to='/student' icon={FaChartBar} label='Dashboard' />
          <NavLink
            to='/student/universities'
            icon={FaUniversity}
            label='Perguruan Tinggi'
          />
          <NavLink to='/student/majors' icon={FaBook} label='Jurusan' />
          <NavLink to='/student/alumni' icon={FaUsers} label='Alumni' />

          <SectionLabel label='Informasi' />
          <NavLink to='/student/events' icon={FaChartBar} label='Event' />
          <NavLink
            to='/student/news'
            icon={FaNewspaper}
            label='News'
            activeCheck
          />

          <SectionLabel label='Lainnya' />
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
          school: 'Pihak Sekolah',
    };
    return roles[user?.role || ''] || 'User';
  };

  const getRestrictedAccessComponent = () => {
    if (!user) return null;
    const path = location.pathname;
    const isProfilePage = path.endsWith('/profile');
    const isQuestionnairePage = path === '/alumni/questionnaire';

    if (isProfilePage) return null;

    if (user.isHidden) {
      return <RestrictedAccess type='hidden_user' role={(user.role === 'admin' ? 'alumni' : user.role) as any} />;
    }

    if (user.role === 'student') {
      if (!isStudentProfileComplete(user)) {
        return <RestrictedAccess type='profile_incomplete' role='student' />;
      }
      if (isNameIncomplete(user)) {
        return <RestrictedAccess type='name_incomplete' role='student' />;
      }
    }

    if (user.role === 'alumni') {
      if (isQuestionnairePage) return null;

      if (!user.questionnaireCompleted) {
        return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
      }
      if (isNameIncomplete(user)) {
        return <RestrictedAccess type='name_incomplete' role='alumni' />;
      }
      if (isUniversityIncomplete(user)) {
        return <RestrictedAccess type='university_incomplete' role='alumni' />;
      }
    }

    return null;
  };

  const restrictedComponent = getRestrictedAccessComponent();

  return (
    <div className='flex h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] transition-colors duration-200 overflow-hidden font-sans'>
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[color:var(--border-color)] bg-[color:var(--bg-card)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className='flex h-[72px] shrink-0 items-center justify-between px-6 border-b border-[color:var(--border-color)]'>
          <Link
            to={
              user
                ? user.role === 'admin'
                  ? '/admin'
                  : user.role === 'alumni'
                  ? '/alumni'
                  : user.role === 'student'
                  ? '/student'
                  : '/school'
                : '/'
            }
            className='flex items-center gap-3 group'
          >
            <div className='flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-105'>
              <img src='/logo.png' alt='Logo SMANTA' className='h-10 w-10 object-contain' />
            </div>
            <div className='flex flex-col'>
              <span className='font-bold text-[color:var(--text-primary)] text-sm tracking-tight leading-none group-hover:text-[var(--primary)] transition-colors'>
                TRACER STUDY
              </span>
              <span className='text-[9px] font-semibold text-[color:var(--text-tertiary)] uppercase tracking-wider mt-1'>
                SMAN 1 TAWANGSARI
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className='rounded-lg p-1.5 text-[color:var(--text-tertiary)] hover:bg-[color:var(--bg-tertiary)] hover:text-[color:var(--text-primary)] lg:hidden'
          >
            <FaTimes />
          </button>
        </div>

        {/* Nav Links */}
        <nav className='flex-1 overflow-y-auto px-4 py-4 scrollbar-hide'>
          {getNavLinks()}
        </nav>

        {/* User Footer Profile */}
        <div className='p-4 border-t border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/50'>
          <div className='flex items-center justify-between gap-3'>
            <Link
              to={
                user?.role === 'admin'
                  ? '/admin/profile'
                  : user?.role === 'alumni'
                  ? '/alumni/profile'
                  : user?.role === 'student'
                  ? '/student/profile'
                  : '/school/profile'
              }
              className='flex items-center gap-3 min-w-0 flex-1 group hover:opacity-80 transition-opacity'
            >
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--primary)] to-blue-400 text-white font-bold text-sm shadow-sm'>
                {getUserInitial()}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-[color:var(--text-primary)] group-hover:text-[var(--primary)] transition-colors'>
                  {user?.profile?.fullName || user?.username}
                </p>
                <p className='truncate text-xs text-[color:var(--text-secondary)]'>
                  {getRoleName()}
                </p>
              </div>
            </Link>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-white/50 dark:hover:bg-black/20 transition-colors'
              title='Logout'
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Mobile Header */}
        <div className='flex h-[72px] shrink-0 items-center justify-between border-b border-[color:var(--border-color)] bg-[color:var(--bg-card)] px-4 lg:hidden'>
          <div className='flex items-center gap-1'>
            <div className='flex items-center justify-center'>
              <img src='/logo.png' alt='Logo' className='h-10 w-10' />
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
          <div className='w-full flex-grow flex flex-col animate-fade-in pb-8'>
            {restrictedComponent ? (
              restrictedComponent
            ) : (
              <Suspense
                fallback={
                  <SmartLoader
                    messages={[
                      'Memuat halaman...',
                      'Menyiapkan data...',
                      'Mohon tunggu sebentar...',
                    ]}
                  />
                }
              >
                <Outlet />
              </Suspense>
            )}
          </div>
          <div className='w-full shrink-0 py-4 text-center text-[10px] md:text-sm text-[color:var(--text-tertiary)] bg-[color:var(--bg-card)] border-t border-[color:var(--border-color)]'>
            &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari. All right reserved.
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
        theme='light'
      />
    </div>
  );
};

export default Layout;
