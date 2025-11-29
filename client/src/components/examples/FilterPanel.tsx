import FilterPanel from '../FilterPanel';
import { ImmichProvider, useImmich } from '@/lib/immich-context';
import { useEffect } from 'react';

function FilterPanelWithMockData() {
  const { setConnection, setAlbums } = useImmich();

  useEffect(() => {
    // todo: remove mock functionality
    setConnection({
      serverUrl: 'https://immich.example.com',
      apiKey: 'mock-api-key',
      isConnected: true,
    });
    setAlbums([
      { id: '1', albumName: 'Vacation 2024', assetCount: 342 },
      { id: '2', albumName: 'Family Photos', assetCount: 156 },
      { id: '3', albumName: 'Nature', assetCount: 89 },
    ]);
  }, [setConnection, setAlbums]);

  const handleApplyFilters = () => {
    console.log('Applying filters...');
  };

  return (
    <div className="w-80">
      <FilterPanel onApplyFilters={handleApplyFilters} photoCount={247} />
    </div>
  );
}

export default function FilterPanelExample() {
  return (
    <ImmichProvider>
      <FilterPanelWithMockData />
    </ImmichProvider>
  );
}
