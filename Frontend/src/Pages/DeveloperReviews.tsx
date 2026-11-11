import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Star,
  ShieldCheck,
  Cpu,
  Gamepad2,
  Volume2,
  Eye,
  Wifi,
  Clock,
  Send,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CornerDownRight,
  ThumbsUp,
  ThumbsDown,
  Layers,
  ArrowRight,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { useAuth } from '../Context/AuthContext';
import { useToast } from '../Context/ToastContext';
import {
  getStudioReviewsAPI,
  replyToReviewAPI,
  deleteReplyAPI,
  deleteReviewAPI,
  type StudioReviewItem,
  type StudioReviewsFeedResponse,
} from '../Services/Review.service';

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Unplayable', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  2: { label: 'Needs Polish', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  3: { label: 'Meh / Average', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  4: { label: 'Great', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  5: { label: 'Masterpiece', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
};

const RadarCustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0b0e14]/95 border border-purple-500/40 rounded-xl px-3.5 py-2 shadow-2xl text-xs font-mono backdrop-blur-md">
        <p className="text-neutral-400 text-[10px] uppercase tracking-wider">{item.metric}</p>
        <p className="text-purple-300 font-extrabold text-sm mt-0.5">
          {item.score > 0 ? `${item.score.toFixed(1)} / 5.0` : 'Not Rated'}
        </p>
      </div>
    );
  }
  return null;
};

export default function DeveloperReviews() {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudioReviewsFeedResponse | null>(null);

  // Filters
  const [searchParams] = useSearchParams();
  const [selectedStudioId, setSelectedStudioId] = useState<string>('ALL');
  const [selectedGameId, setSelectedGameId] = useState<string>(searchParams.get('gameId') || 'ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [responseFilter, setResponseFilter] = useState<'ALL' | 'UNANSWERED' | 'ANSWERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Composer State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const isElevated = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await getStudioReviewsAPI(selectedStudioId, selectedGameId);
      setData(res);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch studio reviews feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [selectedStudioId, selectedGameId]);

  const handlePublishReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.warning('Please enter a response message.');
      return;
    }

    try {
      setSubmittingReply(true);
      await replyToReviewAPI(reviewId, replyText.trim());
      toast.success('Official developer response published!');
      setReplyingReviewId(null);
      setReplyText('');
      fetchFeed();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish response.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    try {
      await deleteReplyAPI(reviewId);
      toast.info('Developer response removed.');
      fetchFeed();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove response.');
    }
  };

  const handlePurgeReview = async (reviewId: string) => {
    try {
      await deleteReviewAPI(reviewId);
      toast.success('Review purged by Platform Administration.');
      fetchFeed();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to purge review.');
    }
  };

  const summary = data?.summary;
  const gamesList = data?.gamesList || [];
  const rawReviews = data?.reviews || [];

  // Filtered reviews
  const filteredReviews = rawReviews.filter((r) => {
    if (ratingFilter !== 'ALL' && r.overallRating !== Number(ratingFilter)) return false;
    if (responseFilter === 'UNANSWERED' && r.developerResponse) return false;
    if (responseFilter === 'ANSWERED' && !r.developerResponse) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        r.content.toLowerCase().includes(q) ||
        r.headline?.toLowerCase().includes(q) ||
        r.user.username.toLowerCase().includes(q) ||
        r.game.title.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none font-sans">
      {/* ── Top Header Strip ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              Community Feedback // Player Telemetry
            </span>

            {isElevated ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-bold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                All Studios Feed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                @{user?.username} Studio
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-white font-mono mt-1.5">
            Player Reviews &amp; Community Telemetry
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Monitor player sentiment, analyze hardware benchmarks, and dispatch official studio developer responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeed}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Telemetry
          </button>
        </div>
      </div>

      {/* ── Studio Telemetry & KPI Matrix ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Studio Rating */}
        <div className="p-5 rounded-2xl bg-[#090C11] border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Studio Sentiment</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              {summary ? summary.averageRating : '0.0'}
            </span>
            <span className="text-xs font-mono text-neutral-500">/ 5.0</span>
          </div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            {summary?.sentiment || 'NO REVIEWS YET'}
          </span>
        </div>

        {/* Metric 2: Total Reviews */}
        <div className="p-5 rounded-2xl bg-[#090C11] border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black font-mono text-white">
            {summary ? summary.totalReviews : 0}
          </p>
          <span className="text-[11px] font-mono text-neutral-500 block">
            From verified digital owners
          </span>
        </div>

        {/* Metric 3: Unanswered Reviews */}
        <div className="p-5 rounded-2xl bg-[#090C11] border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Pending Response</span>
            <CornerDownRight className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black font-mono text-purple-400">
            {summary ? summary.unansweredCount : 0}
          </p>
          <span className="text-[11px] font-mono text-neutral-500 block">
            Reviews awaiting studio reply
          </span>
        </div>

        {/* Metric 4: Optimization Index */}
        <div className="p-5 rounded-2xl bg-[#090C11] border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>Optimization Index</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-cyan-300">
              {summary?.deepDiveAverages.optimization ? summary.deepDiveAverages.optimization : 'N/A'}
            </span>
            <span className="text-xs font-mono text-neutral-500">/ 5.0</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 block">
            Community performance average
          </span>
        </div>
      </div>

      {/* ── Visual Telemetry & Quality Radar Command Deck ─────────────────────────── */}
      {summary && summary.totalReviews > 0 && (() => {
        const radarData = [
          {
            metric: 'Optimization',
            score: summary.deepDiveAverages.optimization || 0,
            fullMark: 5,
          },
          {
            metric: 'Fun Factor',
            score: summary.deepDiveAverages.funFactor || 0,
            fullMark: 5,
          },
          {
            metric: 'Sound Design',
            score: summary.deepDiveAverages.soundDesign || 0,
            fullMark: 5,
          },
          {
            metric: 'Visuals',
            score: summary.deepDiveAverages.visuals || 0,
            fullMark: 5,
          },
          {
            metric: 'Netcode/Ping',
            score: summary.deepDiveAverages.stabilityNetcode || 0,
            fullMark: 5,
          },
        ];

        const totalReviews = summary.totalReviews || 1;
        const ratingDistribution = summary.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        const technicalMetrics = [
          {
            label: 'Optimization',
            value: summary.deepDiveAverages.optimization,
            icon: Cpu,
            color: 'text-cyan-400',
            bg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
          },
          {
            label: 'Fun Factor',
            value: summary.deepDiveAverages.funFactor,
            icon: Gamepad2,
            color: 'text-emerald-400',
            bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          },
          {
            label: 'Sound Design',
            value: summary.deepDiveAverages.soundDesign,
            icon: Volume2,
            color: 'text-purple-400',
            bg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
          },
          {
            label: 'Visuals & Art',
            value: summary.deepDiveAverages.visuals,
            icon: Eye,
            color: 'text-amber-400',
            bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
          },
          {
            label: 'Netcode / Ping',
            value: summary.deepDiveAverages.stabilityNetcode,
            icon: Wifi,
            color: 'text-teal-400',
            bg: 'bg-gradient-to-r from-teal-500 to-emerald-500',
          },
        ];

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart Column 1: 5-Axis Pentagon Quality Radar (5 Cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#090C11] border border-neutral-800/80 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Technical Quality Radar
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">5-AXIS SPECTRUM</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans mt-2">
                  Pentagon benchmark balancing engine optimization, gameplay loop, audio, visual fidelity, and network stability.
                </p>
              </div>

              {/* Recharts Radar Chart */}
              <div className="w-full h-[260px] my-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#262626" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 5]}
                      stroke="#404040"
                      tick={{ fill: '#737373', fontSize: 9, fontFamily: 'monospace' }}
                    />
                    <Radar
                      name="Studio Quality"
                      dataKey="score"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.45}
                    />
                    <RechartsTooltip content={<RadarCustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Telemetry Grounded
                </span>
                <span>Max Target: 5.0 / 5.0</span>
              </div>
            </div>

            {/* Chart Column 2: Performance Progress & 5-Star Spread (7 Cols) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#090C11] border border-neutral-800/80 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Technical Sub-Scores & Sentiment Distribution
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">VERIFIED OWNERS</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                {/* Left Sub-Column: 5 Technical Metric Progress Bars */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                    Engineering Benchmarks
                  </span>
                  {technicalMetrics.map((tech) => {
                    const score = tech.value ? Number(tech.value.toFixed(1)) : 0;
                    const pct = (score / 5) * 100;
                    const Icon = tech.icon;

                    return (
                      <div key={tech.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="flex items-center gap-1.5 text-neutral-300">
                            <Icon className={`w-3.5 h-3.5 ${tech.color}`} />
                            {tech.label}
                          </span>
                          <span className={`font-bold ${tech.color}`}>
                            {score > 0 ? `${score} / 5.0` : 'N/A'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${tech.bg}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Sub-Column: 5-Star Sentiment Breakdown (Clickable Filters!) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                      Rating Spread (Click to Filter)
                    </span>
                    {ratingFilter !== 'ALL' && (
                      <button
                        onClick={() => setRatingFilter('ALL')}
                        className="text-[10px] font-mono text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  {[5, 4, 3, 2, 1].map((tier) => {
                    const count = ratingDistribution[tier] || 0;
                    const pct = Math.round((count / totalReviews) * 100);
                    const tierMeta = RATING_LABELS[tier];
                    const isSelected = ratingFilter === String(tier);

                    return (
                      <button
                        key={tier}
                        onClick={() => setRatingFilter(isSelected ? 'ALL' : String(tier))}
                        className={`w-full text-left p-1.5 rounded-lg transition-all group flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/40 border border-purple-500/50'
                            : 'hover:bg-neutral-900/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white flex items-center gap-0.5">
                              {tier} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                            </span>
                            <span className="text-[11px] text-neutral-400 group-hover:text-neutral-200 transition-colors">
                              {tierMeta.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              tier === 5
                                ? 'bg-emerald-400'
                                : tier === 4
                                ? 'bg-teal-400'
                                : tier === 3
                                ? 'bg-amber-400'
                                : tier === 2
                                ? 'bg-orange-400'
                                : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>Total Evaluated: {summary.totalReviews} Verified Players</span>
                <span className="text-emerald-400">{summary.sentiment}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Filters & Search Toolbar ──────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[#090C11] border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Game Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">Title:</span>
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="bg-black/60 border border-neutral-800 text-xs text-white font-mono rounded-xl px-3 py-1.5 outline-none focus:border-purple-500"
            >
              <option value="ALL">All Studio Titles</option>
              {gamesList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-black/60 border border-neutral-800 text-xs text-white font-mono rounded-xl px-3 py-1.5 outline-none focus:border-purple-500"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5★ Masterpiece</option>
              <option value="4">4★ Great</option>
              <option value="3">3★ Meh / Average</option>
              <option value="2">2★ Needs Polish</option>
              <option value="1">1★ Unplayable</option>
            </select>
          </div>

          {/* Response Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">Status:</span>
            <select
              value={responseFilter}
              onChange={(e) => setResponseFilter(e.target.value as any)}
              className="bg-black/60 border border-neutral-800 text-xs text-white font-mono rounded-xl px-3 py-1.5 outline-none focus:border-purple-500"
            >
              <option value="ALL">All Reviews</option>
              <option value="UNANSWERED">Needs Response</option>
              <option value="ANSWERED">Studio Replied</option>
            </select>
          </div>
        </div>

        {/* Text Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full bg-black/60 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* ── Reviews Stream & Official Studio Reply Deck ───────────────────────────── */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev: StudioReviewItem) => {
            const ratingMeta = RATING_LABELS[rev.overallRating] || RATING_LABELS[3];
            const playtimeHours = (rev.playtimeAtReview / 3600).toFixed(1);
            const isReplying = replyingReviewId === rev.id;

            return (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-[#090C11] border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-4"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/60 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Game Cover Thumbnail */}
                    <img
                      src={
                        rev.game?.media?.coverImageUrl ||
                        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070'
                      }
                      alt={rev.game?.title}
                      className="w-10 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-white">
                          {rev.game?.title}
                        </span>
                        <span className="text-neutral-500">&bull;</span>
                        <span className="text-xs font-mono text-purple-400">
                          @{rev.user.username}
                        </span>
                        {rev.isVerifiedOwner && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold uppercase">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verified Owner
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 mt-0.5">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{playtimeHours} hrs at review</span>
                        <span>&bull;</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-400">
                          👍 {rev.helpfulCount} | 👎 {rev.unhelpfulCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Tag */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.overallRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-800'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${ratingMeta.color}`}
                    >
                      {ratingMeta.label}
                    </span>
                  </div>
                </div>

                {/* Headline & Body */}
                <div className="space-y-1.5">
                  {rev.headline && (
                    <h3 className="text-sm font-mono font-bold text-white">
                      "{rev.headline}"
                    </h3>
                  )}
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {rev.content}
                  </p>
                </div>

                {/* Technical Sub-Score Badges */}
                {(rev.optimization || rev.funFactor || rev.soundDesign || rev.visuals || rev.stabilityNetcode) && (
                  <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono">
                    {rev.optimization && (
                      <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Optimization: {rev.optimization}/5
                      </span>
                    )}
                    {rev.funFactor && (
                      <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                        <Gamepad2 className="w-3 h-3" /> Fun: {rev.funFactor}/5
                      </span>
                    )}
                    {rev.soundDesign && (
                      <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> Audio: {rev.soundDesign}/5
                      </span>
                    )}
                    {rev.visuals && (
                      <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Visuals: {rev.visuals}/5
                      </span>
                    )}
                    {rev.stabilityNetcode && (
                      <span className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-300 flex items-center gap-1">
                        <Wifi className="w-3 h-3" /> Netcode: {rev.stabilityNetcode}/5
                      </span>
                    )}
                  </div>
                )}

                {/* ── Official Developer Response Section ───────────────────────────── */}
                {rev.developerResponse ? (
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="font-bold text-purple-300 uppercase tracking-wider">
                          Official Studio Response
                        </span>
                        <span className="text-neutral-500">&bull;</span>
                        <span className="text-[10px] text-neutral-400">
                          {rev.developerRespondedAt
                            ? new Date(rev.developerRespondedAt).toLocaleDateString()
                            : 'Pinned'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setReplyingReviewId(rev.id);
                            setReplyText(rev.developerResponse || '');
                          }}
                          className="text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReply(rev.id)}
                          className="text-[11px] font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                      {rev.developerResponse}
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center justify-between">
                    {!isReplying ? (
                      <button
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-purple-400 hover:text-purple-300 border border-neutral-800 transition-colors cursor-pointer"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Reply as Studio Developer</span>
                      </button>
                    ) : null}

                    {isElevated && (
                      <button
                        onClick={() => handlePurgeReview(rev.id)}
                        className="text-[11px] font-mono text-red-500/70 hover:text-red-400 transition-colors cursor-pointer"
                        title="Owner Authority: Purge fraudulent review"
                      >
                        Purge Review (Governance)
                      </button>
                    )}
                  </div>
                )}

                {/* Inline Composer if Replying */}
                <AnimatePresence>
                  {isReplying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-xl bg-black/60 border border-purple-500/40 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5" />
                          Publish Official Developer Response to @{rev.user.username}
                        </span>
                        <span className="text-neutral-500 text-[10px]">
                          Visible to all players on storefront
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="e.g. Thanks for the feedback! We are deploying patch v1.0.4 this Friday to address this framerate drop..."
                        className="w-full bg-[#090C11] border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500 leading-relaxed"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePublishReply(rev.id)}
                          disabled={submittingReply}
                          className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>{submittingReply ? 'Publishing...' : 'Publish Response'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          /* Empty Filter State */
          <div className="p-12 rounded-2xl bg-[#090C11] border border-neutral-800 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-300">
              No Reviews Match Current Filters
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Try adjusting your title, rating, or search filter parameters to view player telemetry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
