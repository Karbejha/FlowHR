# HR Management System

A comprehensive HR Management System built with Next.js, Node.js, and MongoDB, featuring modern UI/UX, leave management, attendance tracking, and employee management with complete dark/light mode support.

🚀 **Live Demo:** [https://flow-hr-seven.vercel.app/](https://flow-hr-seven.vercel.app/)

## ⚠️ Important Notice

This project is proprietary software and is not open for public use, modification, or distribution. All rights are reserved.

### License Restrictions

- ⛔ No copying or reuse of code
- ⛔ No modification of the software
- ⛔ No redistribution
- ⛔ No commercial use
- ⛔ No derivative works

This software is protected under a proprietary license. Please refer to the LICENSE file for complete terms.

## ✨ Features

### Core Functionality
- 👥 **Employee Management** - Complete CRUD operations with role-based access
- 📅 **Leave Management** - Request, approve, and track leave with detailed statistics
- ⏰ **Attendance Tracking** - Real-time clock-in/out with work timers and analytics
- 🔐 **Role-Based Access Control** - Admin, Manager, and Employee permissions
- 📱 **Responsive Design** - Mobile-first approach with modern UI

### UI/UX Enhancements
- 🌙 **Dark/Light Mode** - Complete theme support across all components
- 🎨 **Modern Design** - Professional gradient backgrounds and animations
- 📊 **Statistics Dashboard** - Visual charts and progress indicators
- 🔄 **Real-time Updates** - Live timers and automatic data refresh
- ✨ **Interactive Elements** - Hover effects, transitions, and loading states

### Security Features
- 🔒 **JWT Authentication** - Secure token-based authentication
- 👤 **Password Management** - Admin/Manager password change functionality
- 🛡️ **Input Validation** - Comprehensive client and server-side validation
- 🔐 **Team Isolation** - Managers can only manage their team members

## Tech Stack

- Frontend:
  - Next.js 13+
  - TypeScript
  - TailwindCSS
  - React Context API
  - Axios

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication
  - TypeScript

## Project Structure

```
├── client/          # Frontend Next.js application
├── server/          # Backend Node.js API
├── setup/           # Database setup scripts
└── LICENSE          # Proprietary license
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Git

### Environment Setup
1. Copy environment template:
   ```bash
   cp server/.env.example server/.env
   ```

2. Configure your environment variables in `server/.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - Database setup passwords (for initial user creation)

### Installation & Setup
```bash
# Install dependencies for both client and server
npm run install-deps

# Setup initial admin users (optional - set passwords via environment variables)
cd setup
ADMIN_PASSWORD=your-password MANAGER_PASSWORD=your-password EMPLOYEE_PASSWORD=your-password node create-admin.js

# Start development servers
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### Production Deployment
```bash
# Build for production
npm run build

# Start production servers
npm start
```

## Copyright

© 2025 Mohamad Karbejha. All rights reserved.

This project is protected by copyright law. Unauthorized use, copying, modification, or distribution of this software is strictly prohibited and may result in legal action.

---

**Note**: This is a private repository. If you have access to this code, you are bound by the terms of the proprietary license included in this repository.
