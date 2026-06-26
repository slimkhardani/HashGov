"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "./../components/sidebar/sidebar";
import Header from "./../components/header/header";
import "./help.css";

export default function HelpPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedFaqs, setExpandedFaqs] = useState({});

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleFaq = (id) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="help-page-wrapper">
      <div className="help-dashboard">
        <Sidebar activePage="help" onToggle={toggleSidebar} isOpen={isOpen} />

        <div className="help-main-content">
          <Header title="Help Center" onToggleSidebar={toggleSidebar} />

          <div className="help-content">
            <div className="help-header">
              <h1>Welcome to HashGov: User Guide</h1>
              <p>
                Learn how to get started and make the most of your HashGov account. This guide covers digital identity, wallet management, transactions, and certificates.
              </p>
            </div>

            <div className="help-section">
              <h2>Getting Started</h2>
              <div className="help-card">
                <h3>1. Digital Identity</h3>
                <ul>
                  <li>Go to the <Link to="/identity" className="help-link">Identity</Link> page to complete your verification.</li>
                  <li>Upload your government-issued ID and any required documents.</li>
                  <li>Once verified, your digital identity allows you to access all platform features securely.</li>
                </ul>
              </div>
              <div className="help-card">
                <h3>2. Wallet Management</h3>
                <ul>
                  <li>Access your wallet from the <Link to="/wallet" className="help-link">Wallet</Link> section.</li>
                  <li>View your HBAR balance and transaction history.</li>
                  <li>Send and receive HBAR securely. Always double-check recipient details before confirming transactions.</li>
                  <li>Backup your wallet credentials and never share your private keys.</li>
                </ul>
              </div>
              <div className="help-card">
                <h3>3. Transactions</h3>
                <ul>
                  <li>Initiate transfers directly from your wallet dashboard.</li>
                  <li>Enter the recipient's account ID and the amount to send.</li>
                  <li>Track all your transactions in the transaction history tab.</li>
                  <li>For large or unusual transactions, additional verification may be required for your security.</li>
                </ul>
              </div>
              <div className="help-card">
                <h3>4. Certificates</h3>
                <ul>
                  <li>Request, view, or share your digital certificates from the <Link to="/certificates" className="help-link">Certificates</Link> page.</li>
                  <li>Certificates are securely issued as NFTs on the Hedera network for authenticity and easy verification.</li>
                  <li>Share your certificate link with third parties for instant validation.</li>
                  <li>Manage certificate requests and approvals in the same section.</li>
                </ul>
              </div>
            </div>

            <div className="help-section">
              <h2>Digital Identity</h2>
              <div className="help-card">
                <h3>Setting Up Your Digital Identity</h3>
                <ol>
                  <li>
                    Go to the{" "}
                    <Link href="/identity" className="help-link">
                      Digital Identity
                    </Link>{" "}
                    page
                  </li>
                  <li>
                    Follow the verification process to confirm your identity
                  </li>
                  <li>
                    Upload required documents (government ID, proof of address)
                  </li>
                  <li>Complete the biometric verification if required</li>
                  <li>
                    Wait for verification approval (typically 24-48 hours)
                  </li>
                </ol>
              </div>

              <div className="help-card">
                <h3>Using Your Digital Identity</h3>
                <p>Your verified digital identity allows you to:</p>
                <ul>
                  <li>Sign documents electronically</li>
                  <li>Verify your identity to third-party services</li>
                  <li>Access restricted platform features</li>
                  <li>Create and manage certificates</li>
                </ul>
              </div>
            </div>

            <div className="help-section">
              <h2>Wallet & Transactions</h2>
              <div className="help-card">
                <h3>Managing Your Wallet</h3>
                <p>
                  On the{" "}
                  <Link href="/wallet" className="help-link">
                    Wallet
                  </Link>{" "}
                  page, you can:
                </p>
                <ul>
                  <li>View your current balance</li>
                  <li>Deposit funds using various payment methods</li>
                  <li>Withdraw funds to external accounts</li>
                  <li>Transfer funds to other users</li>
                  <li>View your transaction history</li>
                </ul>
              </div>

              <div className="help-card">
                <h3>NFT Certificates</h3>
                <p>
                  Your wallet displays your NFT certificates in three
                  categories:
                </p>
                <ul>
                  <li>
                    <strong>Sent:</strong> Certificates you've sent to others
                  </li>
                  <li>
                    <strong>Received:</strong> Certificates you've received from
                    others
                  </li>
                  <li>
                    <strong>Created:</strong> Certificates you've created
                  </li>
                </ul>
                <p>
                  Click on any certificate to view its details or perform
                  actions like sending or verifying.
                </p>
              </div>
            </div>

            <div className="help-section">
              <h2>Certificates</h2>
              <div className="help-card">
                <h3>Creating Certificates</h3>
                <ol>
                  <li>
                    Navigate to the{" "}
                    <Link href="/certificates" className="help-link">
                      Certificates
                    </Link>{" "}
                    page
                  </li>
                  <li>
                    Select the certificate type (Academic or Property-related)
                  </li>
                  <li>Choose the action (Register or Verify)</li>
                  <li>Fill in the required information</li>
                  <li>Submit the form to create your certificate</li>
                </ol>
              </div>

              <div className="help-card">
                <h3>Verifying Certificates</h3>
                <ol>
                  <li>Go to the Certificates page</li>
                  <li>Select "Property-related" and then "Verify"</li>
                  <li>Enter the 64-character digital signature</li>
                  <li>Click "Verify Certificate" to check its authenticity</li>
                </ol>
              </div>
            </div>

            <div className="help-section">
              <h2>Frequently Asked Questions</h2>
              <div className="help-faqs">
                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      expandedFaqs["faq1"] ? "expanded" : ""
                    }`}
                    onClick={() => toggleFaq("faq1")}
                  >
                    <span>How do I reset my password?</span>
                    {expandedFaqs["faq1"] ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  {expandedFaqs["faq1"] && (
                    <div className="faq-answer">
                      <p>
                        To reset your password, click "Forgot Password" on the
                        login page. Enter your email address to receive a
                        password reset link. Follow the instructions in the
                        email to create a new password.
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      expandedFaqs["faq2"] ? "expanded" : ""
                    }`}
                    onClick={() => toggleFaq("faq2")}
                  >
                    <span>How long do transactions take to process?</span>
                    {expandedFaqs["faq2"] ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  {expandedFaqs["faq2"] && (
                    <div className="faq-answer">
                      <p>
                        Most platform transactions process within seconds.
                        However, deposits and withdrawals involving external
                        banking systems may take 1-3 business days to complete.
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      expandedFaqs["faq3"] ? "expanded" : ""
                    }`}
                    onClick={() => toggleFaq("faq3")}
                  >
                    <span>Are digital certificates legally valid?</span>
                    {expandedFaqs["faq3"] ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  {expandedFaqs["faq3"] && (
                    <div className="faq-answer">
                      <p>
                        Yes, digital certificates issued through HashGov are
                        legally valid in jurisdictions that recognize digital
                        signatures and blockchain verification. The platform
                        complies with relevant electronic signature laws and
                        regulations.
                      </p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <div
                    className={`faq-question ${
                      expandedFaqs["faq4"] ? "expanded" : ""
                    }`}
                    onClick={() => toggleFaq("faq4")}
                  >
                    <span>
                      What should I do if I suspect unauthorized access?
                    </span>
                    {expandedFaqs["faq4"] ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  {expandedFaqs["faq4"] && (
                    <div className="faq-answer">
                      <p>
                        If you suspect unauthorized access: 1) Change your
                        password immediately, 2) Enable two-factor
                        authentication if not already active, 3) Check your
                        account activity for suspicious transactions, and 4)
                        Contact support at support@hashgov.com to report the
                        incident.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="help-section">
              <h2>Need More Help?</h2>
              <div className="help-card contact-card">
                <p>
                  If you couldn't find the answer you're looking for, please
                  contact our support team:
                </p>
                <div className="contact-info">
  <p>
    <strong>Email:</strong> hashgov.messages@gmail.com
  </p>
  <p>
    <strong>Phone:</strong> +216 20 202 020<br />+216 21 202 020
  </p>
  <p>
    <strong>Address:</strong> SotuPub Agency, Sousse, 4000
  </p>
  <p>
    <strong>Business Hours:</strong> Monday - Friday: 9am - 6pm<br />Saturday - Sunday: Closed
  </p>
</div>
<button className="contact-button">Contact Support</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
