import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./hero-section.css";
import axios from "axios";

export default function HeroSection() {
  const [profileCount, setProfileCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [nftCount, setNftCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [profilesRes, transactionsRes, nftsRes] = await Promise.all([
          axios.get("/api/stats/profiles-count"),
          axios.get("/api/stats/transactions-count"),
          axios.get("/api/stats/nfts-count"),
        ]);
        setProfileCount(profilesRes.data.count);
        setTransactionCount(transactionsRes.data.count);
        setNftCount(nftsRes.data.count);
      } catch (err) {
        // Optionally handle error
        setProfileCount(0);
        setTransactionCount(0);
        setNftCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="h1-home">Secure Governance on Hedera Hashgraph</h1>
        <p>
          A revolutionary platform offering decentralized digital identity
          management, secure financial transactions, and tamper-proof digital
          certificates.
        </p>
        <div className="cta-container">
          <Link to="/signup">
            <button className="cta-button">Start now</button>
          </Link>
        </div>
        <p className="terms-text">
          By clicking "Start now" you agree to our Terms & Conditions.
        </p>
      </div>
      <div className="hero-image">
        <div className="dashboard-preview">
          <div className="dashboard-header">
            <div className="dashboard-title">HashGov Dashboard</div>
          </div>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-title">Identity NFTs</div>
              <div className="stat-value-c">+{loading ? "..." : profileCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Transactions</div>
              <div className="stat-value-c">+{loading ? "..." : transactionCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Certificates NFTs</div>
              <div className="stat-value-c">+{loading ? "..." : nftCount}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
