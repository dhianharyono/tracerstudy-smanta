import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AlumniDashboard from './pages/alumni/Dashboard';
import AlumniQuestionnaire from './pages/alumni/Questionnaire';
import AlumniProfile from './pages/alumni/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAlumni from './pages/admin/Alumni';
import AdminReports from './pages/admin/Reports';
import AdminStudents from './pages/admin/Students';
import AdminAdmins from './pages/admin/Admins';
import AdminNews from './pages/admin/News';
import AdminNewsDetail from './pages/admin/NewsDetail';
import StudentDashboard from './pages/student/Dashboard';
import StudentUniversities from './pages/student/Universities';
import StudentMajors from './pages/student/Majors';
import StudentAlumni from './pages/student/Alumni';
import StudentFeedback from './pages/student/Feedback';
import AlumniFeedback from './pages/alumni/Feedback';
import AlumniNews from './pages/alumni/News';
import AlumniNewsDetail from './pages/alumni/NewsDetail';
import AdminFeedback from './pages/admin/Feedback';
import AdminFeedbackDetail from './pages/admin/FeedbackDetail';
import StudentNews from './pages/student/News';
import StudentNewsDetail from './pages/student/NewsDetail';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Alumni Routes */}
          <Route
            path="/alumni"
            element={
              <PrivateRoute allowedRoles={['alumni']}>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<AlumniDashboard />} />
            <Route path="questionnaire" element={<AlumniQuestionnaire />} />
            <Route path="profile" element={<AlumniProfile />} />
            <Route path="feedback" element={<AlumniFeedback />} />
            <Route path="news" element={<AlumniNews />} />
            <Route path="news/:id" element={<AlumniNewsDetail />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="alumni" element={<AdminAlumni />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="admins" element={<AdminAdmins />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="news/:id" element={<AdminNewsDetail />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="feedback/:id" element={<AdminFeedbackDetail />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="universities" element={<StudentUniversities />} />
            <Route path="majors" element={<StudentMajors />} />
            <Route path="alumni" element={<StudentAlumni />} />
            <Route path="feedback" element={<StudentFeedback />} />
            <Route path="news" element={<StudentNews />} />
            <Route path="news/:id" element={<StudentNewsDetail />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          top: '80px',
        }}
      />
    </AuthProvider>
  );
}

export default App;


