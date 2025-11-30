import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings2, Clock, Film, Monitor, Zap, Maximize2, Layers } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import { useLanguage } from '@/lib/language-context';
import { useState } from 'react';

interface TimelapseSettingsProps {
  selectedCount?: number;
}

const resolutionsByAspectRatio = {
  '16:9': [
    { value: '720p', label: '720p (1280x720)' },
    { value: '1080p', label: '1080p (1920x1080)' },
    { value: '4K', label: '4K (3840x2160)' },
  ],
  '9:16': [
    { value: '720p', label: '720p (720x1280)' },
    { value: '1080p', label: '1080p (1080x1920)' },
    { value: '4K', label: '4K (2160x3840)' },
  ],
  '4:3': [
    { value: '720p', label: '720p (960x720)' },
    { value: '1080p', label: '1080p (1440x1080)' },
    { value: '4K', label: '4K (2880x2160)' },
  ],
  '1:1': [
    { value: '720p', label: '720p (720x720)' },
    { value: '1080p', label: '1080p (1080x1080)' },
    { value: '4K', label: '4K (3840x3840)' },
  ],
};

export default function TimelapseSettingsPanel({ selectedCount = 0 }: TimelapseSettingsProps) {
  const { timelapseSettings, setTimelapseSettings } = useImmich();
  const { t } = useLanguage();
  const [desiredDuration, setDesiredDuration] = useState<string>('');

  const fpsOptions = [10, 15, 24, 30, 60] as const;
  const availableResolutions = resolutionsByAspectRatio[timelapseSettings.aspectRatio];
  
  const activeFps = timelapseSettings.customFps || timelapseSettings.fps;
  
  const estimatedDuration = selectedCount > 0 
    ? (selectedCount / activeFps).toFixed(1) 
    : '0';

  const requiredFps = desiredDuration && selectedCount > 0
    ? (selectedCount / parseFloat(desiredDuration)).toFixed(1)
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
            <Maximize2 className="h-3 w-3" />
            Aspect Ratio
          </Label>
          <Select
            value={timelapseSettings.aspectRatio}
            onValueChange={(value) => {
              const newAspect = value as typeof timelapseSettings.aspectRatio;
              setTimelapseSettings({
                ...timelapseSettings,
                aspectRatio: newAspect,
                resolution: '1080p',
              });
            }}
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
              {availableResolutions.map((res) => (
                <SelectItem key={res.value} value={res.value}>
                  {res.label}
                </SelectItem>
              ))}
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

        <div className="pt-4 border-t space-y-4">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Current Duration
            </Label>
            <div className="flex items-center justify-between bg-muted/50 rounded-md p-2">
              <span className="text-xs text-muted-foreground">
                {selectedCount} frames at {activeFps} fps {timelapseSettings.customFps ? '(custom)' : ''}
              </span>
              <span className="font-mono font-semibold" data-testid="text-duration-estimate">
                {estimatedDuration}s
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration-input" className="text-sm flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Duration Calculator
            </Label>
            <div className="space-y-2">
              <Input
                id="duration-input"
                type="number"
                placeholder="Desired duration (seconds)"
                value={desiredDuration}
                onChange={(e) => setDesiredDuration(e.target.value)}
                min="0.1"
                step="0.1"
                data-testid="input-desired-duration"
              />
              {desiredDuration && selectedCount > 0 && (
                <>
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 rounded-md p-2">
                    <span className="text-xs text-muted-foreground">
                      Required FPS
                    </span>
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400" data-testid="text-required-fps">
                      {requiredFps} fps
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const fps = parseFloat(requiredFps);
                        setTimelapseSettings({
                          ...timelapseSettings,
                          customFps: Math.round(fps * 10) / 10,
                        });
                        setDesiredDuration('');
                      }}
                      size="sm"
                      variant="default"
                      className="flex-1"
                      data-testid="button-apply-duration"
                    >
                      Apply Duration
                    </Button>
                    {timelapseSettings.customFps && (
                      <Button
                        onClick={() => {
                          setTimelapseSettings({
                            ...timelapseSettings,
                            customFps: undefined,
                          });
                        }}
                        size="sm"
                        variant="outline"
                        data-testid="button-clear-custom-fps"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
