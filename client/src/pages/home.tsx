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
import { useLanguage } from '@/lib/language-context';
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
  const { t } = useLanguage();
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
              title: t('progress.createdSuccess'),
              description: t('progress.readyPreview'),
            });
          } else if (job.status === 'error') {
            toast({
              title: t('progress.error'),
              description: job.error || t('progress.errorCreating'),
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
        title: t('connection.connectionFailed'),
        description: error.message || t('connection.connectionFailed'),
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
        albumId: filter.albumId || undefined,
        dateFrom: filter.dateFrom || undefined,
        dateTo: filter.dateTo || undefined,
        filename: filter.filename || undefined,
        limit: 10000,
      });
      
      setAssets(fetchedAssets);
      setPhotoCount(fetchedAssets.length);
      deselectAllAssets();
      
      toast({
        title: t('toast.loadingPhotos'),
        description: `Found ${fetchedAssets.length} ${t('filter.photosFound')}`,
      });
    } catch (error: any) {
      toast({
        title: t('toast.loadingFailed'),
        description: error.message || t('toast.couldNotFetch'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [connection.isConnected, filter, setAssets, setIsLoading, deselectAllAssets, toast, t]);

  const handleGenerateTimelapse = useCallback(async () => {
    const selectedCount = selectedAssets.size;
    if (selectedCount === 0) {
      toast({
        title: t('toast.selectPhotos'),
        description: t('toast.selectPhotosDesc'),
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
        title: t('progress.creating'),
        description: t('progress.generatingMsg'),
      });
    } catch (error: any) {
      setCurrentJob({
        id: 'error',
        status: 'error',
        progress: 0,
        totalFrames: selectedCount,
        processedFrames: 0,
        error: error.message || t('progress.errorCreating'),
      });
      toast({
        title: t('toast.error'),
        description: error.message || t('progress.errorCreating'),
        variant: 'destructive',
      });
    }
  }, [selectedAssets, assets, timelapseSettings, setCurrentJob, toast, t]);

  const handleCancelProcessing = useCallback(() => {
    if (currentJob?.id && currentJob.id !== 'pending' && currentJob.id !== 'error') {
      api.deleteTimelapse(currentJob.id).catch(console.error);
    }
    setCurrentJob(null);
    toast({
      title: t('progress.cancelled'),
      description: t('progress.cancelled'),
    });
  }, [currentJob, setCurrentJob, toast, t]);

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
        title: t('preview.downloadStarted'),
        description: `${t('preview.downloading')} timelapse.${timelapseSettings.format}`,
      });
    }
  }, [currentJob, timelapseSettings.format, toast, t]);

  const handleRegenerate = useCallback(() => {
    if (currentJob?.id && currentJob.id !== 'pending' && currentJob.id !== 'error') {
      api.deleteTimelapse(currentJob.id).catch(console.error);
    }
    setCurrentJob(null);
    handleGenerateTimelapse();
  }, [currentJob, setCurrentJob, handleGenerateTimelapse]);

  const handleSettingsClick = useCallback(() => {
    toast({
      title: t('settings.title'),
      description: 'Settings panel coming soon',
    });
  }, [toast, t]);

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
