"use client";
import { useState, useEffect } from "react";
import Sidebar from "./../components/sidebar/sidebar";
import Header from "./../components/header/header";
import {
  FileCheck,
  ChevronRight,
  Car,
  Home,
  Bike,
  GraduationCap,
  FileText,
  Search,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  X,
  ChevronLeft
} from "lucide-react";
import { createCertificateDemand } from "../services/certificateService";
import { userNftService } from "../services/userNftService";
import { useAuth } from "../context/AuthContext";
import "./certificates.css";

// Success popup component with countdown
const SuccessPopup = ({ secondsLeft, onComplete }) => {
  return (
    <div className="certificate-success-popup-overlay">
      <div className="certificate-success-popup">
        <div className="certificate-success-icon-container">
          <CheckCircle size={60} className="certificate-success-icon" />
        </div>
        <h3>Certificate Request Submitted!</h3>
        <p>Your certificate demand has been successfully submitted and will be reviewed by an administrator.</p>
        <div className="certificate-success-popup-timer">
          Redirecting to Certificates Menu in {secondsLeft} seconds...
        </div>
      </div>
    </div>
  );
};

export default function CertificatesPage() {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCertType, setSelectedCertType] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [itemType, setItemType] = useState("");
  const [nftId, setNftId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [verificationResult, setVerificationResult] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  
  // My NFTs state
  const [activeNftTab, setActiveNftTab] = useState('academic'); // 'academic' or 'property'
  const [userNfts, setUserNfts] = useState([]);
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [nftError, setNftError] = useState(null);
  const [selectedNft, setSelectedNft] = useState(null); // For modal view
  
  // Countdown effect for redirecting after successful form submission
  useEffect(() => {
    let timer;
    
    // Only start countdown if popup is showing and countdown is positive
    if (showSuccessPopup && countdownSeconds > 0) {
      timer = setTimeout(() => {
        setCountdownSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    }
    
    // When countdown reaches zero, redirect immediately
    if (showSuccessPopup && countdownSeconds <= 0) {
      // Clear any existing timer first
      if (timer) clearTimeout(timer);
      
      // Reset the state to prevent multiple redirects
      setShowSuccessPopup(false);
      
      // Redirect to certificates page
      window.location.href = '/certificates';
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessPopup, countdownSeconds]);
  
  // Fetch user NFTs when "My NFTs" tab is selected
  useEffect(() => {
    const fetchUserNfts = async () => {
      if (selectedCertType === "my-nfts" && isAuthenticated) {
        setLoadingNfts(true);
        setNftError(null);
        try {
          const response = await userNftService.getUserNfts();
          if (response.success) {
            setUserNfts(response.data);
          } else {
            setNftError(response.message || 'Failed to fetch NFTs');
          }
        } catch (error) {
          console.error('Error fetching NFTs:', error);
          setNftError(typeof error === 'string' ? error : 'Failed to fetch your NFTs');
        } finally {
          setLoadingNfts(false);
        }
      }
    };
    
    fetchUserNfts();
  }, [selectedCertType, isAuthenticated]);

  // Form state
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: "",
    address: "",
    nationalId: "",
    placeOfIdIssue: "",
    dateOfIdIssue: "",
  });

  const [sellerInfo, setSellerInfo] = useState({
    fullName: "",
    address: "",
    nationalId: "",
    placeOfIdIssue: "",
    dateOfIdIssue: "",
  });

  const [carInfo, setCarInfo] = useState({
    manufacturer: "",
    fuelType: "",
    serialNumber: "",
    modelType: "",
    horsepower: "",
    registrationNumber: "",
    dateOfFirstCirculation: "",
    purchasePrice: "",
  });

  const [motorcycleInfo, setMotorcycleInfo] = useState({
    manufacturer: "",
    model: "",
    yearOfManufacture: "",
    type: "",
    enginePower: "",
    fuelType: "",
    purchasePrice: "",
  });

  const [realEstateInfo, setRealEstateInfo] = useState({
    fullAddress: "",
    propertyType: "",
    surfaceArea: "",
    numberOfRooms: "",
    yearOfConstruction: "",
    condition: "",
    purchasePrice: "",
  });
  
  const [academicInfo, setAcademicInfo] = useState({
    recipient: "",
    idNumber: "",
    certificateTitle: "",
    institutionName: "",
    dateIssued: "",
    grade: "",
    speciality: "",
    duration: "",
    issuerName: ""
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCertTypeSelect = (type) => {
    setSelectedCertType(type);
    
    // For register options, automatically set the action to "register"
    if (type === "academic-register") {
      setSelectedCertType("academic");
      setSelectedAction("register");
    } 
    else if (type === "property-register") {
      setSelectedCertType("property");
      setSelectedAction("register");
    }
    else if (type === "verify") {
      // For the verify option, we'll handle it directly
      setSelectedAction("verify");
    }
    else if (type === "my-nfts") {
      // My NFTs stays the same
      setSelectedCertType("my-nfts");
      setSelectedAction(null);
    }
  };

  // Used for navigation - specifically for back buttons
  const resetNavigation = () => {
    setSelectedCertType(null);
    setSelectedAction(null);
    setNftId("");
    setSuccess(false);
    setError("");
    setVerificationResult(null);
    setLoading(false);
  };

  const handleItemTypeChange = (e) => {
    setItemType(e.target.value);
  };

  const handleBuyerInfoChange = (e) => {
    const { name, value } = e.target;
    setBuyerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSellerInfoChange = (e) => {
    const { name, value } = e.target;
    setSellerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCarInfoChange = (e) => {
    const { name, value } = e.target;
    setCarInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleMotorcycleInfoChange = (e) => {
    const { name, value } = e.target;
    setMotorcycleInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleRealEstateInfoChange = (e) => {
    const { name, value } = e.target;
    setRealEstateInfo((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAcademicInfoChange = (e) => {
    const { name, value } = e.target;
    setAcademicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (selectedCertType === 'property') {
      // Validate buyer info for property certificates
      if (itemType && !buyerInfo.fullName) {
        errors.buyerName = "Buyer's full name is required";
      }
      if (itemType && !buyerInfo.address) {
        errors.buyerAddress = "Buyer's address is required";
      }
      if (itemType && !buyerInfo.nationalId) {
        errors.buyerNationalId = "Buyer's national ID is required";
      }
      if (itemType && !buyerInfo.placeOfIdIssue) {
        errors.buyerPlaceOfIssue = "Place of ID issue is required";
      }
      if (itemType && !buyerInfo.dateOfIdIssue) {
        errors.buyerDateOfIssue = "Date of ID issue is required";
      }

      // Validate seller info for property certificates
      if (itemType && !sellerInfo.fullName) {
        errors.sellerName = "Seller's full name is required";
      }
      if (itemType && !sellerInfo.address) {
        errors.sellerAddress = "Seller's address is required";
      }
      if (itemType && !sellerInfo.nationalId) {
        errors.sellerNationalId = "Seller's national ID is required";
      }
      if (itemType && !sellerInfo.placeOfIdIssue) {
        errors.sellerPlaceOfIssue = "Place of ID issue is required";
      }
      if (itemType && !sellerInfo.dateOfIdIssue) {
        errors.sellerDateOfIssue = "Date of ID issue is required";
      }

      // Validate car info if car is selected
      if (itemType === "car") {
        if (!carInfo.manufacturer) errors.carManufacturer = "Car manufacturer is required";
        if (!carInfo.fuelType) errors.carFuelType = "Fuel type is required";
        if (!carInfo.serialNumber) errors.carSerialNumber = "Serial number is required";
        if (!carInfo.modelType) errors.carModelType = "Model type is required";
        if (!carInfo.horsepower) errors.carHorsepower = "Horsepower is required";
        if (!carInfo.registrationNumber) errors.carRegistrationNumber = "Registration number is required";
        if (!carInfo.dateOfFirstCirculation) errors.carDateOfFirstCirculation = "Date of first circulation is required";
        if (!carInfo.purchasePrice) errors.carPurchasePrice = "Purchase price is required";
      }
      
      // Validate motorcycle info if motorcycle is selected
      if (itemType === "motorcycle") {
        if (!motorcycleInfo.manufacturer) errors.motorcycleManufacturer = "Motorcycle manufacturer is required";
        if (!motorcycleInfo.model) errors.motorcycleModel = "Model is required";
        
        if (!motorcycleInfo.type) errors.motorcycleType = "Type is required";
        if (!motorcycleInfo.enginePower) errors.motorcycleEnginePower = "Engine power is required";
        if (!motorcycleInfo.fuelType) errors.motorcycleFuelType = "Fuel type is required";
        if (!motorcycleInfo.purchasePrice) errors.motorcyclePurchasePrice = "Purchase price is required";
      }
      
      // Validate real estate info if real estate is selected
      if (itemType === "realEstate") {
        if (!realEstateInfo.fullAddress) errors.realEstateFullAddress = "Full address is required";
        if (!realEstateInfo.propertyType) errors.realEstatePropertyType = "Property type is required";
        if (!realEstateInfo.surfaceArea) errors.realEstateSurfaceArea = "Surface area is required";
        if (!realEstateInfo.numberOfRooms) errors.realEstateNumberOfRooms = "Number of rooms is required";
        if (!realEstateInfo.yearOfConstruction) errors.realEstateYearOfConstruction = "Year of construction is required";
        if (!realEstateInfo.condition) errors.realEstateCondition = "Condition is required";
        if (!realEstateInfo.purchasePrice) errors.realEstatePurchasePrice = "Purchase price is required";
      }
    } else if (selectedCertType === 'academic') {
      // Validate academic certificate info
      if (!academicInfo.recipient) errors.recipient = "Recipient name is required";
      if (!academicInfo.idNumber) errors.idNumber = "ID number is required";
      if (!academicInfo.certificateTitle) errors.certificateTitle = "Certificate title is required";
      if (!academicInfo.institutionName) errors.institutionName = "Institution name is required";
      if (!academicInfo.dateIssued) errors.dateIssued = "Date issued is required";
      if (!academicInfo.grade) errors.grade = "Grade is required";
      if (!academicInfo.speciality) errors.speciality = "Speciality is required";
      if (!academicInfo.duration) errors.duration = "Duration is required";
      if (!academicInfo.issuerName) errors.issuerName = "Issuer name is required";
    }
    
    return errors;
  };

  // Effect for countdown timer when success popup is shown
  useEffect(() => {
    let timer;
    if (showSuccessPopup && countdownSeconds > 0) {
      timer = setTimeout(() => {
        setCountdownSeconds(prev => prev - 1);
      }, 1000);
    } else if (showSuccessPopup && countdownSeconds === 0) {
      // When countdown reaches zero, navigate back to the certificates menu
      setShowSuccessPopup(false);
      setCountdownSeconds(5); // Reset for next time
      // Return to the main certificates menu
      setSelectedCertType(null);
      setSelectedAction(null);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [showSuccessPopup, countdownSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
      setError('You must be logged in to submit a certificate demand.');
      return;
    }

    // Validate the form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    setLoading(true);

    try {
      let formData;
      
      // Prepare data based on certificate type
      if (selectedCertType === 'property') {
        formData = {
          type: 'property-related',
          itemType,
          buyerInfo,
          sellerInfo,
          ...(itemType === "car" && { carInfo }),
          ...(itemType === "motorcycle" && { motorcycleInfo }),
          ...(itemType === "realEstate" && { realEstateInfo }),
          // Include userEmail from authentication context
          userEmail: user?.email
        };
      } else if (selectedCertType === 'academic') {
        formData = {
          type: 'academic',
          academicInfo,
          // Include userEmail from authentication context
          userEmail: user?.email
        };
      }

      console.log("Form submitted:", formData);

      // Send the data to the backend
      const response = await createCertificateDemand(formData);
      console.log('Certificate demand created:', response);


      
      // Show the success popup instead of the regular success message
      setSuccess(true);
      setShowSuccessPopup(true);
      setCountdownSeconds(5);
      
      // Navigation and page refresh will be handled by the useEffect
    } catch (err) {
      console.error('Error submitting certificate demand:', err);
      setError(err.message || 'Failed to submit certificate demand. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!nftId || nftId.trim().length !== 24) {
      setError("Please enter a valid NFT ID (24 character ObjectId)");
      setVerificationResult(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    setVerificationResult(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/verify/${nftId.trim()}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setVerificationResult(data.nft);
        setSuccess(true);
      } else {
        setError(data.message || 'Certificate not found');
        setSuccess(false);
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setError('Failed to verify certificate. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };
  
  // NFT tab handling
  const handleNftTabChange = (tab) => {
    setActiveNftTab(tab);
  };
  
  // View NFT details in modal
  const handleViewNftDetails = (nft) => {
    setSelectedNft(nft);
  };
  
  // Close NFT details modal
  const handleCloseNftDetails = () => {
    setSelectedNft(null);
  };
  
  // Open HashScan link for NFT
  const handleOpenHashScanLink = (tokenId, serialNumber) => {
    userNftService.openHashScanLink(tokenId, serialNumber);
  };

  return (
    <div className="certificate-page-wrapper">
      <div className="certificate-admin-dashboard">

        <Sidebar
          activePage="certificates"
          onToggle={toggleSidebar}
          isOpen={sidebarOpen}
        />

        <main
          className={`certificate-main-content ${
            sidebarOpen ? "" : "certificate-sidebar-closed"
          }`}
        >
          <Header title="Certificate Service" onToggleSidebar={toggleSidebar} />

          <div className="certificate-dashboard-content">
            <div className="certificate-container">
              {/* Back button */}
              {(selectedCertType || selectedAction) && (
                <button
                  className="certificate-back-button"
                  onClick={resetNavigation}
                >
                  <ChevronLeft className="rotate-180" size={20} />
                  Back
                </button>
              )}

              {/* Certificate Type Selection */}
              {!selectedCertType && !selectedAction && (
                <div className="certificate-selection-container">
                  <h2 className="certificate-selection-title">
                    Certificate Service
                  </h2>
                  <div className="certificate-selection-cards">
                    <div
                      className="certificate-selection-card"
                      onClick={() => handleCertTypeSelect("academic-register")}
                    >
                      <div className="certificate-card-icon">
                        <GraduationCap size={40} />
                      </div>
                      <h3>Register Academic Certificate</h3>
                    </div>
                    <div
                      className="certificate-selection-card"
                      onClick={() => handleCertTypeSelect("property-register")}
                    >
                      <div className="certificate-card-icon">
                        <FileText size={40} />
                      </div>
                      <h3>Register Property Certificate</h3>
                    </div>
                    {isAuthenticated && (
                      <div
                        className="certificate-selection-card"
                        onClick={() => handleCertTypeSelect("my-nfts")}
                      >
                        <div className="certificate-card-icon">
                          <FileCheck size={40} />
                        </div>
                        <h3>My NFTs</h3>
                      </div>
                    )}
                    <div
                      className="certificate-selection-card"
                      onClick={() => handleCertTypeSelect("verify")}
                    >
                      <div className="certificate-card-icon">
                        <Search size={40} />
                      </div>
                      <h3>Verify an NFT</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* My NFTs Section */}
              {selectedCertType === "my-nfts" && (
                <div className="certificate-nfts-container">
                  <h2 className="certificate-section-title certificate-my-nfts-title">My NFTs</h2>
                  
                  {/* NFT Type Tabs */}
                  <div className="certificate-nfts-tabs">
                    <button 
                      className={`certificate-nft-tab ${activeNftTab === 'academic' ? 'active' : ''}`}
                      onClick={() => handleNftTabChange('academic')}
                    >
                      <GraduationCap size={18} />
                      Academic NFTs
                    </button>
                    <button 
                      className={`certificate-nft-tab ${activeNftTab === 'property' ? 'active' : ''}`}
                      onClick={() => handleNftTabChange('property')}
                    >
                      <FileText size={18} />
                      Property NFTs
                    </button>
                  </div>
                  
                  {/* Loading State */}
                  {loadingNfts && (
                    <div className="certificate-loading">
                      <div className="certificate-loading-spinner"></div>
                      <p>Loading your NFTs...</p>
                    </div>
                  )}
                  
                  {/* Error State */}
                  {nftError && !loadingNfts && (
                    <div className="certificate-error-message">
                      <AlertTriangle size={20} className="certificate-error-icon" />
                      <p>{nftError}</p>
                    </div>
                  )}
                  
                  {/* Academic NFTs Table */}
                  {activeNftTab === 'academic' && !loadingNfts && !nftError && (
                    <div className="certificate-nfts-table-container">
                      <h3 className="certificate-nfts-section-title">Academic Certificates</h3>
                      
                      {userNfts.filter(nft => 
                        nft.categoryType === 'Academic' && 
                        (nft.status === 'minted and payed' || nft.status === 'minted')
                      ).length === 0 ? (
                        <div className="certificate-empty-state">
                          <p>No academic NFTs exist yet.</p>
                        </div>
                      ) : (
                        <table className="certificate-nfts-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Token ID</th>
                              <th>Serial Number</th>
                              <th>Certificate Title</th>
                              <th>More Info</th>
                              <th>Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userNfts
                              .filter(nft => 
                                nft.categoryType === 'Academic' && 
                                (nft.status === 'minted and payed' || nft.status === 'minted')
                              )
                              .map((nft) => (
                                <tr key={nft._id}>
                                  <td>{nft._id}</td>
                                  <td>{nft.tokenId}</td>
                                  <td>{nft.serialNumber}</td>
                                  <td>
                                    {nft.certificateTitle || 'N/A'}
                                  </td>
                                  <td>
                                    <button 
                                      className="certificate-view-button"
                                      onClick={() => handleViewNftDetails(nft)}
                                    >
                                      <Eye size={16} />
                                      View
                                    </button>
                                  </td>
                                  <td>
                                    <button 
                                      className="certificate-hashscan-button"
                                      onClick={() => handleOpenHashScanLink(
                                        nft.tokenId, 
                                        nft.serialNumber
                                      )}
                                    >
                                      <ExternalLink size={16} />
                                      HashScan
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                  
                  {/* Property NFTs Table */}
                  {activeNftTab === 'property' && !loadingNfts && !nftError && (
                    <div className="certificate-nfts-table-container">
                      <h3 className="certificate-nfts-section-title">Property Certificates</h3>
                      
                      {userNfts.filter(nft => 
                        nft.type === 'property-related' && 
                        (nft.status === 'minted and payed' || nft.status === 'minted')
                      ).length === 0 ? (
                        <div className="certificate-empty-state">
                          <p>No property NFTs exist yet.</p>
                        </div>
                      ) : (
                        <table className="certificate-nfts-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Token ID</th>
                              <th>Serial Number</th>
                              <th>Item Type</th>
                              <th>Buyer</th>
                              <th>Seller</th>
                              <th>More Info</th>
                              <th>Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userNfts
                              .filter(nft => 
                                nft.type === 'property-related' && 
                                (nft.status === 'minted and payed' || nft.status === 'minted')
                              )
                              .map((nft) => (
                                <tr key={nft._id}>
                                  <td>{nft._id}</td>
                                  <td>{nft.tokenId}</td>
                                  <td>{nft.nftInfo?.serialNumber}</td>
                                  <td>{nft.itemType}</td>
                                  <td>{nft.buyerInfo?.fullName || 'N/A'}</td>
                                  <td>{nft.sellerInfo?.fullName || 'N/A'}</td>
                                  <td>
                                    <button 
                                      className="certificate-view-button"
                                      onClick={() => handleViewNftDetails(nft)}
                                    >
                                      <Eye size={16} />
                                      View
                                    </button>
                                  </td>
                                  <td>
                                    <button 
                                      className="certificate-hashscan-button"
                                      onClick={() => handleOpenHashScanLink(
                                        nft.tokenId, 
                                        nft.nftInfo?.serialNumber
                                      )}
                                    >
                                      <ExternalLink size={16} />
                                      HashScan
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                  
                  {/* NFT Modal Overlay (if an NFT is selected) */}
                  {selectedNft && (
                    <div className="certificate-nft-modal-overlay" onClick={handleCloseNftDetails}>
                      <div className="certificate-nft-modal" onClick={e => e.stopPropagation()}>
                        <button className="certificate-modal-close-btn" onClick={handleCloseNftDetails}>
                          <X size={20} />
                        </button>
                        
                        <div className="certificate-nft-modal-header">
                          <h3>NFT Details</h3>
                        </div>
                        
                        {/* Academic NFT Details */}
                        {selectedNft.categoryType === 'Academic' && (
                          <div className="cert-modal-grid">
                            <div className="cert-modal-section">
                              <h4>Certificate Metadata</h4>
                              <div className="cert-details-box">
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Certificate Title:</span>
                                  <span className="cert-details-value">{selectedNft.certificateTitle || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Recipient Name:</span>
                                  <span className="cert-details-value">{selectedNft.recipientName || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">ID Number:</span>
                                  <span className="cert-details-value">{selectedNft.idNumber || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Institution Name:</span>
                                  <span className="cert-details-value">{selectedNft.institutionName || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Date Issued:</span>
                                  <span className="cert-details-value">{selectedNft.dateIssued || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="cert-modal-section">
                              <h4>Additional Information</h4>
                              <div className="cert-details-box">
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Grade:</span>
                                  <span className="cert-details-value">{selectedNft.grade || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Speciality:</span>
                                  <span className="cert-details-value">{selectedNft.speciality || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Duration:</span>
                                  <span className="cert-details-value">{selectedNft.duration || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Issuer Name:</span>
                                  <span className="cert-details-value">{selectedNft.issuerName || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="cert-modal-section">
                              <h4>Token Information</h4>
                              <div className="cert-details-box">
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Token ID:</span>
                                  <span className="cert-details-value">{selectedNft.tokenId || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Serial Number:</span>
                                  <span className="cert-details-value">{selectedNft.serialNumber || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Certificate ID:</span>
                                  <span className="cert-details-value">{selectedNft.certificateId || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">User Account ID:</span>
                                  <span className="cert-details-value">{selectedNft.userAccountId || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Institution Account ID:</span>
                                  <span className="cert-details-value">{selectedNft.institutionAccountId || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Status:</span>
                                  <span className="cert-details-value">{selectedNft.status || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Created At:</span>
                                  <span className="cert-details-value">{new Date(selectedNft.createdAt).toLocaleString() || 'N/A'}</span>
                                </div>
                                {selectedNft.paymentDate && (
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Payment Date:</span>
                                    <span className="cert-details-value">{new Date(selectedNft.paymentDate).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Property NFT Details */}
                        {selectedNft.type === 'property-related' && (
                          <div className="cert-modal-grid">
                            <div className="cert-modal-section">
                              <h4>Buyer Information</h4>
                              <div className="cert-details-box">
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Full Name:</span>
                                  <span className="cert-details-value">{selectedNft.buyerInfo?.fullName || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Address:</span>
                                  <span className="cert-details-value">{selectedNft.buyerInfo?.address || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">National ID:</span>
                                  <span className="cert-details-value">{selectedNft.buyerInfo?.nationalId || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Place of ID Issue:</span>
                                  <span className="cert-details-value">{selectedNft.buyerInfo?.placeOfIdIssue || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Date of ID Issue:</span>
                                  <span className="cert-details-value">{selectedNft.buyerInfo?.dateOfIdIssue || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="cert-modal-section">
                              <h4>Seller Information</h4>
                              <div className="cert-details-box">
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Full Name:</span>
                                  <span className="cert-details-value">{selectedNft.sellerInfo?.fullName || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Address:</span>
                                  <span className="cert-details-value">{selectedNft.sellerInfo?.address || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">National ID:</span>
                                  <span className="cert-details-value">{selectedNft.sellerInfo?.nationalId || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Place of ID Issue:</span>
                                  <span className="cert-details-value">{selectedNft.sellerInfo?.placeOfIdIssue || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Date of ID Issue:</span>
                                  <span className="cert-details-value">{selectedNft.sellerInfo?.dateOfIdIssue || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Motorcycle Information */}
                            {selectedNft.itemType === 'motorcycle' && selectedNft.motorcycleInfo && (
                              <div className="cert-modal-section">
                                <h4>Motorcycle Information</h4>
                                <div className="cert-details-box">
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Manufacturer:</span>
                                    <span className="cert-details-value">{selectedNft.motorcycleInfo?.manufacturer || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Model:</span>
                                    <span className="cert-details-value">{selectedNft.motorcycleInfo?.model || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Year of Manufacture:</span>
                                    <span className="cert-details-value">{selectedNft.motorcycleInfo?.yearOfManufacture || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Type:</span>
                                    <span className="cert-details-value">{selectedNft.motorcycleInfo?.type || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Engine Power:</span>
                                    <span className="cert-details-value">{selectedNft.motorcycleInfo?.enginePower || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Fuel Type:</span>
                                    <span className="cert-details-value">{selectedNft.motorcycleInfo?.fuelType || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Purchase Price:</span>
                                    <span className="cert-details-value">{selectedNft.motorcycleInfo?.purchasePrice || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Car Information */}
                            {selectedNft.itemType === 'car' && selectedNft.carInfo && (
                              <div className="cert-modal-section">
                                <h4>Car Information</h4>
                                <div className="cert-details-box">
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Manufacturer:</span>
                                    <span className="cert-details-value">{selectedNft.carInfo?.manufacturer || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Model Type:</span>
                                    <span className="cert-details-value">{selectedNft.carInfo?.modelType || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Serial Number:</span>
                                    <span className="cert-details-value">{selectedNft.carInfo?.serialNumber || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Horsepower:</span>
                                    <span className="cert-details-value">{selectedNft.carInfo?.horsepower || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Fuel Type:</span>
                                    <span className="cert-details-value">{selectedNft.carInfo?.fuelType || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Registration Number:</span>
                                    <span className="cert-details-value">{selectedNft.carInfo?.registrationNumber || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Date of First Circulation:</span>
                                    <span className="cert-details-value">{selectedNft.carInfo?.dateOfFirstCirculation || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Purchase Price:</span>
                                    <span className="cert-details-value">{selectedNft.carInfo?.purchasePrice || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Real Estate Information */}
                            {selectedNft.itemType === 'real-estate' && selectedNft.realEstateInfo && (
                              <div className="cert-modal-section">
                                <h4>Real Estate Information</h4>
                                <div className="cert-details-box">
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Full Address:</span>
                                    <span className="cert-details-value">{selectedNft.realEstateInfo?.fullAddress || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Property Type:</span>
                                    <span className="cert-details-value">{selectedNft.realEstateInfo?.propertyType || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Surface Area:</span>
                                    <span className="cert-details-value">{selectedNft.realEstateInfo?.surfaceArea || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Number of Rooms:</span>
                                    <span className="cert-details-value">{selectedNft.realEstateInfo?.numberOfRooms || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Year of Construction:</span>
                                    <span className="cert-details-value">{selectedNft.realEstateInfo?.yearOfConstruction || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Condition:</span>
                                    <span className="cert-details-value">{selectedNft.realEstateInfo?.condition || 'N/A'}</span>
                                  </div>
                                  <div className="cert-details-row">
                                    <span className="cert-details-label">Purchase Price:</span>
                                    <span className="cert-details-value">{selectedNft.realEstateInfo?.purchasePrice || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="cert-modal-section">
                              <h4>Token Information</h4>
                              <div className="cert-details-box">
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Token ID:</span>
                                  <span className="cert-details-value">{selectedNft.tokenId || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Serial Number:</span>
                                  <span className="cert-details-value">{selectedNft.nftInfo?.serialNumber || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Current Owner:</span>
                                  <span className="cert-details-value">{selectedNft.nftInfo?.currentOwner || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Status:</span>
                                  <span className="cert-details-value">{selectedNft.status || 'N/A'}</span>
                                </div>
                                <div className="cert-details-row">
                                  <span className="cert-details-label">Minted At:</span>
                                  <span className="cert-details-value">{new Date(selectedNft.mintedAt).toLocaleString() || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Academic Verify Certificate */}
              {selectedCertType === "academic" &&
                selectedAction === "verify" && (
                  <div className="certificate-form-container">
                    <h2>Verify an Academic Certificate</h2>
                    <p className="certificate-form-description">
                      Please enter the digital signature of the certificate you
                      want to verify.
                    </p>

                    <form className="certificate-form" onSubmit={handleVerify}>
                      <div className="certificate-form-section">
                        <h3 className="certificate-section-title">
                          <FileCheck size={20} />
                          Certificate Verification
                        </h3>
                        <div className="certificate-form-group">
                          <label htmlFor="digital-signature">
                            Digital Signature
                          </label>
                          <input
                            type="text"
                            id="digital-signature"
                            name="digitalSignature"
                            placeholder="Enter 64-character digital signature"
                            value={nftId}
                            onChange={(e) => setNftId(e.target.value)}
                            minLength={64}
                            maxLength={64}
                            pattern="[A-Za-z0-9]{64}"
                            required
                          />
                        </div>
                      </div>

                      <div className="certificate-form-actions">
                        <button
                          type="submit"
                          className="certificate-submit-btn"
                        >
                          Verify Certificate
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              
              {/* Academic Certificate Registration Form */}
              {selectedCertType === "academic" && selectedAction === "register" && (
                  <div className="certificate-form-container">
                    <h2>Register an Academic Certificate</h2>
                    <p className="certificate-form-description">
                      Please fill out the form below to register a new academic certificate.
                    </p>

                    <div className="certificate-important-notice">
                      <AlertTriangle size={20} className="certificate-notice-icon" />
                      <p><strong>Important Notice:</strong> If your request is accepted, approximately 10 HBAR will be deducted from your balance as fees and costs for your certificate.</p>
                    </div>

                    <form className="certificate-form" onSubmit={handleSubmit}>
                      {/* Academic Certificate Information */}
                      <div className="certificate-form-section">
                        <h3>Academic Certificate Information</h3>
                        
                        <div className="certificate-form-row">
                          <div className="certificate-form-group">
                            <label htmlFor="recipient">Recipient Name</label>
                            <input
                              type="text"
                              id="recipient"
                              name="recipient"
                              value={academicInfo.recipient}
                              onChange={handleAcademicInfoChange}
                              required
                              placeholder="Foulen Elfleni"
                            />
                          </div>
                          <div className="certificate-form-group">
                            <label htmlFor="idNumber">ID Number</label>
                            <input
                              type="text"
                              id="idNumber"
                              name="idNumber"
                              value={academicInfo.idNumber}
                              onChange={handleAcademicInfoChange}
                              required
                              placeholder="National ID"
                            />
                          </div>
                        </div>
                        
                        <div className="certificate-form-group">
                          <label htmlFor="certificateTitle">Certificate Title</label>
                          <input
                            type="text"
                            id="certificateTitle"
                            name="certificateTitle"
                            value={academicInfo.certificateTitle}
                            onChange={handleAcademicInfoChange}
                            required
                            placeholder="Certificate Title"
                          />
                        </div>
                        
                        <div className="certificate-form-row">
                          <div className="certificate-form-group">
                            <label htmlFor="institutionName">Institution Name</label>
                            <input
                              type="text"
                              id="institutionName"
                              name="institutionName"
                              value={academicInfo.institutionName}
                              onChange={handleAcademicInfoChange}
                              required
                              placeholder="School Name/ University Name/Training Center ..."
                            />
                          </div>
                          <div className="certificate-form-group">
                            <label htmlFor="dateIssued">Date Issued</label>
                            <input
                              type="date"
                              id="dateIssued"
                              name="dateIssued"
                              value={academicInfo.dateIssued}
                              onChange={handleAcademicInfoChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="certificate-form-row">
                          <div className="certificate-form-group">
                            <label htmlFor="grade">Grade</label>
                            <select
                              id="grade"
                              name="grade"
                              value={academicInfo.grade}
                              onChange={handleAcademicInfoChange}
                              className="certificate-select"
                              required
                            >
                              <option value="">Select Grade</option>
                              <option value="Excellent">Excellent</option>
                              <option value="Very Good">Very Good</option>
                              <option value="Good">Good</option>
                              <option value="Satisfactory">Satisfactory</option>
                              <option value="Pass">Pass</option>
                            </select>
                          </div>
                          <div className="certificate-form-group">
                            <label htmlFor="speciality">Speciality</label>
                            <input
                              type="text"
                              id="speciality"
                              name="speciality"
                              value={academicInfo.speciality}
                              onChange={handleAcademicInfoChange}
                              required
                              placeholder="Speciality"
                            />
                          </div>
                        </div>
                        
                        <div className="certificate-form-row">
                          <div className="certificate-form-group">
                            <label htmlFor="duration">Duration</label>
                            <input
                              type="text"
                              id="duration"
                              name="duration"
                              value={academicInfo.duration}
                              onChange={handleAcademicInfoChange}
                              required
                              placeholder="Nombre of Months"
                            />
                          </div>
                          <div className="certificate-form-group">
                            <label htmlFor="issuerName">Issuer Name</label>
                            <input
                              type="text"
                              id="issuerName"
                              name="issuerName"
                              value={academicInfo.issuerName}
                              onChange={handleAcademicInfoChange}
                              required
                              placeholder="Dr. Foulen"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Error Messages */}
                      {Object.keys(validationErrors).length > 0 && (
                        <div className="certificate-validation-errors">
                          <AlertTriangle size={20} className="certificate-error-icon" />
                          <p>Please correct the following errors:</p>
                          <ul>
                            {Object.values(validationErrors).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Error Message */}
                      {error && (
                        <div className="certificate-error-message">
                          <AlertTriangle size={20} className="certificate-error-icon" />
                          <p>{error}</p>
                        </div>
                      )}

                      {/* Success Message */}
                      {success && !showSuccessPopup && (
                        <div className="certificate-success-message">
                          <CheckCircle size={20} className="certificate-success-icon" />
                          <p>Your certificate demand has been successfully submitted and will be reviewed by an administrator.</p>
                        </div>
                      )}
                      
                      {/* Success Popup */}
                      {showSuccessPopup && (
                        <SuccessPopup 
                          secondsLeft={countdownSeconds}
                          onComplete={() => {
                            setShowSuccessPopup(false);
                            setSelectedCertType(null);
                          }}
                        />
                      )}

                      {/* Submit Button */}
                      <div className="certificate-form-actions">
                        <button
                          type="submit"
                          className="certificate-submit-btn"
                          disabled={loading || success}
                        >
                          {loading ? 'Submitting...' : 'Register Certificate'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              {/* Verify Certificate Info */}
              {selectedAction === "verify" && (
                  <div className="certificate-form-container">
                    <h2>Verify Certificate</h2>
                    <p className="certificate-form-description">
                      Enter the NFT ID of any certificate you wish to verify (academic or property).
                    </p>

                    <form className="certificate-form" onSubmit={handleVerify}>
                      <div className="certificate-form-section">
                        <h3 className="certificate-section-title">
                          <FileCheck size={20} />
                          Certificate Verification
                        </h3>
                        <div className="certificate-form-group">
                          <label htmlFor="nft-id">
                            NFT ID (ObjectId)
                          </label>
                          <input
                            type="text"
                            id="nft-id"
                            name="nftId"
                            placeholder="Enter 24-character NFT ID (e.g., 6830e9ace678eafffaeb96d9)"
                            value={nftId}
                            onChange={(e) => setNftId(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Error Message */}
                      {error && (
                        <div className="certificate-error-message">
                          <AlertTriangle size={20} className="certificate-error-icon" />
                          <p>{error}</p>
                        </div>
                      )}
                      
                      {/* Success Message with NFT Details */}
                      {success && verificationResult && (
                        <div className="certificate-success-message" style={{ marginBlockEnd: '20px' }}>
                          <CheckCircle size={20} className="certificate-success-icon" />
                          <div>
                            <p><strong>Certificate Found!</strong></p>
                            <div className="certificate-verification-details">
                              <p><strong>NFT ID:</strong> {verificationResult._id}</p>
                              <p><strong>Token ID:</strong> {verificationResult.tokenId}</p>
                              <p><strong>Serial Number:</strong> {verificationResult.serialNumber || verificationResult.nftInfo?.serialNumber}</p>
                              <p><strong>Category:</strong> {
                                verificationResult.metadata?.categoryType ||
                                (verificationResult.certificateMetadata?.type === 'property-related' ? 'Property' : 'Academic')
                              }</p>
                              <p><strong>Status:</strong> {verificationResult.status}</p>
                              {verificationResult.certificateMetadata?.certificateTitle && (
                                <p><strong>Certificate Title:</strong> {verificationResult.certificateMetadata.certificateTitle}</p>
                              )}
                              {verificationResult.metadata?.receipentName && (
                                <p><strong>Recipient:</strong> {verificationResult.metadata.receipentName}</p>
                              )}
                              {verificationResult.certificateMetadata?.receipentName && (
                                <p><strong>Recipient:</strong> {verificationResult.certificateMetadata.receipentName}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="certificate-form-actions">
                        
                        <button
                          type="submit"
                          className="certificate-submit-btn"
                          disabled={loading}
                        >
                          {loading ? 'Verifying...' : 'Verify Certificate'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              {/* Register Certificate Form */}
              {selectedCertType === "property" &&
                selectedAction === "register" && (
                  <div className="certificate-form-container">
                    <h2>Register a Property Certificate</h2>
                    <p className="certificate-form-description">
                      Please fill out the form below to register a new property
                      certificate. All fields are required unless marked as
                      optional.
                    </p>
                    <div className="certificate-important-notice">
                      <AlertTriangle size={20} className="certificate-notice-icon" />
                      <p><strong>Important Notice:</strong> If your request is accepted, approximately 10 HBAR will be deducted from your balance as fees and costs for your certificate.</p>
                    </div>

                    <form className="certificate-form" onSubmit={handleSubmit}>
                      {/* Buyer Information */}
                      
                      {selectedCertType === 'property' && (
                        <>
                          {/* Buyer Information */}
                          <div className="certificate-form-section">
                            <h3>Buyer Information</h3>
                            
                            <div className="certificate-form-row">
                              <div className="certificate-form-group">
                                <label htmlFor="buyer-fullName">Full Name</label>
                                <input
                                  type="text"
                                  id="buyer-fullName"
                                  name="fullName"
                                  value={buyerInfo.fullName}
                                  onChange={handleBuyerInfoChange}
                                  required
                                  placeholder="Buyer's Full Name"
                                />
                              </div>
                              <div className="certificate-form-group">
                                <label htmlFor="buyer-address">Address</label>
                                <input
                                  type="text"
                                  id="buyer-address"
                                  name="address"
                                  value={buyerInfo.address}
                                  onChange={handleBuyerInfoChange}
                                  required
                                  placeholder="Buyer's Address"
                                />
                              </div>
                            </div>
                            
                            <div className="certificate-form-row">
                              <div className="certificate-form-group">
                                <label htmlFor="buyer-nationalId">National ID Number</label>
                                <input
                                  type="text"
                                  id="buyer-nationalId"
                                  name="nationalId"
                                  value={buyerInfo.nationalId}
                                  onChange={handleBuyerInfoChange}
                                  required
                                  placeholder="National ID Number"
                                />
                              </div>
                              <div className="certificate-form-group">
                                <label htmlFor="buyer-placeOfIdIssue">Place of ID Issue</label>
                                <input
                                  type="text"
                                  id="buyer-placeOfIdIssue"
                                  name="placeOfIdIssue"
                                  value={buyerInfo.placeOfIdIssue}
                                  onChange={handleBuyerInfoChange}
                                  required
                                  placeholder="Place of Issue"
                                />
                              </div>
                              <div className="certificate-form-group">
                                <label htmlFor="buyer-dateOfIdIssue">Date of ID Issue</label>
                                <input
                                  type="date"
                                  id="buyer-dateOfIdIssue"
                                  name="dateOfIdIssue"
                                  value={buyerInfo.dateOfIdIssue}
                                  onChange={handleBuyerInfoChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Seller Information */}
                          <div className="certificate-form-section">
                            <h3>Seller Information</h3>
                            
                            <div className="certificate-form-row">
                              <div className="certificate-form-group">
                                <label htmlFor="seller-fullName">Full Name</label>
                                <input
                                  type="text"
                                  id="seller-fullName"
                                  name="fullName"
                                  value={sellerInfo.fullName}
                                  onChange={handleSellerInfoChange}
                                  required
                                  placeholder="Seller's Full Name"
                                />
                              </div>
                              <div className="certificate-form-group">
                                <label htmlFor="seller-address">Address</label>
                                <input
                                  type="text"
                                  id="seller-address"
                                  name="address"
                                  value={sellerInfo.address}
                                  onChange={handleSellerInfoChange}
                                  required
                                  placeholder="Seller's Address"
                                />
                              </div>
                            </div>
                            
                            <div className="certificate-form-row">
                              <div className="certificate-form-group">
                                <label htmlFor="seller-nationalId">National ID Number</label>
                                <input
                                  type="text"
                                  id="seller-nationalId"
                                  name="nationalId"
                                  value={sellerInfo.nationalId}
                                  onChange={handleSellerInfoChange}
                                  required
                                  placeholder="National ID Number"
                                />
                              </div>
                              <div className="certificate-form-group">
                                <label htmlFor="seller-placeOfIdIssue">Place of ID Issue</label>
                                <input
                                  type="text"
                                  id="seller-placeOfIdIssue"
                                  name="placeOfIdIssue"
                                  value={sellerInfo.placeOfIdIssue}
                                  onChange={handleSellerInfoChange}
                                  required
                                  placeholder="Place of Issue"
                                />
                              </div>
                              <div className="certificate-form-group">
                                <label htmlFor="seller-dateOfIdIssue">Date of ID Issue</label>
                                <input
                                  type="date"
                                  id="seller-dateOfIdIssue"
                                  name="dateOfIdIssue"
                                  value={sellerInfo.dateOfIdIssue}
                                  onChange={handleSellerInfoChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {selectedCertType === 'academic' && (
                        <div className="certificate-form-section">
                          <h3>Academic Certificate Information</h3>
                          
                          <div className="certificate-form-row">
                            <div className="certificate-form-group">
                              <label htmlFor="recipient">Recipient Name</label>
                              <input
                                type="text"
                                id="recipient"
                                name="recipient"
                                value={academicInfo.recipient}
                                onChange={handleAcademicInfoChange}
                                required
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="idNumber">ID Number</label>
                              <input
                                type="text"
                                id="idNumber"
                                name="idNumber"
                                value={academicInfo.idNumber}
                                onChange={handleAcademicInfoChange}
                                required
                                placeholder="National ID or Passport Number"
                              />
                            </div>
                          </div>
                          
                          <div className="certificate-form-group">
                            <label htmlFor="certificateTitle">Certificate Title</label>
                            <input
                              type="text"
                              id="certificateTitle"
                              name="certificateTitle"
                              value={academicInfo.certificateTitle}
                              onChange={handleAcademicInfoChange}
                              required
                              placeholder="Certificate of Completion in Artificial Intelligence Fundamentals"
                            />
                          </div>
                          
                          <div className="certificate-form-row">
                            <div className="certificate-form-group">
                              <label htmlFor="institutionName">Institution Name</label>
                              <input
                                type="text"
                                id="institutionName"
                                name="institutionName"
                                value={academicInfo.institutionName}
                                onChange={handleAcademicInfoChange}
                                required
                                placeholder="TechSkills Training Center"
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="dateIssued">Date Issued</label>
                              <input
                                type="date"
                                id="dateIssued"
                                name="dateIssued"
                                value={academicInfo.dateIssued}
                                onChange={handleAcademicInfoChange}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="certificate-form-row">
                            <div className="certificate-form-group">
                              <label htmlFor="grade">Grade</label>
                              <select
                                id="grade"
                                name="grade"
                                value={academicInfo.grade}
                                onChange={handleAcademicInfoChange}
                                className="certificate-select"
                                required
                              >
                                <option value="">Select Grade</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Very Good">Very Good</option>
                                <option value="Good">Good</option>
                                <option value="Satisfactory">Satisfactory</option>
                                <option value="Pass">Pass</option>
                              </select>
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="speciality">Speciality</label>
                              <input
                                type="text"
                                id="speciality"
                                name="speciality"
                                value={academicInfo.speciality}
                                onChange={handleAcademicInfoChange}
                                required
                                placeholder="Machine Learning and AI Applications"
                              />
                            </div>
                          </div>
                          
                          <div className="certificate-form-row">
                            <div className="certificate-form-group">
                              <label htmlFor="duration">Duration</label>
                              <input
                                type="text"
                                id="duration"
                                name="duration"
                                value={academicInfo.duration}
                                onChange={handleAcademicInfoChange}
                                required
                                placeholder="3 months"
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="issuerName">Issuer Name</label>
                              <input
                                type="text"
                                id="issuerName"
                                name="issuerName"
                                value={academicInfo.issuerName}
                                onChange={handleAcademicInfoChange}
                                required
                                placeholder="Dr. Jane Smith"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedCertType === 'property' && (
                        /* Property Type Selection */
                        <div className="certificate-form-section">
                          <h3>Property Information</h3>
                          
                          <div className="certificate-form-group">
                            <label htmlFor="itemType">Property Type</label>
                            <select
                              id="itemType"
                              name="itemType"
                              value={itemType}
                              onChange={handleItemTypeChange}
                              className="certificate-select"
                              required
                            >
                              <option value="">Select Property Type</option>
                              <option value="car">Car</option>
                              <option value="motorcycle">Motorcycle</option>
                              <option value="realEstate">Real Estate</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Car Information */}
                      {itemType === "car" && (
                        <div className="certificate-form-section">
                          <h3 className="certificate-section-title">
                            <Car size={20} />
                            Car Information
                          </h3>
                          <div className="certificate-form-grid">
                            <div className="certificate-form-group">
                              <label htmlFor="car-manufacturer">
                                Manufacturer
                              </label>
                              <input
                                type="text"
                                placeholder="Manufacturer"
                                id="car-manufacturer"
                                name="manufacturer"
                                value={carInfo.manufacturer}
                                onChange={handleCarInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="car-fuelType">Fuel Type</label>
                              <input
                                type="text"
                                id="car-fuelType"
                                name="fuelType"
                                placeholder="Fuel Type"
                                value={carInfo.fuelType}
                                onChange={handleCarInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="car-serialNumber">
                                Serial Number
                              </label>
                              <input
                                type="text"
                                id="car-serialNumber"
                                name="serialNumber"
                                placeholder="Serial Number"
                                value={carInfo.serialNumber}
                                onChange={handleCarInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="car-modelType">Model Type</label>
                              <input
                                type="text"
                                id="car-modelType"
                                name="modelType"
                                placeholder="Model Type"
                                value={carInfo.modelType}
                                onChange={handleCarInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="car-horsepower">Horsepower</label>
                              <input
                                type="number"
                                id="car-horsepower"
                                name="horsepower"
                                placeholder="Horsepower"
                                value={carInfo.horsepower}
                                onChange={handleCarInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="car-registrationNumber">
                                Registration Number
                              </label>
                              <input
                                type="text"
                                placeholder="Registration Number"
                                id="car-registrationNumber"
                                name="registrationNumber"
                                value={carInfo.registrationNumber}
                                onChange={handleCarInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="car-dateOfFirstCirculation">
                                Date of First Circulation Authorization
                              </label>
                              <input
                                type="date"
                                id="car-dateOfFirstCirculation"
                                name="dateOfFirstCirculation"
                                value={carInfo.dateOfFirstCirculation}
                                onChange={handleCarInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="car-purchasePrice">
                                Purchase Price in TND
                              </label>
                              <input
                                type="number"
                                id="car-purchasePrice"
                                name="purchasePrice"
                                placeholder="0.0TND"
                                value={carInfo.purchasePrice}
                                onChange={handleCarInfoChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Motorcycle Information */}
                      {itemType === "motorcycle" && (
                        <div className="certificate-form-section">
                          <h3 className="certificate-section-title">
                            <Bike size={20} />
                            Motorcycle Information
                          </h3>
                          <div className="certificate-form-grid">
                            <div className="certificate-form-group">
                              <label htmlFor="motorcycle-manufacturer">
                                Manufacturer
                              </label>
                              <input
                                type="text"
                                id="motorcycle-manufacturer"
                                name="manufacturer"
                                placeholder="Manufacturer"
                                value={motorcycleInfo.manufacturer}
                                onChange={handleMotorcycleInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="motorcycle-model">Model</label>
                              <input
                                type="text"
                                id="motorcycle-model"
                                name="model"
                                placeholder="Motorcycle Model"
                                value={motorcycleInfo.model}
                                onChange={handleMotorcycleInfoChange}
                                required
                              />
                            </div>

                            <div className="certificate-form-group">
                              <label htmlFor="motorcycle-type">Type</label>
                              <select
                                id="motorcycle-type"
                                name="type"
                                value={motorcycleInfo.type}
                                onChange={handleMotorcycleInfoChange}
                                className="certificate-select"
                                required
                              >
                                <option value="">Select Type</option>
                                <option value="sport">Sport</option>
                                <option value="cruiser">Cruiser</option>
                                <option value="touring">Touring</option>
                                <option value="standard">Standard</option>
                                <option value="offroad">Off-Road</option>
                              </select>
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="motorcycle-enginePower">
                                Engine Power
                              </label>
                              <input
                                type="text"
                                id="motorcycle-enginePower"
                                name="enginePower"
                                placeholder="Engine Power"
                                value={motorcycleInfo.enginePower}
                                onChange={handleMotorcycleInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="motorcycle-fuelType">
                                Fuel Type
                              </label>
                              <select
                                id="motorcycle-fuelType"
                                name="fuelType"
                                value={motorcycleInfo.fuelType}
                                onChange={handleMotorcycleInfoChange}
                                className="certificate-select"
                                required
                              >
                                <option value="">Select Fuel Type</option>
                                <option value="gasoline">Gasoline</option>
                                <option value="electric">Electric</option>
                              </select>
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="motorcycle-purchasePrice">
                                Purchase Price in TND
                              </label>
                              <input
                                type="number"
                                id="motorcycle-purchasePrice"
                                name="purchasePrice"
                                placeholder="0.0TND"
                                value={motorcycleInfo.purchasePrice}
                                onChange={handleMotorcycleInfoChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Real Estate Information */}
                      {itemType === "realEstate" && (
                        <div className="certificate-form-section">
                          <h3 className="certificate-section-title">
                            <Home size={20} />
                            Real Estate Information
                          </h3>
                          <div className="certificate-form-grid">
                            <div className="certificate-form-group certificate-full-width">
                              <label htmlFor="realEstate-fullAddress">
                                Full Address
                              </label>
                              <input
                                type="text"
                                id="realEstate-fullAddress"
                                name="fullAddress"
                                placeholder="Full Address"
                                value={realEstateInfo.fullAddress}
                                onChange={handleRealEstateInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="realEstate-propertyType">
                                Type of Property
                              </label>
                              <select
                                id="realEstate-propertyType"
                                name="propertyType"
                                value={realEstateInfo.propertyType}
                                onChange={handleRealEstateInfoChange}
                                className="certificate-select"
                                required
                              >
                                <option value="">Select Property Type</option>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="villa">Villa</option>
                                <option value="land">Land</option>
                              </select>
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="realEstate-surfaceArea">
                                Surface Area in m²
                              </label>
                              <input
                                type="number"
                                id="realEstate-surfaceArea"
                                name="surfaceArea"
                                placeholder="1234 m²"
                                value={realEstateInfo.surfaceArea}
                                onChange={handleRealEstateInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="realEstate-numberOfRooms">
                                Number of Rooms
                              </label>
                              <input
                                type="number"
                                id="realEstate-numberOfRooms"
                                name="numberOfRooms"
                                placeholder="Number of Rooms"
                                value={realEstateInfo.numberOfRooms}
                                onChange={handleRealEstateInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="realEstate-yearOfConstruction">
                                Year of Construction
                              </label>
                              <input
                                type="number"
                                id="realEstate-yearOfConstruction"
                                name="yearOfConstruction"
                                placeholder="Year of Construction"
                                value={realEstateInfo.yearOfConstruction}
                                onChange={handleRealEstateInfoChange}
                                required
                              />
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="realEstate-condition">
                                Condition of the Property
                              </label>
                              <select
                                id="realEstate-condition"
                                name="condition"
                                value={realEstateInfo.condition}
                                onChange={handleRealEstateInfoChange}
                                className="certificate-select"
                                required
                              >
                                <option value="">Select Condition</option>
                                <option value="new">New</option>
                                <option value="renovated">Renovated</option>
                                <option value="needsWork">Needs Work</option>
                              </select>
                            </div>
                            <div className="certificate-form-group">
                              <label htmlFor="realEstate-purchasePrice">
                                Purchase Price in TND
                              </label>
                              <input
                                type="number"
                                id="realEstate-purchasePrice"
                                name="purchasePrice"
                                placeholder="0.0TND"
                                value={realEstateInfo.purchasePrice}
                                onChange={handleRealEstateInfoChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Messages */}
                      {Object.keys(validationErrors).length > 0 && (
                        <div className="certificate-validation-errors">
                          <AlertTriangle size={20} className="certificate-error-icon" />
                          <p>Please correct the following errors:</p>
                          <ul>
                            {Object.values(validationErrors).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Error Message */}
                      {error && (
                        <div className="certificate-error-message">
                          <AlertTriangle size={20} className="certificate-error-icon" />
                          <p>{error}</p>
                        </div>
                      )}

                      {/* Regular Success Message (only shown if success is true but popup is not shown) */}
                      {success && !showSuccessPopup && (
                        <div className="certificate-success-message">
                          <CheckCircle size={20} className="certificate-success-icon" />
                          <p>Your certificate demand has been successfully submitted and will be reviewed by an administrator.</p>
                        </div>
                      )}
                      
                      {/* Success Popup (shown instead of regular success message) */}
                      {showSuccessPopup && (
                        <SuccessPopup 
                          secondsLeft={countdownSeconds}
                          onComplete={() => {
                            setShowSuccessPopup(false);
                            setSelectedCertType(null);
                          }}
                        />
                      )}

                      {/* Submit Button */}
                      <div className="certificate-form-actions">
                        <button
                          type="submit"
                          className="certificate-submit-btn"
                          disabled={loading || success}
                        >
                          {loading ? 'Submitting...' : 'Register Certificate'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
