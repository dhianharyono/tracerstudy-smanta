import { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/Profile'));

// Alumni Pages
const AlumniDashboard = lazy(() => import('./pages/alumni/Dashboard'));
const AlumniQuestionnaire = lazy(() => import('./pages/alumni/Questionnaire'));
const AlumniFeedback = lazy(() => import('./pages/alumni/Feedback'));
const AlumniNews = lazy(() => import('./pages/alumni/News'));
const AlumniNewsDetail = lazy(() => import('./pages/alumni/NewsDetail'));
const MutualAlumni = lazy(() => import('./pages/alumni/MutualAlumni'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminAlumni = lazy(() => import('./pages/admin/Alumni'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminStudents = lazy(() => import('./pages/admin/Students'));
const AdminAdmins = lazy(() => import('./pages/admin/Admins'));
const AdminNews = lazy(() => import('./pages/admin/News'));
const AdminNewsDetail = lazy(() => import('./pages/admin/NewsDetail'));
const AdminFeedback = lazy(() => import('./pages/admin/Feedback'));
const AdminFeedbackDetail = lazy(() => import('./pages/admin/FeedbackDetail'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentUniversities = lazy(() => import('./pages/student/Universities'));
const StudentMajors = lazy(() => import('./pages/student/Majors'));
const StudentAlumni = lazy(() => import('./pages/student/Alumni'));
const StudentFeedback = lazy(() => import('./pages/student/Feedback'));
const StudentNews = lazy(() => import('./pages/student/News'));
const StudentNewsDetail = lazy(() => import('./pages/student/NewsDetail'));
const StudentCollegePlan = lazy(() => import('./pages/student/CollegePlan'));

const getDashboardPath = (role: 'alumni' | 'admin' | 'student') => {
  switch (role) {
    case 'alumni':
      return '/alumni';
    case 'admin':
      return '/admin';
    case 'student':
      return '/student';
    default:
      return '/login';
  }
};

const PublicRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
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
        <Suspense fallback={<LoadingSpinner />}>
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
              <Route path='reports' element={<AdminReports />} />
              <Route path='students' element={<AdminStudents />} />
              <Route path='admins' element={<AdminAdmins />} />
              <Route path='news' element={<AdminNews />} />
              <Route path='news/:id' element={<AdminNewsDetail />} />
              <Route path='feedback' element={<AdminFeedback />} />
              <Route path='feedback/:id' element={<AdminFeedbackDetail />} />
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
              <Route path='alumni' element={<StudentAlumni />} />
              <Route path='feedback' element={<StudentFeedback />} />
              <Route path='news' element={<StudentNews />} />
              <Route path='news/:id' element={<StudentNewsDetail />} />
              <Route path='profile' element={<Profile />} />
            </Route>

            <Route path='/' element={<Navigate to='/login' replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
