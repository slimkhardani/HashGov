"use client";
import { useState, useEffect } from "react";
import Sidebar from "./../components/sidebar/sidebar";
import Header from "./../components/header/header";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook
import { profilesApi } from "../Auth Service/profilesApi"; // Import the profiles API
import { nftService } from "../services/nftService"; // Import NFT service
import ImageUploader from "./ImageUploader"; // Import our custom image uploader
import CardImageUploader from "./CardImageUploader"; // Import ID card image uploader
import {
  User,
  CreditCard,
  MapPin,
  Share2,
  Check,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Phone,
  Users,
  Fingerprint,
  X,
  AlertCircle,
} from "lucide-react";
import "./identity.css";
import "./card-uploader.css"; // Import card uploader styles
import CookieConsent from "../components/CookieConsent/CookieConsent";

// Custom avatar upload and conversion functions

export default function IdentityPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Cookie consent state
  const [showCookieConsent, setShowCookieConsent] = useState(true); // Set to true by default
  
  // Use destructuring with default empty object to prevent errors
  const { user = null, isAuthenticated = () => false, getCookie = () => null } = useAuth() || {};

  // State for personal information
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
  });

  // State for custom avatar upload
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");

  const [identityInfo, setIdentityInfo] = useState({
    idNumber: "",
    expiryDate: "",
    FingerprintNumber: "",
    issueDate: "",
  });
  // ID Card Images (front and back)
  const [idCardFrontImage, setIdCardFrontImage] = useState(null);
  const [idCardBackImage, setIdCardBackImage] = useState(null);
  const [idCardFrontImagePreview, setIdCardFrontImagePreview] = useState(null);
  const [idCardBackImagePreview, setIdCardBackImagePreview] = useState(null);
  const [idCardFrontImageError, setIdCardFrontImageError] = useState("");
  const [idCardBackImageError, setIdCardBackImageError] = useState("");

  const [addressInfo, setAddressInfo] = useState({
    homeAddress: "",
    workAddress: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [socialInfo, setSocialInfo] = useState({
    linkedin: "",
    facebook: "",
    instagram: "",
    website: "",
  });

  const countries = [
    "Tunisia",
    "Algeria",
    "Morocco",
    "Libya",
    "Egypt",
    "France",
    "Germany",
    "Italy",
    "Spain",
    "United Kingdom",
    "United States",
    // Add more countries as needed
  ];
  
  // Force show the cookie consent dialog for testing
  useEffect(() => {
    // Remove any existing cookie consent to test the dialog
    localStorage.removeItem('cookieConsent');
    // Set the dialog to show
    setShowCookieConsent(true);
  }, []);

  // Cookie consent handlers
  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieConsent(false);
  };

  const handleDeclineCookies = () => {
    // Record that the user has declined non-essential cookies
    localStorage.setItem('cookieConsent', 'declined');
    setShowCookieConsent(false);
  };

  const handleCloseCookieConsent = () => {
    // Even if they close without choosing, we record that they've seen the dialog
    localStorage.setItem('cookieConsent', 'closed');
    setShowCookieConsent(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate personal information
      const newErrors = {};
      if (!personalInfo.firstName.trim())
        newErrors.firstName = "This field is required";
      if (!personalInfo.lastName.trim())
        newErrors.lastName = "This field is required";
      if (!personalInfo.dateOfBirth)
        newErrors.dateOfBirth = "This field is required";
      if (!personalInfo.gender) newErrors.gender = "This field is required";
      if (!personalInfo.phoneNumber.trim())
        newErrors.phoneNumber = "This field is required";

      setErrors(newErrors);

      // Only proceed if there are no errors
      if (Object.keys(newErrors).length === 0) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 2) {
      // Validate identity card information
      const newErrors = {};

      // ID Number validation
      if (!identityInfo.idNumber) {
        newErrors.idNumber = "This field is required";
      } else if (!/^[0-1]\d{7}$/.test(identityInfo.idNumber)) {
        newErrors.idNumber = "ID must be 8 digits and start with 0 or 1";
      }

      // Issue Date validation
      if (!identityInfo.issueDate) {
        newErrors.issueDate = "This field is required";
      }

      // Fingerprint validation
      if (!identityInfo.FingerprintNumber) {
        newErrors.FingerprintNumber = "This field is required";
      } else if (!/^\d{8,}$/.test(identityInfo.FingerprintNumber)) {
        newErrors.FingerprintNumber = "Must be at least 8 digits";
      }

      // Validate ID card images
      if (!idCardFrontImage) newErrors.idCardFrontImage = "ID card front image is required";
      if (!idCardBackImage) newErrors.idCardBackImage = "ID card back image is required";

      setErrors(newErrors);

      // Only proceed if there are no errors
      if (Object.keys(newErrors).length === 0) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 3) {
      // Validate address information
      const newErrors = {};

      if (!addressInfo.homeAddress.trim())
        newErrors.homeAddress = "This field is required";
      if (!addressInfo.workAddress.trim())
        newErrors.workAddress = "This field is required";
      if (!addressInfo.city.trim()) newErrors.city = "This field is required";
      if (!addressInfo.country) newErrors.country = "This field is required";

      if (!addressInfo.postalCode) {
        newErrors.postalCode = "This field is required";
      } else if (!/^\d+$/.test(addressInfo.postalCode)) {
        newErrors.postalCode = "Postal code must contain only numbers";
      }

      setErrors(newErrors);

      // Only proceed if there are no errors
      if (Object.keys(newErrors).length === 0) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 4) {
      // No validation needed for social media links since they're all optional
      // Don't increment the step here
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleIdentityInfoChange = (e) => {
    const { name, value } = e.target;
    setIdentityInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressInfoChange = (e) => {
    const { name, value } = e.target;
    setAddressInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialInfoChange = (e) => {
    const { name, value } = e.target;
    setSocialInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle processed image from ImageUploader component
  const handleProcessedImage = (imageData) => {
    setProfileImage(imageData);
    setProfileImagePreview(imageData);
    setImageError("");
  };

  // Handle ID card front image
  const handleIdCardFrontImage = (imageData) => {
    setIdCardFrontImage(imageData);
    setIdCardFrontImagePreview(imageData);
    setIdCardFrontImageError(imageData ? "" : "ID card front image is required");
  };

  // Handle ID card back image
  const handleIdCardBackImage = (imageData) => {
    setIdCardBackImage(imageData);
    setIdCardBackImagePreview(imageData);
    setIdCardBackImageError(imageData ? "" : "ID card back image is required");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate ID card images before submitting
    if (!idCardFrontImage) {
      setIdCardFrontImageError("ID card front image is required");
    } else {
      setIdCardFrontImageError("");
    }
    
    if (!idCardBackImage) {
      setIdCardBackImageError("ID card back image is required");
    } else {
      setIdCardBackImageError("");
    }
    
    if (currentStep < 4) {
      // If not on step 4, proceed to next step instead
      handleNextStep();
    } else {
      // We're on step 4, show loading state and save profile
      setIsSubmitting(true);
      
      // Debug token information
      console.log('=== AUTH DEBUG INFORMATION ===');
      console.log('Is authenticated?', isAuthenticated());
      console.log('User object:', user);
      console.log('All cookies:', document.cookie);
      console.log('Token from cookie:', getCookie('token'));
      console.log('User email from cookie:', getCookie('userEmail')); 
      console.log('=== END AUTH DEBUG ===');
      
      try {
        // Check if user is logged in
        if (!isAuthenticated()) {
          throw new Error("You must be logged in to save your profile");
        }

        // Get the auth token from cookies
        const token = getCookie('token');
        
        // Validate all required fields before submission
        const validationErrors = {};
        
        // Log all form data for debugging
        console.log("Personal Info:", personalInfo);
        console.log("Identity Info:", identityInfo);
        console.log("Address Info:", addressInfo);
        console.log("Social Info:", socialInfo);
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }
        
        // Get user email from cookies if not available in user object
        const userEmail = user?.email || getCookie('userEmail');
        
        console.log("Authentication details:", { 
          isAuthenticated: isAuthenticated(),
          userEmail: userEmail, 
          user: user,
          token: token ? "[PRESENT]" : "[MISSING]"
        });
        
        if (!userEmail) {
          throw new Error("User email is required to save profile");
        }

        // Validate personal info
        if (!personalInfo.firstName?.trim()) validationErrors.firstName = "First name is required";
        if (!personalInfo.lastName?.trim()) validationErrors.lastName = "Last name is required";
        if (!personalInfo.dateOfBirth) validationErrors.dateOfBirth = "Date of birth is required";
        if (!personalInfo.gender) validationErrors.gender = "Gender is required";
        if (!personalInfo.phoneNumber?.trim()) validationErrors.phoneNumber = "Phone number is required";
        
        // Validate identity info
        if (!identityInfo.idNumber?.trim()) validationErrors.idNumber = "ID number is required";
        if (!identityInfo.issueDate) validationErrors.issueDate = "Issue date is required";
        // Expiry date is optional, so no validation required
        if (!identityInfo.FingerprintNumber?.trim()) validationErrors.FingerprintNumber = "Fingerprint number is required";
        
        // Validate address info
        if (!addressInfo.homeAddress?.trim()) validationErrors.homeAddress = "Home address is required";
        if (!addressInfo.workAddress?.trim()) validationErrors.workAddress = "Work address is required";
        if (!addressInfo.city?.trim()) validationErrors.city = "City is required";
        if (!addressInfo.postalCode?.trim()) validationErrors.postalCode = "Postal code is required";
        if (!addressInfo.country) validationErrors.country = "Country is required";
        
        // If there are validation errors, display them and stop submission
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setIsSubmitting(false);
          
          // Determine which step has missing fields and navigate to that step
          let stepWithErrors = 4; // Default to current step
          
          const personalInfoErrors = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber'];
          const identityInfoErrors = ['idNumber', 'issueDate', 'FingerprintNumber']; // removed expiryDate as it's optional
          const addressInfoErrors = ['homeAddress', 'workAddress', 'city', 'postalCode', 'country'];
          
          const errorFields = Object.keys(validationErrors);
          
          if (errorFields.some(field => personalInfoErrors.includes(field))) {
            stepWithErrors = 1;
          } else if (errorFields.some(field => identityInfoErrors.includes(field))) {
            stepWithErrors = 2;
          } else if (errorFields.some(field => addressInfoErrors.includes(field))) {
            stepWithErrors = 3;
          }
          
          // Navigate to the step with errors
          setCurrentStep(stepWithErrors);
          
          // Create a more specific error message
          const missingFieldsMessage = errorFields.map(field => {
            // Convert camelCase to readable format
            return field.replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase());
          }).join(', ');
          
          setErrorMessage(`Missing required fields: ${missingFieldsMessage}. Please complete all required information.`);
          setShowError(true);
          console.error("Validation errors:", validationErrors);
          return;
        }

        // Create the profile structure following the exact format expected by the server
        const userId = getCookie('userId') || user?._id || userEmail;
        
        // Prepare data for the NFT creation
        const identityNFTData = {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          dateOfBirth: personalInfo.dateOfBirth,
          gender: personalInfo.gender,
          phoneNumber: personalInfo.phoneNumber,
          idNumber: identityInfo.idNumber,
          idIssueDate: identityInfo.issueDate,
          fingerprintNumber: identityInfo.FingerprintNumber,
          homeAddress: addressInfo.homeAddress,
          workAddress: addressInfo.workAddress,
          city: addressInfo.city,
          postalCode: addressInfo.postalCode,
          country: addressInfo.country,
          idCardFrontImage: idCardFrontImage,
          idCardBackImage: idCardBackImage
        };

        // Prepare profile data
        console.log('Preparing to send profile image:', profileImage ? 'Image present' : 'No image uploaded');
        
        const profileData = {
          // Include userId in both formats the server might expect
          userId: userId,
          // Also include the user object with _id as the server might require this structure
          user: { _id: userId },
          personalInfo: {
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
            dateOfBirth: personalInfo.dateOfBirth,
            gender: personalInfo.gender,
            phoneNumber: personalInfo.phoneNumber,
            profileImage: profileImage // Profile image with compression applied
          },
          identityInfo: {
            idNumber: identityInfo.idNumber,
            expiryDate: identityInfo.expiryDate || "", // Use the actual value if provided
            FingerprintNumber: identityInfo.FingerprintNumber, 
            issueDate: identityInfo.issueDate,
            idCardFrontImage: idCardFrontImage, // Save base64 front image
            idCardBackImage: idCardBackImage    // Save base64 back image
          },
          addressInfo: {
            homeAddress: addressInfo.homeAddress,
            workAddress: addressInfo.workAddress,
            city: addressInfo.city,
            postalCode: addressInfo.postalCode,
            country: addressInfo.country
          },
          socialInfo: {
            linkedin: socialInfo.linkedin || "",
            facebook: socialInfo.facebook || "",
            instagram: socialInfo.instagram || "",
            website: socialInfo.website || ""
          },
          createdAt: new Date().toISOString()
        };
        
        console.log("Sending profile with token:", token);
        console.log("Full profile data being sent to server:", JSON.stringify(profileData));
        
        try {
          // Make sure the token is valid before proceeding
          if (!token) {
            throw new Error("Authentication token is missing. Please log in again.");
          }

          // Step 1: Create and mint the NFT
          console.log("Creating identity NFT with data:", identityNFTData);
          console.log("Token being used:", token ? "[PRESENT]" : "[MISSING]");
          const nftResponse = await nftService.createIdentityNFT(identityNFTData, token);
          console.log("NFT created successfully:", nftResponse);
          
          // Step 2: Add NFT data to the profile
          if (nftResponse && nftResponse.tokenId) {
            profileData.nftData = {
              tokenId: nftResponse.tokenId,
              accountId: nftResponse.accountId || '',
              status: nftResponse.status || 'SUCCESS',
              mintedAt: new Date().toISOString(),
              identityId: nftResponse.identityId || ''
            };
          }
          
          // Step 3: Save the complete profile with NFT information
          const response = await profilesApi.saveProfile(profileData, token);
          
          // Store the updated profile data in localStorage
          try {
            // Get existing user data from localStorage
            const existingUserData = localStorage.getItem('user');
            let userData = existingUserData ? JSON.parse(existingUserData) : {};
            
            console.log('Before update - userData:', userData);
            console.log('Profile image being added:', profileImage ? 'Image exists (data URI)' : 'No image');
            
            // Update the user data with the profile information
            userData = {
              ...userData,
              firstName: personalInfo.firstName, // Add firstName at root level
              lastName: personalInfo.lastName,   // Add lastName at root level
              profileImage: profileImage,        // Add profile image directly at root level
              personalInfo: {
                ...(userData.personalInfo || {}),
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                dateOfBirth: personalInfo.dateOfBirth,
                gender: personalInfo.gender,
                phoneNumber: personalInfo.phoneNumber,
                profileImage: profileImage       // Make sure profileImage is in personalInfo
              }
            };
            
            console.log('After update - userData structure:', Object.keys(userData));
            if (userData.personalInfo) {
              console.log('After update - personalInfo structure:', Object.keys(userData.personalInfo));
            }
            
            // Save the updated user data back to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Updated user data in localStorage with profile image');
            
            // Force reload of the page to ensure components pick up the new data
            setTimeout(() => {
              window.location.reload();
            }, 1000); // 1 second delay to show success message first
          } catch (storageError) {
            console.error('Error updating localStorage:', storageError);
          }
          
          // Show success message
          setIsSubmitting(false);
          setShowSuccess(true);
          console.log("Profile and NFT saved successfully:", response);
        } catch (serverError) {
          console.error("Server returned error:", serverError);
          setIsSubmitting(false);
          
          // Check for 409 Conflict (uniqueness violations) or other field validation errors
          if (serverError.response && serverError.response.data) {
            const { status, data } = serverError.response;
            // Handle 409 Conflict for uniqueness violations
            if (status === 409 && data) {
              if (data.field) {
                setErrors(prev => ({ ...prev, [data.field]: data.message }));
                setCurrentStep(2);
                setErrorMessage(
                  data.field === 'idNumber'
                    ? 'ID Number already exists in our system. Please use a different ID Number.'
                    : data.field === 'FingerprintNumber'
                    ? 'Fingerprint Number already exists in our system. Please use a different Fingerprint Number.'
                    : (data.message && data.message.toLowerCase().includes('fingerprint'))
                    ? 'Fingerprint Number already exists in our system. Please use a different Fingerprint Number.'
                    : data.message || 'A profile with this information already exists.'
                );
                setShowError(true);
                // Scroll to and highlight the field with error
                setTimeout(() => {
                  const element = document.getElementById(data.field);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                    element.classList.add('field-error-highlight');
                    setTimeout(() => {
                      element.classList.remove('field-error-highlight');
                    }, 3000);
                  }
                }, 500);
                return;
              } else if (data.message) {
                const cleanMessage = data.message ? data.message.replace(/^Server error \(\d+\): /, '') : '';
setErrorMessage(cleanMessage);
                setShowError(true);
                return;
              } else {
                setErrorMessage('A profile with this information already exists.');
                setShowError(true);
                return;
              }
            }
            // Other API errors
            // Remove any leading 'Server error (409): ' or similar prefix
const cleanMessage = data.message ? data.message.replace(/^Server error \(\d+\): /, '') : 'Server error occurred.';
setErrorMessage(cleanMessage);
            setShowError(true);
            return;
          }
          // Fallback for network or unexpected errors
          setErrorMessage(serverError.message || 'An unexpected error occurred.');
          setShowError(true);
          return;
        }
      } catch (error) {
        // Show error message
        setIsSubmitting(false);
        setErrorMessage(error.message || "Failed to save profile. Please try again.");
        setShowError(true);
        console.error("Error saving profile:", error);
      }
    }
  };

  return (
    <div className="app-identity-page">
      {showSuccess && (
        <div className="app-success-overlay">
          <div className="app-success-message">
            <Check size={50} color="green" />
            <h2>Profile completed successfully!</h2>
            <p>Your profile has been saved to our database.</p>
            <button 
              className="app-btn-primary app-close-btn" 
              onClick={() => setShowSuccess(false)}
            >
              <X size={16} /> Close
            </button>
          </div>
        </div>
      )}
      
      {showError && (
  <div className="app-success-overlay">
    <div className="app-success-message app-error-message">
      <AlertCircle size={50} color="red" />
      <h2>Error Saving Profile</h2>
      <p>{errorMessage}</p>
      <button 
        className="app-btn-primary app-close-btn" 
        onClick={() => setShowError(false)}
      >
        <X size={16} /> Close
      </button>
    </div>
  </div>
)}
{/* General error alert at the top of the form if error is field-specific */}
{(errors.idNumber || errors.FingerprintNumber) && (
  <div className="app-general-error-alert" role="alert">
    <AlertCircle size={18} style={{verticalAlign: 'middle', marginRight: 6}} />
    {errors.idNumber && `ID Number: ${errors.idNumber}`}
    {errors.FingerprintNumber && `Fingerprint Number: ${errors.FingerprintNumber}`}
  </div>
)}
      
      <div className="app-dashboard">
        <Sidebar
          activePage="identity"
          onToggle={toggleSidebar}
          isOpen={sidebarOpen}
        />

        <main
          className={`app-main-content ${
            !sidebarOpen ? "app-sidebar-closed" : ""
          }`}
        >
          <Header
            title="Digital Identity Service"
            onToggleSidebar={toggleSidebar}
          />

          <div className="app-dashboard-content">
            <div className="app-identity-container">
              <div className="app-stepper">
                <div
                  className={`app-step ${
                    currentStep >= 1 ? "app-step-active" : ""
                  }`}
                >
                  <div className="app-step-icon">
                    {currentStep > 1 ? <Check size={20} /> : <User size={20} />}
                  </div>
                </div>
                <div className="app-step-connector"></div>
                <div
                  className={`app-step ${
                    currentStep >= 2 ? "app-step-active" : ""
                  }`}
                >
                  <div className="app-step-icon">
                    {currentStep > 2 ? (
                      <Check size={20} />
                    ) : (
                      <CreditCard size={20} />
                    )}
                  </div>
                </div>
                <div className="app-step-connector"></div>
                <div
                  className={`app-step ${
                    currentStep >= 3 ? "app-step-active" : ""
                  }`}
                >
                  <div className="app-step-icon">
                    {currentStep > 3 ? (
                      <Check size={20} />
                    ) : (
                      <MapPin size={20} />
                    )}
                  </div>
                </div>
                <div className="app-step-connector"></div>
                <div
                  className={`app-step ${
                    currentStep >= 4 ? "app-step-active" : ""
                  }`}
                >
                  <div className="app-step-icon">
                    <Share2 size={20} />
                  </div>
                </div>
              </div>

              <div className="app-form-container">
                <form 
                  onSubmit={(e) => {
                    // Always prevent default form submission
                    e.preventDefault();
                    
                    // Only process the form when explicitly on step 4
                    if (currentStep === 4) {
                      handleSubmit(e);
                    } else {
                      // Otherwise just proceed to next step
                      handleNextStep();
                    }
                  }}
                >
                  {/* Step 1: Personal Information */}
                  <div
                    className={`app-form-step ${
                      currentStep === 1 ? "app-step-active" : ""
                    }`}
                  >
                    <h2 className="app-form-title">Personal Information</h2>
                    <p className="app-form-description">
                      Please provide your basic personal information
                    </p>

                    <div className="app-warning-message">
                      <AlertCircle size={16} className="warning-icon" />
                      <p><strong>Important:</strong> Please fill your information carefully. Once your digital identity is generated, modifications are not allowed. Any change requests must be submitted to the administrator.</p>
                    </div>

                    {/* Enhanced Image Upload Component */}
                    <div className="app-form-group app-full-width">
                      <label>
                        <User className="input-icon" size={16} />
                        Profile Picture
                      </label>
                      <ImageUploader 
                        onImageChange={handleProcessedImage}
                        initialImage={profileImagePreview}
                      />
                      {imageError && <div className="app-form-error">{imageError}</div>}
                    </div>

                    <div className="app-form-grid">
                      <div className="app-form-group">
                        <label htmlFor="firstName">
                          <User size={16} />
                          First Name <span className="app-required"></span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={personalInfo.firstName}
                          onChange={handlePersonalInfoChange}
                          placeholder="Enter your first name"
                          required
                          className={`app-form-input ${
                            errors.firstName ? "app-input-error" : ""
                          }`}
                        />
                        {errors.firstName && (
                          <div className="app-error-text">
                            {errors.firstName}
                          </div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="lastName">
                          <User size={16} />
                          Last Name <span className="app-required"></span>
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={personalInfo.lastName}
                          onChange={handlePersonalInfoChange}
                          placeholder="Enter your last name"
                          required
                          className={`app-form-input ${
                            errors.lastName ? "app-input-error" : ""
                          }`}
                        />
                        {errors.lastName && (
                          <div className="app-error-text">
                            {errors.lastName}
                          </div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="dateOfBirth">
                          <Calendar size={16} />
                          Date of Birth <span className="app-required"></span>
                        </label>
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={personalInfo.dateOfBirth}
                          onChange={handlePersonalInfoChange}
                          required
                          className={`app-form-input ${
                            errors.dateOfBirth ? "app-input-error" : ""
                          }`}
                        />
                        {errors.dateOfBirth && (
                          <div className="app-error-text">
                            {errors.dateOfBirth}
                          </div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="gender">
                          <Users size={16} />
                          Gender <span className="app-required"></span>
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={personalInfo.gender}
                          onChange={handlePersonalInfoChange}
                          required
                          className={`app-form-select ${
                            errors.gender ? "app-input-error" : ""
                          }`}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        {errors.gender && (
                          <div className="app-error-text">{errors.gender}</div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="phoneNumber">
                          <Phone size={16} />
                          Phone Number <span className="app-required"></span>
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={personalInfo.phoneNumber}
                          onChange={handlePersonalInfoChange}
                          placeholder="Enter your phone number"
                          required
                          className={`app-form-input ${
                            errors.phoneNumber ? "app-input-error" : ""
                          }`}
                        />
                        {errors.phoneNumber && (
                          <div className="app-error-text">
                            {errors.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Identity Card Information */}
                  <div
                    className={`app-form-step ${
                      currentStep === 2 ? "app-step-active" : ""
                    }`}
                  >
                    <h2 className="app-form-title">
                      Identity Card Information
                    </h2>
                    <p className="app-form-description">
                      Please provide your identity card details
                    </p>

                    <div className="app-form-grid">
                      {/* ID Card Images - Side by Side */}
                      <div className="app-form-group app-full-width">
                        <label>
                          <CreditCard size={16} className="input-icon" />
                          ID Card Images <span className="app-required"></span>
                        </label>
                        <div className="id-card-container">
                          <div className="id-card-uploader">
                            <p className="upload-label">Front Side</p>
                            <CardImageUploader
                              onImageChange={handleIdCardFrontImage}
                              initialImage={idCardFrontImagePreview}
                            />
                            {idCardFrontImageError && (
                              <div className="app-form-error">{idCardFrontImageError}</div>
                            )}
                          </div>
                          <div className="id-card-uploader">
                            <p className="upload-label">Back Side</p>
                            <CardImageUploader
                              onImageChange={handleIdCardBackImage}
                              initialImage={idCardBackImagePreview}
                            />
                            {idCardBackImageError && (
                              <div className="app-form-error">{idCardBackImageError}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="app-form-group">
                        <label htmlFor="idNumber">
                          <Fingerprint size={16} />
                          ID Number <span className="app-required"></span>
                        </label>
                        <input
  type="text"
  id="idNumber"
  name="idNumber"
  value={identityInfo.idNumber}
  onChange={e => {
    handleIdentityInfoChange(e);
    if (errors.idNumber) setErrors(prev => ({ ...prev, idNumber: undefined }));
  }}
  placeholder="Enter your ID number"
  required
  className={`app-form-input ${errors.idNumber ? "app-input-error" : ""}`}
  aria-describedby={errors.idNumber ? "idNumber-error" : undefined}
/>
{errors.idNumber && (
  <div className="app-error-text" id="idNumber-error" role="alert">
    <AlertCircle size={16} style={{verticalAlign: 'middle', marginRight: 4}} />
    {errors.idNumber}
  </div>
)}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="issueDate">
                          <Calendar size={16} />
                          Issue Date <span className="app-required"></span>
                        </label>
                        <input
                          type="date"
                          id="issueDate"
                          name="issueDate"
                          value={identityInfo.issueDate}
                          onChange={handleIdentityInfoChange}
                          required
                          className={`app-form-input ${
                            errors.issueDate ? "app-input-error" : ""
                          }`}
                        />
                        {errors.issueDate && (
                          <div className="app-error-text">
                            {errors.issueDate}
                          </div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="expiryDate">
                          <Calendar size={16} />
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          id="expiryDate"
                          name="expiryDate"
                          value={identityInfo.expiryDate}
                          onChange={handleIdentityInfoChange}
                          className={`app-form-input ${
                            errors.expiryDate ? "app-input-error" : ""
                          }`}
                        />
                        {errors.expiryDate && (
                          <div className="app-error-text">
                            {errors.expiryDate}
                          </div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="FingerprintNumber">
                          <Fingerprint size={16} />
                          Fingerprint Number{" "}
                          <span className="app-required"></span>
                        </label>
                        <input
  type="text"
  id="FingerprintNumber"
  name="FingerprintNumber"
  value={identityInfo.FingerprintNumber}
  onChange={e => {
    handleIdentityInfoChange(e);
    if (errors.FingerprintNumber) setErrors(prev => ({ ...prev, FingerprintNumber: undefined }));
  }}
  placeholder="Enter Fingerprint Number"
  required
  className={`app-form-input ${errors.FingerprintNumber ? "app-input-error" : ""}`}
  aria-describedby={errors.FingerprintNumber ? "FingerprintNumber-error" : undefined}
/>
{errors.FingerprintNumber && (
  <div className="app-error-text" id="FingerprintNumber-error" role="alert">
    <AlertCircle size={16} style={{verticalAlign: 'middle', marginRight: 4}} />
    {errors.FingerprintNumber}
  </div>
)}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Address Information */}
                  <div
                    className={`app-form-step ${
                      currentStep === 3 ? "app-step-active" : ""
                    }`}
                  >
                    <h2 className="app-form-title">Address Information</h2>
                    <p className="app-form-description">
                      Please provide your address details
                    </p>

                    <div className="app-form-grid">
                      <div className="app-form-group app-full-width">
                        <label htmlFor="homeAddress">
                          <MapPin size={16} />
                          Home Address <span className="app-required"></span>
                        </label>
                        <input
                          type="text"
                          id="homeAddress"
                          name="homeAddress"
                          value={addressInfo.homeAddress}
                          onChange={handleAddressInfoChange}
                          placeholder="Enter your home address"
                          required
                          className={`app-form-input ${
                            errors.homeAddress ? "app-input-error" : ""
                          }`}
                        />
                        {errors.homeAddress && (
                          <div className="app-error-text">
                            {errors.homeAddress}
                          </div>
                        )}
                      </div>

                      <div className="app-form-group app-full-width">
                        <label htmlFor="workAddress">
                          <MapPin size={16} />
                          Work Address <span className="app-required"></span>
                        </label>
                        <input
                          type="text"
                          id="workAddress"
                          name="workAddress"
                          value={addressInfo.workAddress}
                          onChange={handleAddressInfoChange}
                          placeholder="Enter your work address"
                          required
                          className={`app-form-input ${
                            errors.workAddress ? "app-input-error" : ""
                          }`}
                        />
                        {errors.workAddress && (
                          <div className="app-error-text">
                            {errors.workAddress}
                          </div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="city">
                          <MapPin size={16} />
                          City <span className="app-required"></span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={addressInfo.city}
                          onChange={handleAddressInfoChange}
                          placeholder="Enter your city"
                          required
                          className={`app-form-input ${
                            errors.city ? "app-input-error" : ""
                          }`}
                        />
                        {errors.city && (
                          <div className="app-error-text">{errors.city}</div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="postalCode">
                          <MapPin size={16} />
                          Postal Code <span className="app-required"></span>
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={addressInfo.postalCode}
                          onChange={handleAddressInfoChange}
                          placeholder="Enter your postal code"
                          required
                          className={`app-form-input ${
                            errors.postalCode ? "app-input-error" : ""
                          }`}
                        />
                        {errors.postalCode && (
                          <div className="app-error-text">
                            {errors.postalCode}
                          </div>
                        )}
                      </div>

                      <div className="app-form-group">
                        <label htmlFor="country">
                          <MapPin size={16} />
                          Country <span className="app-required"></span>
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={addressInfo.country}
                          onChange={handleAddressInfoChange}
                          required
                          className={`app-form-select ${
                            errors.country ? "app-input-error" : ""
                          }`}
                        >
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        {errors.country && (
                          <div className="app-error-text">{errors.country}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Social Media Links */}
                  <div
                    className={`app-form-step ${
                      currentStep === 4 ? "app-step-active" : ""
                    }`}
                  >
                    <h2 className="app-form-title">Social Media Links</h2>
                    <p className="app-form-description">
                      Connect your social media profiles
                    </p>

                    <div className="app-form-grid">
                      <div className="app-form-group app-full-width">
                        <label htmlFor="linkedin">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect x="2" y="9" width="4" height="12" />
                            <circle cx="4" cy="4" r="2" />
                          </svg>
                          LinkedIn Profile (Optional)
                        </label>
                        <input
                          type="url"
                          id="linkedin"
                          name="linkedin"
                          value={socialInfo.linkedin}
                          onChange={handleSocialInfoChange}
                          placeholder="Enter your LinkedIn profile URL"
                          className="app-form-input"
                        />
                      </div>

                      <div className="app-form-group app-full-width">
                        <label htmlFor="facebook">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                          </svg>
                          Facebook Profile (Optional)
                        </label>
                        <input
                          type="url"
                          id="facebook"
                          name="facebook"
                          value={socialInfo.facebook}
                          onChange={handleSocialInfoChange}
                          placeholder="Enter your Facebook profile URL"
                          className="app-form-input"
                        />
                      </div>

                      <div className="app-form-group app-full-width">
                        <label htmlFor="instagram">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="2"
                              y="2"
                              width="20"
                              height="20"
                              rx="5"
                              ry="5"
                            />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                          Instagram Profile (Optional)
                        </label>
                        <input
                          type="url"
                          id="instagram"
                          name="instagram"
                          value={socialInfo.instagram}
                          onChange={handleSocialInfoChange}
                          placeholder="Enter your Instagram profile URL"
                          className="app-form-input"
                        />
                      </div>

                      <div className="app-form-group app-full-width">
                        <label htmlFor="website">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3.51 12a9 9 0 0 1 14.85-3.36L23 3M1 21l4.5-4.5M20.49 12a9 9 0 0 1-14.85 3.36L1 21" />
                          </svg>
                          Website Link (Optional)
                        </label>
                        <input
                          type="url"
                          id="website"
                          name="website"
                          value={socialInfo.website}
                          onChange={handleSocialInfoChange}
                          placeholder="Enter your website URL"
                          className="app-form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="app-form-actions">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="app-btn-secondary"
                        onClick={handlePrevStep}
                      >
                        <ArrowLeft size={16} /> Previous
                      </button>
                    )}

                    {currentStep < 4 ? (
                      <button
                        type="button"
                        className="app-btn-primary"
                        onClick={handleNextStep}
                      >
                        Next <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button" 
                        className="app-btn-primary"
                        disabled={isSubmitting}
                        onClick={(e) => {
                          // Explicitly call handleSubmit only when on step 4
                          if (currentStep === 4) {
                            handleSubmit(e);
                          }
                        }}
                      >
                        {isSubmitting ? "Submitting..." : "Complete Profile"}{" "}
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Cookie Consent Dialog */}
      <CookieConsent
        show={showCookieConsent}
        onAccept={handleAcceptCookies}
        onDecline={handleDeclineCookies}
        onClose={handleCloseCookieConsent}
      />
    </div>
  );
}
