"use client"
import React, { useState, useEffect } from "react"
import {
  Zap,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Bell,
  MoreHorizontal,
  Users,
  CreditCard,
  ChevronDown
} from "lucide-react"
import SidebarAdmin from "../SidebarAdmin/SidebarAdmin"
import HeaderAdmin from "../HeaderAdmin/HeaderAdmin"
import "./Dashboard.css"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import RecentSubscribers from './RecentSubscribers';
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900)
  const [activeSection, setActiveSection] = useState("dashboard")

  // Dashboard stats states
  const [totalUsers, setTotalUsers] = useState(0)
  const [adminBalance, setAdminBalance] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [totalNFTs, setTotalNFTs] = useState(0)
  const [loading, setLoading] = useState(true)

  // For the 7-day transaction chart
  const [transactions7Days, setTransactions7Days] = useState([])

  // For the NFT type distribution pie chart
  const [nftTypeDistribution, setNftTypeDistribution] = useState(null)
  useEffect(() => {
    fetch('/api/nft/type-distribution')
      .then(res => res.json())
      .then(data => setNftTypeDistribution(data))
      .catch(() => setNftTypeDistribution(null));
  }, []);

  const pieData = nftTypeDistribution
    ? [
        { name: 'Academic Certificate', value: nftTypeDistribution.Certificate || 0 },
        { name: 'Real Estate', value: nftTypeDistribution.realEstate || 0 },
        { name: 'Car', value: nftTypeDistribution.car || 0 },
        { name: 'Motorcycle', value: nftTypeDistribution.motorcycle || 0 },
      ]
    : [];
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    // Fetch all dashboard stats
    const fetchDashboardStats = async () => {
      try {
        // 1. Users
        const usersRes = await fetch('/api/admin/users')
        const usersData = await usersRes.json()
        console.log('Users Data:', usersData)
        setTotalUsers(usersData.length)

        // 2. Admin Wallet (for balance & accountId)
        const adminWalletRes = await fetch('/api/wallet/my-wallet', { credentials: 'include' })
        const adminWalletData = await adminWalletRes.json()
        console.log('Admin Wallet Data:', adminWalletData)
        if (adminWalletData.wallet) {
          setAdminBalance(adminWalletData.wallet.balance || 0)
        } else {
          setAdminBalance(0)
        }

        // 2b. Fetch all transactions for dashboard total & 7-day chart
        try {
          const txRes = await fetch('/api/admin/transactions', { credentials: 'include' })
          const txData = await txRes.json()
          console.log('All Transactions:', txData)
          setTotalTransactions(Array.isArray(txData.transactions) ? txData.transactions.length : 0)

          // --- 7-day chart logic ---
          const allTx = Array.isArray(txData.transactions) ? txData.transactions : [];
          // Get today and 6 previous days
          const today = new Date();
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push(d.toISOString().slice(0, 10)); // 'YYYY-MM-DD'
          }
          // Count per day
          const txCountPerDay = days.map(dateStr => {
            const count = allTx.filter(tx => {
              const txDate = new Date(tx.timestamp).toISOString().slice(0, 10);
              return txDate === dateStr;
            }).length;
            return { date: dateStr, count };
          });
          setTransactions7Days(txCountPerDay);
        } catch (err) {
          console.error('Error fetching all transactions:', err)
          setTotalTransactions(0)
          setTransactions7Days([])
        }

        // 3. NFTs
        try {
          const nftsRes = await fetch('/api/nft/info', { credentials: 'include' })
          const nftsData = await nftsRes.json()
          console.log('NFTs Data:', nftsData)
          setTotalNFTs(typeof nftsData.count === 'number' ? nftsData.count : (Array.isArray(nftsData.data) ? nftsData.data.length : 0))
        } catch (err) {
          console.error('Error fetching NFTs:', err)
          setTotalNFTs(0)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        // Optionally handle errors
        setTotalUsers(0)
        setAdminBalance(0)
        setTotalTransactions(0)
        setTotalNFTs(0)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardStats()
  }, [])

  

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

  const handleSectionChange = (section) => {
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

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard">
        {/* Sidebar Component */}
        <SidebarAdmin 
          sidebarOpen={sidebarOpen} 
          activeSection={activeSection}
          onNavClick={handleSectionChange}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className={`main-content ${sidebarOpen ? "" : "sidebar-closed"}`}>
          <HeaderAdmin title="Dashboard" onToggleSidebar={toggleSidebar} />
          <div className="dashboard-main">
            <div className="dashboard-content">

              {/* Stats Overview */}
          <section className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-title">Total Users</div>
                <div className="stat-value-s">{loading ? '...' : totalUsers.toLocaleString()}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Wallet size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-title">Total Revenue</div>
                <div className="stat-value-s">{loading ? '...' : `${adminBalance} HBAR`}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CreditCard size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-title">Transactions</div>
                <div className="stat-value-s">{loading ? '...' : totalTransactions.toLocaleString()}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-title">Total NFT Certificates</div>
                <div className="stat-value-s">{loading ? '...' : totalNFTs.toLocaleString()}</div>
                
              </div>
            </div>
          </section>

          {/* 7-day Transaction Activity Chart */}
          <section className="chart-section">
            <div className="section-header-a">
              <h2>Number of transactions made the past 7 days</h2>
            </div>
            <div className="chart-wrapper" style={{width: '100%', height: 300}}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactions7Days} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#26e6ff" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#0057ff" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" tick={{fill: '#c3c3c3', fontSize: 13}} />
                  <YAxis tick={{fill: '#c3c3c3'}} allowDecimals={false}/>
                  <Tooltip contentStyle={{background:'#23263a', border:'none'}} labelStyle={{color:'#26e6ff'}}/>
                  <Bar dataKey="count" fill="url(#colorTx)" barSize={36} radius={[8,8,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* NFT Type Distribution Pie Chart */}
           <section className="dashboard-row-grid">
              {/* NFT Type Distribution */}
              <div className="dashboard-grid-box">
                <h2 className="nft-title">NFT Type Distribution</h2>
                <div className="chart-wrapper" style={{width: '100%', height: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        stroke="none"
                        isAnimationActive={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="custom-pie-legend">
                    {pieData.map((entry, idx) => {
                      const total = pieData.reduce((sum, item) => sum + item.value, 0);
                      const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                      return (
                        <div className="legend-row" key={entry.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                          <span className="legend-dot" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length], width: 16, height: 16, borderRadius: '50%', display: 'inline-block', marginRight: 8 }}></span>
                          <span className="legend-label" style={{ color: '#f5f5f7', fontWeight: 500, marginRight: 8 }}>{entry.name}</span>
                          <span className="legend-percent" style={{ color: '#a0a0a0' }}>{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Recent Subscribers Box */}
              <div className="dashboard-grid-box">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                  <h2 style={{fontSize:'1.35rem',color:'#fff',margin:0}}>Recent Subscribers</h2>
                  <Link to="/admin/submissions/newsletter-subscribers" style={{color:'#3e88f6',fontWeight:600,fontSize:'1.1rem',textDecoration:'none'}}>View More</Link>
                </div>
                <div style={{fontSize:'1.18rem'}}>
                  <RecentSubscribers />
                </div>
              </div>

            </section>


          
            </div> {/* dashboard-content */}
          </div> {/* dashboard-main */}
        </main>
      </div>
    </div>
  )
}

