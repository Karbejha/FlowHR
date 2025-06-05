import AWS from 'aws-sdk';
import { config } from '../config/config';
import fs from 'fs';
import path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

/**
 * Upload file to S3
 * @param filePath - Local file path
 * @param key - S3 object key (path/filename)
 * @param contentType - MIME type of the file
 * @returns Promise with S3 upload result
 */
export const uploadToS3 = async (
  filePath: string, 
  key: string, 
  contentType: string = 'image/jpeg'
): Promise<AWS.S3.ManagedUpload.SendData> => {
  try {
    const fileContent = fs.readFileSync(filePath);    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      // Try to set public-read ACL for new uploads
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    console.log('✅ File uploaded successfully to S3:', result.Location);
    
    // Clean up local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Local file cleaned up:', filePath);
    }
    
    return result;
  } catch (error) {
    console.error('❌ S3 upload failed:', error);
    throw new Error(`S3 upload failed: ${error}`);
  }
};

/**
 * Delete file from S3
 * @param key - S3 object key to delete
 * @returns Promise with deletion result
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: config.aws.bucket,
      Key: key
    };

    await s3.deleteObject(params).promise();
    console.log('✅ File deleted successfully from S3:', key);
  } catch (error) {
    console.error('❌ S3 deletion failed:', error);
    throw new Error(`S3 deletion failed: ${error}`);
  }
};

/**
 * Extract S3 key from S3 URL
 * @param url - Full S3 URL
 * @returns S3 key (path/filename)
 */
export const getS3KeyFromUrl = (url: string): string => {
  if (url.includes('amazonaws.com')) {
    // Extract key from URL like: https://bucket.s3.region.amazonaws.com/path/file.jpg
    const urlParts = url.split('.amazonaws.com/');
    return urlParts[1] || '';
  }
  
  // If it's already a key, return as-is
  return url.startsWith('avatars/') ? url : `avatars/${url}`;
};

// End of file
