import React, { useState } from "react";
import { resetPasswordApi } from "./resetPasswordApi";

function EmailStep({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to send a verification code to the user's email
      const response = await resetPasswordApi.sendVerificationCode(email);
      
      if (response.success) {
        onSubmit(email);
      } else {
        setError(response.message || "Email not found. Please check and try again.");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-step">
      <p className="reset-password-info">
        Enter your email address and we'll send you a verification code to reset your password.
      </p>
      
      {error && <div className="reset-password-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="reset-password-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? "error" : ""}
            required
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="reset-password-button primary" 
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Verification Code"}
        </button>
        
        <div className="reset-password-back-link">
          <a href="/login">Back to Login</a>
        </div>
      </form>
    </div>
  );
}

export default EmailStep;
