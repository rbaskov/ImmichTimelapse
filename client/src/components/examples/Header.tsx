import Header from '../Header';
import { ImmichProvider, useImmich } from '@/lib/immich-context';
import { useEffect } from 'react';

function HeaderWithMockData() {
  const { setConnection } = useImmich();

  useEffect(() => {
    // todo: remove mock functionality
    setConnection({
      serverUrl: 'https://immich.example.com',
      apiKey: 'mock-api-key',
      isConnected: true,
    });
  }, [setConnection]);

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  return <Header onSettingsClick={handleSettingsClick} />;
}

export default function HeaderExample() {
  return (
    <ImmichProvider>
      <HeaderWithMockData />
    </ImmichProvider>
  );
}
