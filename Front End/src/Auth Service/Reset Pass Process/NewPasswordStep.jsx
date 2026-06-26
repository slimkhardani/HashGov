import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

function NewPasswordStep({ onSubmit }) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    symbol: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update password criteria whenever password changes
  useEffect(() => {
    const password = formData.newPassword;
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    });
  }, [formData.newPassword]);

  // Check if passwords match whenever either password field changes
  useEffect(() => {
    if (
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
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
  }, [formData.newPassword, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (name === "newPassword" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePassword = (password) => {
    // Check if password meets all criteria
    const isValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!password) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password is required",
      }));
      return false;
    }
    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password doesn't meet requirements",
      }));
      return false;
    } else {
      setErrors((prev) => ({
        ...prev,
        newPassword: "",
      }));
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate new password
    const isPasswordValid = validatePassword(formData.newPassword);
    
    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }
    
    if (isPasswordValid) {
      setIsLoading(true);
      try {
        // Submit the new password
        onSubmit(formData.newPassword, formData.confirmPassword);
      } catch (error) {
        console.error("Error updating password:", error);
        setErrors((prev) => ({
          ...prev,
          newPassword: "An error occurred. Please try again.",
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="reset-password-step">
      <p className="reset-password-info">
        Create a new password for your account.
      </p>
      
      <form onSubmit={handleSubmit} className="reset-password-form">
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="••••••"
            value={formData.newPassword}
            onChange={handleChange}
            className={errors.newPassword ? "error" : ""}
            required
            disabled={isLoading}
          />
          {errors.newPassword && (
            <div className="reset-password-error">{errors.newPassword}</div>
          )}
          
          {/* Password requirements */}
          <div className="password-requirements">
            <div
              className={`requirement ${
                passwordCriteria.length ? "met" : "not-met"
              }`}
            >
              {passwordCriteria.length ? <FaCheck /> : <FaTimes />} At least 8 characters
            </div>
            <div
              className={`requirement ${
                passwordCriteria.uppercase ? "met" : "not-met"
              }`}
            >
              {passwordCriteria.uppercase ? <FaCheck /> : <FaTimes />} One uppercase letter
            </div>
            <div
              className={`requirement ${
                passwordCriteria.lowercase ? "met" : "not-met"
              }`}
            >
              {passwordCriteria.lowercase ? <FaCheck /> : <FaTimes />} One lowercase letter
            </div>
            <div
              className={`requirement ${
                passwordCriteria.symbol ? "met" : "not-met"
              }`}
            >
              {passwordCriteria.symbol ? <FaCheck /> : <FaTimes />} One special character
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "error" : ""}
            required
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <div className="reset-password-error">{errors.confirmPassword}</div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="reset-password-button primary" 
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default NewPasswordStep;
