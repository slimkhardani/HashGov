import React from "react";
import "./CertificatsReq.css";

const displayValue = (value) => {
  if (value === undefined || value === null || value === "") return "N/A";
  return value;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString();
};

export default function AcademicCertificateDetailsCard({ certificate }) {
  if (!certificate) return null;
  const { academicInfo = {} } = certificate;

  return (
    <div className="academic-certificate-modal-content compact-modal">
      <div className="academic-cert-details-section">
        
        <div className="academic-cert-details-box">
          <div className="academic-cert-details-row">
            <span className="academic-cert-details-label large-label">ID:</span>
            <span className="academic-cert-details-value large-value">{certificate._id}</span>
          </div>
          <div className="academic-cert-details-row">
            <span className="academic-cert-details-label large-label">Type:</span>
            <span className="academic-cert-details-value large-value">{certificate.type}</span>
          </div>
          <div className="academic-cert-details-row">
            <span className="academic-cert-details-label large-label">Status:</span>
            <span className="academic-cert-details-value large-value">{certificate.status}</span>
          </div>
          <div className="academic-cert-details-row">
            <span className="academic-cert-details-label large-label">Created At:</span>
            <span className="academic-cert-details-value large-value">{formatDate(certificate.createdAt)}</span>
          </div>
          <div className="academic-cert-details-row">
            <span className="academic-cert-details-label large-label">Updated At:</span>
            <span className="academic-cert-details-value large-value">{formatDate(certificate.updatedAt)}</span>
          </div>
          {academicInfo && Object.entries(academicInfo).map(([key, value]) => (
            <div className="academic-cert-details-row" key={key}>
              <span className="academic-cert-details-label large-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
              <span className="academic-cert-details-value large-value">{key.toLowerCase().includes("date") ? formatDate(value) : displayValue(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

