// Profiles API Service
const API_URL = "http://localhost:5000/api";

export const profilesApi = {
  // Save profile function
  async saveProfile(profileData, token) {
    try {
      console.log("Sending profile data to:", `${API_URL}/profiles/save`);
      console.log("With token:", token);
      
      // First try a request to test if the server is reachable
      try {
        const healthCheck = await fetch(`http://localhost:5000/health`);
        console.log("API Health check response:", healthCheck.status);
      } catch (healthError) {
        console.warn("Health check failed:", healthError);
      }
      
      // Log the exact data being sent to the server
      console.log("Request body sent to server:", JSON.stringify(profileData, null, 2));
      
      // Ensure userId is correctly set in profile data
      if (!profileData.userId) {
        console.warn("No userId found in profile data, this may cause server validation errors");
      }
      
      // Add user _id to request if available (based on the example request format)
      const requestBody = {
        ...profileData,
      };
      
      console.log("Final request body:", JSON.stringify(requestBody, null, 2));
      
      // Log exact request details
      console.log("============ REQUEST DETAILS ============");
      console.log("URL:", `${API_URL}/profiles/save`);
      console.log("Headers:", {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token && token.substring(0, 10)}...`
      });
      console.log("Request body structure:", Object.keys(profileData));
      console.log("profileData.email present?", !!profileData.email);
      console.log("profileData.userId present?", !!profileData.userId);
      console.log("profileData.personalInfo present?", !!profileData.personalInfo);
      console.log("profileData.identityInfo present?", !!profileData.identityInfo);
      console.log("profileData.addressInfo present?", !!profileData.addressInfo);
      console.log("=======================================");
      
      const response = await fetch(`${API_URL}/profiles/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      
      // Log response details
      console.log("============ RESPONSE DETAILS ============");
      console.log("Status:", response.status, response.statusText);
      console.log("Response headers:", [...response.headers.entries()]);
      console.log("=======================================");
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        console.error(`Server returned error status: ${response.status} ${response.statusText}`);
        
        // Log all response headers for debugging
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log("Response headers:", headers);
        
        const contentType = response.headers.get("content-type");
        try {
          if (contentType && contentType.includes("application/json")) {
            // It's JSON, we can parse it
            const errorData = await response.json();
            console.error("Server returned JSON error data:", JSON.stringify(errorData, null, 2));
            
            // Check for different types of error formats
            if (errorData.validationErrors) {
              throw new Error(`Validation errors: ${JSON.stringify(errorData.validationErrors)}`);
            } else if (errorData.errors) {
              throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
            } else if (errorData.message && errorData.message.includes("required")) {
              // If the message mentions required fields
              throw new Error(`Required fields missing: ${errorData.message}`);
            }
            
            throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
          } else {
            // Not JSON, get text instead
            const text = await response.text();
            console.error("Server returned non-JSON response:", text);
            throw new Error(`Server returned non-JSON response with status: ${response.status}`);
          }
        } catch (parseError) {
          console.error("Error parsing server response:", parseError);
          // Include more details about the original response if possible
          throw new Error(`Server error (${response.status}): ${parseError.message}`);
        }
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  },

  // Get profile function
  async getProfile(userId, token) {
    try {
      console.log('Fetching profile for userId:', userId);
      const response = await fetch(`${API_URL}/profiles/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          // It's JSON, we can parse it
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
        } else {
          // Not JSON, get text instead
          const text = await response.text();
          console.error("Server returned non-JSON response:", text);
          throw new Error(`Server returned non-JSON response with status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      // Debug avatar data specifically
      console.log('Profile data received from server:', data);
      console.log('Avatar URL in profile data:', data.profile?.personalInfo?.profileImage);
      
      return data;
    } catch (error) {
      console.error("Error retrieving profile:", error);
      throw error;
    }
  }
};
