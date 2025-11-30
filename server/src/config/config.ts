import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hrflow',
    jwtSecret: process.env.JWT_SECRET || (() => {
        console.warn('⚠️  JWT_SECRET not set! Using default - NOT secure for production!');
        return 'your-default-secret-key-change-this-in-production';
    })(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    
    // Cloudinary Configuration
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || (() => {
            throw new Error('❌ CLOUDINARY_CLOUD_NAME is required! Please set it in your .env file');
        })(),
        apiKey: process.env.CLOUDINARY_API_KEY || (() => {
            throw new Error('❌ CLOUDINARY_API_KEY is required! Please set it in your .env file');
        })(),
        apiSecret: process.env.CLOUDINARY_API_SECRET || (() => {
            throw new Error('❌ CLOUDINARY_API_SECRET is required! Please set it in your .env file');
        })()
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
        adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com'
    }
};