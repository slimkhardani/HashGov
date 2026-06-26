import React, { useState, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";
import Dashboard from "./Admin Page/Dashboard/Dashboard.jsx"
import CertificatsA from "./Admin Page/CertificatsReq/CertificatsReq.jsx";
import PropertyCertificates from "./Admin Page/CertificatsReq/PropertyCertificates.jsx";
import AcademicCertificates from "./Admin Page/CertificatsReq/AcademicCertificates.jsx";
import NewsletterSubscribers from "./Admin Page/User Submission/NewsletterSubscribers.jsx";
import ContactFormSubmissions from "./Admin Page/User Submission/ContactFormSubmissions.jsx";
import ProfileUpdateRequests from "./Admin Page/User Submission/ProfileUpdateRequests.jsx";
import AdminIdentities from "./Admin Page/Identities/Identities.jsx";
import SignUp from "./Auth Service/SignUp/SignUp.jsx";
import Login from "./Auth Service/Login/Login.jsx";
import ResetPassword from "./Auth Service/Reset Pass Process/ResetPassword.jsx";
import Home from "./Home Page/Home.jsx";
import Services from "./components/Navbar & Components/Services/services.jsx";
import Tokens from "./components/Navbar & Components/Tokens&NFTs/tokens.jsx";
import Hedera from "./components/Navbar & Components/Hedera Network/hedera.jsx";
import Contact from "./components/Navbar & Components/Contact/contact.jsx";
import Privacy from "./components/Navbar & Components/Privacy/privacy.jsx";
import Terms from "./components/Navbar & Components/Terms/terms.jsx";
import Identity from "./Identity/identity.jsx";
import Certificates from "./Certificates/certificates.jsx";
import Wallet from "./Wallet/wallet.jsx";
import AdminWallet from "./Admin Page/Admin Wallet/adminwallet.jsx";
import TransactionsHistory from "./Admin Page/TransactionsHistory/TransactionsHistory.jsx";
import Help from "./Help/help.jsx";
import Transactions from "./Transactions/transactions.jsx";
import Profile from "./Profile/profile.jsx";
import Notifications from "./Notifications/notifications.jsx";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { profilesApi } from "./Auth Service/profilesApi";

function App() {
  // Enhanced ProtectedRoute: blocks /profile if no profile, blocks /identity if profile exists
  const ProtectedRoute = ({ element }) => {
    const { loading, isAuthenticated, user, getCookie } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    // Use window.location.pathname to determine which route is being rendered
    const path = window.location.pathname;

    // Block /profile if user has no profile
    if (path === '/profile') {
      if (!user || !user.personalInfo || Object.keys(user.personalInfo).length === 0) {
        return <Navigate to="/identity" replace />;
      }
    }
    // Block /identity if user already has a profile
    if (path === '/identity') {
      if (user && user.personalInfo && Object.keys(user.personalInfo).length > 0) {
        return <Navigate to="/profile" replace />;
      }
    }

    return element;
  };

  // AdminRoute - only accessible to admin users
  const AdminRoute = ({ element }) => {
    const { loading, isAuthenticated, user } = useAuth();
    
    console.log("AdminRoute - auth state:", { loading, isAuthenticated: isAuthenticated(), user });
    
    if (loading) {
      console.log("AdminRoute - loading...");
      return <div className="loading-container">Loading...</div>;
    }
    
    if (!isAuthenticated()) {
      console.log("AdminRoute - not authenticated, redirecting to login");
      return <Navigate to="/login" replace />
    }
    
    // Check if user is admin
    if (!user?.isAdmin) {
      console.log("AdminRoute - user is not an admin, redirecting to profile");
      return <Navigate to="/profile" replace />
    }
    
    console.log("AdminRoute - user is admin, showing admin page");
    // If an element prop is provided, render that element
    // Otherwise, default to Dashboard
    return element || <Dashboard />;
  };

  // No longer needed: logic is now handled in ProtectedRoute
  // Kept for backward compatibility, but simply renders Identity through ProtectedRoute
  const ProtectedIdentityRoute = () => <ProtectedRoute element={<Identity />} />;

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ResetPassword />} />
          <Route path="/services" element={<Services />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/hedera" element={<Hedera />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/dashboard" element={<AdminRoute element={<Dashboard />} />} />
          <Route path="/certificatsreq" element={<AdminRoute element={<CertificatsA />} />} />
          <Route path="/admin/certificates/property" element={<AdminRoute element={<PropertyCertificates />} />} />
          <Route path="/admin/certificates/academic" element={<AdminRoute element={<AcademicCertificates />} />} />
          <Route path="/admin/submissions/newsletter-subscribers" element={<AdminRoute element={<NewsletterSubscribers />} />} />
<Route path="/admin/submissions/contact-form-submissions" element={<AdminRoute element={<ContactFormSubmissions />} />} />
<Route path="/admin/submissions/profile-update-requests" element={<AdminRoute element={<ProfileUpdateRequests />} />} />
          <Route path="/admin/identities" element={<AdminRoute element={<AdminIdentities />} />} />
          <Route path="/admin/wallet" element={<AdminRoute element={<AdminWallet />} />} />
          <Route path="/admin/transactions" element={<AdminRoute element={<TransactionsHistory />} />} />
          {/* Protected routes - require authentication */}
          <Route
            path="/identity"
            element={<ProtectedIdentityRoute />}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute element={<Profile />} />}
          />

          <Route
            path="/wallet"
            element={<ProtectedRoute element={<Wallet />} />}
          />
          <Route
            path="/certificates"
            element={<ProtectedRoute element={<Certificates />} />}
          />
          <Route
            path="/transactions"
            element={<ProtectedRoute element={<Transactions />} />}
          />
          <Route
            path="/notifications"
            element={<ProtectedRoute element={<Notifications />} />}
          />

          <Route path="/help" element={<ProtectedRoute element={<Help />} />} />

          {/* Catch all route - redirect to login page */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
