import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import SidebarAdmin from '../SidebarAdmin/SidebarAdmin';
import HeaderAdmin from '../HeaderAdmin/HeaderAdmin';
import { X, Eye, Trash2 } from 'lucide-react';
import './UserSubmission.css';

export default function ProfileUpdateRequests() {
  // Selected request for details modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Add delete handler
  function handleDeleteRequest(id) {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setDeleting(true);
    fetch(`http://localhost:5000/api/update-requests/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete request');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setUpdateRequests(prev => prev.filter(r => r._id !== id));
          setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } else {
          throw new Error('Failed to delete request');
        }
      })
      .catch(e => alert(e.message))
      .finally(() => setDeleting(false));
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
      setSelectedIds(updateRequests.map(request => request._id));
      setSelectAll(true);
    }
  };
  
  // Bulk delete
  const handleDeleteSelected = () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected requests?`)) return;
    setDeleting(true);
    
    Promise.all(selectedIds.map(id => 
      fetch(`http://localhost:5000/api/update-requests/${id}`, { method: 'DELETE' })
        .then(res => res.json())
    ))
    .then(() => {
      setUpdateRequests(prev => prev.filter(r => !selectedIds.includes(r._id)));
      setSelectedIds([]);
      setSelectAll(false);
    })
    .catch(e => alert(`Error deleting requests: ${e.message}`))
    .finally(() => setDeleting(false));
  };
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [showSidebarBackdrop, setShowSidebarBackdrop] = useState(false);
  const activeSection = "profile-update-requests";

  // Responsive sidebar auto-toggle logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show backdrop when sidebar is open on mobile
  useEffect(() => {
    if (window.innerWidth < 900 && sidebarOpen) {
      setShowSidebarBackdrop(true);
    } else {
      setShowSidebarBackdrop(false);
    }
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const handleSidebarBackdrop = () => setSidebarOpen(false);
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    // Optionally, register as admin or with a special admin email
    socketRef.current.emit('register', 'admin@system.local');
    
    // Listen for new update requests in real-time
    socketRef.current.on('new_update_request', (newRequest) => {
      console.log('New update request received:', newRequest);
      setUpdateRequests(prev => [newRequest, ...prev]);
    });
    
    return () => { socketRef.current.disconnect(); };
  }, []);

  const handleNavClick = (section) => {
    // Implement navigation logic if needed
  };

  const [updateRequests, setUpdateRequests] = useState([]);
  const [updateRequestsLoading, setUpdateRequestsLoading] = useState(false);
  const [updateRequestsError, setUpdateRequestsError] = useState("");

  useEffect(() => {
    setUpdateRequestsLoading(true);
    fetch("http://localhost:5000/api/update-requests")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch update requests");
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.updateRequests)) {
          setUpdateRequests((data.updateRequests || []).sort((a, b) => (b._id > a._id ? 1 : -1)));
          setUpdateRequestsError("");
        } else {
          setUpdateRequests([]);
          setUpdateRequestsError("No update requests found");
        }
      })
      .catch(e => setUpdateRequestsError(e.message))
      .finally(() => setUpdateRequestsLoading(false));
  }, []);

  // Function to handle approving or rejecting update requests
  function handleUpdateRequestAction(id, status) {
    // First, get the request details to have the email and update data
    const updateRequest = updateRequests.find(req => req._id === id);
    
    if (!updateRequest) {
      alert("Update request not found");
      return;
    }

    // Show loading state
    setDeleting(true); // Reuse deleting state for loading indicator
    
    // Step 1: Update the request status in the database
    fetch(`http://localhost:5000/api/update-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update request status");
        return res.json();
      })
      .then(data => {
        if (data.success && data.updateRequest) {
          // Update the UI with the new status
          setUpdateRequests(prev => prev.map(r => r._id === id ? { ...r, status: data.updateRequest.status } : r));
          
          // Step 2: If approved, update the user's profile with the requested changes
          if (status === 'approved') {
            return updateUserProfile(updateRequest);
          }
        } else {
          throw new Error("Failed to update request status");
        }
      })
      .catch(e => {
        alert(e.message);
      })
      .finally(() => {
        setDeleting(false);
      });
  }
  
  // Helper function to update user profile with requested changes
  const updateUserProfile = async (updateRequest) => {
    try {
      const email = updateRequest.email;
      if (!email) throw new Error("No email found in update request");
      
      // Create an update object containing only the fields that have values
      const updateData = {};
      
      // Add profile image if it exists
      if (updateRequest.profileImage) {
        updateData.profileImage = updateRequest.profileImage;
      }
      
      // Add personal info if it exists
      if (updateRequest.personalInfo) {
        updateData.personalInfo = {};
        // Only include fields that are not null
        if (updateRequest.personalInfo.firstName) updateData.personalInfo.firstName = updateRequest.personalInfo.firstName;
        if (updateRequest.personalInfo.lastName) updateData.personalInfo.lastName = updateRequest.personalInfo.lastName;
        if (updateRequest.personalInfo.phoneNumber) updateData.personalInfo.phoneNumber = updateRequest.personalInfo.phoneNumber;
      }
      
      // Add address info if it exists
      if (updateRequest.addressInfo) {
        updateData.addressInfo = {};
        // Only include fields that are not null
        if (updateRequest.addressInfo.homeAddress) updateData.addressInfo.homeAddress = updateRequest.addressInfo.homeAddress;
        if (updateRequest.addressInfo.workAddress) updateData.addressInfo.workAddress = updateRequest.addressInfo.workAddress;
        if (updateRequest.addressInfo.city) updateData.addressInfo.city = updateRequest.addressInfo.city;
        if (updateRequest.addressInfo.postalCode) updateData.addressInfo.postalCode = updateRequest.addressInfo.postalCode;
        if (updateRequest.addressInfo.country) updateData.addressInfo.country = updateRequest.addressInfo.country;
      }
      
      // Add social info if it exists
      if (updateRequest.socialInfo) {
        updateData.socialInfo = {};
        // Only include fields that are not null
        if (updateRequest.socialInfo.linkedin) updateData.socialInfo.linkedin = updateRequest.socialInfo.linkedin;
        if (updateRequest.socialInfo.facebook) updateData.socialInfo.facebook = updateRequest.socialInfo.facebook;
        if (updateRequest.socialInfo.instagram) updateData.socialInfo.instagram = updateRequest.socialInfo.instagram;
        if (updateRequest.socialInfo.website) updateData.socialInfo.website = updateRequest.socialInfo.website;
      }
      
      // If there's nothing to update, return
      if (Object.keys(updateData).length === 0) {
        console.log("No data to update in profile");
        return;
      }
      
      // Send the update to the profiles API using our new endpoint
      const response = await fetch(`http://localhost:5000/api/profiles/update-by-email/${email}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token for authentication
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user profile");
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Profile updated successfully:", result.profile);
        // Could show a success notification here
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Error updating user profile: ${error.message}`);
      // Don't throw the error so the UI update still happens
    }
  }

  return (
    <div className="admin-submissions-wrapper">
      <div className="admin-submissions-dashboard">
        <SidebarAdmin
          sidebarOpen={sidebarOpen}
          activeSection={activeSection}
          onNavClick={handleNavClick}
        />
        {/* Sidebar overlay for mobile/tablet */}
        {showSidebarBackdrop && (
          <div className="sidebar-backdrop" onClick={handleSidebarBackdrop}></div>
        )}
        <main className={`submissions-main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <HeaderAdmin title="Profile Update Requests" onToggleSidebar={toggleSidebar} />
          <div className="submissions-content" style={{ background: '#0f1117', minHeight: '100vh' }}>
            <section className="submissions-section">
              <div className="submissions-header">
                <h2>Profile Update Requests</h2>
                <p className="section-description">Review and manage profile update requests submitted by users</p>
              </div>
              <div className="table-container">
                <div style={{position: 'relative'}}>
                  {updateRequestsLoading ? (
                    <div className="submissions-loading">Loading update requests...</div>
                  ) : updateRequestsError ? (
                    <div className="submissions-error">{updateRequestsError}</div>
                  ) : (
                    <table className="table certificates-table">
                      <thead>
                        <tr>
                          <th><input type="checkbox" checked={selectAll && updateRequests.length > 0} onChange={handleSelectAll} /></th>
                          <th>ID</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Message</th>
                          <th>Date</th>
                          <th>Actions</th>
                          <th>More Info</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {updateRequests.map((request) => (
                          <tr key={request._id}>
                            <td>
                              <input type="checkbox" checked={selectedIds.includes(request._id)} onChange={() => handleCheckboxChange(request._id)} />
                            </td>
                            <td>{request._id}</td>
                            <td>{request.email}</td>
                            <td>
                              <span className={`status-badge ${request.status}`}>{request.status}</span>
                            </td>
                            <td>{request.message?.substring(0, 30) || 'N/A'}{request.message?.length > 30 ? '...' : ''}</td>
                            <td>{new Date(request.timestamp).toLocaleString()}</td>
                            <td style={{ minWidth: 56, display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    title="Accept"
                                    style={{ background: '#172822', border: 'none', borderRadius: '50%', padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => handleUpdateRequestAction(request._id, 'approved')}
                                    disabled={deleting}
                                  >
                                    <span style={{ color: '#36d399', display: 'flex', alignItems: 'center' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                  </button>
                                  <button
                                    title="Refuse"
                                    style={{ background: '#24191c', border: 'none', borderRadius: '50%', padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => handleUpdateRequestAction(request._id, 'rejected')}
                                    disabled={deleting}
                                  >
                                    <span style={{ color: '#f87272', display: 'flex', alignItems: 'center' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" /></svg>
                                    </span>
                                  </button>
                                </>
                              )}
                            </td>
                            <td>
                              <button className="view-details-btn" onClick={() => setSelectedRequest(request)}>
                                <Eye size={16} /> View
                              </button>
                            </td>
                            <td>
                              <button
                                title="Delete"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => handleDeleteRequest(request._id)}
                                disabled={deleting}
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
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
            </section>
          </div>
        </main>
      </div>
      
      {/* Details Modal */}
      {selectedRequest && (
        <div 
          className="update-request-modal-overlay"
          onClick={() => setSelectedRequest(null)}
        >
          <div 
            className="update-request-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="update-request-modal-header">
              <h2>Update Request Details</h2>
              <button 
                className="update-request-modal-close"
                onClick={() => setSelectedRequest(null)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="update-request-modal-content">
              <div className="update-request-grid">
                {/* General Info */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="update-request-section">
                    <h3>General Information</h3>
                    <div className="update-request-data">
                      <p><strong>Request ID:</strong> {selectedRequest._id}</p>
                      <p><strong>Email:</strong> {selectedRequest.email}</p>
                      <p>
                        <strong>Status:</strong> 
                        <span className={`status-badge ${selectedRequest.status}`}>{selectedRequest.status}</span>
                      </p>
                      <p><strong>Timestamp:</strong> {new Date(selectedRequest.timestamp).toLocaleString()}</p>
                      <p><strong>Message:</strong> {selectedRequest.message}</p>
                    </div>
                  </div>
                </div>
                
                {/* Profile Image */}
                {selectedRequest.profileImage && (
                  <div className="update-request-section">
                    <h3>Profile Image</h3>
                    <div className="profile-image-container">
                      <img 
                        src={selectedRequest.profileImage} 
                        alt="Profile" 
                        className="profile-image"
                      />
                    </div>
                  </div>
                )}
                
                {/* Personal Info */}
                {selectedRequest.personalInfo && (
                  <div className="update-request-section">
                    <h3>Personal Information</h3>
                    <div className="update-request-data">
                      <p><strong>First Name:</strong> {selectedRequest.personalInfo.firstName || 'N/A'}</p>
                      <p><strong>Last Name:</strong> {selectedRequest.personalInfo.lastName || 'N/A'}</p>
                      <p><strong>Phone Number:</strong> {selectedRequest.personalInfo.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                {/* Address Info */}
                {selectedRequest.addressInfo && (
                  <div className="update-request-section">
                    <h3>Address Information</h3>
                    <div className="update-request-data">
                      <p><strong>Home Address:</strong> {selectedRequest.addressInfo.homeAddress || 'N/A'}</p>
                      <p><strong>Work Address:</strong> {selectedRequest.addressInfo.workAddress || 'N/A'}</p>
                      <p><strong>City:</strong> {selectedRequest.addressInfo.city || 'N/A'}</p>
                      <p><strong>Postal Code:</strong> {selectedRequest.addressInfo.postalCode || 'N/A'}</p>
                      <p><strong>Country:</strong> {selectedRequest.addressInfo.country || 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                {/* Social Info */}
                {selectedRequest.socialInfo && (
                  <div className="update-request-section">
                    <h3>Social Information</h3>
                    <div className="update-request-data">
                      <p><strong>LinkedIn:</strong> {selectedRequest.socialInfo.linkedin || 'N/A'}</p>
                      <p><strong>Facebook:</strong> {selectedRequest.socialInfo.facebook || 'N/A'}</p>
                      <p><strong>Instagram:</strong> {selectedRequest.socialInfo.instagram || 'N/A'}</p>
                      <p><strong>Website:</strong> {selectedRequest.socialInfo.website || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
