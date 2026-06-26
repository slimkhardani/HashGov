import React from "react";
import "./CertificatsReq.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString();
};

export default function CertificateDetailsCard({ certificate }) {
  if (!certificate) return null;
  const { type, itemType, status, createdAt, buyerInfo = {}, sellerInfo = {}, carInfo = {}, motorcycleInfo = {}, realEstateInfo = {} } = certificate;

  // Determine which info sections to show
  const showCar = itemType === "car" && Object.keys(carInfo).length > 0;
  const showMotorcycle = itemType === "motorcycle" && Object.keys(motorcycleInfo).length > 0;
  const showRealEstate = itemType === "realestate" && Object.keys(realEstateInfo).length > 0;

  // Helper for info rendering
  const renderInfo = (info, fields) => (
    <div className="cert-details-box">
      {fields.map(([label, key]) => (
        <div className="cert-details-row" key={key}>
          <span className="cert-details-label">{label}:</span>
          <span className="cert-details-value">{info[key] || "N/A"}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="cert-modal-grid">
      {/* General Info */}
      <div className="cert-modal-section">
        <h4>General Information</h4>
        {renderInfo(
          { type, itemType, status, createdAt: formatDate(createdAt) },
          [
            ["Certificate Type", "type"],
            ["Item Type", "itemType"],
            ["Status", "status"],
            ["Created At", "createdAt"],
          ]
        )}
      </div>
      {/* Buyer Info */}
      <div className="cert-modal-section">
        <h4>Buyer Information</h4>
        {renderInfo(
          buyerInfo,
          [
            ["Full Name", "fullName"],
            ["Address", "address"],
            ["National ID", "nationalId"],
            ["Place of ID Issue", "placeOfIdIssue"],
            ["Date of ID Issue", "dateOfIdIssue"],
          ]
        )}
      </div>
      {/* Seller Info */}
      <div className="cert-modal-section">
        <h4>Seller Information</h4>
        {renderInfo(
          sellerInfo,
          [
            ["Full Name", "fullName"],
            ["Address", "address"],
            ["National ID", "nationalId"],
            ["Place of ID Issue", "placeOfIdIssue"],
            ["Date of ID Issue", "dateOfIdIssue"],
          ]
        )}
      </div>
      {/* Car Info */}
      {showCar && (
        <div className="cert-modal-section">
          <h4>Car Information</h4>
          {renderInfo(
            carInfo,
            Object.keys(carInfo).map(key => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), key])
          )}
        </div>
      )}
      {/* Motorcycle Info */}
      {showMotorcycle && (
        <div className="cert-modal-section">
          <h4>Motorcycle Information</h4>
          {renderInfo(
            motorcycleInfo,
            Object.keys(motorcycleInfo).map(key => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), key])
          )}
        </div>
      )}
      {/* Real Estate Info */}
      {itemType && itemType.toLowerCase() === "realestate" && (
        <div className="cert-modal-section">
          <h4>Real Estate Information</h4>
          {Object.keys(realEstateInfo).length > 0 ? renderInfo(
            realEstateInfo,
            Object.keys(realEstateInfo).map(key => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), key])
          ) : <div className="cert-details-box"><span className="cert-details-label">No real estate information provided.</span></div>}
        </div>
      )}

    </div>
  );
}
