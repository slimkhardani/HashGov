import { Zap, Lock, BarChart3, Users } from "lucide-react";
import { SectionHeader } from "../../components/section-header/section-header";
import { Logo } from "../../components/logo/logo";
import "./hedera-section.css";

export default function HederaSection() {
  return (
    <section id="hedera" className="hedera-section">
      <SectionHeader
        title="Powered by Hedera Hashgraph"
        description="Fast, fair, and secure distributed ledger technology"
      />
      <div className="hedera-content">
        <div className="hedera-text">
          <p>
            HashGov leverages Hedera Hashgraph's advanced consensus algorithm to
            provide:
          </p>
          <ul className="feature-list">
            <li>
              <Zap className="list-icon" /> Lightning-fast transaction speeds
            </li>
            <li>
              <Lock className="list-icon" /> Military-grade security
            </li>
            <li>
              <BarChart3 className="list-icon" /> Unmatched scalability
            </li>
            <li>
              <Users className="list-icon" /> Fair access and governance
            </li>
          </ul>
          <button className="learn-more-btn">Learn More About Hedera</button>
        </div>
        <div className="hedera-image">
          <div className="hedera-diagram-image">
            <Logo />
          </div>
        </div>
      </div>
    </section>
  );
}
