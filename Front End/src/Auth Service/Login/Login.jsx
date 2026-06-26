"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import { ThemeProvider } from "../../context/ThemeContext";

function Login() {
  const { login } = useAuth(); // Use the auth context

  // State to store form input values
  const [formData, setFormData] = useState({
    Email: "",
    password: "",
    rememberMe: false,
  });

  // State to store validation errors
  const [errors, setErrors] = useState({
    Email: "",
    password: "",
  });

  // State for API-related status
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  /**
   * Validate email format
   * @param {string} email - The email to validate
   * @returns {boolean} - Whether the email format is valid
   */
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

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
  
  // We now use the AuthContext cookie functions instead
  // This is kept for reference
  /*
  const setCookie = (name, value, days) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    document.cookie = `${name}=${value}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  };
  */

  // Just pre-fill email if available - no auto redirect
  useEffect(() => {
    // Pre-fill email if available in cookies
    const userEmail = getCookie("userEmail");
    if (userEmail) {
      setFormData((prev) => ({
        ...prev,
        Email: userEmail,
      }));
    }
  }, []);

  /**
   * Handle form input changes
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear errors when user types
    if (name === "Email" || name === "password") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setApiError("");
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors and status
    setApiError("");
    setLoginSuccess(false);

    // Basic validation
    let isValid = true;
    const newErrors = { Email: "", password: "" };

    // Check if email is provided and valid
    if (!formData.Email) {
      newErrors.Email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.Email)) {
      newErrors.Email = "Please enter a valid email address";
      isValid = false;
    }

    // Check if password is provided
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    // Update error state
    setErrors(newErrors);

    // If form is valid, proceed with login
    if (isValid) {
      try {
        setIsLoading(true);

        // The admin credential check is now handled in AuthContext

        // Use the login function from AuthContext
        const loginResult = await login({
          Email: formData.Email,
          password: formData.password,
          rememberMe: formData.rememberMe
        });
        
        console.log('Login result:', loginResult);
        
        if (loginResult.success) {
          console.log("Login successful");
          setLoginSuccess(true);

          // Note: Cookies are now set in the AuthContext login function
          
          // Manually redirect based on user role in addition to AuthContext redirection
          // This provides a fallback in case the AuthContext redirection doesn't work
          setTimeout(() => {
            const isAdminUser = formData.Email.toLowerCase() === 'hederaadmin@gmail.com';
            if (isAdminUser) {
              console.log('Login.jsx: Manually redirecting admin to /dashboard');
              window.location.href = '/dashboard';
            } else {
              console.log('Login.jsx: Manually redirecting user to /profile');
              window.location.href = '/profile';
            }
          }, 1200); // Slightly longer timeout than AuthContext to let it try first

          // The authentication and redirection are now handled by the AuthContext
          // We'll let the system handle redirections based on whether the user is admin or regular
        } else {
          // Display the specific error message returned from the AuthContext
          setApiError(loginResult.error || "Login failed: No token received");
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error.message === "Account does not exist") {
          setApiError(
            "This account does not exist. Please check your email or sign up."
          );
        } else if (error.message === "Incorrect password") {
          setApiError("Incorrect password. Please try again.");
          setErrors((prev) => ({ ...prev, password: "Incorrect password" }));
        } else {
          setApiError(error.message || "Login failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-page-container">
      <ThemeProvider>
        <div className="login-container">
          {/* Theme toggle removed */}
          <div className="login-form-container">
            {/* Logo section */}
            <div className="login-logo-container">
              <div className="login-logo">
                <span className="login-logo-icon">✱</span>
                <span className="login-logo-text">HashGov</span>
              </div>
            </div>

            <h1>Log in</h1>

            {/* API Error Message */}
            {apiError && (
              <div className={`api-error-message ${apiError.includes('frozen') ? 'frozen-account-error' : ''}`}>
                {apiError}
              </div>
            )}

            {/* Success Message */}
            {loginSuccess && (
              <div className="success-message">
                Login successful! Redirecting...
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Email field */}
              <div className="form-row full-width">
                <div className="form-group">
                  <label htmlFor="Email">Email</label>
                  <input
                    type="email"
                    id="Email"
                    name="Email"
                    placeholder="your@email.com"
                    value={formData.Email}
                    onChange={handleChange}
                    className={errors.Email ? "error" : ""}
                    required
                  />
                  {errors.Email && (
                    <div className="error-message">{errors.Email}</div>
                  )}
                </div>
              </div>

              {/* Password field */}
              <div className="form-row full-width">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                    required
                  />
                  {errors.password && (
                    <div className="error-message">{errors.password}</div>
                  )}
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="login-button primary"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>

              {/* Forgot password link */}
              <div className="forgot-password-link">
                <a href="/forgot-password">Forgot password?</a>
              </div>

              {/* Divider between primary login and social logins */}
              <div className="divider">
                <span>or</span>
              </div>
            </form>

            {/* Sign up link */}
            <div className="signup-link">
              Don't have an account? <a href="./SignUp">Sign up</a>
            </div>

            {/* Logout button for testing - uncomment if needed */}
            {/* 
          <div className="logout-link">
            <button onClick={handleLogout} className="text-button">Logout (for testing)</button>
          </div>
          */}
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default Login;