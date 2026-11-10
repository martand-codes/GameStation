import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Shield,
  Clock,
  User,
  Gamepad2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  EyeOff,
  UserX,
  UserCheck,
  Terminal,
} from 'lucide-react';
import { getAdminAuditLogsAPI } from '../../Services/Admin.service';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAdminAuditLogsAPI(100, actionFilter);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.actorName?.toLowerCase().includes(q) ||
      log.targetName?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'GAME_CERTIFIED':
        return {
          icon: CheckCircle,
          label: 'Certified',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'GAME_REJECTED':
        return {
          icon: XCircle,
          label: 'Rejected',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      case 'ROOT_GAME_MODERATION':
        return {
          icon: EyeOff,
          label: 'Catalog Moderation',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'USER_SUSPENDED':
        return {
          icon: UserX,
          label: 'User Suspended',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        };
      case 'USER_RESTORED':
        return {
          icon: UserCheck,
          label: 'User Restored',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'USER_ROLE_REASSIGNED':
        return {
          icon: Shield,
          label: 'Clearance Reassigned',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        };
      default:
        return {
          icon: Terminal,
          label: action,
          color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
        };
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-900/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Flight Recorder
            </span>
            <h1 className="text-xl md:text-2xl font-bold font-mono uppercase tracking-wider text-white">
              Operations Audit Trail
            </h1>
          </div>
          <p className="text-xs text-blue-200/70 mt-1 font-sans">
            Immutable staff action telemetry, certification directives, moderation receipts, and enforcement history.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-800/40 hover:bg-blue-900/40 text-blue-300 font-mono text-xs transition-colors cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Recorder
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Action Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Operations' },
            { id: 'GAME_CERTIFIED', label: 'Certifications' },
            { id: 'GAME_REJECTED', label: 'Rejections' },
            { id: 'ROOT_GAME_MODERATION', label: 'Delistings' },
            { id: 'USER_SUSPENDED', label: 'Suspensions' },
            { id: 'USER_RESTORED', label: 'Restorations' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActionFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                actionFilter === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-blue-300/60 hover:text-white hover:bg-blue-950/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search operator, target, directive..."
            className="bg-[#050814] border border-blue-900/50 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-blue-100 placeholder:text-blue-400/30 outline-none font-mono w-64 sm:w-80"
          />
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="space-y-3 font-mono">
        {loading ? (
          <div className="py-16 text-center text-blue-300/50 bg-[#090E1F] rounded-xl border border-blue-900/30">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
            Reading telemetry tape...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-blue-300/50 bg-[#090E1F] rounded-xl border border-blue-900/30">
            No flight recorder events found matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const Icon = badge.icon;
            const timeStr = new Date(log.createdAt).toLocaleString();

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30 hover:border-blue-800/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-lg bg-blue-950/60 border border-blue-900/40 text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-white text-xs font-semibold">
                        by <span className="text-blue-400">@{log.actorName || 'Staff'}</span>
                      </span>
                      {log.targetName && (
                        <span className="text-blue-200/60 text-xs">
                          &rarr; Target: <span className="text-white">"{log.targetName}"</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-200/80 font-sans leading-relaxed">
                      {log.details || 'Standard execution receipt recorded.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono text-[10px] text-blue-400/50 md:pl-4 md:border-l md:border-blue-900/30 flex md:flex-col justify-between items-end gap-1">
                  <div className="flex items-center gap-1 text-blue-300/70">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {timeStr}
                  </div>
                  <div className="text-blue-500/40">{log.ipAddress || '127.0.0.1'}</div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

