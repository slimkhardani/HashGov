"use client"
import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext.jsx"
import { Eye, X, Trash2, Snowflake } from "lucide-react"
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin";
import HeaderAdmin from "../HeaderAdmin/HeaderAdmin";
import axios from "axios";
import "./Identities.css";

export default function AdminIdentities() {
  // State declarations first
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailAttachment, setEmailAttachment] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState(null);
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [activeSection, setActiveSection] = useState('identities');
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Multi-select states
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showMultiEmailModal, setShowMultiEmailModal] = useState(false);
  const [multiEmailSubject, setMultiEmailSubject] = useState("");
  const [multiEmailMessage, setMultiEmailMessage] = useState("");
  const [multiEmailAttachments, setMultiEmailAttachments] = useState([]);
  const [multiEmailSending, setMultiEmailSending] = useState(false);
  const [multiEmailResult, setMultiEmailResult] = useState(null);

  // Helper: Get selected users (objects)
  const selectedUsers = users.filter(u => selectedUserIds.includes(u._id));
  const selectedEmails = selectedUsers.map(u => u.email);

  // Multi-select handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedUserIds(checked ? users.map(u => u._id) : []);
  };
  const handleSelectUser = (userId, checked) => {
    setSelectedUserIds(prev => checked ? [...prev, userId] : prev.filter(id => id !== userId));
  };

  // Multi-delete handler
  const handleMultiDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedUserIds.length} user(s)?`)) return;
    for (const userId of selectedUserIds) {
      await handleDeleteUser(userId);
    }
    setSelectedUserIds([]);
    setSelectAll(false);
  };

  // Multi-email send handler
  const handleMultiSendEmail = async () => {
    if (!multiEmailSubject || !multiEmailMessage || selectedEmails.length === 0) return;
    setMultiEmailSending(true);
    setMultiEmailResult(null);
    try {
      const formData = new FormData();
      formData.append('subject', multiEmailSubject);
      formData.append('message', multiEmailMessage);
      selectedEmails.forEach(email => formData.append('emails[]', email));
      if (multiEmailAttachments && multiEmailAttachments.length > 0) {
        multiEmailAttachments.forEach(file => formData.append('attachments', file));
      }
      const res = await fetch('http://localhost:5000/api/emails/send-newsletter', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMultiEmailResult({success:true,message:'Email sent successfully!'});
        setTimeout(()=>{
          setShowMultiEmailModal(false);
          setMultiEmailSubject("");
          setMultiEmailMessage("");
          setMultiEmailResult(null);
          setMultiEmailAttachments([]);
        }, 1800);
      } else {
        setMultiEmailResult({success:false,message:data.message||'Failed to send.'});
      }
    } catch (e) {
      setMultiEmailResult({success:false,message:'Network or server error.'});
    } finally {
      setMultiEmailSending(false);
    }
  };

  // Multi-copy emails
  const handleCopyEmails = () => {
    if (selectedEmails.length === 0) return;
    navigator.clipboard.writeText(selectedEmails.join(", "));
    alert('Emails copied to clipboard!');
  };
  
  // Multi-freeze/unfreeze handler
  const handleMultiFreeze = async () => {
    if (selectedUserIds.length === 0) return;
    
    // Determine if we're freezing or unfreezing based on selection
    const selectedUsersArray = users.filter(u => selectedUserIds.includes(u._id));
    const frozenCount = selectedUsersArray.filter(u => u.status === 'frozen').length;
    const allFrozen = frozenCount === selectedUsersArray.length;
    const allActive = frozenCount === 0;
    
    // Target status we're setting all selected users to
    const newStatus = allFrozen ? 'active' : 'frozen';
    const action = newStatus === 'frozen' ? 'freeze' : 'unfreeze';
    
    if (!window.confirm(`Are you sure you want to ${action} ${selectedUserIds.length} user(s)?`)) return;
    
    try {
      setLoading(true);
      
      // Process each user
      for (const userId of selectedUserIds) {
        // Toggle freeze status via API
        await axios.patch(`/api/admin/users/${userId}/status`, 
          { status: newStatus }, 
          { withCredentials: true }
        );
      }
      
      // Update local state
      setUsers(users.map(u => {
        if (selectedUserIds.includes(u._id)) {
          return { ...u, status: newStatus };
        }
        return u;
      }));
      
      setLoading(false);
      setSelectedUserIds([]);
      setSelectAll(false);
      alert(`${selectedUserIds.length} user(s) ${action}d successfully`);
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error(`Error ${action}ing users:`, err);
      setLoading(false);
      alert(`Failed to ${action} users: ` + (err.response?.data?.message || err.message));
    }
  };

  
  
  
  
  
  

  const handleSendEmail = async () => {
    if (!selectedUser || !selectedUser.email || !emailSubject || !emailBody) return;
    setEmailSending(true);
    setEmailFeedback(null);
    try {
      const formData = new FormData();
      formData.append('subject', emailSubject);
      formData.append('message', emailBody);
      formData.append('emails[]', selectedUser.email);
      if (emailAttachment) formData.append('attachments', emailAttachment);
      const res = await fetch('http://localhost:5000/api/emails/send-newsletter', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setEmailFeedback({success:true,message:'Email sent successfully!'});
        setTimeout(()=>{
          setShowEmailForm(false);
          setEmailSubject("");
          setEmailBody("");
          setEmailAttachment(null);
          setEmailFeedback(null);
        }, 1800);
      } else {
        setEmailFeedback({success:false,message:data.message||'Failed to send.'});
      }
    } catch (e) {
      setEmailFeedback({success:false,message:'Network or server error.'});
    } finally {
      setEmailSending(false);
    }
  };

  const adminPageStyle = {
    background: '#0f1117',
    height: '100vh', // Changed from minHeight to height to fix lint warning
    color: '#f5f5f7'
  };
  
  // Sidebar toggle function (like TransactionsHistory)
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Function to fetch data from MongoDB through API endpoints
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from both endpoints
      const [profilesRes, usersRes] = await Promise.all([
        axios.get('/api/admin/profiles', { withCredentials: true }),
        axios.get('/api/admin/users', { withCredentials: true })
      ]);
      
      setProfiles(profilesRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };
  
  // Call fetchData on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Responsive sidebar: auto-close on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all associated data?')) {
      try {
        setLoading(true);
        
        const userToDelete = users.find(user => user._id === userId);
        
        if (!userToDelete) {
          throw new Error('User not found');
        }
        
        // Check if user has a profile
        const hasProfile = userHasProfile(userToDelete);
        
        // If user has a profile, delete it first
        if (hasProfile) {
          try {
            console.log(`Deleting profile for user with email: ${userToDelete.email}`);
            await axios.delete(`/api/admin/profiles/by-email/${userToDelete.email}`, { withCredentials: true });
            
            // Update profiles state
            setProfiles(profiles.filter(p => p.userId !== userToDelete.email));
            console.log('Profile deleted successfully');
          } catch (profileErr) {
            console.error('Error deleting profile:', profileErr);
            // Continue with user deletion even if profile deletion fails
          }
        }
        
        // Now delete the user
        console.log(`Deleting user with ID: ${userId}`);
        await axios.delete(`/api/admin/users/${userId}`, { withCredentials: true });
        
        // Update users state
        setUsers(users.filter(user => user._id !== userId));
        
        // Close modal
        setShowUserModal(false);
        setLoading(false);
        
        // Show success notification
        alert('User' + (hasProfile ? ' and associated profile' : '') + ' successfully deleted');
        
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    }
  };

  // Handle user freeze/unfreeze
  const handleFreezeUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    const currentStatus = user?.status || 'active';
    const newStatus = currentStatus === 'frozen' ? 'active' : 'frozen';
    const action = newStatus === 'frozen' ? 'freeze' : 'unfreeze';
    
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        setLoading(true);
        
        // Toggle freeze status via API
        const response = await axios.patch(`/api/admin/users/${userId}/status`, 
          { status: newStatus }, 
          { withCredentials: true }
        );
        
        console.log('Server response:', response.data);
        
        // Update local state
        setUsers(users.map(u => {
          if (u._id === userId) {
            return { ...u, status: newStatus };
          }
          return u;
        }));
        
        // Update selected user if viewing in modal
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
        
        setLoading(false);
        alert(`User ${action}d successfully`);
        
        // Refresh data after status change to make sure we have the latest data
        fetchData();
      } catch (err) {
        console.error('Error updating user status:', err);
        setLoading(false);
        alert(`Failed to ${action} user: ` + (err.response?.data?.message || err.message));
      }
    }
  };

  // Find user's profile by email
  const findUserProfile = (userEmail) => {
    return profiles.find(p => p.userId === userEmail);
  };

  // Open user details modal
  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };
  
  // Open attachment in new window
  const openAttachment = (imageData, type) => {
    if (!imageData) return;
    
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>${type} Attachment</title>
          <style>body{margin:0;display:flex;justify-content:center;background:#0f1117;}</style>
        </head>
        <body>
          <img src="${imageData}" style="max-width:100%;max-height:100vh;">
        </body>
      </html>
    `);
  };

  // Helper: Cross-reference users with profiles by email
  const userHasProfile = (user) => profiles.some(p => p.userId === user.email);
  
  // Copy email to clipboard
  const copyEmailToClipboard = (email) => {
    navigator.clipboard.writeText(email);
    alert('Email copied to clipboard!');
  };

  return (
    <div className="admin-root" style={adminPageStyle}>
      <div className="admin-dashboard">
        <SidebarAdmin
          sidebarOpen={sidebarOpen}
          activeSection={activeSection}
          onNavClick={(section) => setActiveSection(section)}
          onLogout={logout}
        />
        <main className="main-content" style={{ marginLeft: sidebarOpen ? '260px' : '80px' }}>
          <HeaderAdmin
            onToggleSidebar={toggleSidebar}
            title="Identities & Users"
          />
          <div className="dashboard-content">
            {/* Single section: All Users */}
            <section className="admin-section">
              <div className="transactions-header" style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2.2rem', textAlign: 'right' }}>Identities & Users</h1>
                <hr style={{ border: 'none', height: '1px', backgroundColor: '#2a2f3a', marginTop: '10px' }} />
              </div>
              {/* Bulk action buttons - styled like popout window buttons */}
              <div className="action-buttons-container" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                backgroundColor: '#23263a',
                borderRadius: '8px 8px 0 0',
                padding: '16px',
                borderBottom: '1px solid #394058',
                flexWrap: 'wrap'
              }}>
                <button
                  className="action-button"
                  disabled={selectedUserIds.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: selectedUserIds.length === 0 ? '#2a2e45' : '#23273b',
                    color: selectedUserIds.length === 0 ? '#8a8d98' : '#36d399',
                    border: '1px solid ' + (selectedUserIds.length === 0 ? '#3a3f56' : '#36d399'),
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: selectedUserIds.length === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    fontSize: 14,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setShowMultiEmailModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Send Message
                </button>
                
                <button
                  className="action-button"
                  disabled={selectedUserIds.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: selectedUserIds.length === 0 ? '#2a2e45' : '#23273b',
                    color: selectedUserIds.length === 0 ? '#8a8d98' : '#ff4444',
                    border: '1px solid ' + (selectedUserIds.length === 0 ? '#3a3f56' : '#ff4444'),
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: selectedUserIds.length === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    fontSize: 14,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={handleMultiDelete}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                
                <button
                  className="action-button"
                  disabled={selectedUserIds.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: selectedUserIds.length === 0 ? '#2a2e45' : '#23273b',
                    color: selectedUserIds.length === 0 ? '#8a8d98' : '#36d399',
                    border: '1px solid ' + (selectedUserIds.length === 0 ? '#3a3f56' : '#36d399'),
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: selectedUserIds.length === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    fontSize: 14,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={handleCopyEmails}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Emails
                </button>
                
                <button
                  className="action-button"
                  disabled={selectedUserIds.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: selectedUserIds.length === 0 ? '#2a2e45' : '#23273b',
                    color: selectedUserIds.length === 0 ? '#8a8d98' : '#4dabf7',
                    border: '1px solid ' + (selectedUserIds.length === 0 ? '#3a3f56' : '#4dabf7'),
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: selectedUserIds.length === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    fontSize: 14,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={handleMultiFreeze}
                >
                  <Snowflake size={16} />
                  {(() => {
                    // Determine button text based on selection
                    if (selectedUserIds.length === 0) return 'Freeze/Unfreeze';
                    
                    const selectedUsersArray = users.filter(u => selectedUserIds.includes(u._id));
                    const frozenCount = selectedUsersArray.filter(u => u.status === 'frozen').length;
                    const allFrozen = frozenCount === selectedUsersArray.length;
                    const allActive = frozenCount === 0;
                    
                    if (allFrozen) return 'Unfreeze';
                    if (allActive) return 'Freeze';
                    return 'Toggle Freeze'; // Mixed status
                  })()}
                </button>
                
                <span style={{ 
                  color: '#aaa', 
                  fontSize: 13, 
                  backgroundColor: '#1d1f30',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  marginLeft: 'auto'
                }}>
                  {selectedUserIds.length > 0 ? `${selectedUserIds.length} selected` : 'Select users to enable actions'}
                </span>
              </div>
              
              <div className="admin-card">
  {/* Multi-send email modal as popup */}
  {showMultiEmailModal && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.45)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#181c29',
        borderRadius: 10,
        padding: 40,
        minWidth: 480,
        maxWidth: 650,
        boxShadow: '0 8px 32px #0007',
        color: '#fff',
        position: 'relative',
        fontSize: 16
      }}>
        <h3 style={{marginTop:0, fontSize: 22}}>Send Email to {selectedEmails.length} user{selectedEmails.length > 1 ? 's' : ''}</h3>
        <label style={{display:'block',margin:'18px 0 8px 0',fontWeight:600}}>Subject</label>
        <input
          type="text"
          value={multiEmailSubject}
          onChange={e => setMultiEmailSubject(e.target.value)}
          style={{width:'100%',padding:'10px',borderRadius:4,border:'1px solid #333',marginBottom:8,fontSize:16}}
          placeholder="Email subject"
          disabled={multiEmailSending}
        />
        <label style={{display:'block',margin:'12px 0 8px 0',fontWeight:600}}>Message</label>
        <textarea
          value={multiEmailMessage}
          onChange={e => setMultiEmailMessage(e.target.value)}
          style={{width:'100%',minHeight:180,padding:'10px',borderRadius:4,border:'1px solid #333',fontSize:15}}
          placeholder="Email message (HTML supported)"
          disabled={multiEmailSending}
        />
        <label style={{display:'block',margin:'16px 0 8px 0',fontWeight:600}}>Attachments</label>
        <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="attachment-upload"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#23273b',
              color: '#36d399',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0002',
              border: '1px solid #36d399',
              transition: 'background 0.2s, color 0.2s',
              marginBottom: 0,
              gap: 8,
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#36d399';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#23273b';
              e.currentTarget.style.color = '#36d399';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Files
            <input
              id="attachment-upload"
              type="file"
              multiple
              onChange={e => setMultiEmailAttachments(Array.from(e.target.files))}
              style={{ display: 'none' }}
              disabled={multiEmailSending}
            />
          </label>
        </div>
        {multiEmailAttachments && multiEmailAttachments.length > 0 && (
          <div style={{marginBottom: 10, color:'#aaa', fontSize:14}}>
            {multiEmailAttachments.map((file, idx) => (
              <div key={idx}>{file.name}</div>
            ))}
          </div>
        )}
        {multiEmailResult && (
          <div style={{margin:'14px 0 0 0',color:multiEmailResult.success ? '#36d399':'#ff4444'}}>
            {multiEmailResult.message}
          </div>
        )}
        <div style={{marginTop:18,display:'flex',gap:12,justifyContent:'flex-end'}}>
          <button
            style={{padding:'10px 22px',borderRadius:5,border:'none',background:'#888',color:'#fff',fontWeight:600,cursor:'pointer',fontSize:16}}
            onClick={() => {
              setShowMultiEmailModal(false);
              setMultiEmailSubject('');
              setMultiEmailMessage('');
              setMultiEmailResult(null);
              setMultiEmailAttachments([]);
            }}
            disabled={multiEmailSending}
          >Cancel</button>
          <button
            style={{padding:'10px 22px',borderRadius:5,border:'none',background:'#36d399',color:'#fff',fontWeight:600,cursor:multiEmailSending?'not-allowed':'pointer',opacity:multiEmailSending?0.7:1,fontSize:16}}
            disabled={multiEmailSending || !multiEmailSubject || !multiEmailMessage}
            onClick={handleMultiSendEmail}
          >{multiEmailSending ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
  )}

                {loading ? (
                  <div className="loading-indicator">Loading users...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              checked={selectAll && users.length > 0}
                              onChange={e => handleSelectAll(e.target.checked)}
                            />
                          </th>
                          <th>ID</th>
                          <th>Email</th>
                          <th>Has Profile?</th>
                          <th>More Info</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={6} style={{textAlign:'center'}}>No users found.</td></tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user._id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedUserIds.includes(user._id)}
                                  onChange={e => handleSelectUser(user._id, e.target.checked)}
                                />
                              </td>
                              <td>{user._id}</td>
                              <td>{user.email}</td>
                              <td>{userHasProfile(user) ? 'Yes' : 'No'}</td>
                              <td>
                                <button className="view-btn" onClick={() => openUserModal(user)}>
                                  <Eye size={16} style={{marginRight:4}} /> View
                                </button>
                              </td>
                              <td>
                                <span className={`status-badge-c ${user.status === 'frozen' ? 'frozen' : 'active'}`}>
                                  {user.status === 'frozen' ? 'Frozen' : 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Modal for user details */}
            {showUserModal && selectedUser && (
              <div className="dark-modal-overlay show">
                <div className="dark-modal slide-in">
                  <div className="dark-modal-header">
                    <h3>
                      {userHasProfile(selectedUser) ? 'User Profile Details' : 'User Details'}
                    </h3>
                    <button className="close-btn" onClick={closeUserModal} style={{position: 'absolute', right: '4px', top: '4px', background: 'none', border: 'none', cursor: 'pointer'}}>
                    <X size={24} color="#9ba3af" />
                  </button>
                  </div>
                  <div className="dark-modal-content">
                    {userHasProfile(selectedUser) ? (
                      // Display profile data for users with profiles
                      <>
                        {(() => {
                          const profile = findUserProfile(selectedUser.email);
                          return (
                            <div className="modal-grid-layout-a">
                              {/* Row 1 */}
                              <div className="modal-grid-row-a">
                                {/* Personal Info */}
                                <div className="dark-modal-section">
                                  <h4>Personal Info</h4>
                                  <div><strong>First Name:</strong> {profile.personalInfo?.firstName}</div>
                                  <div><strong>Last Name:</strong> {profile.personalInfo?.lastName}</div>
                                  <div><strong>Date of Birth:</strong> {new Date(profile.personalInfo?.dateOfBirth).toLocaleDateString()}</div>
                                  <div><strong>Gender:</strong> {profile.personalInfo?.gender}</div>
                                  <div><strong>Phone Number:</strong> {profile.personalInfo?.phoneNumber}</div>
                                  <div>
                                    <strong>Profile Image:</strong> 
                                    {profile.personalInfo?.profileImage ? (
                                      <button 
                                        className="view-attachment-btn"
                                        onClick={() => openAttachment(profile.personalInfo.profileImage, 'Profile Image')}
                                      >
                                        View Image
                                      </button>
                                    ) : '—'}
                                  </div>
                                </div>
                                
                                {/* Identity Info */}
                                <div className="dark-modal-section">
                                  <h4>Identity Info</h4>
                                  <div><strong>ID Number:</strong> {profile.identityInfo?.idNumber}</div>
                                  <div><strong>Issue Date:</strong> {profile.identityInfo?.issueDate ? new Date(profile.identityInfo.issueDate).toLocaleDateString() : '—'}</div>
                                  <div><strong>Expiry Date:</strong> {profile.identityInfo?.expiryDate ? new Date(profile.identityInfo.expiryDate).toLocaleDateString() : '—'}</div>
                                  <div><strong>Fingerprint Number:</strong> {profile.identityInfo?.FingerprintNumber}</div>
                                  <div>
                                    <strong>ID Card Front:</strong> 
                                    {profile.identityInfo?.idCardFrontImage ? (
                                      <button 
                                        className="view-attachment-btn"
                                        onClick={() => openAttachment(profile.identityInfo.idCardFrontImage, 'ID Card Front')}
                                      >
                                        View Image
                                      </button>
                                    ) : '—'}
                                  </div>
                                  <div>
                                    <strong>ID Card Back:</strong> 
                                    {profile.identityInfo?.idCardBackImage ? (
                                      <button 
                                        className="view-attachment-btn"
                                        onClick={() => openAttachment(profile.identityInfo.idCardBackImage, 'ID Card Back')}
                                      >
                                        View Image
                                      </button>
                                    ) : '—'}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Row 2 */}
                              <div className="modal-grid-row-a">
                                {/* Address Info */}
                                <div className="dark-modal-section">
                                  <h4>Address Info</h4>
                                  <div><strong>Home Address:</strong> {profile.addressInfo?.homeAddress}</div>
                                  <div><strong>Work Address:</strong> {profile.addressInfo?.workAddress}</div>
                                  <div><strong>City:</strong> {profile.addressInfo?.city}</div>
                                  <div><strong>Postal Code:</strong> {profile.addressInfo?.postalCode}</div>
                                  <div><strong>Country:</strong> {profile.addressInfo?.country}</div>
                                </div>
                                
                                {/* Combined Info */}
                                <div className="dark-modal-section">
                                  <h4>Additional Info</h4>
                                  {/* Social Media Links */}
                                  <div><strong>LinkedIn:</strong> {profile.socialInfo?.linkedin || '—'}</div>
                                  <div><strong>Facebook:</strong> {profile.socialInfo?.facebook || '—'}</div>
                                  <div><strong>Instagram:</strong> {profile.socialInfo?.instagram || '—'}</div>
                                  <div><strong>Website:</strong> {profile.socialInfo?.website || '—'}</div>
                                  
                                  {/* NFT Info (condensed) */}
                                  <div style={{marginTop: '10px'}}><strong>Token ID:</strong> {profile.nftInfo?.tokenId || '—'}</div>
                                  <div><strong>Account ID:</strong> {profile.nftInfo?.accountId || '—'}</div>
                                  <div><strong>Minted At:</strong> {profile.nftInfo?.mintedAt ? new Date(profile.nftInfo.mintedAt).toLocaleString() : '—'}</div>
                                </div>
                              </div>
                              

                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      // Display basic user data for users without profiles
                      <div className="dark-modal-section">
                        <h4>User Information</h4>
                        <div><strong>ID:</strong> {selectedUser._id}</div>
                        <div><strong>First Name:</strong> {selectedUser.firstName}</div>
                        <div><strong>Last Name:</strong> {selectedUser.lastName}</div>
                        <div><strong>Email:</strong> {selectedUser.email}</div>
                        <div><strong>Phone Number:</strong> {selectedUser.phoneNumber}</div>
                        <div><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                        <div><strong>Updated At:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                  <div className="dark-modal-actions">
                    <button 
                      className={`${selectedUser.status === 'frozen' ? 'unfreeze-btn' : 'freeze-btn'}`} 
                      onClick={() => handleFreezeUser(selectedUser._id)}
                    >
                      <Snowflake size={16}/> {selectedUser.status === 'frozen' ? 'Unfreeze User' : 'Freeze User'}
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteUser(selectedUser._id)}>
                      <Trash2 size={16}/> Delete User
                    </button>
                    <button className="message-btn" onClick={() => setShowEmailForm(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg> Send Email
                    </button>
                    {showEmailForm && (
                      <div className="send-email-form" style={{marginTop: '16px', background: '#23263a', padding: '16px', borderRadius: '8px'}}>
                        <h4 style={{marginBottom: '8px'}}>Send Email to {selectedUser.email}</h4>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                          placeholder="Subject"
                          style={{width: '100%', marginBottom: '8px', padding: '8px', borderRadius: '5px', border: '1px solid #333', fontSize: '1rem'}}
                          disabled={emailSending}
                        />
                        <textarea
                          value={emailBody}
                          onChange={e => setEmailBody(e.target.value)}
                          placeholder="Write your message here..."
                          rows={5}
                          style={{width: '100%', marginBottom: '8px', resize: 'vertical'}}
                          disabled={emailSending}
                        />
                        <input
                          type="file"
                          onChange={e => setEmailAttachment(e.target.files[0])}
                          style={{marginBottom: '8px'}}
                          disabled={emailSending}
                        />
                        {emailAttachment && (
                          <div style={{marginBottom: '8px', color:'#aaa', fontSize:14}}>
                            {emailAttachment.name}
                          </div>
                        )}
                        <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                          <button className="send-btn" onClick={handleSendEmail} disabled={emailSending || !emailSubject || !emailBody}>
                            {emailSending ? 'Sending...' : 'Send'}
                          </button>
                          <button className="cancel-btn" onClick={() => setShowEmailForm(false)} disabled={emailSending}>
                            Cancel
                          </button>
                        </div>
                        {emailFeedback && (
                          <div style={{marginTop: '8px', color: emailFeedback.success ? '#36d399' : '#ff4444'}}>
                            {emailFeedback.message}
                          </div>
                        )}
                      </div>
                    )}
                    <button className="copy-btn-p" onClick={() => copyEmailToClipboard(selectedUser.email)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg> Copy Email
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
