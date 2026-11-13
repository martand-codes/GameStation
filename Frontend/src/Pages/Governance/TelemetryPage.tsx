import { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  Database,
  Globe,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  getTelemetryTracesAPI,
  getTelemetryMetricsAPI,
  type TraceItem,
  type TelemetryMetrics,
} from '../../Services/Telemetry.service';
import FlameGraph from '../../Components/Admin/FlameGraph';

export default function TelemetryPage() {
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
    const interval = setInterval(fetchTelemetryData, 4000); // 4-second live stream polling
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
          limit: 50,
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

  // Trigger synthetic search & store calls to generate real traces live
  const handleTriggerSimulatedTrace = async () => {
    setSimulating(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await Promise.all([
        fetch(`${apiBase}/search?q=cyberpunk`, { credentials: 'include' }),
        fetch(`${apiBase}/search?q=hades`, { credentials: 'include' }),
        fetch(`${apiBase}/store/games`, { credentials: 'include' }),
      ]);
      await fetchTelemetryData();
    } catch (e) {
      console.error('Synthetic generation error:', e);
    } finally {
      setSimulating(false);
    }
  };

  // Prepare chart timeline data from recent traces
  const timelineChartData = useMemo(() => {
    if (!traces.length) return [];
    return [...traces]
      .reverse()
      .slice(-25)
      .map((t, idx) => ({
        index: idx + 1,
        route: t.tags.route?.replace('/api', '') || t.rootSpan.name.slice(0, 15),
        duration: t.durationMs,
        p50: metrics?.p50Ms || 5,
        p95: metrics?.p95Ms || 25,
        status: t.tags.statusCode || 200,
        hasError: t.hasErrors,
      }));
  }, [traces, metrics]);

  // Prepare category breakdown data for bar chart
  const categoryChartData = useMemo(() => {
    if (!metrics?.categoryBreakdown) return [];
    const colors: Record<string, string> = {
      DB: '#f59e0b',
      HTTP: '#8b5cf6',
      SEARCH: '#10b981',
      SAGA: '#06b6d4',
      INTERNAL: '#64748b',
    };

    return Object.entries(metrics.categoryBreakdown)
      .filter(([_, summary]) => summary.count > 0)
      .map(([cat, summary]) => ({
        category: cat,
        count: summary.count,
        avgDurationMs: summary.avgDurationMs,
        totalDurationMs: summary.totalDurationMs,
        color: colors[cat] || '#8b5cf6',
      }));
  }, [metrics]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto select-none font-sans">
      {/* ── 1. SOVEREIGN OBSERVABILITY HEADER ───────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[#FF1E27] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,30,39,0.2)]">
              <Activity className="w-3 h-3 text-[#FF1E27] animate-pulse" />
              Sovereign Flight Observability &bull; W3C OpenTelemetry
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold uppercase">
              AsyncLocalStorage Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white font-mono">
            SYSTEM TELEMETRY &amp; FLAME GRAPHS
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Distributed tracing across Express middleware, PostgreSQL query plans (Prisma), in-memory Okapi BM25, and Saga backward compensation loops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerSimulatedTrace}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-red-600/25 cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Synthesizing...' : 'Simulate Workload'}</span>
          </button>

          <button
            onClick={fetchTelemetryData}
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Refresh Telemetry Stream"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. METRIC STAT CARDS ─────────────────────────────────────── */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] mb-1">
              <span>P50 LATENCY</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-mono text-emerald-400">
              {metrics.p50Ms} <span className="text-xs font-normal text-zinc-500">ms</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">Median Request Time</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] mb-1">
              <span>P95 LATENCY</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black font-mono text-amber-400">
              {metrics.p95Ms} <span className="text-xs font-normal text-zinc-500">ms</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">95th Percentile Target</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] mb-1">
              <span>P99 LATENCY</span>
              <Clock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-black font-mono text-purple-400">
              {metrics.p99Ms} <span className="text-xs font-normal text-zinc-500">ms</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">Tail Latency Ceiling</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] mb-1">
              <span>FAULT RATE</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div
              className={`text-xl font-black font-mono ${
                metrics.errorRatePercent > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {metrics.errorRatePercent}%
            </div>
            <span className="text-[9px] font-mono text-zinc-500">5xx Server Failures</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] mb-1">
              <span>RAM BUFFER</span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black font-mono text-cyan-400">
              {metrics.totalTraces} <span className="text-xs font-normal text-zinc-500">/ 2000</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">Bounded Ring Memory</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] mb-1">
              <span>RECORDED SPANS</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-black font-mono text-indigo-400">
              {metrics.activeSpansCount}
            </div>
            <span className="text-[9px] font-mono text-zinc-500">Captured Sub-Operations</span>
          </div>
        </div>
      )}

      {/* ── 3. RECHARTS VISUALIZATION SUITE ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency History Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Execution Latency Waterfall History (Recent Requests)
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Actual Latency
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                P95 Baseline
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="p95Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="route" tick={{ fill: '#71717a', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" />
                <YAxis unit="ms" tick={{ fill: '#71717a', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-[#09090e]/95 border border-white/[0.1] shadow-2xl font-mono text-xs space-y-1">
                          <div className="font-bold text-white">{data.route}</div>
                          <div className="text-emerald-400">Duration: {data.duration.toFixed(3)} ms</div>
                          <div className="text-zinc-500 text-[10px]">P95 Baseline: {data.p95} ms</div>
                          <div className="text-[10px]">
                            Status:{' '}
                            <span className={data.status >= 400 ? 'text-rose-400' : 'text-emerald-400'}>
                              {data.status}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="duration" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" />
                <Area type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 4" fillOpacity={1} fill="url(#p95Gradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Latency Breakdown (1 col) */}
        <div className="p-5 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Subsystem Time Allocation
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" unit="ms" tick={{ fill: '#71717a', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" />
                <YAxis dataKey="category" type="category" tick={{ fill: '#e4e4e7', fontSize: 11 }} stroke="rgba(255,255,255,0.06)" />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-[#09090e]/95 border border-white/[0.1] shadow-2xl font-mono text-xs space-y-1">
                          <div className="font-bold text-white">{data.category} Layer</div>
                          <div className="text-zinc-300">Total Spent: {data.totalDurationMs.toFixed(2)} ms</div>
                          <div className="text-emerald-400">Avg Duration: {data.avgDurationMs.toFixed(3)} ms</div>
                          <div className="text-zinc-500 text-[10px]">Executed Spans: {data.count}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalDurationMs" radius={[0, 6, 6, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 4. STREAM CONTROLS & TRACE TABLE ─────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#0d0d12] p-1 rounded-xl border border-white/[0.06]">
            {(['ALL', 'OK', 'ERROR'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#0d0d12] p-1 rounded-xl border border-white/[0.06]">
            {['ALL', 'HTTP', 'DB', 'SEARCH', 'SAGA'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#1a1a24] text-white border border-red-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search route, trace ID, method..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0d0d12] border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      {/* Traces Table Stream */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#09090e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0c0c14] text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Method &amp; Route</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Spans</th>
                <th className="py-3 px-4">Categories</th>
                <th className="py-3 px-4">W3C Trace ID</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {traces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 italic">
                    No traces captured matching the current filters.
                  </td>
                </tr>
              ) : (
                traces.map((trace) => {
                  const method = trace.tags.method || 'GET';
                  const statusCode = trace.tags.statusCode || 200;
                  const isError = trace.hasErrors || statusCode >= 400;
                  const categories = Array.from(new Set(trace.spans.map((s) => s.category)));

                  return (
                    <tr
                      key={trace.traceId}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
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

                      <td className="py-3 px-4 text-zinc-300 font-semibold">
                        {trace.spans.length}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {categories.map((c) => (
                            <span
                              key={c}
                              className="px-1.5 py-0.2 rounded text-[9px] bg-white/5 border border-white/10 text-zinc-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-zinc-500 text-[11px] truncate max-w-[120px]">
                        {trace.traceId}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrace(trace);
                          }}
                          className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-[#FF1E27] hover:text-white transition-all font-mono text-[11px] font-bold border border-red-500/20 cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <span>Flame Graph</span>
                          <ArrowUpRight className="w-3 h-3" />
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

