// API base URL - adjust this to match your backend URL
const API_URL = "http://localhost:5000/api";

export const authApi = {
  // Check user status function - used to verify if an account is frozen
  async checkUserStatus(email: string) {
    try {
      const response = await fetch(`${API_URL}/auth/check-status?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for auth if needed
      });

      if (!response.ok) {
        // If user doesn't exist or endpoint doesn't exist, just return null
        if (response.status === 404) {
          return null;
        }
        const data = await response.json();
        throw new Error(data.message || "Failed to check user status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("Error checking user status:", error);
      // Return null instead of throwing to allow login flow to continue
      // if the status check endpoint doesn't exist
      return null;
    }
  },

  // Login function
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (response.status === 404) {
          throw new Error("Account does not exist");
        } else if (response.status === 401) {
          throw new Error("Incorrect password");
        } else {
          throw new Error(data.message || "Login failed");
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Register function
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: string;
  }) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};
