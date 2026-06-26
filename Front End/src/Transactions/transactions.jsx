"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import Sidebar from "./../components/sidebar/sidebar";
import Header from "./../components/header/header";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ArrowRight,
  Plus,
  ExternalLink,
} from "lucide-react"
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./transactions.css"

// API base URL
const API_URL = "http://localhost:5000/api";

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSendForm, setShowSendForm] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Removed statusFilter state, not needed

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successDetails, setSuccessDetails] = useState({
    transactionId: '',
    amount: 0,
    recipient: '',
    hashscanUrl: ''
  })
  const [walletData, setWalletData] = useState({
    address: "",
    balance: 0,
    currency: "HBAR",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Get auth context for authentication
  const { user, isAuthenticated } = useAuth();
  const token = user?.token;

  // State for all transactions
  const [allTransactions, setAllTransactions] = useState([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [transactionError, setTransactionError] = useState(null)
  
  // Function to fetch transaction history - declare this first to avoid circular dependency
  const fetchTransactions = useCallback(async (accountId) => {
  if (!accountId || !token) return;

  setIsLoadingTransactions(true);
  setTransactionError(null);

  try {
    console.log('Fetching transactions for account:', accountId);
    const response = await axios.get(`${API_URL}/wallet/transactions/${accountId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Transactions received:', response.data);

    // Map transactions into the format needed for the UI
    let formattedTransactions = (response.data.transactions || []).map(tx => {
  // Defensive: always provide string values for hash, from, to
  const hash = typeof tx.transactionId === 'string' ? tx.transactionId : '';
  const from = typeof tx.counterpartyId === 'string' ? tx.counterpartyId : '';
  const to = typeof tx.counterpartyId === 'string' ? tx.counterpartyId : '';
  const date = tx.timestamp || '';
  // Combine hash and date for uniqueness
  return {
    id: `${hash}_${date}` || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    hash,
    type: tx.type || '',
    status: tx.status || '',
    amount: tx.amount || 0,
    date,
    from: tx.type === 'send' ? accountId : from,
    to: tx.type === 'receive' ? accountId : to,
  };
});
// Filter out duplicates by id (hash + date)
const seenIds = new Set();
formattedTransactions = formattedTransactions.filter(tx => {
  if (seenIds.has(tx.id)) return false;
  seenIds.add(tx.id);
  return true;
});
console.log('Formatted transactions:', formattedTransactions);
setAllTransactions(formattedTransactions);
    setIsLoadingTransactions(false);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    setTransactionError('Failed to load transaction history');
    setIsLoadingTransactions(false);
  }
}, [token]);
  
  // Function to fetch wallet data
  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if token exists
      if (!token) {
        console.error('No authentication token available');
        setError('Authentication error: Please log in again');
        setLoading(false);
        return;
      }
      
      console.log('Fetching wallet data for transactions page...');
      const response = await axios.get(`${API_URL}/wallet/my-wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Wallet data received:', response.data);

      if (response.data.wallet) {
        setWalletData({
          address: response.data.wallet.accountId,
          balance: response.data.wallet.balance,
          currency: "HBAR",
        });
        
        // After getting wallet data, fetch transactions
        await fetchTransactions(response.data.wallet.accountId);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
      setLoading(false);
    }
  }, [token, fetchTransactions]);

  // Fetch wallet data on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchWalletData();
    }
  }, [isAuthenticated, fetchWalletData]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const formatAddress = (address) => {
    if (!address) return '—';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  const handleSendSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    const errors = {}

    if (!recipientAddress) {
      errors.recipientAddress = "Recipient address is required"
    } else if (!/^\d+\.\d+\.\d+$/.test(recipientAddress)) {
      errors.recipientAddress = "Invalid account ID format"
    }

    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = "Amount must be greater than 0"
    } else if (parseFloat(amount) > walletData.balance) {
      errors.amount = "Amount exceeds available balance"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Show confirmation modal
    setShowConfirmation(true)
  }

  const confirmTransaction = async () => {
    try {
      // Set loading or disable buttons here if needed
      
      // Call the API to transfer HBAR
      console.log('Sending HBAR transfer request to:', `${API_URL}/wallet/transfer`);
      console.log('Request data:', {
        receiverAccount: recipientAddress,
        amount: parseFloat(amount),
        memo: memo || undefined
      });
      
      const response = await axios.post(
        `${API_URL}/wallet/transfer`, 
        {
          receiverAccount: recipientAddress,
          amount: parseFloat(amount),
          memo: memo || undefined  // Only send if not empty
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Transaction response:', response.data);
      
      // Create transaction object from response
      const newTx = {
        id: response.data.transactionId,
        hash: response.data.transactionId,
        type: "send",
        status: "completed",
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        from: walletData.address,
        to: recipientAddress,
      };

      // Update transactions list with new transaction
      setAllTransactions([newTx, ...allTransactions]);
      
      // Update wallet balance
      setWalletData(prev => ({
        ...prev,
        balance: Math.max(0, prev.balance - parseFloat(amount))
      }));

      // Reset form
      setShowConfirmation(false);
      setShowSendForm(false);
      setRecipientAddress("");
      setAmount("");
      setMemo("");
      setFormErrors({});

      // Show success modal with transaction details
      setSuccessDetails({
        transactionId: response.data.transactionId,
        amount: parseFloat(amount),
        recipient: recipientAddress,
        hashscanUrl: response.data.hashscanUrl || `https://hashscan.io/testnet/tx/${response.data.transactionId}`
      });
      setShowSuccessModal(true);
      
      // Set a flag in localStorage to indicate a transaction was completed
      // The wallet page will check for this flag and refresh data if needed
      localStorage.setItem('hbarTransactionCompleted', 'true');
      localStorage.setItem('hbarTransactionTimestamp', new Date().getTime());
      
      // Refresh transactions after a small delay to allow backend to update
      setTimeout(() => {
        if (walletData.address) {
          fetchTransactions(walletData.address);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Transaction error:', error);
      alert(`Transaction failed: ${error.response?.data?.message || error.message}`);
    }
  }

  const cancelTransaction = () => {
    setShowConfirmation(false)
  }

  // Filter states
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'send', 'receive'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [amountFilter, setAmountFilter] = useState('all'); // 'all', 'lt10', 'btw10and30', 'gt30'

  const filteredTransactions = useMemo(() => {
  if (!Array.isArray(allTransactions) || allTransactions.length === 0) return [];
  const query = (searchQuery || '').toLowerCase().trim();
  let filtered = allTransactions.filter((tx) => {
    // Search filter
    if (query) {
      const searchableFields = [
        String(tx.hash || '').toLowerCase(),
        String(tx.from || '').toLowerCase(),
        String(tx.to || '').toLowerCase()
      ];
      if (!searchableFields.some(field => field.includes(query))) return false;
    }
    // Type filter
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    // Date filter
    if (dateFilter !== 'all') {
      const txDate = new Date(tx.date);
      const now = new Date();
      if (dateFilter === 'today') {
        if (
          txDate.getDate() !== now.getDate() ||
          txDate.getMonth() !== now.getMonth() ||
          txDate.getFullYear() !== now.getFullYear()
        ) return false;
      } else if (dateFilter === 'week') {
        // Get start of week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        if (txDate < startOfWeek) return false;
      } else if (dateFilter === 'month') {
        if (
          txDate.getMonth() !== now.getMonth() ||
          txDate.getFullYear() !== now.getFullYear()
        ) return false;
      }
    }
    // Amount filter
    if (amountFilter !== 'all') {
      const amt = parseFloat(tx.amount) || 0;
      if (amountFilter === 'lt10' && !(amt < 10)) return false;
      if (amountFilter === 'btw10and30' && !(amt >= 10 && amt <= 30)) return false;
      if (amountFilter === 'gt30' && !(amt > 30)) return false;
    }
    return true;
  });
  filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log('Filter Debug:', {searchQuery, typeFilter, dateFilter, amountFilter, filteredTransactions: filtered, allTransactions});
  return filtered;
}, [allTransactions, searchQuery, typeFilter, dateFilter, amountFilter]);

// searchQuery already declared above

  return (
    <div className="transactions-page-wrapper">
      <div className="transactions-dashboard">
        <Sidebar activePage="transactions" onToggle={toggleSidebar} isOpen={sidebarOpen} />

        <main className={`transactions-main-content ${sidebarOpen ? "" : "transactions-sidebar-closed"}`}>
          <Header title="Transactions" onToggleSidebar={toggleSidebar} />

          <div className="transactions-dashboard-content">
            {/* Actions Bar */}
            <div className="transactions-actions-bar">
              <div className="transactions-tabs">
                <button className="transactions-tab active">All Transactions</button>
              </div>

              <div className="transactions-actions">
                <button className="send-transaction-btn" onClick={() => setShowSendForm(true)}>
                  <Send size={16} />
                  Send HBAR
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="app-content-section">
              <div className="search-filter-container" style={{ gap: '12px', flexWrap: 'wrap' }}>
                {/* Type Filter */}
                <select
                  className="filter-select"
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  aria-label="Filter by type"
                >
                  <option value="all">All Types</option>
                  <option value="send">Send</option>
                  <option value="receive">Receive</option>
                </select>
                {/* Date Filter */}
                <select
                  className="filter-select"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  aria-label="Filter by date"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                {/* Amount Filter */}
                <select
                  className="filter-select"
                  value={amountFilter}
                  onChange={e => setAmountFilter(e.target.value)}
                  aria-label="Filter by amount"
                >
                  <option value="all">All Amounts</option>
                  <option value="lt10">Less than 10 HBAR</option>
                  <option value="btw10and30">Between 10 and 30 HBAR</option>
                  <option value="gt30">More than 30 HBAR</option>
                </select>
                {/* Search Bar */}
                <div className="search-container" style={{ flex: 1, minWidth: '220px', maxWidth: '100%' }}>
                  <input
                    type="text"
                    placeholder="Search by Transaction Hash, From, or To"
                    className="search-input-s"
                    style={{ width: '100%' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search transactions"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button 
                      className="search-clear-btn" 
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Transactions List */}
              <div className="tx-list-container">
                {isLoadingTransactions ? (
                  <div className="tx-loading-state">
                    <div className="tx-spinner"></div>
                    <p>Loading transaction history...</p>
                  </div>
                ) : transactionError ? (
                  <div className="tx-error-state">
                    <AlertCircle size={24} />
                    <p>{transactionError}</p>
                    <button 
                      className="tx-retry-btn" 
                      onClick={() => walletData?.address && fetchTransactions(walletData.address)}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="tx-table">
                    {/* Table Header */}
                    <div className="tx-table-header">
                      <div className="tx-header-cell tx-type-cell">Type</div>
                      <div className="tx-header-cell tx-hash-cell">Transaction Hash</div>
                      <div className="tx-header-cell tx-date-cell">Date & Time</div>
                      <div className="tx-header-cell tx-from-cell">From</div>
                      <div className="tx-header-cell tx-to-cell">To</div>
                      <div className="tx-header-cell tx-amount-cell">Amount</div>
                      <div className="tx-header-cell tx-status-cell">Status</div>
                    </div>
                    
                    {/* Table Body */}
                    <div className="tx-table-body">
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                          <div key={tx.id || tx.hash} className="tx-table-row">
                            {/* Type Cell */}
                            <div className="tx-table-cell tx-type-cell">
                              <div className={`tx-type-icon tx-type-${tx.type.toLowerCase()}`}>
                                {tx.type === "send" && <ArrowUpRight size={16} />}
                                {tx.type === "receive" && <ArrowDownLeft size={16} />}
                                {tx.type === "mint" && <Plus size={16} />}
                                {tx.type === "burn" && <Wallet size={16} />}
                                {tx.type === "PLATFORM_FEE" && <Send size={16} />}
                              </div>
                              <span className="tx-type-text">
                                {tx.type === "PLATFORM_FEE" 
                                  ? "Platform Fee" 
                                  : tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </span>
                            </div>

                            {/* Hash Cell */}
                            <div className="tx-table-cell tx-hash-cell">
                              {tx.hash ? (
                                <a
                                  href={`https://hashscan.io/testnet/transaction/${tx.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="tx-hash-link"
                                >
                                  <span className="tx-hash-text">
                                    {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                                  </span>
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span className="tx-hash-text">—</span>
                              )}
                            </div>

                            {/* Date Cell */}
                            <div className="tx-table-cell tx-date-cell">
                              <div className="tx-date-text">{formatDate(tx.date)}</div>
                              <div className="tx-time-text">{formatTime(tx.date)}</div>
                            </div>

                            {/* From Cell */}
                            <div className="tx-table-cell tx-from-cell">
                              <span className="tx-address-text">
                                {tx.type === "receive" ? formatAddress(tx.from) : tx.type === "send" ? "You" : "—"}
                              </span>
                            </div>

                            {/* To Cell */}
                            <div className="tx-table-cell tx-to-cell">
                              <span className="tx-address-text">
                                {tx.type === "send" ? formatAddress(tx.to) : tx.type === "receive" ? "You" : "—"}
                              </span>
                            </div>

                            {/* Amount Cell */}
                            <div className="tx-table-cell tx-amount-cell">
                              <span className={`tx-amount-text ${tx.type === "receive" || tx.type === "mint" ? "tx-positive" : "tx-negative"}`}>
                                {tx.type === "receive" || tx.type === "mint" ? "+" : "-"}
                                {tx.amount} {walletData.currency}
                              </span>
                            </div>

                            {/* Status Cell */}
                            <div className="tx-table-cell tx-status-cell">
                              <span className={`tx-status-badge tx-status-${tx.status}`}>
                                {tx.status === "completed" && <CheckCircle2 size={14} />}
                                {tx.status === "pending" && <Clock size={14} />}
                                {tx.status === "failed" && <AlertCircle size={14} />}
                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="tx-empty-state">
                          <div className="tx-empty-icon">
                            <Wallet size={48} />
                          </div>
                          <h3 className="tx-empty-title">No Transactions Found</h3>
                          <p className="tx-empty-message">
                            {searchQuery ? (
                              <>
                                We couldn't find any transactions matching your search.<br />
                                <span style={{ color: '#6c7293', fontSize: '13px' }}>
                                  Double-check spelling, try a different address or hash, or clear your search and try again.
                                </span>
                              </>
                            ) : (
                              "You haven't made any transactions yet. Send your first transaction to get started."
                            )}
                          </p>
                          {searchQuery && (
                            <button className="tx-send-first-btn" onClick={() => setSearchQuery("")}>Clear Search</button>
                          )}
                          {!searchQuery && (
                            <button className="tx-send-first-btn" onClick={() => setShowSendForm(true)}>
                              <Send size={16} />
                              Send HBAR
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Send Transaction Form Modal */}
      {showSendForm && (
        <div className="hbar-modal-overlay">
          <div className="hbar-transaction-form-modal">
            <div className="hbar-modal-header">
              <h2>Send HBAR</h2>
              <button className="hbar-close-modal" onClick={() => setShowSendForm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="hbar-modal-content">
              {loading ? (
                <div className="hbar-loading-state">
                  <div className="hbar-spinner"></div>
                  <p>Loading wallet data...</p>
                </div>
              ) : error ? (
                <div className="hbar-error-state">
                  <AlertCircle size={24} />
                  <p>{error}</p>
                  <button className="hbar-retry-btn" onClick={fetchWalletData}>Retry</button>
                </div>
              ) : (
                <>
                  <div className="hbar-wallet-balance-info">
                    <div className="hbar-balance-label">Available Balance:</div>
                    <div className="hbar-balance-value">
                      {walletData.balance} {walletData.currency}
                    </div>
                  </div>
                  
                  <form onSubmit={handleSendSubmit}>
                <div className="hbar-form-group">
                  <label htmlFor="recipientAddress">Recipient Address</label>
                  <input
                    type="text"
                    id="recipientAddress"
                    placeholder="Enter wallet address 0.0...."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className={formErrors.recipientAddress ? "hbar-input-error" : ""}
                  />
                  {formErrors.recipientAddress && (
                    <div className="hbar-error-message">{formErrors.recipientAddress}</div>
                  )}
                </div>

                <div className="hbar-form-group">
                  <label htmlFor="amount">Amount (HBAR)</label>
                  <input
                    type="text"
                    id="amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={formErrors.amount ? "hbar-input-error" : ""}
                  />
                  {formErrors.amount && <div className="hbar-error-message">{formErrors.amount}</div>}
                </div>

                <div className="hbar-form-group">
                  <label htmlFor="memo">Memo (Optional)</label>
                  <textarea
                    id="memo"
                    placeholder="Add a note to this transaction"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="hbar-form-actions">
                  <button type="button" className="hbar-cancel-btn" onClick={() => setShowSendForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="hbar-submit-btn" disabled={walletData.balance <= 0}>
                    {walletData.balance <= 0 ? "Insufficient Balance" : "Continue"}
                  </button>
                </div>
              </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="hbar-modal-overlay success-overlay">
          <div className="hbar-success-modal">
            <div className="hbar-modal-header success">
              <h2>Transaction Successful</h2>
              <button className="hbar-close-modal" onClick={() => setShowSuccessModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="hbar-modal-content success-content">
              <div className="success-icon">
                <CheckCircle2 size={60} />
              </div>
              
              <div className="success-message">
                <h3>Your transfer was completed successfully!</h3>
                <p>Your HBAR has been sent to the recipient.</p>
              </div>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value">{successDetails.amount} HBAR</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Recipient</span>
                  <span className="detail-value">{formatAddress(successDetails.recipient)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Transaction ID</span>
                  <span className="detail-value id-value">{successDetails.transactionId}</span>
                </div>
              </div>
              
              <div className="success-actions">
                <a 
                  href={successDetails.hashscanUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="view-hashscan-btn"
                >
                  <ExternalLink size={16} />
                  View on HashScan
                </a>
                <button 
                  className="close-success-btn" 
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="hbar-modal-overlay">
          <div className="hbar-confirmation-modal">
            <div className="hbar-modal-header">
              <h2>Confirm Transaction</h2>
              <button className="hbar-close-modal" onClick={cancelTransaction}>
                <X size={20} />
              </button>
            </div>

            <div className="hbar-modal-content">
              <div className="hbar-confirmation-details">
                <div className="hbar-confirmation-row">
                  <div className="hbar-confirmation-label">From</div>
                  <div className="hbar-confirmation-value">{formatAddress(walletData.address)}</div>
                </div>

                <div className="hbar-confirmation-row">
                  <div className="hbar-confirmation-label">To</div>
                  <div className="hbar-confirmation-value">{formatAddress(recipientAddress)}</div>
                </div>

                <div className="hbar-confirmation-arrow">
                  <ArrowRight size={24} />
                </div>

                <div className="hbar-confirmation-row">
                  <div className="hbar-confirmation-label">Amount</div>
                  <div className="hbar-confirmation-value hbar-highlight">
                    {amount} {walletData.currency}
                  </div>
                </div>

                {memo && (
                  <div className="hbar-confirmation-row">
                    <div className="hbar-confirmation-label">Memo</div>
                    <div className="hbar-confirmation-value hbar-memo">{memo}</div>
                  </div>
                )}

                <div className="hbar-confirmation-row">
                  <div className="hbar-confirmation-label">Network Fee</div>
                  <div className="hbar-confirmation-value">0.0001 {walletData.currency}</div>
                </div>
                
                <div className="hbar-confirmation-row">
                  <div className="hbar-confirmation-label">Platform Fee</div>
                  <div className="hbar-confirmation-value">0.0001 {walletData.currency}</div>
                </div>

                <div className="hbar-confirmation-row hbar-total">
                  <div className="hbar-confirmation-label">Total</div>
                  <div className="hbar-confirmation-value">
                    {(Number.parseFloat(amount) + 0.0002).toFixed(4)} {walletData.currency}
                  </div>
                </div>
              </div>

              <div className="hbar-confirmation-warning">
                <AlertCircle size={16} />
                <span>Please verify all details carefully. Transactions cannot be reversed once confirmed.</span>
              </div>

              <div className="hbar-confirmation-actions">
                <button className="hbar-cancel-btn" onClick={cancelTransaction}>
                  Cancel
                </button>
                <button className="hbar-confirm-btn" onClick={confirmTransaction}>
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
