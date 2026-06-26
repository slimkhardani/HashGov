"use client"
import React, { useState, useEffect } from "react"
import { Search } from "lucide-react"
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin"
import HeaderAdmin from "../HeaderAdmin/HeaderAdmin"
import "./UserSubmission.css"

// Helper for formatting date as "Month Day, Year - HH:mm"
function formatDate(dateString) {
  if (!dateString) return "-"
  const date = new Date(dateString)
  if (isNaN(date)) return "-"
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  const datePart = date.toLocaleDateString('en-US', options)
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  return `${datePart} - ${hours}:${mins}`
}

export default function AdminUserSubmission() {
  // SECTION 3: Profile Update Requests state
  const [updateRequests, setUpdateRequests] = useState([])
  const [updateRequestsLoading, setUpdateRequestsLoading] = useState(false)
  const [updateRequestsError, setUpdateRequestsError] = useState("")

  useEffect(() => {
    setUpdateRequestsLoading(true)
    fetch("http://localhost:5000/api/update-requests")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch update requests")
        return res.json()
      })
      .then(data => {
        if (data.success && Array.isArray(data.updateRequests)) {
          setUpdateRequests((data.updateRequests || []).sort((a, b) => (b._id > a._id ? 1 : -1)))
          setUpdateRequestsError("")
        } else {
          setUpdateRequests([])
          setUpdateRequestsError("No update requests found")
        }
      })
      .catch(e => setUpdateRequestsError(e.message))
      .finally(() => setUpdateRequestsLoading(false))
  }, [])

  function handleUpdateRequestAction(id, status) {
    // Optionally, add optimistic UI update here
    fetch(`http://localhost:5000/api/update-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update request status")
        return res.json()
      })
      .then(data => {
        if (data.success && data.updateRequest) {
          setUpdateRequests(prev => prev.map(r => r._id === id ? { ...r, status: data.updateRequest.status } : r))
        } else {
          throw new Error("Failed to update request status")
        }
      })
      .catch(e => alert(e.message))
  }

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900)
  const [activeSection, setActiveSection] = useState('submissions')

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }
  
  const handleNavClick = (section) => {
    setActiveSection(section)
  }
  
  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.href = "/login"
  }

  // SECTION 1: Newsletter Subscribers state
  const [subscribers, setSubscribers] = useState([])
  const [subscribersLoading, setSubscribersLoading] = useState(false)
  const [subscribersError, setSubscribersError] = useState("")
  const [subscriberSearch, setSubscriberSearch] = useState("")
  const [copySuccess, setCopySuccess] = useState(false);

  // SECTION 2: Contact Form Submissions state
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState("")
  const [expandedMsg, setExpandedMsg] = useState({})
  const [messageSearch, setMessageSearch] = useState("")

  // Fetch newsletter subscribers
  useEffect(() => {
    setSubscribersLoading(true)
    fetch("http://localhost:5000/api/emails")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch subscribers")
        return res.json()
      })
      .then(data => {
        // Sort descending by subscriptionDate
        setSubscribers((data || []).sort((a, b) => new Date(b.subscriptionDate) - new Date(a.subscriptionDate)))
        setSubscribersError("")
      })
      .catch(e => setSubscribersError(e.message))
      .finally(() => setSubscribersLoading(false))
  }, [])

  // Fetch contact form messages
  useEffect(() => {
    setMessagesLoading(true)
    fetch("http://localhost:5000/api/messages")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch messages")
        return res.json()
      })
      .then(data => {
        // Sort descending by date
        setMessages((data || []).sort((a, b) => new Date(b.date) - new Date(a.date)))
        setMessagesError("")
      })
      .catch(e => setMessagesError(e.message))
      .finally(() => setMessagesLoading(false))
  }, [])

  // Filtered subscribers by email
  const filteredSubscribers = subscribers.filter(s =>
    s.email && s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  )

  // Filtered messages by search
  const filteredMessages = messages.filter(msg => {
    // Search filter
    if (messageSearch) {
      const search = messageSearch.toLowerCase()
      return (
        (msg.name && msg.name.toLowerCase().includes(search)) ||
        (msg.email && msg.email.toLowerCase().includes(search)) ||
        (msg.subject && msg.subject.toLowerCase().includes(search)) ||
        (msg.message && msg.message.toLowerCase().includes(search))
      )
    }
    return true
  })
  return (
    <div className="admin-submissions-wrapper">
      <div className="admin-submissions-dashboard">
        <SidebarAdmin 
          sidebarOpen={sidebarOpen} 
          activeSection={activeSection}
          onNavClick={handleNavClick}
          onLogout={handleLogout}
        />
        <main className={`submissions-main-content ${sidebarOpen ? "" : "sidebar-closed"}`}>
          <HeaderAdmin title="User Submissions" onToggleSidebar={toggleSidebar} />
          <div className="submissions-content">
            <div style={{padding: '40px', textAlign: 'center', color: '#9ba3af', fontSize: '1.3rem'}}>
              Please select a subsection from the sidebar to view User Submission data.
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
