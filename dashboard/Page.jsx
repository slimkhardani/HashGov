"use client"
import { useState } from "react"
import {
  BarChart3,
  Users,
  CreditCard,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Zap,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Download,
  Calendar,
} from "lucide-react"
import "./admin.css"

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">H</div>
            <span className="logo-text">HashGov</span>
          </div>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item active">
              <a href="#" className="nav-link">
                <BarChart3 size={20} />
                <span>Dashboard</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <Users size={20} />
                <span>Users</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <CreditCard size={20} />
                <span>Transactions</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <Activity size={20} />
                <span>Analytics</span>
              </a>
            </li>
          </ul>

          <div className="nav-divider"></div>

          <ul className="nav-list">
            <li className="nav-item">
              <a href="#" className="nav-link">
                <Settings size={20} />
                <span>Settings</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">
                <HelpCircle size={20} />
                <span>Help</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link logout">
                <LogOut size={20} />
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">JD</div>
            <div className="user-info">
              <div className="user-name">John Doe</div>
              <div className="user-role">Administrator</div>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="menu-button" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1>Dashboard</h1>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>

            <div className="notifications">
              <button className="notification-button">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>
            </div>

            <div className="user-profile-mini">
              <div className="avatar">JD</div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Stats Overview */}
          <section className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-title">Total Users</div>
                <div className="stat-value">24,521</div>
                <div className="stat-change positive">
                  <ArrowUpRight size={14} />
                  <span>12.5%</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Wallet size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-title">Total Revenue</div>
                <div className="stat-value">$845,271</div>
                <div className="stat-change positive">
                  <ArrowUpRight size={14} />
                  <span>8.2%</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CreditCard size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-title">Transactions</div>
                <div className="stat-value">42,973</div>
                <div className="stat-change negative">
                  <ArrowDownRight size={14} />
                  <span>3.1%</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-title">Active Nodes</div>
                <div className="stat-value">1,248</div>
                <div className="stat-change positive">
                  <ArrowUpRight size={14} />
                  <span>5.7%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <section className="charts-section">
            <div className="chart-container large">
              <div className="chart-header">
                <h2>Network Activity</h2>
                <div className="chart-actions">
                  <button className="chart-action-btn">
                    <Calendar size={16} />
                    <span>Last 30 days</span>
                    <ChevronDown size={16} />
                  </button>
                  <button className="chart-action-btn icon-only">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
              <div className="chart-content">
                <div className="line-chart">
                  <div className="chart-y-axis">
                    <div className="axis-label">10k</div>
                    <div className="axis-label">8k</div>
                    <div className="axis-label">6k</div>
                    <div className="axis-label">4k</div>
                    <div className="axis-label">2k</div>
                    <div className="axis-label">0</div>
                  </div>
                  <div className="chart-visualization">
                    <div className="chart-bars">
                      <div className="chart-bar" style={{ height: "30%" }}></div>
                      <div className="chart-bar" style={{ height: "45%" }}></div>
                      <div className="chart-bar" style={{ height: "60%" }}></div>
                      <div className="chart-bar" style={{ height: "40%" }}></div>
                      <div className="chart-bar" style={{ height: "55%" }}></div>
                      <div className="chart-bar" style={{ height: "75%" }}></div>
                      <div className="chart-bar" style={{ height: "65%" }}></div>
                      <div className="chart-bar" style={{ height: "80%" }}></div>
                      <div className="chart-bar" style={{ height: "70%" }}></div>
                      <div className="chart-bar" style={{ height: "90%" }}></div>
                      <div className="chart-bar" style={{ height: "85%" }}></div>
                      <div className="chart-bar" style={{ height: "95%" }}></div>
                    </div>
                    <div className="chart-line"></div>
                  </div>
                  <div className="chart-x-axis">
                    <div className="axis-label">Jan</div>
                    <div className="axis-label">Feb</div>
                    <div className="axis-label">Mar</div>
                    <div className="axis-label">Apr</div>
                    <div className="axis-label">May</div>
                    <div className="axis-label">Jun</div>
                    <div className="axis-label">Jul</div>
                    <div className="axis-label">Aug</div>
                    <div className="axis-label">Sep</div>
                    <div className="axis-label">Oct</div>
                    <div className="axis-label">Nov</div>
                    <div className="axis-label">Dec</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-container">
                <div className="chart-header">
                  <h2>User Distribution</h2>
                  <div className="chart-actions">
                    <button className="chart-action-btn icon-only">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
                <div className="chart-content">
                  <div className="pie-chart">
                    <div className="pie-segment segment1"></div>
                    <div className="pie-segment segment2"></div>
                    <div className="pie-segment segment3"></div>
                    <div className="pie-segment segment4"></div>
                    <div className="pie-center"></div>
                  </div>
                  <div className="pie-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: "var(--primary)" }}></div>
                      <div className="legend-label">Enterprise (42%)</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: "var(--accent)" }}></div>
                      <div className="legend-label">Individual (28%)</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: "#6c7fff" }}></div>
                      <div className="legend-label">Government (18%)</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: "#3a4fc8" }}></div>
                      <div className="legend-label">Other (12%)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-header">
                  <h2>Transaction Types</h2>
                  <div className="chart-actions">
                    <button className="chart-action-btn icon-only">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
                <div className="chart-content">
                  <div className="horizontal-bar-chart">
                    <div className="h-bar-item">
                      <div className="h-bar-label">Token Transfer</div>
                      <div className="h-bar-track">
                        <div className="h-bar-fill" style={{ width: "85%" }}></div>
                      </div>
                      <div className="h-bar-value">85%</div>
                    </div>
                    <div className="h-bar-item">
                      <div className="h-bar-label">Smart Contract</div>
                      <div className="h-bar-track">
                        <div className="h-bar-fill" style={{ width: "65%" }}></div>
                      </div>
                      <div className="h-bar-value">65%</div>
                    </div>
                    <div className="h-bar-item">
                      <div className="h-bar-label">NFT Minting</div>
                      <div className="h-bar-track">
                        <div className="h-bar-fill" style={{ width: "45%" }}></div>
                      </div>
                      <div className="h-bar-value">45%</div>
                    </div>
                    <div className="h-bar-item">
                      <div className="h-bar-label">Consensus</div>
                      <div className="h-bar-track">
                        <div className="h-bar-fill" style={{ width: "35%" }}></div>
                      </div>
                      <div className="h-bar-value">35%</div>
                    </div>
                    <div className="h-bar-item">
                      <div className="h-bar-label">File Storage</div>
                      <div className="h-bar-track">
                        <div className="h-bar-fill" style={{ width: "25%" }}></div>
                      </div>
                      <div className="h-bar-value">25%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="transactions-section">
            <div className="section-header">
              <h2>Recent Transactions</h2>
              <div className="section-actions">
                <button className="action-button">
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
                <button className="action-button">
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Type</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="tx-id">0x7f9e8d...</td>
                    <td>
                      <span className="tx-type token">Token Transfer</span>
                    </td>
                    <td className="user-cell">
                      <div className="user-avatar small">JD</div>
                      <span>John Doe</span>
                    </td>
                    <td className="amount">$1,250.00</td>
                    <td>
                      <span className="status completed">Completed</span>
                    </td>
                    <td>Mar 20, 2025</td>
                    <td>
                      <button className="table-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="tx-id">0x3a5b2c...</td>
                    <td>
                      <span className="tx-type contract">Smart Contract</span>
                    </td>
                    <td className="user-cell">
                      <div className="user-avatar small">AS</div>
                      <span>Alice Smith</span>
                    </td>
                    <td className="amount">$850.75</td>
                    <td>
                      <span className="status completed">Completed</span>
                    </td>
                    <td>Mar 19, 2025</td>
                    <td>
                      <button className="table-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="tx-id">0x9c4d2e...</td>
                    <td>
                      <span className="tx-type nft">NFT Minting</span>
                    </td>
                    <td className="user-cell">
                      <div className="user-avatar small">RJ</div>
                      <span>Robert Johnson</span>
                    </td>
                    <td className="amount">$3,420.00</td>
                    <td>
                      <span className="status pending">Pending</span>
                    </td>
                    <td>Mar 19, 2025</td>
                    <td>
                      <button className="table-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="tx-id">0x5e8f1a...</td>
                    <td>
                      <span className="tx-type token">Token Transfer</span>
                    </td>
                    <td className="user-cell">
                      <div className="user-avatar small">EW</div>
                      <span>Emma Wilson</span>
                    </td>
                    <td className="amount">$720.50</td>
                    <td>
                      <span className="status completed">Completed</span>
                    </td>
                    <td>Mar 18, 2025</td>
                    <td>
                      <button className="table-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="tx-id">0x2b7d9c...</td>
                    <td>
                      <span className="tx-type consensus">Consensus</span>
                    </td>
                    <td className="user-cell">
                      <div className="user-avatar small">MB</div>
                      <span>Michael Brown</span>
                    </td>
                    <td className="amount">$1,875.25</td>
                    <td>
                      <span className="status failed">Failed</span>
                    </td>
                    <td>Mar 18, 2025</td>
                    <td>
                      <button className="table-action">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="table-pagination">
              <span className="pagination-info">Showing 1 to 5 of 42 entries</span>
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
          </section>

          {/* Activity Timeline */}
          <section className="activity-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <button className="view-all-button">View All</button>
            </div>

            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-icon user-activity">
                  <Users size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>New User Registered</h4>
                    <span className="timeline-time">2 hours ago</span>
                  </div>
                  <p>Emma Wilson has registered a new account</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon transaction-activity">
                  <CreditCard size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>Large Transaction Detected</h4>
                    <span className="timeline-time">5 hours ago</span>
                  </div>
                  <p>Transaction of $15,000 was processed by Robert Johnson</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon system-activity">
                  <Zap size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>System Update Completed</h4>
                    <span className="timeline-time">1 day ago</span>
                  </div>
                  <p>The system has been updated to version 2.4.0</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon alert-activity">
                  <Bell size={16} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>Security Alert</h4>
                    <span className="timeline-time">2 days ago</span>
                  </div>
                  <p>Unusual login attempt detected from IP 192.168.1.1</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

