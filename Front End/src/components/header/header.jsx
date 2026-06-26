"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Menu } from "lucide-react"; // Importing icons used in the header
import "./header.css"; // Importing CSS file for styling
import axios from "axios"; // Import axios for API calls

export default function Header({ title, onToggleSidebar }) {
  
  // State for user profile data
  const [profileData, setProfileData] = useState(null);
  const hasFetchedRef = useRef(false);
  
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
  
  // Retrieve basic user data from localStorage
  const user = useMemo(() => {
    const userString = localStorage.getItem("user");
    let userData = {};
    try {
      userData = userString ? JSON.parse(userString) : {};
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return userData;
  }, []);
  
  // Fetch profile data from API only once when component mounts
  useEffect(() => {
    // Only fetch if we haven't already fetched the data
    if (hasFetchedRef.current) return;
    
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token') || getCookie('token');
        const userEmail = user.email || getCookie('userEmail');
        
        if (!token || !userEmail) return;
        
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
  }, [user]); // Include user in dependency array
  
  // Get name with fallbacks to different cases
  const firstName = profileData?.personalInfo?.firstName || user.firstName || user.FirstName || "U";
  const lastName = profileData?.personalInfo?.lastName || user.lastName || user.LastName || "";
  
  // Get profile picture from different sources with fallbacks
  const profilePicture = profileData?.personalInfo?.profileImage || 
                        user.profileImage || 
                        (user.personalInfo && user.personalInfo.profileImage) || 
                        null;
  
  // Generate user initials for avatar (fallback if no profile picture)
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  console.log('Header - Generated initials:', initials);

  return (
    <header className="identity-header">
      {/* Left section of the header */}
      <div className="identity-header-left">
        {/* Button to toggle the sidebar menu */}
        <button className="identity-menu-button" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        {/* Page title */}
        <h1>{title}</h1>
      </div>

      {/* Right section of the header */}
      <div className="identity-header-right">
        {/* User avatar displaying profile picture or initials */}
        <div className="identity-user-profile-mini">
          {profilePicture ? (
            <div className="identity-avatar identity-image-container">
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="identity-profile-image" 
              />
            </div>
          ) : (
            <div className="identity-avatar">{initials}</div>
          )}
        </div>
      </div>
    </header>
  );
}
