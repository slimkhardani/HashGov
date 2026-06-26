const API_URL = "http://localhost:5000/api/messages";

export const contactApi = {
  async submitContact(contactData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) {
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit contact form");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};

export const newsletterApi = {
  async subscribe(email: string) {
    try {
      const response = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};
