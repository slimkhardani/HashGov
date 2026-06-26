"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Sidebar from "./../components/sidebar/sidebar";
import Header from "./../components/header/header";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Plus,
  ExternalLink,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Key,
  Shield,
  AlertCircle,
  X,
  QrCode,
  LogOut,
  CheckCircle2
} from "lucide-react"
import { Link } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import QRCode from "react-qr-code";
import { BrowserProvider } from "ethers";
import "./wallet.css"
import "./send-modal-dark.css"

// API base URL - same as used in Auth Service
const API_URL = "http://localhost:5000/api";

export default function WalletPage() {  
  // Connect to MetaMask and get user's address
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setWithdrawError('MetaMask not detected. Please install MetaMask extension.');
      return;
    }
    
    setIsConnectingMetaMask(true);
    setWithdrawError('');
    
    try {
      // Create a provider (using ethers v6 syntax)
      const provider = new BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send("eth_requestAccounts", []);
      
      // Get the signer
      const signer = await provider.getSigner();
      
      // Get the network information
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Check if connected to Hedera Testnet (chainId 296)
      if (chainId !== 296) {
        setWithdrawError('Please connect to Hedera Testnet in MetaMask (Chain ID: 296)');
        setIsConnectingMetaMask(false);
        return;
      }
      
      // Get user's address
      const address = await signer.getAddress();
      setRecipientAddress(address);
      setMetaMaskConnected(true);
    } catch (error) {
      console.error('MetaMask connection error:', error);
      setWithdrawError(error.message || 'Failed to connect to MetaMask');
    } finally {
      setIsConnectingMetaMask(false);
    }
  };
  
  // Handle withdrawal form submission
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    
    // Validate inputs
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError('Please enter a valid amount to withdraw');
      return;
    }
    
    if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      setWithdrawError('Please enter a valid EVM address (0x...)');
      return;
    }
    
    // Optional: Check if user has sufficient balance
    if (walletData && walletData.balance && parseFloat(withdrawAmount) > parseFloat(walletData.balance)) {
      setWithdrawError('Insufficient balance');
      return;
    }
    
    // Re-validate auth status before proceeding
    if (!token) {
      console.error('No token available for authorization');
      setWithdrawError('Authentication token not found. Please log in again.');
      return;
    }
    
    // Use the token from auth context
    const currentToken = token;
    
    console.log('Using token for authorization - First 10 chars:', currentToken.substring(0, 10) + '...');
    
    try {
      // Add detailed debugging for the request
      console.log('🚀 Preparing withdrawal request:');
      console.log('- API endpoint:', `${API_URL}/wallet/withdraw`);
      console.log('- Request data:', {
        recipient: recipientAddress,
        amount: parseFloat(withdrawAmount),
        token: 'HBAR'
      });
      console.log('- Auth token first 10 chars:', currentToken ? currentToken.substring(0, 10) + '...' : 'N/A');
      console.log('- Full auth header:', `Bearer ${currentToken ? currentToken.substring(0, 10) + '...' : 'N/A'}`);
      
      // Log existing wallet data for comparison
      console.log('- Current wallet data:', walletData);
      
      // Prepare the headers explicitly
      const headers = { 
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      };
      
      console.log('- Request headers:', headers);
      
      // Add the wallet accountId to the request so the backend can find it directly
      console.log('- Including wallet accountId in request:', walletData?.address);
      
      // Call backend API to process withdrawal with the refreshed token
      const response = await axios.post(`${API_URL}/wallet/withdraw`, {
        recipient: recipientAddress,
        amount: parseFloat(withdrawAmount),
        token: 'HBAR',
        accountId: walletData?.address // Include the accountId from the wallet data
      }, { headers });
      
      console.log('Withdrawal response:', response.data);
      
      // Handle successful withdrawal
      setWithdrawSuccess(true);
      setWithdrawTxHash(response.data.transactionId);
      
      // Refresh wallet data to update balance
      fetchWalletData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      console.error('Error response:', error.response?.data);
      setWithdrawError(error.response?.data?.message || 'Failed to process withdrawal');
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [walletCreated, setWalletCreated] = useState(false)
  const [walletData, setWalletData] = useState(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [showPublicKey, setShowPublicKey] = useState(false)
  const [copiedField, setCopiedField] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showLinkWalletButton, setShowLinkWalletButton] = useState(false);
  const depositModalRef = useRef(null)
  const withdrawModalRef = useRef(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false)
  const [metaMaskConnected, setMetaMaskConnected] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [withdrawTxHash, setWithdrawTxHash] = useState('')
  
  // Get auth context for authentication
  const { user, isAuthenticated } = useAuth();
  const token = user?.token;
  
  // Debug log for auth context during component load
  useEffect(() => {
    console.log('🔑 Auth check on component load:')
    console.log('User object:', user);
    console.log('Token available:', token ? 'Yes' : 'No');
    console.log('isAuthenticated returns:', isAuthenticated ? isAuthenticated() : 'Not a function');
    
    // Check cookies manually
    const allCookies = document.cookie;
    console.log('All cookies:', allCookies);
  }, [user, token, isAuthenticated]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Handle clicks outside modals to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (depositModalRef.current && !depositModalRef.current.contains(event.target)) {
        setShowDepositModal(false);
      }
      if (withdrawModalRef.current && !withdrawModalRef.current.contains(event.target)) {
        setShowWithdrawModal(false);
      }
    }

    if (showDepositModal || showWithdrawModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDepositModal, showWithdrawModal]);

  const handleDeposit = () => {
    setShowDepositModal(true);
  }

  const handleWithdraw = () => {
    setWithdrawError('');
    setWithdrawSuccess(false);
    setWithdrawTxHash('');
    setWithdrawAmount('');
    setRecipientAddress('');
    setMetaMaskConnected(false);
    setShowWithdrawModal(true);
  }

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }
  
  // Function to format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  // Function to fetch wallet transactions
  const fetchTransactions = useCallback(async (accountId) => {
    try {
      console.log('Fetching transactions for account:', accountId);
      const response = await axios.get(`${API_URL}/wallet/transactions/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Transactions fetched:', response.data.transactions);
      
      // Only update if we have transactions and they're different from current ones
      if (response.data.transactions && response.data.transactions.length > 0) {
        setWalletData(prevData => {
          // Don't update if transactions are the same (prevents re-renders)
          if (JSON.stringify(prevData?.transactions) === JSON.stringify(response.data.transactions)) {
            return prevData;
          }
          
          const updatedData = {
            ...prevData,
            transactions: response.data.transactions
          };
          console.log('Updated wallet data with transactions:', updatedData);
          return updatedData;
        });
      }
      return true;
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return false;
    }
  }, [token]);
  
  // Function to format an address for display
  const formatDisplayAddress = useCallback((address, currentUserAddress) => {
    // If it's the current user's address, show as "You"
    if (address === currentUserAddress) {
      return "You";
    }
    // Otherwise format the address with ellipsis in the middle
    return formatAddress(address);
  }, []);
  

  // Function to fetch transactions only when wallet is loaded and stable
  useEffect(() => {
    let isMounted = true;
    
    const getTransactions = async () => {
      // Only fetch if we have a wallet and we're authenticated
      if (walletCreated && walletData?.address && isAuthenticated() && isMounted) {
        await fetchTransactions(walletData.address);
      }
    };
    
    // Fetch transactions when wallet data is available
    getTransactions();
    
    return () => {
      isMounted = false; // Prevent state updates after unmount
    };
  }, [walletCreated, walletData?.address, fetchTransactions, isAuthenticated]);

  // Function to fetch wallet data
  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowLinkWalletButton(false);
    
    // Debug logs
    console.log('🔍 Fetching wallet data...');
    console.log('User is authenticated:', typeof isAuthenticated === 'function' ? isAuthenticated() : 'Not a function');
    console.log('Token available:', token ? 'Yes (Length: ' + token.length + ')' : 'No');
    console.log('Token first 10 chars:', token ? token.substring(0, 10) + '...' : 'N/A');
    
    try {
      // Check if token exists
      if (!token) {
        console.error('⛔ No authentication token available');
        setError('Authentication error: Please log in again');
        setLoading(false);
        return;
      }
      
      console.log('📤 Making wallet API request with token...');
      
      // Add cache-busting parameter to prevent cached responses
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/wallet/my-wallet?_t=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      
      console.log('Wallet API response:', response.data);

      if (response.data.wallet) {
        setWalletCreated(true);
        // Store the account ID for transaction fetching
        const accountId = response.data.wallet.accountId;
        
        // First set basic wallet data
        setWalletData({
          address: accountId,
          privateKey: response.data.wallet.privateKey,
          publicKey: response.data.wallet.publicKey,
          balance: response.data.wallet.balance,
          nftTokenId: response.data.wallet.nftTokenId,
          currency: "HBAR",
          transactions: response.data.wallet.transactions || [],
          hashscanUrl: response.data.wallet.hashscanUrl || `https://hashscan.io/testnet/account/${accountId}`,
          createdAt: response.data.wallet.createdAt,
        });
        
        // Immediately fetch transactions
        if (accountId) {
          try {
            console.log('Directly fetching transactions for account:', accountId);
            const txResponse = await axios.get(`${API_URL}/wallet/transactions/${accountId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (txResponse.data && txResponse.data.transactions) {
              console.log('Transactions directly fetched:', txResponse.data.transactions.length);
              // Update wallet data with transactions
              setWalletData(prevData => ({
                ...prevData,
                transactions: txResponse.data.transactions
              }));
            }
          } catch (txError) {
            console.error('Error fetching transactions directly:', txError);
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      
      // Check if error is wallet not found, which means we need to link a wallet to this user
      if (error.response?.status === 404 && error.response?.data?.message?.includes('not found')) {
        console.log('🔓 Wallet not found for this user - showing link wallet button');
        setShowLinkWalletButton(true);
      }
      
      setError(error.response?.data?.message || 'Failed to fetch wallet data');
      setLoading(false);
    }
  }, [token]);
  
  // Function to link an existing wallet to the user's account
  const linkWalletToUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔓 Linking wallet to user account...');
      
      if (!token) {
        console.error('⛔ No authentication token available');
        setError('Authentication error: Please log in again');
        setLoading(false);
        return;
      }
      
      // We'll use the default accountId from the logs (0.0.5948531)
      // This is the first wallet shown in the debugging logs
      const accountId = '0.0.5948531';
      
      console.log('📤 Making link wallet API request with token...');
      
      const response = await axios.post(`${API_URL}/wallet/link`, {
        accountId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Link wallet response:', response.data);
      
      if (response.data.success) {
        // Show success message
        setError(null);
        alert('Wallet linked successfully! Refreshing wallet data...');
        // Refresh wallet data
        fetchWalletData();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error linking wallet:', error);
      setError(error.response?.data?.message || 'Failed to link wallet');
      setLoading(false);
    }
  };

  // One single effect for initial data load and minimal refresh setup
  useEffect(() => {
    console.log('Initial wallet data load');
    let isComponentMounted = true;

    // Initial data load
    const transactionCompleted = localStorage.getItem('hbarTransactionCompleted');
    const certificateApproved = localStorage.getItem('certificateApproved');
    
    if (transactionCompleted === 'true' || certificateApproved === 'true') {
      // Clear flags but remember we had an update
      localStorage.removeItem('hbarTransactionCompleted');
      localStorage.removeItem('certificateApproved');
      console.log('Transaction or certificate update detected - refreshing wallet data');
      
      if (isComponentMounted) {
        // Force a refresh with small delay to ensure backend is updated
        setTimeout(() => {
          fetchWalletData();
        }, 1000);
      }
    } else if (isComponentMounted) {
      fetchWalletData();
    }

    // ONE minimal refresh mechanism: only refresh when tab becomes visible AND focused
    // This avoids constant refreshing across the application
    const handleVisibilityChange = () => {
      // Only refresh if genuinely returning to page (visible + has focus)
      if (document.visibilityState === 'visible' && 
          document.hasFocus() && 
          isComponentMounted && 
          !window.isRefreshingWallet) {
        
        console.log('Tab became visible and focused - refreshing wallet data');
        window.isRefreshingWallet = true;
        fetchWalletData().finally(() => {
          window.isRefreshingWallet = false;
        });
      }
    };

    // Only add this one essential event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      isComponentMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array - run once on mount only

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }
  
  // Function to create a Hedera wallet
  const createWallet = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/wallet/create`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setWalletCreated(true);
        setWalletData({
          address: response.data.wallet.accountId,
          privateKey: response.data.wallet.privateKey,
          publicKey: response.data.wallet.publicKey,
          balance: response.data.wallet.balance,
          nftTokenId: response.data.wallet.nftTokenId,
          currency: "HBAR",
          transactions: [],
          hashscanUrl: response.data.wallet.hashscanUrl,
          createdAt: new Date().toISOString(),
        });
        
        // After getting wallet data, fetch transactions
        if (response.data.wallet.accountId) {
          await fetchTransactions(response.data.wallet.accountId);
        }
      }
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create wallet. Please try again later.');
    } finally {
      setCreating(false);
    }
  }, [token]);
  

  return (
    <div className="wallet-page-wrapper">
      <div className="wallet-dashboard">
        <Sidebar activePage="wallet" onToggle={toggleSidebar} isOpen={sidebarOpen} />

        <main className={`wallet-main-content ${sidebarOpen ? "" : "wallet-sidebar-closed"}`}>
          <Header title="Wallet" onToggleSidebar={toggleSidebar} />

          <div className="wallet-dashboard-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your wallet information...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <AlertCircle size={48} color="#e53935" />
                <h3>Error</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchWalletData}>
                  Retry
                </button>
                {showLinkWalletButton && (
                  <button 
                    className="link-wallet-btn" 
                    onClick={linkWalletToUser}>
                    Link Existing Wallet to Your Account
                  </button>
                )}
              </div>
            ) : !walletCreated ? (
              <div className="create-wallet-container">
                <div className="create-wallet-card">
                  <div className="create-wallet-icon">
                    <Wallet size={48} />
                  </div>
                  <h2>Welcome to HashGov Wallet</h2>
                  <p>Create your Hedera wallet to start managing your digital assets and certificates</p>
                  <button 
                    className={`create-wallet-btn ${creating ? 'creating' : ''}`} 
                    onClick={createWallet} 
                    disabled={creating}
                  >
                    {creating ? 'Creating Wallet...' : 'Create your Hedera Wallet'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Wallet Information Section */}
                <div className="wallet-info-section">
                  <div className="wallet-card">
                    <div className="wallet-card-header">
                      <div className="wallet-icon">
                        <Wallet size={24} />
                      </div>
                      <h2>Wallet Details</h2>
                    </div>

                    <div className="wallet-balance">
                      <span className="balance-amount">{walletData.balance.toLocaleString()}</span>
                      <span className="balance-currency">{walletData.currency}</span>
                    </div>

                    <div className="wallet-key-section">
                      <div className="wallet-key-item">
                        <div className="key-label">
                          <Shield size={16} />
                          <span>Wallet Address</span>
                        </div>
                        <h3>
                        <span className="balance-value">{walletData?.balance}</span> 
                        <span className="currency">HBAR</span>
                      </h3>
                      <span className="wallet-address">
                        {formatAddress(walletData?.address)}
                        <button 
                          className="copy-btn" 
                          onClick={() => copyToClipboard(walletData?.address, "address")}
                          style={{ margin: "0 4px" }}
                        >
                          {copiedField === "address" ? "Copied!" : <Copy size={14} />}
                        </button>
                        {walletData?.hashscanUrl && (
                          <a 
                            href={walletData.hashscanUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hashscan-link"
                          >
                            <ExternalLink size={14} /> View on HashScan
                          </a>
                        )}
                      </span>
                      </div>

                      <div className="wallet-key-item">
                        <div className="key-label">
                          <Key size={16} />
                          <span>Public Key</span>
                        </div>
                        <div className="key-value-container">
                          {showPublicKey ? (
                            <span className="key-value">{walletData.publicKey}</span>
                          ) : (
                            <span className="key-value hidden">
                              ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                            </span>
                          )}
                          <div className="key-actions">
                            <button className="toggle-key-btn" onClick={() => setShowPublicKey(!showPublicKey)}>
                              {showPublicKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              className="copy-key-btn"
                              onClick={() => copyToClipboard(walletData.publicKey, "public")}
                              disabled={!showPublicKey}
                            >
                              {copiedField === "public" ? "Copied!" : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="wallet-key-item">
                        <div className="key-label sensitive">
                          <Key size={16} />
                          <span>Private Key</span>
                          <span className="sensitive-tag">SENSITIVE</span>
                        </div>
                        <div className="key-value-container">
                          {showPrivateKey ? (
                            <span className="key-value sensitive">{walletData.privateKey}</span>
                          ) : (
                            <span className="key-value hidden">
                              ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                            </span>
                          )}
                          <div className="key-actions">
                            <button className="toggle-key-btn" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                              {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              className="copy-key-btn"
                              onClick={() => copyToClipboard(walletData.privateKey, "private")}
                              disabled={!showPrivateKey}
                            >
                              {copiedField === "private" ? "Copied!" : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                        {showPrivateKey && (
                          <div className="private-key-warning">
                            Never share your private key with anyone. It provides full access to your wallet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="wallet-actions">
                      <button className="wallet-action-btn deposit" onClick={handleDeposit}>
                        <ArrowDownLeft size={16} />
                        Deposit
                      </button>
                      <button className="wallet-action-btn withdraw" onClick={handleWithdraw}>
                        <ArrowUpRight size={16} />
                        Withdraw
                      </button>
                      <Link to="/transactions" className="wallet-action-btn transfer">
                        <Send size={16} />
                        Send
                      </Link>
                    </div>
                  </div>

                  <div className="wallet-recent-transactions">
                    <div className="transactions-header">
                      <h2>Recent Transactions</h2>
                      <div className="transactions-header-actions">
                        <Link to="/transactions" className="view-all-link">
                          {walletData.transactions && walletData.transactions.length > 5 ? 
                            `View All (${walletData.transactions.length})` : 'View All'} <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                    <div className="transactions-list">
                      {(!walletData.transactions || walletData.transactions.length === 0) ? (
                        <div className="empty-transactions">
                          <Clock size={48} />
                          <p>No transactions yet</p>
                          <span>Your transaction history will appear here</span>
                        </div>
                      ) : (
                        <div className="transactions-list-items">
                          {/* Show only the 5 most recent transactions - make sure we have stable keys for each transaction */}
                          {walletData.transactions && [...walletData.transactions]
                            .filter(tx => tx.type !== 'platform_fee') // Exclude platform fee transactions
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp, newest first
                            .slice(0, 5) // Take only the first 5 transactions (most recent ones)
                            .map((tx, index) => (
                            <div key={tx.transactionId || `tx-${tx.timestamp}-${index}`} className={`transaction-item ${tx.type}`}>
                              <div className="transaction-icon-ico">
                                {tx.type === 'send' && <ArrowUpRight size={18} />}
                                {tx.type === 'receive' && <ArrowDownLeft size={18} />}
                                {tx.type === 'mint' && <Plus size={18} />}
                                {tx.type === 'burn' && <Wallet size={18} />}
                              </div>
                              <div className="transaction-details">
                                <div className="transaction-primary">
                                  <span className="transaction-type">
                                    {tx.type === 'send' ? 'Sent to' : tx.type === 'receive' ? 'Received from' : tx.type}
                                  </span>
                                  <span className="transaction-address">
                                    {tx.type === 'send' && formatDisplayAddress(tx.to, walletData.address)}
                                    {tx.type === 'receive' && formatDisplayAddress(tx.from, walletData.address)}
                                    {(tx.type !== 'send' && tx.type !== 'receive') && '-'}
                                  </span>
                                </div>
                                <div className="transaction-secondary">
                                  <span className="transaction-date">{formatDate(tx.timestamp)}</span>
                                  <span className="transaction-time">{formatTime(tx.timestamp)}</span>
                                  {tx.transactionId && (
                                    <a 
                                      href={`https://hashscan.io/testnet/transaction/${tx.transactionId}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="transaction-link"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </div>
                              <div className="transaction-amount">
                                <span className={`amount ${tx.type === 'receive' || tx.type === 'mint' ? 'positive' : 'negative'}`}>
                                  {tx.type === 'receive' || tx.type === 'mint' ? '+' : '-'}{tx.amount} HBAR
                                </span>
                                <span className={`status ${tx.status}`}>{tx.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>


              </>
            )}
          </div>
        </main>
      </div>

      {/* Deposit HBAR Modal */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="deposit-modal" ref={depositModalRef}>
            <div className="deposit-modal-header">
              <h3>Deposit HBAR</h3>
              <button className="close-modal-btn" onClick={() => setShowDepositModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="deposit-modal-content">
              <div className="deposit-info-block">
                <div className="deposit-field">
                  <label>Network</label>
                  <div className="deposit-value">Hedera (HBAR)</div>
                </div>
                
                <div className="deposit-field">
                  <label>Deposit Address</label>
                  <div className="deposit-value-with-copy">
                    <span className="address-value">{walletData?.address || 'Loading...'}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(walletData?.address, "depositAddress")}
                    >
                      {copiedField === "depositAddress" ? "Copied!" : <Copy size={24} />}
                    </button>
                    <a 
                      href={`https://hashscan.io/testnet/account/${walletData?.address}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="view-hashscan-btn"
                    >
                      <ExternalLink size={16} /> View on HashScan
                    </a>
                  </div>
                </div>

                <div className="qr-code-container">
                  <div className="qr-code-label"><QrCode size={16} /> Scan to deposit HBAR</div>
                  <div className="qr-code">
                    {walletData?.address ? (
                      <>
                        <QRCode 
                          value={walletData.address}
                          size={200}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={"0 0 256 256"}
                          fgColor="#000000"
                          bgColor="#ffffff"
                          level="H"
                        />
                      </>
                    ) : (
                      <div className="qr-loading">Loading...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Withdraw HBAR Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay">
          <div className="send-modal dark" ref={withdrawModalRef}>
            <div className="send-modal-header">
              <h3>Withdraw HBAR</h3>
              <button className="close-modal-btn" onClick={() => setShowWithdrawModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="send-modal-content">
              {!withdrawSuccess ? (
                <form onSubmit={handleWithdrawSubmit} className="send-form">
                  <div className="form-group">
                    <label htmlFor="withdrawAmount">Amount to withdraw (HBAR)</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="withdrawAmount"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => {
                          // Only allow numbers and decimal point
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setWithdrawAmount(value);
                          }
                        }}
                        required
                      />
                      <div className="input-suffix">HBAR</div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="recipientAddress">Recipient Address (EVM format)</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="recipientAddress"
                        placeholder="0x..."
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        required
                      />
                    </div>
                    {!metaMaskConnected && (
                      <button 
                        type="button" 
                        className="connect-metamask-btn" 
                        onClick={connectMetaMask}
                        disabled={isConnectingMetaMask}
                      >
                        {isConnectingMetaMask ? 'Connecting...' : 'Connect MetaMask'}
                      </button>
                    )}
                    {metaMaskConnected && (
                      <div className="metamask-connected">
                        <Shield size={16} /> Connected to MetaMask
                      </div>
                    )}
                  </div>
                  
                  {walletData && walletData.balance && (
                    <div className="balance-info">
                      <span>Available balance:</span>
                      <span className="balance-value">{walletData.balance} HBAR</span>
                    </div>
                  )}
                  
                  {withdrawError && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {withdrawError}
                    </div>
                  )}
                  
                  <button type="submit" className="send-button">
                    <LogOut size={16} />
                    Withdraw HBAR
                  </button>
                </form>
              ) : (
                <div className="hbar-modal-content success-content">
                  <div className="success-icon">
                    <CheckCircle2 size={60} />
                  </div>
                  
                  <div className="success-message">
                    <h3>Withdrawal Submitted</h3>
                    <p>Your withdrawal request has been submitted successfully.</p>
                  </div>
                  
                  <div className="transaction-details">
                    <div className="detail-row">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">{withdrawAmount} HBAR</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Recipient</span>
                      <span className="detail-value">{formatAddress(recipientAddress)}</span>
                    </div>
                    
                    {withdrawTxHash && (
                      <div className="detail-row">
                        <span className="detail-label">Transaction ID</span>
                        <span className="detail-value id-value">{withdrawTxHash}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="success-actions">
                    {withdrawTxHash && (
                      <a 
                        href={`https://hashscan.io/testnet/transaction/${withdrawTxHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-hashscan-btn"
                      >
                        <ExternalLink size={16} />
                        View on HashScan
                      </a>
                    )}
                    <button 
                      className="close-success-btn" 
                      onClick={() => setShowWithdrawModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
