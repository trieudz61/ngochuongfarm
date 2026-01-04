import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const user = useSelector((state: RootState) => state.app.user);
  const isAdmin = useSelector((state: RootState) => state.app.isAdmin);

  // Nếu cần admin nhưng chưa login hoặc không phải admin
  if (requireAdmin) {
    if (!user || !isAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
  } else {
    // Nếu cần login nhưng chưa login
    if (!user) {
      return <Navigate to="/admin/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

