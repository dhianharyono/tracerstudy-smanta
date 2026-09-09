import { useState, useEffect, useRef, Suspense } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import SmartLoader from './SmartLoader';
import RestrictedAccess from './RestrictedAccess';
import Profile from '../pages/Profile';
import { isNameIncomplete, isUniversityIncomplete } from '../utils/validation';
import { isStudentProfileComplete } from '../utils/helpers';
import {
  FaUser,
  FaHome,
  FaNewspaper,
  FaCommentDots,
  FaUsers,
  FaGraduationCap,
  FaUserTie,
  FaUniversity,
  FaBuilding,
  FaSignOutAlt,
  FaMedal,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaChevronDown,
  FaCrown,
  FaChartPie,
  FaSync,
  FaBriefcase,
  FaUserShield,
  FaHistory,
  FaThLarge,
  FaClipboardList,
  FaBookOpen,
  FaUserFriends,
  FaCalendarAlt,
} from 'react-icons/fa';
import './Layout.css';
import 'react-toastify/dist/ReactToastify.css';

const menuMap: Record<string, string> = {
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
  '/admin/college-plans': 'Rencana Kuliah',
  '/admin/manage-universities': 'Kelola Universitas',
  '/admin/universities': 'Perguruan Tinggi',
  '/admin/majors': 'Jurusan',
  '/admin/feedback': 'Kritik & Saran Admin',
  '/admin/profile': 'Profil Admin',

  // Student
  '/student': 'Dashboard Siswa',
  '/student/college-plan': 'Rencana Studi & Match',
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

const getPageTitle = (pathname: string): string => {
  if (menuMap[pathname]) return menuMap[pathname];
  if (pathname.startsWith('/student/events/')) return 'Detail Event Siswa';
  if (pathname.startsWith('/alumni/events/')) return 'Detail Event Alumni';
  if (pathname.startsWith('/alumni/news/')) return 'Detail Berita Alumni';
  if (pathname.startsWith('/student/news/')) return 'Detail Berita Siswa';
  if (pathname.startsWith('/admin/news/')) return 'Detail Berita Admin';
  return 'Dashboard';
};

const getMenuCategory = (pathname: string, role?: string): string => {
  // Alumni routes
  if (role === 'alumni' || pathname.startsWith('/alumni')) {
    if (pathname === '/alumni' || pathname === '/alumni/questionnaire') {
      return 'Navigasi Utama';
    }
    if (
      pathname === '/alumni/alumni' ||
      pathname === '/alumni/universities' ||
      pathname === '/alumni/majors' ||
      pathname === '/alumni/mutual-alumni'
    ) {
      return 'Jejaring & Alumni';
    }
    if (
      pathname.startsWith('/alumni/events') ||
      pathname.startsWith('/alumni/news')
    ) {
      return 'Informasi & Berita';
    }
    if (pathname === '/jobs' || pathname === '/alumni/jobs') {
      return 'Karir & Bursa Kerja';
    }
    if (pathname === '/alumni/claim-badge' || pathname === '/alumni/feedback') {
      return 'Akun & Lainnya';
    }
  }

  // Admin routes
  if (role === 'admin' || pathname.startsWith('/admin')) {
    if (pathname === '/admin' || pathname === '/admin/stats') {
      return 'Navigasi & Analitik';
    }
    if (
      pathname === '/admin/alumni' ||
      pathname === '/admin/students' ||
      pathname === '/admin/admins' ||
      pathname === '/admin/mentors' ||
      pathname === '/admin/school-users'
    ) {
      return 'Manajemen Pengguna';
    }
    if (
      pathname === '/admin/college-plans' ||
      pathname === '/admin/universities' ||
      pathname === '/admin/majors' ||
      pathname === '/admin/manage-universities'
    ) {
      return 'Data Master & Kampus';
    }
    if (
      pathname.startsWith('/admin/news') ||
      pathname.startsWith('/admin/events') ||
      pathname === '/admin/jobs' ||
      pathname === '/admin/badges'
    ) {
      return 'Konten & Bursa Kerja';
    }
    if (
      pathname === '/admin/verification-logs' ||
      pathname === '/admin/feedback'
    ) {
      return 'Audit & Bantuan';
    }
  }

  // Student routes
  if (role === 'student' || pathname.startsWith('/student')) {
    if (pathname === '/student') {
      return 'Navigasi Utama';
    }
    if (pathname === '/student/college-plan') {
      return 'Smart Tools';
    }
    if (
      pathname === '/student/alumni' ||
      pathname === '/student/universities' ||
      pathname === '/student/majors'
    ) {
      return 'Eksplorasi Kampus & Alumni';
    }
    if (
      pathname.startsWith('/student/events') ||
      pathname.startsWith('/student/news')
    ) {
      return 'Informasi & Berita';
    }
    if (pathname === '/student/feedback') {
      return 'Akun & Bantuan';
    }
  }

  // School routes
  if (role === 'school' || pathname.startsWith('/school')) {
    if (pathname === '/school') {
      return 'Navigasi Utama';
    }
    if (
      pathname === '/school/alumni' ||
      pathname === '/school/universities' ||
      pathname === '/school/majors' ||
      pathname === '/school/verification'
    ) {
      return 'Monitoring & Data';
    }
    if (pathname === '/school/feedback') {
      return 'Akun & Bantuan';
    }
  }

  if (pathname === '/jobs') return 'Karir & Bursa Kerja';
  return 'Navigasi';
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedbackMenuVisible, setFeedbackMenuVisible] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [sidebarCounts, setSidebarCounts] = useState<{
    unrepliedFeedback: number;
    pendingJobs: number;
  }>({ unrepliedFeedback: 0, pendingJobs: 0 });
  const mainRef = useRef<HTMLElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown or modal on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserDropdownOpen(false);
        setIsProfileModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

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
    if (
      user &&
      user.role !== 'admin' &&
      location.pathname !== '/login' &&
      location.pathname !== '/register'
    ) {
      const menuName = getPageTitle(location.pathname);
      axios
        .post('/api/analytics/log', {
          path: location.pathname,
          menuName: menuName,
        })
        .catch((err) => console.error('Failed to log visit', err));
    }
  }, [location.pathname, user]);

  interface SidebarSubItem {
    name: string;
    href: string;
    icon: any;
    activeCheck?: boolean;
    badgeCount?: number;
  }

  interface SidebarItem {
    name: string;
    href?: string;
    icon: any;
    badgeCount?: number;
    activeCheck?: boolean;
    children?: SidebarSubItem[];
    condition?: boolean;
  }

  interface SidebarGroup {
    category: string;
    items: SidebarItem[];
  }

  const renderNavGroups = (groups: SidebarGroup[]) => {
    return (
      <div className='space-y-4 pb-4'>
        {groups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => item.condition === undefined || item.condition === true,
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.category} className='space-y-1'>
              <div className='px-3 text-[10px] font-black uppercase tracking-wider text-slate-400/90 select-none'>
                {group.category}
              </div>

              <div className='space-y-1'>
                {visibleItems.map((item) => {
                  if (item.children && item.children.length > 0) {
                    const isChildActive = item.children.some((child) =>
                      child.activeCheck
                        ? location.pathname.startsWith(child.href)
                        : location.pathname === child.href,
                    );
                    const isOpen = openMenus[item.name] ?? isChildActive;
                    const Icon = item.icon;

                    return (
                      <div key={item.name} className='space-y-1'>
                        <button
                          type='button'
                          onClick={() =>
                            setOpenMenus((prev) => ({
                              ...prev,
                              [item.name]: !isOpen,
                            }))
                          }
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            isChildActive
                              ? 'bg-blue-50/80 text-blue-900 border border-blue-200/80 font-bold'
                              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            <Icon
                              className={`text-sm shrink-0 transition-transform duration-200 ${
                                isChildActive
                                  ? 'text-blue-600'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span className='truncate'>{item.name}</span>
                          </div>
                          {isOpen ? (
                            <FaChevronDown className='text-[10px] text-slate-400 shrink-0' />
                          ) : (
                            <FaChevronRight className='text-[10px] text-slate-400 shrink-0' />
                          )}
                        </button>

                        {isOpen && (
                          <div className='pl-3.5 space-y-1 border-l-2 border-slate-200/80 ml-5 my-1'>
                            {item.children.map((child) => {
                              const isSubActive = child.activeCheck
                                ? location.pathname.startsWith(child.href)
                                : location.pathname === child.href;
                              const SubIcon = child.icon;
                              return (
                                <Link
                                  key={child.href}
                                  to={child.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                                    isSubActive
                                      ? 'bg-gradient-to-r from-[#3b6ebb] to-blue-600 text-white font-bold shadow-xs'
                                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                  }`}
                                >
                                  <SubIcon
                                    className={`text-xs shrink-0 ${
                                      isSubActive
                                        ? 'text-white'
                                        : 'text-slate-400'
                                    }`}
                                  />
                                  <span className='truncate'>{child.name}</span>
                                  {typeof child.badgeCount === 'number' &&
                                    child.badgeCount > 0 && (
                                      <span
                                        className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                                          isSubActive
                                            ? 'bg-white text-blue-700'
                                            : 'bg-rose-500 text-white animate-pulse'
                                        }`}
                                      >
                                        {child.badgeCount > 99
                                          ? '99+'
                                          : child.badgeCount}
                                      </span>
                                    )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = item.activeCheck
                    ? location.pathname.startsWith(item.href!)
                    : location.pathname === item.href!;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href || item.name}
                      to={item.href!}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50/90 text-blue-900 border border-blue-200/80 shadow-xs font-bold'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`text-sm shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? 'text-blue-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className='truncate'>{item.name}</span>
                      {typeof item.badgeCount === 'number' &&
                        item.badgeCount > 0 && (
                          <span className='ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm shadow-rose-500/40 animate-pulse'>
                            {item.badgeCount > 99 ? '99+' : item.badgeCount}
                          </span>
                        )}
                      {isActive &&
                        (!item.badgeCount || item.badgeCount <= 0) && (
                          <span className='ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0' />
                        )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getNavLinks = () => {
    if (user?.role === 'alumni') {
      const alumniGroups: SidebarGroup[] = [
        {
          category: 'NAVIGASI UTAMA',
          items: [
            { name: 'Dashboard Alumni', href: '/alumni', icon: FaThLarge },
            {
              name: 'Kuesioner Tracer',
              href: '/alumni/questionnaire',
              icon: FaClipboardList,
            },
          ],
        },
        {
          category: 'JEJARING & ALUMNI',
          items: [
            { name: 'Data Alumni', href: '/alumni/alumni', icon: FaUsers },
            {
              name: 'Perguruan Tinggi',
              href: '/alumni/universities',
              icon: FaUniversity,
            },
            { name: 'Jurusan', href: '/alumni/majors', icon: FaBookOpen },
            {
              name: 'Rekan Seangkatan',
              href: '/alumni/mutual-alumni',
              icon: FaUserFriends,
            },
          ],
        },
        {
          category: 'INFORMASI & BERITA',
          items: [
            {
              name: 'Event Alumni',
              href: '/alumni/events',
              icon: FaCalendarAlt,
            },
            {
              name: 'Berita Alumni',
              href: '/alumni/news',
              icon: FaNewspaper,
              activeCheck: true,
            },
          ],
        },
        {
          category: 'KARIR & BURSA KERJA',
          items: [
            { name: 'Bursa Kerja', href: '/jobs', icon: FaBriefcase },
            { name: 'Loker Saya', href: '/alumni/jobs', icon: FaBriefcase },
          ],
        },
        {
          category: 'AKUN & LAINNYA',
          items: [
            { name: 'Klaim Badge', href: '/alumni/claim-badge', icon: FaMedal },
            {
              name: 'Kritik & Saran',
              href: '/alumni/feedback',
              icon: FaCommentDots,
              condition: feedbackMenuVisible,
            },
          ],
        },
      ];
      return renderNavGroups(alumniGroups);
    }

    if (user?.role === 'admin') {
      const adminGroups: SidebarGroup[] = [
        {
          category: 'NAVIGASI & ANALITIK',
          items: [
            { name: 'Dashboard Admin', href: '/admin', icon: FaThLarge },
            {
              name: 'Statistik Website',
              href: '/admin/stats',
              icon: FaChartPie,
            },
          ],
        },
        {
          category: 'MANAJEMEN PENGGUNA',
          items: [
            { name: 'Data Alumni', href: '/admin/alumni', icon: FaUsers },
            {
              name: 'Data Siswa',
              href: '/admin/students',
              icon: FaGraduationCap,
            },
            { name: 'Data Admin', href: '/admin/admins', icon: FaUserShield },
            { name: 'Kelola Mentor', href: '/admin/mentors', icon: FaCrown },
            {
              name: 'User Sekolah',
              href: '/admin/school-users',
              icon: FaUserTie,
            },
          ],
        },
        {
          category: 'DATA MASTER & KAMPUS',
          items: [
            {
              name: 'Rencana Kuliah',
              href: '/admin/college-plans',
              icon: FaGraduationCap,
            },
            {
              name: 'Perguruan Tinggi',
              href: '/admin/universities',
              icon: FaUniversity,
            },
            { name: 'Jurusan', href: '/admin/majors', icon: FaBookOpen },
            {
              name: 'Kelola Perguruan Tinggi',
              href: '/admin/manage-universities',
              icon: FaBuilding,
              activeCheck: true,
            },
          ],
        },
        {
          category: 'KONTEN & BURSA KERJA',
          items: [
            { name: 'Kelola Berita', href: '/admin/news', icon: FaNewspaper },
            {
              name: 'Manajemen Event',
              href: '/admin/events',
              icon: FaCalendarAlt,
            },
            {
              name: 'Bursa Kerja',
              href: '/admin/jobs',
              icon: FaBriefcase,
              badgeCount: sidebarCounts.pendingJobs,
            },
            { name: 'Kelola Badge', href: '/admin/badges', icon: FaMedal },
          ],
        },
        {
          category: 'AUDIT & BANTUAN',
          items: [
            {
              name: 'Verifikasi Data',
              href: '/admin/verification-logs',
              icon: FaHistory,
            },
            {
              name: 'Kritik & Saran',
              href: '/admin/feedback',
              icon: FaCommentDots,
              badgeCount: sidebarCounts.unrepliedFeedback,
            },
          ],
        },
      ];
      return renderNavGroups(adminGroups);
    }

    if ((user?.role as string) === 'school') {
      const schoolGroups: SidebarGroup[] = [
        {
          category: 'NAVIGASI UTAMA',
          items: [
            { name: 'Dashboard Sekolah', href: '/school', icon: FaThLarge },
          ],
        },
        {
          category: 'MONITORING & DATA',
          items: [
            { name: 'Data Alumni', href: '/school/alumni', icon: FaUsers },
            {
              name: 'Perguruan Tinggi',
              href: '/school/universities',
              icon: FaUniversity,
            },
            { name: 'Jurusan', href: '/school/majors', icon: FaBookOpen },
            {
              name:
                user?.schoolRole === 'bk'
                  ? 'Verifikasi Data'
                  : 'Monitoring Sync Data',
              href: '/school/verification',
              icon: FaSync,
            },
          ],
        },
        {
          category: 'AKUN & BANTUAN',
          items: [
            {
              name: 'Kritik & Saran',
              href: '/school/feedback',
              icon: FaCommentDots,
            },
          ],
        },
      ];
      return renderNavGroups(schoolGroups);
    }

    if (user?.role === 'student') {
      const studentGroups: SidebarGroup[] = [
        {
          category: 'NAVIGASI UTAMA',
          items: [
            { name: 'Dashboard Siswa', href: '/student', icon: FaThLarge },
          ],
        },
        {
          category: 'SMART TOOLS',
          items: [
            {
              name: 'Smart Match',
              href: '/student/college-plan',
              icon: FaGraduationCap,
            },
          ],
        },
        {
          category: 'EKSPLORASI KAMPUS & ALUMNI',
          items: [
            { name: 'Data Alumni', href: '/student/alumni', icon: FaUsers },
            {
              name: 'Perguruan Tinggi',
              href: '/student/universities',
              icon: FaUniversity,
            },
            { name: 'Jurusan', href: '/student/majors', icon: FaBookOpen },
          ],
        },
        {
          category: 'INFORMASI & BERITA',
          items: [
            {
              name: 'Event Siswa',
              href: '/student/events',
              icon: FaCalendarAlt,
            },
            {
              name: 'Berita Siswa',
              href: '/student/news',
              icon: FaNewspaper,
              activeCheck: true,
            },
          ],
        },
        {
          category: 'AKUN & BANTUAN',
          items: [
            {
              name: 'Kritik & Saran',
              href: '/student/feedback',
              icon: FaCommentDots,
              condition: feedbackMenuVisible,
            },
          ],
        },
      ];
      return renderNavGroups(studentGroups);
    }

    return null;
  };

  const getUserInitial = () => {
    const name = user?.profile?.fullName || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadgeLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator';
      case 'alumni':
        return 'Alumni';
      case 'student':
        return 'Siswa';
      case 'school':
        return 'Pihak Sekolah';
      default:
        return 'Pengguna';
    }
  };

  const getRestrictedAccessComponent = () => {
    if (!user) return null;
    const path = location.pathname;
    const isProfilePage = path.endsWith('/profile');
    const isQuestionnairePage = path === '/alumni/questionnaire';

    if (isProfilePage) return null;

    if (user.isHidden) {
      return (
        <RestrictedAccess
          type='hidden_user'
          role={(user.role === 'admin' ? 'alumni' : user.role) as any}
        />
      );
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
        return (
          <RestrictedAccess type='questionnaire_incomplete' role='alumni' />
        );
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className='flex h-16 shrink-0 items-center justify-between gap-3 px-5 border-b border-slate-200/80 bg-white'>
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
            className='flex items-center gap-3.5 group min-w-0 flex-1'
          >
            <img
              src='/logo.png'
              alt='Logo SMANTA'
              className='h-11 w-11 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105'
            />
            <div className='flex flex-col min-w-0 justify-center'>
              <span className='font-extrabold text-slate-900 text-[14px] tracking-tight leading-tight group-hover:text-blue-600 transition-colors truncate'>
                TRACER STUDY
              </span>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate'>
                SMAN 1 TAWANGSARI
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className='rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition-colors'
          >
            <FaTimes className='text-sm' />
          </button>
        </div>

        {/* Nav Links */}
        <nav className='flex-1 overflow-y-auto px-3.5 py-4 sidebar-nav-scroll'>
          {getNavLinks()}
        </nav>

        {/* Subtle Sidebar Footer */}
        <div className='p-3 border-t border-slate-100 bg-slate-50/50 text-center select-none'>
          <p className='text-[10px] font-semibold text-slate-400'>
            Tracer Study &bull; SMANTA
          </p>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Top Header Navbar */}
        <header className='sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md transition-colors shadow-xs'>
          {/* Left: Mobile Toggle & Mobile Logo / Desktop Breadcrumbs */}
          <div className='flex items-center gap-3 min-w-0'>
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden transition-colors'
              aria-label='Buka Menu Navigasi'
            >
              {isMobileMenuOpen ? (
                <FaTimes className='h-5 w-5' />
              ) : (
                <FaBars className='h-5 w-5' />
              )}
            </button>

            {/* Mobile Brand / Title */}
            <div className='flex items-center gap-2 lg:hidden min-w-0'>
              <img
                src='/logo.png'
                alt='Logo'
                className='h-8 w-8 object-contain shrink-0'
              />
              <div className='min-w-0'>
                <div className='text-xs font-bold leading-tight tracking-tight text-slate-900 truncate'>
                  TRACER STUDY
                </div>
                <p className='text-[8px] font-medium text-slate-500 uppercase tracking-wider truncate'>
                  SMAN 1 TAWANGSARI
                </p>
              </div>
            </div>

            {/* Desktop Breadcrumbs */}
            <div className='hidden lg:flex items-center gap-2 text-sm'>
              <span className='text-slate-400 font-medium'>
                {getMenuCategory(location.pathname, user?.role)}
              </span>
              <FaChevronRight className='text-[10px] text-slate-300' />
              <span className='font-bold text-slate-800 tracking-tight'>
                {getPageTitle(location.pathname)}
              </span>
            </div>
          </div>

          {/* Right: User Profile Dropdown */}
          <div className='flex items-center gap-2 sm:gap-3 shrink-0'>
            {/* User Profile Pill Dropdown Trigger */}
            <div className='relative' ref={userDropdownRef}>
              <button
                type='button'
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className='flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-2xl hover:bg-slate-100/80 transition-all duration-200 focus:outline-none group cursor-pointer text-left'
                aria-expanded={isUserDropdownOpen}
                aria-haspopup='true'
              >
                {/* Custom Avatar with Blue gradient */}
                <div className='h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-[#3b6ebb] to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs border border-blue-500/30 group-hover:scale-105 transition-transform'>
                  {getUserInitial()}
                </div>

                {/* Name and Role (border and email removed) */}
                <div className='flex flex-col min-w-0 text-left max-w-[120px] sm:max-w-[160px] md:max-w-[200px]'>
                  <span className='text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors leading-tight'>
                    {user?.profile?.fullName || user?.username || 'Pengguna'}
                  </span>
                  <span className='text-[10px] text-slate-500 font-semibold truncate leading-tight mt-0.5'>
                    {getRoleBadgeLabel()}
                  </span>
                </div>

                {/* Dropdown Chevron Icon */}
                <FaChevronDown
                  className={`h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ml-0.5 sm:ml-1 shrink-0 ${
                    isUserDropdownOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className='absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl shadow-slate-900/10 border border-slate-200/80 py-2 z-50 animate-fade-in'>
                  {/* User Profile Header */}
                  <div className='px-4 py-3 border-b border-slate-100 flex items-center gap-3'>
                    <div className='h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-[#3b6ebb] to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs border border-blue-500/30'>
                      {getUserInitial()}
                    </div>
                    <div className='flex flex-col min-w-0 flex-1'>
                      <span className='text-xs font-bold text-slate-800 truncate'>
                        {user?.profile?.fullName ||
                          user?.username ||
                          'Pengguna'}
                      </span>
                      <span className='text-[10px] text-slate-500 truncate font-medium'>
                        {user?.email || user?.username || ''}
                      </span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className='px-2 py-1.5 space-y-0.5'>
                    <button
                      type='button'
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className='w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-left'
                    >
                      <FaUser className='h-3.5 w-3.5 text-slate-400' />
                      <span>Profil Saya</span>
                    </button>
                    <Link
                      to='/'
                      onClick={() => setIsUserDropdownOpen(false)}
                      className='flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors'
                    >
                      <FaHome className='h-3.5 w-3.5 text-slate-400' />
                      <span>Halaman Utama</span>
                    </Link>
                  </div>

                  <div className='my-1 border-t border-slate-100' />

                  {/* Logout Action */}
                  <div className='px-2 pt-0.5'>
                    <button
                      type='button'
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className='w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left'
                    >
                      <FaSignOutAlt className='h-3.5 w-3.5 text-rose-500' />
                      <span>Keluar Aplikasi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

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
            &copy; {new Date().getFullYear()} Tracer Study SMAN 1 Tawangsari.
            All right reserved.
          </div>
        </main>
      </div>
      {/* Profile Modal with Full-Screen Blur Backdrop */}
      {isProfileModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6'>
          {/* Full Screen Blur Backdrop */}
          <div
            className='fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity duration-300'
            onClick={() => setIsProfileModalOpen(false)}
          />

          {/* Modal Container */}
          <div className='relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200'>
            {/* Modal Header */}
            <div className='flex items-center justify-between px-6 sm:px-8 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky top-0 z-20 shrink-0'>
              <div className='flex items-center gap-3.5'>
                <div className='h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#3b6ebb] to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm border border-blue-400/30 shrink-0'>
                  {getUserInitial()}
                </div>
                <div className='flex flex-col justify-center'>
                  <h3 className='text-base font-bold text-slate-900 leading-none !m-0 !mb-1.5'>
                    Profil Saya
                  </h3>
                  <p className='text-xs text-slate-500 font-medium leading-none !m-0'>
                    Kelola data diri dan password akun Anda
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setIsProfileModalOpen(false)}
                className='h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-[#3b6ebb] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-500/25 border border-blue-400/30 transition-all cursor-pointer hover:scale-105 active:scale-95'
                aria-label='Tutup Modal'
              >
                <FaTimes className='h-3.5 w-3.5' />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className='overflow-y-auto flex-1 sidebar-nav-scroll'>
              <Profile
                isModal={true}
                onClose={() => setIsProfileModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

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
