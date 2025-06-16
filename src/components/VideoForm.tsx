'use client';

import { useState } from 'react';

interface VideoFormProps {
  onSubmit: (videoFile: File, targetLanguage: string) => void;
  isProcessing: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

export function VideoForm({ onSubmit, isProcessing }: VideoFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoFile) {
      onSubmit(videoFile, targetLanguage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="videoFile" className="block text-sm font-medium text-gray-700">
          Upload Video
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="videoFile"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a video</span>
                <input
                  id="videoFile"
                  name="videoFile"
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">MP4, MOV up to 100MB</p>
          </div>
        </div>
        {previewUrl && (
          <div className="mt-4">
            <video
              src={previewUrl}
              controls
              className="w-full rounded-lg shadow-lg"
              style={{ maxHeight: '200px' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
          Target Language
        </label>
        <select
          id="language"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={isProcessing}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isProcessing || !videoFile}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isProcessing || !videoFile
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Translate & Lip Sync'}
      </button>
    </form>
  );
} 