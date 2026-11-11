import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Search,
  RefreshCw,
  Zap,
  ShieldAlert,
  AlertTriangle,
  Play,
  Cpu,
  Flame,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import {
  getSagaHistoryAPI,
  executePurchaseSagaAPI,
  type SagaInstanceItem,
  type SagaStepLogItem,
} from '../../Services/Saga.service';
import { useToast } from '../../Context/ToastContext';
import { useSocket } from '../../Context/SocketContext';

export default function SagaInspector() {
  const toast = useToast();
  const { socket } = useSocket();

  const [sagas, setSagas] = useState<SagaInstanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedSaga, setSelectedSaga] = useState<SagaInstanceItem | null>(null);

  // Chaos Simulation State
  const [simulating, setSimulating] = useState(false);
  const [chaosMode, setChaosMode] = useState<'HAPPY' | 'CHAOS_ROYALTY' | 'CHAOS_LICENSE'>('CHAOS_ROYALTY');

  useEffect(() => {
    fetchSagas();
  }, [statusFilter]);

  // Listen to live Saga WebSocket telemetry
  useEffect(() => {
    if (!socket) return;

    const handleSagaStream = () => {
      fetchSagas(true); // Silent background refresh
    };

    socket.on('saga:telemetry:stream', handleSagaStream);
    return () => {
      socket.off('saga:telemetry:stream', handleSagaStream);
    };
  }, [socket]);

  const fetchSagas = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await getSagaHistoryAPI({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        limit: 50,
      });
      setSagas(res.data);
      if (selectedSaga) {
        const updated = res.data.find((s) => s.id === selectedSaga.id);
        if (updated) setSelectedSaga(updated);
      }
    } catch (err) {
      console.error('Failed to load saga transactions:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      const chaosFailStep =
        chaosMode === 'CHAOS_ROYALTY'
          ? 'Studio Royalty & Treasury Split'
          : chaosMode === 'CHAOS_LICENSE'
          ? 'Software License Provisioning'
          : undefined;

      // Pick any game id or test target
      const targetGameId = 'd6f9da0c-600f-4fb8-bf6b-f0cff9964eba'; // Cyberpunk or first published
      const res = await executePurchaseSagaAPI({
        gameId: targetGameId,
        chaosFailStep,
      });

      if (res.success) {
        toast.success(`Saga Completed! (Execution time: ${res.saga.durationMs}ms)`);
      } else {
        toast.info(res.message);
      }
      await fetchSagas();
    } catch (err: any) {
      toast.info(err.response?.data?.message || 'Saga finished with compensation.');
      await fetchSagas();
    } finally {
      setSimulating(false);
    }
  };

  const filteredSagas = sagas.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      s.sagaType.toLowerCase().includes(q) ||
      s.idempotencyKey.toLowerCase().includes(q) ||
      s.user?.username?.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle,
          label: 'Completed',
          classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        };
      case 'COMPENSATED':
        return {
          icon: RotateCcw,
          label: 'Compensated (Rolled Back)',
          classes: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
      case 'RUNNING':
      case 'COMPENSATING':
        return {
          icon: Activity,
          label: status,
          classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30 animate-pulse',
        };
      case 'FAILED':
        return {
          icon: XCircle,
          label: 'Critical Fail',
          classes: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        };
      default:
        return {
          icon: Clock,
          label: status,
          classes: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Chaos Testing Console Banner ────────────────────────────────────────── */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0A0D14] border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Cpu className="w-3 h-3 text-purple-400" />
              Saga Orchestrator &bull; Fault Tolerance Test Rig
            </span>
          </div>
          <h2 className="text-base md:text-lg font-black uppercase tracking-wide text-white font-mono">
            Distributed Transaction &amp; Chaos Simulator
          </h2>
          <p className="text-xs text-neutral-400 font-sans max-w-xl">
            Execute real forward transactions or inject deliberate hardware faults to observe the
            reverse compensation loop restore wallet balances and revoke licenses automatically.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center rounded-xl bg-black/60 border border-white/10 p-1 text-xs font-mono">
            <button
              onClick={() => setChaosMode('HAPPY')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chaosMode === 'HAPPY'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Happy Path
            </button>
            <button
              onClick={() => setChaosMode('CHAOS_ROYALTY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                chaosMode === 'CHAOS_ROYALTY'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" /> Fail Step 3 (Royalty)
            </button>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer disabled:cursor-not-allowed"
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Orchestrating...' : 'Trigger Saga'}</span>
          </button>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          {['ALL', 'COMPLETED', 'COMPENSATED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-neutral-900/60 text-neutral-400 border-[#1E2633] hover:text-white hover:bg-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, User, Key..."
              className="w-full bg-[#07090E] border border-[#1E2633] focus:border-purple-500 pl-9 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-neutral-500 outline-none font-mono transition-colors"
            />
          </div>
          <button
            onClick={() => fetchSagas()}
            disabled={loading}
            className="p-2 rounded-xl bg-[#0B0E14] hover:bg-neutral-800 border border-[#1E2633] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Main Layout: Sagas List + Selected Saga Trace Diagram ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sagas Ledger Table */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider px-1">
            Transaction Instances ({filteredSagas.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="text-center py-16 text-neutral-500 font-mono text-xs animate-pulse">
                SYNCING_SAGA_LEDGER...
              </div>
            ) : filteredSagas.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 font-mono text-xs border border-dashed border-[#1E2633] rounded-2xl">
                No saga transactions found.
              </div>
            ) : (
              filteredSagas.map((item) => {
                const badge = getStatusBadge(item.status);
                const isSelected = selectedSaga?.id === item.id;
                const IconComponent = badge.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSaga(item)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'bg-[#0A0D14] hover:bg-[#0E121B] border-[#1E2633]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-white truncate">
                        {item.sagaType}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.classes}`}
                      >
                        <IconComponent className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>User: @{item.user?.username || 'System'}</span>
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.durationMs !== null ? `${item.durationMs}ms` : '--'}
                      </span>
                    </div>

                    <div className="text-[10px] text-neutral-600 font-mono truncate pt-1 border-t border-white/5">
                      Key: {item.idempotencyKey}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Execution Step Timeline & Graph ─────────────────────── */}
        <div className="lg:col-span-7">
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider px-1 mb-2">
            Execution Timeline &amp; State Transition Trace
          </div>

          {selectedSaga ? (
            <div className="p-5 rounded-2xl bg-[#080B10] border border-[#1E2633] space-y-6 shadow-2xl">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                      {selectedSaga.sagaType}
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500">
                      ID: {selectedSaga.id.slice(0, 8)}...
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    User: @{selectedSaga.user?.username} &bull; Started:{' '}
                    {new Date(selectedSaga.startedAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">
                      {selectedSaga.durationMs} ms
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Total Execution</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                      getStatusBadge(selectedSaga.status).classes
                    }`}
                  >
                    {getStatusBadge(selectedSaga.status).label}
                  </span>
                </div>
              </div>

              {/* Idempotency Audit Strip */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold block">
                  Idempotency Guarantee Token
                </span>
                <span className="text-xs font-mono text-neutral-300 break-all select-all block">
                  {selectedSaga.idempotencyKey}
                </span>
              </div>

              {/* Step Sequence Flowchart */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  Ordered Execution Steps ({selectedSaga.steps.length})
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1E2633]">
                  {selectedSaga.steps.map((st, idx) => {
                    const isSuccess = st.status === 'SUCCESS';
                    const isFailed = st.status === 'FAILED';
                    const isCompensated = st.status === 'COMPENSATED';
                    const isRunning = st.status === 'RUNNING';

                    return (
                      <div key={st.stepIndex} className="relative group">
                        {/* Status Node Dot */}
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                            isSuccess
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : isFailed
                              ? 'bg-rose-950 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                              : isCompensated
                              ? 'bg-amber-950 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                              : isRunning
                              ? 'bg-blue-950 border-blue-500 text-blue-400 animate-spin'
                              : 'bg-neutral-900 border-neutral-700 text-neutral-500'
                          }`}
                        >
                          {isSuccess ? (
                            '✓'
                          ) : isFailed ? (
                            '✗'
                          ) : isCompensated ? (
                            '↩'
                          ) : (
                            idx + 1
                          )}
                        </div>

                        {/* Step Details Box */}
                        <div
                          className={`p-3.5 rounded-xl border transition-all ${
                            isFailed
                              ? 'bg-rose-950/20 border-rose-500/40'
                              : isCompensated
                              ? 'bg-amber-950/20 border-amber-500/30'
                              : isSuccess
                              ? 'bg-emerald-950/10 border-emerald-500/20'
                              : 'bg-neutral-900/40 border-[#1E2633]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white font-mono">
                              Step {st.stepIndex + 1}: {st.stepName}
                            </span>
                            <div className="flex items-center gap-2">
                              {st.durationMs !== null && st.durationMs !== undefined && (
                                <span className="text-[10px] font-mono text-neutral-500">
                                  {st.durationMs}ms
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                                  isSuccess
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : isFailed
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                    : isCompensated
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                                }`}
                              >
                                {st.status}
                              </span>
                            </div>
                          </div>

                          {/* Error Banner */}
                          {st.error && (
                            <div className="mt-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono space-y-1">
                              <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" /> Forward Execution Error:
                              </span>
                              <p className="text-[11px] leading-relaxed">{st.error}</p>
                            </div>
                          )}

                          {/* Compensation Note */}
                          {isCompensated && (
                            <div className="mt-2 text-[11px] font-mono text-amber-300/90 flex items-center gap-1.5">
                              <RotateCcw className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Compensated: Step action was safely reverted in reverse order.</span>
                            </div>
                          )}

                          {/* Output Snapshot */}
                          {st.output && (
                            <div className="mt-2 p-2 rounded bg-black/40 border border-white/5">
                              <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-1">
                                Step Output
                              </span>
                              <pre className="text-[10px] font-mono text-neutral-300 overflow-x-auto">
                                {JSON.stringify(st.output, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#080B10] border border-[#1E2633] text-center text-neutral-500 font-mono text-xs flex flex-col items-center justify-center">
              <Layers className="w-10 h-10 mb-3 opacity-20 text-purple-400" />
              <p className="font-bold text-neutral-400">Select a Saga Instance</p>
              <p className="text-[10px] text-neutral-600 mt-1 max-w-sm font-sans">
                Click any transaction on the left to inspect its real-time step graph, execution
                latency, idempotency token, and compensation rollback audit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

