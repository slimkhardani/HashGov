import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SidebarAdmin from '../SidebarAdmin/SidebarAdmin';
import HeaderAdmin from '../HeaderAdmin/HeaderAdmin';
import {
  Search,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import './TransactionsHistory.css';

const API_URL = 'http://localhost:5000/api';

const TransactionsHistory = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    timeframe: 'all',
    amount: 'all'
  });

  // Get admin cookie-based token using the same approach as other admin pages
  // Extract token from cookies directly as it's expected by the cookieAuth middleware
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };
  
  const adminToken = getCookie('token');
  console.log('DEBUG: admin token value on page load:', adminToken);

  // Handle window resize for responsive sidebar
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

  // Fetch all transactions
  const fetchTransactions = useCallback(async () => {
    if (!adminToken) {
      setError('Authentication error: Please log in as admin');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the authenticated cookie approach rather than Bearer token
      // The server is expecting cookies to be sent automatically with the request
      const response = await axios.get(`${API_URL}/admin/transactions`, {
        withCredentials: true // This ensures cookies are sent with the request
      });
      
      console.log('All transactions:', response.data.transactions);
      setTransactions(response.data.transactions || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transactions');
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 900);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Debug transaction data structure
  useEffect(() => {
    if (transactions.length > 0) {
      console.log('Sample transaction data structure:', transactions[0]);
    }
  }, [transactions]);

  // Debug active filters
  useEffect(() => {
    console.log('Current filter settings:', filters);
  }, [filters]);

  // Filter and search transactions
  const filteredTransactions = transactions.filter(tx => {
    // Search query filtering
    const searchFields = [
      tx.accountId || '',
      tx.transactionId || '',
      tx.type || '',
      tx.counterpartyId || '',
      tx.userEmail || '',
      tx.status || ''
    ];
    
    const matchesSearch = searchQuery === '' || 
      searchFields.some(field => 
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Type filter - make case-insensitive
    const txType = (tx.type || '').toLowerCase();
    const filterType = filters.type.toLowerCase();
    const matchesType = filters.type === 'all' || txType === filterType;
    
    // Timeframe filter
    let matchesTimeframe = true;
    if (filters.timeframe !== 'all' && tx.timestamp) {
      const txDate = new Date(tx.timestamp);
      const now = new Date();
      
      switch (filters.timeframe) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          matchesTimeframe = txDate >= today;
          break;
        case 'week':
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          matchesTimeframe = txDate >= lastWeek;
          break;
        case 'month':
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          matchesTimeframe = txDate >= lastMonth;
          break;
        case 'year':
          const lastYear = new Date();
          lastYear.setFullYear(now.getFullYear() - 1);
          matchesTimeframe = txDate >= lastYear;
          break;
        default:
          matchesTimeframe = true;
      }
    }
    
    // Amount filter
    let matchesAmount = true;
    const amount = parseFloat(tx.amount) || 0;
    
    switch (filters.amount) {
      case 'small':
        matchesAmount = amount < 10; // Small: Less than 10 HBAR
        break;
      case 'medium':
        matchesAmount = amount >= 10 && amount <= 100; // Medium: 10-100 HBAR
        break;
      case 'large':
        matchesAmount = amount > 100; // Large: Greater than 100 HBAR
        break;
      default:
        matchesAmount = true;
    }
    
    // Debug individual transaction filter results if needed
    if (tx.transactionId && tx.transactionId.includes('0.0.123')) { // Add a specific ID to debug
      console.log('Filter results for transaction:', tx.transactionId, {
        type: tx.type,
        filterType,
        matchesType,
        amount,
        matchesAmount,
        timestamp: tx.timestamp,
        matchesTimeframe,
        matchesSearch
      });
    }
    
    return matchesSearch && matchesType && matchesTimeframe && matchesAmount;
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };
  
  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB');
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 8)}...${address.substring(address.length - 4)}`;
  };

  // Export CSV function
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      'Date',
      'Time',
      'Account ID',
      'Type',
      'Amount',
      'Status',
      'Transaction ID',
      'Counterparty ID'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        formatDate(tx.timestamp),
        formatTime(tx.timestamp),
        tx.accountId || '',
        tx.type || '',
        tx.amount || '',
        tx.status || '',
        tx.transactionId || '',
        tx.counterpartyId || ''
      ].join(','))
    ];
    
    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="transactions-history-layout">
      <SidebarAdmin 
        sidebarOpen={sidebarOpen}
        activeSection="transactions-history"
        onNavClick={() => {}}
        onLogout={() => {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/login";
        }}
      />
      <div className={`transactions-history-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <HeaderAdmin title="Transaction History" onToggleSidebar={toggleSidebar} />
        <div className="transactions-history-content">
          <div className="transactions-header">
            <h1 style={{ fontSize: '2.2rem' }}>Transaction History</h1>
          </div>

          <div className="search-bar-row">
            <div className="search-wrapper">
              <Search size={18} />
              <input
                className="search-input-s"
                type="text"
                placeholder="Search by Account ID, Transaction ID, Type, Status..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="actions-row" style={{ display: 'flex', gap: '12px', marginBlockEnd: '18px' }}>
            <button className="refresh-button" onClick={fetchTransactions} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh
            </button>
            <button className="export-button" onClick={exportToCSV} disabled={filteredTransactions.length === 0}>
              <Download size={16} /> Export
            </button>
            <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
              Filter Options
            </button>
          </div>

          {showFilters && (
            <div className="filters-dropdown" style={{ marginBlockEnd: '18px' }}>
              <div className="filter-item">
                <label>Date Range</label>
                <select 
                  value={filters.timeframe} 
                  onChange={e => {
                    console.log('Changing timeframe filter to:', e.target.value);
                    setFilters({...filters, timeframe: e.target.value});
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Type</label>
                <select 
                  value={filters.type} 
                  onChange={e => {
                    console.log('Changing type filter to:', e.target.value);
                    setFilters({...filters, type: e.target.value});
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="send">Send</option>
                  <option value="receive">Receive</option>
                  <option value="platform_fee">Platform Fee</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Amount</label>
                <select 
                  value={filters.amount} 
                  onChange={e => {
                    console.log('Changing amount filter to:', e.target.value);
                    setFilters({...filters, amount: e.target.value});
                  }}
                >
                  <option value="all">All Amounts</option>
                  <option value="small">Small (&lt; 10 HBAR)</option>
<option value="medium">Medium (10-100 HBAR)</option>
<option value="large">Large (&gt; 100 HBAR)</option>
                </select>
              </div>
              <button 
                className="clear-filters-btn"
                onClick={() => setFilters({
                  type: 'all',
                  status: 'all',
                  timeframe: 'all',
                  amount: 'all'
                })}
              >
                Clear Filters
              </button>
            </div>
          )}


          {/* Transactions count and summary */}
          <div className="transactions-summary">
            <div className="transactions-count">
              <p>
                <strong>{filteredTransactions.length}</strong> transactions found
                {searchQuery && <span> matching <strong>"{searchQuery}"</strong></span>}
              </p>
            </div>
          </div>

          {/* Transactions table */}
          <div className="transactions-table-wrapper">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="retry-btn" onClick={fetchTransactions}>Retry</button>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="empty-transactions">
                <Clock size={48} />
                <h3>No transactions found</h3>
                <p>There are no transactions matching your filters</p>
              </div>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Account ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                    <th>Counterparty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, index) => (
                    <tr key={`${tx.transactionId || 'unknown'}-${index}`}>
                      <td className="date-time-cell">
                        <div className="date-display">
                          <Calendar size={14} />
                          {formatDate(tx.timestamp)}
                        </div>
                        <div className="time-display">
                          <Clock size={14} />
                          {formatTime(tx.timestamp)}
                        </div>
                      </td>
                      <td>{formatAddress(tx.accountId)}</td>
                      <td className="type-cell">
                        {(() => {
                          // Format the transaction type for better display
                          const formatType = (type) => {
                            // Replace underscores with spaces and capitalize each word
                            return type
                              .split('_')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');
                          };
                          return formatType(tx.type || '');
                        })()}
                      </td>
                      <td className={`amount-cell ${(tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'transaction_fee') ? 'positive' : 'negative'}`}>
                        {(tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'transaction_fee') ? '+' : '-'}
                        {tx.amount} HBAR
                      </td>
                      <td>
                        <span className={`status-pill ${tx.status}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="transaction-id-cell">
                        {formatAddress(tx.transactionId)}
                        {tx.transactionId && (
                          <a 
                            href={`https://hashscan.io/testnet/transaction/${tx.transactionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hashscan-link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </td>
                      <td>{formatAddress(tx.counterpartyId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsHistory;
