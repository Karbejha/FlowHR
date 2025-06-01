# 🗄️ Database Setup Guide - MongoDB Atlas

## 🎯 Why MongoDB Atlas?

For your HR-VS project, **MongoDB Atlas** is the best choice because:
- ✅ **Free tier** perfect for your HR system
- ✅ **Fully managed** - no server maintenance needed
- ✅ **Integrates perfectly** with Render backend
- ✅ **Automatic backups** and security
- ✅ **Global CDN** for fast performance

## 🚀 Step-by-Step Setup

### 1. Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"**
3. Sign up with your email
4. Choose **"Free"** tier (M0 Sandbox)

### 2. Create Your Cluster
1. After signup, click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select **Cloud Provider**: AWS, Google Cloud, or Azure (any is fine)
4. Choose **Region**: Select closest to your users
5. **Cluster Name**: `hr-vs-cluster` (or any name you prefer)
6. Click **"Create"**

### 3. Configure Database Access
1. **Create Database User**:
   - Username: `hr-admin` (or your choice)
   - Password: Generate secure password (save it!)
   - Database: `admin`
   - Roles: `Atlas Admin` or `Read and write to any database`

2. **Configure Network Access**:
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - ⚠️ This is for development. In production, you can restrict to Render IPs

### 4. Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** driver
4. Copy the connection string (looks like):
   ```
   mongodb+srv://hr-admin:<password>@hr-vs-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

### 5. Update Environment Variables

#### For Local Development (server/.env):
```env
PORT=5000
MONGODB_URI=mongodb+srv://hr-admin:YOUR_PASSWORD@hr-vs-cluster.xxxxx.mongodb.net/hrflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=1d
```

#### For Production (Render Dashboard):
```env
PORT=5000
MONGODB_URI=mongodb+srv://hr-admin:YOUR_PASSWORD@hr-vs-cluster.xxxxx.mongodb.net/hrflow?retryWrites=true&w=majority
JWT_SECRET=your-secure-production-jwt-secret
JWT_EXPIRES_IN=1d
```

## 🔧 Database Configuration

### Database Name
Your HR data will be stored in database: `hrflow`

### Collections (Tables)
Your app will automatically create these collections:
- `users` - Employee accounts and profiles
- `leaves` - Leave requests and approvals
- `attendances` - Clock in/out records

## 🧪 Testing Database Connection

### Test Local Connection
```bash
cd server
npm run dev
```
Look for: `Connected to MongoDB` in console

### Test Production Connection
After deploying to Render with Atlas URI, check Render logs for: `Connected to MongoDB`

## 🔒 Security Best Practices

### 1. Secure Passwords
- Use strong password for database user
- Never commit passwords to git
- Use environment variables

### 2. Network Security
- For production, consider restricting IP access
- Enable MongoDB Atlas security features

### 3. Backup Strategy
- Atlas automatically backs up your data
- Free tier: Point-in-time recovery (last 24 hours)
- Paid tiers: Continuous backup

## 💰 Pricing Information

### Free Tier (M0 Sandbox)
- ✅ **Storage**: 512 MB
- ✅ **RAM**: Shared
- ✅ **Perfect for**: Development, testing, small HR teams
- ✅ **Cost**: $0/month

### When to Upgrade
Consider upgrading when:
- You have >100 employees
- Need more than 512MB storage
- Require dedicated resources
- Need advanced backup features

## 🚨 Alternative Options (Not Recommended)

### Self-hosted MongoDB
- ❌ Requires server management
- ❌ Manual backups needed
- ❌ Security configuration complex
- ❌ Scaling challenges

### Other Cloud Databases
- AWS DocumentDB: More expensive, less features
- Google Firestore: Different query language
- Azure Cosmos DB: Overkill for this project

## ✅ Next Steps

1. **Set up Atlas** following steps above
2. **Update environment variables** in both local and Render
3. **Test connection** locally first
4. **Deploy to Render** with new MongoDB URI
5. **Verify** production deployment works

Your HR system will then have:
- 🏠 **Local Dev**: Local frontend + Render backend + Atlas database
- 🌍 **Production**: Vercel frontend + Render backend + Atlas database

## 📞 Support

If you encounter issues:
- MongoDB Atlas docs: https://docs.atlas.mongodb.com/
- Connection troubleshooting: Check firewall/network settings
- Render logs: Monitor connection status in dashboard
