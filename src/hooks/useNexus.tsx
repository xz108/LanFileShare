import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export type Device = {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "laptop" | "tablet";
  os: string;
  socketId: string;
  online: boolean;
  lastSeen: number;
};

export type TransferStatus = "pending" | "transferring" | "completed" | "failed" | "rejected";

export type Transfer = {
  id: string;
  direction: "incoming" | "outgoing";
  device: Device;
  fileMeta: {
    name: string;
    size: number;
    type: string;
    chunks: number;
  };
  progress: number;
  speed: number; // bytes per second
  status: TransferStatus;
};

interface NexusContextType {
  devices: Device[];
  transfers: Transfer[];
  myDevice: Partial<Device>;
  socket: Socket | null;
  sendFile: (device: Device, file: File) => void;
  acceptTransfer: (transferId: string) => void;
  rejectTransfer: (transferId: string) => void;
}

const NexusContext = createContext<NexusContextType | null>(null);

const CHUNK_SIZE = 1024 * 256; // 256KB chunks

export function NexusProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const incomingChunksRef = useRef<Map<string, ArrayBuffer[]>>(new Map());
  

  const myDevice = useRef<Partial<Device>>({
    id: "device-" + Math.random().toString(36).substr(2, 9),
    name: "My Arc Mac", // fake name
    type: "laptop",
    os: "macOS"
  });

  useEffect(() => {
    // Only connect when running in browser
    if (typeof window === "undefined") return;

    // We connect to the same origin (Express handles WS and HTTP on 3000)
    const newSocket = io();

    newSocket.on("connect", () => {
      console.log("Connected to Nexus Drop Hub");
      newSocket.emit("register_device", myDevice.current);
    });

    newSocket.on("all_devices", (allDevices: Device[]) => {
      setDevices(allDevices.filter(d => d.socketId !== newSocket.id));
    });

    newSocket.on("device_joined", (device: Device) => {
      setDevices(prev => {
        if (prev.find(d => d.socketId === device.socketId)) return prev;
        return [...prev, device];
      });
    });

    newSocket.on("device_left", (socketId: string) => {
      setDevices(prev => prev.filter(d => d.socketId !== socketId));
    });

    newSocket.on("incoming_transfer", (data: { from: Device, fileMeta: any }) => {
      const newTransfer: Transfer = {
        id: data.fileMeta.id,
        direction: "incoming",
        device: data.from,
        fileMeta: data.fileMeta,
        progress: 0,
        speed: 0,
        status: "pending"
      };
      setTransfers(prev => [newTransfer, ...prev]);
    });

    newSocket.on("file_chunk", (data: { from: string, chunkId: number, chunkData: ArrayBuffer, progress: number, fileId: string }) => {
      setTransfers(prev => prev.map(t => {
        if (t.id === data.fileId) {
          return { ...t, progress: data.progress, status: "transferring" };
        }
        return t;
      }));

      // Store chunk
      if (!incomingChunksRef.current.has(data.fileId)) {
        incomingChunksRef.current.set(data.fileId, []);
      }
      const chunks = incomingChunksRef.current.get(data.fileId)!;
      chunks[data.chunkId] = data.chunkData;
      
      const transfer = transfers.find(t => t.id === data.fileId);
      // Let's defer blob saving until completed logic
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendFile = (targetDevice: Device, file: File) => {
    if (!socket) return;

    const fileId = "file-" + Math.random().toString(36).substr(2, 9);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    const newTransfer: Transfer = {
      id: fileId,
      direction: "outgoing",
      device: targetDevice,
      fileMeta: {
        name: file.name,
        size: file.size,
        type: file.type,
        chunks: totalChunks
      },
      progress: 0,
      speed: 0,
      status: "pending"
    };

    setTransfers(prev => [newTransfer, ...prev]);

    socket.emit("transfer_request", {
      to: targetDevice.socketId,
      fileMeta: { ...newTransfer.fileMeta, id: fileId }
    });

    // We simulate instant accept for now to show the animation
    setTimeout(() => {
      startChunking(file, fileId, targetDevice.socketId, totalChunks);
    }, 1000);
  };

  const startChunking = (file: File, fileId: string, toSocketId: string, totalChunks: number) => {
    if (!socket) return;
    
    setTransfers(prev => prev.map(t => t.id === fileId ? { ...t, status: "transferring" } : t));

    let currentChunk = 0;
    const reader = new FileReader();

    const readNext = () => {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const slice = file.slice(start, end);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = (e) => {
      if (!e.target?.result) return;
      
      const chunkData = e.target.result;
      const progress = ((currentChunk + 1) / totalChunks) * 100;
      
      socket.emit("file_chunk", {
        to: toSocketId,
        fileId,
        chunkId: currentChunk,
        chunkData,
        progress
      });

      setTransfers(prev => prev.map(t => t.id === fileId ? { ...t, progress } : t));

      currentChunk++;
      if (currentChunk < totalChunks) {
        setTimeout(readNext, 50); // Artificial delay to simulate network & allow animation
      } else {
        setTransfers(prev => prev.map(t => t.id === fileId ? { ...t, status: "completed", progress: 100 } : t));
      }
    };

    readNext();
  };

  const acceptTransfer = (transferId: string) => {
    setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: "transferring" } : t));
    // Implementation for real accept emit...
  };

  const rejectTransfer = (transferId: string) => {
    setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: "rejected" } : t));
  };

  return (
    <NexusContext.Provider value={{ devices, transfers, myDevice: myDevice.current, socket, sendFile, acceptTransfer, rejectTransfer }}>
      {children}
    </NexusContext.Provider>
  );
}

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (!context) throw new Error("useNexus must be used within NexusProvider");
  return context;
};
