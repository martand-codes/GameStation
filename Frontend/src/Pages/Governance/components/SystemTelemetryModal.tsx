import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Server,
  Database,
  Cpu,
  CreditCard,
  Clock,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getSystemTelemetryAPI } from '../../../Services/Governance.service';

interface SystemTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemTelemetryModal({ isOpen, onClose }: SystemTelemetryModalProps) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen]);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSystemTelemetryAPI();
      setTelemetry(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to query system telemetry');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    if (!seconds && seconds !== 0) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-lg bg-[#0d0d14] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden font-sans select-none z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-[#11111a]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Live System Telemetry
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  Real-time runtime infrastructure diagnostics
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTelemetry}
                disabled={loading}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#181822] border border-white/[0.06] transition-colors cursor-pointer"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FF1E27]' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#181822] border border-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF1E27]" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 font-mono">
              {/* Database Latency */}
              <div className="p-3.5 rounded-xl bg-[#14141e] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-zinc-400" />
                    <span>PostgreSQL Ping</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                </div>
                <div className="text-xl font-black text-white">
                  {telemetry ? `${telemetry.dbLatencyMs} ms` : '--'}
                </div>
                <span className="text-[10px] text-zinc-500 block">Round-trip query latency</span>
              </div>

              {/* Memory Footprint */}
              <div className="p-3.5 rounded-xl bg-[#14141e] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Process RSS</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold">Node.js</span>
                </div>
                <div className="text-xl font-black text-white">
                  {telemetry ? `${telemetry.memoryUsageMB} MB` : '--'}
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  Heap used: {telemetry ? `${telemetry.heapUsedMB} MB` : '--'}
                </span>
              </div>

              {/* Server Uptime */}
              <div className="p-3.5 rounded-xl bg-[#14141e] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Node Uptime</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
                </div>
                <div className="text-base font-bold text-white tracking-tight">
                  {telemetry ? formatUptime(telemetry.uptimeSeconds) : '--'}
                </div>
                <span className="text-[10px] text-zinc-500 block">Process continuous runtime</span>
              </div>

              {/* Active Sessions */}
              <div className="p-3.5 rounded-xl bg-[#14141e] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Active Sessions</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold">DB TOKENS</span>
                </div>
                <div className="text-xl font-black text-white">
                  {telemetry ? telemetry.activeSessionsCount : '--'}
                </div>
                <span className="text-[10px] text-zinc-500 block">Live authenticated bearer keys</span>
              </div>
            </div>

            {/* Integration Indicators */}
            <div className="p-3.5 rounded-xl bg-[#14141e] border border-white/[0.06] space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-300">
                  <CreditCard className="w-4 h-4 text-zinc-400" />
                  <span>Stripe Gateway Readiness</span>
                </span>
                {telemetry?.isStripeConfigured ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>LIVE / CONFIGURED</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>KEY MISSING</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <span className="text-zinc-400">Dynamic Platform Take-Rate</span>
                <span className="text-[#FF1E27] font-bold">{telemetry ? `${telemetry.platformRoyaltyRate}%` : '30%'}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                <span>Last Telemetry Probe</span>
                <span>{telemetry ? new Date(telemetry.timestamp).toLocaleTimeString() : '--'}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.06] bg-[#11111a] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Close Diagnostics
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

