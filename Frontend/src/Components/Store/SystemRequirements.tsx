import React, { useState } from 'react';
import { Cpu, Monitor, Zap, Server } from 'lucide-react';

const FPS_DATA = [
  { gpu: 'RTX 4090', fps: 144, type: 'Enthusiast' },
  { gpu: 'RTX 3080', fps: 95, type: 'High-End' },
  { gpu: 'RTX 3060', fps: 65, type: 'Mid-Range' },
  { gpu: 'GTX 1660', fps: 45, type: 'Budget' },
  { gpu: 'Intel Iris Xe', fps: 22, type: 'Integrated' },
];

export default function SystemRequirements() {
  const [selectedGpu, setSelectedGpu] = useState<string>('');
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  return (
    <div className="space-y-6">
      <section className="bg-[#0D1117] border border-[#30363D] p-6 rounded-md">
        <h2 className="text-lg font-bold text-red-400 border-b border-[#30363D] pb-2 mb-6 flex items-center gap-2 uppercase tracking-widest">
          <Server className="h-4 w-4" /> Hardware_Constraints
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bare Metal Minimum */}
          <div className="border-l-2 border-l-red-500 pl-4">
            <h3 className="text-red-500 text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <Zap className="h-3 w-3" /> BARE_METAL_MINIMUM
            </h3>
            <ul className="space-y-3 text-xs text-[#8B949E]">
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">OS_REQ</span>
                <span>NeuroOS / Win10</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">CPU</span>
                <span>i5-8400 / Ryzen 5 2600</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">GPU</span>
                <span>GTX 1660 / RX 580</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">MEM</span>
                <span>8GB DDR4</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">NETWORK</span>
                <span>5 MB/s</span>
              </li>
            </ul>
          </div>

          {/* Optimal Yield */}
          <div className="border-l-2 border-l-emerald-500 pl-4">
            <h3 className="text-emerald-500 text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <Monitor className="h-3 w-3" /> OPTIMAL_YIELD
            </h3>
            <ul className="space-y-3 text-xs text-[#8B949E]">
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">OS_REQ</span>
                <span>NeuroOS / Win11</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">CPU</span>
                <span>i7-12700K / Ryzen 7 5800X3D</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">GPU</span>
                <span>RTX 3070 / RX 6700 XT</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">MEM</span>
                <span>16GB DDR5</span>
              </li>
              <li className="flex justify-between items-center border-b border-[#30363D] border-dashed pb-1">
                <span className="text-blue-400">NETWORK</span>
                <span>25 MB/s</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Detailed Graph Toggle */}
        {!showDetailedAnalysis ? (
          <div className="mt-8 flex justify-center border-t border-[#30363D] pt-6">
            <button 
              onClick={() => setShowDetailedAnalysis(true)}
              className="bg-blue-600/20 border border-blue-500 text-blue-400 px-6 py-2 rounded-md hover:bg-blue-600/40 transition-colors uppercase tracking-widest text-xs font-bold"
            >
              See In Detail
            </button>
          </div>
        ) : (
          <div className="mt-8 border-t border-[#30363D] pt-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-xs text-[#8B949E]">Select your target GPU to visualize expected performance.</p>
              <select 
                value={selectedGpu}
                onChange={(e) => setSelectedGpu(e.target.value)}
                className="bg-[#0D1117] border border-[#30363D] text-[#C9D1D9] px-3 py-1.5 text-xs outline-none focus:border-blue-500"
              >
                <option value="">-- SELECT TARGET GPU --</option>
                {FPS_DATA.map(d => (
                  <option key={d.gpu} value={d.gpu}>{d.gpu} ({d.type})</option>
                ))}
              </select>
            </div>

            {selectedGpu && (
              <div className="space-y-4">
                {FPS_DATA.map(data => {
                  const isSelected = data.gpu === selectedGpu;
                  const barWidth = Math.min((data.fps / 160) * 100, 100); 
                  
                  // Determine color based on playability
                  let barColor = 'bg-[#30363D]'; 
                  let textColor = 'text-[#8B949E]';
                  if (isSelected) {
                    if (data.fps >= 60) { barColor = 'bg-emerald-500'; textColor = 'text-emerald-400'; }
                    else if (data.fps >= 30) { barColor = 'bg-yellow-500'; textColor = 'text-yellow-400'; }
                    else { barColor = 'bg-red-500'; textColor = 'text-red-400'; }
                  }

                  return (
                    <div key={data.gpu} className="flex items-center gap-4 group">
                      <div className={`w-28 text-right text-xs font-bold ${isSelected ? textColor : 'text-[#8B949E]'}`}>
                        {data.gpu}
                      </div>
                      <div className="flex-1 h-6 bg-[#0D1117] border border-[#30363D] relative overflow-hidden">
                        <div 
                          className={`h-full ${barColor} ${isSelected ? 'opacity-100' : 'opacity-30'} transition-all duration-1000 ease-out`}
                          style={{ width: `${barWidth}%` }}
                        >
                          {isSelected && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] mix-blend-overlay opacity-50" />}
                        </div>
                      </div>
                      <div className={`w-12 text-xs font-bold ${isSelected ? textColor : 'text-[#8B949E]'}`}>
                        {data.fps} FPS
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
