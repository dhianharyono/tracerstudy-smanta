import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
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
  // FaSpinner,
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Loading overlay on route change
  // useEffect(() => {
  //   setIsLoading(true);
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 500); // Show loading for 500ms

  //   return () => clearTimeout(timer);
  // }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isMobileMenuOpen &&
        !target.closest('.sidebar') &&
        !target.closest('.mobile-menu-button')
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const [feedbackMenuVisible, setFeedbackMenuVisible] = useState(true);

  useEffect(() => {
    const checkFeedbackVisibility = async () => {
      try {
        const response = await axios.get(
          '/api/admin/settings/feedback-visible'
        );
        setFeedbackMenuVisible(response.data.visible);
      } catch (error) {
        // Default to visible if error (for non-admin users, this endpoint might not exist)
        setFeedbackMenuVisible(true);
      }
    };
    checkFeedbackVisibility();
  }, []);

  const getNavLinks = () => {
    if (user?.role === 'alumni') {
      return (
        <>
          <Link
            to='/alumni'
            className={`nav-link ${
              location.pathname === '/alumni' ? 'active' : ''
            }`}
          >
            <FaChartBar />
            <span>Dashboard</span>
          </Link>
          <Link
            to='/alumni/questionnaire'
            className={`nav-link ${
              location.pathname === '/alumni/questionnaire' ? 'active' : ''
            }`}
          >
            <FaEdit />
            <span>Kuesioner</span>
          </Link>
          <Link
            to='/alumni/news'
            className={`nav-link ${
              location.pathname.startsWith('/alumni/news') ? 'active' : ''
            }`}
          >
            <FaNewspaper />
            <span>News</span>
          </Link>
          {feedbackMenuVisible && (
            <Link
              to='/alumni/feedback'
              className={`nav-link ${
                location.pathname === '/alumni/feedback' ? 'active' : ''
              }`}
            >
              <FaCommentDots />
              <span>Kritik & Saran</span>
            </Link>
          )}
          <Link
            to='/alumni/profile'
            className={`nav-link ${
              location.pathname === '/alumni/profile' ? 'active' : ''
            }`}
          >
            <FaUser />
            <span>Profil</span>
          </Link>
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <Link
            to='/admin'
            className={`nav-link ${
              location.pathname === '/admin' ? 'active' : ''
            }`}
          >
            <FaChartBar />
            <span>Dashboard</span>
          </Link>
          <Link
            to='/admin/alumni'
            className={`nav-link ${
              location.pathname === '/admin/alumni' ? 'active' : ''
            }`}
          >
            <FaUsers />
            <span>Data Alumni</span>
          </Link>
          <Link
            to='/admin/students'
            className={`nav-link ${
              location.pathname === '/admin/students' ? 'active' : ''
            }`}
          >
            <FaGraduationCap />
            <span>Data Student</span>
          </Link>
          <Link
            to='/admin/admins'
            className={`nav-link ${
              location.pathname === '/admin/admins' ? 'active' : ''
            }`}
          >
            <FaUserTie />
            <span>Data Admin</span>
          </Link>
          <Link
            to='/admin/news'
            className={`nav-link ${
              location.pathname === '/admin/news' ? 'active' : ''
            }`}
          >
            <FaNewspaper />
            <span>Kelola News</span>
          </Link>
          <Link
            to='/admin/reports'
            className={`nav-link ${
              location.pathname === '/admin/reports' ? 'active' : ''
            }`}
          >
            <FaChartLine />
            <span>Laporan</span>
          </Link>
          <Link
            to='/admin/feedback'
            className={`nav-link ${
              location.pathname === '/admin/feedback' ? 'active' : ''
            }`}
          >
            <FaCommentDots />
            <span>Kritik & Saran</span>
          </Link>
        </>
      );
    }

    if (user?.role === 'student') {
      return (
        <>
          <Link
            to='/student'
            className={`nav-link ${
              location.pathname === '/student' ? 'active' : ''
            }`}
          >
            <FaChartBar />
            <span>Dashboard</span>
          </Link>
          <Link
            to='/student/universities'
            className={`nav-link ${
              location.pathname === '/student/universities' ? 'active' : ''
            }`}
          >
            <FaUniversity />
            <span>Perguruan Tinggi</span>
          </Link>
          <Link
            to='/student/majors'
            className={`nav-link ${
              location.pathname === '/student/majors' ? 'active' : ''
            }`}
          >
            <FaBook />
            <span>Jurusan</span>
          </Link>
          <Link
            to='/student/alumni'
            className={`nav-link ${
              location.pathname === '/student/alumni' ? 'active' : ''
            }`}
          >
            <FaUsers />
            <span>Alumni</span>
          </Link>
          <Link
            to='/student/news'
            className={`nav-link ${
              location.pathname.startsWith('/student/news') ? 'active' : ''
            }`}
          >
            <FaNewspaper />
            <span>News</span>
          </Link>
          {feedbackMenuVisible && (
            <Link
              to='/student/feedback'
              className={`nav-link ${
                location.pathname === '/student/feedback' ? 'active' : ''
              }`}
            >
              <FaCommentDots />
              <span>Kritik & Saran</span>
            </Link>
          )}
        </>
      );
    }

    return null;
  };

  const getUserInitial = () => {
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  const getRoleName = () => {
    const roles: { [key: string]: string } = {
      admin: 'Administrator',
      alumni: 'Alumni',
      student: 'Siswa',
    };
    return roles[user?.role || ''] || 'User';
  };

  return (
    <div className='layout'>
      {/* Mobile Menu Button */}
      <button
        className='mobile-menu-button'
        onClick={toggleMobileMenu}
        aria-label='Toggle menu'
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className='mobile-overlay'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className='sidebar-header'>
          <div className='sidebar-logo'>
            TRACER STUDY
            <br /> SMA N 1 TAWANGSARI
          </div>
        </div>

        <nav className='sidebar-nav'>{getNavLinks()}</nav>

        <div className='sidebar-footer'>
          <div className='user-info'>
            <div className='user-avatar'>{getUserInitial()}</div>
            <div>
              <div className='user-name truncate'>{user?.username}</div>
              <div className='user-role'>{getRoleName()}</div>
            </div>
          </div>
          <button onClick={handleLogout} className='btn-logout'>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className='main-content-wrapper'>
        <main className='main-content'>
          <div className='page-fade-in'>
            {/* {isLoading && (
              <div className='loading-overlay'>
                <div className='loading-spinner'>
                  <FaSpinner className='spinner' />
                </div>
              </div>
            )} */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
