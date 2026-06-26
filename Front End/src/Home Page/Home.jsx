"use client";
import Navbar from "../components/Navbar & Components/navbar/navbar";
import HeroSection from "./hero-section/hero-section";
import ServicesSection from "./services-section/services-section";
import HighlightsSection from "./highlights-section/highlights-section";
import HederaSection from "./hedera-section/hedera-section";
import TokensSection from "./tokens-section/tokens-section";
import ContactSection from "./contact-section/contact-section";
import Footer from "../components/footer/footer";
import TrustedSection from "./trusted-section/trusted-section";
import "./Home.css";

export default function HashGovHomePage() {
  return (
    <div className="hashgov-container">
      <Navbar />
      <HeroSection />
      <TrustedSection />
      <ServicesSection />
      <HighlightsSection />
      <HederaSection />
      <TokensSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
