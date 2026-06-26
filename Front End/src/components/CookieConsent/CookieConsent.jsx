import React from 'react';
import './CookieConsent.css';

/**
 * Cookie Consent dialog component
 * @param {boolean} show - Whether to show the dialog
 * @param {function} onAccept - Handler for accepting cookies
 * @param {function} onDecline - Handler for declining cookies
 * @param {function} onClose - Handler for closing the dialog
 */
const CookieConsent = ({ show, onAccept, onClose, onDecline }) => {
  if (!show) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-dialog">
        <div className="cookie-consent-header">
          <h2>Cookies Settings</h2>
          <button className="cookie-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="cookie-consent-content">
          <p>
            HashGov uses cookies to store your authentication state and profile preferences.
            We use both essential cookies for site functionality and optional analytics cookies.
            By clicking Accept, you agree to allow us to store these cookies on your device.
            You can decline non-essential cookies and still use the platform with basic functionality.
          </p>
        </div>
        
        <div className="cookie-consent-actions">
          <button 
            className="cookie-consent-btn cookie-accept-btn" 
            onClick={onAccept}
          >
            Accept
          </button>
          <button 
            className="cookie-consent-btn cookie-decline-btn" 
            onClick={onDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
