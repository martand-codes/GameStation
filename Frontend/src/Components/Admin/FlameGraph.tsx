import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Layers,
  Copy,
  Check,
  X,
  AlertCircle,
  Database,
  Globe,
  Search as SearchIcon,
  Cpu,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { TraceItem, Span } from '../../Services/Telemetry.service';

interface FlameGraphProps {
  trace: TraceItem;
  onClose?: () => void;
}

export default function FlameGraph({ trace, onClose }: FlameGraphProps) {
  const [selectedSpanId, setSelectedSpanId] = useState<string>(trace.rootSpan.spanId);
  const [copied, setCopied] = useState(false);

  // Copy Trace ID
  const copyTraceId = () => {
    navigator.clipboard.writeText(trace.traceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build tree depth for each span
  const spansWithDepth = useMemo(() => {
    const depthMap: Record<string, number> = {};
    depthMap[trace.rootSpan.spanId] = 0;

    // Sort spans by startTime
    const sorted = [...trace.spans].sort((a, b) => a.startTime - b.startTime);

    for (const span of sorted) {
      if (span.parentSpanId && depthMap[span.parentSpanId] !== undefined) {
        depthMap[span.spanId] = depthMap[span.parentSpanId] + 1;
      } else {
        depthMap[span.spanId] = 0;
      }
    }

    return sorted.map((span) => ({
      ...span,
      depth: depthMap[span.spanId] || 0,
    }));
  }, [trace]);

  const selectedSpan = useMemo(
    () => trace.spans.find((s) => s.spanId === selectedSpanId) || trace.rootSpan,
    [trace, selectedSpanId]
  );

  const totalDuration = Math.max(trace.durationMs, 0.001);

  // Category Colors
  const getCategoryTheme = (cat: Span['category'], hasError: boolean) => {
    if (hasError) {
      return {
        bg: 'bg-rose-500/20',
        border: 'border-rose-500/50',
        bar: 'bg-rose-500',
        text: 'text-rose-400',
        badge: 'bg-rose-500/30 text-rose-300 border-rose-500/40',
        icon: AlertCircle,
      };
    }
    switch (cat) {
      case 'HTTP':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          bar: 'bg-gradient-to-r from-purple-600 to-indigo-500',
          text: 'text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          icon: Globe,
        };
      case 'DB':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: Database,
        };
      case 'SEARCH':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: SearchIcon,
        };
      case 'SAGA':
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          bar: 'bg-gradient-to-r from-cyan-500 to-blue-400',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          icon: Cpu,
        };
      default:
        return {
          bg: 'bg-neutral-500/10',
          border: 'border-neutral-500/30',
          bar: 'bg-neutral-500',
          text: 'text-neutral-400',
          badge: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
          icon: Layers,
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#070b14] border border-blue-900/30 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-blue-950/60 bg-[#0a0f1d] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white tracking-wide">
                {trace.rootSpan.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider ${
                  trace.hasErrors
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {trace.tags.statusCode || (trace.hasErrors ? '500 ERROR' : '200 OK')}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400 font-mono">
              <span>W3C Trace ID:</span>
              <button
                onClick={copyTraceId}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                title="Copy Trace ID"
              >
                <span>{trace.traceId}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Trace Stats & Close */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-900/40 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-neutral-400">Total Latency:</span>
            <span className="text-emerald-400 font-bold">{trace.durationMs.toFixed(3)} ms</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-900/40 font-mono text-xs">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-neutral-400">Spans:</span>
            <span className="text-purple-300 font-bold">{trace.spans.length}</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Waterfall Tree + Span Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Interactive Flame Graph Waterfall */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-blue-950/60 overflow-hidden">
          {/* Time Scale Ruler */}
          <div className="h-7 border-b border-blue-950/50 bg-[#050811] px-4 flex items-center justify-between font-mono text-[10px] text-neutral-400 select-none">
            <span className="w-1/3 text-left">0.00 ms</span>
            <span className="w-1/3 text-center">{(totalDuration / 2).toFixed(2)} ms (50%)</span>
            <span className="w-1/3 text-right">{totalDuration.toFixed(2)} ms (100%)</span>
          </div>

          {/* Span List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 select-none">
            {spansWithDepth.map((span) => {
              const isSelected = span.spanId === selectedSpanId;
              const hasError = span.status === 'ERROR';
              const theme = getCategoryTheme(span.category, hasError);
              const Icon = theme.icon;

              // Calculate start offset and width percentage relative to root
              const offsetMs = Math.max(0, span.startTime - trace.startTime);
              const leftPercent = Math.min(Math.max((offsetMs / totalDuration) * 100, 0), 98);
              const rawWidthPercent = (span.durationMs / totalDuration) * 100;
              const widthPercent = Math.max(rawWidthPercent, 2); // Minimum 2% visibility

              return (
                <div
                  key={span.spanId}
                  onClick={() => setSelectedSpanId(span.spanId)}
                  className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/10'
                      : 'bg-[#090d19]/80 border-blue-950/50 hover:border-blue-800/60 hover:bg-[#0c1222]'
                  }`}
                >
                  {/* Span Info Header */}
                  <div
                    className="flex items-center justify-between gap-2 mb-2 font-mono text-xs"
                    style={{ paddingLeft: `${span.depth * 16}px` }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {span.depth > 0 && (
                        <span className="text-neutral-400">↳</span>
                      )}
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${theme.text}`} />
                      <span className="font-semibold text-neutral-200 truncate">{span.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] border font-semibold ${theme.badge}`}>
                        {span.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-neutral-400">
                        {((span.durationMs / totalDuration) * 100).toFixed(1)}%
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          hasError ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {span.durationMs.toFixed(3)} ms
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Timeline Bar Track */}
                  <div className="relative h-2 w-full rounded-full bg-black/40 overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%`, left: `${leftPercent}%` }}
                      transition={{ duration: 0.3 }}
                      className={`absolute top-0 bottom-0 rounded-full ${theme.bar} shadow-sm`}
                      style={{ left: `${leftPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Span Inspector Drawer */}
        <div className="w-full lg:w-96 p-5 bg-[#050811] flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-blue-950/60 mb-4">
              <Info className="w-4 h-4 text-blue-400" />
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Span Telemetry Inspector
              </h4>
            </div>

            {/* Selected Span Overview */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Span Name</span>
                <span className="text-sm font-bold text-white break-words">{selectedSpan.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/30">
                  <span className="text-[10px] text-neutral-400 block">Duration</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {selectedSpan.durationMs.toFixed(3)} ms
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/30">
                  <span className="text-[10px] text-neutral-400 block">Category</span>
                  <span className="text-purple-300 font-bold text-sm">{selectedSpan.category}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Span ID</span>
                <span className="text-neutral-300 text-[11px] select-all">{selectedSpan.spanId}</span>
              </div>

              {selectedSpan.parentSpanId && (
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Parent Span ID</span>
                  <span className="text-neutral-400 text-[11px] select-all">{selectedSpan.parentSpanId}</span>
                </div>
              )}

              {/* Error Box if Failed */}
              {selectedSpan.error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Exception Caught</span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 break-words mb-2">
                    {selectedSpan.error.message}
                  </p>
                  {selectedSpan.error.stack && (
                    <pre className="text-[9px] bg-black/50 p-2 rounded-lg text-rose-400 overflow-x-auto max-h-28">
                      {selectedSpan.error.stack}
                    </pre>
                  )}
                </div>
              )}

              {/* Attributes / Metadata Payload */}
              <div className="pt-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Attributes &amp; Metadata
                </span>
                <div className="rounded-xl bg-[#090d1a] border border-blue-950 p-3 max-h-60 overflow-y-auto">
                  {Object.keys(selectedSpan.attributes).length === 0 ? (
                    <span className="text-neutral-400 italic text-[11px]">No custom attributes</span>
                  ) : (
                    <pre className="text-[10px] text-blue-300 font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedSpan.attributes, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-950/60 text-center">
            <span className="text-[10px] text-neutral-400 font-mono">
              OpenTelemetry W3C Trace Level 1 Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

