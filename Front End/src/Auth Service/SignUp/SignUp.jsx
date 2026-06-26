"use client";

import { useState, useEffect } from "react";
import "./SignUp.css";
import { FaCheck, FaTimes } from "react-icons/fa";
import { authApi } from "../api.ts";
import { ThemeProvider } from "../../context/ThemeContext";
import {Link} from "react-router-dom";

function SignUp() {
  // State to store form input values
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "user", // Default role added here
    receiveUpdates: false,
    privacyPolicyAgreed: false, // Added privacy policy agreement field
  });

  // State to store validation errors
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    privacyPolicyAgreed: "", // Added error field for privacy policy
  });

  // State to track password criteria
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    symbol: false,
  });

  // Add loading and submission status states
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    message: "",
    isError: false,
  });

  /**
   * Helper function to set a cookie
   * @param {string} name - The name of the cookie
   * @param {string} value - The value to store in the cookie
   * @param {number} days - Number of days until the cookie expires
   */
  function setCookie(name, value, days) {
    // Calculate expiration date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    // Set the cookie with name, value, expiration, path, and SameSite attribute
    document.cookie = `${name}=${value}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  }

  // Validate password against criteria whenever it changes
  useEffect(() => {
    const password = formData.password;
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    });
  }, [formData.password]);

  // Check if passwords match whenever either password field changes
  useEffect(() => {
    if (
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  }, [formData.password, formData.confirmPassword]);

  /**
   * Validate name fields to ensure they contain only alphabetical characters
   * @param {string} name - The name value to validate
   * @param {string} field - The field name (firstName or lastName)
   * @returns {boolean} - Whether the validation passed
   */
  const validateName = (name, field) => {
    if (!name) {
      setErrors((prev) => ({
        ...prev,
        [field]: "This field is required",
      }));
      return false;
    }
    if (!/^[A-Za-z]+$/.test(name)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Only alphabetical characters allowed",
      }));
      return false;
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
      return true;
    }
  };

  /**
   * Validate email format
   * @param {string} email - The email to validate
   * @returns {boolean} - Whether the email format is valid
   */
  const validateEmail = (email) => {
    console.log("Validating email:", email); // Debugging log

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required",
      }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }
    setErrors((prev) => ({
      ...prev,
      email: "",
    }));
    return true;
  };

  /**
   * Validate phone number to ensure it contains exactly 8 digits
   * @param {string} phone - The phone number to validate
   * @returns {boolean} - Whether the validation passed
   */
  const validatePhone = (phone) => {
    console.log("Validating phone:", phone); // Debugging log

    if (!phone) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "Phone number is required",
      }));
      return false;
    }
    if (!/^\d{8}$/.test(phone)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "Phone number must be exactly 8 digits",
      }));
      return false;
    } else {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "",
      }));
      return true;
    }
  };

  /**
   * Validate password against security criteria
   * @param {string} password - The password to validate
   * @returns {boolean} - Whether the validation passed
   */
  const validatePassword = (password) => {
    console.log("Validating password:", password); // Debugging log

    // Check if password meets all criteria
    const isValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!password) {
      setErrors((prev) => ({
        ...prev,
        password: "Password is required",
      }));
      return false;
    }
    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        password: "Password doesn't meet requirements",
      }));
      return false;
    } else {
      setErrors((prev) => ({
        ...prev,
        password: "",
      }));
      return true;
    }
  };

  /**
   * Handle form input changes
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    console.log("Input changed:", e.target.name, e.target.value); // Debugging log

    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      // Use checked value for checkboxes, otherwise use the input value
      [name]: type === "checkbox" ? checked : value,
    }));

    // Validate fields as they change
    if (name === "firstName") {
      validateName(value, "firstName");
    } else if (name === "lastName") {
      validateName(value, "lastName");
    } else if (name === "email") {
      validateEmail(value);
    } else if (name === "phoneNumber") {
      validatePhone(value);
    } else if (name === "password") {
      validatePassword(value);
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const isFirstNameValid = validateName(formData.firstName, "firstName");
    const isLastNameValid = validateName(formData.lastName, "lastName");
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phoneNumber);
    const isPasswordValid = validatePassword(formData.password);
    const doPasswordsMatch = formData.password === formData.confirmPassword;
    
    // Check if privacy policy is agreed to
    const isPolicyAgreed = formData.privacyPolicyAgreed;
    if (!isPolicyAgreed) {
      setErrors(prev => ({
        ...prev,
        privacyPolicyAgreed: "You must agree to the Privacy Policy to continue"
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        privacyPolicyAgreed: ""
      }));
    }

    // If any validation fails, stop submission
    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !doPasswordsMatch ||
      !isPolicyAgreed
    ) {
      if (!doPasswordsMatch) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      }
      return;
    }

    try {
      setIsLoading(true);
      setSubmitStatus({ message: "", isError: false });

      // Send registration request to backend with correct lowercase property names
      const response = await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role, // Including the role field in the API call
      });

      console.log("Registration payload:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role,
      });

      console.log("Registration successful:", response);

      // Prepare user data object
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };
      
      console.log('Storing user data in localStorage:', userData);
      
      // Store data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.token);
      
      // Also set cookies for backward compatibility
      setCookie("token", response.token, 30);
      setCookie("userEmail", formData.email, 30);
      setCookie("userName", JSON.stringify(userData), 30); // Store user name data as JSON
      setCookie("isLoggedIn", "true", 30);

      // Handle successful registration
      setSubmitStatus({
        message: "Registration successful! Redirecting to login...",
        isError: false,
      });

      // Redirect to login page after successful registration
      setTimeout(() => {
        window.location.href = "./Login";
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);

      // Handle registration error
      setSubmitStatus({
        message: error.message || "Registration failed. Please try again.",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page-wrapper">
      <ThemeProvider>
        <div className="signup-container">
          {/* Theme toggle removed */}
          <div className="signup-form-wrapper">
            {/* Logo section */}
            <div className="signup-logo-container">
              <div className="signup-logo">
                <span className="signup-logo-icon">✱</span>
                <span className="signup-logo-text">HashGov</span>
              </div>
            </div>

            <h1 className="signup-title">Sign up</h1>

            {/* Status message */}
            {submitStatus.message && (
              <div
                className={`signup-status-message ${
                  submitStatus.isError ? "signup-error" : "signup-success"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Registration form */}
            <form onSubmit={handleSubmit} noValidate className="signup-form">
              {/* First name and last name fields */}
              <div className="signup-form-row">
                <div className="signup-form-group">
                  <label htmlFor="firstName" className="signup-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Foulen"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`signup-input ${
                      errors.firstName ? "signup-input-error" : ""
                    }`}
                    required
                  />
                  {errors.firstName && (
                    <div className="signup-error-text">{errors.firstName}</div>
                  )}
                </div>
                <div className="signup-form-group">
                  <label htmlFor="lastName" className="signup-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Lfleni"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`signup-input ${
                      errors.lastName ? "signup-input-error" : ""
                    }`}
                    required
                  />
                  {errors.lastName && (
                    <div className="signup-error-text">{errors.lastName}</div>
                  )}
                </div>
              </div>

              {/* Email field */}
              <div className="signup-form-row">
                <div className="signup-form-group">
                  <label htmlFor="email" className="signup-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`signup-input ${
                      errors.email ? "signup-input-error" : ""
                    }`}
                    required
                  />
                  {errors.email && (
                    <div className="signup-error-text">{errors.email}</div>
                  )}
                </div>
              </div>

              {/* Phone number field */}
              <div className="signup-form-row">
                <div className="signup-form-group">
                  <label htmlFor="phoneNumber" className="signup-label">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="+216 12 345 678"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    pattern="\d{8}"
                    maxLength={8}
                    className={`signup-input ${
                      errors.phoneNumber ? "signup-input-error" : ""
                    }`}
                    required
                  />
                  {errors.phoneNumber && (
                    <div className="signup-error-text">
                      {errors.phoneNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Password fields */}
              <div className="signup-form-row">
                <div className="signup-form-group">
                  <label htmlFor="password" className="signup-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`signup-input ${
                      errors.password ? "signup-input-error" : ""
                    }`}
                    required
                  />
                  {errors.password && (
                    <div className="signup-error-text">{errors.password}</div>
                  )}
                  {/* Password criteria indicators */}
                  <div className="signup-password-criteria">
                    <div
                      className={`signup-criteria ${
                        passwordCriteria.length
                          ? "criteria-met"
                          : "criteria-not-met"
                      }`}
                    >
                      {passwordCriteria.length ? <FaCheck /> : <FaTimes />} At
                      least 8 characters
                    </div>
                    <div
                      className={`signup-criteria ${
                        passwordCriteria.uppercase
                          ? "criteria-met"
                          : "criteria-not-met"
                      }`}
                    >
                      {passwordCriteria.uppercase ? <FaCheck /> : <FaTimes />}{" "}
                      One uppercase letter
                    </div>
                    <div
                      className={`signup-criteria ${
                        passwordCriteria.lowercase
                          ? "criteria-met"
                          : "criteria-not-met"
                      }`}
                    >
                      {passwordCriteria.lowercase ? <FaCheck /> : <FaTimes />}{" "}
                      One lowercase letter
                    </div>
                    <div
                      className={`signup-criteria ${
                        passwordCriteria.symbol
                          ? "criteria-met"
                          : "criteria-not-met"
                      }`}
                    >
                      {passwordCriteria.symbol ? <FaCheck /> : <FaTimes />} One
                      special character
                    </div>
                  </div>
                </div>
                <div className="signup-form-group">
                  <label htmlFor="confirmPassword" className="signup-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`signup-input ${
                      errors.confirmPassword ? "signup-input-error" : ""
                    }`}
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="signup-error-text">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes container - with stacked layout */}
              <div className="signup-checkboxes-container">
                {/* Email updates checkbox */}
                <div className="signup-checkbox-group">
                  <input
                    type="checkbox"
                    id="receiveUpdates"
                    name="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onChange={handleChange}
                    className="signup-checkbox"
                  />
                  <label
                    htmlFor="receiveUpdates"
                    className="signup-checkbox-label"
                  >
                    I want to receive updates via email.
                  </label>
                </div>

                {/* Privacy policy checkbox */}
                <div className="signup-checkbox-group">
                  <input
                    type="checkbox"
                    id="privacyPolicyAgreed"
                    name="privacyPolicyAgreed"
                    checked={formData.privacyPolicyAgreed}
                    onChange={handleChange}
                    className={`signup-checkbox ${errors.privacyPolicyAgreed ? "signup-checkbox-error" : ""}`}
                    required
                  />
                  <label
                    htmlFor="privacyPolicyAgreed"
                    className="signup-checkbox-label"
                  >
                    I agree to the <Link to="/privacy" className="signup-link">Privacy Policy</Link> and <Link to="/terms" className="signup-link">Terms of Service</Link>.
                  </label>
                  {errors.privacyPolicyAgreed && (
                    <div className="signup-error-text">You must agree to the Privacy Policy to continue.</div>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="signup-submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </button>

              {/* Divider */}
              <div className="signup-divider">
                <span className="signup-divider-text">or</span>
              </div>
            </form>

            {/* Login link */}
            <div className="signup-login-link">
              Already have an account?{" "}
              <a href="./Login" className="signup-link">
                Log in
              </a>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default SignUp;
