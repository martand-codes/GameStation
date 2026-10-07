import React, { useState } from 'react';
import { Cpu, Terminal, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AiSystemCheck() {
  const [cpu, setCpu] = useState('');
  const [gpu, setGpu] = useState('');
  const [ram, setRam] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | 'OPTIMAL' | 'ACCEPTABLE' | 'FAIL'>(null);

  const handleScan = () => {
    if (!cpu || !gpu || !ram) return;
    
    setIsScanning(true);
    setScanResult(null);

    // Simulate AI thinking
    setTimeout(() => {
      // Mock logic: if everything is selected, just randomize or base it on strings
      // For now, let's just make a simple mock logic
      if (gpu.includes('4090') || gpu.includes('3080')) {
        setScanResult('OPTIMAL');
      } else if (gpu.includes('1660') || gpu.includes('3060')) {
        setScanResult('ACCEPTABLE');
      } else {
        setScanResult('FAIL');
      }
      setIsScanning(false);
    }, 1500);
  };

  return (
    <section className="bg-[#050505] border border-blue-500/30 p-6 rounded-md relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      <h2 className="text-lg font-bold text-blue-400 border-b border-blue-500/30 pb-2 mb-6 flex items-center gap-2 uppercase tracking-widest relative z-10">
        <Terminal className="h-4 w-4" /> AI_ENGINE_DIAGNOSTICS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        <div>
          <label className="block text-[#8B949E] text-xs font-bold mb-2 uppercase tracking-wider">Target CPU</label>
          <select 
            value={cpu}
            onChange={(e) => setCpu(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] text-[#C9D1D9] px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">-- SELECT CPU --</option>
            <option value="i9-13900K">Intel Core i9-13900K</option>
            <option value="i7-12700K">Intel Core i7-12700K</option>
            <option value="i5-8400">Intel Core i5-8400</option>
            <option value="Ryzen 9 7950X">AMD Ryzen 9 7950X</option>
            <option value="Ryzen 7 5800X3D">AMD Ryzen 7 5800X3D</option>
            <option value="Ryzen 5 2600">AMD Ryzen 5 2600</option>
          </select>
        </div>

        <div>
          <label className="block text-[#8B949E] text-xs font-bold mb-2 uppercase tracking-wider">Target GPU</label>
          <select 
            value={gpu}
            onChange={(e) => setGpu(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] text-[#C9D1D9] px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">-- SELECT GPU --</option>
            <option value="RTX 4090">NVIDIA RTX 4090</option>
            <option value="RTX 3080">NVIDIA RTX 3080</option>
            <option value="RTX 3060">NVIDIA RTX 3060</option>
            <option value="GTX 1660">NVIDIA GTX 1660</option>
            <option value="RX 7900 XTX">AMD RX 7900 XTX</option>
            <option value="RX 6700 XT">AMD RX 6700 XT</option>
            <option value="Intel Iris Xe">Intel Iris Xe (Integrated)</option>
          </select>
        </div>

        <div>
          <label className="block text-[#8B949E] text-xs font-bold mb-2 uppercase tracking-wider">Target RAM</label>
          <select 
            value={ram}
            onChange={(e) => setRam(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] text-[#C9D1D9] px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">-- SELECT MEMORY --</option>
            <option value="64GB">64GB DDR5</option>
            <option value="32GB">32GB DDR5</option>
            <option value="16GB">16GB DDR4/DDR5</option>
            <option value="8GB">8GB DDR4</option>
          </select>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <button 
          onClick={handleScan}
          disabled={!cpu || !gpu || !ram || isScanning}
          className="bg-blue-600/20 border border-blue-500 text-blue-400 px-8 py-3 rounded-md hover:bg-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-widest text-sm font-bold flex items-center gap-2"
        >
          {isScanning ? (
            <span className="animate-pulse">Scanning Telemetry...</span>
          ) : (
            <>
              <Cpu className="h-4 w-4" /> Initiate Diagnostics
            </>
          )}
        </button>
      </div>

      {/* Results Box */}
      {scanResult && !isScanning && (
        <div className={`mt-8 p-4 border rounded-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
          scanResult === 'OPTIMAL' ? 'bg-emerald-500/10 border-emerald-500/50' :
          scanResult === 'ACCEPTABLE' ? 'bg-yellow-500/10 border-yellow-500/50' :
          'bg-red-500/10 border-red-500/50'
        }`}>
          <div className="flex items-start gap-3">
            {scanResult === 'OPTIMAL' && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
            {scanResult === 'ACCEPTABLE' && <Zap className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />}
            {scanResult === 'FAIL' && <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
            
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-widest mb-1 ${
                scanResult === 'OPTIMAL' ? 'text-emerald-400' :
                scanResult === 'ACCEPTABLE' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                Diagnostic Result: {scanResult}
              </h4>
              <p className="text-[#8B949E] text-xs leading-relaxed">
                {scanResult === 'OPTIMAL' 
                  ? "Neural analysis confirms hardware significantly exceeds parameters. Expected execution: 60+ FPS at maximum fidelity." 
                  : scanResult === 'ACCEPTABLE' 
                  ? "Hardware falls within acceptable parameters. Expected execution: 30-60 FPS. Minor visual degradation required in complex sectors." 
                  : "CRITICAL WARNING: Target hardware falls below acceptable parameters. Severe execution latency imminent. Not recommended."}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
