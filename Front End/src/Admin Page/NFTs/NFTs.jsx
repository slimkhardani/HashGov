"use client"
import { useState } from "react"
import { useAuth } from "../../context/AuthContext.jsx"
import { FileCheck, User, ChevronDown, MoreHorizontal, Search } from "lucide-react"
import Header from "../Header/Header"
import Sidebar from "../Sidebar/Sidebar"
import "./NFTs.css"

export default function AdminNFTs() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('nfts')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { logout } = useAuth()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }
  
  const handleNavClick = (section) => {
    setActiveSection(section)
  }
  
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
  }
  
  const handleLogout = () => {
    logout()
  }

  // Sample NFT data
  const nfts = [
    {
      id: 'NFT-2025-001',
      name: 'Identity Verification',
      owner: 'John Doe',
      tokenId: '0.0.1234567',
      createdAt: 'May 11, 2025',
      status: 'active'
    },
    {
      id: 'NFT-2025-002',
      name: 'Certificate of Completion',
      owner: 'Alice Smith',
      tokenId: '0.0.1234568',
      createdAt: 'May 10, 2025',
      status: 'active'
    },
    {
      id: 'NFT-2025-003',
      name: 'Property Deed',
      owner: 'Robert Johnson',
      tokenId: '0.0.1234569',
      createdAt: 'May 9, 2025',
      status: 'pending'
    },
    {
      id: 'NFT-2025-004',
      name: 'Digital License',
      owner: 'Emma Wilson',
      tokenId: '0.0.1234570',
      createdAt: 'May 8, 2025',
      status: 'revoked'
    }
  ]

  return (
    <div className="admin-root">
      <div className="admin-dashboard">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          activeSection={activeSection} 
          onNavClick={handleNavClick} 
          onLogout={handleLogout} 
        />

        <main className="main-content" style={{ marginLeft: sidebarOpen ? '260px' : '80px' }}>
          <Header 
            sidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
            profileDropdownOpen={profileDropdownOpen}
            toggleProfileDropdown={toggleProfileDropdown}
            handleLogout={handleLogout}
          />

          {/* NFTs Management Content */}
          <div className="dashboard-content">
            <section className="admin-section">
              <div className="section-header">
                <h2>NFTs Management</h2>
                <div className="section-actions">
                  <div className="search-container">
                    <Search size={16} />
                    <input type="text" placeholder="Search NFTs..." className="search-input" />
                  </div>
                  <button className="action-button">
                    <FileCheck size={16} />
                    <span>Create NFT</span>
                  </button>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-header">
                  <h3>All NFTs</h3>
                  <div className="filter-button">
                    <span>Filter</span>
                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>NFT ID</th>
                        <th>Name</th>
                        <th>Owner</th>
                        <th>Token ID</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nfts.map((nft) => (
                        <tr key={nft.id}>
                          <td>{nft.id}</td>
                          <td>{nft.name}</td>
                          <td>{nft.owner}</td>
                          <td className="token-id">{nft.tokenId}</td>
                          <td>{nft.createdAt}</td>
                          <td>
                            <span className={`status-badge ${nft.status}`}>
                              {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <button className="action-icon-button">
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-pagination">
                  <span className="pagination-info">Showing 1 to 4 of 16 entries</span>
                  <div className="pagination-controls">
                    <button className="pagination-button" disabled>
                      Previous
                    </button>
                    <button className="pagination-button active">1</button>
                    <button className="pagination-button">2</button>
                    <button className="pagination-button">3</button>
                    <button className="pagination-button">Next</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
