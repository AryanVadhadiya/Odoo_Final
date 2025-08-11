import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react';

const ImageUpload = ({
  value,
  onChange,
  onRemove,
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  disabled = false,
  className = '',
  placeholder = 'Drop images here or click to browse',
  helperText,
  error,
  ...props
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 0) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files) => {
    if (disabled) return;

    const validFiles = files.filter(file => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        console.warn(`File ${file.name} has unsupported type: ${file.type}`);
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    if (multiple) {
      const currentFiles = value || [];
      const newFiles = [...currentFiles, ...validFiles].slice(0, maxFiles);
      onChange?.(newFiles);
    } else {
      onChange?.(validFiles[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemoveFile = (fileToRemove) => {
    if (multiple) {
      const currentFiles = value || [];
      const newFiles = currentFiles.filter(file => file !== fileToRemove);
      onChange?.(newFiles);
    } else {
      onChange?.(null);
    }
    onRemove?.(fileToRemove);
  };

  const handleBrowseClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const renderFilePreview = (file, index) => {
    const preview = getFilePreview(file);
    
    return (
      <div
        key={index}
        className="relative group bg-gray-50 rounded-lg p-3 border border-gray-200"
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={file.name}
              className="w-full h-32 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveFile(file)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Remove ${file.name}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
            <FileImage className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
    );
  };

  const hasFiles = value && (multiple ? value.length > 0 : true);
  const canAddMore = multiple ? !value || value.length < maxFiles : !value;

  return (
    <div className={className} {...props}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isDragOver ? 'border-midnight bg-midnight/5' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer hover:border-midnight hover:bg-gray-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onClick={canAddMore ? handleBrowseClick : undefined}
        role="button"
        tabIndex={canAddMore && !disabled ? 0 : undefined}
        aria-label={canAddMore ? 'Click to browse files or drag and drop' : 'Image upload area'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBrowseClick();
          }
        }}
      >
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 text-gray-400">
            {isDragOver ? (
              <Upload className="w-full h-full" />
            ) : (
              <ImageIcon className="w-full h-full" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isDragOver ? 'Drop images here' : placeholder}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {multiple ? `Up to ${maxFiles} images` : 'Single image'} • 
              {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} • 
              Max {formatFileSize(maxSize)}
            </p>
          </div>

          {canAddMore && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-midnight hover:bg-ocean focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-midnight"
            >
              Browse Files
            </button>
          )}
        </div>
      </div>

      {/* File Previews */}
      {hasFiles && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {multiple ? `Uploaded Images (${value.length})` : 'Uploaded Image'}
          </h4>
          
          <div className={`
            grid gap-4
            ${multiple ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}
          `}>
            {multiple ? 
              value.map((file, index) => renderFilePreview(file, index)) :
              renderFilePreview(value, 0)
            }
          </div>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload; 