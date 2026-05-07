import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import SmartLoader from './SmartLoader';

interface PrivateRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles, children }) => {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;














