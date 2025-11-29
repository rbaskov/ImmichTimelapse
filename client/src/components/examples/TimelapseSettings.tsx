import TimelapseSettingsPanel from '../TimelapseSettings';
import { ImmichProvider } from '@/lib/immich-context';

export default function TimelapseSettingsExample() {
  return (
    <ImmichProvider>
      <div className="w-80">
        <TimelapseSettingsPanel selectedCount={120} />
      </div>
    </ImmichProvider>
  );
}
