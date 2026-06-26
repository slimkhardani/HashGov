import React, { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import './SuccessMessage.css';

const SuccessMessage = ({ title, message, onClose, duration = 8000 }) => {
  useEffect(() => {
    // Auto-close after duration
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="success-message-container">
      <div className="success-message">
        <div className="success-message-header">
          <div className="success-icon">
            <CheckCircle size={24} />
          </div>
          <h3>{title}</h3>
          <button className="success-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="success-message-content">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
