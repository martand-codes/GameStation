import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Gamepad2,
  Volume2,
  Eye,
  Wifi,
  Send,
  X,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../Context/ToastContext';
import {
  submitReviewAPI,
  deleteReviewAPI,
  type GameReviewItem,
} from '../../Services/Review.service';

interface GameReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
  existingReview?: GameReviewItem | null;
  playtimeSeconds: number;
  onReviewSubmitted: () => void;
}

const RATING_DESCRIPTIONS = [
  { rating: 1, label: 'Unplayable / Broken', color: 'text-red-400', emoji: '💀' },
  { rating: 2, label: 'Needs Polish / Flawed', color: 'text-orange-400', emoji: '⚠️' },
  { rating: 3, label: 'Meh / Average', color: 'text-amber-400', emoji: '😐' },
  { rating: 4, label: 'Great / Recommended', color: 'text-teal-400', emoji: '👍' },
  { rating: 5, label: 'Masterpiece / Essential', color: 'text-emerald-400', emoji: '🌟' },
];

export default function GameReviewModal({
  isOpen,
  onClose,
  gameId,
  gameTitle,
  existingReview,
  playtimeSeconds,
  onReviewSubmitted,
}: GameReviewModalProps) {
  const toast = useToast();

  const [overallRating, setOverallRating] = useState<number>(existingReview?.overallRating || 4);
  const [headline, setHeadline] = useState<string>(existingReview?.headline || '');
  const [content, setContent] = useState<string>(existingReview?.content || '');
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState<boolean>(false);

  // Deep-Dive Sub-metrics
  const [optimization, setOptimization] = useState<number | null>(existingReview?.optimization || null);
  const [funFactor, setFunFactor] = useState<number | null>(existingReview?.funFactor || null);
  const [soundDesign, setSoundDesign] = useState<number | null>(existingReview?.soundDesign || null);
  const [visuals, setVisuals] = useState<number | null>(existingReview?.visuals || null);
  const [stabilityNetcode, setStabilityNetcode] = useState<number | null>(existingReview?.stabilityNetcode || null);

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (existingReview) {
      setOverallRating(existingReview.overallRating);
      setHeadline(existingReview.headline || '');
      setContent(existingReview.content);
      setOptimization(existingReview.optimization || null);
      setFunFactor(existingReview.funFactor || null);
      setSoundDesign(existingReview.soundDesign || null);
      setVisuals(existingReview.visuals || null);
      setStabilityNetcode(existingReview.stabilityNetcode || null);
      if (
        existingReview.optimization ||
        existingReview.funFactor ||
        existingReview.soundDesign ||
        existingReview.visuals ||
        existingReview.stabilityNetcode
      ) {
        setIsDeepDiveOpen(true);
      }
    }
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  const currentDesc = RATING_DESCRIPTIONS.find((d) => d.rating === (hoverRating || overallRating)) || RATING_DESCRIPTIONS[2];
  const playtimeHours = (playtimeSeconds / 3600).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.warning('Please enter your review writeup.');
      return;
    }

    try {
      setSubmitting(true);
      await submitReviewAPI({
        gameId,
        overallRating,
        headline: headline.trim() || undefined,
        content: content.trim(),
        optimization: optimization || undefined,
        funFactor: funFactor || undefined,
        soundDesign: soundDesign || undefined,
        visuals: visuals || undefined,
        stabilityNetcode: stabilityNetcode || undefined,
      });

      toast.success(`Verified review for "${gameTitle}" published!`);
      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    try {
      setDeleting(true);
      await deleteReviewAPI(existingReview.id);
      toast.info('Your review has been removed.');
      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove review.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[#0B0E14] border border-[#21262D] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#21262D] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Player Telemetry
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Owner
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              {existingReview ? 'Update Your Review' : `Review "${gameTitle}"`}
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{playtimeHours} hrs logged on record</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white bg-[#161B22] hover:bg-[#21262D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── 1. Pop-Up Overall 5-Star Rating (Meh to Masterpiece) ── */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#12161F] border border-[#21262D] space-y-3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
              1. Overall Experience Rating (1 - 5 Stars) *
            </label>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Star Selector */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || overallRating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setOverallRating(star)}
                      className="p-1 rounded transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                            : 'text-neutral-600 hover:text-neutral-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Semantic Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 font-mono text-xs">
                <span>{currentDesc.emoji}</span>
                <span className={`font-bold ${currentDesc.color}`}>
                  {currentDesc.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── 2. Deep Dive Sub-Metrics Accordion ── */}
          <div className="rounded-xl border border-[#21262D] bg-[#12161F] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-mono font-bold uppercase tracking-wider text-neutral-200 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Deep-Dive Technical Matrix (Optional)</span>
                <span className="text-[10px] font-sans text-neutral-400 font-normal lowercase">
                  (optimization, sound, fun, connectivity)
                </span>
              </div>
              {isDeepDiveOpen ? (
                <ChevronUp className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            <AnimatePresence>
              {isDeepDiveOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-5 pt-1 space-y-4 border-t border-[#21262D] bg-[#0E121A]"
                >
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Rate specific technical dimensions to help developers patch issues and inform players:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Optimization & Performance */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-300 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-blue-400" /> Optimization
                        </span>
                        <span className="text-blue-400 font-bold">
                          {optimization ? `${optimization}/5` : 'Skip'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setOptimization(optimization === val ? null : val)}
                            className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                              optimization === val
                                ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                                : 'bg-[#1C2128] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fun Factor & Core Gameplay */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-300 flex items-center gap-1.5">
                          <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> Fun Factor
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {funFactor ? `${funFactor}/5` : 'Skip'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setFunFactor(funFactor === val ? null : val)}
                            className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                              funFactor === val
                                ? 'bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                : 'bg-[#1C2128] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sound Design & Audio */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-300 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Sound Design
                        </span>
                        <span className="text-purple-400 font-bold">
                          {soundDesign ? `${soundDesign}/5` : 'Skip'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSoundDesign(soundDesign === val ? null : val)}
                            className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                              soundDesign === val
                                ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                                : 'bg-[#1C2128] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visuals & Art Style */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-400" /> Visuals & Art
                        </span>
                        <span className="text-amber-400 font-bold">
                          {visuals ? `${visuals}/5` : 'Skip'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setVisuals(visuals === val ? null : val)}
                            className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                              visuals === val
                                ? 'bg-amber-600 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                : 'bg-[#1C2128] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stability & Connectivity */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-black/30 border border-white/5 sm:col-span-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-300 flex items-center gap-1.5">
                          <Wifi className="w-3.5 h-3.5 text-teal-400" /> Stability & Netcode
                        </span>
                        <span className="text-teal-400 font-bold">
                          {stabilityNetcode ? `${stabilityNetcode}/5` : 'Skip'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setStabilityNetcode(stabilityNetcode === val ? null : val)}
                            className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                              stabilityNetcode === val
                                ? 'bg-teal-600 text-white shadow-[0_0_8px_rgba(20,184,166,0.4)]'
                                : 'bg-[#1C2128] text-neutral-400 hover:text-white'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── 3. Review Headline & Drop Box Content ── */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                2. Summary Headline (Optional)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Masterpiece combat loop with minor PC stutter..."
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl bg-[#12161F] border border-[#21262D] focus:border-purple-500/60 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="font-bold uppercase tracking-wider text-neutral-300">
                  3. Detailed Review Feedback *
                </label>
                <span className="text-neutral-500 text-[10px]">
                  {content.length} characters
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with the game, technical performance, gameplay nuances, and advice for other players..."
                className="w-full p-4 rounded-xl bg-[#12161F] border border-[#21262D] focus:border-purple-500/60 text-xs text-neutral-200 placeholder-neutral-500 leading-relaxed outline-none transition-all resize-y"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#21262D] flex items-center justify-between gap-3">
            {existingReview ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="px-3 py-2 rounded-xl text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Removing...' : 'Delete Review'}</span>
              </button>
            ) : (
              <span className="text-[11px] font-mono text-neutral-500">
                Snapshots your current {playtimeHours}h playtime
              </span>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#161B22] hover:bg-[#21262D] text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || deleting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(147,51,234,0.35)] cursor-pointer flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Publishing...' : existingReview ? 'Update Review' : 'Publish Review'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

