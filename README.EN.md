# Immich Timelapse Creator

A web application for creating timelapse videos from photos on your Immich server. Connect to your Immich server, filter photos, select the ones you need, and generate stunning timelapses with full parameter customization.

## 🌟 Core Features

### Immich Server Connection
- Secure connection to Immich server using API key
- Support for self-signed SSL certificates
- Server profile saving for quick access

### Photo Filtering
- **Date Range Filter**: Select photos from a specific date range (from - to)
- **Album Filter**: Load photos from specific albums
- **Filename Filter**: Wildcard support:
  - `prefix*` - photos starting with prefix
  - `*suffix` - photos ending with suffix
  - `*contains*` - photos containing text
- **Save Filters**: Save frequently used filter combinations and load them with one click

### Photo Selection
- Thumbnail preview of all found photos in a grid
- Select individual photos or all at once
- Display total count of selected photos

### Video Parameter Customization

#### Basic Parameters
- **FPS**: 10, 15, 24, 30, 60 frames per second
- **Resolution**: 720p, 1080p, 4K (automatically updates when aspect ratio changes)
- **Format**: MP4 (H.264) or WebM (VP9)

#### Advanced Parameters
- **Bitrate**: Low, Medium, High
- **Video Codec**: H.264, H.265, VP8, VP9
- **Aspect Ratio**: 16:9, 9:16, 4:3, 1:1
- **Interpolation**: None or Linear (for smooth motion)

#### Duration Calculator
- Enter desired video duration (in seconds)
- App automatically calculates required FPS
- Apply calculated value with one click
- "(custom)" indicator shows custom FPS is being used

### Timelapse Generation
- Asynchronous video processing
- Real-time progress via WebSocket:
  - Processing status
  - Progress percentage
  - Number of processed frames
  - Estimated time remaining
- Cancel processing at any time

### Preview and Download
- Built-in video player for preview
- Download finished video to computer
- Option to regenerate with different parameters

### Multilingual Interface
- **English** and **Russian** languages
- Language switching with flag buttons in header
- Language preference saved in browser

### Design
- Light and dark theme support
- Material Design + Linear aesthetic
- Responsive design (mobile and desktop)
- Intuitive interface with left sidebar

## 🛠 Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - fast build and dev server
- **Shadcn/UI** - Radix UI-based components
- **Tailwind CSS** - styling
- **Wouter** - routing
- **React Query** - data management
- **React Hook Form** - form handling
- **Framer Motion** - animations
- **Lucide React** - icons

### Backend
- **Node.js** + Express
- **TypeScript** for type safety
- **Drizzle ORM** - database management
- **SQLite** - server profile storage
- **WebSocket** - real-time progress updates
- **Fluent FFmpeg** - video processing
- **Axios** - HTTP client for Immich API

### Video Processing
- **FFmpeg** - timelapse generation
- Multiple codec and format support
- Asynchronous processing with progress tracking

## 📋 Requirements

- **Immich Server** (v1.90.0 or higher)
- **Immich API Key** (get from server settings)
- **FFmpeg** (installed on application server)
- **Node.js 18+** (to run)

## 🚀 Getting Started

### Local Development
```bash
npm install
npm run dev
```
App will be available at `http://localhost:5000`

### Production Build
```bash
npm run build
npm start
```

## 📱 Usage Guide

### Quick Start
1. Go to the main page
2. Enter your Immich server URL (e.g., `https://photos.example.com`)
3. Enter your Immich API key
4. Click "Connect"
5. Set filters for photo search
6. Click "Apply Filters" to load photos
7. Select needed photos
8. Configure video parameters
9. Click "Generate Timelapse"
10. Wait for completion and download video

### Tips
- Use **saved filters** for quick access to frequently used combinations
- **Duration Calculator** helps create videos of exact length
- Use **High bitrate** and **1080p resolution** for best quality
- Large photo collections may take time to process
- Supported wildcard patterns: `*`, `prefix*`, `*suffix`, `*contains*`

## 🎨 Interface Features

### Filter Panel (Left Sidebar)
- Server connection
- Date, album, and filename filter setup
- Filter preset saving and loading
- Video parameter settings and duration calculator

### Main Area
- Photo grid with selection capability
- Loading progress indicator
- Video player for preview
- Real-time timelapse processing status

## 🔐 Security

- API keys stored in client-side session
- Self-signed SSL certificate support
- No sensitive data sent to third parties
- WebSocket encryption for progress data

## 📚 Immich API Endpoints Used

- `GET /api/users/me` - connection verification
- `GET /api/albums` - fetch album list
- `GET /api/assets` - fetch photo list
- `POST /api/search/metadata` - search photos by date and other filters
- `GET /api/assets/{id}/thumbnail` - download thumbnails
- `GET /api/assets/{id}/original` - download original files

## 🐛 Known Limitations

- Maximum 1000 photos per timelapse
- Maximum 250 results per search page
- Only photos (IMAGE) supported, videos (VIDEO) excluded
- Requires stable internet connection
- 4K resolution processing may take significant time

## 📝 License

MIT

## 🤝 Support

If you encounter issues:
1. Check that Immich server is accessible and running
2. Verify API key is correct
3. Try refreshing the page
4. Check browser console for errors

## 🔄 Version

**v1.0.0** - First stable release with full feature set
