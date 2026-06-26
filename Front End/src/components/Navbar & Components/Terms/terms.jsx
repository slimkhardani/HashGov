"use client";
import Navbar from "./../navbar/navbar";
import Footer from "./../../footer/footer";
import { Link } from "react-router-dom";
import "./terms.css";

export default function TermsPage() {
  return (
    <div className="hashgov-container">
      <Navbar />

      <div className="terms-page">
        <div className="terms-container">
          <div className="terms-sidebar">
            <h3 className="terms-sidebar-title">Legal</h3>
            <nav className="terms-sidebar-nav">
              <Link to="/terms" className="terms-sidebar-link active">
                Terms
              </Link>
              <Link to="/privacy" className="terms-sidebar-link">
                Privacy
              </Link>
            </nav>
          </div>

          <div className="terms-content">
            <h1 className="terms-title">Terms of Service</h1>
            <p className="terms-updated">Last updated: April 1, 2025</p>

            <div className="terms-section">
              <h2 className="terms-section-title">1. Introduction</h2>
              <p>
                Welcome to HashGov. These Terms of Service ("Terms") govern your
                access to and use of the HashGov platform, including any
                associated mobile applications, websites, software, and services
                (collectively, the "Service") provided by HashGov Inc.
                ("HashGov," "we," "us," or "our").
              </p>
              <p>
                By accessing or using the Service, you agree to be bound by
                these Terms. If you do not agree to these Terms, you may not
                access or use the Service.
              </p>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">2. Definitions</h2>
              <p>
                <strong>"User"</strong> refers to any individual or entity that
                accesses or uses the Service.
              </p>
              <p>
                <strong>"Content"</strong> refers to any information, data,
                text, software, graphics, messages, or other materials that are
                uploaded, posted, or otherwise transmitted through the Service.
              </p>
              <p>
                <strong>"Digital Identity"</strong> refers to the digital
                representation of a User's identity, stored as a non-fungible
                token (NFT) on the Hedera Hashgraph network.
              </p>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">3. Account Registration</h2>
              <p>
                To access certain features of the Service, you may be required
                to register for an account. You agree to provide accurate,
                current, and complete information during the registration
                process and to update such information to keep it accurate,
                current, and complete.
              </p>
              <p>
                You are responsible for safeguarding your account credentials
                and for all activities that occur under your account. You agree
                to notify us immediately of any unauthorized use of your account
                or any other breach of security.
              </p>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">
                4. Digital Identity Service
              </h2>
              <p>
                HashGov provides a Digital Identity Service that allows Users to
                create, manage, and control their digital identities on the
                Hedera Hashgraph network. By using the Digital Identity Service,
                you acknowledge and agree to the following:
              </p>
              <ul className="terms-list">
                <li>
                  Your Digital Identity is stored as an NFT on the Hedera
                  Hashgraph network, which is a public, distributed ledger.
                </li>
                <li>
                  You have sole control over your Digital Identity and the
                  personal information associated with it.
                </li>
                <li>
                  You are responsible for maintaining the security of your
                  private keys and any other authentication credentials
                  associated with your Digital Identity.
                </li>
                <li>
                  HashGov does not have access to your private keys and cannot
                  recover them if lost.
                </li>
              </ul>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">5. User Conduct</h2>
              <p>
                You agree not to engage in any of the following prohibited
                activities:
              </p>
              <ul className="terms-list">
                <li>
                  Violating any applicable law, regulation, or these Terms.
                </li>
                <li>
                  Using the Service for any illegal purpose or to promote
                  illegal activities.
                </li>
                <li>
                  Impersonating another person or entity, or falsely stating or
                  otherwise misrepresenting your affiliation with a person or
                  entity.
                </li>
                <li>
                  Interfering with or disrupting the Service or servers or
                  networks connected to the Service.
                </li>
                <li>
                  Attempting to gain unauthorized access to the Service, other
                  accounts, computer systems, or networks connected to the
                  Service.
                </li>
              </ul>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and
                functionality are owned by HashGov and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property or proprietary rights laws.
              </p>
              <p>
                You retain all rights to your Content, but you grant HashGov a
                worldwide, non-exclusive, royalty-free license to use,
                reproduce, modify, adapt, publish, translate, and distribute
                your Content in connection with providing the Service to you.
              </p>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">
                7. Limitation of Liability
              </h2>
              <p>
                In no event shall HashGov, its directors, employees, partners,
                agents, suppliers, or affiliates be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use,
                goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="terms-list">
                <li>
                  Your access to or use of or inability to access or use the
                  Service;
                </li>
                <li>
                  Any conduct or content of any third party on the Service;
                </li>
                <li>Any content obtained from the Service; and</li>
                <li>
                  Unauthorized access, use, or alteration of your transmissions
                  or content, whether based on warranty, contract, tort
                  (including negligence), or any other legal theory, whether or
                  not we have been informed of the possibility of such damage.
                </li>
              </ul>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">8. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will provide at least 30 days' notice prior to any new terms
                taking effect. What constitutes a material change will be
                determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after any revisions
                become effective, you agree to be bound by the revised terms. If
                you do not agree to the new terms, you are no longer authorized
                to use the Service.
              </p>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">9. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with
                the laws of the jurisdiction in which HashGov is established,
                without regard to its conflict of law provisions.
              </p>
              <p>
                Our failure to enforce any right or provision of these Terms
                will not be considered a waiver of those rights. If any
                provision of these Terms is held to be invalid or unenforceable
                by a court, the remaining provisions of these Terms will remain
                in effect.
              </p>
            </div>

            <div className="terms-section">
              <h2 className="terms-section-title">10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p className="terms-contact">
                Email: legal@hashgov.com
                <br />
                Address: 123 Blockchain Avenue, Tech City, TC 10101
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
