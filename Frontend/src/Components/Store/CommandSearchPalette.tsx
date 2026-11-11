import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Zap,
  Sparkles,
  Gamepad2,
  Tag,
  Clock,
  ArrowRight,
  X,
  CornerDownLeft,
  Command,
} from 'lucide-react';
import { searchGamesAPI, type SearchResultGame } from '../../Services/Search.service';

interface CommandSearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function CommandSearchPalette({
  isOpen,
  onClose,
  initialQuery = '',
}: CommandSearchPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultGame[]>([]);
  const [correctedQuery, setCorrectedQuery] = useState<string | undefined>(undefined);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setCorrectedQuery(undefined);
      setLatencyMs(null);
    }
  }, [isOpen]);

  // Sync initialQuery prop
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Debounced Search Execution
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults([]);
      setCorrectedQuery(undefined);
      setLatencyMs(null);
      setTotalMatches(0);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchGamesAPI(query.trim(), { limit: 6, fuzzy: true });
        setResults(res.results);
        setCorrectedQuery(res.correctedQuery);
        setLatencyMs(res.latencyMs);
        setTotalMatches(res.totalMatches);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 120); // Fast 120ms debounce

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Keyboard Navigation: Up, Down, Enter, Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        selectGame(results[selectedIndex].id);
      }
    }
  };

  const selectGame = (gameId: string) => {
    onClose();
    navigate(`/store/games/${gameId}`);
  };

  const applyCorrection = (corrected: string) => {
    setQuery(corrected);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md">
      {/* Background click to dismiss */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-2xl bg-[#090C12] border border-[#1E2633] focus-within:border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans select-none"
      >
        {/* Search Header Input Console */}
        <div className="p-4 border-b border-[#1E2633] flex items-center gap-3 bg-[#0D111A]">
          <span className="text-emerald-400 font-mono text-base font-bold select-none">λ</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type query to search in-memory index (e.g. 'Cyberpunk', 'rpg', 'open world')..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-neutral-500 font-mono tracking-wide"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[10px] font-mono text-neutral-400">
            <span>ESC</span>
          </div>
        </div>

        {/* Telemetry & Typo Bar */}
        {(latencyMs !== null || correctedQuery) && (
          <div className="px-4 py-2 border-b border-[#1E2633] bg-[#07090E] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            {/* Typo Correction Banner */}
            {correctedQuery && correctedQuery.toLowerCase() !== query.toLowerCase() ? (
              <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Did you mean:</span>
                <button
                  onClick={() => applyCorrection(correctedQuery)}
                  className="font-bold underline hover:text-amber-300 cursor-pointer"
                >
                  "{correctedQuery}"
                </button>
                <span className="text-[10px] text-neutral-500">(Levenshtein Distance &le; 2)</span>
              </div>
            ) : (
              <span className="text-neutral-500 text-[11px]">
                Corpus Query &bull; {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
              </span>
            )}

            {/* Sub-millisecond Latency Badge */}
            {latencyMs !== null && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                <Zap className="w-3 h-3 text-emerald-400" />
                {latencyMs}ms &bull; Okapi BM25
              </span>
            )}
          </div>
        )}

        {/* Results Stream */}
        <div className="max-h-[420px] overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {loading && results.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 font-mono text-xs animate-pulse">
              EVALUATING_INVERTED_INDEX...
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 font-mono text-xs space-y-2">
              <Gamepad2 className="w-8 h-8 mx-auto opacity-20 text-emerald-400" />
              <p>No games matched "{query}"</p>
              <p className="text-[10px] text-neutral-600 font-sans">
                Try searching by studio name, genre, or alternative tags.
              </p>
            </div>
          ) : (
            results.map((game, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={game.id}
                  onClick={() => selectGame(game.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-neutral-900/30 hover:bg-neutral-900/60 border-transparent hover:border-[#1E2633]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    {game.coverImageUrl ? (
                      <img
                        src={game.coverImageUrl}
                        alt={game.title}
                        className="w-12 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-14 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center font-mono text-[10px] text-neutral-500 shrink-0">
                        GS
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {/* Highlighted Title */}
                        <h4
                          className="text-sm font-bold text-white truncate"
                          dangerouslySetInnerHTML={{
                            __html: game.highlightedTitle.replace(
                              /class='gs-search-hit'/g,
                              "class='bg-emerald-500/30 text-emerald-300 px-0.5 rounded font-bold'"
                            ),
                          }}
                        />
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400 shrink-0">
                          {game.genre}
                        </span>
                      </div>

                      {/* Snippet */}
                      <p
                        className="text-xs text-neutral-400 font-sans line-clamp-1"
                        dangerouslySetInnerHTML={{
                          __html: game.snippet.replace(
                            /class='gs-search-hit'/g,
                            "class='text-emerald-400 font-bold'"
                          ),
                        }}
                      />

                      {/* Tag Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {game.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono text-neutral-500 bg-neutral-800/60 px-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {game.matchedFields.length > 0 && (
                          <span className="text-[9px] font-mono text-emerald-400/70">
                            Matched: {game.matchedFields.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="text-right shrink-0 space-y-1">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {game.price === 0 ? 'FREE' : `₹${game.price.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1 justify-end">
                      Score: {game.score.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 py-2 border-t border-[#1E2633] bg-[#07090E] flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300">↑↓</span> to navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300">↵</span> to select
            </span>
          </div>
          <span>In-Memory BM25 &bull; GameStation Index</span>
        </div>
      </motion.div>
    </div>
  );
}

