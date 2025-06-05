/**
 * Utility function to get the proper image URL for displaying images in the frontend.
 * Now handles S3 URLs directly - all images are stored in AWS S3.
 * 
 * @param imagePath - The image URL from the backend (S3 URL)
 * @returns The proper URL to access the image
 */
export function getImageUrl(imagePath: string | undefined | null): string | undefined {
  if (!imagePath) return undefined;
  
  // S3 URLs are returned directly
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // This shouldn't happen anymore since all images are now on S3
  // But kept for any edge cases during transition
  console.warn('Unexpected non-S3 image path:', imagePath);
  return imagePath;
}
