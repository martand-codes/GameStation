import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Clock,
  Layers,
  AlertTriangle,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { getTelemetryMetricsAPI, type TelemetryMetrics } from '../../../Services/Telemetry.service';

export default function TelemetryRadarCard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await getTelemetryMetricsAPI();
      setMetrics(data.metrics);
    } catch {
      // quiet fail on background polling
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = (metrics?.errorRatePercent || 0) < 5 && (metrics?.p95Ms || 0) < 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 rounded-2xl border border-white/[0.08] bg-[#0d0d12] shadow-xl relative overflow-hidden group"
    >
      {/* Background Glow */}
      <div
        className={`absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isHealthy ? 'bg-emerald-500/10' : 'bg-red-500/15'
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Radar Status & Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isHealthy ? 'bg-emerald-400' : 'bg-red-500'
                } animate-ping absolute`}
              />
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isHealthy ? 'bg-emerald-500' : 'bg-red-500'
                } relative`}
              />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              INFRASTRUCTURE TELEMETRY RADAR
            </span>
            <span
              className={`px-2 py-0.2 rounded-full font-mono text-[9px] font-bold uppercase ${
                isHealthy
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isHealthy ? 'System Optimal' : 'Anomaly Detected'}
            </span>
          </div>

          <p className="text-xs text-zinc-300 font-sans max-w-xl">
            {isHealthy
              ? 'W3C distributed trace spans, Prisma query plans, and Okapi BM25 in-memory ranking executing within nominal sub-millisecond thresholds.'
              : 'Elevated latency or exception spikes detected in the recent trace window. Deep dive into flame graphs for root cause analysis.'}
          </p>
        </div>

        {/* Center: Live Quick Metrics */}
        {metrics && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/[0.06] text-center font-mono">
              <div className="text-[9px] text-zinc-500 uppercase flex items-center justify-center gap-1">
                <Clock className="w-2.5 h-2.5 text-amber-400" />
                <span>P95</span>
              </div>
              <div className="text-xs font-bold text-amber-400 mt-0.5">{metrics.p95Ms} ms</div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/[0.06] text-center font-mono">
              <div className="text-[9px] text-zinc-500 uppercase flex items-center justify-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                <span>FAULT</span>
              </div>
              <div
                className={`text-xs font-bold mt-0.5 ${
                  metrics.errorRatePercent > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {metrics.errorRatePercent}%
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/[0.06] text-center font-mono hidden sm:block">
              <div className="text-[9px] text-zinc-500 uppercase flex items-center justify-center gap-1">
                <Layers className="w-2.5 h-2.5 text-cyan-400" />
                <span>BUFFER</span>
              </div>
              <div className="text-xs font-bold text-cyan-400 mt-0.5">{metrics.totalTraces}</div>
            </div>
          </div>
        )}

        {/* Right: Deep Dive CTA Button */}
        <div className="shrink-0">
          <button
            onClick={() => navigate('/platform/governance/telemetry')}
            className="w-full md:w-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all cursor-pointer group"
          >
            <span>Deep Dive Into Flame Graphs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

