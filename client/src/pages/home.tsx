import { useState, useCallback, useEffect, useRef } from 'react';
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
import * as api from '@/lib/api';

export default function Home() {
  const { 
    connection,
    setConnection,
    setAssets, 
    setAlbums,
    selectedAssets,
    deselectAllAssets,
    setCurrentJob,
    currentJob,
    timelapseSettings,
    isLoading,
    setIsLoading,
    filter,
    assets,
  } = useImmich();
  const { toast } = useToast();
  const [photoCount, setPhotoCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    api.getSessionId();
  }, []);

  useEffect(() => {
    if (connection.isConnected && !wsRef.current) {
      wsRef.current = api.createWebSocketConnection((data) => {
        if (data.type === 'timelapse_progress') {
          const job = data.job;
          setCurrentJob({
            id: job.id,
            status: job.status,
            progress: job.progress,
            totalFrames: job.totalFrames,
            processedFrames: job.processedFrames,
            estimatedTimeRemaining: job.estimatedTimeRemaining,
            outputUrl: job.outputPath ? api.getTimelapsePreviewUrl(job.id) : undefined,
            error: job.error,
          });

          if (job.status === 'completed') {
            toast({
              title: 'Timelapse created',
              description: 'Your timelapse is ready to preview and download',
            });
          } else if (job.status === 'error') {
            toast({
              title: 'Error',
              description: job.error || 'Failed to create timelapse',
              variant: 'destructive',
            });
          }
        }
      });
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connection.isConnected, setCurrentJob, toast]);

  const handleConnect = useCallback(async (serverUrl: string, apiKey: string) => {
    try {
      const result = await api.connectToImmich(serverUrl, apiKey);
      
      if (result.success) {
        const albums = await api.getAlbums();
        setAlbums(albums);
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message || 'Could not connect to Immich server',
        variant: 'destructive',
      });
      return false;
    }
  }, [setAlbums, toast]);

  const handleApplyFilters = useCallback(async () => {
    if (!connection.isConnected) return;
    
    setIsLoading(true);
    
    try {
      const fetchedAssets = await api.getAssets({
        albumId: filter.albumId,
        dateFrom: filter.dateFrom,
        dateTo: filter.dateTo,
        filename: filter.filename,
        limit: 500,
      });
      
      setAssets(fetchedAssets);
      setPhotoCount(fetchedAssets.length);
      deselectAllAssets();
      
      toast({
        title: 'Photos loaded',
        description: `Found ${fetchedAssets.length} photos`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to load photos',
        description: error.message || 'Could not fetch photos from Immich',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [connection.isConnected, filter, setAssets, setIsLoading, deselectAllAssets, toast]);

  useEffect(() => {
    if (connection.isConnected && assets.length === 0) {
      handleApplyFilters();
    }
  }, [connection.isConnected]);

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

    try {
      const sortedAssetIds = assets
        .filter(a => selectedAssets.has(a.id))
        .sort((a, b) => new Date(a.fileCreatedAt).getTime() - new Date(b.fileCreatedAt).getTime())
        .map(a => a.id);

      const jobId = await api.createTimelapse(sortedAssetIds, timelapseSettings);
      
      setCurrentJob({
        id: jobId,
        status: 'pending',
        progress: 0,
        totalFrames: selectedCount,
        processedFrames: 0,
      });

      toast({
        title: 'Generating timelapse',
        description: `Processing ${selectedCount} photos...`,
      });
    } catch (error: any) {
      setCurrentJob({
        id: 'error',
        status: 'error',
        progress: 0,
        totalFrames: selectedCount,
        processedFrames: 0,
        error: error.message || 'Failed to start timelapse creation',
      });
      toast({
        title: 'Error',
        description: error.message || 'Failed to start timelapse creation',
        variant: 'destructive',
      });
    }
  }, [selectedAssets, assets, timelapseSettings, setCurrentJob, toast]);

  const handleCancelProcessing = useCallback(() => {
    if (currentJob?.id && currentJob.id !== 'pending' && currentJob.id !== 'error') {
      api.deleteTimelapse(currentJob.id).catch(console.error);
    }
    setCurrentJob(null);
    toast({
      title: 'Processing cancelled',
      description: 'Timelapse generation was cancelled',
    });
  }, [currentJob, setCurrentJob, toast]);

  const handleDownload = useCallback(() => {
    if (currentJob?.id && currentJob.status === 'completed') {
      const downloadUrl = api.getTimelapseDownloadUrl(currentJob.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `timelapse.${timelapseSettings.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download started',
        description: `Downloading timelapse.${timelapseSettings.format}`,
      });
    }
  }, [currentJob, timelapseSettings.format, toast]);

  const handleRegenerate = useCallback(() => {
    if (currentJob?.id && currentJob.id !== 'pending' && currentJob.id !== 'error') {
      api.deleteTimelapse(currentJob.id).catch(console.error);
    }
    setCurrentJob(null);
    handleGenerateTimelapse();
  }, [currentJob, setCurrentJob, handleGenerateTimelapse]);

  const handleSettingsClick = useCallback(() => {
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
        <aside className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r bg-card/50">
          <ScrollArea className="h-auto lg:h-[calc(100vh-3.5rem)]">
            <div className="p-4 space-y-4">
              <ConnectionPanel onConnect={handleConnect} />
              <FilterPanel onApplyFilters={handleApplyFilters} photoCount={photoCount} />
              <TimelapseSettingsPanel selectedCount={selectedAssets.size} />
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 flex flex-col min-h-0 p-4 gap-4">
          {showProgress && (
            <ProcessingProgress onCancel={handleCancelProcessing} />
          )}
          
          {showPreview && currentJob && (
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
