import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNexus, Device } from "../hooks/useNexus";
import { Monitor, Smartphone, Tablet, UploadCloud, X, File, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

const ICONS = {
  desktop: Monitor,
  laptop: Monitor,
  mobile: Smartphone,
  tablet: Tablet
};

export function Dashboard() {
  const { devices, sendFile } = useNexus();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && selectedDevice) {
      sendFile(selectedDevice, e.target.files[0]);
      setSelectedDevice(null); // Close modal
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center min-h-screen p-8">
      {/* Background Radar Animation */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border border-white/5 absolute" />
        <div className="w-[600px] h-[600px] rounded-full border border-white/[0.08] absolute" />
        <div className="w-[400px] h-[400px] rounded-full border border-white/[0.12] absolute" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity }}
          className="w-[800px] h-[800px] rounded-full absolute"
          style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 122, 255, 0.15) 100%)' }}
        />
      </div>

      <div className="z-10 text-center mb-16">
        <h1 className="text-4xl font-light tracking-tight mb-2">Nearby Devices</h1>
        <p className="text-white/40 text-sm">Select a device to share files securely</p>
      </div>

      {devices.length === 0 ? (
        <div className="z-10 flex flex-col items-center justify-center h-64">
           <motion.div
             initial={{ opacity: 0.5, scale: 0.8 }}
             animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1, 0.8] }}
             transition={{ duration: 3, repeat: Infinity }}
             className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6"
           >
             <Monitor className="text-white/20 w-8 h-8" />
           </motion.div>
           <p className="text-white/30 text-sm font-mono tracking-widest uppercase">Scanning LAN...</p>
        </div>
      ) : (
        <div className="z-10 flex flex-wrap max-w-4xl justify-center gap-8">
          {devices.map((device, i) => {
            const Icon = ICONS[device.type as keyof typeof ICONS] || Monitor;
            return (
              <motion.button
                key={device.socketId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedDevice(device)}
                className="group relative flex flex-col items-center gap-4 p-6 rounded-3xl transition-all duration-500 hover:bg-white/5 w-40"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
                    <Icon className="w-8 h-8 text-white/80 group-hover:text-blue-400 transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-sm text-white/90 group-hover:text-white transition-colors">{device.name}</h3>
                  <p className="text-xs text-white/40 mt-1">{device.os}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#151619] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedDevice(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                  <Monitor className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium">Share to {selectedDevice.name}</h3>
                <p className="text-white/40 text-sm mt-1 mb-8">End-to-end encrypted direct LAN transfer</p>

                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect}
                />
                
                <div 
                  className="w-full h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/[0.02] transition-colors flex flex-col items-center justify-center cursor-pointer cursor-copy group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-8 h-8 text-white/30 group-hover:text-white/60 mb-3 transition-colors" />
                  <p className="text-sm font-medium text-white/70">Click or drag file to share</p>
                  <p className="text-xs text-white/30 mt-1">Up to unlimited size via LAN</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
