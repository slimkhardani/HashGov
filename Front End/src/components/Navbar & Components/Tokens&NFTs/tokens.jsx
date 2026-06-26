"use client";
import Navbar from "../navbar/navbar";
import Footer from "../../footer/footer";
import { SectionHeader } from "../../section-header/section-header";
import { Link } from "react-router-dom";
import {
  Fingerprint,
  FileCheck,
  CreditCard,
  Building,
  User,
  Landmark,
  ShieldCheck,
  Coins,
} from "lucide-react";
import "./tokens.css";

export default function TokensPage() {
  return (
    <div className="hashgov-container">
      <Navbar />

      <div className="page-content">
        <div className="tokens-hero">
          <h1>Tokens & NFTs</h1>
          <p>The building blocks of our secure digital ecosystem</p>
        </div>

        <section className="tokens-overview">
          <SectionHeader
            title="Understanding Tokens"
            description="Tokens are digital assets that represent value, ownership, or access rights on the Hedera network."
          />

          <div className="overview-content">
            <div className="overview-text">
              <p>
                Tokens on the Hedera network are digital assets that can
                represent virtually anything of value: from currencies and
                securities to loyalty points, property rights, and more. They
                are secured by the Hedera distributed ledger, making them
                tamper-proof and verifiable.
              </p>
              <p>
                Hedera supports two main types of tokens:{" "}
                <strong>fungible tokens</strong> (identical and interchangeable,
                like currencies) and <strong>non-fungible tokens (NFTs)</strong>{" "}
                (unique and non-interchangeable, like digital certificates or
                identity credentials).
              </p>
              <p>
                HashGov leverages Hedera's token service to create secure,
                efficient, and compliant token-based solutions for governance,
                identity management, and secure transactions.
              </p>
            </div>
            <div className="overview-image">
              <div className="token-graphic">
                <div className="token-circle">
                  <Coins size={64} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="token-types">
          <SectionHeader
            title="Types of Tokens"
            description="Hedera supports both fungible and non-fungible tokens, each with unique properties and use cases."
          />

          <div className="types-grid">
            <div className="type-card">
              <h3>Fungible Tokens</h3>
              <p>
                Identical and interchangeable tokens that can be divided into
                smaller units.
              </p>
              <div className="type-examples">
                <div className="example-item">
                  <CreditCard className="example-icon" />
                  <div>
                    <h4>Currencies</h4>
                    <p>Digital currencies and stablecoins</p>
                  </div>
                </div>
                <div className="example-item">
                  <Building className="example-icon" />
                  <div>
                    <h4>Securities</h4>
                    <p>Tokenized stocks, bonds, and other securities</p>
                  </div>
                </div>
                <div className="example-item">
                  <Landmark className="example-icon" />
                  <div>
                    <h4>Governance</h4>
                    <p>Voting rights and governance tokens</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="type-card">
              <h3>Non-Fungible Tokens (NFTs)</h3>
              <p>
                Unique tokens that represent ownership of a specific item or
                piece of data.
              </p>
              <div className="type-examples">
                <div className="example-item">
                  <Fingerprint className="example-icon" />
                  <div>
                    <h4>Identity</h4>
                    <p>Digital identity credentials and profiles</p>
                  </div>
                </div>
                <div className="example-item">
                  <FileCheck className="example-icon" />
                  <div>
                    <h4>Certificates</h4>
                    <p>Academic credentials and property titles</p>
                  </div>
                </div>
                <div className="example-item">
                  <ShieldCheck className="example-icon" />
                  <div>
                    <h4>Licenses</h4>
                    <p>Professional licenses and certifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hashgov-tokens">
          <SectionHeader
            title="HashGov Token Solutions"
            description="Our specialized token implementations for governance, identity, and secure transactions."
          />

          <div className="tokens-grid">
            <div className="token-card">
              <div className="token-icon">ID</div>
              <h3>Identity NFTs</h3>
              <p>
                Unique, non-fungible tokens that securely store your digital
                identity with privacy controls.
              </p>
              <div className="token-features">
                <h4>Key Features</h4>
                <ul>
                  <li>Self-sovereign identity management</li>
                  <li>Selective disclosure of personal information</li>
                  <li>Biometric authentication integration</li>
                  <li>Revocation and update capabilities</li>
                  <li>Interoperability with existing identity systems</li>
                </ul>
              </div>
            </div>

            <div className="token-card">
              <div className="token-icon">CERT</div>
              <h3>Certificate NFTs</h3>
              <p>
                Tamper-proof digital certificates for academic achievements and
                property ownership.
              </p>
              <div className="token-features">
                <h4>Key Features</h4>
                <ul>
                  <li>Instant verification of authenticity</li>
                  <li>Permanent, immutable record-keeping</li>
                  <li>Expiration and renewal management</li>
                  <li>Embedded metadata and credentials</li>
                  <li>Secure sharing and presentation</li>
                </ul>
              </div>
            </div>

            <div className="token-card">
              <div className="token-icon">TXN</div>
              <h3>Transaction Tokens</h3>
              <p>
                Secure tokens for financial transactions between citizens,
                businesses, and institutions.
              </p>
              <div className="token-features">
                <h4>Key Features</h4>
                <ul>
                  <li>Near-instant settlement times</li>
                  <li>Minimal transaction fees</li>
                  <li>Programmable compliance rules</li>
                  <li>Multi-signature authorization</li>
                  <li>Complete transaction history</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="use-cases">
          <SectionHeader
            title="Real-World Applications"
            description="How organizations are leveraging HashGov's token solutions to solve real-world problems."
          />

          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-header">
                <h3>Individual Identity Management</h3>
              </div>
              <p>
                Individuals can maintain a secure digital identity that gives
                them complete control over their personal information while
                simplifying interactions with government services, financial
                institutions, and other organizations.
              </p>
              <div className="use-case-benefits">
                <h4>Benefits</h4>
                <ul>
                  <li>Reduced risk of identity theft</li>
                  <li>Simplified KYC/AML processes</li>
                  <li>Streamlined access to services</li>
                  <li>Enhanced privacy protection</li>
                </ul>
              </div>
            </div>

            <div className="use-case-card">
              <div className="use-case-header">
                <h3>Enterprise Credential Verification</h3>
              </div>
              <p>
                Businesses can verify employee credentials, professional
                certifications, and licenses instantly, reducing administrative
                overhead and ensuring compliance with regulatory requirements.
              </p>
              <div className="use-case-benefits">
                <h4>Benefits</h4>
                <ul>
                  <li>Streamlined hiring processes</li>
                  <li>Reduced risk of credential fraud</li>
                  <li>Automated compliance verification</li>
                  <li>Simplified credential updates</li>
                </ul>
              </div>
            </div>

            <div className="use-case-card">
              <div className="use-case-header">
                <h3>Government Document Issuance</h3>
              </div>
              <p>
                Government agencies can issue digital versions of official
                documents like property titles, business licenses, and permits
                as NFTs, ensuring their authenticity and simplifying
                verification.
              </p>
              <div className="use-case-benefits">
                <h4>Benefits</h4>
                <ul>
                  <li>Elimination of document fraud</li>
                  <li>Reduced administrative costs</li>
                  <li>Simplified document updates</li>
                  <li>Improved citizen experience</li>
                </ul>
              </div>
            </div>

            <div className="use-case-card">
              <div className="use-case-header">
                <h3>Secure Financial Transactions</h3>
              </div>
              <p>
                Organizations can conduct secure, transparent financial
                transactions with minimal fees and near-instant settlement
                times, improving cash flow and reducing reconciliation efforts.
              </p>
              <div className="use-case-benefits">
                <h4>Benefits</h4>
                <ul>
                  <li>Reduced transaction costs</li>
                  <li>Improved cash flow management</li>
                  <li>Enhanced transaction security</li>
                  <li>Simplified reconciliation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to tokenize your assets?</h2>
            <p>
              Contact our team to learn how HashGov's token solutions can
              transform your organization.
            </p>
            <Link to="/signup">
              <button className="cta-button">Get Started</button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
