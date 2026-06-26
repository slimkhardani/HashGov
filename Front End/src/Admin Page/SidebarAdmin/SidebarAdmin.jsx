import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  LogOut,
  FileCheck,
  Wallet,
  ClipboardList,
  ChevronDown,
  History
} from "lucide-react";
import "./SidebarAdmin.css";

export default function SidebarAdmin({ 
  sidebarOpen, 
  activeSection, 
  onNavClick, 
  onLogout 
}) {
  // Separate state for certificates submenu, user submissions submenu, and profile dropdown
  const [certificatesOpen, setCertificatesOpen] = useState(
    ['property-certificates', 'academic-certificates'].includes(activeSection)
  );
  const [submissionsOpen, setSubmissionsOpen] = useState(
    ['newsletter-subscribers', 'contact-form-submissions', 'profile-update-requests'].includes(activeSection)
  );
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Toggle the certificates submenu
  const toggleCertificates = () => {
    setCertificatesOpen(prev => !prev);
  };

  // Toggle the user submissions submenu
  const toggleSubmissions = () => {
    setSubmissionsOpen(prev => !prev);
  };

  // Toggle the profile dropdown
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(prev => !prev);
  };

  // Set dashboard as default active section if none provided
  const currentSection = activeSection || 'dashboard';
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon-sidebar">
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 100"
              className="logo-svg"
            >
              <circle
                cx="50"
                cy="50"
                r="30"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
              />
              <line
                x1="20"
                y1="50"
                x2="80"
                y2="50"
                stroke="currentColor"
                strokeWidth="5"
              />
            </svg>
          </div>
          <span className="app-logo-text">HashGov</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className={`nav-item ${currentSection === 'dashboard' ? 'active' : ''}`}>
            <Link to="/dashboard" className="nav-link" onClick={() => onNavClick('dashboard')}>
              <BarChart3 size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={`nav-item ${currentSection === 'wallet-revenue' ? 'active' : ''}`}>
            <Link to="/admin/wallet" className="nav-link" onClick={() => onNavClick('wallet-revenue')}>
              <Wallet size={20} />
              <span>Wallet & Revenue</span>
            </Link>
          </li>
          <li className={`nav-item ${currentSection === 'transactions-history' ? 'active' : ''}`}>
            <Link to="/admin/transactions" className="nav-link" onClick={() => onNavClick('transactions-history')}>
              <History size={20} />
              <span>Transaction History</span>
            </Link>
          </li>
          <li className={`nav-item ${activeSection === 'identities' ? 'active' : ''}`}>
            <Link to="/admin/identities" className="nav-link" onClick={() => onNavClick('identities')}>
              <Users size={20} />
              <span>Identities & Users</span>
            </Link>
          </li>
          <li className={`nav-item nav-parent ${['property-certificates','academic-certificates'].includes(activeSection) ? 'active' : ''}`}> 
  <div className="nav-link nav-parent-link" onClick={toggleCertificates}>
    <FileCheck size={20} />
    <span>Certificates</span>
    <ChevronDown size={16} className={certificatesOpen ? 'chevron-rotate' : ''} />
  </div>
  {certificatesOpen && (
    <ul className="nav-submenu">
      <li className={`nav-subitem ${activeSection === 'property-certificates' ? 'active' : ''}`}> 
        <Link to="/admin/certificates/property" className="nav-sublink" onClick={() => onNavClick('property-certificates')}>Property-Related Certificate Demands</Link>
      </li>
      <li className={`nav-subitem ${activeSection === 'academic-certificates' ? 'active' : ''}`}> 
        <Link to="/admin/certificates/academic" className="nav-sublink" onClick={() => onNavClick('academic-certificates')}>Academic Certificate Demands</Link>
      </li>
    </ul>
  )}
</li>
          
          <li className={`nav-item nav-parent ${['newsletter-subscribers','contact-form-submissions','profile-update-requests'].includes(activeSection) ? 'active' : ''}`}> 
            <div className="nav-link nav-parent-link" onClick={toggleSubmissions}>
              <ClipboardList size={20} />
              <span>User Submissions</span>
              <ChevronDown size={16} className={submissionsOpen ? 'chevron-rotate' : ''} />
            </div>
            {submissionsOpen && (
              <ul className="nav-submenu">
                <li className={`nav-subitem ${activeSection === 'newsletter-subscribers' ? 'active' : ''}`}> 
                  <Link to="/admin/submissions/newsletter-subscribers" className="nav-sublink" onClick={() => onNavClick('newsletter-subscribers')}>Newsletter Subscribers</Link>
                </li>
                <li className={`nav-subitem ${activeSection === 'contact-form-submissions' ? 'active' : ''}`}> 
                  <Link to="/admin/submissions/contact-form-submissions" className="nav-sublink" onClick={() => onNavClick('contact-form-submissions')}>Contact Form Submissions</Link>
                </li>
                <li className={`nav-subitem ${activeSection === 'profile-update-requests' ? 'active' : ''}`}> 
                  <Link to="/admin/submissions/profile-update-requests" className="nav-sublink" onClick={() => onNavClick('profile-update-requests')}>Profile Update Requests</Link>
                </li>
              </ul>
            )}
          </li> 
        </ul>
      </nav>
      
      {/* Sidebar footer with admin profile */}
      <div className="sidebar-footer">
        <div className="user-profile" onClick={toggleProfileDropdown}>
          {/* Admin avatar */}
          <div className="avatar">AU</div>
          <div className="user-info">
            <div className="user-name">Admin User</div>
            <div className="user-role">System Administrator</div>
          </div>
          <ChevronDown size={16} className={profileDropdownOpen ? "chevron-rotate" : ""} />
        </div>
        
        {/* Admin dropdown menu */}
        {profileDropdownOpen && (
          <div className="user-dropdown">
            <ul className="dropdown-menu">
              <li className="dropdown-item">
                <button 
                  className="dropdown-link dropdown-link-logout"
                  onClick={() => {
                    // Remove authentication data and redirect to login
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.href = "/login";
                  }}
                  type="button"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
