import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ImmichConnection, ImmichAlbum, ImmichAsset, PhotoFilter, TimelapseSettings, TimelapseJob } from './types';

interface ImmichContextType {
  connection: ImmichConnection;
  setConnection: (conn: ImmichConnection) => void;
  albums: ImmichAlbum[];
  setAlbums: (albums: ImmichAlbum[]) => void;
  assets: ImmichAsset[];
  setAssets: (assets: ImmichAsset[]) => void;
  selectedAssets: Set<string>;
  toggleAssetSelection: (id: string) => void;
  selectAllAssets: () => void;
  deselectAllAssets: () => void;
  filter: PhotoFilter;
  setFilter: (filter: PhotoFilter) => void;
  timelapseSettings: TimelapseSettings;
  setTimelapseSettings: (settings: TimelapseSettings) => void;
  currentJob: TimelapseJob | null;
  setCurrentJob: (job: TimelapseJob | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ImmichContext = createContext<ImmichContextType | undefined>(undefined);

export function ImmichProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<ImmichConnection>({
    serverUrl: '',
    apiKey: '',
    isConnected: false,
  });
  const [albums, setAlbums] = useState<ImmichAlbum[]>([]);
  const [assets, setAssets] = useState<ImmichAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<PhotoFilter>({});
  const [timelapseSettings, setTimelapseSettings] = useState<TimelapseSettings>({
    fps: 24,
    resolution: '1080p',
    format: 'mp4',
    bitrate: 'medium',
    codec: 'h264',
    aspectRatio: '16:9',
    interpolation: 'none',
    customFps: undefined,
  });
  const [currentJob, setCurrentJob] = useState<TimelapseJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleAssetSelection = useCallback((id: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllAssets = useCallback(() => {
    setSelectedAssets(new Set(assets.map(a => a.id)));
  }, [assets]);

  const deselectAllAssets = useCallback(() => {
    setSelectedAssets(new Set());
  }, []);

  return (
    <ImmichContext.Provider
      value={{
        connection,
        setConnection,
        albums,
        setAlbums,
        assets,
        setAssets,
        selectedAssets,
        toggleAssetSelection,
        selectAllAssets,
        deselectAllAssets,
        filter,
        setFilter,
        timelapseSettings,
        setTimelapseSettings,
        currentJob,
        setCurrentJob,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ImmichContext.Provider>
  );
}

export function useImmich() {
  const context = useContext(ImmichContext);
  if (context === undefined) {
    throw new Error('useImmich must be used within an ImmichProvider');
  }
  return context;
}
