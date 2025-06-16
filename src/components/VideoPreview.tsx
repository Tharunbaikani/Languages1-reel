'use client';

interface VideoPreviewProps {
  videoUrl: string;
}

export function VideoPreview({ videoUrl }: VideoPreviewProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'translated-reel.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Processed Video</h2>
      
      <div className="aspect-w-16 aspect-h-9">
        <video
          src={videoUrl}
          controls
          className="w-full rounded-lg shadow-lg"
          poster="/video-placeholder.jpg"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Download Video
      </button>
    </div>
  );
} 