import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAdminAuthenticated, getAdminUser } from '../auth';

const AdminRoute = () => {
  const isAuth = isAdminAuthenticated();
  const user = getAdminUser();

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'admin') {
    console.warn('Access denied: Admin role required. Redirecting...');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;


