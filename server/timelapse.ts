import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImmichClient } from './immich';

export interface TimelapseOptions {
  fps: number;
  resolution: '720p' | '1080p' | '4K';
  format: 'mp4' | 'webm';
}

export interface TimelapseJob {
  id: string;
  sessionId: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'error';
  progress: number;
  totalFrames: number;
  processedFrames: number;
  estimatedTimeRemaining?: number;
  outputPath?: string;
  error?: string;
}

const resolutionMap = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4K': { width: 3840, height: 2160 },
};

const jobs = new Map<string, TimelapseJob>();
const OUTPUT_DIR = '/tmp/timelapses';
const FRAMES_DIR = '/tmp/timelapse-frames';

async function ensureDirectories(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(FRAMES_DIR, { recursive: true });
}

export async function createTimelapse(
  client: ImmichClient,
  assetIds: string[],
  options: TimelapseOptions,
  sessionId: string,
  onProgress?: (job: TimelapseJob) => void
): Promise<TimelapseJob> {
  await ensureDirectories();

  const jobId = uuidv4();
  const job: TimelapseJob = {
    id: jobId,
    sessionId,
    status: 'pending',
    progress: 0,
    totalFrames: assetIds.length,
    processedFrames: 0,
  };

  jobs.set(jobId, job);
  onProgress?.(job);

  const jobFramesDir = path.join(FRAMES_DIR, jobId);
  await fs.mkdir(jobFramesDir, { recursive: true });

  try {
    job.status = 'downloading';
    onProgress?.(job);

    const startTime = Date.now();
    
    for (let i = 0; i < assetIds.length; i++) {
      const assetId = assetIds[i];
      try {
        const imageBuffer = await client.getAssetOriginal(assetId);
        if (imageBuffer) {
          const frameNumber = String(i + 1).padStart(6, '0');
          const framePath = path.join(jobFramesDir, `frame_${frameNumber}.jpg`);
          await fs.writeFile(framePath, imageBuffer);
        }
      } catch (err) {
        console.error(`Failed to download asset ${assetId}:`, err);
      }

      job.processedFrames = i + 1;
      job.progress = ((i + 1) / assetIds.length) * 50;
      
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = (elapsed / (i + 1)) * (assetIds.length - i - 1);
      job.estimatedTimeRemaining = Math.round(remaining);
      
      onProgress?.(job);
    }

    job.status = 'processing';
    job.progress = 50;
    onProgress?.(job);

    const { width, height } = resolutionMap[options.resolution];
    const ext = options.format;
    const outputFilename = `timelapse_${jobId}.${ext}`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    await new Promise<void>((resolve, reject) => {
      const inputPattern = path.join(jobFramesDir, 'frame_%06d.jpg');
      
      let command = ffmpeg()
        .input(inputPattern)
        .inputFPS(options.fps)
        .videoFilters([
          `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
          `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`
        ])
        .outputFPS(options.fps);

      if (options.format === 'mp4') {
        command = command
          .videoCodec('libx264')
          .outputOptions([
            '-pix_fmt yuv420p',
            '-preset fast',
            '-crf 23',
            '-movflags +faststart'
          ]);
      } else {
        command = command
          .videoCodec('libvpx-vp9')
          .outputOptions([
            '-pix_fmt yuv420p',
            '-crf 30',
            '-b:v 0'
          ]);
      }

      command
        .on('start', (cmd) => {
          console.log('FFmpeg started:', cmd);
        })
        .on('progress', (progress) => {
          const ffmpegProgress = progress.percent || 0;
          job.progress = 50 + (ffmpegProgress / 2);
          onProgress?.(job);
        })
        .on('end', () => {
          console.log('FFmpeg finished');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .save(outputPath);
    });

    await fs.rm(jobFramesDir, { recursive: true, force: true });

    job.status = 'completed';
    job.progress = 100;
    job.outputPath = outputPath;
    job.processedFrames = assetIds.length;
    jobs.set(jobId, job);
    onProgress?.(job);

    return job;
  } catch (error: any) {
    job.status = 'error';
    job.error = error.message || 'Unknown error occurred';
    jobs.set(jobId, job);
    onProgress?.(job);

    try {
      await fs.rm(jobFramesDir, { recursive: true, force: true });
    } catch {}

    return job;
  }
}

export function getJob(jobId: string, sessionId?: string): TimelapseJob | undefined {
  const job = jobs.get(jobId);
  if (job && sessionId && job.sessionId !== sessionId) {
    return undefined;
  }
  return job;
}

export function getJobsBySession(sessionId: string): TimelapseJob[] {
  return Array.from(jobs.values()).filter(job => job.sessionId === sessionId);
}

export async function deleteJob(jobId: string, sessionId?: string): Promise<boolean> {
  const job = jobs.get(jobId);
  if (!job) return false;
  if (sessionId && job.sessionId !== sessionId) return false;
  
  if (job.outputPath) {
    try {
      await fs.unlink(job.outputPath);
    } catch {}
  }
  jobs.delete(jobId);
  return true;
}

export async function cleanupOldJobs(maxAgeHours: number = 24): Promise<void> {
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;

  try {
    const files = await fs.readdir(OUTPUT_DIR);
    for (const file of files) {
      const filePath = path.join(OUTPUT_DIR, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old timelapse: ${file}`);
      }
    }
  } catch (error) {
    console.error('Failed to cleanup old jobs:', error);
  }
}
