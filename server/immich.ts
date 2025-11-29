import axios, { AxiosInstance } from 'axios';
import https from 'https';
import http from 'http';

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

export interface ImmichSearchParams {
  takenAfter?: string;
  takenBefore?: string;
  type?: 'IMAGE' | 'VIDEO';
  size?: number;
  page?: number;
  filename?: string;
}

export class ImmichClient {
  private client: AxiosInstance;
  private serverUrl: string;
  
  constructor(serverUrl: string, apiKey: string) {
    this.serverUrl = serverUrl.replace(/\/$/, '');
    this.client = axios.create({
      baseURL: this.serverUrl,
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
      timeout: 30000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      httpAgent: new http.Agent(),
    });
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/users/me');
      return !!response.data?.id;
    } catch (error) {
      console.error('Failed to validate Immich connection:', error);
      return false;
    }
  }

  async getServerInfo(): Promise<{ version: string } | null> {
    try {
      const response = await this.client.get('/api/server-info/version');
      return response.data;
    } catch (error) {
      console.error('Failed to get server info:', error);
      return null;
    }
  }

  async getAlbums(): Promise<ImmichAlbum[]> {
    const response = await this.client.get('/api/albums');
    return response.data.map((album: any) => ({
      id: album.id,
      albumName: album.albumName,
      assetCount: album.assetCount,
      albumThumbnailAssetId: album.albumThumbnailAssetId,
    }));
  }

  async getAlbumAssets(albumId: string): Promise<ImmichAsset[]> {
    const response = await this.client.get(`/api/albums/${albumId}`);
    return (response.data.assets || [])
      .filter((asset: any) => asset.type === 'IMAGE')
      .map(this.mapAsset);
  }

  async searchAssets(params: ImmichSearchParams): Promise<ImmichAsset[]> {
    const searchParams: any = {
      type: params.type || 'IMAGE',
      size: params.size || 1000,
      page: params.page || 1,
    };

    if (params.takenAfter) {
      searchParams.takenAfter = params.takenAfter;
    }
    if (params.takenBefore) {
      searchParams.takenBefore = params.takenBefore;
    }

    const response = await this.client.post('/api/search/metadata', searchParams);
    let assets = response.data.assets?.items || response.data.assets || [];
    
    // Filter by filename if provided (supports wildcards: prefix*, *suffix, *contains*)
    if (params.filename) {
      const pattern = params.filename.toLowerCase();
      assets = assets.filter((asset: any) => {
        const fileName = asset.originalFileName?.toLowerCase() || '';
        
        if (pattern.startsWith('*') && pattern.endsWith('*')) {
          // *contains* pattern
          return fileName.includes(pattern.slice(1, -1));
        } else if (pattern.startsWith('*')) {
          // *suffix pattern
          return fileName.endsWith(pattern.slice(1));
        } else if (pattern.endsWith('*')) {
          // prefix* pattern
          return fileName.startsWith(pattern.slice(0, -1));
        } else {
          // exact substring match
          return fileName.includes(pattern);
        }
      });
    }
    
    return assets.map(this.mapAsset);
  }

  async getAllAssets(limit: number = 500): Promise<ImmichAsset[]> {
    const response = await this.client.get('/api/assets', {
      params: { take: limit },
    });
    return response.data
      .filter((asset: any) => asset.type === 'IMAGE')
      .map(this.mapAsset);
  }

  async getAssetThumbnail(assetId: string): Promise<Buffer | null> {
    try {
      const response = await this.client.get(`/api/assets/${assetId}/thumbnail`, {
        responseType: 'arraybuffer',
        params: { size: 'preview' },
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Failed to get asset thumbnail:', error);
      return null;
    }
  }

  async getAssetOriginal(assetId: string): Promise<Buffer | null> {
    try {
      const response = await this.client.get(`/api/assets/${assetId}/original`, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Failed to get asset original:', error);
      return null;
    }
  }

  getThumbnailUrl(assetId: string): string {
    return `${this.serverUrl}/api/assets/${assetId}/thumbnail?size=preview`;
  }

  private mapAsset(asset: any): ImmichAsset {
    return {
      id: asset.id,
      deviceAssetId: asset.deviceAssetId,
      ownerId: asset.ownerId,
      deviceId: asset.deviceId,
      type: asset.type,
      originalPath: asset.originalPath,
      originalFileName: asset.originalFileName,
      fileCreatedAt: asset.fileCreatedAt,
      fileModifiedAt: asset.fileModifiedAt,
      isFavorite: asset.isFavorite,
      duration: asset.duration,
      exifInfo: asset.exifInfo,
    };
  }
}

// Session storage for client instances
const clientSessions = new Map<string, ImmichClient>();

export function createClient(sessionId: string, serverUrl: string, apiKey: string): ImmichClient {
  const client = new ImmichClient(serverUrl, apiKey);
  clientSessions.set(sessionId, client);
  return client;
}

export function getClient(sessionId: string): ImmichClient | undefined {
  return clientSessions.get(sessionId);
}

export function removeClient(sessionId: string): void {
  clientSessions.delete(sessionId);
}
