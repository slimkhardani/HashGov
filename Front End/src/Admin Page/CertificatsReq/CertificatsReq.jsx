"use client"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getPropertyRelatedDemands, getAcademicDemands } from '../../services/adminCertificatDemandsService';
import {
  FileCheck,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Clock,
  X,
} from "lucide-react"
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin"
import HeaderAdmin from "../HeaderAdmin/HeaderAdmin"
import "./CertificatsReq.css"

export default function AdminCertificatesPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900)
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [activeSection, setActiveSection] = useState("certificates")

  // Responsive sidebar: auto-close on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    // Initial check
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Utility function to export certificate as JSON
  function exportCertificateAsJSON(certificate) {
    const fileName = `certificate_${certificate._id || certificate.id || 'export'}.json`;
    const jsonStr = JSON.stringify(certificate, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Export all property-related certificates as JSON
  function exportPropertySectionAsJSON() {
    const fileName = `property_certificates_export.json`;
    const jsonStr = JSON.stringify(propertyDemands, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Export all academic certificates as JSON
  function exportAcademicSectionAsJSON() {
    const fileName = `academic_certificates_export.json`;
    const jsonStr = JSON.stringify(academicDemands, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // State for each section
  const [propertyDemands, setPropertyDemands] = useState([]);
  const [academicDemands, setAcademicDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch demands from API on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPropertyRelatedDemands(),
      getAcademicDemands()
    ])
      .then(([property, academic]) => {
        // Ensure all properties are properly initialized to prevent undefined errors
        const sanitizedProperty = property.map(cert => ({
          ...cert,
          buyerInfo: cert.buyerInfo || {},
          sellerInfo: cert.sellerInfo || {},
          carInfo: cert.carInfo || {},
          motorcycleInfo: cert.motorcycleInfo || {},
          realEstateInfo: cert.realEstateInfo || {},
          details: cert.details || {}
        }));
        
        const sanitizedAcademic = academic.map(cert => ({
          ...cert,
          academicInfo: cert.academicInfo || {},
          details: cert.details || {}
        }));
        
        setPropertyDemands(sanitizedProperty);
        setAcademicDemands(sanitizedAcademic);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCertificateSelect = (certificate) => {
    setSelectedCertificate(certificate)
  }

  const handleCloseDetails = () => {
    setSelectedCertificate(null)
  }

  const handleApprove = (id) => {
    // In a real app, this would call an API to update the certificate status
    alert(`Certificate ${id} has been approved`)
    setSelectedCertificate(null)
  }

  const handleReject = (id) => {
    // In a real app, this would call an API to update the certificate status
    alert(`Certificate ${id} has been rejected`)
    setSelectedCertificate(null)
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "status-badge approved"
      case "rejected":
        return "status-badge rejected"
      default:
        return "status-badge pending"
    }
  }

  // Navigation handler function
  const handleSectionChange = (section) => {
    setActiveSection(section)
  }

  const handleLogout = () => {
    // Remove authentication data and redirect to login
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    navigate('/login')
  }

  return (
    <div className="certificates-wrapper">
      <div className="admin-certificates-dashboard">
        {/* Sidebar Component */}
        <SidebarAdmin 
          sidebarOpen={sidebarOpen} 
          activeSection={activeSection}
          onNavClick={handleSectionChange}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className={`admin-main-content ${sidebarOpen ? "" : "sidebar-closed"}`}>
          <HeaderAdmin title="Certificate Management" onToggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <div className="admin-dashboard-content">
          <div className="certificates-container">
            {/* Certificates Header */}
            <div className="certificates-header">
              <div className="certificates-stats">
                <div className="stat-card">
                  <div className="stat-title">Total Certificates</div>
                  <div className="stat-value">{propertyDemands.length + academicDemands.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Pending Review</div>
                  <div className="stat-value">{propertyDemands.filter(cert => cert.status === 'pending').length + academicDemands.filter(cert => cert.status === 'pending').length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Approved Today</div>
                  <div className="stat-value">0</div>
                </div>
              </div>

            </div>

            {/* SECTION 1: Property-Related Certificate Demands */}
<div className="section property-section">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
    <h2 className="section-title" style={{marginBottom: 0}}>Property-Related Certificate Demands</h2>
    <button className="action-button" onClick={exportPropertySectionAsJSON}>
      <Download size={16} />
      <span>Export</span>
    </button>
  </div>
  {loading ? (
    <div className="loading">Loading property-related certificates...</div>
  ) : error ? (
    <div className="error">{error}</div>
  ) : (
    <div className="table-container">
      <table className="certificates-table">
        <thead>
          <tr>
            <th>Certificate Type</th>
            <th>Item Type</th>
            <th>Buyer Name</th>
            <th>Seller Name</th>
            <th>Status</th>
            <th>More Info</th>
          </tr>
        </thead>
        <tbody>
          {propertyDemands.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((cert) => (
            <tr key={cert._id}>
              <td>{cert.type}</td>
              <td>{cert.itemType}</td>
              <td>{cert.buyerInfo?.fullName}</td>
              <td>{cert.sellerInfo?.fullName}</td>
              <td>
                <span className={getStatusBadgeClass(cert.status)}>{cert.status}</span>
              </td>
              <td>
                <button className="view-details-btn" onClick={() => handleCertificateSelect({ ...cert, section: 'property' })}>
                  <Eye size={16} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

{/* SECTION 2: Academic Certificate Demands */}
<div className="section academic-section">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
    <h2 className="section-title" style={{marginBottom: 0}}>Academic Certificate Demands</h2>
    <button className="action-button" onClick={exportAcademicSectionAsJSON}>
      <Download size={16} />
      <span>Export</span>
    </button>
  </div>
  {loading ? (
    <div className="loading">Loading academic certificates...</div>
  ) : error ? (
    <div className="error">{error}</div>
  ) : (
    <div className="table-container">
      <table className="certificates-table">
        <thead>
          <tr>
            <th>Recipient Name</th>
            <th>Certificate Title</th>
            <th>Institution Name</th>
            <th>Grade</th>
            <th>Status</th>
            <th>More Info</th>
          </tr>
        </thead>
        <tbody>
          {academicDemands.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((cert) => (
            <tr key={cert._id}>
              <td>{cert.academicInfo?.recipient}</td>
              <td>{cert.academicInfo?.certificateTitle}</td>
              <td>{cert.academicInfo?.institutionName}</td>
              <td>{cert.academicInfo?.grade}</td>
              <td>
                <span className={getStatusBadgeClass(cert.status)}>{cert.status}</span>
              </td>
              <td>
                <button className="view-details-btn" onClick={() => handleCertificateSelect({ ...cert, section: 'academic' })}>
                  <Eye size={16} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

{/* MODAL/EXPANDABLE: Show details if selectedCertificate is set */}
{selectedCertificate && (
  <div className="certificate-modal-overlay" onClick={handleCloseDetails}>
    <div className="certificate-modal" onClick={e => e.stopPropagation()}>
      <button className="modal-close-btn" onClick={handleCloseDetails}><X size={20} /></button>
      <h3>Certificate Details</h3>
      <div className="details-content">
        {selectedCertificate.section === 'property' ? (
          <>
            <div className="dark-modal-section">
              <h4>Type: {selectedCertificate.type}</h4>
              <h4>Item Type: {selectedCertificate.itemType}</h4>
              <div><strong>Status:</strong> <span className={getStatusBadgeClass(selectedCertificate.status)}>{selectedCertificate.status}</span></div>
            </div>
            <div className="dark-modal-section">
              <h4>Buyer Info</h4>
              <div>Name: {selectedCertificate.buyerInfo?.fullName}</div>
              <div>Address: {selectedCertificate.buyerInfo?.address}</div>
              <div>National ID: {selectedCertificate.buyerInfo?.nationalId}</div>
              <div>Place of ID Issue: {selectedCertificate.buyerInfo?.placeOfIdIssue}</div>
              <div>Date of ID Issue: {selectedCertificate.buyerInfo?.dateOfIdIssue}</div>
            </div>
            <div className="dark-modal-section">
              <h4>Seller Info</h4>
              <div>Name: {selectedCertificate.sellerInfo?.fullName}</div>
              <div>Address: {selectedCertificate.sellerInfo?.address}</div>
              <div>National ID: {selectedCertificate.sellerInfo?.nationalId}</div>
              <div>Place of ID Issue: {selectedCertificate.sellerInfo?.placeOfIdIssue}</div>
              <div>Date of ID Issue: {selectedCertificate.sellerInfo?.dateOfIdIssue}</div>
            </div>
            {selectedCertificate.itemType === 'car' && (
              <div className="dark-modal-section">
                <h4>Car Info</h4>
                {Object.entries(selectedCertificate.carInfo || {}).map(([k, v]) => (
                  <div key={k}><strong>{k}:</strong> {v}</div>
                ))}
              </div>
            )}
            {selectedCertificate.itemType === 'motorcycle' && (
              <div className="dark-modal-section">
                <h4>Motorcycle Info</h4>
                {Object.entries(selectedCertificate.motorcycleInfo || {}).map(([k, v]) => (
                  <div key={k}><strong>{k}:</strong> {v}</div>
                ))}
              </div>
            )}
            {selectedCertificate.itemType === 'realestate' && (
              <div className="dark-modal-section">
                <h4>Real Estate Info</h4>
                {Object.entries(selectedCertificate.realEstateInfo || {}).map(([k, v]) => (
                  <div key={k}><strong>{k}:</strong> {v}</div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="dark-modal-section">
              <h4>Academic Info</h4>
              {Object.entries(selectedCertificate.academicInfo || {}).map(([k, v]) => (
                <div key={k}><strong>{k}:</strong> {v}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}

            
          </div>
        </div>
      </main>

      {/* Certificate Details Modal */}
      {selectedCertificate && (
        <div className="dark-modal-overlay" onClick={handleCloseDetails}>
          <div className="dark-modal" onClick={e => e.stopPropagation()}>
            <div className="dark-modal-header">
              <h2>Certificate Details</h2>
              <button className="dark-modal-close" onClick={handleCloseDetails}>
                <X size={20} />
              </button>
            </div>
            <div className="dark-modal-content">
              {/* Core MongoDB fields */}
              <div className="certificate-header">
                <div className="certificate-id-container">
                  <h3>Certificate ID: {selectedCertificate._id || selectedCertificate.id}</h3>
                </div>
              </div>

              <div className="modal-body">
                {/* Basic Info Section */}
                <div className="info-grid">
                  {/* Left Column - Basic Info */}
                  <div className="info-column">
                    {selectedCertificate.section === 'property' ? (
                      <>
                        <div className="dark-modal-section">
                          <h4>Type: {selectedCertificate.type}</h4>
                          <h4>Item Type: {selectedCertificate.itemType}</h4>
                          <div><strong>Status:</strong> <span className={getStatusBadgeClass(selectedCertificate.status)}>{selectedCertificate.status}</span></div>
                        </div>
                        <div className="dark-modal-section">
                          <h4>Buyer Info</h4>
                          <div>Name: {selectedCertificate.buyerInfo?.fullName}</div>
                          <div>Address: {selectedCertificate.buyerInfo?.address}</div>
                          <div>National ID: {selectedCertificate.buyerInfo?.nationalId}</div>
                          <div>Place of ID Issue: {selectedCertificate.buyerInfo?.placeOfIdIssue}</div>
                          <div>Date of ID Issue: {selectedCertificate.buyerInfo?.dateOfIdIssue}</div>
                        </div>
                        <div className="dark-modal-section">
                          <h4>Seller Info</h4>
                          <div>Name: {selectedCertificate.sellerInfo?.fullName}</div>
                          <div>Address: {selectedCertificate.sellerInfo?.address}</div>
                          <div>National ID: {selectedCertificate.sellerInfo?.nationalId}</div>
                          <div>Place of ID Issue: {selectedCertificate.sellerInfo?.placeOfIdIssue}</div>
                          <div>Date of ID Issue: {selectedCertificate.sellerInfo?.dateOfIdIssue}</div>
                        </div>
                      </>
                    ) : (
                      <div className="dark-modal-section">
                        <h4>Academic Info</h4>
                        {Object.entries(selectedCertificate.academicInfo || {}).map(([k, v]) => (
                          <div key={k}><strong>{k}:</strong> {v}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Property/Vehicle Details */}
                  <div className="info-column">
                    {selectedCertificate.type === "Real Estate" ? (
                      <div className="dark-modal-section">
                        <h4 className="section-title">Property Details</h4>
                        <div className="details-group">
                          <div className="detail-row">
                            <span className="detail-label">Address</span>
                            <span className="detail-value">{selectedCertificate.details?.propertyAddress || "—"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Property Type</span>
                            <span className="detail-value">{selectedCertificate.details?.propertyType || "—"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Surface Area</span>
                            <span className="detail-value">{selectedCertificate.details?.surfaceArea || "—"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Rooms</span>
                            <span className="detail-value">{selectedCertificate.details?.rooms || "—"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Year Built</span>
                            <span className="detail-value">{selectedCertificate.details?.yearBuilt || "—"}</span>
                          </div>
                          <div className="detail-row highlight">
                            <span className="detail-label">Purchase Price</span>
                            <span className="detail-value">{selectedCertificate.details?.purchasePrice || "—"}</span>
                          </div>
                        </div>
                      </div>
                    ) : selectedCertificate.type === "Vehicle" ? (
                      <div className="dark-modal-section">
                        <h4 className="section-title">Vehicle Details</h4>
                        <div className="details-group">
                          <div className="detail-row">
                            <span className="detail-label">Manufacturer</span>
                            <span className="detail-value">{selectedCertificate.details?.manufacturer || "—"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Model</span>
                            <span className="detail-value">{selectedCertificate.details?.model || "—"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Year</span>
                            <span className="detail-value">{selectedCertificate.details?.year || "—"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">VIN</span>
                            <span className="detail-value">{selectedCertificate.details?.vin || "—"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Color</span>
                            <span className="detail-value">{selectedCertificate.details?.color || "—"}</span>
                          </div>
                          <div className="detail-row highlight">
                            <span className="detail-label">Purchase Price</span>
                            <span className="detail-value">{selectedCertificate.details?.purchasePrice || "—"}</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Item Specific Info (Car, Motorcycle, Real Estate) */}
                {selectedCertificate.section === 'property' && (
                  <div className="item-specific-info">
                    {selectedCertificate.itemType === 'car' && (
                      <div className="dark-modal-section">
                        <h4>Car Info</h4>
                        {Object.entries(selectedCertificate.carInfo || {}).map(([k, v]) => (
                          <div key={k}><strong>{k}:</strong> {v}</div>
                        ))}
                      </div>
                    )}
                    {selectedCertificate.itemType === 'motorcycle' && (
                      <div className="dark-modal-section">
                        <h4>Motorcycle Info</h4>
                        {Object.entries(selectedCertificate.motorcycleInfo || {}).map(([k, v]) => (
                          <div key={k}><strong>{k}:</strong> {v}</div>
                        ))}
                      </div>
                    )}
                    {selectedCertificate.itemType === 'realestate' && (
                      <div className="dark-modal-section">
                        <h4>Real Estate Info</h4>
                        {Object.entries(selectedCertificate.realEstateInfo || {}).map(([k, v]) => (
                          <div key={k}><strong>{k}:</strong> {v}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection Reason (if applicable) */}
                {selectedCertificate.details?.rejectionReason && (
                  <div className="dark-modal-section rejection-reason">
                    <h4 className="section-title">Rejection Reason</h4>
                    <p>{selectedCertificate.details.rejectionReason}</p>
                  </div>
                )}


              </div>

              {/* Action Buttons (for pending certificates) */}
              <div className="certificate-actions">
                {selectedCertificate.status === "pending" && (
                  <>
                    <button className="reject-btn" onClick={() => handleReject(selectedCertificate.id)}>
                      <XCircle size={16} />
                      Reject Certificate
                    </button>
                    <button className="approve-btn" onClick={() => handleApprove(selectedCertificate.id)}>
                      <CheckCircle size={16} />
                      Approve Certificate
                    </button>
                  </>
                )}
                <button className="export-btn" onClick={() => exportCertificateAsJSON(selectedCertificate)} style={{marginLeft: 'auto', border: '2px solid #fff', color: '#fff', background: 'transparent', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'}}>
                  Export as JSON
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
