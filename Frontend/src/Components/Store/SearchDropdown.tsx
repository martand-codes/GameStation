import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Gamepad2,
  X,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { searchGamesAPI, type SearchResultGame } from '../../Services/Search.service';

interface SearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectCorrection?: (corrected: string) => void;
}

export default function SearchDropdown({
  query,
  isOpen,
  onClose,
  onSelectCorrection,
}: SearchDropdownProps) {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResultGame[]>([]);
  const [correctedQuery, setCorrectedQuery] = useState<string | undefined>(undefined);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  useEffect(() => {
    if (!isOpen || !query.trim()) {
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
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          selectGame(results[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const selectGame = (gameId: string) => {
    onClose();
    navigate(`/store/games/${gameId}`);
  };

  if (!isOpen || (!query.trim() && results.length === 0)) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#090C12] border border-[#1E2633] rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.85)] overflow-hidden font-sans select-none"
    >
      {/* Telemetry & Typo Bar */}
      {(latencyMs !== null || correctedQuery) && (
        <div className="px-4 py-2 border-b border-[#1E2633] bg-[#0D111A] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          {/* Typo Correction Banner */}
          {correctedQuery && correctedQuery.toLowerCase() !== query.toLowerCase() ? (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Did you mean:</span>
              <button
                type="button"
                onClick={() => onSelectCorrection?.(correctedQuery)}
                className="font-bold underline hover:text-amber-300 cursor-pointer"
              >
                "{correctedQuery}"
              </button>
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
              {latencyMs}ms &bull; In-Memory BM25
            </span>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {loading && results.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 font-mono text-xs animate-pulse">
            EVALUATING_IN_MEMORY_INDEX...
          </div>
        ) : query && results.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 font-mono text-xs space-y-1">
            <Gamepad2 className="w-6 h-6 mx-auto opacity-20 text-emerald-400" />
            <p>No games matched "{query}"</p>
            <p className="text-[10px] text-neutral-600 font-sans">
              Try searching by title, studio, or genre.
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
                      className="w-10 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-12 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center font-mono text-[9px] text-neutral-500 shrink-0">
                      GS
                    </div>
                  )}

                  {/* Details */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-xs font-bold text-white truncate"
                        dangerouslySetInnerHTML={{
                          __html: game.highlightedTitle.replace(
                            /class='gs-search-hit'/g,
                            "class='bg-emerald-500/30 text-emerald-300 px-0.5 rounded font-bold'"
                          ),
                        }}
                      />
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-neutral-400 shrink-0">
                        {game.genre}
                      </span>
                    </div>

                    {/* Snippet */}
                    <p
                      className="text-[11px] text-neutral-400 font-sans line-clamp-1"
                      dangerouslySetInnerHTML={{
                        __html: game.snippet.replace(
                          /class='gs-search-hit'/g,
                          "class='text-emerald-400 font-bold'"
                        ),
                      }}
                    />

                    {/* Tag Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {game.tags.slice(0, 2).map((tag) => (
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

                {/* Price & Score */}
                <div className="text-right shrink-0 space-y-0.5">
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
      <div className="px-4 py-1.5 border-t border-[#1E2633] bg-[#07090E] flex items-center justify-between text-[10px] font-mono text-neutral-500">
        <div className="flex items-center gap-2">
          <span>↑↓ navigate</span>
          <span>&bull;</span>
          <span>↵ select</span>
          <span>&bull;</span>
          <span>ESC close</span>
        </div>
        <span>In-Memory BM25</span>
      </div>
    </div>
  );
}

