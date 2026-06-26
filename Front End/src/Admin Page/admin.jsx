"use client"
import { useAuth } from "../context/AuthContext.jsx"
import { Navigate } from "react-router-dom"
import AdminDashboard from "./Dashboard/Dashboard"
import PropertyCertificates from "./CertificatsReq/PropertyCertificates";
import AcademicCertificates from "./CertificatsReq/AcademicCertificates";

import { Routes, Route } from "react-router-dom";

export default function Admin() {
  const { user, isAuthenticated } = useAuth()

  // Check if user is authenticated and is an admin
  if (!isAuthenticated()) {
    console.log("User not authenticated, redirecting to login")
    return <Navigate to="/login" replace />
  }

  // Check if user is admin
  if (!user?.isAdmin) {
    console.log("User is not an admin, redirecting to profile")
    return <Navigate to="/profile" replace />
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />}>
        <Route path="certificates/property" element={<PropertyCertificates />} />
        <Route path="certificates/academic" element={<AcademicCertificates />} />
      </Route>
    </Routes>
  );
}
