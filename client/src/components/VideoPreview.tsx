import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Download, RefreshCw, Film, Settings2 } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { useRef, useState } from 'react';

interface VideoPreviewProps {
  videoUrl?: string;
  onDownload?: () => void;
  onRegenerate?: () => void;
}

export default function VideoPreview({ videoUrl, onDownload, onRegenerate }: VideoPreviewProps) {
  const { timelapseSettings, currentJob } = useImmich();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!currentJob || currentJob.status !== 'completed') {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No preview available</p>
            <p className="text-sm">Generate a timelapse to see the preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const previewUrl = videoUrl || currentJob.outputUrl;

  if (!previewUrl || !currentJob.id) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Preview unavailable</p>
            <p className="text-sm">Could not load the timelapse preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Always use the API preview URL based on jobId
  const apiPreviewUrl = `/api/timelapse/${currentJob.id}/preview?sessionId=${localStorage.getItem('immich_session_id') || ''}`;

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Preview
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              <Settings2 className="h-3 w-3 mr-1" />
              {timelapseSettings.fps}fps / {timelapseSettings.resolution} / {timelapseSettings.format.toUpperCase()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={apiPreviewUrl}
            className="w-full h-full object-contain"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            data-testid="video-preview"
          />
          {!isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity hover:bg-black/20"
              onClick={togglePlay}
            >
              <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="h-8 w-8 text-black ml-1" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="flex-1"
            onClick={onDownload}
            data-testid="button-download"
          >
            <Download className="h-4 w-4 mr-2" />
            Download {timelapseSettings.format.toUpperCase()}
          </Button>
          <Button
            variant="outline"
            onClick={onRegenerate}
            data-testid="button-regenerate"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
