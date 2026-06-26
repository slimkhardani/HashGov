"use client"; // Ensures this component runs on the client side

import React, { useState, useEffect, useRef, useMemo } from "react"; // Import React hooks
import {
  Fingerprint,
  Wallet,
  CreditCard,
  FileCheck,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./sidebar.css"; // Import CSS for styling
import axios from "axios"; // Import axios for API calls

export default function Sidebar({
  activePage = "profile", // Default active page
  onToggle, // Function to toggle sidebar visibility
  isOpen, // Boolean to determine if sidebar is open
}) {
  // State to control the user dropdown menu
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Listen for window resize and auto-close sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      // Check if screen width is below tablet breakpoint (768px)
      if (window.innerWidth < 768 && isOpen) {
        // Auto-close the sidebar
        onToggle();
      }
    };
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Initial check on component mount
    handleResize();
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onToggle]); // Re-run when isOpen or onToggle changes
  
  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  // Helper function to get cookie
  const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  };
  
  // Helper function to delete cookie
  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`Cookie ${name} deleted`);
  };

  // Handle logout by removing both localStorage items and cookies
  const handleLogout = () => {
    // Clear localStorage items
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log("Cleared localStorage items");
    
    // Delete all authentication cookies
    deleteCookie("token");
    deleteCookie("userEmail");
    deleteCookie("userName");
    deleteCookie("isLoggedIn");
    console.log("Deleted all authentication cookies");
    
    // Redirect to login page
    window.location.href = "/login";
  };
  
  // State for user profile data
  const [profileData, setProfileData] = useState(null);
  const hasFetchedRef = useRef(false);
  
  // Retrieve and memoize user data from localStorage for basic information
  const user = useMemo(() => {
    const userString = localStorage.getItem("user");
    try {
      return userString ? JSON.parse(userString) : {};
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  }, []);
  
  // Fetch profile data from API only once when component mounts
  useEffect(() => {
    // Only fetch if we haven't already fetched the data
    if (hasFetchedRef.current) return;
    
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token') || getCookie('token');
        const userEmail = user.email || getCookie('userEmail');
        
        if (!token || !userEmail) {
          return;
        }
        
        // Mark as fetched before API call to prevent race conditions
        hasFetchedRef.current = true;
        
        // Fetch user profile data from API
        const response = await axios.get(`http://localhost:5000/api/profiles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.profile) {
          const profile = response.data.profile;
          setProfileData(profile);
          
          // Only update localStorage if the profile image has changed or is missing
          if (!user.profileImage && profile.personalInfo?.profileImage) {
            const updatedUser = {
              ...user,
              firstName: profile.personalInfo?.firstName || user.firstName || '',
              lastName: profile.personalInfo?.lastName || user.lastName || '',
              profileImage: profile.personalInfo?.profileImage || null,
              personalInfo: {
                ...(user.personalInfo || {}),
                ...profile.personalInfo,
              }
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfileData();
  }, [user]); 
  
  // Get name with fallbacks to different cases
  const firstName = profileData?.personalInfo?.firstName || user.firstName || "User";
  const lastName = profileData?.personalInfo?.lastName || user.lastName || "";
  
  // Get profile picture from different sources with fallbacks
  const profilePicture = profileData?.personalInfo?.profileImage || 
                        user.profileImage || 
                        (user.personalInfo && user.personalInfo.profileImage) || 
                        null;
  
  // Generate user initials from first and last name (fallback if no profile picture)
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  console.log('Sidebar - Generated initials:', initials);

  return (
    <div className="sidebar-container">
      <aside
        className={`app-sidebar ${
          isOpen ? "app-sidebar-open" : "app-sidebar-closed"
        }`}
      >
      {/* Sidebar header with logo and close button */}
      <div className="app-sidebar-header">
        <div className="app-logo">
          {/* Logo icon */}
          <div className="app-logo-icon-sidebar">
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

      {/* Sidebar navigation menu */}
      <nav className="app-sidebar-nav">
        <ul className="app-nav-list">
          {/* Navigation items */}
          <li
            className={`app-nav-item ${
              activePage === "identity" || activePage === "profile" ? "app-nav-active" : ""
            }`}
          >
            <Link to="/identity" className="app-nav-link">
              <Fingerprint size={20} />
              <span>Digital Identity</span>
            </Link>
          </li>
          <li
            className={`app-nav-item ${
              activePage === "wallet" ? "app-nav-active" : ""
            }`}
          >
            <Link to="/wallet" className="app-nav-link">
              <Wallet size={20} />
              <span>Wallet</span>
            </Link>
          </li>
          <li
            className={`app-nav-item ${
              activePage === "transactions" ? "app-nav-active" : ""
            }`}
          >
            <Link to="/transactions" className="app-nav-link">
              <CreditCard size={20} />
              <span>Transactions</span>
            </Link>
          </li>
          <li
            className={`app-nav-item ${
              activePage === "certificates" ? "app-nav-active" : ""
            }`}
          >
            <Link to="/certificates" className="app-nav-link">
              <FileCheck size={20} />
              <span>Certificates</span>
            </Link>
          </li>
          <li
            className={`app-nav-item ${
              activePage === "notifications" ? "app-nav-active" : ""
            }`}
          >
            <Link to="/notifications" className="app-nav-link">
              <Bell size={20} />
              <span>Notifications</span>
            </Link>
          </li>
        </ul>

        {/* Divider between main navigation and settings/help section */}
        <div className="app-nav-divider"></div>

        <ul className="app-nav-list">
          {/* Settings and help sections */}
          <li
            className={`app-nav-item ${
              activePage === "settings" ? "app-nav-active" : ""
            }`}
          >
            <Link to="" className="app-nav-link">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </li>
          <li
            className={`app-nav-item ${
              activePage === "help" ? "app-nav-active" : ""
            }`}
          >
            <Link to="/help" className="app-nav-link">
              <HelpCircle size={20} />
              <span>Help</span>
            </Link>
          </li>
          {/* Logout button moved to user profile dropdown */}
        </ul>
      </nav>

      {/* Sidebar footer with user profile */}
      <div className="sidebar-footer">
        <div className="user-profile" onClick={toggleDropdown}>
          {/* User avatar */}
          {profilePicture ? (
            <div className="avatar sidebar-image-container">
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="sidebar-profile-image" 
              />
            </div>
          ) : (
            <div className="avatar">{initials}</div>
          )}
          <div className="user-info">
            <div className="user-name">{`${firstName} ${lastName}`}</div>
            <div className="user-role">User</div>
          </div>
          <ChevronDown size={16} className={dropdownOpen ? "chevron-rotate" : ""} />
        </div>
        
        {/* User dropdown menu */}
        {dropdownOpen && (
          <div className="user-dropdown">
            <ul className="dropdown-menu">
              <li className="dropdown-item">
                <button 
                  className="dropdown-link dropdown-link-logout"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut size={18} style={{ marginRight: 8 }} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
    </div>
  );
}
