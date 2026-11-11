import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Layers,
  Search,
  Clock,
  AlertTriangle,
  RefreshCw,
  Zap,
  Filter,
  CheckCircle2,
  XCircle,
  Cpu,
  Database,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import {
  getTelemetryTracesAPI,
  getTelemetryMetricsAPI,
  type TraceItem,
  type TelemetryMetrics,
} from '../../Services/Telemetry.service';
import FlameGraph from './FlameGraph';

export default function APMViewer() {
  const [traces, setTraces] = useState<TraceItem[]>([]);
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState<TraceItem | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OK' | 'ERROR'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [minDuration, setMinDuration] = useState<number | undefined>(undefined);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchTelemetryData();
    const interval = setInterval(fetchTelemetryData, 5000); // Poll every 5s for live APM stream
    return () => clearInterval(interval);
  }, [statusFilter, categoryFilter, minDuration]);

  const fetchTelemetryData = async () => {
    try {
      const [tracesRes, metricsRes] = await Promise.all([
        getTelemetryTracesAPI({
          status: statusFilter,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          minDurationMs: minDuration,
          search: search.trim() || undefined,
          limit: 40,
        }),
        getTelemetryMetricsAPI(),
      ]);

      setTraces(tracesRes.traces);
      setMetrics(metricsRes.metrics);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger synthetic search & query to showcase live tracing waterfall
  const handleTriggerSimulatedTrace = async () => {
    setSimulating(true);
    try {
      // Fire live search queries against the backend to generate fresh traces
      await fetch('http://localhost:5000/api/search?q=cyberpunk', { credentials: 'include' });
      await fetch('http://localhost:5000/api/store/games', { credentials: 'include' });
      await fetchTelemetryData();
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header & Trigger Rig */}
      <div className="p-6 rounded-2xl bg-[#090D1A] border border-blue-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
                Live In-Process APM &bull; W3C OpenTelemetry
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-mono tracking-tight">
              DISTRIBUTED TRACING &amp; FLAME GRAPH ENGINE
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1 max-w-2xl">
              Inspect sub-millisecond execution waterfalls, parent-child span hierarchies, and database
              query profiles across Express, Prisma, Okapi BM25, and Saga transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerSimulatedTrace}
              disabled={simulating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
              <span>{simulating ? 'Generating...' : 'Generate Live Trace'}</span>
            </button>

            <button
              onClick={fetchTelemetryData}
              className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-900/40 text-blue-300 hover:text-white transition-all cursor-pointer"
              title="Refresh Stream"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real-Time Percentiles & Stat Cards */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-blue-950/80">
            <div className="p-3.5 rounded-xl bg-[#060a14] border border-blue-900/30">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] mb-1">
                <span>P50 LATENCY</span>
                <Clock className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-lg font-black font-mono text-emerald-400">
                {metrics.p50Ms} <span className="text-xs font-normal text-neutral-400">ms</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060a14] border border-blue-900/30">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] mb-1">
                <span>P95 LATENCY</span>
                <Clock className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-lg font-black font-mono text-amber-400">
                {metrics.p95Ms} <span className="text-xs font-normal text-neutral-400">ms</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060a14] border border-blue-900/30">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] mb-1">
                <span>P99 LATENCY</span>
                <Clock className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-lg font-black font-mono text-purple-400">
                {metrics.p99Ms} <span className="text-xs font-normal text-neutral-400">ms</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060a14] border border-blue-900/30">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] mb-1">
                <span>ERROR RATE</span>
                <AlertTriangle className="w-3 h-3 text-rose-400" />
              </div>
              <div
                className={`text-lg font-black font-mono ${
                  metrics.errorRatePercent > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {metrics.errorRatePercent}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060a14] border border-blue-900/30">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] mb-1">
                <span>BUFFER TRACES</span>
                <Layers className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-lg font-black font-mono text-cyan-400">
                {metrics.totalTraces} <span className="text-xs font-normal text-neutral-400">/ 2000</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060a14] border border-blue-900/30">
              <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] mb-1">
                <span>ACTIVE SPANS</span>
                <Activity className="w-3 h-3 text-indigo-400" />
              </div>
              <div className="text-lg font-black font-mono text-indigo-400">
                {metrics.activeSpansCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Stream Controls */}
      <div className="p-4 rounded-xl bg-[#080d1a] border border-blue-950 flex flex-wrap items-center justify-between gap-4">
        {/* Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex items-center bg-[#050811] p-1 rounded-xl border border-blue-950">
            {(['ALL', 'OK', 'ERROR'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center bg-[#050811] p-1 rounded-xl border border-blue-950">
            {['ALL', 'HTTP', 'DB', 'SEARCH', 'SAGA'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search route, trace ID, method..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#050811] border border-blue-950 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Traces Table Stream */}
      <div className="rounded-2xl border border-blue-950/80 bg-[#070b14] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-blue-950 bg-[#090e1d] text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Method &amp; Route</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Spans</th>
                <th className="py-3 px-4">Categories</th>
                <th className="py-3 px-4">Trace ID</th>
                <th className="py-3 px-4 text-right">Waterfall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-950/50">
              {traces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 italic">
                    No traces captured matching the current filters.
                  </td>
                </tr>
              ) : (
                traces.map((trace) => {
                  const method = trace.tags.method || 'GET';
                  const statusCode = trace.tags.statusCode || 200;
                  const isError = trace.hasErrors || statusCode >= 400;

                  // Unique categories in this trace
                  const categories = Array.from(new Set(trace.spans.map((s) => s.category)));

                  return (
                    <tr
                      key={trace.traceId}
                      className="hover:bg-blue-950/20 transition-colors cursor-pointer group"
                      onClick={() => setSelectedTrace(trace)}
                    >
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              method === 'POST'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : method === 'DELETE'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {method}
                          </span>
                          <span className="truncate max-w-xs">{trace.tags.route || trace.rootSpan.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isError
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {statusCode}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`${
                            trace.durationMs > 100
                              ? 'text-rose-400'
                              : trace.durationMs > 20
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {trace.durationMs.toFixed(3)} ms
                        </span>
                      </td>

                      <td className="py-3 px-4 text-neutral-300 font-semibold">
                        {trace.spans.length}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {categories.map((c) => (
                            <span
                              key={c}
                              className="px-1.5 py-0.2 rounded text-[9px] bg-white/5 border border-white/10 text-neutral-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-400 text-[11px] truncate max-w-[120px]">
                        {trace.traceId}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrace(trace);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-all font-mono text-[11px] font-bold border border-blue-500/30 cursor-pointer"
                        >
                          View Flame Graph
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flame Graph Modal Overlay */}
      <AnimatePresence>
        {selectedTrace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 md:p-8 flex items-center justify-center"
            onClick={() => setSelectedTrace(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-6xl h-[88vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <FlameGraph trace={selectedTrace} onClose={() => setSelectedTrace(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

