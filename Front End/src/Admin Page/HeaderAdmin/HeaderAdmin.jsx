import { useState, useEffect, useRef, useMemo } from "react";
import { Menu } from "lucide-react";
import "./HeaderAdmin.css";

export default function Header({ title = "Admin Dashboard", onToggleSidebar }) {
  // Admin user info (static for now, you can replace with dynamic if needed)
  const firstName = "Admin";
  const lastName = "User";
  const profilePicture = null;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="identity-header">
      <div className="identity-header-left">
        <button className="identity-menu-button" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        <h1>{title}</h1>
      </div>
      <div className="identity-header-right">
        <div className="identity-user-profile-mini">
          {profilePicture ? (
            <div className="identity-avatar profile-image-container">
              <img src={profilePicture} alt="Profile" className="profile-image" />
            </div>
          ) : (
            <div className="identity-avatar">{initials}</div>
          )}
        </div>
      </div>
    </header>
  );
}
