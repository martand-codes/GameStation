import React, { useState } from 'react';
import { Cpu, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface Edition {
  editionName: string;
  price: number;
  features: string[];
}

export default function AiEditionRecommender({ editions, onAddToCart }: { editions: Edition[], onAddToCart?: (edition: Edition) => void }) {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<Edition | null>(null);

  const startAnalysis = () => {
    setStatus('analyzing');
    setLogs(['> Initiating neural telemetry uplink...']);
    
    setTimeout(() => {
      setLogs(prev => [...prev, '> Scanning user playtime history...']);
    }, 800);

    setTimeout(() => {
      setLogs(prev => [...prev, '> Detected high completionist trait in Sci-Fi/Shooter genres.']);
    }, 1800);

    setTimeout(() => {
      setLogs(prev => [...prev, '> Cross-referencing edition feature matrix...']);
    }, 2800);

    setTimeout(() => {
      setLogs(prev => [...prev, '> Optimal value determined.']);
      // Mock logic: Recommend the highest tier if it exists, or random
      const ultimate = editions.find(e => e.editionName.toLowerCase().includes('ultimate')) || editions[editions.length - 1];
      setRecommendation(ultimate);
      setStatus('done');
    }, 3800);
  };

  if (!editions || editions.length <= 1) return null;

  return (
    <div className="bg-[#0D1117] border border-blue-500/30 rounded-md overflow-hidden relative shadow-[0_0_15px_rgba(59,130,246,0.1)] mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#161b22] border-b border-[#30363D]">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            AI Purchase Advisor
          </h3>
        </div>
        {status === 'idle' && (
          <button 
            onClick={startAnalysis}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-sm uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          >
            <Zap className="w-3 h-3" /> Analyze My Profile
          </button>
        )}
      </div>

      {/* Content */}
      {(status === 'analyzing' || status === 'done') && (
        <div className="p-4 bg-black/40 font-mono text-xs">
          <div className="space-y-1 mb-4">
            {logs.map((log, idx) => (
              <p key={idx} className={idx === logs.length - 1 && status === 'analyzing' ? 'text-blue-400 animate-pulse' : 'text-[#8B949E]'}>
                {log}
              </p>
            ))}
          </div>

          {status === 'done' && recommendation && (
            <div className="mt-4 p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-sm animate-in fade-in zoom-in duration-500">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-emerald-400 font-bold mb-1 uppercase tracking-widest">Recommendation: {recommendation.editionName}</h4>
                  <p className="text-[#C9D1D9] text-sm leading-relaxed mb-3">
                    Based on your telemetry, you have a 95% completionist rate in this genre. The <span className="font-bold text-white">{recommendation.editionName}</span> includes the Season Pass, which statistically saves you 20% compared to purchasing upcoming DLCs separately.
                  </p>
                  <button 
                    onClick={() => onAddToCart && onAddToCart(recommendation)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors group"
                  >
                    Add {recommendation.editionName} to Cart 
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
