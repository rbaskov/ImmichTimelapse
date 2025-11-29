import ProcessingProgress from '../ProcessingProgress';
import { ImmichProvider, useImmich } from '@/lib/immich-context';
import { useEffect } from 'react';

function ProcessingProgressWithMockData() {
  const { setCurrentJob } = useImmich();

  useEffect(() => {
    // todo: remove mock functionality
    setCurrentJob({
      id: 'job-1',
      status: 'processing',
      progress: 67,
      totalFrames: 120,
      processedFrames: 80,
      estimatedTimeRemaining: 45,
    });
  }, [setCurrentJob]);

  const handleCancel = () => {
    console.log('Cancelling processing...');
  };

  return <ProcessingProgress onCancel={handleCancel} />;
}

export default function ProcessingProgressExample() {
  return (
    <ImmichProvider>
      <div className="w-96">
        <ProcessingProgressWithMockData />
      </div>
    </ImmichProvider>
  );
}
