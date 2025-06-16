'use client';

import { useState } from 'react';
import { VideoForm } from '@/components/VideoForm';
import { VideoPreview } from '@/components/VideoPreview';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (videoFile: File, targetLanguage: string) => {
    setIsProcessing(true);
    setProgress(0);
    setOutputVideo(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setOutputVideo(data.outputUrl);
    } catch (error) {
      console.error('Error processing video:', error);
      setError(error instanceof Error ? error.message : 'Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Language Reel Translator
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <VideoForm onSubmit={handleSubmit} isProcessing={isProcessing} />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {isProcessing && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-gray-600">
                Processing your video... {progress}%
              </p>
            </div>
          )}

          {outputVideo && <VideoPreview videoUrl={outputVideo} />}
        </div>
      </div>
    </main>
  );
}
