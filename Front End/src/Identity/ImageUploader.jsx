import { useState, useRef, useEffect } from "react";
import { User, Upload } from "lucide-react";
import "./ImageUploader.css";

const ImageUploader = ({ onImageChange, initialImage = null }) => {
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
    
    // Create URL for preview and auto-crop
    const url = URL.createObjectURL(file);
    setImage(file);
    
    // Automatically process the image - no manual editing
    processImageToCircle(url);
  };
  
  // Process image to create a circular crop from the center
  const processImageToCircle = (imageUrl) => {
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
      
      // Update the preview and inform parent
      setPreviewUrl(croppedImage);
      
      // Call the callback with the cropped image
      if (onImageChange) onImageChange(croppedImage);
      
      // Clean up the original object URL if it exists
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
            <div className="image-preview-wrapper">
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="image-preview"
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
      
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default ImageUploader;
