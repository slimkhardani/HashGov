import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component to guard routes that require authentication
 * Only Identity and Certificates pages are protected
 * If user is not authenticated, redirects to login page
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state or spinner while authentication is being checked
  if (loading) {
    return <div>Loading...</div>; // You could replace this with a proper loading spinner
  }
  
  // If not authenticated, redirect to login with the return URL
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;
