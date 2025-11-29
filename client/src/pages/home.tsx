import { useState, useCallback, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/Header';
import ConnectionPanel from '@/components/ConnectionPanel';
import FilterPanel from '@/components/FilterPanel';
import TimelapseSettingsPanel from '@/components/TimelapseSettings';
import PhotoGrid from '@/components/PhotoGrid';
import ProcessingProgress from '@/components/ProcessingProgress';
import VideoPreview from '@/components/VideoPreview';
import { useImmich } from '@/lib/immich-context';
import { useToast } from '@/hooks/use-toast';
import type { ImmichAsset, ImmichAlbum } from '@/lib/types';

export default function Home() {
  const { 
    connection,
    setConnection,
    setAssets, 
    setAlbums,
    selectedAssets,
    setCurrentJob,
    currentJob,
    timelapseSettings,
    isLoading,
    setIsLoading,
  } = useImmich();
  const { toast } = useToast();
  const [photoCount, setPhotoCount] = useState(0);

  // todo: remove mock functionality - this simulates fetching albums from Immich
  const handleConnect = useCallback(async (serverUrl: string, apiKey: string) => {
    console.log('Connecting to:', serverUrl);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate fetching albums
    const mockAlbums: ImmichAlbum[] = [
      { id: '1', albumName: 'Vacation 2024', assetCount: 342 },
      { id: '2', albumName: 'Family Photos', assetCount: 156 },
      { id: '3', albumName: 'Nature', assetCount: 89 },
      { id: '4', albumName: 'Architecture', assetCount: 67 },
      { id: '5', albumName: 'Street Photography', assetCount: 234 },
    ];
    setAlbums(mockAlbums);
    
    return true;
  }, [setAlbums]);

  // todo: remove mock functionality - this simulates fetching photos from Immich
  const handleApplyFilters = useCallback(async () => {
    if (!connection.isConnected) return;
    
    setIsLoading(true);
    console.log('Applying filters...');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock assets
    const count = Math.floor(Math.random() * 100) + 50;
    const mockAssets: ImmichAsset[] = Array.from({ length: count }, (_, i) => ({
      id: `asset-${Date.now()}-${i + 1}`,
      deviceAssetId: `device-${i + 1}`,
      ownerId: 'user-1',
      deviceId: 'device-1',
      type: 'IMAGE',
      originalPath: `/photos/photo-${i + 1}.jpg`,
      originalFileName: `IMG_${String(i + 1).padStart(4, '0')}.jpg`,
      fileCreatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      fileModifiedAt: new Date(Date.now() - i * 3600000).toISOString(),
      isFavorite: i % 7 === 0,
      duration: null,
    }));
    
    setAssets(mockAssets);
    setPhotoCount(count);
    setIsLoading(false);
    
    toast({
      title: 'Photos loaded',
      description: `Found ${count} photos matching your filters`,
    });
  }, [connection.isConnected, setAssets, setIsLoading, toast]);

  // Auto-load photos when connected
  useEffect(() => {
    if (connection.isConnected) {
      handleApplyFilters();
    }
  }, [connection.isConnected]);

  // todo: remove mock functionality - this simulates timelapse generation
  const handleGenerateTimelapse = useCallback(async () => {
    const selectedCount = selectedAssets.size;
    if (selectedCount === 0) {
      toast({
        title: 'No photos selected',
        description: 'Please select photos to create a timelapse',
        variant: 'destructive',
      });
      return;
    }

    // Start processing
    setCurrentJob({
      id: `job-${Date.now()}`,
      status: 'pending',
      progress: 0,
      totalFrames: selectedCount,
      processedFrames: 0,
      estimatedTimeRemaining: Math.round(selectedCount * 0.5),
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate processing
    const totalFrames = selectedCount;
    for (let i = 0; i <= totalFrames; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const progress = (i / totalFrames) * 100;
      setCurrentJob({
        id: `job-${Date.now()}`,
        status: 'processing',
        progress,
        totalFrames,
        processedFrames: i,
        estimatedTimeRemaining: Math.round((totalFrames - i) * 0.05),
      });
    }

    // Complete
    setCurrentJob({
      id: `job-${Date.now()}`,
      status: 'completed',
      progress: 100,
      totalFrames,
      processedFrames: totalFrames,
      outputUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    });

    toast({
      title: 'Timelapse created',
      description: 'Your timelapse is ready to preview and download',
    });
  }, [selectedAssets, setCurrentJob, toast]);

  const handleCancelProcessing = useCallback(() => {
    setCurrentJob(null);
    toast({
      title: 'Processing cancelled',
      description: 'Timelapse generation was cancelled',
    });
  }, [setCurrentJob, toast]);

  const handleDownload = useCallback(() => {
    // todo: remove mock functionality - implement actual download
    console.log('Downloading timelapse...');
    toast({
      title: 'Download started',
      description: `Downloading timelapse.${timelapseSettings.format}`,
    });
  }, [timelapseSettings.format, toast]);

  const handleRegenerate = useCallback(() => {
    setCurrentJob(null);
    handleGenerateTimelapse();
  }, [setCurrentJob, handleGenerateTimelapse]);

  const handleSettingsClick = useCallback(() => {
    console.log('Settings clicked');
    toast({
      title: 'Settings',
      description: 'Settings panel coming soon',
    });
  }, [toast]);

  const showPreview = currentJob?.status === 'completed';
  const showProgress = currentJob && currentJob.status !== 'completed';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSettingsClick={handleSettingsClick} />
      
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r bg-card/50">
          <ScrollArea className="h-auto lg:h-[calc(100vh-3.5rem)]">
            <div className="p-4 space-y-4">
              <ConnectionPanel onConnect={handleConnect} />
              <FilterPanel onApplyFilters={handleApplyFilters} photoCount={photoCount} />
              <TimelapseSettingsPanel selectedCount={selectedAssets.size} />
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0 p-4 gap-4">
          {showProgress && (
            <ProcessingProgress onCancel={handleCancelProcessing} />
          )}
          
          {showPreview && (
            <VideoPreview 
              onDownload={handleDownload} 
              onRegenerate={handleRegenerate} 
            />
          )}
          
          <PhotoGrid 
            isLoading={isLoading} 
            onGenerateTimelapse={handleGenerateTimelapse} 
          />
        </main>
      </div>
    </div>
  );
}
