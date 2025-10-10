# 🔧 Root Deployment Guide - Commerzbank Application

## ✅ **Fixed: simple-deploy.sh Now Supports Root Execution**

The `simple-deploy.sh` script has been updated to work with both regular users and root users.

### 🔄 **Changes Made:**

#### **1. Root Detection Logic**
```bash
# Before (only regular users):
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root..."
    exit 1
fi

# After (supports both):
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. Commands will be executed directly without sudo."
    SUDO_CMD=""
    DEPLOY_USER="root"
else
    SUDO_CMD="sudo"
    DEPLOY_USER="$USER"
fi
```

#### **2. Dynamic Command Prefix**
All `sudo` commands now use the `$SUDO_CMD` variable:
- **As regular user**: Commands run with `sudo`
- **As root**: Commands run directly without `sudo`

#### **3. Dynamic User Assignment**
The systemd service now uses `$DEPLOY_USER`:
- **As regular user**: Service runs as the current user
- **As root**: Service runs as root

---

## 🚀 **Usage Options:**

### **Option 1: Run as Regular User (Recommended)**
```bash
cd /home/candi/commerzbank
./simple-deploy.sh
```
- Requires sudo privileges
- More secure
- Service runs as regular user

### **Option 2: Run as Root**
```bash
cd /home/candi/commerzbank
sudo ./simple-deploy.sh
```
- No sudo required
- Direct system access
- Service runs as root

---

## 🔧 **What the Script Does:**

### **System Setup:**
- ✅ Installs Node.js LTS
- ✅ Installs PostgreSQL database
- ✅ Installs Nginx web server
- ✅ Installs SSL certificates (Let's Encrypt)
- ✅ Configures firewall (UFW)

### **Application Setup:**
- ✅ Creates `/opt/commcomm` directory
- ✅ Copies application files
- ✅ Installs dependencies
- ✅ Builds frontend
- ✅ Configures environment variables
- ✅ Sets up database schema

### **Service Configuration:**
- ✅ Creates systemd service
- ✅ Configures Nginx reverse proxy
- ✅ Sets up auto-start on boot
- ✅ Configures security settings

---

## 📋 **Deployment Process:**

### **Step 1: Prepare Server**
```bash
# Upload application files
scp -r /path/to/commerzbank user@server:/home/user/
```

### **Step 2: Run Deployment**
```bash
# SSH into server
ssh user@server

# Navigate to application
cd /home/user/commerzbank

# Run deployment (choose one):
./simple-deploy.sh          # As regular user
sudo ./simple-deploy.sh     # As root
```

### **Step 3: Follow Prompts**
The script will ask for:
- Domain name (optional)
- Admin username
- Admin password
- Database password

### **Step 4: Access Application**
- **Main App**: `http://your-domain.com` or `http://server-ip`
- **Admin Panel**: `http://your-domain.com/admin`

---

## 🔒 **Security Considerations:**

### **Running as Regular User (Recommended):**
- ✅ More secure
- ✅ Limited system access
- ✅ Follows security best practices
- ✅ Service runs with limited privileges

### **Running as Root:**
- ⚠️ Full system access
- ⚠️ Higher security risk
- ⚠️ Service runs with root privileges
- ✅ Useful for automated deployments
- ✅ No sudo configuration needed

---

## 🛠️ **Post-Deployment:**

### **Check Status:**
```bash
# Check services
sudo systemctl status commcomm postgresql nginx

# Check logs
sudo journalctl -u commcomm -f
```

### **Setup SSL (if using domain):**
```bash
sudo certbot --nginx -d your-domain.com
```

### **Update Admin Credentials:**
```bash
sudo nano /opt/commcomm/backend/.env
# Change ADMIN_USERNAME and ADMIN_PASSWORD
sudo systemctl restart commcomm
```

---

## 🆘 **Troubleshooting:**

### **Permission Issues:**
```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/commcomm

# Fix permissions
chmod -R 755 /opt/commcomm
chmod 600 /opt/commcomm/backend/.env
```

### **Service Issues:**
```bash
# Restart services
sudo systemctl restart commcomm
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

### **Database Issues:**
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql -h localhost -U commcomm_user -d commcomm_db
```

---

## 🎉 **Success!**

Your Commerzbank application is now deployed and running with full root compatibility!

**Features Working:**
- ✅ Multi-step form process
- ✅ File upload functionality
- ✅ Admin panel with PDF export
- ✅ Mobile-responsive design
- ✅ Visitor tracking
- ✅ Security features
- ✅ PM2 process management
- ✅ Root deployment support

---

*The deployment script now supports both regular users and root users, making it flexible for different deployment scenarios.*
