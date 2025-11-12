'use client';

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploaderProps {
  logoUrl: string;
  onChange: (url: string) => void;
}

export function LogoUploader({ logoUrl, onChange }: LogoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(logoUrl || '');
  const [uploading, setUploading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File size must be less than 5MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onChange(base64);
      setUploading(false);
    };
    reader.onerror = () => {
      alert('❌ Failed to read file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  return (
    <div className="flex items-start gap-6">
      {/* Preview */}
      <div className="flex-shrink-0">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Company Logo"
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
        <h4 className="font-semibold text-gray-900 mb-2">Company Logo</h4>
        <p className="text-sm text-gray-600 mb-4">
          Upload your company logo. Recommended size: 512x512px. Max 5MB.
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
                {preview ? 'Change Logo' : 'Upload Logo'}
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
          accept="image/*"
          ref={fileRef}
          onChange={handleUpload}
          className="hidden"
        />

        <p className="text-xs text-gray-500 mt-3">
          Supported formats: JPG, PNG, GIF, WebP
        </p>
      </div>
    </div>
  );
}
