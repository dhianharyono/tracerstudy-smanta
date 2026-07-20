import { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SmartLoader from './components/SmartLoader';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Alumni Pages
const AlumniDashboard = lazy(() => import('./pages/alumni/Dashboard'));
const AlumniQuestionnaire = lazy(() => import('./pages/alumni/Questionnaire'));
const AlumniFeedback = lazy(() => import('./pages/alumni/Feedback'));
const AlumniNews = lazy(() => import('./pages/alumni/News'));
const AlumniNewsDetail = lazy(() => import('./pages/alumni/NewsDetail'));
const MutualAlumni = lazy(() => import('./pages/alumni/MutualAlumni'));
const AlumniClaimBadge = lazy(() => import('./pages/alumni/ClaimBadge'));
const AlumniEventHub = lazy(() => import('./pages/alumni/EventHub'));
const ManageMyJobs = lazy(() => import('./pages/alumni/ManageMyJobs'));
const PostOpportunity = lazy(() => import('./pages/alumni/PostOpportunity'));
const Opportunities = lazy(() => import('./pages/shared/Opportunities'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminAlumni = lazy(() => import('./pages/admin/Alumni'));
const AdminStudents = lazy(() => import('./pages/admin/Students'));
const AdminMentors = lazy(() => import('./pages/admin/Mentors'));
const AdminAdmins = lazy(() => import('./pages/admin/Admins'));
const AdminNews = lazy(() => import('./pages/admin/News'));
const AdminNewsDetail = lazy(() => import('./pages/admin/NewsDetail'));
const AdminFeedback = lazy(() => import('./pages/admin/Feedback'));
const AdminFeedbackDetail = lazy(() => import('./pages/admin/FeedbackDetail'));
const AdminBadges = lazy(() => import('./pages/admin/Badges'));
const AdminEventManagement = lazy(
  () => import('./pages/admin/EventManagement'),
);
const AdminStatistics = lazy(() => import('./pages/admin/WebsiteStatistics'));
const AdminCollegePlans = lazy(() => import('./pages/admin/CollegePlans'));
const AdminSchoolUsers = lazy(() => import('./pages/admin/SchoolUsers'));
const AdminVerificationLogs = lazy(
  () => import('./pages/admin/AdminVerificationLogs'),
);
const AdminJobManagement = lazy(
  () => import('./pages/admin/AdminOpportunityManagement'),
);

const SchoolDashboard = lazy(() => import('./pages/school/Dashboard'));
const SchoolAlumniList = lazy(() => import('./pages/school/AlumniList'));
const SchoolFeedback = lazy(() => import('./pages/school/Feedback'));
const SchoolVerification = lazy(
  () => import('./pages/school/DataVerification'),
);

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentUniversities = lazy(() => import('./pages/student/Universities'));
const StudentMajors = lazy(() => import('./pages/student/Majors'));
const StudentAlumni = lazy(() => import('./pages/student/Alumni'));
const StudentFeedback = lazy(() => import('./pages/student/Feedback'));
const StudentNews = lazy(() => import('./pages/student/News'));
const StudentNewsDetail = lazy(() => import('./pages/student/NewsDetail'));
const StudentCollegePlan = lazy(() => import('./pages/student/CollegePlan'));
const StudentAlumniContact = lazy(
  () => import('./pages/student/AlumniContact'),
);
const StudentEvents = lazy(() => import('./pages/student/Events'));

const getDashboardPath = (role: UserRole) => {
  switch (role) {
    case 'alumni':
      return '/alumni';
    case 'admin':
      return '/admin';
    case 'student':
      return '/student';
    case 'school':
      return '/school';
    default:
      return '/';
  }
};

const PublicRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SmartLoader
        messages={[
          'Memvalidasi sesi...',
          'Memeriksa hak akses...',
          'Menyiapkan dashboard...',
        ]}
      />
    );
  }

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense
          fallback={
            <SmartLoader
              messages={[
                'Menyiapkan aplikasi...',
                'Memuat modul...',
                'Hampir siap...',
              ]}
            />
          }
        >
          <Routes>
            <Route
              path='/login'
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path='/register'
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Alumni Routes */}
            <Route
              path='/alumni'
              element={
                <PrivateRoute allowedRoles={['alumni']}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<AlumniDashboard />} />
              <Route path='questionnaire' element={<AlumniQuestionnaire />} />
              <Route path='profile' element={<Profile />} />
              <Route path='feedback' element={<AlumniFeedback />} />
              <Route path='news' element={<AlumniNews />} />
              <Route path='news/:id' element={<AlumniNewsDetail />} />
              <Route path='mutual-alumni' element={<MutualAlumni />} />
              <Route path='claim-badge' element={<AlumniClaimBadge />} />
              <Route path='events' element={<AlumniEventHub />} />
              <Route path='jobs' element={<ManageMyJobs />} />
              <Route path='jobs/new' element={<PostOpportunity />} />
              <Route path='jobs/edit/:id' element={<PostOpportunity />} />
              <Route path='universities' element={<StudentUniversities />} />
              <Route path='majors' element={<StudentMajors />} />
              <Route path='alumni' element={<StudentAlumni />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path='/admin'
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path='alumni' element={<AdminAlumni />} />
              <Route path='mentors' element={<AdminMentors />} />
              <Route path='students' element={<AdminStudents />} />
              <Route path='admins' element={<AdminAdmins />} />
              <Route path='news' element={<AdminNews />} />
              <Route path='news/:id' element={<AdminNewsDetail />} />
              <Route path='feedback' element={<AdminFeedback />} />
              <Route path='feedback/:id' element={<AdminFeedbackDetail />} />
              <Route path='badges' element={<AdminBadges />} />
              <Route path='events' element={<AdminEventManagement />} />
              <Route path='stats' element={<AdminStatistics />} />
              <Route path='college-plans' element={<AdminCollegePlans />} />
              <Route path='school-users' element={<AdminSchoolUsers />} />
              <Route
                path='verification-logs'
                element={<AdminVerificationLogs />}
              />
              <Route path='jobs' element={<AdminJobManagement />} />
              <Route path='profile' element={<Profile />} />
            </Route>

            {/* School Monitoring Routes */}
            <Route
              path='/school'
              element={
                <PrivateRoute allowedRoles={['school']}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<SchoolDashboard />} />
              <Route path='alumni' element={<SchoolAlumniList />} />
              <Route path='universities' element={<StudentUniversities />} />
              <Route path='majors' element={<StudentMajors />} />
              <Route path='feedback' element={<SchoolFeedback />} />
              <Route path='verification' element={<SchoolVerification />} />
              <Route path='profile' element={<Profile />} />
            </Route>

            {/* Student Routes */}
            <Route
              path='/student'
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path='universities' element={<StudentUniversities />} />
              <Route path='majors' element={<StudentMajors />} />
              <Route path='college-plan' element={<StudentCollegePlan />} />
              <Route path='alumni-contact' element={<StudentAlumniContact />} />
              <Route path='alumni' element={<StudentAlumni />} />
              <Route path='feedback' element={<StudentFeedback />} />
              <Route path='news' element={<StudentNews />} />
              <Route path='news/:id' element={<StudentNewsDetail />} />
              <Route path='events' element={<StudentEvents />} />
              <Route path='profile' element={<Profile />} />
            </Route>

            {/* Shared Authenticated Routes */}
            <Route
              path='/jobs'
              element={
                <PrivateRoute allowedRoles={['alumni', 'admin']}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Opportunities />} />
            </Route>

            <Route path='/' element={<LandingPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
