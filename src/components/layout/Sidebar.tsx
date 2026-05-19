import React from "react";
import { motion } from "framer-motion";
import { Copy, History, Settings, Smartphone, Monitor, Globe, HardDrive } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", icon: Globe, label: "Network" },
  { id: "history", icon: History, label: "Transfers" },
  { id: "files", icon: HardDrive, label: "My Files" },
  { id: "settings", icon: Settings, label: "Settings" }
];

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) {
  return (
    <div className="w-64 h-full flex flex-col p-4 border-r border-white/10 bg-black/40 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}>
            <Globe className="w-5 h-5 text-white" strokeWidth={1.5} />
          </motion.div>
        </div>
        <span className="text-lg font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          NexusDrop
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group",
                isActive ? "text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-4 h-4 z-10" />
              <span className="z-10">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="px-3 py-3 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-white/70" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-white/90">My MacBook Pro</span>
            <span className="text-[10px] text-white/40 font-mono tracking-wider">ONLINE CH-1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
