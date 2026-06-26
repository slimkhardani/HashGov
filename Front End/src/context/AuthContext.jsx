import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../Auth Service/api.ts';
import { profilesApi } from '../Auth Service/profilesApi';

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'hederaadmin@gmail.com';
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'HederaPFE2025';

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Helper functions for cookie management
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

const setCookie = (name, value, days) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  document.cookie = `${name}=${value}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // Removed navigate since we're using window.location.href for all redirects

  // Only these paths require authentication
  const PROTECTED_PATHS = ['/identity', '/certificates', '/dashboard'];
  
  // Initialize auth state from cookies and localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || getCookie('token');
      const userEmail = getCookie('userEmail');
      const isLoggedIn = getCookie('isLoggedIn');
      const storedUserData = localStorage.getItem('user');

      if (token && isLoggedIn === 'true' && userEmail) {
        // Valid authentication found
        try {
          // Check if user is admin
          const adminCheck = userEmail === ADMIN_EMAIL;
          setIsAdmin(adminCheck);
          
          // Check if we have user data in localStorage
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            setUser({
              ...userData,
              email: userEmail,
              token,
              isAdmin: adminCheck
            });
            console.log('Initialized user with profile data from localStorage:', userData);
          } else {
            // Initialize with basic user data and try to fetch profile
            setUser({
              email: userEmail,
              token,
              isAdmin: adminCheck
            });

            // Try to fetch profile data
            try {
              const profileResponse = await profilesApi.getProfile(userEmail, token);
              if (profileResponse && profileResponse.profile) {
                const profileData = profileResponse.profile;
                const updatedUser = {
                  email: userEmail,
                  token,
                  firstName: profileData.personalInfo?.firstName || '',
                  lastName: profileData.personalInfo?.lastName || '',
                  profileImage: profileData.personalInfo?.profileImage || null,
                  personalInfo: profileData.personalInfo || {},
                  isAdmin: adminCheck
                };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('Fetched and stored profile data on init:', updatedUser);
              }
            } catch (profileError) {
              console.error('Error fetching profile data during initialization:', profileError);
            }
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Check if user is admin
          const isUserAdmin = userEmail === ADMIN_EMAIL;
          // Set basic user with just email and token
          setUser({
            email: userEmail,
            token,
            isAdmin: isUserAdmin
          });
        }
      }
      
      setLoading(false); // Authentication check complete
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    // Check if the credentials match admin credentials
    const isAdminLogin = credentials.Email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD;
    
    // Special handling for admin login
    if (isAdminLogin) {
      console.log('Admin login detected');
      
      // Generate a mock token for admin
      const adminToken = 'admin-' + Date.now();
      
      // Save admin info in cookies
      setCookie('token', adminToken, credentials.rememberMe ? 30 : 1);
      setCookie('userEmail', credentials.Email, credentials.rememberMe ? 30 : 1);
      setCookie('isLoggedIn', 'true', credentials.rememberMe ? 30 : 1);
      
      // Store token in localStorage
      localStorage.setItem('token', adminToken);
      
      // Create admin user object
      const adminUser = {
        email: credentials.Email,
        token: adminToken,
        isAdmin: true,
        firstName: 'Admin',
        lastName: 'User'
      };
      
      // Set admin state
      setIsAdmin(true);
      
      // Update user state
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      
      // Redirect to admin page with full page refresh (like regular users)
      // Using a 1 second delay to ensure the success message is visible
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
      return { success: true };
    }
    
    // Normal user login flow
    try {
      // The authApi.login function expects 'email' (lowercase) in the credentials
      // but our form provides 'Email' (capital E), so we need to transform it
      const apiCredentials = {
        email: credentials.Email?.toLowerCase(), // Convert to lowercase as the API expects
        password: credentials.password
      };
      
      console.log('Sending login request with transformed credentials:', apiCredentials);
      
      // First, check if the user exists and if their account is frozen
      try {
        const checkUserStatusResponse = await authApi.checkUserStatus(apiCredentials.email);
        console.log('User status check:', checkUserStatusResponse);
        
        // If user exists and is frozen, prevent login
        if (checkUserStatusResponse && checkUserStatusResponse.status === 'frozen') {
          console.error('Login attempt for frozen account:', apiCredentials.email);
          return { 
            success: false, 
            error: 'Your account has been frozen. Please contact the administrator via the contact page.'
          };
        }
      } catch (statusError) {
        // If there's an error checking status, just log it and continue with login attempt
        // This ensures backward compatibility if the endpoint doesn't exist
        console.warn('Error checking user status:', statusError);
      }
      
      // Proceed with normal login flow
      const response = await authApi.login(apiCredentials);
      
      if (response && response.token) {
        // Save token and user info in cookies
        setCookie('token', response.token, credentials.rememberMe ? 30 : 1);
        setCookie('userEmail', credentials.Email, credentials.rememberMe ? 30 : 1);
        setCookie('isLoggedIn', 'true', credentials.rememberMe ? 30 : 1);
        
        // Store token in localStorage for easier access
        localStorage.setItem('token', response.token);

        // Create initial user object
        const initialUser = {
          email: credentials.Email,
          token: response.token,
          isAdmin: false
        };
        
        // Set admin state (regular user)
        setIsAdmin(false);

        // Update user state with basic info first
        setUser(initialUser);
        
        
        // Try to fetch the complete profile data
        try {
          const profileResponse = await profilesApi.getProfile(credentials.Email, response.token);
          if (profileResponse && profileResponse.profile) {
            const profileData = profileResponse.profile;
            const userWithProfile = {
              ...initialUser,
              firstName: profileData.personalInfo?.firstName || '',
              lastName: profileData.personalInfo?.lastName || '',
              profileImage: profileData.personalInfo?.profileImage || null,
              personalInfo: profileData.personalInfo || {},
              isAdmin: isAdminLogin // Fixing remaining lint errors related to isUserAdmin variable
            };
            setUser(userWithProfile);
            localStorage.setItem('user', JSON.stringify(userWithProfile));
            console.log('Profile data stored after login:', userWithProfile);
            // Redirect to profile page if profile exists
            setTimeout(() => {
              window.location.href = '/profile';
            }, 1000);
          } else {
            // If no profile found, just store the basic user
            localStorage.setItem('user', JSON.stringify(initialUser));
            // Redirect to identity page if no profile exists
            setTimeout(() => {
              window.location.href = '/identity';
            }, 1000);
          }
        } catch (profileError) {
          console.error('Error fetching profile after login:', profileError);
          // Store basic user if profile fetch fails
          localStorage.setItem('user', JSON.stringify(initialUser));
          // Redirect to identity page if there's a profile error
          setTimeout(() => {
            window.location.href = '/identity';
          }, 1000);
        }

        return { success: true };
      }
      return { success: false, error: 'Login failed: No token received' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'An unknown error occurred' };
    }
  };

  // Logout function
  const logout = () => {
    // Show some logging for debugging
    console.log('Logout initiated...');
    
    // Clear localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('Cleared localStorage items');
    
    // Remove all auth cookies
    deleteCookie('token');
    deleteCookie('userEmail');
    deleteCookie('userName'); // Also delete the userName cookie
    deleteCookie('isLoggedIn');
    console.log('Deleted all authentication cookies');
    
    // Reset user state
    setUser(null);
    
    // Add a 2-second delay before redirecting to login page
    console.log('Waiting 2 seconds before redirecting...');
    setTimeout(() => {
      // Redirect to login with page refresh (consistent behavior)
      window.location.href = '/login';
    }, 2000); // 2000 milliseconds = 2 seconds
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    // Check both the user state and auth cookies/localStorage for a more robust check
    const hasToken = !!localStorage.getItem('token') || !!getCookie('token');
    const isLoggedInCookie = getCookie('isLoggedIn') === 'true';
    
    // For debugging
    console.log('Authentication check:', {
      user: !!user,
      hasToken,
      isLoggedInCookie,
      isAdmin
    });
    
    // User is authenticated if either:
    // 1. The user object exists in state AND there's a token
    // 2. There's a token and the isLoggedIn cookie is true
    return (!!user && hasToken) || (hasToken && isLoggedInCookie);
  };

  // Auth context value
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    getCookie,
    setCookie,
    deleteCookie,
    protectedPaths: PROTECTED_PATHS,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
