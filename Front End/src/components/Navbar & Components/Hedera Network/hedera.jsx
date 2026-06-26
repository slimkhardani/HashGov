"use client";
import Navbar from "../navbar/navbar";
import Footer from "../../footer/footer";
import { SectionHeader } from "../../section-header/section-header";
import {
  Zap,
  Lock,
  BarChart3,
  Users,
  Scale,
  Leaf,
  Check,
  X,
  FileText,
  Coins,
  Code,
  Database,
  Globe,
  Shield,
  Clock,
  Building,
  Landmark,
} from "lucide-react";
import "./hedera.css";

export default function HederaPage() {
  return (
    <div className="hashgov-container">
      <Navbar />

      <div className="hedera-hero">
        <div className="hero-content">
          <h1>Hedera Network</h1>
          <p>
            The most used, sustainable, enterprise-grade public network for the
            decentralized economy
          </p>
          <div className="hero-buttons">
            <a href="https://hedera.com/getting-started">
              <button className="primary-button">Get Started</button>
            </a>
            <a href="https://docs.hedera.com/hedera">
              <button className="secondary-button">Learn More</button>
            </a>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="hero-nodes">
            <div className="hero-node node1"></div>
            <div className="hero-node node2"></div>
            <div className="hero-node node3"></div>
            <div className="hero-node node4"></div>
            <div className="hero-node node5"></div>
            <div className="hero-node node6"></div>
            <div className="hero-lines"></div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <section className="hedera-overview">
          <SectionHeader
            title="What is Hedera?"
            description="Hedera is a fully open source, proof-of-stake, public distributed ledger that utilizes the fast, fair, and secure hashgraph consensus algorithm."
          />

          <div className="overview-content">
            <div className="overview-text">
              <p>
                Hedera goes beyond blockchain to provide the high-performance
                distributed ledger technology needed for enterprise adoption.
                Unlike traditional blockchain systems, Hedera uses the
                innovative hashgraph consensus algorithm to achieve
                unprecedented levels of speed, security, and fairness.
              </p>
              <p>
                The network is governed by the Hedera Governing Council, a
                diverse group of leading global organizations across multiple
                industries and geographies. This governance model ensures the
                platform remains decentralized, stable, and trusted.
              </p>
              <div className="key-features">
                <div className="key-feature">
                  <div className="feature-icon">
                    <Zap />
                  </div>
                  <div className="feature-text">
                    <h4>Lightning Fast</h4>
                    <p>
                      10,000+ transactions per second with 3-5 second finality
                    </p>
                  </div>
                </div>
                <div className="key-feature">
                  <div className="feature-icon">
                    <Lock />
                  </div>
                  <div className="feature-text">
                    <h4>Highly Secure</h4>
                    <p>
                      Asynchronous Byzantine Fault Tolerance (aBFT) security
                    </p>
                  </div>
                </div>
                <div className="key-feature">
                  <div className="feature-icon">
                    <Leaf />
                  </div>
                  <div className="feature-text">
                    <h4>Carbon Negative</h4>
                    <p>Energy-efficient with a carbon-negative footprint</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="council-diagram">
              <div className="council-center">
                <div className="council-logo">Hedera</div>
                <div className="council-subtitle">Governing Council</div>
              </div>
              <div className="council-members">
                <div className="council-member">Google</div>
                <div className="council-member">IBM</div>
                <div className="council-member">Boeing</div>
                <div className="council-member">Deutsche Telekom</div>
                <div className="council-member">LG</div>
                <div className="council-member">Avery Dennison</div>
                <div className="council-member">DLA Piper</div>
                <div className="council-member">FIS</div>
              </div>
            </div>
          </div>
        </section>

        <section className="comparison-section">
          <SectionHeader
            title="Blockchain vs. Hashgraph"
            description="Understanding the fundamental differences between traditional blockchain technology and Hedera's hashgraph consensus algorithm."
          />

          <div className="comparison-container">
            <div className="comparison-item blockchain">
              <div className="comparison-header">
                <h3>Blockchain</h3>
                <div className="comparison-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    stroke="currentColor"
                    fill="none"
                  >
                    <rect x="2" y="7" width="20" height="10" rx="2" />
                    <path d="M17 7V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3" />
                    <path d="M7 17v3a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" />
                  </svg>
                </div>
              </div>
              <div className="comparison-content">
                <div className="comparison-feature">
                  <div className="feature-icon negative">
                    <X size={16} />
                  </div>
                  <div className="feature-text">Slow (3-12 TPS)</div>
                </div>
                <div className="comparison-feature">
                  <div className="feature-icon negative">
                    <X size={16} />
                  </div>
                  <div className="feature-text">
                    High fees ($19-$22 per transaction)
                  </div>
                </div>
                <div className="comparison-feature">
                  <div className="feature-icon negative">
                    <X size={16} />
                  </div>
                  <div className="feature-text">
                    Energy intensive (Proof of Work)
                  </div>
                </div>
                <div className="comparison-feature">
                  <div className="feature-icon negative">
                    <X size={16} />
                  </div>
                  <div className="feature-text">
                    Vulnerable to certain attacks
                  </div>
                </div>
                <div className="comparison-feature">
                  <div className="feature-icon negative">
                    <X size={16} />
                  </div>
                  <div className="feature-text">
                    Long confirmation times (minutes to hours)
                  </div>
                </div>
              </div>
            </div>

            <div className="comparison-vs">VS</div>

            <div className="comparison-item hashgraph">
              <div className="comparison-header">
                <h3>Hashgraph</h3>
                <div className="comparison-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    stroke="currentColor"
                    fill="none"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <div className="comparison-content">
                <div className="comparison-feature">
                  <div className="feature-icon positive">
                    <Check size={16} />
                  </div>
                  <div className="feature-text">Fast (10,000+ TPS)</div>
                </div>
                <div className="comparison-feature">
                  <div className="feature-icon positive">
                    <Check size={16} />
                  </div>
                  <div className="feature-text">
                    Low fees ($0.0001 per transaction)
                  </div>
                </div>
                <div className="comparison-feature">
                  <div className="feature-icon positive">
                    <Check size={16} />
                  </div>
                  <div className="feature-text">
                    Energy efficient (Proof of Stake)
                  </div>
                </div>
                <div className="comparison-feature">
                  <div className="feature-icon positive">
                    <Check size={16} />
                  </div>
                  <div className="feature-text">
                    Asynchronous Byzantine Fault Tolerance
                  </div>
                </div>
                <div className="comparison-feature">
                  <div className="feature-icon positive">
                    <Check size={16} />
                  </div>
                  <div className="feature-text">
                    Fast finality (3-5 seconds)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="performance-section">
          <SectionHeader
            title="Performance Comparison"
            description="See how Hedera outperforms traditional blockchain platforms across key metrics"
          />

          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Bitcoin</th>
                  <th>Ethereum</th>
                  <th>Hedera</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Consensus Mechanism</td>
                  <td>Proof of Work</td>
                  <td>Proof of Stake</td>
                  <td>Hashgraph (PoS)</td>
                </tr>
                <tr>
                  <td>Transactions Per Second</td>
                  <td>5-7</td>
                  <td>12-15</td>
                  <td>
                    <span className="highlight">10,000+</span>
                  </td>
                </tr>
                <tr>
                  <td>Transaction Fee</td>
                  <td>$15-$25</td>
                  <td>$5-$20</td>
                  <td>
                    <span className="highlight">$0.0001</span>
                  </td>
                </tr>
                <tr>
                  <td>Finality Time</td>
                  <td>60+ minutes</td>
                  <td>5-10 minutes</td>
                  <td>
                    <span className="highlight">3-5 seconds</span>
                  </td>
                </tr>
                <tr>
                  <td>Energy Consumption</td>
                  <td>Very High</td>
                  <td>Medium</td>
                  <td>
                    <span className="highlight">Very Low</span>
                  </td>
                </tr>
                <tr>
                  <td>Smart Contracts</td>
                  <td>Limited</td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="tech-pillars-section">
          <SectionHeader
            title="Technology Leadership"
            description="Hedera's technological advantages make it the ideal platform for enterprise-grade applications."
          />

          <div className="tech-pillars">
            <div className="tech-pillar">
              <div className="pillar-icon">
                <Zap size={32} />
              </div>
              <h3>Fast</h3>
              <p>10,000+ transactions per second with 3-5 second finality</p>
            </div>
            <div className="tech-pillar">
              <div className="pillar-icon">
                <Lock size={32} />
              </div>
              <h3>Secure</h3>
              <p>
                Asynchronous Byzantine Fault Tolerance (aBFT) - the gold
                standard in security
              </p>
            </div>
            <div className="tech-pillar">
              <div className="pillar-icon">
                <Scale size={32} />
              </div>
              <h3>Fair</h3>
              <p>Fair ordering of transactions with consensus timestamps</p>
            </div>
            <div className="tech-pillar">
              <div className="pillar-icon">
                <Leaf size={32} />
              </div>
              <h3>Sustainable</h3>
              <p>Carbon-negative network with minimal energy consumption</p>
            </div>
          </div>
        </section>

        <section className="ecosystem-section">
          <SectionHeader
            title="Hedera Ecosystem"
            description="A comprehensive network of services and solutions built on the Hedera platform."
          />

          <div className="ecosystem-diagram">
            <div className="ecosystem-layer users">
              <h3>End Users</h3>
              <div className="ecosystem-items">
                <div className="ecosystem-item">
                  <Users size={16} />
                  <span>Individuals</span>
                </div>
                <div className="ecosystem-item">
                  <Building size={16} />
                  <span>Enterprises</span>
                </div>
                <div className="ecosystem-item">
                  <Landmark size={16} />
                  <span>Governments</span>
                </div>
                <div className="ecosystem-item">
                  <Code size={16} />
                  <span>Developers</span>
                </div>
              </div>
            </div>

            <div className="ecosystem-connector">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path
                  d="M20 0v40"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            <div className="ecosystem-layer applications">
              <h3>Applications</h3>
              <div className="ecosystem-items">
                <div className="ecosystem-item">DeFi</div>
                <div className="ecosystem-item">Digital Identity</div>
                <div className="ecosystem-item">Supply Chain</div>
                <div className="ecosystem-item">Healthcare</div>
                <div className="ecosystem-item">Gaming</div>
                <div className="ecosystem-item">NFTs</div>
              </div>
            </div>

            <div className="ecosystem-connector">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path
                  d="M20 0v40"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            <div className="ecosystem-layer services">
              <h3>Network Services</h3>
              <div className="ecosystem-services">
                <div className="service-card">
                  <div className="service-icon">
                    <Coins size={24} />
                  </div>
                  <h4>Token Service</h4>
                  <p>
                    Enables the configuration, minting, and management of
                    fungible and non-fungible tokens.
                  </p>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <Code size={24} />
                  </div>
                  <h4>Smart Contract Service</h4>
                  <p>
                    Allows for the deployment and execution of Solidity smart
                    contracts on the Hedera network.
                  </p>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <Database size={24} />
                  </div>
                  <h4>Consensus Service</h4>
                  <p>
                    Provides a verifiable timestamp and ordering of events for
                    any application.
                  </p>
                </div>
                <div className="service-card">
                  <div className="service-icon">
                    <FileText size={24} />
                  </div>
                  <h4>File Service</h4>
                  <p>
                    Provides immutable storage for files and documents on the
                    Hedera network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="use-cases-section">
          <SectionHeader
            title="Real-World Applications"
            description="How organizations are leveraging Hedera to solve complex business challenges"
          />

          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-icon">
                <Globe size={32} />
              </div>
              <h3>Supply Chain Management</h3>
              <p>
                Track products from origin to consumer with immutable audit
                trails and real-time visibility.
              </p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">
                <Shield size={32} />
              </div>
              <h3>Digital Identity</h3>
              <p>
                Secure, self-sovereign identity solutions for individuals,
                organizations, and devices.
              </p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">
                <Coins size={32} />
              </div>
              <h3>Tokenized Assets</h3>
              <p>
                Create and manage digital representations of real-world assets
                with fractional ownership.
              </p>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">
                <BarChart3 size={32} />
              </div>
              <h3>Decentralized Finance</h3>
              <p>
                Build financial applications with high throughput, low fees, and
                regulatory compliance.
              </p>
            </div>
          </div>
        </section>

        <section className="sustainability-section">
          <div className="sustainability-content">
            <div className="sustainability-icon">
              <Leaf size={48} />
            </div>
            <h2>Carbon-Negative Network</h2>
            <p>
              Hedera is committed to sustainable operations and has achieved
              carbon-negative status through renewable energy purchases and
              carbon offsets that exceed the network's energy consumption.
            </p>
            <div className="sustainability-stats">
              <div className="stat-item">
                <div className="stat-value">0.04</div>
                <div className="stat-label">Watt-hours per transaction</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">99.99%</div>
                <div className="stat-label">
                  More energy-efficient than Bitcoin
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-value">-373%</div>
                <div className="stat-label">Carbon footprint (negative)</div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to build on Hedera?</h2>
            <p>
              Contact our team to learn how HashGov can help you leverage the
              power of the Hedera network for your organization.
            </p>
            <div className="cta-buttons">
              <a href="https://hedera.com/getting-started">
                <button className="cta-button primary">Get Started</button>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
