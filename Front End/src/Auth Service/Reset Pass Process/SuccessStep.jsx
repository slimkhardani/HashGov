import React, { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

function SuccessStep({ onComplete }) {
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onComplete]);

  return (
    <div className="reset-password-step success-step">
      <div className="success-icon">
        <FaCheckCircle size={60} />
      </div>
      
      <h2>Password Reset Successful!</h2>
      
      <p className="reset-password-info">
        Your password has been successfully updated.
        You can now use your new password to log into your account.
      </p>
      
      <p className="redirect-message">
        Redirecting to login page in {countdown} seconds...
      </p>
      
      <button 
        onClick={onComplete} 
        className="reset-password-button primary"
      >
        Login Now
      </button>
    </div>
  );
}

export default SuccessStep;
