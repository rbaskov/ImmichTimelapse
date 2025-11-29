import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Settings2, Clock, Film, Monitor, Zap, Maximize2, Layers } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { useLanguage } from '@/lib/language-context';

interface TimelapseSettingsProps {
  selectedCount?: number;
}

export default function TimelapseSettingsPanel({ selectedCount = 0 }: TimelapseSettingsProps) {
  const { timelapseSettings, setTimelapseSettings } = useImmich();
  const { t } = useLanguage();

  const fpsOptions = [10, 15, 24, 30, 60] as const;
  
  const estimatedDuration = selectedCount > 0 
    ? (selectedCount / timelapseSettings.fps).toFixed(1) 
    : '0';

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          {t('settings.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Film className="h-3 w-3" />
            {t('settings.fps')}
          </Label>
          <ToggleGroup
            type="single"
            value={String(timelapseSettings.fps)}
            onValueChange={(value) => {
              if (value) {
                setTimelapseSettings({
                  ...timelapseSettings,
                  fps: Number(value) as typeof timelapseSettings.fps,
                });
              }
            }}
            className="justify-start"
          >
            {fpsOptions.map((fps) => (
              <ToggleGroupItem
                key={fps}
                value={String(fps)}
                className="px-3"
                data-testid={`toggle-fps-${fps}`}
              >
                {fps}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Monitor className="h-3 w-3" />
            {t('settings.resolution')}
          </Label>
          <Select
            value={timelapseSettings.resolution}
            onValueChange={(value) => setTimelapseSettings({
              ...timelapseSettings,
              resolution: value as typeof timelapseSettings.resolution,
            })}
          >
            <SelectTrigger data-testid="select-resolution">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p (1280x720)</SelectItem>
              <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
              <SelectItem value="4K">4K (3840x2160)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Film className="h-3 w-3" />
            {t('settings.format')}
          </Label>
          <ToggleGroup
            type="single"
            value={timelapseSettings.format}
            onValueChange={(value) => {
              if (value) {
                setTimelapseSettings({
                  ...timelapseSettings,
                  format: value as typeof timelapseSettings.format,
                });
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="mp4" className="px-4" data-testid="toggle-format-mp4">
              MP4
            </ToggleGroupItem>
            <ToggleGroupItem value="webm" className="px-4" data-testid="toggle-format-webm">
              WebM
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Bitrate
          </Label>
          <ToggleGroup
            type="single"
            value={timelapseSettings.bitrate}
            onValueChange={(value) => {
              if (value) {
                setTimelapseSettings({
                  ...timelapseSettings,
                  bitrate: value as typeof timelapseSettings.bitrate,
                });
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="low" className="px-3" data-testid="toggle-bitrate-low">
              Low
            </ToggleGroupItem>
            <ToggleGroupItem value="medium" className="px-3" data-testid="toggle-bitrate-medium">
              Medium
            </ToggleGroupItem>
            <ToggleGroupItem value="high" className="px-3" data-testid="toggle-bitrate-high">
              High
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Film className="h-3 w-3" />
            Codec
          </Label>
          <Select
            value={timelapseSettings.codec}
            onValueChange={(value) => setTimelapseSettings({
              ...timelapseSettings,
              codec: value as typeof timelapseSettings.codec,
            })}
          >
            <SelectTrigger data-testid="select-codec">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h264">H.264 (MP4)</SelectItem>
              <SelectItem value="h265">H.265/HEVC</SelectItem>
              <SelectItem value="vp8">VP8 (WebM)</SelectItem>
              <SelectItem value="vp9">VP9 (WebM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Maximize2 className="h-3 w-3" />
            Aspect Ratio
          </Label>
          <Select
            value={timelapseSettings.aspectRatio}
            onValueChange={(value) => setTimelapseSettings({
              ...timelapseSettings,
              aspectRatio: value as typeof timelapseSettings.aspectRatio,
            })}
          >
            <SelectTrigger data-testid="select-aspect-ratio">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
              <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
              <SelectItem value="4:3">4:3 (Standard)</SelectItem>
              <SelectItem value="1:1">1:1 (Square)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Layers className="h-3 w-3" />
            Frame Interpolation
          </Label>
          <ToggleGroup
            type="single"
            value={timelapseSettings.interpolation}
            onValueChange={(value) => {
              if (value) {
                setTimelapseSettings({
                  ...timelapseSettings,
                  interpolation: value as typeof timelapseSettings.interpolation,
                });
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="none" className="px-3" data-testid="toggle-interpolation-none">
              Off
            </ToggleGroupItem>
            <ToggleGroupItem value="linear" className="px-3" data-testid="toggle-interpolation-linear">
              Linear
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Duration
            </span>
            <span className="font-mono font-medium" data-testid="text-duration-estimate">
              {estimatedDuration}s
            </span>
          </div>
          {selectedCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedCount} frames at {timelapseSettings.fps} fps
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
