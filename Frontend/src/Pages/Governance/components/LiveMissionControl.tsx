import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Users, Flame, Gamepad2, Clock, Star, ShieldAlert, ArrowUpRight, ShieldCheck, MessageSquare } from 'lucide-react';
import { useSocket } from '../../../Context/SocketContext';
import { useNavigate } from 'react-router-dom';

export default function LiveMissionControl() {
  const navigate = useNavigate();
  const { isConnected, activeSessions, recentActivities } = useSocket();

  const formatTimeAgo = (isoString: string) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono select-none">
      {/* ── Left Panel: Live Concurrent Players Radar (5 Cols) ────────────────── */}
      <div className="lg:col-span-5 p-5 rounded-2xl bg-[#090C11] border border-red-500/20 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isConnected ? 'text-red-500 animate-pulse' : 'text-neutral-500'}`} />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Player Telemetry
              </h3>
            </div>
            <span className="text-[10px] text-red-400 font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 uppercase">
              {isConnected ? 'SOVEREIGN RADAR LIVE' : 'CONNECTING'}
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-3">
            <span className="text-4xl font-black text-white flex items-center gap-2">
              {activeSessions.length}
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-bounce" />
            </span>
            <span className="text-xs text-neutral-400">active players in-game</span>
          </div>
        </div>

        {/* Live Active Sessions List */}
        <div className="space-y-2 mt-2">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">
            Live Player Roster ({activeSessions.length})
          </span>

          <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {activeSessions.length === 0 ? (
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-neutral-500 text-xs">
                No active player sessions currently running.
              </div>
            ) : (
              activeSessions.map((session) => (
                <div
                  key={session.socketId}
                  className="p-2.5 rounded-xl bg-neutral-900/50 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        @{session.username}
                      </span>
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {session.gameTitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-neutral-500 mt-3">
          <span>WebSocket Stream</span>
          <span className="text-zinc-400">Zero Polling Overhead</span>
        </div>
      </div>

      {/* ── Right Panel: Real-Time Operations Flight Stream (7 Cols) ─────────── */}
      <div className="lg:col-span-7 p-5 rounded-2xl bg-[#090C11] border border-white/[0.08] shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Event Dispatch Stream
              </h3>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase">REAL-TIME BROADCAST</span>
          </div>

          <p className="text-[11px] text-neutral-400 font-sans mt-2">
            Instant event log of game executions, reviews, developer responses, and platform state changes.
          </p>
        </div>

        {/* Live Rolling Event Log */}
        <div className="my-4 max-h-56 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {recentActivities.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-xs">
              Awaiting real-time platform telemetry...
            </div>
          ) : (
            recentActivities.map((act) => {
              let icon = <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
              let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

              if (act.type === 'REVIEW_POSTED') {
                icon = <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />;
                badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
              } else if (act.type === 'STUDIO_REPLY') {
                icon = <MessageSquare className="w-3.5 h-3.5 text-purple-400" />;
                badgeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
              } else if (act.type === 'GAME_STOP') {
                icon = <Clock className="w-3.5 h-3.5 text-neutral-400" />;
                badgeColor = 'text-neutral-400 bg-neutral-800 border-neutral-700';
              }

              return (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-neutral-900/40 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg border shrink-0 ${badgeColor}`}>
                      {icon}
                    </div>
                    <div className="min-w-0 text-xs">
                      <div className="text-white truncate">
                        <span className="font-bold">@{act.username}</span>{' '}
                        <span className="text-neutral-400 font-sans">
                          {act.type === 'GAME_LAUNCH' && `launched ${act.gameTitle}`}
                          {act.type === 'GAME_STOP' && `closed session for ${act.gameTitle}`}
                          {act.type === 'REVIEW_POSTED' && `reviewed ${act.gameTitle} (${act.details})`}
                          {act.type === 'STUDIO_REPLY' && `responded on ${act.gameTitle}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-500 shrink-0">
                    {formatTimeAgo(act.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
          <span className="text-neutral-500">Live Buffer: {recentActivities.length} Events</span>
          <button
            onClick={() => navigate('/platform/governance/emergency')}
            className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-bold cursor-pointer"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Emergency Kill-Switch Console</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

