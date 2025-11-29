import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { promises as fs } from "fs";
import { createClient, getClient, removeClient, type ImmichSearchParams } from "./immich";
import { createTimelapse, getJob, deleteJob, type TimelapseOptions, type TimelapseJob } from "./timelapse";

interface SessionData {
  serverUrl: string;
  apiKey: string;
  isConnected: boolean;
}

const sessions = new Map<string, SessionData>();
const wsClients = new Map<string, Set<WebSocket>>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const sessionId = url.searchParams.get("sessionId");
    
    if (!sessionId || !sessions.has(sessionId)) {
      ws.close(4001, "Invalid session");
      return;
    }

    if (!wsClients.has(sessionId)) {
      wsClients.set(sessionId, new Set());
    }
    wsClients.get(sessionId)?.add(ws);

    ws.on("close", () => {
      wsClients.get(sessionId)?.delete(ws);
    });
  });

  function broadcastToSession(sessionId: string, message: any) {
    const clients = wsClients.get(sessionId);
    if (clients) {
      const data = JSON.stringify(message);
      clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
    }
  }

  app.post("/api/session", (req: Request, res: Response) => {
    const sessionId = uuidv4();
    sessions.set(sessionId, { serverUrl: "", apiKey: "", isConnected: false });
    res.json({ sessionId });
  });

  app.post("/api/immich/connect", async (req: Request, res: Response) => {
    const { sessionId, serverUrl, apiKey } = req.body;

    if (!sessionId || !serverUrl || !apiKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const client = createClient(sessionId, serverUrl, apiKey);
      const isValid = await client.validateConnection();

      if (!isValid) {
        removeClient(sessionId);
        return res.status(401).json({ error: "Invalid connection or API key" });
      }

      const serverInfo = await client.getServerInfo();
      sessions.set(sessionId, { serverUrl, apiKey, isConnected: true });

      res.json({
        success: true,
        serverVersion: serverInfo?.version || "unknown",
      });
    } catch (error: any) {
      removeClient(sessionId);
      res.status(500).json({ error: error.message || "Connection failed" });
    }
  });

  app.post("/api/immich/disconnect", (req: Request, res: Response) => {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    removeClient(sessionId);
    sessions.delete(sessionId);

    res.json({ success: true });
  });

  app.get("/api/immich/albums", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const client = getClient(sessionId);
    if (!client) {
      return res.status(401).json({ error: "Not connected to Immich" });
    }

    try {
      const albums = await client.getAlbums();
      res.json(albums);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get albums" });
    }
  });

  app.get("/api/immich/assets", async (req: Request, res: Response) => {
    const { sessionId, albumId, dateFrom, dateTo, filename, limit } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const client = getClient(sessionId as string);
    if (!client) {
      return res.status(401).json({ error: "Not connected to Immich" });
    }

    try {
      let assets;
      
      if (albumId) {
        assets = await client.getAlbumAssets(albumId as string);
      } else if (dateFrom || dateTo) {
        const searchParams: ImmichSearchParams = {
          type: "IMAGE",
          size: Number(limit) || 500,
        };
        if (dateFrom) searchParams.takenAfter = dateFrom as string;
        if (dateTo) searchParams.takenBefore = dateTo as string;
        if (filename) searchParams.filename = filename as string;
        assets = await client.searchAssets(searchParams);
      } else {
        assets = await client.getAllAssets(Number(limit) || 500);
      }

      // Filter by filename if provided
      if (filename && !albumId) {
        const searchText = (filename as string).toLowerCase();
        assets = assets.filter(asset =>
          asset.originalFileName.toLowerCase().includes(searchText)
        );
      }

      assets.sort((a, b) => 
        new Date(a.fileCreatedAt).getTime() - new Date(b.fileCreatedAt).getTime()
      );

      res.json(assets);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get assets" });
    }
  });

  app.get("/api/immich/thumbnail/:assetId", async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const client = getClient(sessionId);
    if (!client) {
      return res.status(401).json({ error: "Not connected to Immich" });
    }

    try {
      const thumbnail = await client.getAssetThumbnail(assetId);
      if (!thumbnail) {
        return res.status(404).json({ error: "Thumbnail not found" });
      }

      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(thumbnail);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get thumbnail" });
    }
  });

  app.post("/api/timelapse/create", async (req: Request, res: Response) => {
    const { sessionId, assetIds, options } = req.body as {
      sessionId: string;
      assetIds: string[];
      options: TimelapseOptions;
    };

    if (!sessionId || !assetIds || !options) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (assetIds.length === 0) {
      return res.status(400).json({ error: "No assets selected" });
    }

    if (assetIds.length > 1000) {
      return res.status(400).json({ error: "Maximum 1000 photos allowed" });
    }

    const client = getClient(sessionId);
    if (!client) {
      return res.status(401).json({ error: "Not connected to Immich" });
    }

    res.json({ message: "Timelapse creation started" });

    createTimelapse(client, assetIds, options, sessionId, (job: TimelapseJob) => {
      broadcastToSession(sessionId, { type: "timelapse_progress", job });
    }).catch((error) => {
      console.error("Timelapse creation error:", error);
      broadcastToSession(sessionId, {
        type: "timelapse_progress",
        job: {
          id: "error",
          status: "error",
          progress: 0,
          totalFrames: assetIds.length,
          processedFrames: 0,
          error: error.message || "Unknown error",
        },
      });
    });
  });

  app.get("/api/timelapse/:jobId", (req: Request, res: Response) => {
    const { jobId } = req.params;
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const job = getJob(jobId, sessionId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  });

  app.get("/api/timelapse/:jobId/download", async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const job = getJob(jobId, sessionId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "completed" || !job.outputPath) {
      return res.status(400).json({ error: "Timelapse not ready for download" });
    }

    try {
      const stats = await fs.stat(job.outputPath);
      const ext = path.extname(job.outputPath).slice(1);
      const mimeType = ext === "webm" ? "video/webm" : "video/mp4";

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", stats.size);
      res.setHeader("Content-Disposition", `attachment; filename="timelapse.${ext}"`);

      const fileHandle = await fs.open(job.outputPath, "r");
      const stream = fileHandle.createReadStream();
      stream.pipe(res);
      stream.on("end", () => fileHandle.close());
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to download" });
    }
  });

  app.get("/api/timelapse/:jobId/preview", async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const job = getJob(jobId, sessionId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "completed" || !job.outputPath) {
      return res.status(400).json({ error: "Timelapse not ready" });
    }

    try {
      const stats = await fs.stat(job.outputPath);
      const ext = path.extname(job.outputPath).slice(1);
      const mimeType = ext === "webm" ? "video/webm" : "video/mp4";

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = end - start + 1;

        const fileHandle = await fs.open(job.outputPath, "r");
        const stream = fileHandle.createReadStream({ start, end });

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": mimeType,
        });

        stream.pipe(res);
        stream.on("end", () => fileHandle.close());
      } else {
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Length", stats.size);
        res.setHeader("Accept-Ranges", "bytes");

        const fileHandle = await fs.open(job.outputPath, "r");
        const stream = fileHandle.createReadStream();
        stream.pipe(res);
        stream.on("end", () => fileHandle.close());
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to stream preview" });
    }
  });

  app.delete("/api/timelapse/:jobId", async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    try {
      const deleted = await deleteJob(jobId, sessionId);
      if (!deleted) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete job" });
    }
  });

  return httpServer;
}
