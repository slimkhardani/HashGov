// Real API implementation to connect to the backend
const API_URL = "http://localhost:5000/api/emails";

export const newsletterApi = {
  async subscribe(email: string) {
    try {
      console.log(`Sending subscription request for email: ${email}`);
      console.log(`POST request to: ${API_URL}/subscribe`);
      
      // Make the actual API call to the backend
      const response = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Non-JSON response received:", textResponse);
        throw new Error("Server did not return JSON. Please check if the backend server is running.");
      }
      
      // Parse JSON response
      const data = await response.json();
      console.log("Subscription response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Subscription failed");
      }

      return data;
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      throw error;
    }
  },
};
