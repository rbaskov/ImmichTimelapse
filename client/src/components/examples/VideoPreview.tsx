import VideoPreview from '../VideoPreview';
import { ImmichProvider, useImmich } from '@/lib/immich-context';
import { useEffect } from 'react';

function VideoPreviewWithMockData() {
  const { setCurrentJob } = useImmich();

  useEffect(() => {
    // todo: remove mock functionality
    setCurrentJob({
      id: 'job-1',
      status: 'completed',
      progress: 100,
      totalFrames: 120,
      processedFrames: 120,
      outputUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    });
  }, [setCurrentJob]);

  const handleDownload = () => {
    console.log('Downloading timelapse...');
  };

  const handleRegenerate = () => {
    console.log('Regenerating timelapse...');
  };

  return (
    <div className="w-full max-w-2xl">
      <VideoPreview onDownload={handleDownload} onRegenerate={handleRegenerate} />
    </div>
  );
}

export default function VideoPreviewExample() {
  return (
    <ImmichProvider>
      <VideoPreviewWithMockData />
    </ImmichProvider>
  );
}
