import { Shield, FileCheck, Wallet } from "lucide-react";
import { SectionHeader } from "../../components/section-header/section-header";
import identityImage from "./../../images/identity.JPG";
import "./services-section.css";

export default function ServicesSection() {
  return (
    <section id="services" className="services-section">
      <SectionHeader
        title="Our Services"
        description="Transforming governance with blockchain technology"
      />
      <div className="features-container">
        <div className="features-image">
          <img src={identityImage} alt="Digital Identity Illustration" />
        </div>
        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon">
              <Shield />
            </div>
            <div className="feature-content">
              <h3>Decentralized Digital Identity</h3>
              <p>
                Secure digital profiles stored as unique NFTs, giving you
                complete control over your personal information.
              </p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <Wallet />
            </div>
            <div className="feature-content">
              <h3>Decentralized Wallet</h3>
              <p>
                Send and receive secure payments with complete transparency and
                integration with other payment services.
              </p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <FileCheck />
            </div>
            <div className="feature-content">
              <h3>Digital Certificates</h3>
              <p>
                Issue and verify academic certificates and property titles as
                NFTs with rapid authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
