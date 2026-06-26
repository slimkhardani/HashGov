import { useState, useEffect, useRef } from "react";
import Sidebar from "./../components/sidebar/sidebar";
import Header from "./../components/header/header";
import { UserCircle, ArrowRight, User, Phone, Calendar, Download, X, Mail, MessageSquare, Send, Upload, Home, Briefcase, MapPin, Globe, Linkedin, Facebook, Instagram, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { profilesApi } from "../Auth Service/profilesApi";
import { updateRequestService } from "../services/updateRequestService";
import QRCode from "qrcode";
// No need to import Logo component, we'll render SVG directly
import "./profile.css";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirstLogin] = useState(false);
  const { user, getCookie } = useAuth();

  // We'll keep avatar-related state commented out until we reimplement the feature
  // const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  // const [tempAvatar, setTempAvatar] = useState("");

  // Update request modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // File upload state
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: ""
  });
  
  // Address info state
  const [addressInfo, setAddressInfo] = useState({
    homeAddress: "",
    workAddress: "",
    city: "",
    postalCode: "",
    country: ""
  });
  
  // Social info state
  const [socialInfo, setSocialInfo] = useState({
    linkedin: "",
    facebook: "",
    instagram: "",
    website: ""
  });

  // Profile image will be loaded directly from the server

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !user.email) {
        setLoading(false);
        return;
      }

      try {
        const token = getCookie('token');
        const response = await profilesApi.getProfile(user.email, token);
        
        if (response && response.success && response.profile) {
          console.log('Profile data received:', response.profile);
          console.log('Avatar image URL:', response.profile.personalInfo?.profileImage);
          setProfile(response.profile);
        } else {
          setError("Could not retrieve profile data");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, getCookie]);



  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Open update modal
  const handleCompleteProfile = () => {
    setShowUpdateModal(true);
  };
  
  // Close update modal
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateMessage("");
    setValidationError("");
    setProfileImage(null);
    setPreviewImage(null);
    setPersonalInfo({
      firstName: "",
      lastName: "",
      phoneNumber: ""
    });
    setAddressInfo({
      homeAddress: "",
      workAddress: "",
      city: "",
      postalCode: "",
      country: ""
    });
    setSocialInfo({
      linkedin: "",
      facebook: "",
      instagram: "",
      website: ""
    });
  };
  
  // Handle profile image change
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setValidationError("Please select an image file (jpg, jpeg, or png)");
      return;
    }
    
    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setValidationError("Image size should be less than 2MB");
      return;
    }
    
    // Create URL for preview and processing
    const url = URL.createObjectURL(file);
    
    // Process the image - create circular crop and convert to base64
    processImageToCircle(url, file);
  };
  
  // Process image to create a circular crop from the center
  const processImageToCircle = (imageUrl, originalFile) => {
    const img = new Image();
    
    img.onload = () => {
      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set output size to 300x300px (standard profile size)
      const OUTPUT_SIZE = 300;
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      
      // Determine the crop square from the center of the image
      const size = Math.min(img.width, img.height);
      const sourceX = Math.max(0, (img.width - size) / 2);
      const sourceY = Math.max(0, (img.height - size) / 2);
      
      // Draw the center square of the image onto the canvas
      ctx.drawImage(
        img,
        sourceX, sourceY, size, size,
        0, 0, OUTPUT_SIZE, OUTPUT_SIZE
      );
      
      // Create circular clipping path
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      
      // Use JPEG format with higher compression for smaller file size
      // Compression quality 0.6 offers good balance between quality and file size
      const croppedImage = canvas.toDataURL('image/jpeg', 0.6);
      
      // Update the preview and form state
      setPreviewImage(croppedImage);
      setProfileImage(croppedImage); // Store the base64 string directly
      
      // Clean up the original object URL
      URL.revokeObjectURL(imageUrl);
    };
    
    img.src = imageUrl;
  };

  // Handle personal info change
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle address info change
  const handleAddressInfoChange = (e) => {
    const { name, value } = e.target;
    setAddressInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle social info change
  const handleSocialInfoChange = (e) => {
    const { name, value } = e.target;
    setSocialInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle update form submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    // Validate message field
    if (!updateMessage.trim()) {
      setValidationError("Please provide a reason for your update request");
      return;
    }
    
    setValidationError("");
    setIsSubmitting(true);
    
    try {
      const token = getCookie('token');
      const email = user?.email || profile?.userId;
      
      if (!email) {
        throw new Error("User email is required");
      }
      
      // Create the request data
      const requestData = {
        email,
        message: updateMessage,
        timestamp: new Date().toISOString(),
        // If profileImage is already a base64 string, use it directly
      profileImage: profileImage ? (typeof profileImage === 'string' && profileImage.startsWith('data:') ? profileImage : await convertFileToBase64(profileImage)) : null,
        personalInfo: {
          firstName: personalInfo.firstName.trim() || null,
          lastName: personalInfo.lastName.trim() || null,
          phoneNumber: personalInfo.phoneNumber.trim() || null
        },
        addressInfo: {
          homeAddress: addressInfo.homeAddress.trim() || null,
          workAddress: addressInfo.workAddress.trim() || null,
          city: addressInfo.city.trim() || null,
          postalCode: addressInfo.postalCode.trim() || null,
          country: addressInfo.country.trim() || null
        },
        socialInfo: {
          linkedin: socialInfo.linkedin.trim() || null,
          facebook: socialInfo.facebook.trim() || null,
          instagram: socialInfo.instagram.trim() || null,
          website: socialInfo.website.trim() || null
        },
        status: "pending"
      };
      
      // Filter out null values
      Object.keys(requestData).forEach(key => {
        if (key === 'personalInfo' || key === 'addressInfo' || key === 'socialInfo') {
          const allFieldsEmpty = Object.values(requestData[key]).every(value => value === null);
          if (allFieldsEmpty) {
            requestData[key] = null;
          }
        }
      });
      
      // Send the update request
      await updateRequestService.createUpdateRequest(requestData, token);
      
      // Show success message
      setUpdateSuccess(true);
      
      // Hide the modal after a short delay
      setTimeout(() => {
        setShowUpdateModal(false);
        setUpdateSuccess(false);
        setUpdateMessage("");
        setProfileImage(null);
        setPreviewImage(null);
        setPersonalInfo({
          firstName: "",
          lastName: "",
          phoneNumber: ""
        });
        setAddressInfo({
          homeAddress: "",
          workAddress: "",
          city: "",
          postalCode: "",
          country: ""
        });
        setSocialInfo({
          linkedin: "",
          facebook: "",
          instagram: "",
          website: ""
        });
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting update request:", error);
      setValidationError(error.message || "Failed to submit update request");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDownloadData = async () => {
    // Skip download if no profile data available
    if (!profile) return;
    
    // Create a formatted JSON object with all user data
    const profileData = {
      personalInfo: profile.personalInfo || {},
      identityInfo: profile.identityInfo || {},
      addressInfo: profile.addressInfo || {},
      socialInfo: profile.socialInfo || {},
      nftInfo: profile.nftData || profile.nftInfo || {},
      downloadDate: new Date().toISOString(),
    };
    
    // Convert to JSON string for QR code
    const jsonString = JSON.stringify(profileData);
    
    try {
      // Create ID card with front and back sides
      await generateAndDownloadIDCard(profileData, jsonString);
    } catch (error) {
      console.error('Error generating ID card:', error);
      alert('Failed to generate ID card. Please try again.');
    }
  };

  // Function to generate and download the ID card
  const generateAndDownloadIDCard = async (profileData, jsonString) => {
    try {
      // Print the profile data to debug what's available
      console.log("Profile data for ID card:", profileData);
      
      // Constants for canvas dimensions (upscaled for maximum quality)
      const cardWidth = 2400; // 100% increase from original
      const cardHeight = 1520; // 100% increase from original
      
      // Generate front side
      const frontCanvas = document.createElement('canvas');
      frontCanvas.width = cardWidth;
      frontCanvas.height = cardHeight;
      const frontCtx = frontCanvas.getContext('2d');
      
      // Generate back side
      const backCanvas = document.createElement('canvas');
      backCanvas.width = cardWidth;
      backCanvas.height = cardHeight;
      const backCtx = backCanvas.getContext('2d');
      
      // Draw front side
      await drawFrontSide(frontCtx, profileData, cardWidth, cardHeight);
      
      // Create profile data in the exact structure requested with proper Hedera NFT data
      const structuredProfileData = {
        "personalInfo": {
          "firstName": profileData.personalInfo?.firstName || profile?.personalInfo?.firstName || '',
          "lastName": profileData.personalInfo?.lastName || profile?.personalInfo?.lastName || '',
          "dateOfBirth": profileData.personalInfo?.dateOfBirth || profile?.personalInfo?.dateOfBirth || '',
          "gender": profileData.personalInfo?.gender || profile?.personalInfo?.gender || '',
          "phoneNumber": profileData.personalInfo?.phoneNumber || profile?.personalInfo?.phoneNumber || ''
        },
        "identityInfo": {
          "idNumber": profileData.identityInfo?.identityNumber || profile?.identityInfo?.identityNumber || '',
          "expiryDate": profileData.identityInfo?.expiryDate || profile?.identityInfo?.expiryDate || null,
          "FingerprintNumber": profileData.identityInfo?.FingerprintNumber || profile?.identityInfo?.FingerprintNumber || '',
          "issueDate": profileData.identityInfo?.issueDate || profile?.identityInfo?.issueDate || ''
        },
        "addressInfo": {
          "homeAddress": profileData.addressInfo?.homeAddress || profile?.addressInfo?.homeAddress || '',
          "workAddress": profileData.addressInfo?.workAddress || profile?.addressInfo?.workAddress || '',
          "city": profileData.addressInfo?.city || profile?.addressInfo?.city || '',
          "postalCode": profileData.addressInfo?.postalCode || profile?.addressInfo?.postalCode || '',
          "country": profileData.addressInfo?.country || profile?.addressInfo?.country || ''
        },
        "socialInfo": {
          "linkedin": profileData.socialInfo?.linkedin || profile?.socialInfo?.linkedin || '',
          "facebook": profileData.socialInfo?.facebook || profile?.socialInfo?.facebook || '',
          "instagram": profileData.socialInfo?.instagram || profile?.socialInfo?.instagram || '',
          "website": profileData.socialInfo?.website || profile?.socialInfo?.website || ''
        },
        "nftInfo": {
          "tokenId": profileData.nftInfo?.tokenId || profile?.nftData?.tokenId || '',
          "accountId": profileData.nftInfo?.accountId || profile?.nftData?.accountId || '',
          "mintedAt": profileData.nftInfo?.mintedAt || profile?.nftData?.mintedAt || ''
        }
      };
      
      // Convert to JSON string for QR code
      const qrContent = JSON.stringify(structuredProfileData);
      console.log("QR JSON data length:", qrContent.length, "characters");
      
      // Draw back side with QR code
      await drawBackSide(backCtx, qrContent, cardWidth, cardHeight);
      
      // Combine both sides into a single image (stacked vertically)
      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = cardWidth;
      combinedCanvas.height = cardHeight * 2; // No gap between cards
      const combinedCtx = combinedCanvas.getContext('2d');
    
      // Fill with the same dark background color
      combinedCtx.fillStyle = '#161a23';
      combinedCtx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
    
      // Draw front side at the top
      combinedCtx.drawImage(frontCanvas, 0, 0);
    
      // Draw back side directly below without gap
      combinedCtx.drawImage(backCanvas, 0, cardHeight);
      
      // Create download link for the combined image
      const dataURL = combinedCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      const firstName = profileData.personalInfo?.firstName || 'user';
      const lastName = profileData.personalInfo?.lastName || '';
      link.download = `HashGov_IDCard_${firstName}${lastName}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error generating ID card:', error);
      alert('Failed to generate ID card. Please try again.');
      return false;
    }
  };

  // Draw the front side of the ID card
  const drawFrontSide = async (ctx, profileData, width, height) => {
    // Extract data for convenience
    const personalInfo = profileData.personalInfo || {};
    const identityInfo = profileData.identityInfo || {};
    const nftInfo = profileData.nftInfo || profile?.nftData || {};
    
    // Set dark background color as requested (#161a23)
    ctx.fillStyle = '#161a23';
    ctx.fillRect(0, 0, width, height);
    
    // Card border with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // White border
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Create linear gradient for header (135deg, #4763e4 to #00d4ff)
    const headerGradient = ctx.createLinearGradient(20, 20, width - 40, 200); // Header height
    headerGradient.addColorStop(0, '#4763e4'); // Blue
    headerGradient.addColorStop(1, '#00d4ff'); // Cyan
    ctx.fillStyle = headerGradient;
    ctx.fillRect(20, 20, width - 40, 200); // Header rectangle
    
    // Create an offscreen div for the logo
    const logoContainer = document.createElement('div');
    document.body.appendChild(logoContainer);
    
    // Render the logo component into the container
    const logoSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    logoSvg.setAttribute("width", "40");
    logoSvg.setAttribute("height", "40");
    logoSvg.setAttribute("viewBox", "0 0 100 100");
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "30");
    circle.setAttribute("stroke", "#ffffff");
    circle.setAttribute("stroke-width", "5");
    circle.setAttribute("fill", "none");
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "20");
    line.setAttribute("y1", "50");
    line.setAttribute("x2", "80");
    line.setAttribute("y2", "50");
    line.setAttribute("stroke", "#ffffff");
    line.setAttribute("stroke-width", "5");
    
    logoSvg.appendChild(circle);
    logoSvg.appendChild(line);
    
    // Convert SVG to a data URL
    const svgData = new XMLSerializer().serializeToString(logoSvg);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Draw the logo onto the canvas
    try {
      const logoImage = new Image();
      logoImage.src = svgUrl;
      await new Promise((resolve, reject) => {
        logoImage.onload = resolve;
        logoImage.onerror = reject;
        setTimeout(resolve, 1000); // Timeout after 1 second
      });
      // Measure text width for centering calculation
      ctx.font = 'bold 100px Arial';
      const textWidth = ctx.measureText('HashGov Digital ID').width;
      const logoWidth = 160;
      const spacing = 30;
      const totalWidth = logoWidth + spacing + textWidth;
      const startX = (width - totalWidth) / 2;
      
      // Draw logo to the left of the text
      ctx.drawImage(logoImage, startX, 40, logoWidth, 160);
      
      // Draw text with left alignment
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('HashGov Digital ID', startX + logoWidth + spacing, 130);
      
      URL.revokeObjectURL(svgUrl);
    } catch (error) {
      console.warn('Could not draw HashGov logo:', error);
    }
    
    // Clean up
    document.body.removeChild(logoContainer);
    
    // Draw circular profile photo or initials (much larger)
    const avatarX = 400; // Center X of avatar
    const avatarY = 700; // Center Y of avatar
    const avatarRadius = 250; // Size of avatar - significantly increased
    
    // Draw avatar circle background
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#4169e1'; // Royal blue for avatar background
    ctx.fill();
    
    // If we have a profile image, draw it in a circle
    if (personalInfo.profileImage) {
      try {
        const profileImg = new Image();
        profileImg.src = personalInfo.profileImage;
        await new Promise((resolve, reject) => {
          profileImg.onload = resolve;
          profileImg.onerror = reject;
          setTimeout(resolve, 1000); // Timeout after 1 second if image doesn't load
        });
        
        // Create circular clipping path for the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(profileImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();
      } catch (error) {
        console.warn('Could not load profile image:', error);
        // Draw initials instead
        const firstName = personalInfo.firstName || '';
        const lastName = personalInfo.lastName || '';
        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'JD';
        
        ctx.font = 'bold 140px Arial'; // Larger font for initials
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, avatarX, avatarY);
        ctx.textAlign = 'left'; // Reset text alignment
        ctx.textBaseline = 'alphabetic'; // Reset text baseline
      }
    } else {
      // Draw initials when no profile image available
      const firstName = personalInfo.firstName || '';
      const lastName = personalInfo.lastName || '';
      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'JD';
      
      ctx.font = 'bold 140px Arial'; // Larger font for initials
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, avatarX, avatarY);
      ctx.textAlign = 'left'; // Reset text alignment
      ctx.textBaseline = 'alphabetic'; // Reset text baseline
    }
    
    // User info section - using white text for better visibility on blue background
    ctx.font = 'bold 72px Arial'; // Larger text
    ctx.fillStyle = '#ffffff';
    
    // Full Name
    ctx.fillText('Name:', 800, 450);
    ctx.font = '64px Arial'; // Larger text
    ctx.fillText(`${personalInfo.firstName || 'John'} ${personalInfo.lastName || 'Doe'}`, 800, 530);
    
    // ID Number instead of Gender (as per image)
    ctx.font = 'bold 72px Arial'; // Larger text
    ctx.fillText('ID Number:', 800, 650);
    ctx.font = '64px Arial'; // Larger text
    // Try different properties where ID number might be stored
    let idNumber = identityInfo.identityNumber || 
                identityInfo.idNumber || 
                identityInfo.nationalId || 
                personalInfo.identityNumber || 'ID12345678';
    ctx.fillText(idNumber, 800, 730);
    
    // Date of Birth - moved to where NFT token was
    ctx.font = 'bold 72px Arial'; // Larger text
    ctx.fillText('Date of Birth:', 1400, 650);
    ctx.font = '64px Arial'; // Larger text
    // Try different properties where date of birth might be stored
    let dob = identityInfo.dateOfBirth || 
              identityInfo.dob || 
              personalInfo.dateOfBirth || 
              personalInfo.dob;
              
    if (dob) {
      ctx.fillText(formatDate(dob), 1400, 730);
    } else {
      ctx.fillText('January 15, 1985', 1400, 730);
    }
    
    // Issue Date - moved under ID Number
    ctx.font = 'bold 72px Arial'; // Larger text
    ctx.fillText('ID Issue Date:', 800, 850);
    ctx.font = '64px Arial'; // Larger text
    // Use a fixed date for demo purposes
    ctx.fillText('January 1, 2020', 800, 930);
    
    // NFT Token ID - added to card as requested
    ctx.font = 'bold 72px Arial'; // Larger text
    ctx.fillText('NFT Token ID:', 1400, 450);
    ctx.font = '64px Arial'; // Larger text
    const tokenId = nftInfo.tokenId || personalInfo.nftData?.tokenId || 'Not Minted';
    ctx.fillText(tokenId, 1400, 530);
    
    // QR code removed from front side as requested
    
    // Verification badge removed as requested
    
    // Note at bottom about technology removed as requested
    
    // Add footer to front side (matching the header gradient)
    const footerGradient = ctx.createLinearGradient(20, height - 220, width - 40, height - 20);
    footerGradient.addColorStop(0, '#4763e4'); // Blue
    footerGradient.addColorStop(1, '#00d4ff'); // Cyan
    ctx.fillStyle = footerGradient;
    ctx.fillRect(20, height - 120, width - 40, 100); // 100px height footer
    
    // Footer text
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('HashGov - Secure Digital Identity', width / 2, height - 60);
    ctx.textAlign = 'left';
    
    return ctx;
  };

  // Draw the back side of the ID card with QR code
  const drawBackSide = async (ctx, jsonString, width, height) => {
    // Set the same dark background color as front side (#161a23)
    ctx.fillStyle = '#161a23';
    ctx.fillRect(0, 0, width, height);
  
    // Card border with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // White border
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Create linear gradient for header (135deg, #4763e4 to #00d4ff) - matches front side
    const headerGradient = ctx.createLinearGradient(20, 20, width - 40, 200);
    headerGradient.addColorStop(0, '#4763e4'); // Blue
    headerGradient.addColorStop(1, '#00d4ff'); // Cyan
    ctx.fillStyle = headerGradient;
    ctx.fillRect(20, 20, width - 40, 200); // Same as front side
    
    // Draw logo - must recreate logo for back side
    try {
      // Create the same logo SVG as on the front side
      const backLogoContainer = document.createElement('div');
      document.body.appendChild(backLogoContainer);
      
      const backLogoSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      backLogoSvg.setAttribute("width", "40");
      backLogoSvg.setAttribute("height", "40");
      backLogoSvg.setAttribute("viewBox", "0 0 100 100");
      
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "50");
      circle.setAttribute("cy", "50");
      circle.setAttribute("r", "30");
      circle.setAttribute("stroke", "#ffffff");
      circle.setAttribute("stroke-width", "5");
      circle.setAttribute("fill", "none");
      
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "20");
      line.setAttribute("y1", "50");
      line.setAttribute("x2", "80");
      line.setAttribute("y2", "50");
      line.setAttribute("stroke", "#ffffff");
      line.setAttribute("stroke-width", "5");
      
      backLogoSvg.appendChild(circle);
      backLogoSvg.appendChild(line);
      backLogoContainer.appendChild(backLogoSvg);
      
      // Convert SVG to a data URL (same as front side)
      const svgData = new XMLSerializer().serializeToString(backLogoSvg);
      const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const backLogoImage = new Image();
      await new Promise((resolve, reject) => {
        backLogoImage.onload = resolve;
        backLogoImage.onerror = reject;
        backLogoImage.src = svgUrl;
        setTimeout(resolve, 1000);
      });
      
      // Measure text width for centering calculation (same as front)
      ctx.font = 'bold 100px Arial';
      const textWidth = ctx.measureText('HashGov Digital ID').width;
      const logoWidth = 160;
      const spacing = 30;
      const totalWidth = logoWidth + spacing + textWidth;
      const startX = (width - totalWidth) / 2;
      
      // Draw logo to the left of the text (same as front)
      ctx.drawImage(backLogoImage, startX, 40, logoWidth, 160);
      
      // Draw text with left alignment (same as front)
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('HashGov Digital ID', startX + logoWidth + spacing, 130);
      
      URL.revokeObjectURL(svgUrl);
      document.body.removeChild(backLogoContainer);
    } catch (error) {
      console.warn('Could not draw HashGov logo on back side:', error);
      // If logo fails, at least show the title
      ctx.font = 'bold 100px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('HashGov Digital ID', width / 2, 130);
      ctx.textAlign = 'left';
    }
    
    // QR Code section with white text - positioned just above QR code (moved higher)
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center'; // Center text horizontally
    ctx.fillText('Scan for full profile data', width / 2, 350); // Positioned higher above QR code
    ctx.textAlign = 'left'; // Reset alignment
    
    // Draw QR code
    try {
      console.log("Generating QR code with data:", jsonString.substring(0, 100) + "...");
      const qrDataURL = await new Promise((resolve, reject) => {
        // We need to ensure the QR code can be generated with these parameters
        QRCode.toDataURL(jsonString, { 
          errorCorrectionLevel: 'L', // Lower error correction = more data capacity
          margin: 1,
          scale: 4,
          color: {
            dark: '#000000', // Black modules (dots)
            light: '#ffffff' // White background
          }
        }, (err, url) => {
          if (err) {
            console.error("QR code generation error:", err);
            reject(err);
          } else {
            console.log("QR code generated successfully");
            resolve(url);
          }
        });
      });
      
      const qrImage = new Image();
      qrImage.src = qrDataURL;
      await new Promise((resolve) => {
        qrImage.onload = resolve;
        setTimeout(resolve, 1000); // Timeout after 1 second if image doesn't load
      });
      
      // Draw QR code centered (massive size) - moved higher
      const qrSize = 900; // Significantly increased QR code size
      const qrX = (width - qrSize) / 2; // Centered horizontally
      const qrY = 400; // Moved higher to be further from footer
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      ctx.font = '36px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText('QR Code Generation Failed', width / 2 - 200, 400);
    }
    
    // Create footer with gradient colors (matching front side)
    const backFooterGradient = ctx.createLinearGradient(20, height - 220, width - 40, height - 20);
    backFooterGradient.addColorStop(0, '#4763e4'); // Blue
    backFooterGradient.addColorStop(1, '#00d4ff'); // Cyan
    ctx.fillStyle = backFooterGradient;
    ctx.fillRect(20, height - 120, width - 40, 100); // 100px height footer
    
    // Footer text
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('HashGov - Secure Digital Identity', width / 2, height - 60);
    ctx.textAlign = 'left';
    
    return ctx;
  };
  
  // Format date to a human-readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString; // Return as is if parsing fails
    }
  };

  return (
    <div className="app-profile-page">
      <div className="app-dashboard">
        <Sidebar
          activePage="profile"
          onToggle={toggleSidebar}
          isOpen={sidebarOpen}
        />

        <div className={`app-main-content ${
          sidebarOpen ? "" : "app-sidebar-closed"
        }`}>
          <Header title="Profile" onToggleSidebar={toggleSidebar} />

          <div className="app-dashboard-content">
          {loading ? (
            <div className="app-loading">Loading profile...</div>
          ) : error ? (
            <div className="app-error">{error}</div>
          ) : isFirstLogin ? (
            <div className="app-welcome">
              <div className="app-welcome-card">
                <div className="app-welcome-icon">
                  <UserCircle size={64} />
                </div>
                <h2 className="app-welcome-title">Welcome to HashGov!</h2>
                <p className="app-welcome-text">
                  Your account has been created successfully. To get started,
                  please complete your profile information to access all
                  features of the platform.
                </p>
                <button
                  className="app-btn-primary"
                  onClick={handleCompleteProfile}
                >
                  Complete Your Profile <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="app-profile-container">
              {/* Profile Header */}
              <div className="app-profile-header">
                <div className="profile-avatar-container">
                  <div className="avatar-container">
                    {profile?.personalInfo?.profileImage ? (
                      <img 
                        src={profile.personalInfo.profileImage} 
                        alt="User avatar" 
                        className="profile-img"
                      />
                    ) : (
                      <div className="profile-img default-avatar">
                        <User size={48} />
                      </div>
                    )}
                    <button className="edit-avatar-btn">
                      <User size={14} />
                    </button>
                  </div>
                  
                  <div className="profile-info">
                    <h2>
                      {profile?.personalInfo?.firstName || 'User'} {profile?.personalInfo?.lastName || ''}
                    </h2>
                    <p className="user-email">NFT Token ID: {profile?.nftData?.tokenId || profile?.nftInfo?.tokenId || "Not Minted"}</p>
                    <div className="user-details">
                      
                      {/* Phone */}
                      {(profile?.personalInfo?.phone || profile?.personalInfo?.phoneNumber) && (
                        <p className="detail-item"><Phone size={14} /> {profile?.personalInfo?.phone || profile?.personalInfo?.phoneNumber}</p>
                      )}
                      
                      {/* Gender */}
                      {profile?.personalInfo?.gender && (
                        <p className="detail-item"><User size={14} /> {profile?.personalInfo?.gender}</p>
                      )}
                      
                      {/* Date of Birth */}
                      {profile?.personalInfo?.dateOfBirth && (
                        <p className="detail-item"><Calendar size={14} /> {new Date(profile?.personalInfo?.dateOfBirth).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Sections */}
              <div className="app-sections">
                {/* Personal Information Section */}
                <div className="app-section">
                  <h3 className="app-section-title">Personal Information</h3>
                  <div className="app-section-content">
                    <div className="app-field">
                      <span className="app-field-label">Full Name</span>
                      <span className="app-field-value">
                        {profile?.personalInfo?.firstName || 'N/A'} {profile?.personalInfo?.lastName || ''}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Email</span>
                      <span className="app-field-value">
                        {profile?.personalInfo?.email || user?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Phone</span>
                      <span className="app-field-value">
                        {profile?.personalInfo?.phone || profile?.personalInfo?.phoneNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Gender</span>
                      <span className="app-field-value">
                        {profile?.personalInfo?.gender || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Date of Birth</span>
                      <span className="app-field-value">
                        {profile?.personalInfo?.dateOfBirth ? new Date(profile.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              
                {/* Identity Information Section */}
                <div className="app-section">
                  <h3 className="app-section-title">Identity Information</h3>
                  <div className="app-section-content">
                    <div className="app-field">
                      <span className="app-field-label">ID Number</span>
                      <span className="app-field-value">
                        {profile?.identityInfo?.identityNumber || profile?.identityInfo?.idNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Issue Date</span>
                      <span className="app-field-value">
                        {profile?.identityInfo?.issueDate ? formatDate(profile.identityInfo.issueDate) : 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Expiry Date</span>
                      <span className="app-field-value">
                        {profile?.identityInfo?.expiryDate ? formatDate(profile.identityInfo.expiryDate) : 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Fingerprint Number</span>
                      <span className="app-field-value">
                        {profile?.identityInfo?.FingerprintNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              
                {/* Address Information Section */}
                <div className="app-section">
                  <h3 className="app-section-title">Address Information</h3>
                  <div className="app-section-content">
                    <div className="app-field">
                      <span className="app-field-label">Home Address</span>
                      <span className="app-field-value">
                        {profile?.addressInfo?.homeAddress || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Work Address</span>
                      <span className="app-field-value">
                        {profile?.addressInfo?.workAddress || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">City</span>
                      <span className="app-field-value">
                        {profile?.addressInfo?.city || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Postal Code</span>
                      <span className="app-field-value">
                        {profile?.addressInfo?.postalCode || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Country</span>
                      <span className="app-field-value">
                        {profile?.addressInfo?.country || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              
                {/* NFT Information Section */}
                <div className="app-section">
                  <h3 className="app-section-title">NFT Information</h3>
                  <div className="app-section-content">
                    <div className="app-field">
                      <span className="app-field-label">Token ID</span>
                      <span className="app-field-value">
                        {profile?.nftData?.tokenId || profile?.nftInfo?.tokenId || 'Not Minted'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Account ID</span>
                      <span className="app-field-value">
                        {profile?.nftData?.accountId || profile?.nftInfo?.accountId || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Minted At</span>
                      <span className="app-field-value">
                        {profile?.nftData?.mintedAt ? formatDate(profile.nftData.mintedAt) : 
                         profile?.nftInfo?.mintedAt ? formatDate(profile.nftInfo.mintedAt) : 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Status</span>
                      <span className={`app-field-value ${(profile?.nftData?.tokenId || profile?.nftInfo?.tokenId) ? "app-status-active" : ""}`}>
                        {(profile?.nftData?.tokenId || profile?.nftInfo?.tokenId) ? "Active" : "Not Minted"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Social Information Section */}
                <div className="app-section">
                  <h3 className="app-section-title">Social Information</h3>
                  <div className="app-section-content">
                    <div className="app-field">
                      <span className="app-field-label">LinkedIn</span>
                      <span className="app-field-value">
                        {profile?.socialInfo?.linkedin || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Facebook</span>
                      <span className="app-field-value">
                        {profile?.socialInfo?.facebook || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Instagram</span>
                      <span className="app-field-value">
                        {profile?.socialInfo?.instagram || 'N/A'}
                      </span>
                    </div>
                    <div className="app-field">
                      <span className="app-field-label">Website</span>
                      <span className="app-field-value">
                        {profile?.socialInfo?.website || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="app-form-actions">
                <button className="app-btn-secondary" onClick={handleDownloadData}>
                  <Download size={16} className="mr-2" /> Download Data
                </button>
                <button className="app-btn-primary" onClick={handleCompleteProfile}>
                  Update Profile
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-container update-modal">
            <div className="modal-header">
              <h3>Request Profile Update</h3>
              <button 
                className="close-button" 
                onClick={closeUpdateModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Please provide details about the information you would like to update. An administrator will review your request.
              </p>
              
              <div className="form-note">
                <AlertCircle size={16} />
                <span>Only fill in the fields you wish to update. Leave fields empty if you don't want to change them.</span>
              </div>
              
              {/* Required Fields */}
              <div className="form-section">
                <h4 className="section-title">Required Information</h4>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <Mail className="input-icon" size={16} />
                    Email
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    className="form-control" 
                    value={user?.email || profile?.userId || ""} 
                    disabled 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">
                    <MessageSquare className="input-icon" size={16} />
                    Reason for update*
                  </label>
                  <textarea 
                    id="message" 
                    className="form-control" 
                    value={updateMessage} 
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    placeholder="Please describe what information you need to update and why"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
              
              {/* Profile Image Upload */}
              <div className="form-section">
                <h4 className="section-title">Profile Picture</h4>
                
                <div className="image-uploader-container">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleProfileImageChange}
                    accept="image/jpeg,image/jpg,image/png"
                    className="file-input"
                  />
                  
                  <div className="upload-preview-container">
                    {previewImage ? (
                      <div className="image-preview-wrapper">
                        <img 
                          src={previewImage} 
                          alt="Profile" 
                          className="image-preview"
                        />
                        <div className="image-actions">
                          <button 
                            type="button" 
                            className="image-action-btn remove"
                            onClick={() => {
                              setProfileImage(null);
                              setPreviewImage(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        className="upload-button"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <div className="upload-icon-wrapper">
                          <User size={24} />
                          <div className="upload-plus-icon">
                            <Upload size={12} />
                          </div>
                        </div>
                        <span className="upload-text">Upload Photo</span>
                        <span className="upload-hint">JPG, JPEG, or PNG (max 2MB)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Personal Information */}
              <div className="form-section">
                <h4 className="section-title">Personal Information</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      <User className="input-icon" size={16} />
                      First Name
                    </label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName"
                      className="form-control" 
                      value={personalInfo.firstName} 
                      onChange={handlePersonalInfoChange}
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">
                      <User className="input-icon" size={16} />
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName"
                      className="form-control" 
                      value={personalInfo.lastName} 
                      onChange={handlePersonalInfoChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phoneNumber">
                    <Phone className="input-icon" size={16} />
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    id="phoneNumber" 
                    name="phoneNumber"
                    className="form-control" 
                    value={personalInfo.phoneNumber} 
                    onChange={handlePersonalInfoChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              {/* Address Information */}
              <div className="form-section">
                <h4 className="section-title">Address Information</h4>
                
                <div className="form-group">
                  <label htmlFor="homeAddress">
                    <Home className="input-icon" size={16} />
                    Home Address
                  </label>
                  <input 
                    type="text" 
                    id="homeAddress" 
                    name="homeAddress"
                    className="form-control" 
                    value={addressInfo.homeAddress} 
                    onChange={handleAddressInfoChange}
                    placeholder="Enter home address"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="workAddress">
                    <Briefcase className="input-icon" size={16} />
                    Work Address
                  </label>
                  <input 
                    type="text" 
                    id="workAddress" 
                    name="workAddress"
                    className="form-control" 
                    value={addressInfo.workAddress} 
                    onChange={handleAddressInfoChange}
                    placeholder="Enter work address"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">
                      <MapPin className="input-icon" size={16} />
                      City
                    </label>
                    <input 
                      type="text" 
                      id="city" 
                      name="city"
                      className="form-control" 
                      value={addressInfo.city} 
                      onChange={handleAddressInfoChange}
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="postalCode">
                      <MapPin className="input-icon" size={16} />
                      Postal Code
                    </label>
                    <input 
                      type="text" 
                      id="postalCode" 
                      name="postalCode"
                      className="form-control" 
                      value={addressInfo.postalCode} 
                      onChange={handleAddressInfoChange}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="country">
                    <Globe className="input-icon" size={16} />
                    Country
                  </label>
                  <input 
                    type="text" 
                    id="country" 
                    name="country"
                    className="form-control" 
                    value={addressInfo.country} 
                    onChange={handleAddressInfoChange}
                    placeholder="Enter country"
                  />
                </div>
              </div>
              
              {/* Social Information */}
              <div className="form-section">
                <h4 className="section-title">Social Information</h4>
                
                <div className="form-group">
                  <label htmlFor="linkedin">
                    <Linkedin className="input-icon" size={16} />
                    LinkedIn
                  </label>
                  <input 
                    type="url" 
                    id="linkedin" 
                    name="linkedin"
                    className="form-control" 
                    value={socialInfo.linkedin} 
                    onChange={handleSocialInfoChange}
                    placeholder="Enter LinkedIn profile URL"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="facebook">
                    <Facebook className="input-icon" size={16} />
                    Facebook
                  </label>
                  <input 
                    type="url" 
                    id="facebook" 
                    name="facebook"
                    className="form-control" 
                    value={socialInfo.facebook} 
                    onChange={handleSocialInfoChange}
                    placeholder="Enter Facebook profile URL"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="instagram">
                    <Instagram className="input-icon" size={16} />
                    Instagram
                  </label>
                  <input 
                    type="url" 
                    id="instagram" 
                    name="instagram"
                    className="form-control" 
                    value={socialInfo.instagram} 
                    onChange={handleSocialInfoChange}
                    placeholder="Enter Instagram profile URL"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="website">
                    <Globe className="input-icon" size={16} />
                    Website
                  </label>
                  <input 
                    type="url" 
                    id="website" 
                    name="website"
                    className="form-control" 
                    value={socialInfo.website} 
                    onChange={handleSocialInfoChange}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
              
              {validationError && (
                <div className="error-message">{validationError}</div>
              )}
              
              {updateSuccess && (
                <div className="success-message">
                  Your request has been submitted successfully. We'll review it as soon as possible.
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={closeUpdateModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  onClick={handleUpdateSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} className="button-icon" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
