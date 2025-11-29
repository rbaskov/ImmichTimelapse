import ConnectionPanel from '../ConnectionPanel';
import { ImmichProvider } from '@/lib/immich-context';

export default function ConnectionPanelExample() {
  const handleConnect = async (serverUrl: string, apiKey: string) => {
    console.log('Connecting to:', serverUrl, 'with key:', apiKey.substring(0, 8) + '...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  return (
    <ImmichProvider>
      <div className="w-80">
        <ConnectionPanel onConnect={handleConnect} />
      </div>
    </ImmichProvider>
  );
}
