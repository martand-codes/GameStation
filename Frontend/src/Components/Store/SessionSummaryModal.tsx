import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  X,
  ArrowRight,
  Flame,
  Star,
  Gamepad2,
  ShieldCheck,
} from 'lucide-react';
import { useGameSession } from '../../Context/GameSessionContext';

export default function SessionSummaryModal() {
  const navigate = useNavigate();
  const { sessionSummary, clearSessionSummary } = useGameSession();

  if (!sessionSummary) return null;

  const sessionMinutes = Math.floor(sessionSummary.sessionSeconds / 60);
  const sessionSecondsRemainder = sessionSummary.sessionSeconds % 60;
  const totalHours = (sessionSummary.totalPlaytimeSeconds / 3600).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="bg-[#0D1117] border border-cyan-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.25)] relative">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-cyan-950/80 via-[#0E172E] to-black border-b border-cyan-500/30 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                Session Flight Recorder
              </span>
              <h2 className="text-base font-black text-white uppercase tracking-tight">
                {sessionSummary.title}
              </h2>
            </div>
          </div>

          <button
            onClick={clearSessionSummary}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/60 border border-neutral-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                Session Duration
              </span>
              <p className="text-xl font-black text-cyan-300">
                +{sessionMinutes}m {sessionSecondsRemainder}s
              </p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Synced to PostgreSQL
              </span>
            </div>

            <div className="bg-black/60 border border-neutral-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                Total on Record
              </span>
              <p className="text-xl font-black text-white">
                {totalHours} Hours
              </p>
              <span className="text-[10px] text-neutral-400">
                Verified Playtime
              </span>
            </div>
          </div>

          {/* Verified Review Eligibility Status */}
          {sessionSummary.canReview ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
                <Star className="w-5 h-5 fill-emerald-400 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Verified Reviewer Status Active
                </h3>
                <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                  You have logged sufficient playtime to author a <span className="text-emerald-400 font-bold">Verified Steam-Style Review</span> with your official hours badge.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Reviewer Requirement
                </h3>
                <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                  Play at least 10 minutes (current: {sessionMinutes}m) to unlock the official Verified Review badge for this title.
                </p>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
            <button
              onClick={clearSessionSummary}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              DISMISS
            </button>

            {sessionSummary.canReview ? (
              <button
                onClick={() => {
                  clearSessionSummary();
                  navigate(`/store/games/${sessionSummary.gameId}`);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <span>Write Verified Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={clearSessionSummary}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

