import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  actorName?: string;
  details: string;
  createdAt: string;
}

interface FlightRecorderLogsProps {
  logs: AuditLog[];
}

export default function FlightRecorderLogs({ logs }: FlightRecorderLogsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{
        background: '#0d0d12',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 36px -4px rgba(0, 0, 0, 0.65)',
      }}
    >
      <div className="p-6 sm:p-7 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 uppercase font-mono">
            <Terminal className="w-4 h-4 text-[#FF1E27]" />
            Flight Recorder Audit Stream
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Immutable chronological log of privileged platform events and administrative actions
          </p>
        </div>
        <div className="text-xs text-[#FF1E27] flex items-center gap-2 font-mono font-bold bg-red-950/40 border border-red-500/30 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#FF1E27] animate-ping" />
          <span>STREAM ACTIVE</span>
        </div>
      </div>

      <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto">
        {logs.map((log) => {
          const isRoot = log.action.includes('ROOT') || log.action.includes('SOVEREIGN');
          const isRevoke = log.action.includes('REVOKE') || log.action.includes('KILL');

          return (
            <div
              key={log.id}
              className="p-5 hover:bg-white/[0.02] transition-colors flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      isRoot
                        ? 'bg-red-500/15 text-[#FF1E27] border-red-500/30'
                        : isRevoke
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-xs font-semibold text-zinc-200 font-mono">
                    @{log.actorName || 'System'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-1 leading-relaxed">{log.details}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-zinc-300 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {new Date(log.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No privileged audit logs recorded yet.
          </div>
        )}
      </div>
    </motion.section>
  );
}
