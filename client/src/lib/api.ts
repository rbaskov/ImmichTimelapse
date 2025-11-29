import type { ImmichAlbum, ImmichAsset, TimelapseSettings, TimelapseJob } from './types';

const API_BASE = '/api';

let sessionId: string | null = null;

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getSessionId(): Promise<string> {
  if (sessionId) return sessionId;
  
  const stored = localStorage.getItem('immich_session_id');
  if (stored) {
    sessionId = stored;
    return sessionId;
  }

  const result = await request<{ sessionId: string }>('/session', { method: 'POST' });
  sessionId = result.sessionId;
  localStorage.setItem('immich_session_id', sessionId);
  return sessionId;
}

export async function connectToImmich(
  serverUrl: string,
  apiKey: string
): Promise<{ success: boolean; serverVersion?: string }> {
  const sid = await getSessionId();
  return request('/immich/connect', {
    method: 'POST',
    body: JSON.stringify({ sessionId: sid, serverUrl, apiKey }),
  });
}

export async function disconnectFromImmich(): Promise<void> {
  const sid = await getSessionId();
  await request('/immich/disconnect', {
    method: 'POST',
    body: JSON.stringify({ sessionId: sid }),
  });
}

export async function getAlbums(): Promise<ImmichAlbum[]> {
  const sid = await getSessionId();
  return request(`/immich/albums?sessionId=${sid}`);
}

export async function getAssets(params: {
  albumId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<ImmichAsset[]> {
  const sid = await getSessionId();
  const queryParams = new URLSearchParams({ sessionId: sid });
  
  if (params.albumId) queryParams.append('albumId', params.albumId);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params.limit) queryParams.append('limit', String(params.limit));

  return request(`/immich/assets?${queryParams}`);
}

export function getThumbnailUrl(assetId: string): string {
  const sid = sessionId || localStorage.getItem('immich_session_id') || '';
  return `${API_BASE}/immich/thumbnail/${assetId}?sessionId=${sid}`;
}

export async function createTimelapse(
  assetIds: string[],
  options: TimelapseSettings
): Promise<void> {
  const sid = await getSessionId();
  await request('/timelapse/create', {
    method: 'POST',
    body: JSON.stringify({ sessionId: sid, assetIds, options }),
  });
}

export async function getTimelapseJob(jobId: string): Promise<TimelapseJob> {
  const sid = await getSessionId();
  return request(`/timelapse/${jobId}?sessionId=${sid}`);
}

export function getTimelapseDownloadUrl(jobId: string): string {
  const sid = sessionId || localStorage.getItem('immich_session_id') || '';
  return `${API_BASE}/timelapse/${jobId}/download?sessionId=${sid}`;
}

export function getTimelapsePreviewUrl(jobId: string): string {
  const sid = sessionId || localStorage.getItem('immich_session_id') || '';
  return `${API_BASE}/timelapse/${jobId}/preview?sessionId=${sid}`;
}

export async function deleteTimelapse(jobId: string): Promise<void> {
  const sid = await getSessionId();
  await request(`/timelapse/${jobId}?sessionId=${sid}`, { method: 'DELETE' });
}

export function createWebSocketConnection(
  onMessage: (data: any) => void,
  onError?: (error: Event) => void
): WebSocket | null {
  const sid = sessionId || localStorage.getItem('immich_session_id');
  if (!sid) return null;

  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || `${window.location.hostname}:${window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}`;
    const wsUrl = `${protocol}//${host}/ws?sessionId=${sid}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    return ws;
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    return null;
  }
}
