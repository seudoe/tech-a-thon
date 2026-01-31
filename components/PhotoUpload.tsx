'use client';

import { useState, useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';

interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
  onUploadComplete?: (photoUrls: string[]) => void;
  maxPhotos?: number;
  existingPhotos?: string[];
  userId?: number;
  productId?: number;
}

export default function PhotoUpload({ 
  onPhotosChange, 
  onUploadComplete,
  maxPhotos = 5, 
  existingPhotos = [],
  userId,
  productId
}: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) return false;
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });

    const totalFiles = selectedFiles.length + newFiles.length;
    if (totalFiles > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    onPhotosChange(updatedFiles);

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onPhotosChange(updatedFiles);
  };

  const uploadPhotos = async () => {
    if (!userId || !productId || selectedFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Create FormData for server-side upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId.toString());
        formData.append('productId', productId.toString());

        // Upload via API route (bypasses RLS)
        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(result.url);
        } else {
          console.error('Upload failed for file:', file.name);
        }
      }

      if (onUploadComplete && uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls);
      }

      // Clear selected files after successful upload
      setSelectedFiles([]);
      setPreviews([]);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop photos here, or click to select
        </p>
        <p className="text-xs text-gray-500">
          Max {maxPhotos} photos, up to 10MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Photo Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {(selectedFiles[index].size / 1024 / 1024).toFixed(1)}MB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && userId && productId && (
        <button
          onClick={uploadPhotos}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`}
        </button>
      )}

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Photos</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {existingPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}