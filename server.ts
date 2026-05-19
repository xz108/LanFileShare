import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  // Real-time server for LAN Device Discovery and Signaling
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // allow all in dev
      methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e8 // 100 MB for chunked websocket uploads if needed, though HTTP is better for large files
  });

  // Track connected devices
  // In a real LAN, devices broadcast. Here, our WS Server acts as the Hub.
  const connectedDevices = new Map();

  io.on("connection", (socket) => {
    console.log(`Device connected: ${socket.id}`);
    
    socket.on("register_device", (deviceInfo) => {
      // deviceInfo: { name, type, os, id }
      connectedDevices.set(socket.id, {
        ...deviceInfo,
        socketId: socket.id,
        online: true,
        lastSeen: Date.now()
      });
      
      // Broadcast to everyone else
      socket.broadcast.emit("device_joined", connectedDevices.get(socket.id));
      
      // Send the state of the world to this joining device
      socket.emit("all_devices", Array.from(connectedDevices.values()));
    });

    // Signaling for WebRTC or direct peer chunks
    socket.on("signal", (data) => {
      // data: { to: targetSocketId, from: senderSocketId, signal: sdpOrIce }
      io.to(data.to).emit("signal", {
        from: socket.id,
        signal: data.signal
      });
    });

    // Simple Server-Relayed Transfer (Fallback for LAN WebRTC)
    socket.on("transfer_request", (data) => {
      // data: { to, fileMeta: { name, size, type, chunks } }
      const device = connectedDevices.get(socket.id);
      io.to(data.to).emit("incoming_transfer", {
        from: device,
        fileMeta: data.fileMeta
      });
    });
    
    socket.on("transfer_response", (data) => {
      // data: { to, accept: boolean }
      io.to(data.to).emit("transfer_response", {
        from: socket.id,
        accept: data.accept
      });
    });

    socket.on("file_chunk", (data) => {
      // data: { to, chunkId, chunkData }
      io.to(data.to).emit("file_chunk", {
        from: socket.id,
        chunkId: data.chunkId,
        chunkData: data.chunkData,
        progress: data.progress
      });
    });

    socket.on("disconnect", () => {
      console.log(`Device disconnected: ${socket.id}`);
      connectedDevices.delete(socket.id);
      io.emit("device_left", socket.id);
    });
  });

  // Express API limits for large file transfers (if not using websockets)
  app.use(express.json({ limit: "500mb" }));
  app.use(express.urlencoded({ extended: true, limit: "500mb" }));

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Drop server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
