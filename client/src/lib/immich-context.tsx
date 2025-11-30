import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ImmichConnection, ImmichAlbum, ImmichAsset, PhotoFilter, TimelapseSettings, TimelapseJob, SavedFilter } from './types';

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
  savedFilters: SavedFilter[];
  saveFilter: (name: string, filterData?: PhotoFilter) => void;
  loadFilter: (id: string) => void;
  deleteSavedFilter: (id: string) => void;
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
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('immich_saved_filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
  }, []);

  const saveFilter = useCallback((name: string, filterData?: PhotoFilter) => {
    const dataToSave = filterData || filter;
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filter: dataToSave,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('immich_saved_filters', JSON.stringify(updated));
  }, [savedFilters, filter]);

  const loadFilter = useCallback((id: string) => {
    const saved = savedFilters.find(f => f.id === id);
    if (saved) {
      setFilter(saved.filter);
    }
  }, [savedFilters]);

  const deleteSavedFilter = useCallback((id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('immich_saved_filters', JSON.stringify(updated));
  }, [savedFilters]);

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
        savedFilters,
        saveFilter,
        loadFilter,
        deleteSavedFilter,
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
