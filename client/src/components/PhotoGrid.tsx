import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Images, CheckSquare, Square, ImageOff } from 'lucide-react';
import { useImmich } from '@/lib/immich-context';
import type { ImmichAsset } from '@/lib/types';

interface PhotoGridProps {
  isLoading?: boolean;
  onGenerateTimelapse?: () => void;
}

export default function PhotoGrid({ isLoading = false, onGenerateTimelapse }: PhotoGridProps) {
  const { 
    assets, 
    selectedAssets, 
    toggleAssetSelection, 
    selectAllAssets, 
    deselectAllAssets,
    connection 
  } = useImmich();

  const selectedCount = selectedAssets.size;
  const totalCount = assets.length;

  if (!connection.isConnected) {
    return (
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <ImageOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No connection</p>
            <p className="text-sm">Connect to your Immich server to browse photos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="flex-1 flex flex-col">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No photos found</p>
            <p className="text-sm">Adjust your filters to find photos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader className="p-4 border-b shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Images className="h-4 w-4" />
            Photos
            <Badge variant="secondary" className="ml-1">
              {selectedCount}/{totalCount}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllAssets}
              data-testid="button-select-all"
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAllAssets}
              data-testid="button-deselect-all"
            >
              <Square className="h-4 w-4 mr-1" />
              None
            </Button>
            <Button
              onClick={onGenerateTimelapse}
              disabled={selectedCount === 0}
              data-testid="button-generate-timelapse"
            >
              Create Timelapse
            </Button>
          </div>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {assets.map((asset) => (
              <PhotoThumbnail
                key={asset.id}
                asset={asset}
                isSelected={selectedAssets.has(asset.id)}
                onToggle={() => toggleAssetSelection(asset.id)}
              />
            ))}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

interface PhotoThumbnailProps {
  asset: ImmichAsset;
  isSelected: boolean;
  onToggle: () => void;
}

function PhotoThumbnail({ asset, isSelected, onToggle }: PhotoThumbnailProps) {
  // todo: remove mock functionality - this should use actual Immich thumbnail URL
  const thumbnailUrl = `https://picsum.photos/seed/${asset.id}/300/300`;

  return (
    <div
      className={`
        relative aspect-square rounded-md overflow-hidden cursor-pointer 
        group transition-transform duration-200 hover:scale-105
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      onClick={onToggle}
      data-testid={`photo-thumbnail-${asset.id}`}
    >
      <img
        src={thumbnailUrl}
        alt={asset.originalFileName}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div 
        className={`
          absolute inset-0 bg-black/40 transition-opacity
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
      />
      <div
        className={`
          absolute top-2 right-2 transition-opacity
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
        style={{ visibility: 'visible' }}
      >
        <Checkbox
          checked={isSelected}
          className="h-5 w-5 bg-background/80 backdrop-blur-sm"
          data-testid={`checkbox-photo-${asset.id}`}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white truncate">{asset.originalFileName}</p>
      </div>
    </div>
  );
}
