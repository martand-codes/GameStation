import React from 'react';
import { Terminal } from 'lucide-react';

export default function TelemetryReviews() {
  return (
    <section className="bg-[#0D1117] border border-[#30363D] p-6 rounded-md">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-2 mb-4">
        <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2 uppercase tracking-widest">
          <Terminal className="h-4 w-4" /> User_Telemetry (Reviews)
        </h2>
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">OVERALL: HIGHLY POSITIVE</span>
      </div>
      
      <div className="space-y-4">
        {/* Dummy Review 1 */}
        <div className="bg-[#050505] border border-[#30363D] p-4 rounded-sm border-l-2 border-l-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-white font-bold text-sm">@cyber_ninja99</span>
              <span className="text-[10px] text-[#8B949E] ml-2">Logged: 2 days ago</span>
            </div>
            <span className="text-emerald-500 text-xs font-bold">[RECOMMENDED]</span>
          </div>
          <p className="text-sm text-[#C9D1D9] mb-3">Absolute masterpiece. The matrix optimization is incredible. Barely any frame drops.</p>
          <div className="flex flex-wrap gap-2 text-[10px] text-[#8B949E] bg-[#0D1117] p-2 border border-[#30363D] rounded-sm">
            <span><span className="text-blue-400">GPU:</span> RTX 4080</span>
            <span><span className="text-blue-400">CPU:</span> Ryzen 9 7900X</span>
            <span><span className="text-blue-400">RAM:</span> 64GB</span>
          </div>
        </div>

        {/* Dummy Review 2 */}
        <div className="bg-[#050505] border border-[#30363D] p-4 rounded-sm border-l-2 border-l-red-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-white font-bold text-sm">@glitch_hunter</span>
              <span className="text-[10px] text-[#8B949E] ml-2">Logged: 5 days ago</span>
            </div>
            <span className="text-red-500 text-xs font-bold">[CRITICAL_ERRORS]</span>
          </div>
          <p className="text-sm text-[#C9D1D9] mb-3">Good concept, but the netcode needs serious debugging. Experiencing packet loss in sector 4.</p>
          <div className="flex flex-wrap gap-2 text-[10px] text-[#8B949E] bg-[#0D1117] p-2 border border-[#30363D] rounded-sm">
            <span><span className="text-blue-400">GPU:</span> GTX 1660 Ti</span>
            <span><span className="text-blue-400">CPU:</span> i5-10400F</span>
            <span><span className="text-blue-400">RAM:</span> 16GB</span>
          </div>
        </div>
      </div>
      
      <button className="w-full mt-4 bg-transparent border border-[#30363D] text-[#8B949E] hover:text-white hover:border-[#8B949E] py-2 text-xs font-bold uppercase tracking-widest transition-colors">
        Submit Telemetry Report
      </button>
    </section>
  );
}
