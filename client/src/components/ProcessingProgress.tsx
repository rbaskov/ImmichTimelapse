import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock, Film, X } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { useLanguage } from '@/lib/language-context';

interface ProcessingProgressProps {
  onCancel?: () => void;
}

export default function ProcessingProgress({ onCancel }: ProcessingProgressProps) {
  const { currentJob } = useImmich();
  const { t } = useLanguage();

  if (!currentJob) return null;

  const { status, progress, processedFrames, totalFrames, estimatedTimeRemaining, error } = currentJob;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {(status === 'downloading' || status === 'processing') && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {status === 'completed' && <CheckCircle2 className="h-4 w-4 text-status-online" />}
          {status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
          {status === 'pending' && <Clock className="h-4 w-4 text-status-away" />}
          
          {status === 'pending' && t('progress.preparing')}
          {status === 'downloading' && t('progress.downloading')}
          {status === 'processing' && t('progress.creating')}
          {status === 'completed' && t('progress.ready')}
          {status === 'error' && t('progress.error')}

          {status === 'processing' && onCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              onClick={onCancel}
              data-testid="button-cancel-processing"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {(status === 'pending' || status === 'downloading' || status === 'processing') && (
          <>
            <Progress value={progress} className="h-2" data-testid="progress-bar" />
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Film className="h-3 w-3" />
                {processedFrames} / {totalFrames} {t('progress.frames')}
              </span>
              <span className="font-mono font-medium" data-testid="text-progress-percent">
                {Math.round(progress)}%
              </span>
            </div>
            {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>~{formatTime(estimatedTimeRemaining)} {t('progress.remaining')}</span>
              </div>
            )}
          </>
        )}

        {status === 'error' && (
          <div className="p-3 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive" data-testid="text-error-message">
              {error || t('progress.errorCreating')}
            </p>
          </div>
        )}

        {status === 'completed' && (
          <div className="flex items-center gap-2 text-sm text-status-online">
            <CheckCircle2 className="h-4 w-4" />
            <span>{t('progress.readyPreview')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
