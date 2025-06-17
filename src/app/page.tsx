'use client';

import { useState } from 'react';
import { VideoForm } from '@/components/VideoForm';
import { VideoPreview } from '@/components/VideoPreview';

const PROCESS_STEPS = [
  'Downloading video',
  'Preprocessing (downscale)',
  'Extracting audio',
  'Transcribing',
  'Translating',
  'Text-to-speech',
  'Uploading to FAL',
  'Lip-syncing',
  'Done'
];

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Helper to update progress by step
  const updateProgressStep = (step: number) => {
    setProgressStep(step);
    setProgress(Math.round((step / (PROCESS_STEPS.length - 1)) * 100));
  };

  const handleSubmit = async (videoUrl: string, targetLanguage: string) => {
    setIsProcessing(true);
    setProgress(0);
    setProgressStep(0);
    setOutputVideo(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('videoUrl', videoUrl);
      formData.append('targetLanguage', targetLanguage);

      // Simulate step progress (replace with real-time updates if backend supports it)
      updateProgressStep(0); // Downloading video
      await new Promise((res) => setTimeout(res, 800));
      updateProgressStep(1); // Preprocessing
      await new Promise((res) => setTimeout(res, 800));
      updateProgressStep(2); // Extracting audio
      await new Promise((res) => setTimeout(res, 800));
      updateProgressStep(3); // Transcribing
      await new Promise((res) => setTimeout(res, 800));
      updateProgressStep(4); // Translating
      await new Promise((res) => setTimeout(res, 800));
      updateProgressStep(5); // Text-to-speech
      await new Promise((res) => setTimeout(res, 800));
      updateProgressStep(6); // Uploading to FAL
      await new Promise((res) => setTimeout(res, 800));
      updateProgressStep(7); // Lip-syncing

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      updateProgressStep(8); // Done
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
                {PROCESS_STEPS[progressStep]}... {progress}%
              </p>
            </div>
          )}

          {outputVideo && <VideoPreview videoUrl={outputVideo} />}
        </div>
      </div>
    </main>
  );
}
