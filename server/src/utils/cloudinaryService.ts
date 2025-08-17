import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config';
import { logInfo, logError } from './logger';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

/**
 * Upload file to Cloudinary
 * @param filePath - Local file path
 * @param folder - Cloudinary folder (e.g., 'avatars')
 * @param publicId - Optional public ID for the file
 * @returns Promise with Cloudinary upload result
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'avatars',
  publicId?: string
): Promise<{ Location: string; ETag: string; Key: string }> => {
  try {
    // Check if file exists before reading
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Upload options
    const uploadOptions: any = {
      folder: folder,
      resource_type: 'auto', // Automatically detect file type
      quality: 'auto', // Automatic quality optimization
      fetch_format: 'auto', // Automatic format optimization
      transformation: [
        {
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'face' // Focus on face for avatars
        }
      ]
    };

    // Add public_id if provided
    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    logInfo('File uploaded to Cloudinary successfully', {
      cloudinaryId: result.public_id,
      folder: folder,
      fileSize: result.bytes,
      format: result.format,
      url: result.secure_url
    });

    // Clean up local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      Location: result.secure_url,
      ETag: result.etag || result.signature || '',
      Key: result.public_id
    };
  } catch (error: any) {
    logError('Cloudinary upload failed', {
      error: error.message,
      code: error.code,
      statusCode: error.http_code,
      folder: folder,
      filePath
    });

    // Provide more specific error messages
    if (error.message?.includes('Invalid API Key')) {
      throw new Error('Invalid Cloudinary API Key');
    } else if (error.message?.includes('Invalid API Secret')) {
      throw new Error('Invalid Cloudinary API Secret');
    } else if (error.message?.includes('cloud name')) {
      throw new Error('Invalid Cloudinary Cloud Name');
    }

    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param publicId - Cloudinary public ID to delete
 * @returns Promise with deletion result
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logInfo('File deleted from Cloudinary successfully', { publicId });
    } else {
      logError('Cloudinary deletion failed', { result, publicId });
      throw new Error(`Failed to delete file: ${result.result}`);
    }
  } catch (error: any) {
    logError('Cloudinary deletion failed', { error: error.message, publicId });
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

/**
 * Extract Cloudinary public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns Cloudinary public ID
 */
export const getCloudinaryIdFromUrl = (url: string): string => {
  if (url.includes('cloudinary.com')) {
    // Extract public_id from URL like: https://res.cloudinary.com/dvx4plaef/image/upload/v1234567890/avatars/filename.jpg
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        // Skip version number (v1234567890) and get the rest
        const pathParts = urlParts.slice(uploadIndex + 2);
        // Remove file extension from the last part
        const lastPart = pathParts[pathParts.length - 1];
        const nameWithoutExtension = lastPart.split('.')[0];
        pathParts[pathParts.length - 1] = nameWithoutExtension;
        return pathParts.join('/');
      }
    } catch (error) {
      logError('Error extracting Cloudinary ID from URL', { url, error });
    }
  }
  
  // If it's already a public ID or extraction failed, return as-is
  return url.startsWith('avatars/') ? url : `avatars/${url}`;
};

/**
 * Generate optimized Cloudinary URL with transformations
 * @param publicId - Cloudinary public ID
 * @param transformations - Optional transformations
 * @returns Optimized Cloudinary URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformations?: any
): string => {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto'
  };

  const finalTransformations = { ...defaultTransformations, ...transformations };
  
  return cloudinary.url(publicId, finalTransformations);
};

// End of file
