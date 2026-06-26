"use client";
import Navbar from "./../navbar/navbar";
import Footer from "./../../footer/footer";
import { Link } from "react-router-dom";
import "./privacy.css";

export default function PrivacyPage() {
  return (
    <div className="hashgov-container">
      <Navbar />

      <div className="privacy-page">
        <div className="privacy-container">
          <div className="privacy-sidebar">
            <h3 className="privacy-sidebar-title">Legal</h3>
            <nav className="privacy-sidebar-nav">
              <Link to="/terms" className="privacy-sidebar-link">
                Terms
              </Link>
              <Link to="/privacy" className="privacy-sidebar-link active">
                Privacy
              </Link>
            </nav>
          </div>

          <div className="privacy-content">
            <h1 className="privacy-title">Privacy Policy</h1>
            <p className="privacy-updated">Last updated: April 1, 2025</p>

            <div className="privacy-section">
              <h2 className="privacy-section-title">1. Introduction</h2>
              <p>
                HashGov Inc. ("HashGov," "we," "us," or "our") is committed to
                protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our platform, including any associated mobile applications,
                websites, software, and services (collectively, the "Service").
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using
                the Service, you acknowledge that you have read, understood, and
                agree to be bound by this Privacy Policy. If you do not agree
                with our policies and practices, please do not use our Service.
              </p>
            </div>

            <div className="privacy-section">
              <h2 className="privacy-section-title">
                2. Information We Collect
              </h2>
              <p>
                We collect several types of information from and about users of
                our Service:
              </p>

              <h3 className="privacy-subsection-title">
                2.1 Personal Information
              </h3>
              <p>
                Personal Information is information that identifies you as an
                individual or relates to an identifiable individual. We collect
                the following types of Personal Information:
              </p>
              <ul className="privacy-list">
                <li>
                  <strong>Account Information:</strong> When you register for an
                  account, we collect your name, email address, and password.
                </li>
                <li>
                  <strong>Profile Information:</strong> When you create or
                  update your profile, we collect additional information such as
                  your date of birth, gender, phone number, and profile picture.
                </li>
                <li>
                  <strong>Identity Information:</strong> When you use our
                  Digital Identity Service, we collect information such as your
                  ID number, issuing authority, issue date, and expiry date.
                </li>
                <li>
                  <strong>Address Information:</strong> We collect your street
                  address, city, state/province, postal code, and country.
                </li>
                <li>
                  <strong>Social Media Information:</strong> If you choose to
                  link your social media accounts, we collect information about
                  your social media profiles.
                </li>
              </ul>

              <h3 className="privacy-subsection-title">
                2.2 Usage Information
              </h3>
              <p>
                We automatically collect certain information about how you
                interact with our Service, including:
              </p>
              <ul className="privacy-list">
                <li>
                  <strong>Device Information:</strong> We collect information
                  about the device you use to access our Service, including the
                  hardware model, operating system and version, unique device
                  identifiers, and mobile network information.
                </li>
                <li>
                  <strong>Log Information:</strong> We collect log information
                  when you use our Service, including access times, pages
                  viewed, IP address, and the page you visited before navigating
                  to our Service.
                </li>
                <li>
                  <strong>Transaction Information:</strong> We collect
                  information about transactions you make through our Service,
                  including the date, time, amount, and other details specific
                  to the transaction.
                </li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2 className="privacy-section-title">
                3. How We Use Your Information
              </h2>
              <p>
                We use the information we collect for various purposes,
                including to:
              </p>
              <ul className="privacy-list">
                <li>Provide, maintain, and improve our Service;</li>
                <li>Process transactions and send related information;</li>
                <li>Create and maintain your account;</li>
                <li>Verify your identity;</li>
                <li>
                  Send technical notices, updates, security alerts, and support
                  and administrative messages;
                </li>
                <li>Respond to your comments, questions, and requests;</li>
                <li>
                  Communicate with you about products, services, offers, and
                  events, and provide news and information we think will be of
                  interest to you;
                </li>
                <li>
                  Monitor and analyze trends, usage, and activities in
                  connection with our Service;
                </li>
                <li>
                  Detect, investigate, and prevent fraudulent transactions and
                  other illegal activities and protect the rights and property
                  of HashGov and others;
                </li>
                <li>
                  Personalize and improve the Service and provide content or
                  features that match user profiles or interests.
                </li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2 className="privacy-section-title">
                4. How We Share Your Information
              </h2>
              <p>
                We may share your Personal Information in the following
                situations:
              </p>
              <ul className="privacy-list">
                <li>
                  <strong>With Your Consent:</strong> We may share your
                  information when you direct us to do so.
                </li>
                <li>
                  <strong>Service Providers:</strong> We may share your
                  information with third-party vendors, service providers,
                  contractors, or agents who perform services for us or on our
                  behalf.
                </li>
                <li>
                  <strong>Business Transfers:</strong> We may share or transfer
                  your information in connection with, or during negotiations
                  of, any merger, sale of company assets, financing, or
                  acquisition of all or a portion of our business to another
                  company.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose your
                  information where required to do so by law or in response to
                  valid requests by public authorities.
                </li>
                <li>
                  <strong>Protection of Rights:</strong> We may disclose your
                  information to protect the rights, property, or safety of
                  HashGov, our users, or others.
                </li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2 className="privacy-section-title">5. Data Security</h2>
              <p>
                We have implemented appropriate technical and organizational
                security measures designed to protect the security of any
                personal information we process. However, please also remember
                that we cannot guarantee that the internet itself is 100%
                secure.
              </p>
              <p>
                Although we will do our best to protect your personal
                information, transmission of personal information to and from
                our Service is at your own risk. You should only access the
                Service within a secure environment.
              </p>
            </div>

            <div className="privacy-section">
              <h2 className="privacy-section-title">6. Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have certain rights
                regarding your personal information, such as:
              </p>
              <ul className="privacy-list">
                <li>
                  The right to access personal information we hold about you;
                </li>
                <li>
                  The right to request that we correct any inaccurate personal
                  information we hold about you;
                </li>
                <li>
                  The right to request that we delete any personal information
                  we hold about you;
                </li>
                <li>
                  The right to restrict or object to our processing of your
                  personal information;
                </li>
                <li>The right to data portability;</li>
                <li>
                  The right to withdraw consent at any time for processing based
                  on consent.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us using the
                contact information provided below.
              </p>
            </div>

            <div className="privacy-section">
              <h2 className="privacy-section-title">7. Children's Privacy</h2>
              <p>
                Our Service is not directed to children under the age of 18, and
                we do not knowingly collect personal information from children
                under 18. If we learn we have collected or received personal
                information from a child under 18 without verification of
                parental consent, we will delete that information.
              </p>
            </div>

            <div className="privacy-section">
              <h2 className="privacy-section-title">
                8. Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date at the top of
                this Privacy Policy.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for
                any changes. Changes to this Privacy Policy are effective when
                they are posted on this page.
              </p>
            </div>

            <div className="privacy-section">
              <h2 className="privacy-section-title">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p className="privacy-contact">
                Email: privacy@hashgov.com
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
