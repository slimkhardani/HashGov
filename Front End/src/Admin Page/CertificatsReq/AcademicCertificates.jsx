import React, { useState, useEffect } from "react";
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import HeaderAdmin from "../HeaderAdmin/HeaderAdmin";
import { getAcademicDemands } from '../../services/adminCertificatDemandsService';
import { nftService } from '../../services/nftService';
import { Download, Eye, X, Trash2, CheckCircle } from "lucide-react";
import "./CertificatsReq.css";
import "../Dashboard/Dashboard.css";
import AcademicCertificateDetailsCard from "./AcademicCertificateDetailsCard";

export default function AcademicCertificates() {
  // Sidebar and header state for admin layout
  const [openMenuRow, setOpenMenuRow] = useState(null);
  // Sidebar and header state for admin layout
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  const [academicDemands, setAcademicDemands] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [processingNFT, setProcessingNFT] = useState(false);
  const [nftSuccess, setNftSuccess] = useState(null);
  const [nftError, setNftError] = useState(null);

  // Socket.IO for real-time academic certificate requests
  const socketRef = React.useRef(null);

  useEffect(() => {
    setLoading(true);
    getAcademicDemands()
      .then(academic => {
        const sanitizedAcademic = academic.map(cert => ({
          ...cert,
          academicInfo: cert.academicInfo || {},
          details: cert.details || {}
        }));
        setAcademicDemands(sanitizedAcademic);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Connect to Socket.IO server
    socketRef.current = require('socket.io-client')('http://localhost:5000');
    // Register as admin
    socketRef.current.emit('register', 'admin@system.local');
    // Listen for new academic certificate requests
    socketRef.current.on('new_academic_certificate', (newCert) => {
      console.log('[SOCKET.IO] Received new_academic_certificate:', newCert);
      setAcademicDemands(prev => [newCert, ...prev]);
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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

  const handleCertificateSelect = (certificate) => {
    setSelectedCertificate(certificate);
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
      setSelectedIds(academicDemands.map(cert => cert._id));
      setSelectAll(true);
    }
  };
  // Single delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    setDeleting(true);
    try {
      await require('../../services/adminCertificatDemandsService').deleteCertificateDemand(id);
      setAcademicDemands(prev => prev.filter(cert => cert._id !== id));
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
      setAcademicDemands(prev => prev.filter(cert => !selectedIds.includes(cert._id)));
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      alert('Failed to delete selected requests');
    }
    setDeleting(false);
  };

  // Approve academic certificate and mint NFT
  const handleApprove = async (id) => {
    try {
      setProcessingNFT(true);
      setNftSuccess(null);
      setNftError(null);
      
      // First approve the certificate in the database
      await require('../../services/adminCertificatDemandsService').updateCertificateStatus(id, 'approved');
      
      // Find certificate details to use for NFT creation
      const certificate = academicDemands.find(cert => cert._id === id);
      if (!certificate) {
        throw new Error('Certificate not found');
      }
      // Extract certificate data for NFT metadata
      const academicInfo = certificate?.academicInfo || {};
      const userId = certificate?.userId;
      if (!userId || !academicInfo) {
        throw new Error('Missing required certificate data');
      }
      // Create NFT using certificate data
      console.log('Creating NFT for certificate with ID:', id);
      console.log('Certificate data:', academicInfo);
      const nftResponse = await nftService.mintAcademicCertificateNFT(certificate, userId);
      console.log('NFT creation response:', nftResponse);
      // Update local state to show approval
      setAcademicDemands(prev =>
        prev.map(cert =>
          cert._id === id ? { 
            ...cert, 
            status: 'approved',
            nftData: nftResponse?.data?.nft || {}
          } : cert
        )
      );
      // Show success message
      setNftSuccess({
        message: 'Certificate approved and NFT created successfully!',
        details: nftResponse?.data || {},
        certificate: certificate // Pass for display
      });
    } catch (err) {
      console.error('Error approving certificate or creating NFT:', err);
      setNftError(err.message || 'Failed to approve certificate or create NFT');
      // Revert local status if there was an error
      setAcademicDemands(prev =>
        prev.map(cert =>
          cert._id === id ? { ...cert, status: 'pending' } : cert
        )
      );
    } finally {
      setProcessingNFT(false);
    }
  };

  // Reject academic certificate
  const handleReject = async (id) => {
    try {
      await require('../../services/adminCertificatDemandsService').updateCertificateStatus(id, 'rejected');
      setAcademicDemands(prev =>
        prev.map(cert =>
          cert._id === id ? { ...cert, status: 'rejected' } : cert
        )
      );
    } catch (err) {
      console.error('Error rejecting academic certificate:', err);
      alert('Failed to reject certificate');
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard">
        <SidebarAdmin
          sidebarOpen={sidebarOpen}
          activeSection="academic-certificates"
          onNavClick={() => {}}
          onLogout={() => {}}
        />
        <main className={`main-content ${sidebarOpen ? "" : "sidebar-closed"}`} style={{background: '#f6f8fa', minHeight: '100vh'}}>
          <HeaderAdmin title="Academic Certificate Demands" onToggleSidebar={handleToggleSidebar} />
          <div className="dashboard-content">
            <div className="section academic-section">
      <div className="transactions-header" style={{marginBottom: '20px'}}>
        <h1 style={{ fontSize: '2.2rem', textAlign: 'right' }}>Academic Certificate Demands</h1>
        <hr style={{ border: 'none', height: '1px', backgroundColor: '#2a2f3a', marginTop: '10px' }} />
      </div>
      
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', marginTop: '20px'}}>
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
                <th><input type="checkbox" checked={selectAll && academicDemands.length > 0} onChange={handleSelectAll} /></th>
                <th>Recipient Name</th>
                <th>Certificate Title</th>
                <th>Institution Name</th>
                <th>Grade</th>
                <th>Status</th>
                <th>More Info</th>
                <th>Action</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {academicDemands.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((cert) => (
                <tr key={cert._id}>
                  <td>
                    <input type="checkbox" checked={selectedIds.includes(cert._id)} onChange={() => handleCheckboxChange(cert._id)} />
                  </td>
                  <td>{cert.academicInfo?.recipient}</td>
                  <td>{cert.academicInfo?.certificateTitle}</td>
                  <td>{cert.academicInfo?.institutionName}</td>
                  <td>{cert.academicInfo?.grade}</td>
                  <td>
                    <span className={getStatusBadgeClass(cert.status)}>{cert.status}</span>
                  </td>
                  <td>
                    <button className="view-details-btn" onClick={() => handleCertificateSelect(cert)}>
                      <Eye size={16} /> View
                    </button>
                  </td>
                  <td style={{ minWidth: 56, display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                    {cert.status === 'pending' && <>
                      <button
                        title="Accept"
                        style={{ background: '#172822', border: 'none', borderRadius: '50%', padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleApprove(cert._id)}
                        disabled={deleting}
                      >
                        <span style={{ color: '#36d399', display: 'flex', alignItems: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      </button>
                      <button
                        title="Refuse"
                        style={{ background: '#24191c', border: 'none', borderRadius: '50%', padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleReject(cert._id)}
                        disabled={deleting}
                      >
                        <span style={{ color: '#f87272', display: 'flex', alignItems: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" /></svg>
                        </span>
                      </button>
                    </>}
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
        <div className="academic-certificate-modal-overlay" onClick={() => setSelectedCertificate(null)}>
          <div className="academic-certificate-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedCertificate(null)} style={{position:'absolute',top:18,right:18,background:'none',border:'none',color:'#fff',cursor:'pointer'}}>
              <X size={22} />
            </button>
            <h3>Academic Certificate Details</h3>
            <AcademicCertificateDetailsCard certificate={selectedCertificate} />
          </div>
        </div>
      )}
      
      {/* NFT Processing Status Messages */}
      {processingNFT && (
        <div className="nft-processing-notification">
          <div className="nft-processing-content">
            <div className="loading-spinner"></div>
            <p>Processing NFT creation and fee transfer...</p>
          </div>
        </div>
      )}
      
      {nftSuccess && (
        <div className="nft-success-notification">
          <div className="nft-success-content">
            <CheckCircle size={24} color="#36d399" />
            <h4>{nftSuccess.message}</h4>
            {nftSuccess.details.nft && (
              <div className="nft-details">
                <p><strong>Certificate Request ID:</strong> {nftSuccess.details.nft._id || nftSuccess.details.certificateId || 'N/A'}</p>
                <p><strong>Token ID:</strong> {nftSuccess.details.nft.tokenId}</p>
                <p><strong>Serial Number:</strong> {(nftSuccess.details.nft.nftInfo?.serialNumber || nftSuccess.details.nft.nftInfo?.userNft?.serialNumber || 'N/A')}</p>
                <p><strong>Certificate:</strong> {nftSuccess.certificate?.academicInfo?.certificateTitle}</p>
                <p><strong>Fee:</strong> Paid from operator wallet</p>
              </div>
            )}
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
