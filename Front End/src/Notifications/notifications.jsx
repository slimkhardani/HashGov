"use client"
import React, { useState, useEffect, useRef } from "react";
import { io } from 'socket.io-client';
import Sidebar from "./../components/sidebar/sidebar";
import Header from "./../components/header/header";
import {
  Bell,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./notifications.css"

// Expandable notification message for NFT payment instructions
function ExpandableNotifMessage({ messageObj }) {
  const [expanded, setExpanded] = useState(false);
  const details = messageObj.details || {};

  return (
    <div className="expandable-notif-message">
      
      <div className="notif-content" style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{color:'#fff', fontWeight:'normal'}}>
          {messageObj.summary || <span style={{color:'#f44336'}}>No summary provided</span>}
        </span>
        {details && (
          <button className="view-more-btn" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'View Less' : 'View More'}
          </button>
        )}
      </div>
      {expanded && details && (
        <div className="notif-details">
          <div><b>Admin Wallet:</b> <span style={{userSelect:'all'}}>{details.adminWallet}</span></div>
          <div><b>Amount:</b> {details.amount}</div>
          <div><b>Memo:</b> <span style={{userSelect:'all'}}>{details.memo}</span></div>
          <div style={{marginTop:8}}><b>Steps:</b>
            <ul style={{paddingLeft: '20px', margin: 0}}>
              {Array.isArray(details.instructions) && details.instructions.map((step, idx) => (
                <li key={idx} style={{listStyleType: 'disc'}}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom confirmation modal component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, confirmColor }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-container" style={{
        backgroundColor: '#1a1d2d',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        padding: '24px',
        maxWidth: '450px',
        width: '100%',
        animation: 'modalFadeIn 0.3s ease'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          marginTop: 0,
          marginBottom: '16px'
        }}>{title}</h3>
        <p style={{
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '24px'
        }}>{message}</p>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {cancelText || 'Cancel'}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              backgroundColor: confirmColor || '#4763e4',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: '#4763e4'
  })
  
  // Get auth context for authentication
  const { user } = useAuth();

  // State for all notifications
  const [allNotifications, setAllNotifications] = useState([])
  
  // Socket.IO: Receive notifications in real time
  const socketRef = useRef(null);
  
  // Fetch notifications from backend and handle real-time updates
  useEffect(() => {
    if (!user || !user.email) return;
    setLoading(true);
    
    // First, fetch existing notifications from database
    fetch(`http://localhost:5000/api/notifications?email=${user.email}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.notifications)) {
          console.log('Received notifications:', data.notifications);
          // Format notifications to match expected structure
          const formattedNotifications = data.notifications.map(notification => {
            // Log the message type for debugging
            console.log('Notification message type:', typeof notification.message);
            console.log('Notification message:', notification.message);
            
            // Ensure message is processed correctly (parse if it's a stringified object)
            let processedMessage = notification.message;
            if (typeof processedMessage === 'string') {
              try {
                // Try to parse if it's a stringified JSON
                if (processedMessage.trim().startsWith('{') && processedMessage.trim().endsWith('}')) {
                  processedMessage = JSON.parse(processedMessage);
                }
              } catch (err) {
                console.log('Not a parsable JSON string, keeping as is');
              }
            }
            
            return {
              id: notification._id,
              title: notification.status === 'approved' ? 'Request Approved' : 'Request Rejected',
              message: processedMessage,
              type: notification.type || 'profile',
              status: notification.read ? 'read' : 'unread',
              date: notification.timestamp || new Date().toISOString(),
            };
          });
          setAllNotifications(formattedNotifications);
        }
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      })
      .finally(() => setLoading(false));
    
    // Connect to socket server for real-time notifications
    socketRef.current = io('http://localhost:5000');
    
    // Register user by email
    socketRef.current.emit('register', user.email);
    
    // Listen for new notifications in real-time
    socketRef.current.on('receive_notification', (notification) => {
      console.log('Received real-time notification:', notification);
      // Check if notification is already in the list to prevent duplicates
      // We use the id from MongoDB (_id) to identify unique notifications
      setAllNotifications(prev => {
        // If notification already exists with this ID, don't add again
        if (notification.id && prev.some(item => item.id === notification.id)) {
          return prev;
        }
        
        // Ensure message is processed correctly (parse if it's a stringified object)
        let processedMessage = notification.message;
        console.log('Real-time notification message type:', typeof processedMessage);
        console.log('Real-time notification message:', processedMessage);
        
        if (typeof processedMessage === 'string') {
          try {
            // Try to parse if it's a stringified JSON
            if (processedMessage.trim().startsWith('{') && processedMessage.trim().endsWith('}')) {
              processedMessage = JSON.parse(processedMessage);
            }
          } catch (err) {
            console.log('Real-time: Not a parsable JSON string, keeping as is');
          }
        }
        
        // Add new notification
        return [
          {
            id: notification.id || notification._id || `notif-${Date.now()}`,
            title: notification.status === 'approved' ? 'Request Approved' : 'Request Rejected',
            message: processedMessage,
            type: notification.type || 'profile',
            status: 'unread',
            date: notification.timestamp || new Date().toISOString(),
          },
          ...prev,
        ];
      });
    });
    
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Format date to display in a readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric", month: "short", year: "numeric"
    });
  };
  
  // Format time to display in a readable format
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit"
    });
  };

  // Function to get notification type icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "welcome":
        return <Bell size={16} className="notif-icon welcome" />;
      case "security":
        return <AlertCircle size={16} className="notif-icon security" />;
      case "transaction":
        return <CheckCircle2 size={16} className="notif-icon transaction" />;
      case "profile":
        return <CheckCircle2 size={16} className="notif-icon profile" />;
      default:
        return <Bell size={16} className="notif-icon" />;
    }
  };
  
  // Function to get notification status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "read":
        return "status-badge read";
      case "unread":
        return "status-badge unread";
      default:
        return "status-badge";
    }
  };
  
  // Function to filter notifications based on search query and filters
  const filteredNotifications = allNotifications.filter((notification) => {
    // Filter by search query
    let messageText = '';
    if (typeof notification.message === 'string') {
      messageText = notification.message;
    } else if (notification.message && typeof notification.message === 'object') {
      // Try to use a summary, details, or fallback to JSON string
      messageText = notification.message.summary || JSON.stringify(notification.message);
    }
    const matchesSearch = 
      searchQuery === "" || 
      (notification.title && typeof notification.title === 'string' && notification.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof messageText === 'string' && messageText.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by type
    const matchesType = 
      typeFilter === "all"
        ? true
        : notification.type && notification.type.toLowerCase() === typeFilter.toLowerCase();
    
    // Filter by status
    const matchesStatus = 
      statusFilter === "all" || 
      notification.status === statusFilter;
    
    // Filter by date (basic implementation - would be expanded in production)
    const notifDate = new Date(notification.date);
    const now = new Date();
    const oneDayAgo = new Date(now.setDate(now.getDate() - 1));
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
    
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = notifDate >= oneDayAgo;
    } else if (dateFilter === "week") {
      matchesDate = notifDate >= oneWeekAgo;
    } else if (dateFilter === "month") {
      matchesDate = notifDate >= oneMonthAgo;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });
  
  // Function to clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };
  
  // Function to mark notification as read (persist to backend)
  const markAsRead = (id) => {
    fetch(`http://localhost:5000/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllNotifications(prev =>
            prev.map(notif =>
              notif.id === id ? { ...notif, status: "read" } : notif
            )
          );
        }
      });
  };

  // Function to delete notification
  const handleDeleteNotification = (id) => {
    // Configure and show confirmation modal
    setConfirmModalConfig({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: '#f44336',
      onConfirm: () => {
        setShowConfirmModal(false);
        fetch(`http://localhost:5000/api/notifications/${id}`, {
          method: 'DELETE'
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setAllNotifications(prev => prev.filter(notif => notif.id !== id));
            }
          });
      }
    });
    setShowConfirmModal(true);
  }

  // Function to mark notification as unread (persist to backend)
  const markAsUnread = (id) => {
    fetch(`http://localhost:5000/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: false })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllNotifications(prev =>
            prev.map(notif =>
              notif.id === id ? { ...notif, status: "unread" } : notif
            )
          );
        }
      });
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    if (allNotifications.length === 0 || !user || !user.email) return;
    
    // Configure and show confirmation modal
    setConfirmModalConfig({
      title: 'Mark All as Read',
      message: 'Are you sure you want to mark all notifications as read?',
      confirmText: 'Mark All as Read',
      cancelText: 'Cancel',
      confirmColor: '#4763e4',
      onConfirm: () => {
        setShowConfirmModal(false);
        setProcessingAction(true);
        
        fetch(`http://localhost:5000/api/notifications/mark-all-read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setAllNotifications(prev =>
                prev.map(notif => ({
                  ...notif,
                  status: "read"
                }))
              );
            }
          })
          .catch(error => {
            console.error('Error marking all notifications as read:', error);
            alert('Failed to mark all notifications as read');
          })
          .finally(() => setProcessingAction(false));
      }
    });
    setShowConfirmModal(true);
  };

  // Function to empty inbox (delete all notifications)
  const emptyInbox = () => {
    if (allNotifications.length === 0 || !user || !user.email) return;
    
    // Configure and show confirmation modal
    setConfirmModalConfig({
      title: 'Empty Inbox',
      message: 'Are you sure you want to delete all notifications? This action cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      confirmColor: '#f44336',
      onConfirm: () => {
        setShowConfirmModal(false);
        setProcessingAction(true);
        
        fetch(`http://localhost:5000/api/notifications/empty-inbox`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setAllNotifications([]);
            }
          })
          .catch(error => {
            console.error('Error emptying inbox:', error);
            alert('Failed to empty inbox');
          })
          .finally(() => setProcessingAction(false));
      }
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="notifications-page-wrapper">
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        {...confirmModalConfig}
      />
      
      <div className="notifications-dashboard">
        {/* Sidebar component */}
        <Sidebar 
          activePage="notifications" 
          onToggle={toggleSidebar} 
          isOpen={sidebarOpen} 
        />
        
        {/* Main content area */}
        <div className={`notifications-main-content ${!sidebarOpen ? "notifications-sidebar-closed" : ""}`}>
          {/* Header component */}
          <Header 
            title="Notifications" 
            onToggleSidebar={toggleSidebar} 
            showToggle={true}
          />
          
          {/* Dashboard content */}
          <div className="notifications-dashboard-content">
            {/* Search and filters */}
            <div className="search-filter-container">
              <div className="search-container">
                <input
  type="text"
  className="notif-search-input"
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
              </div>
              
              <button 
                className={`filter-button ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                <span>Filter</span>
                {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            
            {/* Filter options */}
            {showFilters && (
              <div className="filter-options">
                <div className="filter-group">
  <label>Type</label>
<select 
  value={typeFilter} 
  onChange={(e) => setTypeFilter(e.target.value)}
>
  <option value="all">All</option>
  <option value="Profile_update">Profile_update</option>
  <option value="Certificate">Certificate</option>
</select>
</div>
<div className="filter-group">
  <label>Status</label>
  <select 
    value={statusFilter} 
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All Status</option>
    <option value="read">Read</option>
    <option value="unread">Unread</option>
  </select>
</div>
                
                <div className="filter-group">
                  <label>Date</label>
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                  </select>
                </div>
                
                <button className="clear-filters" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
            
            {/* Bulk action buttons */}
            {!loading && !error && filteredNotifications.length > 0 && (
              <div className="bulk-actions-container" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <button 
                  className="send-style-button" 
                  onClick={markAllAsRead}
                  disabled={processingAction || filteredNotifications.every(n => n.status === 'read')}
                  style={{
                    background: 'linear-gradient(90deg, #4763e4 0%, #00d4ff 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    opacity: processingAction || filteredNotifications.every(n => n.status === 'read') ? 0.7 : 1
                  }}
                >
                  <span>Mark All as Read</span>
                </button>
                <button 
                  className="withdraw-style-button" 
                  onClick={emptyInbox}
                  disabled={processingAction}
                  style={{
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    color: '#f44336',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    opacity: processingAction ? 0.7 : 1
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.1)'}
                >
                  <span>Empty Inbox</span>
                </button>
              </div>
            )}
            
            {/* Notifications list */}
            <div className="notifications-list-container">
              {loading ? (
                <div className="loading-state">Loading notifications...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="empty-state">
                  <Bell size={40} />
                  <h3>No notifications found</h3>
                  <p>You don't have any notifications matching your criteria</p>
                </div>
              ) : (
                <>
                  {/* Notifications table header */}
                  <div className="notifications-list-header">
                    <div className="notif-column notif-type">Type</div>
                    <div className="notif-column notif-message">Message</div>
                    <div className="notif-column notif-status">Status</div>
                    <div className="notif-column notif-date">Date</div>
                    <div className="notif-column notif-time">Time</div>
                    <div className="notif-column notif-actions">Actions</div>
                  </div>
                  
                  {/* Notifications rows */}
                  <div className="notifications-list">
                    {filteredNotifications.map((notification) => (
                      <React.Fragment key={notification.id}>
                        <div className="notification-row">
                          <div className="notif-cell notif-type">
                            {getNotificationIcon(notification.type)}
                            <span>{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</span>
                          </div>
                          <div className="notif-cell notif-message">
                            <div className="notif-title">{notification.title}</div>
                            
                            {typeof notification.message === 'object' && notification.message !== null ? (
                              <ExpandableNotifMessage messageObj={notification.message} />
                            ) : (
                              <div className="notif-content">{notification.message}</div>
                            )}
                          </div>
                          <div className="notif-cell notif-status">
                            <span className={getStatusBadgeClass(notification.status)}>
                              {notification.status === "read" ? (
                                <><CheckCircle2 size={14} /><span>Read</span></>
                              ) : (
                                <><Clock size={14} /><span>Unread</span></>
                              )}
                            </span>
                          </div>
                          <div className="notif-cell notif-date">
                            {formatDate(notification.date)}
                          </div>
                          <div className="notif-cell notif-time">
                            {formatTime(notification.date)}
                          </div>
                          <div className="notif-cell notif-actions" style={{display:'flex',gap:'10px'}}>
                            {notification.status === "unread" ? (
                              <button 
                                className="mark-read-btn"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as Read
                              </button>
                            ) : (
                              <button
                                className="mark-read-btn"
                                onClick={() => markAsUnread(notification.id)}
                              >
                                Mark as Unread
                              </button>
                            )}
                            <button
                              className="mark-read-btn"
                              style={{color:'#f44336',borderColor:'#f44336'}}
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}