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
}

export interface PhotoFilter {
  dateFrom?: string;
  dateTo?: string;
  albumId?: string;
  filename?: string;
}

export interface TimelapseSettings {
  fps: 10 | 15 | 24 | 30 | 60;
  resolution: '720p' | '1080p' | '4K';
  format: 'mp4' | 'webm';
  bitrate: 'low' | 'medium' | 'high';
  codec: 'h264' | 'h265' | 'vp8' | 'vp9';
  aspectRatio: '16:9' | '9:16' | '4:3' | '1:1';
  interpolation: 'none' | 'linear';
}

export interface TimelapseJob {
  id: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'error';
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
