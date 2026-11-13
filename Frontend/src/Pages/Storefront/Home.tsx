import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../Api/Axios';
import GameCard from '../../Components/GameCard';
import { StorefrontHeroBanner } from '../../Components/Store/StorefrontHeroBanner';
import StoreSkeletonLoader from '../../Components/Store/StoreSkeletonLoader';
import { getCachedData, setCachedData } from '../../Utils/sessionCache';
import {
  Terminal,
  Database,
  ArrowRight,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  X,
  Sparkles,
  Zap,
  RotateCcw,
  Tag,
} from 'lucide-react';

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  pricing: Array<{ price: number; isFree: boolean; editionName?: string }> | { price: number; isFree: boolean };
  media: { coverImageUrl: string; bannerImageUrl: string };
  tags?: string[];
  createdAt?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const cachedCatalog = getCachedData<Game[]>('store_catalog');
  const [games, setGames] = useState<Game[]>(() => cachedCatalog || []);
  const [loading, setLoading] = useState(() => !cachedCatalog);
  const [logs, setLogs] = useState<string[]>([
    '> Initializing GameStation runtime...',
    '> Establishing secure connection to DB...',
  ]);

  // Filtering & Sorting State (Option 1)
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [selectedPriceTier, setSelectedPriceTier] = useState<'ALL' | 'FREE' | 'UNDER_500' | 'UNDER_1500'>('ALL');
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'TITLE_AZ' | 'NEWEST'>('FEATURED');
  const [filterQuery, setFilterQuery] = useState<string>('');

  const getGamePricing = (game: Game) => {
    if (Array.isArray(game.pricing) && game.pricing.length > 0) {
      return {
        price: Number(game.pricing[0].price) || 0,
        isFree: Boolean(game.pricing[0].isFree),
      };
    }
    if (game.pricing && typeof game.pricing === 'object') {
      return {
        price: Number((game.pricing as any).price) || 0,
        isFree: Boolean((game.pricing as any).isFree),
      };
    }
    return { price: 0, isFree: false };
  };

  const getGameImage = (game: Game, preferred: 'banner' | 'cover') => {
    if (preferred === 'banner') {
      return game.media?.bannerImageUrl || game.media?.coverImageUrl || '';
    }
    return game.media?.coverImageUrl || game.media?.bannerImageUrl || '';
  };

  useEffect(() => {
    let isMounted = true;
    const fetchGames = async () => {
      try {
        const hasCache = Boolean(getCachedData('store_catalog'));
        if (!hasCache) {
          setLoading(true);
        }

        // Only enforce 380ms laser sweep on cold boot
        const minScan = !hasCache ? new Promise((resolve) => setTimeout(resolve, 380)) : Promise.resolve();

        const [response] = await Promise.all([
          api.get('/store/games'),
          minScan,
        ]);

        if (isMounted && response.data?.success) {
          setGames(response.data.data);
          setCachedData('store_catalog', response.data.data, 180_000); // 3-min warm cache
        }
      } catch (error) {
        console.error('Failed to fetch games', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchGames();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute unique genres across published games
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      if (g.genre) set.add(g.genre.trim());
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [games]);

  // Quick Counter Badges
  const freeCount = useMemo(() => {
    return games.filter((g) => {
      const p = getGamePricing(g);
      return p.isFree || p.price === 0;
    }).length;
  }, [games]);

  const under500Count = useMemo(() => {
    return games.filter((g) => {
      const p = getGamePricing(g);
      return !p.isFree && p.price > 0 && p.price <= 500;
    }).length;
  }, [games]);

  // Reactive Filter & Sorting Pipeline
  const filteredCatalog = useMemo(() => {
    return games
      .filter((game) => {
        const pricing = getGamePricing(game);

        // 1. Genre filter
        if (selectedGenre !== 'ALL') {
          const matchesGenre = game.genre?.toLowerCase() === selectedGenre.toLowerCase();
          const matchesTag = game.tags?.some((t) => t.toLowerCase() === selectedGenre.toLowerCase());
          if (!matchesGenre && !matchesTag) return false;
        }

        // 2. Price Tier filter
        if (selectedPriceTier === 'FREE') {
          if (!pricing.isFree && pricing.price > 0) return false;
        } else if (selectedPriceTier === 'UNDER_500') {
          if (pricing.isFree || pricing.price <= 0 || pricing.price > 500) return false;
        } else if (selectedPriceTier === 'UNDER_1500') {
          if (pricing.isFree || pricing.price <= 0 || pricing.price > 1500) return false;
        }

        // 3. Search Query
        if (filterQuery.trim()) {
          const q = filterQuery.toLowerCase().trim();
          const matchesTitle = game.title.toLowerCase().includes(q);
          const matchesDesc = game.description?.toLowerCase().includes(q);
          const matchesGenre = game.genre?.toLowerCase().includes(q);
          const matchesTag = game.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesGenre && !matchesTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = getGamePricing(a).price;
        const priceB = getGamePricing(b).price;

        if (sortBy === 'PRICE_ASC') return priceA - priceB;
        if (sortBy === 'PRICE_DESC') return priceB - priceA;
        if (sortBy === 'TITLE_AZ') return a.title.localeCompare(b.title);
        if (sortBy === 'NEWEST') {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        return 0; // FEATURED preserves API order
      });
  }, [games, selectedGenre, selectedPriceTier, sortBy, filterQuery]);

  const hasActiveFilters =
    selectedGenre !== 'ALL' ||
    selectedPriceTier !== 'ALL' ||
    sortBy !== 'FEATURED' ||
    filterQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedGenre('ALL');
    setSelectedPriceTier('ALL');
    setSortBy('FEATURED');
    setFilterQuery('');
  };

  const featuredGames = games.slice(0, 2);

  return (
    <div className="space-y-10 font-mono select-none">
      {/* ── AMBIENT DIAGNOSTIC CONNECTION BADGE ── */}
      <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase">
            {loading
              ? 'ESTABLISHING SECURE DB RUNTIME...'
              : `RING-3 RUNTIME · ${games.length} NODES DECRYPTED (0.04s)`}
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline">
          GAMESTATION CORE // STOREFRONT ENGINE v2.4
        </span>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.25 }}
          >
            <StoreSkeletonLoader />
          </motion.div>
        ) : (
          <motion.div
            key="catalog-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-10"
          >
            {/* Storefront Hero Spotlight / Dynamic Campaign Banner */}
            <StorefrontHeroBanner />

            {/* Featured / Hero Section (Always showcasing top tier releases) */}
            {featuredGames.length > 0 && !hasActiveFilters && (
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-[#212A3B] pb-2.5">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-bold tracking-widest text-[#E6EDF3] uppercase">
                    ~ ./bin/featured_targets
                  </h2>
                  <span className="text-[10px] text-zinc-500 ml-auto font-mono">
                    CURATED RELEASES
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredGames.map((game) => {
                    const pricing = getGamePricing(game);
                    const bannerUrl = getGameImage(game, 'banner');
                    return (
                      <div
                        key={game.id}
                        onClick={() => navigate(`/store/games/${game.id}`)}
                        className="relative bg-[#0B0F17] rounded-xl overflow-hidden group cursor-pointer aspect-video border border-[#212A3B] hover:border-emerald-500/70 transition-all duration-300 hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]"
                      >
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] z-10 pointer-events-none opacity-40" />

                        <img
                          src={bannerUrl}
                          alt={game.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-[#05060A]/70 to-transparent z-0" />

                        <div className="absolute bottom-0 left-0 p-6 w-full z-20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black bg-emerald-400 rounded-sm">
                              {game.genre}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                              STATUS: ONLINE
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                            <span>
                              <span className="text-emerald-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                &gt;
                              </span>
                              {game.title}
                            </span>
                            <span className="text-xs font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                              VIEW TERMINAL <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </h3>

                          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl line-clamp-2 border-l-2 border-emerald-500/40 pl-3">
                            {game.description}
                          </p>

                          <div className="mt-4 flex items-center gap-4">
                            <span className="text-sm font-black text-emerald-400 bg-[#0B0F17] border border-[#212A3B] group-hover:border-emerald-500/50 px-3.5 py-1.5 rounded-lg shadow-md transition-colors">
                              {pricing.isFree ? 'FREE' : `₹${pricing.price.toLocaleString('en-IN')}`}
                            </span>
                            <span className="text-[11px] text-zinc-400 group-hover:text-emerald-300 transition-colors">
                              Click to inspect editions &amp; system specs &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── OPTION 1: INTERACTIVE GENRE & PRICE FILTER MATRIX ───────────── */}
            <section className="space-y-4">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#212A3B] pb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-bold tracking-widest text-[#E6EDF3] uppercase">
                    ~ ./data/catalog_matrix
                  </h2>
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {filteredCatalog.length} NODES
                  </span>
                </div>

                {/* Quick Filters Reset */}
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>

              {/* Filter Controls Bar */}
              <div className="p-4 rounded-2xl bg-[#090D16] border border-[#1E2638] space-y-3 shadow-xl">
                {/* Row 1: Horizontal Scrollable Genre & Price Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
                  {/* All Titles Pill */}
                  <button
                    type="button"
                    onClick={() => setSelectedGenre('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                      selectedGenre === 'ALL'
                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-[#121824] text-zinc-400 hover:text-white hover:bg-[#182133] border border-white/[0.06]'
                    }`}
                  >
                    All Genres ({games.length})
                  </button>

                  {/* Quick Price Tier: Free to Play */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPriceTier((prev) => (prev === 'FREE' ? 'ALL' : 'FREE'))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedPriceTier === 'FREE'
                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-[#121824] text-emerald-400 hover:text-emerald-300 hover:bg-[#182133] border border-emerald-500/20'
                    }`}
                  >
                    <span>Free to Play</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">
                      {freeCount}
                    </span>
                  </button>

                  {/* Quick Price Tier: Under ₹500 */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPriceTier((prev) =>
                        prev === 'UNDER_500' ? 'ALL' : 'UNDER_500'
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedPriceTier === 'UNDER_500'
                        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-[#121824] text-cyan-400 hover:text-cyan-300 hover:bg-[#182133] border border-cyan-500/20'
                    }`}
                  >
                    <span>Under ₹500</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">
                      {under500Count}
                    </span>
                  </button>

                  {/* Dynamic Genre Pills */}
                  {availableGenres
                    .filter((g) => g !== 'ALL')
                    .map((genre) => {
                      const count = games.filter(
                        (gm) => gm.genre?.toLowerCase() === genre.toLowerCase()
                      ).length;
                      const isSelected = selectedGenre === genre;

                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => setSelectedGenre(genre)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                              : 'bg-[#121824] text-zinc-400 hover:text-white hover:bg-[#182133] border border-white/[0.06]'
                          }`}
                        >
                          {genre} ({count})
                        </button>
                      );
                    })}
                </div>

                {/* Row 2: Search Query & Sorting Dropdown */}
                <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Quick Catalog Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="Filter catalog by title, tag, or descriptor..."
                      className="w-full bg-[#05080E] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-white placeholder-zinc-500 outline-none transition-colors"
                    />
                    {filterQuery && (
                      <button
                        type="button"
                        onClick={() => setFilterQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sorting Dropdown */}
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-[#05080E] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl px-3 py-1.5 text-xs font-mono text-white outline-none cursor-pointer"
                    >
                      <option value="FEATURED">Featured Nodes</option>
                      <option value="PRICE_ASC">Price: Low to High (₹)</option>
                      <option value="PRICE_DESC">Price: High to Low (₹)</option>
                      <option value="TITLE_AZ">Title: A to Z</option>
                      <option value="NEWEST">Newest Deployed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── OPTION 2: GAME CARDS GRID WITH RICH MICRO-INTERACTIONS ──────── */}
              {filteredCatalog.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-2"
                >
                  <AnimatePresence>
                    {filteredCatalog.map((game) => {
                      const pricing = getGamePricing(game);
                      const editionsCount = Array.isArray(game.pricing) ? game.pricing.length : 1;
                      const defaultEdition =
                        Array.isArray(game.pricing) && game.pricing.length > 0
                          ? game.pricing[0].editionName
                          : undefined;

                      return (
                        <motion.div
                          key={game.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <GameCard
                            game={{
                              id: game.id,
                              title: game.title,
                              genre: game.genre,
                              price: pricing.price,
                              isFree: pricing.isFree,
                              coverImageUrl: getGameImage(game, 'cover'),
                              editionsCount,
                              editionName: defaultEdition,
                              tags: game.tags,
                              rating: (game as any).rating ?? null,
                              reviewCount: (game as any).reviewCount ?? 0,
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : (
                /* Empty Search & Filter State */
                <div className="text-center py-16 px-4 bg-[#090D16] border border-[#212A3B] border-dashed rounded-2xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      No Nodes Matching Catalog Query
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto font-sans">
                      No published titles matched your genre and price tier filters. Try selecting another genre or reset your search query.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    Clear Active Filters
                  </button>
                </div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
