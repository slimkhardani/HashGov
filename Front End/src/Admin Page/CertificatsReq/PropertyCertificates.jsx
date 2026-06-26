import React, { useState, useEffect, useRef } from "react";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import HeaderAdmin from "../HeaderAdmin/HeaderAdmin";
import { getPropertyRelatedDemands, updateCertificateStatus } from '../../services/adminCertificatDemandsService';
import { nftService } from '../../services/nftService';
import { Download, Eye, X, Trash2, CheckCircle } from "lucide-react";
import { io } from 'socket.io-client';
import "./CertificatsReq.css";
import CertificateDetailsCard from "./CertificateDetailsCard";
import "../Dashboard/Dashboard.css";

export default function PropertyCertificates() {
  // Sidebar and header state for admin layout
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  const [propertyDemands, setPropertyDemands] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [processingNFT, setProcessingNFT] = useState(false);
  const [nftSuccess, setNftSuccess] = useState(null);
  const [nftError, setNftError] = useState(null);
  
  // Socket.IO reference for real-time updates
  const socketRef = useRef(null);


  useEffect(() => {
    setLoading(true);
    getPropertyRelatedDemands()
      .then(property => {
        const sanitizedProperty = property.map(cert => ({
          ...cert,
          buyerInfo: cert.buyerInfo || {},
          sellerInfo: cert.sellerInfo || {},
          carInfo: cert.carInfo || {},
          motorcycleInfo: cert.motorcycleInfo || {},
          realEstateInfo: cert.realEstateInfo || {},
          details: cert.details || {}
        }));
        setPropertyDemands(sanitizedProperty);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
      
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:5000');
    
    // Register as admin
    socketRef.current.emit('register', 'admin@system.local');
    
    // Listen for updates to certificate requests
    socketRef.current.on('certificate_status_changed', (updatedCertificate) => {
      setPropertyDemands(prev => 
        prev.map(cert => 
          cert._id === updatedCertificate._id ? updatedCertificate : cert
        )
      );
    });

    // Listen for new property certificate requests in real time
    socketRef.current.on('new_property_certificate', (newCert) => {
      console.log('[SOCKET.IO] Received new_property_certificate:', newCert);
      setPropertyDemands(prev => [newCert, ...prev]);
    });
    
    return () => {
      // Disconnect on component unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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

  const handleCertificateSelect = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCloseDetails = () => {
    setSelectedCertificate(null);
  };

  // Handle checkbox change
  const handleCheckboxChange = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(propertyDemands.map(cert => cert._id));
      setSelectAll(true);
    }
  };
  // Single delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    setDeleting(true);
    try {
      await require('../../services/adminCertificatDemandsService').deleteCertificateDemand(id);
      setPropertyDemands(prev => prev.filter(cert => cert._id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    } catch (err) {
      alert('Failed to delete request');
    }
    setDeleting(false);
  };
  // Bulk delete
  const handleDeleteSelected = async () => {
    if (!window.confirm('Delete selected requests?')) return;
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => require('../../services/adminCertificatDemandsService').deleteCertificateDemand(id)));
      setPropertyDemands(prev => prev.filter(cert => !selectedIds.includes(cert._id)));
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      alert('Failed to delete selected requests');
    }
    setDeleting(false);
  };

  // Handle certificate approval and NFT minting
  const handleApprove = async (id) => {
    try {
      // Find the certificate to approve
      const certificateToApprove = propertyDemands.find(cert => cert._id === id);
      if (!certificateToApprove) {
        throw new Error('Certificate not found');
      }
      
      // Update the status first
      await updateCertificateStatus(id, 'approved');
      
      // Update local state
      setPropertyDemands(prev =>
        prev.map(cert =>
          cert._id === id ? { ...cert, status: 'approved' } : cert
        )
      );
      
      // Show processing indicator
      setProcessingNFT(true);
      
      try {
        // Prepare payload with only the required fields for NFT minting
        const {
          type,
          itemType,
          buyerInfo,
          sellerInfo,
          carInfo,
          motorcycleInfo,
          realEstateInfo,
          userId // keep if needed by backend
        } = certificateToApprove;
        const mintPayload = {
          _id: certificateToApprove._id, // Pass the CertificatDemand's _id
          type,
          itemType,
          buyerInfo,
          sellerInfo,
          carInfo,
          motorcycleInfo,
          realEstateInfo
        };
        // Debug: log the payload being sent
        console.log('Mint Payload:', mintPayload);

        // Check if buyerInfo and sellerInfo are present and not empty
        if (!buyerInfo || Object.keys(buyerInfo).length === 0 || !sellerInfo || Object.keys(sellerInfo).length === 0) {
          setProcessingNFT(false);
          setNftError('Cannot mint NFT: buyerInfo or sellerInfo is missing or empty.');
          return;
        }

        const nftResponse = await nftService.mintPropertyCertificateNFT(mintPayload, userId);
        
        // Debug the structure of the response
        console.log('NFT Response Structure:', JSON.stringify(nftResponse, null, 2));
        
        // Hide processing indicator
        setProcessingNFT(false);
        
        // Show success message with NFT details
        setNftSuccess({
          message: 'Property Certificate NFT minted successfully',
          details: nftResponse.data,
          certificate: certificateToApprove
        });
        
        console.log('NFT minted successfully:', nftResponse);
      } catch (nftError) {
        // Hide processing indicator
        setProcessingNFT(false);
        
        // Show error message
        setNftError(nftError.message || 'Failed to mint NFT');
        console.error('Error minting NFT:', nftError);
      }
    } catch (err) {
      console.error('Error approving certificate:', err);
      alert('Failed to approve certificate');
    }
  };
  
  // Handle certificate rejection
  const handleReject = async (id) => {
    try {
      await updateCertificateStatus(id, 'rejected');
      // Update local state
      setPropertyDemands(prev =>
        prev.map(cert =>
          cert._id === id ? { ...cert, status: 'rejected' } : cert
        )
      );
    } catch (err) {
      console.error('Error rejecting certificate:', err);
      alert('Failed to reject certificate');
    }
  };

  function getStatusBadgeClass(status) {
    switch (status) {
      case "approved":
        return "status-badge approved";
      case "rejected":
        return "status-badge rejected";
      default:
        return "status-badge pending";
    }
  }

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard">
        <SidebarAdmin
          sidebarOpen={sidebarOpen}
          activeSection="property-certificates"
          onNavClick={() => {}}
          onLogout={() => {}}
        />
        <main className={`main-content ${sidebarOpen ? "" : "sidebar-closed"}`} style={{background: '#f6f8fa', minHeight: '100vh'}}>
          <HeaderAdmin title="Property-Related Certificate Demands" onToggleSidebar={handleToggleSidebar} />
          <div className="dashboard-content">
            <div className="section property-section">
      <div className="transactions-header" style={{marginBottom: '20px'}}>
        <h1 style={{ fontSize: '2.2rem', textAlign: 'right' }}>Property-Related Certificate Demands</h1>
        <hr style={{ border: 'none', height: '1px', backgroundColor: '#2a2f3a', marginTop: '10px' }} />
      </div>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', marginTop: '20px'}}>
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
                <th><input type="checkbox" checked={selectAll && propertyDemands.length > 0} onChange={handleSelectAll} /></th>
                <th>Item Type</th>
                <th>Buyer Name</th>
                <th>Seller Name</th>
                <th>Status</th>
                <th>More Info</th>
                <th>Action</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {propertyDemands.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((cert) => (
                <tr key={cert._id}>
                  <td>
                    <input type="checkbox" checked={selectedIds.includes(cert._id)} onChange={() => handleCheckboxChange(cert._id)} />
                  </td>
                  <td>{cert.itemType}</td>
                  <td>{cert.buyerInfo?.fullName}</td>
                  <td>{cert.sellerInfo?.fullName}</td>
                  <td>
                    <span className={getStatusBadgeClass(cert.status)} style={{
                      backgroundColor: cert.status === 'pending' ? 'rgba(255,152,0,0.1)' : cert.status === 'approved' ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                      color: cert.status === 'pending' ? '#ff9800' : cert.status === 'approved' ? '#4caf50' : '#f44336',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 13,
                      textTransform: 'capitalize',
                      display: 'inline-block'
                    }}>{cert.status}</span>
                  </td>
                  <td>
                    <button className="view-details-btn" onClick={() => handleCertificateSelect(cert)}>
                      <Eye size={16} /> View
                    </button>
                  </td>
                  <td style={{ minWidth: 56, display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                    {cert.status === 'pending' && (
                      <>
                        <button
                          title="Accept"
                          style={{ 
                            background: '#172822', 
                            border: 'none', 
                            borderRadius: '50%', 
                            padding: 6, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                          onClick={() => handleApprove(cert._id)}
                          disabled={deleting}
                        >
                          <span style={{ color: '#36d399', display: 'flex', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </span>
                        </button>
                        <button
                          title="Refuse"
                          style={{ 
                            background: '#24191c', 
                            border: 'none', 
                            borderRadius: '50%', 
                            padding: 6, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                          onClick={() => handleReject(cert._id)}
                          disabled={deleting}
                        >
                          <span style={{ color: '#f87272', display: 'flex', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" /></svg>
                          </span>
                        </button>
                      </>
                    )}
                    {/* Don't show any status text in the action column after approval/rejection */}
                  </td>
                  <td>
                    <button
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDelete(cert._id)}
                      disabled={deleting}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedIds.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button
                className="action-button"
                style={{ background: '#e53e3e', color: '#fff' }}
                onClick={handleDeleteSelected}
                disabled={deleting}
              >
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      )}
      {selectedCertificate && (
        <div className="property-certificate-modal-overlay" onClick={handleCloseDetails}>
          <div className="property-certificate-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseDetails}><X size={20} /></button>
            <h3>Certificate Details</h3>
            {/* Add more details as needed */}
            <CertificateDetailsCard certificate={selectedCertificate} />
          </div>
        </div>
      )}
      
      {/* NFT Processing Status Messages */}
      {processingNFT && (
        <div className="nft-processing-notification">
          <div className="nft-processing-content">
            <div className="loading-spinner"></div>
            <p>Processing NFT creation for property certificate...</p>
          </div>
        </div>
      )}
      
      {nftSuccess && nftSuccess.details && (
        <div className="nft-success-notification">
          <div className="nft-success-content">
            <CheckCircle size={24} color="#36d399" />
            <h4>{nftSuccess.message || 'Success'}</h4>
            <div className="nft-details">
              <p><strong>Certificate ID:</strong> {nftSuccess.details?.certificateId || 'N/A'}</p>
              <p><strong>Token ID:</strong> {nftSuccess.details?.tokenId || 'N/A'}</p>
              <p><strong>Serial Number:</strong> {nftSuccess.details?.nftInfo?.serialNumber || 'N/A'}</p>
              <p><strong>Item Type:</strong> {nftSuccess.details?.itemType || 'N/A'}</p>
              <p><strong>Buyer:</strong> {nftSuccess.details?.buyerInfo?.fullName || 'N/A'}</p>
              <p><strong>Seller:</strong> {nftSuccess.details?.sellerInfo?.fullName || 'N/A'}</p>
              <p><strong>Status:</strong> <span style={{color: '#36d399', fontWeight: 'bold'}}>Minted Successfully</span></p>
            </div>
            <button onClick={() => setNftSuccess(null)} className="close-notification">Close</button>
          </div>
        </div>
      )}
      
      {nftError && (
        <div className="nft-error-notification">
          <div className="nft-error-content">
            <X size={24} color="#f87272" />
            <h4>Error Creating NFT</h4>
            <p>{nftError}</p>
            <button onClick={() => setNftError(null)} className="close-notification">Close</button>
          </div>
        </div>
      )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
