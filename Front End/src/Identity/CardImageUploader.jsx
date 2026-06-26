import { useState, useRef, useEffect } from "react";
import { CreditCard, Upload } from "lucide-react";
import "./ImageUploader.css";

const CardImageUploader = ({ onImageChange, initialImage = null }) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialImage);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);

  // Initialize with initial image if provided
  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError("Please select an image file (jpg, jpeg, or png)");
      return;
    }
    
    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setError("Image size should be less than 2MB");
      return;
    }
    
    // Create URL for preview
    const url = URL.createObjectURL(file);
    setImage(file);
    
    // Process the image without cropping to a circle
    processImage(url);
  };
  
  // Process image without circular cropping, keep original format
  const processImage = (imageUrl) => {
    const img = new Image();
    
    img.onload = () => {
      // Create canvas for resizing if needed
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Limit maximum dimension while maintaining aspect ratio
      const MAX_DIMENSION = 1200;
      let width = img.width;
      let height = img.height;
      
      // Resize only if the image is too large
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = (height / width) * MAX_DIMENSION;
          width = MAX_DIMENSION;
        } else {
          width = (width / height) * MAX_DIMENSION;
          height = MAX_DIMENSION;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image to the canvas (resized if needed)
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with reasonable compression
      const processedImage = canvas.toDataURL('image/jpeg', 0.85);
      
      // Update the preview and inform parent
      setPreviewUrl(processedImage);
      
      // Call the callback with the processed image
      if (onImageChange) onImageChange(processedImage);
      
      // Clean up the original object URL
      URL.revokeObjectURL(imageUrl);
    };
    
    img.src = imageUrl;
  };
  
  const removeImage = () => {
    // Clean up the URL if needed
    if (previewUrl && image) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Reset everything
    setPreviewUrl(null);
    setImage(null);
    
    // Inform parent component
    if (onImageChange) onImageChange(null);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="image-uploader-container">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png"
        className="file-input"
      />
      
      <div className="upload-preview-container">
          {previewUrl ? (
            <div className="image-preview-wrapper id-card-preview">
              <img 
                src={previewUrl} 
                alt="ID Card" 
                className="id-card-image"
              />
              <div className="image-actions">
                <button 
                  type="button" 
                  className="image-action-btn remove"
                  onClick={removeImage}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button 
              type="button"
              className="upload-button"
              onClick={triggerFileInput}
            >
              <div className="upload-icon-wrapper">
                <CreditCard size={24} />
                <div className="upload-plus-icon">
                  <Upload size={12} />
                </div>
              </div>
              <span className="upload-text">Upload Photo</span>
              <span className="upload-hint">JPG, JPEG, or PNG (max 2MB)</span>
            </button>
          )}
        </div>
      
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default CardImageUploader;
