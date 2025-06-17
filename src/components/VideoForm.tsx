'use client';

import { useState } from 'react';

interface VideoFormProps {
  onSubmit: (videoUrl: string, targetLanguage: string) => void;
  isProcessing: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'id', name: 'Indonesian' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'sw', name: 'Swahili' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ta', name: 'Tamil' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fa', name: 'Persian' },
  { code: 'it', name: 'Italian' },
  { code: 'th', name: 'Thai' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ms', name: 'Malay' },
  { code: 'pa', name: 'Punjabi' },
];

export function VideoForm({ onSubmit, isProcessing }: VideoFormProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    // For Instagram reels, we can't create a preview URL directly
    // The preview will be shown after the video is downloaded
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl) {
      onSubmit(videoUrl, targetLanguage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
          Instagram Reel URL
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={videoUrl}
            onChange={handleUrlChange}
            placeholder="https://www.instagram.com/reel/..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={isProcessing}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Paste the URL of the Instagram reel you want to translate
        </p>
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
        disabled={isProcessing || !videoUrl}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isProcessing || !videoUrl
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Translate & Lip Sync'}
      </button>
    </form>
  );
} 