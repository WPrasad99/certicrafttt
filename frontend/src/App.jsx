import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import OAuthCallback from "./components/OAuthCallback";
import CertificateVerification from "./components/CertificateVerification";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import LoadingOverlay from "./components/LoadingOverlay";
import "./index.css";

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Show top-class loading video for 1.5s on initial website open
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {initialLoading && <LoadingOverlay />}
      <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route
          path="/verify/:verificationId"
          element={<CertificateVerification />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </>
  );
}

export default App;