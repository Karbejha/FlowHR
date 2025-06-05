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
    }
};