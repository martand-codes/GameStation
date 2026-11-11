import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Star,
  ShieldCheck,
  Cpu,
  Gamepad2,
  Volume2,
  Eye,
  Wifi,
  Clock,
  Edit3,
  Plus,
  Lock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Flame,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useToast } from '../../Context/ToastContext';
import {
  getGameReviewsAPI,
  voteReviewAPI,
  type GameReviewsResponse,
  type GameReviewItem,
} from '../../Services/Review.service';
import GameReviewModal from './GameReviewModal';

interface TelemetryReviewsProps {
  gameId: string;
  gameTitle: string;
}

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Unplayable', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  2: { label: 'Needs Polish', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  3: { label: 'Meh / Average', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  4: { label: 'Great', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  5: { label: 'Masterpiece', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
};

export default function TelemetryReviews({ gameId, gameTitle }: TelemetryReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [data, setData] = useState<GameReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'highest' | 'lowest'>('helpful');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    if (!gameId) return;
    try {
      setLoading(true);
      const res = await getGameReviewsAPI(gameId, sortBy);
      setData(res);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [gameId, sortBy]);

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to rate this review as helpful.');
      return;
    }

    try {
      const res = await voteReviewAPI(reviewId, isHelpful);
      // Optimistically update the review in local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r) => {
            if (r.id === reviewId) {
              return {
                ...r,
                helpfulCount: res.helpfulCount,
                unhelpfulCount: res.unhelpfulCount,
                userVote: res.userVote,
              };
            }
            return r;
          }),
        };
      });

      if (res.userVote === true) {
        toast.success('Marked review as helpful!');
      } else if (res.userVote === false) {
        toast.info('Marked review as unhelpful.');
      } else {
        toast.info('Vote cleared.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit vote.');
    }
  };

  const summary = data?.summary;
  const userStatus = data?.userStatus;
  const reviews = data?.reviews || [];

  const sentimentColors: Record<string, string> = {
    'OVERWHELMINGLY POSITIVE': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    'VERY POSITIVE': 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    'MOSTLY POSITIVE': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    'MIXED': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    'MOSTLY NEGATIVE': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    'NO REVIEWS YET': 'text-neutral-400 bg-neutral-800 border-neutral-700',
  };

  return (
    <section className="bg-[#0D1117] border border-[#30363D] rounded-xl p-6 space-y-6 font-sans select-none">
      {/* ── Top Header Strip ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-purple-400" />
            <h2 className="text-base font-bold font-mono text-purple-400 uppercase tracking-widest">
              Player_Telemetry // Verified Reviews
            </h2>
          </div>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Authentic feedback from players with verified digital licenses and logged playtime.
          </p>
        </div>

        {/* Global Sentiment Indicator */}
        <div className="flex items-center gap-2.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
              sentimentColors[summary?.sentiment || 'NO REVIEWS YET']
            }`}
          >
            {summary?.sentiment || 'NO REVIEWS YET'}
          </span>
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="p-1.5 rounded-lg bg-[#161B22] text-[#8B949E] hover:text-white transition-colors cursor-pointer"
            title="Refresh Reviews"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Aggregate Scorecard & Deep Dive Telemetry ──────────────────────── */}
      {summary && summary.totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-xl bg-[#070A0F] border border-[#21262D]">
          {/* Col 1: Average Star Score */}
          <div className="flex flex-col justify-center items-center p-4 border-b md:border-b-0 md:border-r border-[#21262D] space-y-2">
            <span className="text-xs font-mono text-[#8B949E] uppercase tracking-wider">
              Platform Score
            </span>
            <div className="flex items-center gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {summary.averageRating}
              </span>
              <div className="space-y-1">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(summary.averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-[#8B949E] block">
                  out of 5.0
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Based on {summary.totalReviews} verified {summary.totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Col 2: 5-Star Distribution Breakdown */}
          <div className="flex flex-col justify-center space-y-1.5 p-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.ratingDistribution[star] || 0;
              const percent = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-8 text-right text-neutral-400 font-semibold">{star}★</span>
                  <div className="flex-1 h-2 rounded-full bg-[#161B22] overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 text-[10px] text-neutral-500 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Col 3: Deep-Dive Sub-metrics Telemetry */}
          <div className="flex flex-col justify-center space-y-2.5 p-2 md:border-l border-[#21262D]">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Technical Sub-Metrics
            </span>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-blue-400" /> Optimization:
                </span>
                <span className="font-bold text-blue-400">
                  {summary.deepDiveAverages.optimization ? `${summary.deepDiveAverages.optimization} / 5` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Gamepad2 className="w-3 h-3 text-emerald-400" /> Fun Factor:
                </span>
                <span className="font-bold text-emerald-400">
                  {summary.deepDiveAverages.funFactor ? `${summary.deepDiveAverages.funFactor} / 5` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-purple-400" /> Sound Design:
                </span>
                <span className="font-bold text-purple-400">
                  {summary.deepDiveAverages.soundDesign ? `${summary.deepDiveAverages.soundDesign} / 5` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-teal-400" /> Netcode / Stability:
                </span>
                <span className="font-bold text-teal-400">
                  {summary.deepDiveAverages.stabilityNetcode ? `${summary.deepDiveAverages.stabilityNetcode} / 5` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── User Action & Review Composer CTA Bar ──────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#090C11] border border-[#21262D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white block">
              {userStatus?.hasReviewed ? 'Your Verified Review is Published' : 'Have you played this title?'}
            </span>
            <span className="text-[11px] text-neutral-400 font-sans block">
              {userStatus?.isOwner
                ? `Logged Playtime: ${(userStatus.playTimeSeconds / 3600).toFixed(1)} hrs on record.`
                : 'Share your hardware telemetry, ratings, and gameplay breakdown with the community.'}
            </span>
          </div>
        </div>

        {/* CTA Button based on ownership & auth */}
        {isAuthenticated ? (
          userStatus?.isOwner ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              {userStatus.hasReviewed ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Your Review</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Rate &amp; Review Game</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Purchase game to submit review</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Sign in to write review</span>
          </div>
        )}
      </div>

      {/* ── Community Utility: Sorting Filter Tabs ───────────────────────────── */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span>Sort Community Reviews:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-[#070A0F] p-1 rounded-xl border border-[#21262D]">
            {[
              { id: 'helpful', label: '🔥 Most Helpful' },
              { id: 'recent', label: '🕒 Most Recent' },
              { id: 'highest', label: '⭐ Highest Rated' },
              { id: 'lowest', label: '⚠️ Lowest Rated' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSortBy(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  sortBy === tab.id
                    ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(147,51,234,0.3)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Individual Reviews Stream ────────────────────────────────────────── */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev: GameReviewItem) => {
            const ratingMeta = RATING_LABELS[rev.overallRating] || RATING_LABELS[3];
            const playtimeHours = (rev.playtimeAtReview / 3600).toFixed(1);
            const isOwnReview = user?.id === rev.userId;

            return (
              <div
                key={rev.id}
                className={`p-5 rounded-xl bg-[#06080C] border transition-all ${
                  isOwnReview
                    ? 'border-purple-500/40 shadow-[0_0_20px_rgba(147,51,234,0.1)]'
                    : 'border-[#21262D] hover:border-[#30363D]'
                }`}
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A202C] pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar Placeholder */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white uppercase">
                      {rev.user.username.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-white">
                          @{rev.user.username}
                        </span>
                        {rev.isVerifiedOwner && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold uppercase">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verified Owner
                          </span>
                        )}
                        {isOwnReview && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#8B949E]">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{playtimeHours} hrs at review time</span>
                        <span>&bull;</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
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

                {/* Optional Headline */}
                {rev.headline && (
                  <h3 className="text-sm font-mono font-bold text-white mb-2">
                    "{rev.headline}"
                  </h3>
                )}

                {/* Review Content */}
                <p className="text-xs sm:text-sm text-[#C9D1D9] leading-relaxed whitespace-pre-wrap mb-4">
                  {rev.content}
                </p>

                {/* Deep-Dive Sub-Scores Chips (if any) */}
                {(rev.optimization || rev.funFactor || rev.soundDesign || rev.visuals || rev.stabilityNetcode) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#161B22] text-[10px] font-mono mb-3">
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

                {/* ── Community Utility: Helpful Voting Footer ──────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#161B22] text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-400 font-sans">
                      Was this review helpful to you?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVote(rev.id, true)}
                      disabled={isOwnReview}
                      title={isOwnReview ? 'Community Rule: You cannot vote on your own review' : 'Vote Helpful'}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                        rev.userVote === true
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-bold'
                          : 'bg-[#12161F] text-neutral-400 hover:text-white border-[#21262D] hover:border-emerald-500/40'
                      } ${isOwnReview ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Yes ({rev.helpfulCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote(rev.id, false)}
                      disabled={isOwnReview}
                      title={isOwnReview ? 'Community Rule: You cannot vote on your own review' : 'Vote Unhelpful'}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                        rev.userVote === false
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)] font-bold'
                          : 'bg-[#12161F] text-neutral-400 hover:text-white border-[#21262D] hover:border-rose-500/40'
                      } ${isOwnReview ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>No ({rev.unhelpfulCount})</span>
                    </button>
                  </div>

                  {/* Social proof note */}
                  {rev.helpfulCount > 0 && (
                    <span className="text-[11px] text-emerald-400/90 font-mono">
                      ✓ {rev.helpfulCount} {rev.helpfulCount === 1 ? 'person' : 'people'} found this review helpful
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="p-10 rounded-xl bg-[#070A0F] border border-[#21262D] text-center space-y-3">
            <Terminal className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-300">
              No Verified Player Telemetry Logged
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Be the first verified owner to benchmark this title, rate the optimization and fun factor, and log your telemetry feedback.
            </p>
          </div>
        )}
      </div>

      {/* ── Review Composition Modal ────────────────────────────────────────── */}
      <GameReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gameId={gameId}
        gameTitle={gameTitle}
        existingReview={userStatus?.userReview}
        playtimeSeconds={userStatus?.playTimeSeconds || 0}
        onReviewSubmitted={fetchReviews}
      />
    </section>
  );
}
