import PhotoGrid from '../PhotoGrid';
import { ImmichProvider, useImmich } from '@/lib/immich-context';
import { useEffect } from 'react';
import type { ImmichAsset } from '@/lib/types';

function PhotoGridWithMockData() {
  const { setConnection, setAssets } = useImmich();

  useEffect(() => {
    // todo: remove mock functionality
    setConnection({
      serverUrl: 'https://immich.example.com',
      apiKey: 'mock-api-key',
      isConnected: true,
    });
    
    const mockAssets: ImmichAsset[] = Array.from({ length: 24 }, (_, i) => ({
      id: `asset-${i + 1}`,
      deviceAssetId: `device-${i + 1}`,
      ownerId: 'user-1',
      deviceId: 'device-1',
      type: 'IMAGE',
      originalPath: `/photos/photo-${i + 1}.jpg`,
      originalFileName: `photo-${i + 1}.jpg`,
      fileCreatedAt: new Date(Date.now() - i * 86400000).toISOString(),
      fileModifiedAt: new Date(Date.now() - i * 86400000).toISOString(),
      isFavorite: i % 5 === 0,
      duration: null,
    }));
    
    setAssets(mockAssets);
  }, [setConnection, setAssets]);

  const handleGenerateTimelapse = () => {
    console.log('Generating timelapse...');
  };

  return <PhotoGrid onGenerateTimelapse={handleGenerateTimelapse} />;
}

export default function PhotoGridExample() {
  return (
    <ImmichProvider>
      <div className="h-[500px]">
        <PhotoGridWithMockData />
      </div>
    </ImmichProvider>
  );
}
