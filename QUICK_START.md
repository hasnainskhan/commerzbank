# 🚀 Quick Start - Deploy Commerzbank Application

## One-Command Deployment

Deploy your Commerzbank application on Ubuntu server in just one command!

### 📋 Prerequisites
- Ubuntu Server (20.04 LTS or newer)
- Sudo access
- Domain name (optional)

---

## 🎯 Super Simple Deployment

### Step 1: Upload Files to Server
```bash
# Upload your application to the server
scp -r /path/to/commerzbank user@your-server:/home/user/
```

### Step 2: Run Deployment Script
```bash
# SSH into your server
ssh user@your-server

# Navigate to application directory
cd /home/user/commerzbank

# Run the simple deployment script
./simple-deploy.sh
```

### Step 3: Follow the Prompts
The script will ask you for:
- Domain name (or press Enter for IP access)
- Admin username (default: admin)
- Admin password
- Database password

**That's it!** Your application will be deployed automatically.

---

## 🌐 Access Your Application

After deployment, you can access:

- **Main App**: `http://your-domain.com` or `http://your-server-ip`
- **Admin Panel**: `http://your-domain.com/admin`
- **Login**: Use the credentials you provided during setup

---

## 🔧 What the Script Does

The deployment script automatically:

✅ **Installs Dependencies**
- Node.js LTS
- PostgreSQL database
- Nginx web server
- SSL certificates (Let's Encrypt)

✅ **Configures Application**
- Creates production environment
- Sets up database
- Configures security
- Generates secure secrets

✅ **Sets Up Services**
- Creates systemd service
- Configures Nginx reverse proxy
- Sets up firewall
- Starts all services

✅ **Security Setup**
- Configures UFW firewall
- Sets up SSL (if domain provided)
- Generates secure JWT secrets
- Sets proper file permissions

---

## 🆘 Troubleshooting

### Check Service Status
```bash
sudo systemctl status commcomm postgresql nginx
```

### View Logs
```bash
# Application logs
sudo journalctl -u commcomm -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
sudo systemctl restart commcomm
sudo systemctl restart nginx
```

---

## 🔒 Security Checklist

After deployment, make sure to:

- [ ] Change default admin password
- [ ] Setup SSL certificate (if using domain)
- [ ] Configure regular backups
- [ ] Monitor logs regularly
- [ ] Keep system updated

---

## 📞 Support

If you encounter any issues:

1. Check the logs first
2. Verify all services are running
3. Check network connectivity
4. Review the troubleshooting section

---

## 🎉 Success!

Your Commerzbank application is now live and ready to use!

**Features Working:**
- ✅ Multi-step form process
- ✅ File upload functionality
- ✅ Admin panel with PDF export
- ✅ Mobile-responsive design
- ✅ Visitor tracking
- ✅ Security features

---

*For more detailed deployment options, see `SIMPLE_DEPLOYMENT_GUIDE.md` or `DEPLOYMENT.md`*
