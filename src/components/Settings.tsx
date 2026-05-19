import React from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useNexus } from "../hooks/useNexus";

export function Settings() {
  const { myDevice } = useNexus();

  return (
    <div className="flex-1 overflow-y-auto p-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-light tracking-tight mb-8">Settings</h2>
        
        <div className="space-y-8">
          {/* Identity */}
          <section>
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Device Identity</h3>
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Monitor className="w-8 h-8 text-white/70" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-xs text-white/50 font-medium block mb-1">Device Name</label>
                    <input 
                      type="text" 
                      defaultValue={myDevice.name}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <p className="text-[11px] text-white/30 mt-1.5">This name will be visible to other devices on your local network.</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-medium block mb-1">Device Type</label>
                    <div className="flex gap-2">
                       {['desktop', 'laptop', 'mobile', 'tablet'].map(t => (
                         <button 
                          key={t}
                          className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${myDevice.type === t ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-transparent border-white/10 text-white/50 hover:bg-white/5'}`}
                         >
                           {t.charAt(0).toUpperCase() + t.slice(1)}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Security</h3>
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl divide-y divide-white/10">
              <div className="p-6 flex items-center justify-between">
                 <div>
                   <h4 className="font-medium text-white/90">Require PIN for transfers</h4>
                   <p className="text-xs text-white/40 mt-1">Other devices must enter a 4-digit PIN to send you files.</p>
                 </div>
                 <div className="w-12 h-6 bg-white/10 rounded-full border border-white/5 relative cursor-pointer">
                    <div className="w-5 h-5 bg-white/50 rounded-full absolute left-0.5 top-0.5" />
                 </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                 <div>
                   <h4 className="font-medium text-white/90">Auto-accept from trusted</h4>
                   <p className="text-xs text-white/40 mt-1">Automatically download files from previously approved devices.</p>
                 </div>
                 <div className="w-12 h-6 bg-blue-500 rounded-full border border-blue-500 relative cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                 </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
