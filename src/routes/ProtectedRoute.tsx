import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import { Role } from '../types';

interface Props {
  children: React.ReactNode;
  requiredRole?: Role;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const storedToken = localStorage.getItem('expense_tracker_jwt') || sessionStorage.getItem('expense_tracker_jwt');

  if (!isAuthenticated && !storedToken) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
