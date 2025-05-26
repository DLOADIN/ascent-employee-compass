import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { currentUser, isLoading, token } = useAppContext();
  const location = useLocation();
  
  useEffect(() => {
  // Store current path in localStorage when user accesses a protected route
  if (currentUser) {
    localStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [currentUser, location.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute: Checking authentication status...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Check if we have a token but no user (potential auth error)
  if (!currentUser && token) {
    console.error('ProtectedRoute: Token exists but no user data found');
    return <Navigate to="/login" state={{ from: location.pathname, error: 'AUTH_ERROR' }} replace />;
  }

  if (!currentUser) {
    console.log('ProtectedRoute: No authenticated user found, redirecting to login');
    // Not authenticated - redirect to login while saving current path
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    console.log(`ProtectedRoute: User role ${currentUser.role} not authorized for this route`);
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
