import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../SidebarAdmin/SidebarAdmin';
import HeaderAdmin from '../HeaderAdmin/HeaderAdmin';
import './UserSubmission.css';

export default function ContactFormSubmissions() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [showSidebarBackdrop, setShowSidebarBackdrop] = useState(false);
  const activeSection = "contact-form-submissions";

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
    // Initial check
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
  const handleNavClick = (section) => {
    // Implement navigation logic if needed
  };

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [expandedMsg, setExpandedMsg] = useState({});
  const [messageSearch, setMessageSearch] = useState("");

  // Email selection and modal states for sending email
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    setMessagesLoading(true);
    fetch("http://localhost:5000/api/messages")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then(data => {
        setMessages((data || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
        setMessagesError("");
      })
      .catch(e => setMessagesError(e.message))
      .finally(() => setMessagesLoading(false));
  }, []);

  const filteredMessages = messages.filter(msg => {
    if (messageSearch) {
      const search = messageSearch.toLowerCase();
      return (
        (msg.name && msg.name.toLowerCase().includes(search)) ||
        (msg.email && msg.email.toLowerCase().includes(search)) ||
        (msg.subject && msg.subject.toLowerCase().includes(search)) ||
        (msg.message && msg.message.toLowerCase().includes(search))
      );
    }
    return true;
  });

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const datePart = date.toLocaleDateString('en-US', options);
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${datePart} - ${hours}:${mins}`;
  }

  function toggleExpandMsg(idx) {
    setExpandedMsg(prev => ({ ...prev, [idx]: !prev[idx] }));
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
          <HeaderAdmin title="Contact Form Submissions" onToggleSidebar={toggleSidebar} />
          <div className="submissions-content" style={{ background: '#0f1117', minHeight: '100vh' }}>
            <section className="submissions-section">
              <div className="submissions-header">
                <h2>Contact Form Submissions</h2>
                <p className="section-description">View and manage contact form messages from website visitors</p>
                <input
                  type="text"
                  placeholder="Search messages by name, email or subject"
                  className="submissions-simple-search"
                  value={messageSearch}
                  onChange={e => setMessageSearch(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
  <button
    className="send-email-btn"
    disabled={selectedEmails.length === 0}
    style={{
      background: selectedEmails.length === 0 ? '#888' : '#36d399',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '8px 20px',
      cursor: selectedEmails.length === 0 ? 'not-allowed' : 'pointer',
      fontWeight: 600,
      fontSize: 16,
      marginRight: 0
    }}
    onClick={() => setShowModal(true)}
  >
    Send Email
  </button>
  <button
    className="delete-btn"
    disabled={selectedEmails.length === 0}
    style={{
      background: selectedEmails.length === 0 ? '#888' : '#ff4444',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '8px 20px',
      cursor: selectedEmails.length === 0 ? 'not-allowed' : 'pointer',
      fontWeight: 600,
      fontSize: 16
    }}
    onClick={async () => {
      if (!window.confirm('Are you sure you want to delete the selected messages?')) return;
      for (const email of selectedEmails) {
        try {
          const msg = messages.find(m => m.email === email);
          if (msg && msg._id) {
            await fetch(`http://localhost:5000/api/messages/${msg._id}`, { method: 'DELETE' });
          }
        } catch (e) {
          alert('Failed to delete message for: ' + email);
        }
      }
      setMessages(messages.filter(m => !selectedEmails.includes(m.email)));
      setSelectedEmails([]);
      setSelectAll(false);
    }}
  >
    Delete
  </button>
  <span style={{ color: '#aaa', fontSize: 13 }}>
    {selectedEmails.length > 0 ? `${selectedEmails.length} selected` : 'Select emails to enable'}
  </span>
</div>
              <div className="table-container">
                <div style={{position: 'relative'}}>
                  {messagesLoading ? (
                    <div className="submissions-loading">Loading messages...</div>
                  ) : messagesError ? (
                    <div className="submissions-error">{messagesError}</div>
                  ) : (
                    <>
                      <table className="certificates-table">
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                checked={selectAll && filteredMessages.length > 0}
                                onChange={e => {
                                  setSelectAll(e.target.checked);
                                  setSelectedEmails(
                                    e.target.checked ? filteredMessages.map(m => m.email) : []
                                  );
                                }}
                              />
                            </th>
                            <th>Name</th>
                            <th className="email-cell">Email</th>
                            <th>Phone</th>
                            <th>Subject</th>
                            <th>Message</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMessages.length === 0 ? (
                            <tr><td colSpan={7} className="no-results">No messages found matching your filters.</td></tr>
                          ) : filteredMessages.map((msg, idx) => {
                            const isLong = msg.message && msg.message.length > 80;
                            const expanded = !!expandedMsg[idx];
                            return (
                              <tr key={msg._id || idx}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={selectedEmails.includes(msg.email)}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        setSelectedEmails(prev => [...prev, msg.email]);
                                      } else {
                                        setSelectedEmails(prev => prev.filter(email => email !== msg.email));
                                        setSelectAll(false);
                                      }
                                    }}
                                  />
                                </td>
                                <td>{msg.name}</td>
                                <td className="email-cell">{msg.email}</td>
                                <td>{msg.phone}</td>
                                <td>{msg.subject}</td>
                                <td>
                                  <div className="message-cell">
                                    {isLong ? (
                                      <>
                                        <div className="message-content">{expanded ? msg.message : msg.message.slice(0, 80) + '...'}</div>
                                        <button
                                          className="view-toggle-btn"
                                          onClick={() => toggleExpandMsg(idx)}
                                        >{expanded ? 'View less' : 'View more'}</button>
                                      </>
                                    ) : <div className="message-content">{msg.message}</div>}
                                  </div>
                                </td>
                                <td>{formatDate(msg.date)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      {/* Modal for sending email */}
      {showModal && (
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
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              style={{width:'100%',padding:'10px',borderRadius:4,border:'1px solid #333',marginBottom:8,fontSize:16}}
              placeholder="Email subject"
            />
            <label style={{display:'block',margin:'12px 0 8px 0',fontWeight:600}}>Message</label>
            <textarea
              value={emailMessage}
              onChange={e => setEmailMessage(e.target.value)}
              style={{width:'100%',minHeight:180,padding:'10px',borderRadius:4,border:'1px solid #333',fontSize:15}}
              placeholder="Email message (HTML supported)"
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
                  onChange={e => setAttachments(Array.from(e.target.files))}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            {attachments && attachments.length > 0 && (
              <div style={{marginBottom: 10, color:'#aaa', fontSize:14}}>
                {attachments.map((file, idx) => (
                  <div key={idx}>{file.name}</div>
                ))}
              </div>
            )}
            {sendResult && (
              <div style={{margin:'14px 0 0 0',color:sendResult.success ? '#36d399':'#ff4444'}}>
                {sendResult.message}
              </div>
            )}
            <div style={{marginTop:18,display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button
                style={{padding:'10px 22px',borderRadius:5,border:'none',background:'#888',color:'#fff',fontWeight:600,cursor:'pointer',fontSize:16}}
                onClick={() => {
                  setShowModal(false);
                  setEmailSubject('');
                  setEmailMessage('');
                  setSendResult(null);
                  setAttachments([]);
                }}
                disabled={sending}
              >Cancel</button>
              <button
                style={{padding:'10px 22px',borderRadius:5,border:'none',background:'#36d399',color:'#fff',fontWeight:600,cursor:sending?'not-allowed':'pointer',opacity:sending?0.7:1,fontSize:16}}
                disabled={sending || !emailSubject || !emailMessage}
                onClick={async () => {
                  setSending(true);
                  setSendResult(null);
                  try {
                    const formData = new FormData();
                    formData.append('subject', emailSubject);
                    formData.append('message', emailMessage);
                    selectedEmails.forEach(email => formData.append('emails[]', email));
                    if (attachments && attachments.length > 0) {
                      attachments.forEach(file => formData.append('attachments', file));
                    }
                    const res = await fetch('http://localhost:5000/api/emails/send-newsletter', {
                      method: 'POST',
                      body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                      setSendResult({success:true,message:'Email sent successfully!'});
                      setTimeout(()=>{
                        setShowModal(false);
                        setEmailSubject('');
                        setEmailMessage('');
                        setSendResult(null);
                        setAttachments([]);
                      }, 1800);
                    } else {
                      setSendResult({success:false,message:data.message||'Failed to send.'});
                    }
                  } catch (e) {
                    setSendResult({success:false,message:'Network or server error.'});
                  } finally {
                    setSending(false);
                  }
                }}
              >{sending ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
