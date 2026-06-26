import { SectionHeader } from "../../components/section-header/section-header";
import "./contact-section.css";
import { Link } from "react-router-dom";

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section">
      <SectionHeader
        title="Contact Us"
        description="Interested in learning more? Get in touch with our team."
      />
      <Link to="/contact">
        <center>
          <button className="cta-button">Visit Contact</button>
        </center>
      </Link>
    </section>
  );
}
