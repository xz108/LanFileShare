import React from "react";
import { motion } from "framer-motion";
import { useNexus, Transfer } from "../hooks/useNexus";
import { File, ArrowDownToLine, ArrowUpToLine, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export function Transfers() {
  const { transfers, acceptTransfer, rejectTransfer } = useNexus();

  const getStatusIcon = (status: Transfer['status']) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed': 
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'transferring': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending': return <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse m-1" />;
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 overflow-y-auto p-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-light tracking-tight mb-8">Recent Transfers</h2>

        {transfers.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <p className="text-white/40">No recent transfers.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {transfers.map((t) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    t.direction === "incoming" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {t.direction === "incoming" ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpToLine className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-white/90 truncate max-w-[200px] sm:max-w-xs">{t.fileMeta.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40">{t.direction === 'incoming' ? 'From' : 'To'} {t.device.name}</span>
                      <span className="text-white/20 text-xs">•</span>
                      <span className="font-mono text-xs text-white/40">{formatSize(t.fileMeta.size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {t.status === "transferring" && (
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${t.progress}%` }}
                          layout
                        />
                      </div>
                      <span className="font-mono text-xs text-blue-400 w-10">{Math.round(t.progress)}%</span>
                    </div>
                  )}

                  {t.status === "pending" && t.direction === "incoming" && (
                    <div className="flex gap-2">
                      <button onClick={() => acceptTransfer(t.id)} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors">Accept</button>
                      <button onClick={() => rejectTransfer(t.id)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs font-medium hover:bg-white/20 transition-colors">Decline</button>
                    </div>
                  )}

                  <div className="flex items-center justify-end w-8">
                    {getStatusIcon(t.status)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
