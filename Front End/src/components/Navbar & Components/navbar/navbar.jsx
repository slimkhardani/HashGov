//import Link from "next/link";
import { Logo } from "../../logo/logo";
import "./navbar.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/services">Services</Link>
        <Link to="/hedera">Hedera Network</Link>
        <Link to="/tokens">Tokens & NFTs</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div className="auth-buttons">
        <Link to="/login">
          <button className="login-btn">Log in</button>
        </Link>

        <Link to="/signup">
          <button className="signup-btn">Sign up</button>
        </Link>
      </div>
    </nav>
  );
}
