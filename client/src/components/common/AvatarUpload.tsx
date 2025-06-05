'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUtils';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUpdate?: (newAvatar: string) => void;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export default function AvatarUpload({ 
  currentAvatar, 
  onAvatarUpdate, 
  size = 'md', 
  editable = true 
}: AvatarUploadProps) {
  const { token, updateUserAvatar } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      // Update the user context with new avatar
      if (updateUserAvatar) {
        updateUserAvatar(data.avatar);
      }

      if (onAvatarUpdate) {
        onAvatarUpdate(data.avatar);
      }

      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (editable && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleDeleteAvatar = async () => {
    if (!currentAvatar) return;

    setIsUploading(true);

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete avatar');
      }

      // Update the user context
      if (updateUserAvatar) {
        updateUserAvatar(undefined);
      }

      if (onAvatarUpdate) {
        onAvatarUpdate('');
      }

      toast.success('Avatar deleted successfully!');
    } catch (error) {
      console.error('Avatar deletion error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const avatarSrc = getImageUrl(currentAvatar);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 ${
          editable ? 'cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors' : ''
        } ${dragOver ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt="User avatar"
            fill
            className="object-cover"
            sizes={`(max-width: ${size === 'lg' ? '128px' : size === 'md' ? '80px' : '40px'}) 100vw`}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <svg className={`${iconSizeClasses[size]} text-gray-500 dark:text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        {/* Upload Overlay */}
        {editable && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {editable && (
        <div className="flex space-x-2">
          <button
            onClick={handleClick}
            disabled={isUploading}
            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          
          {avatarSrc && (
            <button
              onClick={handleDeleteAvatar}
              disabled={isUploading}
              className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        title="Upload avatar image"
      />

      {/* Upload Instructions */}
      {editable && size === 'lg' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Click to upload or drag and drop
          <br />
          PNG, JPG, GIF up to 5MB
        </p>
      )}
    </div>
  );
}
