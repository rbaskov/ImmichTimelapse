export interface ImmichConnection {
  serverUrl: string;
  apiKey: string;
  isConnected: boolean;
}

export interface ImmichAlbum {
  id: string;
  albumName: string;
  assetCount: number;
  albumThumbnailAssetId?: string;
}

export interface ImmichAsset {
  id: string;
  deviceAssetId: string;
  ownerId: string;
  deviceId: string;
  type: 'IMAGE' | 'VIDEO';
  originalPath: string;
  originalFileName: string;
  fileCreatedAt: string;
  fileModifiedAt: string;
  isFavorite: boolean;
  duration: string | null;
  exifInfo?: {
    make?: string;
    model?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  tags?: string[];
}

export interface PhotoFilter {
  dateFrom?: string;
  dateTo?: string;
  albumId?: string;
  tags?: string[];
  filename?: string;
}

export interface TimelapseSettings {
  fps: 10 | 15 | 24 | 30 | 60;
  resolution: '720p' | '1080p' | '4K';
  format: 'mp4' | 'webm';
}

export interface TimelapseJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  totalFrames: number;
  processedFrames: number;
  estimatedTimeRemaining?: number;
  outputUrl?: string;
  error?: string;
}

export interface ServerProfile {
  id: string;
  name: string;
  serverUrl: string;
  apiKey: string;
  createdAt: string;
}
