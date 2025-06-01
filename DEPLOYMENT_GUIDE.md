# Deployment Configuration Guide

## 🚀 Environment Variables Setup

### 📱 Client (Vercel) Environment Variables

Set these environment variables in your **Vercel Dashboard**:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_API_URL=https://flowhr-cydf.onrender.com/api
```

### 🖥️ Server (Render) Environment Variables

Set these environment variables in your **Render Dashboard**:

1. Go to your Render service dashboard
2. Navigate to **Environment**
3. Add the following variables:

```
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=1d
```

## 🔧 Local Development Setup

### Client Setup
1. Copy `.env.example` to `.env.local`:
   ```bash
   cd client
   cp .env.example .env.local
   ```

2. Update `.env.local` with local values:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

### Server Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Update `.env` with local values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hrflow
   JWT_SECRET=your-local-jwt-secret
   JWT_EXPIRES_IN=1d
   ```

## 🌐 Live URLs

- **Client (Frontend)**: https://flow-hr-seven.vercel.app
- **Server (Backend)**: https://flowhr-cydf.onrender.com
- **API Base URL**: https://flowhr-cydf.onrender.com/api

## 📋 Deployment Checklist

### Vercel (Client) Deployment
- ✅ Set `NEXT_PUBLIC_API_URL` environment variable
- ✅ Ensure build passes without errors
- ✅ Test all API endpoints work with production backend

### Render (Server) Deployment
- ✅ Set all required environment variables
- ✅ Ensure MongoDB connection works
- ✅ Verify CORS configuration allows your frontend domain
- ✅ Test health endpoint: https://flowhr-cydf.onrender.com/health

## 🔍 Testing Deployment

### Test Local → Production
1. Run client locally: `npm run dev`
2. Set API URL to production: `NEXT_PUBLIC_API_URL=https://flowhr-cydf.onrender.com/api`
3. Test all features

### Test Production → Production
1. Visit: https://flow-hr-seven.vercel.app
2. Test login/register
3. Test all CRUD operations
4. Check browser console for errors

## 🛠️ Troubleshooting

### Common Issues
1. **CORS Error**: Check server CORS configuration includes your client domain
2. **Environment Variables**: Ensure all required variables are set in hosting platforms
3. **API 404**: Verify API_URL includes `/api` suffix
4. **Database Connection**: Check MongoDB URI format and network access

### Debug Steps
1. Check browser network tab for failed requests
2. Check server logs in Render dashboard
3. Verify environment variables in hosting dashboards
4. Test API endpoints directly: https://flowhr-cydf.onrender.com/api/health
