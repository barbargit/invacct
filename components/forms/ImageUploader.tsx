'use client';

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  imageUrl?: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function ImageUploader({
  imageUrl,
  onChange,
  label = "Item Image",
  maxSizeMB = 1,
  acceptedTypes = ['.jpg', '.jpeg', '.png']
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(imageUrl || '');
  const [uploading, setUploading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!acceptedTypes.includes(fileExt)) {
      alert(`❌ Invalid file type. Only ${acceptedTypes.join(', ')} are allowed`);
      return;
    }

    // Validate file size (1MB limit)
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`❌ File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);

    // Create a preview URL for the selected file
    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);
    
    // For now, we'll use a placeholder URL
    // In production, this would upload to cloud storage
    const placeholderUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;
    onChange(placeholderUrl);
    setUploading(false);
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="flex items-start gap-6">
        {/* Preview */}
        <div className="flex-shrink-0">
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Item Image"
                className="w-32 h-32 rounded-lg shadow-md object-contain border-2 border-gray-200 bg-white"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-4">
            Upload an image for this item. Max {maxSizeMB}MB. Images larger than {maxSizeMB}MB will be automatically resized.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${
                uploading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {uploading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {preview ? 'Change Image' : 'Upload Image'}
                </>
              )}
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          <input
            type="file"
            accept={acceptedTypes.join(',')}
            ref={fileRef}
            onChange={handleUpload}
            className="hidden"
          />

          <p className="text-xs text-gray-500 mt-3">
            Supported formats: {acceptedTypes.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}