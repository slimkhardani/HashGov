import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import SidebarAdmin from '../SidebarAdmin/SidebarAdmin';
import HeaderAdmin from '../HeaderAdmin/HeaderAdmin';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  Copy, 
  Eye, 
  EyeOff, 
  X,
  AlertCircle,
  ExternalLink,
  CreditCard,
  QrCode,
  Shield,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import './adminwallet.css';
import QRCode from 'react-qr-code';
import { BrowserProvider } from 'ethers';
import '../../Wallet/wallet.css';
import '../../Wallet/send-modal-dark.css';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AdminWallet = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositModalRef] = useState(useRef(null));
  const [withdrawModalRef] = useState(useRef(null));
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [metaMaskConnected, setMetaMaskConnected] = useState(false);
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawTxHash, setWithdrawTxHash] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [walletCreated, setWalletCreated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);

  // Get admin token from localStorage or cookies using the same key as other admin pages
  const adminToken = localStorage.getItem('token') || (document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]);
  console.log('DEBUG: admin token value on page load:', adminToken);

  // Named fetchWallet function for reuse (useEffect + retry)
  const fetchWallet = async () => {
    if (!adminToken) {
      navigate('/admin-login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/wallet/my-wallet`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.data.wallet) {
        setWallet(response.data.wallet);
        setWalletCreated(true);
      } else {
        setWalletCreated(false);
        setWallet(null);
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError('Could not load wallet info');
      setWalletCreated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    // eslint-disable-next-line
  }, [adminToken]);

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
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Copy to clipboard function
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Fetch all transactions/revenues
  const fetchTransactions = useCallback(async () => {
    if (!walletCreated || !wallet?.accountId) return;
    
    try {
      console.log('Fetching transactions for admin wallet:', wallet.accountId);
      const res = await axios.get(`${API_URL}/wallet/transactions/${wallet.accountId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      // Debug transaction data
      console.log('Transaction data received:', res.data);
      console.log('Number of transactions:', res.data.transactions?.length || 0);
      
      // Log transaction types to see if we're getting transaction_fee entries
      const types = res.data.transactions?.map(tx => tx.type) || [];
      console.log('Transaction types in response:', types);
      
      // Set transactions state and force a re-render
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, [walletCreated, wallet?.accountId, adminToken]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Create a new Hedera wallet for admin
  const createWallet = async () => {
    setCreating(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/wallet/create`, null, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (response.data.success) {
        setWalletCreated(true);
        setWallet({
          accountId: response.data.wallet.accountId,
          privateKey: response.data.wallet.privateKey,
          publicKey: response.data.wallet.publicKey,
          balance: response.data.wallet.balance,
          hashscanUrl: response.data.wallet.hashscanUrl,
        });
        fetchTransactions();
      }
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create wallet. Please try again later.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeposit = () => setShowDeposit(true);
  const handleWithdraw = () => setShowWithdraw(true);
  const closeDeposit = () => setShowDeposit(false);
  const closeWithdraw = () => setShowWithdraw(false);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setWithdrawError('MetaMask not detected. Please install MetaMask extension.');
      return;
    }
    setIsConnectingMetaMask(true);
    setWithdrawError('');
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      if (chainId !== 296) {
        setWithdrawError('Please connect to Hedera Testnet in MetaMask (Chain ID: 296)');
        setIsConnectingMetaMask(false);
        return;
      }
      const address = await signer.getAddress();
      setRecipientAddress(address);
      setMetaMaskConnected(true);
    } catch (error) {
      setWithdrawError(error.message || 'Failed to connect to MetaMask');
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);
    setWithdrawTxHash('');
    // Validate inputs
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError('Please enter a valid amount to withdraw');
      return;
    }
    if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      setWithdrawError('Please enter a valid EVM address (0x...)');
      return;
    }
    if (wallet && wallet.balance && parseFloat(withdrawAmount) > parseFloat(wallet.balance)) {
      setWithdrawError('Insufficient balance');
      return;
    }
    console.log('Withdraw API: adminToken =', adminToken);
    if (!adminToken) {
      setWithdrawError('Authentication error: Please log in again as admin.');
      setTimeout(() => {
        navigate('/admin-login');
      }, 1500);
      return;
    }
    try {
      const headers = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      };
      const response = await axios.post(`${API_URL}/wallet/withdraw`, {
        recipient: recipientAddress,
        amount: parseFloat(withdrawAmount),
        token: 'HBAR',
        accountId: wallet?.accountId
      }, { headers });
      setWithdrawSuccess(true);
      setWithdrawTxHash(response.data.transactionId);
      // Optionally refresh wallet info
      fetchWallet();
    } catch (error) {
      setWithdrawError(error.response?.data?.message || 'Failed to process withdrawal');
    }
  };

  return (
    <div className="admin-wallet-layout">
      <SidebarAdmin 
        sidebarOpen={sidebarOpen}
        activeSection="wallet-revenue"
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
      <div className={`admin-wallet-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <HeaderAdmin title="Wallet & Revenue" onToggleSidebar={toggleSidebar} />
        <div className="admin-wallet-content">
          <h1>Admin Wallet & Revenue</h1>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading wallet information...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <AlertCircle size={48} color="#e53935" />
              <h3>Error</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchWallet}>
                Retry
              </button>
            </div>
          ) : !walletCreated ? (
            <div className="create-wallet-container">
              <div className="create-wallet-card">
                <div className="create-wallet-icon">
                  <Wallet size={48} />
                </div>
                <h2>Create Admin Wallet</h2>
                <p>Create your Hedera wallet to manage HashGov finances and transactions</p>
                <button 
                  className={`create-wallet-btn ${creating ? 'creating' : ''}`} 
                  onClick={createWallet} 
                  disabled={creating}
                >
                  {creating ? 'Creating Wallet...' : 'Create Hedera Wallet'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Section 1: Wallet Details */}
              <div className="wallet-section">
                <h2><Wallet size={20} /> Wallet Details</h2>
                
                {wallet && (
                  <div className="wallet-balance">
                    {wallet.balance || '0'}
                    <span className="currency">HBAR</span>
                  </div>
                )}
                
                <div className="wallet-coords">
                  <div>
                    <strong>Account ID:</strong>
                    <span className="wallet-value">
                      {wallet?.accountId || 'N/A'}
                      <button 
                        className="copy-btn" 
                        onClick={() => copyToClipboard(wallet?.accountId, "account")}
                      >
                        {copiedField === "account" ? "Copied!" : <Copy size={16} />}
                      </button>
                    </span>
                  </div>
                  
                  <div>
                    <strong>Public Key:</strong>
                    <span className="wallet-value">
                      {showPublicKey ? 
                        wallet?.publicKey : 
                        '•••••••••••••••••••••••••••••••'}
                      <button 
                        className="copy-btn" 
                        onClick={() => setShowPublicKey(!showPublicKey)}
                      >
                        {showPublicKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {showPublicKey && (
                        <button 
                          className="copy-btn" 
                          onClick={() => copyToClipboard(wallet?.publicKey, "publicKey")}
                        >
                          {copiedField === "publicKey" ? "Copied!" : <Copy size={16} />}
                        </button>
                      )}
                    </span>
                  </div>
                  
                  <div>
                    <strong>Private Key:</strong>
                    <span className="wallet-value">
                      {showPrivateKey ? 
                        wallet?.privateKey : 
                        '•••••••••••••••••••••••••••••••'}
                      <button 
                        className="copy-btn" 
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {showPrivateKey && (
                        <button 
                          className="copy-btn" 
                          onClick={() => copyToClipboard(wallet?.privateKey, "privateKey")}
                        >
                          {copiedField === "privateKey" ? "Copied!" : <Copy size={16} />}
                        </button>
                      )}
                    </span>
                  </div>
                  
                  {wallet?.hashscanUrl && (
  <div>
    <strong>HashScan:</strong>
    <div className="hashscan-btn-container">
      <a 
        href={wallet.hashscanUrl} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <ExternalLink size={16} /> View on HashScan
      </a>
    </div>
  </div>
)}
                </div>
                
                <div className="wallet-actions">
                  <button onClick={handleDeposit} className="deposit-btn">
                    <ArrowDownLeft size={18} />
                    Deposit
                  </button>
                  <button onClick={handleWithdraw} className="withdraw-btn">
                    <ArrowUpRight size={18} />
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Section 2: Transactions & Revenues Table */}
              <div className="transactions-section">
                <div className="transactions-header">
                  <h2><CreditCard size={20} /> All Transactions & Revenues</h2>
                </div>
                
                <div className="transactions-table-wrapper">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{textAlign: 'center', padding: '32px 0'}}>
                            <Clock size={24} style={{margin: '0 auto 16px', opacity: 0.6, display: 'block'}} />
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx, idx) => (
                          <tr key={tx.transactionId || idx}>
                            <td>{new Date(tx.timestamp).toLocaleString()}</td>
                            <td>
                              {(() => {
                                // Format the transaction type for better display
                                const formatType = (type) => {
                                  // Replace underscores with spaces and capitalize each word
                                  return type
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');
                                };
                                return formatType(tx.type);
                              })()}
                            </td>
                            <td className={`tx-amount ${tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'transaction_fee' ? 'positive' : 'negative'}`}>
                              {tx.type === 'receive' || tx.type === 'deposit' || tx.type === 'transaction_fee' ? '+' : '-'}{tx.amount} HBAR
                            </td>
                            <td>
                              <span className={`tx-status ${tx.status.toLowerCase()}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="tx-id">
                              {formatAddress(tx.transactionId)}
                              {tx.transactionId && (
                                <a 
                                  href={`https://hashscan.io/testnet/transaction/${tx.transactionId}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{marginLeft: '8px'}}
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deposit Modal */}
              {showDeposit && (
                <div className="modal-overlay">
                  <div className="send-modal dark" ref={depositModalRef}>
                    <div className="send-modal-header">
                      <h3>Deposit HBAR</h3>
                      <button className="close-modal-btn" onClick={closeDeposit}><X size={20} /></button>
                    </div>
                    <div className="send-modal-content">
                      <div className="qr-code-container">
                        <div className="qr-code-label"><QrCode size={16} /> Scan to deposit HBAR</div>
                        <div className="qr-code">
                          {wallet?.accountId ? (
                            <QRCode value={wallet.accountId} size={200} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} viewBox={'0 0 256 256'} fgColor="#000000" bgColor="#ffffff" level="H" />
                          ) : (
                            <div className="qr-loading">Loading...</div>
                          )}
                        </div>
                        <div className="deposit-value-with-copy" style={{marginTop: '16px'}}>
                          <span className="address-value">{wallet?.accountId || 'Loading...'}</span>
                          <button className="copy-btn" onClick={() => copyToClipboard(wallet?.accountId, "depositAddress")}>{copiedField === "depositAddress" ? "Copied!" : <Copy size={16} />}</button>
                        </div>
                        <div className="deposit-warnings">
                          <div className="warning-box"><AlertCircle size={18} />
                            <span>Send only HBAR to this address. Sending any other asset may result in permanent loss.</span>
                          </div>
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button className="secondary-btn" onClick={closeDeposit}>Close</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Withdraw Modal */}
              {showWithdraw && (
                <div className="modal-overlay">
                  <div className="send-modal dark" ref={withdrawModalRef}>
                    <div className="send-modal-header">
                      <h3>Withdraw HBAR</h3>
                      <button className="close-modal-btn" onClick={closeWithdraw}><X size={20} /></button>
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
                                onChange={e => { const value = e.target.value; if (value === '' || /^\d*\.?\d*$/.test(value)) setWithdrawAmount(value); }}
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
                                onChange={e => setRecipientAddress(e.target.value)}
                                required
                              />
                            </div>
                            {!metaMaskConnected && (
                              <button type="button" className="connect-metamask-btn" onClick={connectMetaMask} disabled={isConnectingMetaMask}>
                                {isConnectingMetaMask ? 'Connecting...' : 'Connect MetaMask'}
                              </button>
                            )}
                            {metaMaskConnected && (
                              <div className="metamask-connected"><Shield size={16} /> Connected to MetaMask</div>
                            )}
                          </div>
                          {wallet && wallet.balance && (
                            <div className="balance-info">
                              <span>Available balance:</span>
                              <span className="balance-value">{wallet.balance} HBAR</span>
                            </div>
                          )}
                          {withdrawError && (
                            <div className="error-message"><AlertCircle size={16} />{withdrawError}</div>
                          )}
                          <button type="submit" className="send-button"><LogOut size={16} />Withdraw HBAR</button>
                        </form>
                      ) : (
                        <div className="hbar-modal-content success-content">
                          <div className="success-icon"><CheckCircle2 size={60} /></div>
                          <div className="success-message"><h3>Withdrawal Submitted</h3><p>Your withdrawal request has been submitted successfully.</p></div>
                          <div className="transaction-details">
                            <div className="detail-row"><span className="detail-label">Amount</span><span className="detail-value">{withdrawAmount} HBAR</span></div>
                            <div className="detail-row"><span className="detail-label">Recipient</span><span className="detail-value">{formatAddress(recipientAddress)}</span></div>
                            {withdrawTxHash && (
                              <div className="detail-row"><span className="detail-label">Transaction ID</span><span className="detail-value id-value">{withdrawTxHash}</span></div>
                            )}
                          </div>
                          <div className="success-actions">
                            {withdrawTxHash && (
                              <a href={`https://hashscan.io/testnet/transaction/${withdrawTxHash}`} target="_blank" rel="noopener noreferrer" className="view-hashscan-btn"><ExternalLink size={16} />View on HashScan</a>
                            )}
                            <button className="close-success-btn" onClick={closeWithdraw}>Close</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWallet;
