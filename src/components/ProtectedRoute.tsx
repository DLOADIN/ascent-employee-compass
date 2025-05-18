
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useAppContext();
  const location = useLocation();
  
  // Store current path in localStorage when user accesses a protected route
  if (currentUser) {
    localStorage.setItem('lastVisitedPath', location.pathname);
  }

  if (!currentUser) {
    // Not authenticated - redirect to login while saving current path
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Not authorized - redirect to appropriate dashboard
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
