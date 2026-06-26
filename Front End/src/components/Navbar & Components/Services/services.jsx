"use client";
import Navbar from "../navbar/navbar";
import Footer from "../../footer/footer";
import { SectionHeader } from "../../section-header/section-header";
import { Shield, FileCheck, Wallet, Database, UserCheck } from "lucide-react";
import "./services.css";

export default function ServicesPage() {
  return (
    <div className="hashgov-container">
      <Navbar />

      <div className="page-content">
        <div className="services-hero">
          <h1>Our Services</h1>
          <p>
            Comprehensive blockchain solutions powered by Hedera Hashgraph
            technology
          </p>
        </div>

        <section className="services-overview">
          <SectionHeader
            title="What We Offer"
            description="HashGov provides a suite of advanced services built on the Hedera Hashgraph network, designed to revolutionize governance, identity management, and secure transactions."
          />

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <Shield size={32} />
              </div>
              <h3>Decentralized Digital Identity</h3>
              <p>
                Our digital identity solution creates secure, tamper-proof
                digital profiles stored as unique NFTs on the Hedera network.
              </p>

              <div className="service-details">
                <h4>Key Features</h4>
                <ul>
                  <li>Self-sovereign identity management</li>
                  <li>Selective disclosure of personal information</li>
                  <li>Biometric authentication options</li>
                  <li>Integration with existing identity systems</li>
                </ul>

                <h4>Benefits</h4>
                <ul>
                  <li>Complete control over your personal information</li>
                  <li>Reduced risk of identity theft</li>
                  <li>Streamlined access to services</li>
                  <li>Elimination of password fatigue</li>
                </ul>
              </div>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <Wallet size={32} />
              </div>
              <h3>Decentralized Wallet</h3>
              <p>
                Our secure wallet solution enables fast, transparent financial
                transactions with complete auditability and integration with
                other payment services.
              </p>

              <div className="service-details">
                <h4>Key Features</h4>
                <ul>
                  <li>TND/HBAR Currencies support</li>
                  <li>Hardware security integration</li>
                  <li>Transaction scheduling</li>
                  <li>Automated compliance checks</li>
                </ul>

                <h4>Benefits</h4>
                <ul>
                  <li>Minimal transaction fees</li>
                  <li>Enhanced security through decentralization</li>
                  <li>Complete transaction history</li>
                  <li>Interoperability with traditional financial systems</li>
                </ul>
              </div>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <FileCheck size={32} />
              </div>
              <h3>Digital Certificates</h3>
              <p>
                Issue and verify academic certificates as well as
                property-related documents—such as car, motorcycle, and real
                estate registrations, with rapid authentication capabilities.
              </p>

              <div className="service-details">
                <h4>Key Features</h4>
                <ul>
                  <li>
                    Issue academic certificates and property documents as secure
                    NFTs
                  </li>
                  <li>
                    Verify documents instantly through a unique digital
                    signature
                  </li>
                  <li>
                    Allow users to easily check the status and history of any
                    document
                  </li>
                  <li>
                    Protect against fraud with built-in authenticity and
                    ownership tracking
                  </li>
                </ul>

                <h4>Benefits</h4>
                <ul>
                  <li>Elimination of document fraud</li>
                  <li>Simplified credential verification</li>
                  <li>Permanent, immutable record-keeping</li>
                  <li>Enhanced privacy and security</li>
                </ul>
              </div>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <Database size={32} />
              </div>
              <h3>Data Integrity Services</h3>
              <p>
                Ensure the authenticity and integrity of critical data through
                immutable storage and verification on the Hedera network.
              </p>

              <div className="service-details">
                <h4>Key Features</h4>
                <ul>
                  <li>Cryptographic verification</li>
                  <li>Distributed data storage</li>
                  <li>Automated integrity checks</li>
                </ul>

                <h4>Benefits</h4>
                <ul>
                  <li>Protection against data tampering</li>
                  <li>Increased stakeholder trust</li>
                  <li>Reduced risk of data breaches</li>
                </ul>
              </div>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <UserCheck size={32} />
              </div>
              <h3>Governance Solutions</h3>
              <p>
                Streamline organizational governance with transparent
                decision-making processes, secure voting, and immutable
                record-keeping.
              </p>

              <div className="service-details">
                <h4>Key Features</h4>
                <ul>
                  <li>Decentralized autonomous organizations (DAOs)</li>
                  <li>Smart contract governance</li>
                  <li>Stakeholder management</li>
                </ul>

                <h4>Benefits</h4>
                <ul>
                  <li>Transparent decision-making</li>
                  <li>Immutable governance records</li>
                  <li>Automated compliance with governance rules</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
