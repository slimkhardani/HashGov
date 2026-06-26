import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPasswordApi } from "./resetPasswordApi";
import EmailStep from "./EmailStep";
import VerificationStep from "./VerificationStep";
import NewPasswordStep from "./NewPasswordStep";
import SuccessStep from "./SuccessStep";
import "./ResetPassword.css";
import { ThemeProvider } from "../../context/ThemeContext";

function ResetPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetData, setResetData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEmailSubmit = (submittedEmail) => {
    setResetData({
      ...resetData,
      email: submittedEmail,
    });
    setEmail(submittedEmail);
    setCurrentStep(2); // Move to verification step
  };

  const handleVerificationSubmit = (submittedCode) => {
    setResetData({
      ...resetData,
      code: submittedCode,
    });
    setCurrentStep(3); // Move to new password step
  };

  const handleNewPasswordSubmit = async (password, confirmPassword) => {
    try {
      // Call API to update the password
      const response = await resetPasswordApi.resetPassword(
        resetData.email,
        resetData.code,
        password
      );
      
      if (response.success) {
        setResetData({
          ...resetData,
          newPassword: password,
          confirmPassword: confirmPassword,
        });
        setCurrentStep(4); // Move to success step
      } else {
        // If there's an error, we should handle it (could be that code expired)
        alert(response.message || "Failed to update password. Please try again.");
        // Optionally redirect back to the verification step if code expired
        if (response.message?.includes("expired")) {
          setCurrentStep(1); // Back to email step to restart process
        }
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("An error occurred while updating password. Please try again.");
    }
  };

  const handleSuccessComplete = () => {
    navigate("/login"); // Redirect to login page after success
  };

  return (
    <div className="reset-password-page-container">
      <ThemeProvider>
        <div className="reset-password-container">
          <div className="reset-password-form-container">
            {/* Logo section */}
            <div className="reset-password-logo-container">
              <div className="reset-password-logo">
                <span className="reset-password-logo-icon">✱</span>
                <span className="reset-password-logo-text">HashGov</span>
              </div>
            </div>

            <h1>Reset Password</h1>

            {/* Step indicator */}
            <div className="reset-password-steps">
              <div className={`step ${currentStep >= 1 ? "active" : ""}`}></div>
              <div className={`step ${currentStep >= 2 ? "active" : ""}`}></div>
              <div className={`step ${currentStep >= 3 ? "active" : ""}`}></div>
              <div className={`step ${currentStep >= 4 ? "active" : ""}`}></div>
            </div>

            {/* Step content */}
            {currentStep === 1 && <EmailStep onSubmit={handleEmailSubmit} />}
            {currentStep === 2 && (
              <VerificationStep 
                email={email} 
                onSubmit={handleVerificationSubmit} 
              />
            )}
            {currentStep === 3 && (
              <NewPasswordStep onSubmit={handleNewPasswordSubmit} />
            )}
            {currentStep === 4 && (
              <SuccessStep onComplete={handleSuccessComplete} />
            )}
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}

export default ResetPassword;
