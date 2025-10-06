import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CaptchaPage: React.FC = () => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError('Bitte geben Sie eine Antwort ein.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Check answer immediately
    if (answer.trim() === '7') {
      navigate('/login');
    } else {
      setError('Falsche Antwort. Bitte versuchen Sie es erneut.');
      setAnswer('');
    }
    setIsLoading(false);
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
      padding: '20px',
      margin: 0
    }}>
      {/* Security Header */}
      <div style={{
        backgroundColor: '#2c5f5f',
        color: 'white',
        padding: isMobile ? '15px 20px' : '20px 40px',
        borderRadius: '8px 8px 0 0',
        textAlign: 'center',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Sicherheitsüberprüfung
        </h1>
        <p style={{
          fontSize: isMobile ? '12px' : '14px',
          margin: '0',
          opacity: 0.9,
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          Zum Schutz vor automatisierten Angriffen
        </p>
      </div>

      {/* Captcha Form */}
      <div style={{
        backgroundColor: 'white',
        padding: isMobile ? '30px 20px' : '40px',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '15px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            Bestätigen Sie, dass Sie ein Mensch sind
          </h2>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '2px solid #2c5f5f',
            borderRadius: '8px',
            padding: isMobile ? '20px 15px' : '25px',
            marginBottom: '20px',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: '#333',
              margin: '0 0 15px 0',
              fontWeight: '600'
            }}>
              Lösen Sie diese einfache Rechenaufgabe:
            </p>
            
            <div style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: 'bold',
              color: '#2c5f5f',
              marginBottom: '15px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              3 + 4 = ?
            </div>
            
            <p style={{
              fontSize: isMobile ? '12px' : '13px',
              color: '#666',
              margin: '0',
              fontStyle: 'italic'
            }}>
              Geben Sie das Ergebnis in das Feld unten ein
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="number"
              value={answer}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: isMobile ? '15px 12px' : '12px 12px',
                border: '2px solid #2c5f5f',
                borderRadius: '4px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: isMobile ? '16px' : '14px',
                textAlign: 'center',
                outline: 'none',
                boxShadow: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1e4a4a';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2c5f5f';
              }}
              placeholder="Ihre Antwort"
              autoComplete="off"
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '4px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#f44336',
              fontSize: isMobile ? '13px' : '14px',
              fontFamily: 'Arial, Helvetica, sans-serif',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: isMobile ? '18px' : '15px',
              background: isLoading 
                ? '#ccc' 
                : 'linear-gradient(135deg, #2c5f5f 0%, #1e4a4a 50%, #2c5f5f 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: isMobile ? '16px' : '14px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Arial, Helvetica, sans-serif',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(315deg, #1e4a4a 0%, #2c5f5f 50%, #1e4a4a 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2c5f5f 0%, #1e4a4a 50%, #2c5f5f 100%)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Wird überprüft...
              </>
            ) : (
              'Sicherheitsüberprüfung durchführen'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CaptchaPage;