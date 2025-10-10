# 🔧 Vercel Deployment Fix Guide

## 🐛 **Common Vercel Deployment Errors & Solutions**

### **Error 1: Database Connection Issues**
**Problem**: PostgreSQL connection fails on Vercel
**Solution**: Created `vercel-serverless.js` with in-memory storage

### **Error 2: File Upload Issues**
**Problem**: File uploads don't work on serverless functions
**Solution**: Updated to use `/tmp` directory for temporary file storage

### **Error 3: CORS Issues**
**Problem**: Mobile devices can't access the API
**Solution**: Enhanced CORS configuration for Vercel domains

---

## 🚀 **Step-by-Step Deployment**

### **Step 1: Deploy Backend to Vercel**

```bash
# Navigate to backend directory
cd /home/candi/commerzbank/backend

# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
vercel --prod
```

**Note the backend URL** (e.g., `https://your-backend-name.vercel.app`)

### **Step 2: Deploy Frontend to Vercel**

```bash
# Navigate to root directory
cd /home/candi/commerzbank

# Build the frontend
npm run build

# Deploy frontend
vercel --prod
```

**Note the frontend URL** (e.g., `https://your-frontend-name.vercel.app`)

### **Step 3: Configure Environment Variables**

In your Vercel dashboard, set these environment variables:

#### **Frontend Environment Variables:**
```bash
REACT_APP_API_URL=https://your-backend-name.vercel.app/api
NODE_ENV=production
```

#### **Backend Environment Variables:**
```bash
NODE_ENV=production
CORS_ORIGINS=https://your-frontend-name.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
MAX_FILE_SIZE=10485760
```

### **Step 4: Redeploy After Environment Variables**

```bash
# Redeploy frontend with new environment variables
cd /home/candi/commerzbank
vercel --prod

# Redeploy backend with new environment variables
cd backend
vercel --prod
```

---

## 🔧 **Files Created/Updated for Vercel:**

### **1. `backend/vercel-serverless.js`**
- ✅ Serverless-compatible backend
- ✅ In-memory storage (no database required)
- ✅ File uploads to `/tmp` directory
- ✅ Mobile-friendly CORS configuration

### **2. `backend/vercel.json`**
- ✅ Updated to use serverless version
- ✅ Proper routing configuration
- ✅ Function timeout settings

### **3. `vercel-frontend.json`**
- ✅ Frontend-specific configuration
- ✅ Static build configuration

---

## 🧪 **Testing Deployment:**

### **Test Backend:**
```bash
# Test health endpoint
curl https://your-backend-name.vercel.app/api/health

# Expected response:
{"status":"OK","timestamp":"2025-10-10T...","environment":"production"}
```

### **Test Frontend:**
1. Open `https://your-frontend-name.vercel.app`
2. Go through the form steps
3. Test file upload on mobile device

### **Test Mobile Upload:**
1. Open frontend URL on mobile device
2. Complete the form steps
3. On upload page, tap "📷 Foto auswählen"
4. Take a photo or select from gallery
5. Upload should work successfully

---

## 🆘 **Troubleshooting Common Issues:**

### **Issue 1: "Function not found" Error**
**Solution**: Make sure you're using the correct file name in `vercel.json`
```json
{
  "src": "vercel-serverless.js",  // Must match actual file name
  "use": "@vercel/node"
}
```

### **Issue 2: "CORS Error" on Mobile**
**Solution**: Check environment variables in Vercel dashboard
```bash
CORS_ORIGINS=https://your-frontend-name.vercel.app
```

### **Issue 3: "File Upload Failed"**
**Solution**: Check file size limits and ensure backend is deployed correctly
```bash
MAX_FILE_SIZE=10485760  # 10MB
```

### **Issue 4: "Environment Variable Not Found"**
**Solution**: Set environment variables in Vercel dashboard and redeploy

---

## 📱 **Mobile Upload Features:**

### **✅ What Works on Vercel:**
- **Camera capture** on mobile devices
- **Gallery selection** from mobile devices
- **File uploads** up to 10MB
- **Cross-origin requests** from mobile browsers
- **Session management** with in-memory storage
- **Admin panel** with data export

### **⚠️ Limitations on Vercel:**
- **File persistence**: Files are stored in `/tmp` and may be lost between function invocations
- **Session persistence**: Sessions are in-memory and may be lost
- **Database**: Using in-memory storage instead of persistent database

---

## 🔄 **Alternative: Full Database Setup**

If you need persistent storage, consider:

### **Option 1: Vercel Postgres**
```bash
# Add Vercel Postgres to your project
vercel storage create postgres
```

### **Option 2: External Database**
- Use MongoDB Atlas, PlanetScale, or Supabase
- Update the serverless backend to connect to external database

### **Option 3: Hybrid Approach**
- Use Vercel for frontend
- Use Railway, Render, or DigitalOcean for backend with persistent database

---

## 🎯 **Quick Fix Commands:**

### **If deployment fails:**
```bash
# Check Vercel CLI version
vercel --version

# Update Vercel CLI
npm install -g vercel@latest

# Clear Vercel cache
vercel --force

# Redeploy
vercel --prod
```

### **If environment variables not working:**
```bash
# Check current environment variables
vercel env ls

# Add environment variable
vercel env add REACT_APP_API_URL

# Redeploy after adding variables
vercel --prod
```

---

## 🎉 **Success Indicators:**

### **✅ Deployment Successful When:**
- Backend health endpoint returns 200 OK
- Frontend loads without errors
- Mobile upload works on both iOS and Android
- Admin panel accessible and shows data
- No CORS errors in browser console

### **📊 Performance Metrics:**
- Backend response time: < 2 seconds
- Frontend load time: < 5 seconds
- Upload success rate: > 95%
- Mobile compatibility: Works on all major browsers

---

*Your Vercel deployment should now work without errors! The mobile upload issue is also fixed.* 🚀📱
