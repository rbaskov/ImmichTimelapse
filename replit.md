# Immich Timelapse Creator

## Overview
A web application that connects to Immich photo servers via API and creates timelapse videos from selected photos. Users can filter photos by date, album, and tags, customize video parameters (FPS, resolution, format), preview results, and download the final video.

## Recent Changes
- 2024-11-29: Initial implementation with full Immich API integration and FFmpeg video generation

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **UI Framework**: Shadcn/UI + Tailwind CSS
- **Video Processing**: FFmpeg via fluent-ffmpeg
- **Real-time Updates**: WebSocket for progress tracking

## Project Architecture

### Frontend (`client/src/`)
- `App.tsx` - Main router setup with ImmichProvider context
- `pages/home.tsx` - Main application page with all components
- `lib/api.ts` - API client for backend communication
- `lib/immich-context.tsx` - Global state management for Immich connection, assets, and job state
- `lib/types.ts` - TypeScript interfaces for Immich data structures
- `components/` - UI components:
  - `ConnectionPanel.tsx` - Server URL and API key input
  - `FilterPanel.tsx` - Date range, album, and tag filters
  - `TimelapseSettings.tsx` - FPS, resolution, format controls
  - `PhotoGrid.tsx` - Photo thumbnails with selection
  - `ProcessingProgress.tsx` - Real-time progress display
  - `VideoPreview.tsx` - Video player with download option
  - `Header.tsx` - App header with theme toggle

### Backend (`server/`)
- `routes.ts` - API endpoints and WebSocket handling
- `immich.ts` - Immich API client wrapper
- `timelapse.ts` - FFmpeg-based video generation

## API Endpoints

### Session Management
- `POST /api/session` - Create new session

### Immich Integration
- `POST /api/immich/connect` - Connect to Immich server
- `POST /api/immich/disconnect` - Disconnect from server
- `GET /api/immich/albums` - Get available albums
- `GET /api/immich/assets` - Get photos with optional filters
- `GET /api/immich/thumbnail/:assetId` - Proxy for photo thumbnails

### Timelapse Generation
- `POST /api/timelapse/create` - Start timelapse creation (async)
- `GET /api/timelapse/:jobId` - Get job status
- `GET /api/timelapse/:jobId/preview` - Stream video for preview
- `GET /api/timelapse/:jobId/download` - Download completed video
- `DELETE /api/timelapse/:jobId` - Delete job and file

### WebSocket
- `ws://host/ws?sessionId=xxx` - Real-time progress updates

## User Workflow
1. Enter Immich server URL and API key
2. Browse/filter photos from library
3. Select photos for timelapse
4. Configure FPS, resolution, format
5. Generate timelapse (real-time progress via WebSocket)
6. Preview and download result

## Environment Variables
No environment variables required. Immich credentials are entered by user and stored in session.

## Development
```bash
npm run dev  # Starts both frontend and backend
```

## Timelapse Settings
- **FPS**: 10, 15, 24, 30, 60
- **Resolution**: 720p, 1080p, 4K
- **Format**: MP4 (H.264), WebM (VP9)
