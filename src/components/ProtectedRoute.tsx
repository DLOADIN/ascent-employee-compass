import { Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    // Not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Not authorized
    switch (currentUser.role) {
      case 'Admin':
        return <Navigate to="/admin" replace />;
      case 'TeamLeader':
        return <Navigate to="/team-leader" replace />;
      case 'Employee':
        return <Navigate to="/employee" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 