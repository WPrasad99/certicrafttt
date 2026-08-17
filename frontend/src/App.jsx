import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import OAuthCallback from "./components/OAuthCallback";
import CertificateVerification from "./components/CertificateVerification";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import InitialVideoLoader from "./components/InitialVideoLoader";
import "./index.css";

function App() {
  const [initialLoading, setInitialLoading] = useState(() => {
    // Only show the video if they haven't seen it in this session
    return !sessionStorage.getItem("hasSeenInitialVideo");
  });

  useEffect(() => {
    if (!initialLoading) return;

    // Fallback: if video doesn't play or end within 10s, hide loader anyway
    const timer = setTimeout(() => {
      sessionStorage.setItem("hasSeenInitialVideo", "true");
      setInitialLoading(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [initialLoading]);

  const handleVideoEnded = () => {
    sessionStorage.setItem("hasSeenInitialVideo", "true");
    setInitialLoading(false);
  };

  return (
    <>
      {initialLoading && <InitialVideoLoader onEnded={handleVideoEnded} />}
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