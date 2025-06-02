# HR Management System

A comprehensive FlowHR Management System built with Next.js, Node.js, and MongoDB, featuring leave management, attendance tracking, and employee management.

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

## Features

- 👥 Employee Management
- 📅 Leave Management
- ⏰ Attendance Tracking
- 🔐 Role-Based Access Control
- 📱 Responsive Design

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
# Install dependencies
npm install

# Setup initial admin users (set passwords via environment variables)
cd setup
ADMIN_PASSWORD=your-password MANAGER_PASSWORD=your-password EMPLOYEE_PASSWORD=your-password node create-admin.js

# Start development servers
npm run dev
```

### Security
Run the security check before deployment:
```bash
./security-check.sh
```

## Copyright

© 2025 Mohamad Karbejha. All rights reserved.

This project is protected by copyright law. Unauthorized use, copying, modification, or distribution of this software is strictly prohibited and may result in legal action.

---

**Note**: This is a private repository. If you have access to this code, you are bound by the terms of the proprietary license included in this repository.
