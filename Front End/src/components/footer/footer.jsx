import { Logo } from "../logo/logo"; // Importing the Logo component
import "./footer.css"; // Importing the footer-specific CSS styles
import { Link } from "react-router-dom"; // Importing Link for internal navigation
import { useState } from "react"; // Importing useState hook for state management
import { newsletterApi } from "./api.ts"; // Importing the API for newsletter subscription

export default function Footer() {
  // State variables for managing user input and status messages
  const [email, setEmail] = useState(""); // Stores the email input value
  const [message, setMessage] = useState(""); // Stores feedback message for subscription status
  const [isLoading, setIsLoading] = useState(false); // Indicates if the subscription request is in progress

  // Function to handle newsletter subscription
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload on form submission
    setIsLoading(true); // Sets loading state to true while processing request
    setMessage(""); // Clear any previous messages
    
    if (!email || !email.includes('@')) {
      setMessage("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    
    console.log(`Submitting email: ${email}`);
    
    try {
      // Calls the API to subscribe the email
      const result = await newsletterApi.subscribe(email);
      console.log('Subscription successful:', result);
      
      // Sets success message
      setMessage("Successfully subscribed! Thank you for joining our newsletter.");
      setEmail(""); // Clears the input field after successful subscription
    } catch (error) {
      console.error('Error in footer component:', error);
      
      // Provide a friendly error message based on the error type
      if (error.message.includes("Server did not return JSON")) {
        setMessage("We're having trouble connecting to our servers. Please try again later.");
      } else if (error.message.includes("unique") || error.message.includes("duplicate")) {
        setMessage("This email is already subscribed to our newsletter!");
      } else {
        setMessage(error.message || "Subscription failed. Please try again.");
      }
    } finally {
      setIsLoading(false); // Resets loading state after request completion
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left section of the footer */}
        <div className="footer-left">
          {/* Displaying the logo */}
          <div className="footer-logo">
            <Logo isFooter={true} />
          </div>

          {/* Newsletter subscription form */}
          <div className="newsletter">
            <h4>Join the newsletter</h4>
            <p>Subscribe for weekly updates. No spams ever!</p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              {/* Input field for email */}
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading} // Disables input when loading
              />
              {/* Submit button */}
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Subscribing..." : "Subscribe"}{" "}
                {/* Shows loading state text */}
              </button>
            </form>
            {/* Display success or error message after submission */}
            {message && (
              <p
                className={`subscription-message ${
                  message.includes("Successfully") ? "success" : "error"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Footer navigation links */}
        <div className="footer-links">
          {/* First column - Product-related links */}
          <div className="footer-column">
            <h4>Product</h4>
            <Link to="/services">Services</Link>
            <Link to="/tokens">Tokens & NFTs</Link>
            <Link to="/hedera">Hedera Network</Link>
            <Link to="/contact">Contact</Link>
          </div>

          {/* Second column - Legal-related links */}
          <div className="footer-column">
            <h4>Legal</h4>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
      </div>

      {/* Footer bottom section */}
      <div className="footer-bottom">
        <p>Privacy Policy • Terms of Service</p>
        <p>&copy; {new Date().getFullYear()} HashGov. All rights reserved.</p>
        <div className="social-icons">{/* Social icons would go here */}</div>
      </div>
    </footer>
  );
}
