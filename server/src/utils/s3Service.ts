import { S3Client, PutObjectCommand, DeleteObjectCommand, PutObjectCommandInput, DeleteObjectCommandInput } from '@aws-sdk/client-s3';
import { config } from '../config/config';
import fs from 'fs';
import path from 'path';

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
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
): Promise<{ Location: string; ETag: string; Key: string }> => {
  try {
    console.log('📤 Starting S3 upload process...');
    console.log('File path:', filePath);
    console.log('S3 key:', key);
    console.log('Content type:', contentType);
    
    // Check if file exists before reading
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath);
    console.log('📄 File read successfully, size:', fileContent.length, 'bytes');
      
    const params: PutObjectCommandInput = {
      Bucket: config.aws.bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType
      // Note: ACL removed - bucket doesn't allow ACLs. 
      // Files will be accessible via bucket policy or CloudFront
    };

    console.log('🔧 S3 upload params:', {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      BodySize: fileContent.length
    });    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    
    // Construct the S3 URL manually since v3 doesn't return Location
    const location = `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
    
    console.log('✅ File uploaded successfully to S3:', location);
    
    // Clean up local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Local file cleaned up:', filePath);
    }
    
    return {
      Location: location,
      ETag: result.ETag || '',
      Key: key
    };
  } catch (error: any) {
    console.error('❌ S3 upload failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      region: config.aws.region,
      bucket: config.aws.bucket
    });
    
    // Provide more specific error messages
    if (error.code === 'NoSuchBucket') {
      throw new Error(`S3 bucket '${config.aws.bucket}' does not exist`);
    } else if (error.code === 'InvalidAccessKeyId') {
      throw new Error('Invalid AWS Access Key ID');
    } else if (error.code === 'SignatureDoesNotMatch') {
      throw new Error('Invalid AWS Secret Access Key');
    } else if (error.code === 'AccessDenied') {
      throw new Error('Access denied to S3 bucket');
    }
    
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param key - S3 object key to delete
 * @returns Promise with deletion result
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    const params: DeleteObjectCommandInput = {
      Bucket: config.aws.bucket,
      Key: key
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
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
