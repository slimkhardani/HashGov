import axios from "axios";

// Base API URL - Adjust if needed to match your backend URL
const API_URL = "http://localhost:5000/api";

export const resetPasswordApi = {
  // Send verification code to user's email for password reset
  async sendVerificationCode(email) {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password/request`, { email });
      return response.data;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      
      // Handle different error types
      if (error.response) {
        // The request was made and the server responded with a status code
        return error.response.data;
      }
      
      return { 
        success: false, 
        message: "Network error. Please check your connection and try again." 
      };
    }
  },

  // Verify the reset code entered by user
  async verifyCode(email, code) {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password/verify-code`, { 
        email, 
        code 
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying code:", error);
      
      if (error.response) {
        return error.response.data;
      }
      
      return { 
        success: false, 
        message: "Network error. Please check your connection and try again." 
      };
    }
  },

  // Reset the user's password with the new password
  async resetPassword(email, code, newPassword) {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password/update`, {
        email,
        code,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error("Error resetting password:", error);
      
      if (error.response) {
        return error.response.data;
      }
      
      return { 
        success: false, 
        message: "Network error. Please check your connection and try again." 
      };
    }
  }
};
