"use client";
import { useState } from "react";
import Navbar from "../navbar/navbar.jsx";
import Footer from "../../footer/footer.jsx";
import { SectionHeader } from "../../section-header/section-header.jsx";
import { Mail, Phone, MapPin, Clock, Globe } from "lucide-react";
import { contactApi } from "./api.ts";
import "./contact.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await contactApi.submitContact(formData);
      setStatus({ message: "Message sent successfully!", type: "success" });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        message: error.message || "Failed to send message",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hashgov-container">
      <Navbar />

      <div className="page-content">
        <div className="contact-hero">
          <h1>Contact Us</h1>
          <p>Get in touch with our team to learn more about HashGov</p>
        </div>

        <section className="contact-section">
          <div className="contact-container">
            <div className="contact-info-panel">
              <h2>Get In Touch</h2>
              <p>
                Have questions about our services or want to schedule a
                consultation? Our team is here to help.
              </p>

              <div className="contact-info-items">
                <div className="contact-info-item">
                  <div className="contact-icon">
                    <Mail />
                  </div>
                  <div className="contact-details">
                    <h3>Email</h3>
                    <p>hashgov.messages@gmail.com</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <Phone />
                  </div>
                  <div className="contact-details">
                    <h3>Phone</h3>
                    <p>+216 20 202 020</p>
                    <p>+216 21 202 020</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <MapPin />
                  </div>
                  <div className="contact-details">
                    <h3>Address</h3>
                    <p>SotuPub Agency</p>
                    <p>Sousse, 4000</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <Clock />
                  </div>
                  <div className="contact-details">
                    <h3>Business Hours</h3>
                    <p>Monday - Friday: 9am - 6pm</p>
                    <p>Saturday - Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h3>Connect With Us</h3>
                <div className="social-icons">
                  <a href="#" className="social-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>

                  <a href="#" className="social-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                      ></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>

                  <a href="#" className="social-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="contact-form-panel">
              <h2>Send Us a Message</h2>
              {status.message && (
                <div className={`form-status ${status.type}`}>
                  {status.message}
                </div>
              )}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+216 12 345 678"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    placeholder="Your message here..."
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <SectionHeader
            title="Frequently Asked Questions"
            description="Find answers to common questions about HashGov and our services."
          />

          <div className="faq-grid">
            <div className="faq-item">
              <h3>What is HashGov?</h3>
              <p>
                HashGov is a platform that leverages Hedera Hashgraph technology
                to provide secure, efficient, and transparent solutions for
                digital identity management, secure transactions, and digital
                certificates.
              </p>
            </div>

            <div className="faq-item">
              <h3>How secure is the Hedera network?</h3>
              <p>
                Hedera uses Asynchronous Byzantine Fault Tolerance (ABFT), the
                highest level of security possible for distributed systems. This
                makes it resistant to various attack vectors that can affect
                other blockchain networks.
              </p>
            </div>

            <div className="faq-item">
              <h3>What are the benefits of using HashGov?</h3>
              <p>
                HashGov offers enhanced security, reduced costs, improved
                efficiency, and greater transparency for organizations looking
                to leverage distributed ledger technology for governance,
                identity management, and secure transactions.
              </p>
            </div>

            <div className="faq-item">
              <h3>How can I integrate HashGov with my existing systems?</h3>
              <p>
                Our team provides comprehensive integration services to ensure
                HashGov works seamlessly with your existing systems. We offer
                APIs, SDKs, and custom integration solutions tailored to your
                specific needs.
              </p>
            </div>

            <div className="faq-item">
              <h3>What industries can benefit from HashGov?</h3>
              <p>
                HashGov is designed to serve a wide range of industries,
                including government, finance, healthcare, education, real
                estate, and more. Any organization that requires secure identity
                management, transparent transactions, or tamper-proof
                record-keeping can benefit from our solutions.
              </p>
            </div>
          </div>
        </section>

        <section className="support-options">
          <h2>Additional Support Options</h2>
          <div className="support-grid">
            <div className="support-card">
              <div className="support-icon">
                <Globe size={32} />
              </div>
              <h3>Knowledge Base</h3>
              <p>Browse our comprehensive documentation and tutorials.</p>
              <a href="https://docs.hedera.com/hedera">
                <button className="support-btn">Visit Knowledge Base</button>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
