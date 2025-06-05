'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/utils/imageUtils';

interface FileUploadProps {
  currentImage?: string;
  onFileSelect: (file: File | null) => void;
  size?: 'sm' | 'md' | 'lg';
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
}

export default function FileUpload({ 
  currentImage,
  onFileSelect,
  size = 'md',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = 'Upload file'
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setPreview(null);
      onFileSelect(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
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
    handleFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || getImageUrl(currentImage);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-dashed ${
          dragOver 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
        } cursor-pointer transition-all duration-200`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt="Preview"
            fill
            className="object-cover"
            sizes={`(max-width: ${size === 'lg' ? '128px' : size === 'md' ? '96px' : '64px'}) 100vw`}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg className={`${iconSizeClasses[size]} text-gray-400 dark:text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )}

        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleClick}
          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-md transition-colors"
        >
          {label}
        </button>
        
        {displayImage && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-md transition-colors"
          >
            Remove
          </button>
        )}
      </div>      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />

      {/* Upload Instructions */}
      {size === 'lg' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Click to upload or drag and drop
          <br />
          PNG, JPG, GIF up to {maxSize / (1024 * 1024)}MB
        </p>
      )}
    </div>
  );
}
