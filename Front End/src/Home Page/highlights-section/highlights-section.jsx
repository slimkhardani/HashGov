import { Zap, Lock, Users, BarChart3, Shield, FileCheck } from "lucide-react";
import { SectionHeader } from "../../components/section-header/section-header";
import "./highlights-section.css";

export default function HighlightsSection() {
  return (
    <section className="highlights-section">
      <SectionHeader
        title="Highlights"
        description="Explore why our product stands out: adaptability, durability, user-friendly design, and innovation. Enjoy reliable customer support and precision in every detail."
      />
      <div className="highlights-grid">
        <div className="highlight-card">
          <div className="highlight-icon">
            <Zap />
          </div>
          <h3>Adaptable performance</h3>
          <p>
            Our product effortlessly adjusts to your needs, boosting efficiency
            and simplifying your tasks.
          </p>
        </div>
        <div className="highlight-card">
          <div className="highlight-icon">
            <Lock />
          </div>
          <h3>Built to last</h3>
          <p>
            Experience unmatched durability that goes above and beyond with
            lasting investment.
          </p>
        </div>
        <div className="highlight-card">
          <div className="highlight-icon">
            <Users />
          </div>
          <h3>Great user experience</h3>
          <p>
            Integrate our product into your routine with an intuitive and
            easy-to-use interface.
          </p>
        </div>
        <div className="highlight-card">
          <div className="highlight-icon">
            <BarChart3 />
          </div>
          <h3>Innovative functionality</h3>
          <p>
            Stay ahead with features that set new standards, addressing your
            evolving needs better than the rest.
          </p>
        </div>
        <div className="highlight-card">
          <div className="highlight-icon">
            <Shield />
          </div>
          <h3>Reliable support</h3>
          <p>
            Count on our responsive customer support, offering assistance that
            goes beyond the purchase.
          </p>
        </div>
        <div className="highlight-card">
          <div className="highlight-icon">
            <FileCheck />
          </div>
          <h3>Precision in every detail</h3>
          <p>
            Enjoy a meticulously crafted product where small touches make a
            significant impact on your overall experience.
          </p>
        </div>
      </div>
    </section>
  );
}
