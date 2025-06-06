import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hrflow',
    jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
      // AWS S3 Configuration
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET || ''
    },
    // Email Configuration for Leave Notifications
    email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
        adminEmail: process.env.ADMIN_EMAIL || 'mohamad.karbejha@gmail.com' // Admin email for notifications
    }
};