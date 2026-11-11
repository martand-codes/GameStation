import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Gamepad2, Users, ChevronUp, ChevronDown, Clock, Star, Flame, Sparkles, X } from 'lucide-react';
import { useSocket, type ActivityFeedItem } from '../../Context/SocketContext';
import { useAuth } from '../../Context/AuthContext';
import { Link } from 'react-router-dom';

export default function LiveActivityTicker() {
  const { user } = useAuth();
  const { isConnected, activeSessions, recentActivities } = useSocket();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const isElevated = user?.role === 'OWNER' || user?.role === 'ADMIN';

  // Privacy Rule: Detailed Flight Telemetry & Player Roster is strictly for Sovereign Owner and Admin
  if (!isElevated) {
    return null;
  }

  // Rotate ticker every 5 seconds if there are activities
  useEffect(() => {
    if (recentActivities.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % recentActivities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [recentActivities.length]);

  const currentActivity: ActivityFeedItem | undefined = recentActivities[currentIdx] || recentActivities[0];

  const formatTimeAgo = (isoString: string) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <>
      {/* ── Fixed Bottom Ticker Dock ────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#07090E]/95 backdrop-blur-md border-t border-emerald-500/20 px-4 py-2 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.8)] select-none">
        {/* Left: Engine Status & CCU Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-white/5 font-mono text-[11px]">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
            <span className="hidden sm:inline text-neutral-400 font-bold uppercase tracking-wider">LIVE ENGINE</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
            <span>{activeSessions.length} In-Game</span>
          </div>
        </div>

        {/* Center: Live Rolling Event Ticker */}
        <div className="flex-1 mx-4 max-w-2xl overflow-hidden h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentActivity ? (
              <motion.div
                key={currentActivity.id || currentIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-xs font-mono truncate text-neutral-300"
              >
                {currentActivity.type === 'GAME_LAUNCH' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Gamepad2 className="w-3.5 h-3.5" /> Launch:
                  </span>
                )}
                {currentActivity.type === 'GAME_STOP' && (
                  <span className="text-neutral-400 flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5" /> Finished:
                  </span>
                )}
                {currentActivity.type === 'REVIEW_POSTED' && (
                  <span className="text-amber-400 flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> Review:
                  </span>
                )}

                <span className="text-white font-bold">@{currentActivity.username}</span>
                <span className="text-neutral-400 truncate font-sans">
                  {currentActivity.type === 'GAME_LAUNCH' && `is now playing ${currentActivity.gameTitle}`}
                  {currentActivity.type === 'GAME_STOP' && `exited ${currentActivity.gameTitle}`}
                  {currentActivity.type === 'REVIEW_POSTED' && `reviewed ${currentActivity.gameTitle} (${currentActivity.details || 'Verified'})`}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                  • {formatTimeAgo(currentActivity.timestamp)}
                </span>
              </motion.div>
            ) : (
              <span className="text-xs font-mono text-neutral-500">
                Listening for real-time player telemetry across GameStation...
              </span>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Expand Roster Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Live Roster</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Expanded Live Roster Modal / Drawer ─────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-14 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0B0E14] border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Active Player Sessions ({activeSessions.length})
                </h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="p-3 max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
              {activeSessions.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 font-mono text-xs">
                  <Gamepad2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                  <p>No players are in-game right now.</p>
                  <p className="text-[10px] text-neutral-600 mt-1">
                    Launch a title from your library to lead the leaderboard!
                  </p>
                </div>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session.socketId}
                    className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-3 hover:border-emerald-500/30 transition-colors"
                  >
                    {/* Game Avatar / Cover */}
                    {session.coverImageUrl ? (
                      <img
                        src={session.coverImageUrl}
                        alt={session.gameTitle}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">
                          @{session.username}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          IN-GAME
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate font-mono mt-0.5">
                        {session.gameTitle}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

