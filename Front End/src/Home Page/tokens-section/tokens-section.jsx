import { SectionHeader } from "../../components/section-header/section-header";
import "./tokens-section.css";

export default function TokensSection() {
  return (
    <section id="tokens" className="tokens-section">
      <SectionHeader
        title="Tokens & NFTs"
        description="The building blocks of our secure digital ecosystem"
      />
      <div className="tokens-grid">
        <div className="token-card">
          <div className="token-icon">ID</div>
          <h3>Identity NFTs</h3>
          <p>
            Unique, non-fungible tokens that securely store your digital
            identity with privacy controls.
          </p>
        </div>
        <div className="token-card">
          <div className="token-icon">CERT</div>
          <h3>Certificate NFTs</h3>
          <p>
            Tamper-proof digital certificates for academic achievements and
            property ownership.
          </p>
        </div>
        <div className="token-card">
          <div className="token-icon">TXN</div>
          <h3>Transaction Tokens</h3>
          <p>
            Secure tokens for financial transactions between citizens,
            businesses, and institutions.
          </p>
        </div>
      </div>
    </section>
  );
}
