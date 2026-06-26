import React, { useState, useEffect, useRef } from "react";
import { resetPasswordApi } from "./resetPasswordApi";

function VerificationStep({ email, onSubmit }) {
  const [code, setCode] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef([]);

  // Set up timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, []);

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (/^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setError("");

      // Auto-focus next input if this one is filled
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace - move to previous input if current is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCode(digits);
      inputRefs.current[5].focus(); // Focus the last input after paste
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await resetPasswordApi.sendVerificationCode(email);
      if (response.success) {
        setTimeRemaining(120); // Reset timer to 2 minutes
        setResendDisabled(true);
        setError("");
      } else {
        setError(response.message || "Failed to resend code. Please try again.");
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Check if all digits are filled
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      // Verify the code with the API
      const response = await resetPasswordApi.verifyCode(email, fullCode);
      
      if (response.success) {
        onSubmit(fullCode);
      } else {
        setError(response.message || "Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-step">
      <p className="reset-password-info">
        We've sent a 6-digit verification code to <strong>{email}</strong>.
        <br />
        Enter the code below to verify your email address.
      </p>
      
      <p className="reset-password-timer">
        Code expires in: <span className={timeRemaining < 30 ? "expiring" : ""}>{formatTimeRemaining()}</span>
      </p>
      
      {error && <div className="reset-password-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="reset-password-form">
        <div className="verification-code-container">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : null}
              ref={el => inputRefs.current[index] = el}
              className="verification-code-input"
              disabled={isLoading}
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        <button 
          type="submit" 
          className="reset-password-button primary" 
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
        
        <div className="resend-code">
          <button 
            type="button" 
            className="text-button" 
            onClick={handleResendCode} 
            disabled={resendDisabled || isLoading}
          >
            {resendDisabled ? `Resend code in ${formatTimeRemaining()}` : "Resend code"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VerificationStep;
