import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, Flame, ShieldAlert, Zap, Lock, RefreshCw, Radio, Megaphone, CheckCircle2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useToast } from '../../../Context/ToastContext';
import {
  getSystemKillswitchesAPI,
  toggleSystemKillswitchAPI,
  purgeAllSessionsAPI,
  getPublicBroadcastAPI,
  updateBroadcastAPI,
} from '../../../Services/Governance.service';

export default function EmergencyConsole() {
  const toast = useToast();
  const [killswitches, setKillswitches] = useState<{
    marketplaceFrozen: boolean;
    submissionsFrozen: boolean;
    maintenanceMode: boolean;
  }>({
    marketplaceFrozen: false,
    submissionsFrozen: false,
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);

  // Broadcast Dispatcher state
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('INFO');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSaved, setBroadcastSaved] = useState(false);

  useEffect(() => {
    fetchKillswitches();
    fetchBroadcast();
  }, []);

  const fetchBroadcast = async () => {
    try {
      const data = await getPublicBroadcastAPI();
      if (data) {
        setBroadcastActive(Boolean(data.broadcastActive));
        setBroadcastMessage(data.broadcastMessage || '');
        setBroadcastSeverity(data.broadcastSeverity || 'INFO');
      }
    } catch (e) {
      console.error('Failed to load broadcast status:', e);
    }
  };

  const fetchKillswitches = async () => {
    try {
      setLoading(true);
      const data = await getSystemKillswitchesAPI();
      setKillswitches(data);
    } catch (err) {
      console.error('Failed to load killswitches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (
    switchName: 'marketplaceFrozen' | 'submissionsFrozen' | 'maintenanceMode',
    currentState: boolean
  ) => {
    const actionLabel = !currentState ? 'ARM & ACTIVATE' : 'DISARM & DEACTIVATE';
    if (!confirm(`CONFIRM EMERGENCY DIRECTIVE:\n${actionLabel} the [${switchName}] killswitch?`)) {
      return;
    }

    try {
      const res = await toggleSystemKillswitchAPI({
        switchName,
        state: !currentState,
      });
      setKillswitches(res);
      toast.success(`Killswitch "${switchName}" toggled to [${!currentState ? 'ACTIVE' : 'INACTIVE'}].`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle killswitch');
    }
  };

  const handlePurgeSessions = async () => {
    if (
      !confirm(
        'GLOBAL SESSION PURGE PROTOCOL:\nImmediately invalidate and terminate all active refresh tokens and sessions for all players, developers, and administrators across GameStation?\n\n(Only your root owner session will remain active).'
      )
    ) {
      return;
    }

    try {
      setPurgeLoading(true);
      const res = await purgeAllSessionsAPI();
      toast.success(`SESSION PURGE EXECUTED: ${res.message}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to purge sessions');
    } finally {
      setPurgeLoading(false);
    }
  };

  const handleDispatchBroadcast = async () => {
    if (broadcastActive && !broadcastMessage.trim()) {
      toast.warning('Please input a broadcast announcement before arming platform transmission.');
      return;
    }

    try {
      setBroadcasting(true);
      await updateBroadcastAPI({
        active: broadcastActive,
        message: broadcastMessage,
        severity: broadcastSeverity,
      });
      setBroadcastSaved(true);
      toast.success('Platform broadcast dispatched successfully');
      setTimeout(() => setBroadcastSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch platform broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  const PRESET_BROADCASTS = [
    {
      label: 'Scheduled Maintenance',
      severity: 'WARNING' as const,
      text: 'SYSTEM ADVISORY: GameStation infrastructure undergoing maintenance in 15 minutes. Session saves recommended.',
    },
    {
      label: 'Zero-Day Patch',
      severity: 'CRITICAL' as const,
      text: 'CRITICAL ALERT: Mandatory security patch applied platform-wide. Please restart any active game instances.',
    },
    {
      label: 'Catalog Festival',
      severity: 'INFO' as const,
      text: 'PLATFORM INTEL: GameStation Sovereign Winter Festival is live! Explore featured community titles with exclusive discounts.',
    },
    {
      label: 'Payment Gateway Restored',
      severity: 'INFO' as const,
      text: 'PAYMENTS ONLINE: Stripe checkout gateway operations fully normalized across all currency channels.',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{
        background: '#0d0d12',
        border: '1px solid rgba(255, 30, 39, 0.25)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 36px -4px rgba(0, 0, 0, 0.65)',
      }}
    >
      {/* Header */}
      <div className="p-6 sm:p-7 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF1E27]">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              Sovereign Emergency Killswitches
              <span className="text-[10px] text-[#FF1E27] bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                ROOT CONTROL
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live circuit breakers to isolate platform breaches, financial freezes, and emergency maintenance
            </p>
          </div>
        </div>
        <button
          onClick={fetchKillswitches}
          className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#14141c] border border-white/[0.08] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of circuit breakers */}
      <div className="p-6 sm:p-7 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Switch 1: Marketplace Checkout Freeze */}
          <div
            className={`p-5 rounded-xl border transition-all duration-200 ${
              killswitches.marketplaceFrozen
                ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_20px_rgba(255,30,39,0.25)]'
                : 'bg-[#121218] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase text-zinc-200">
                Marketplace Freeze
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  killswitches.marketplaceFrozen
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {killswitches.marketplaceFrozen ? 'LOCKED' : 'NORMAL'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Disables all Stripe checkouts and wallet purchases storefront-wide during financial anomalies.
            </p>
            <button
              onClick={() => handleToggle('marketplaceFrozen', killswitches.marketplaceFrozen)}
              className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                killswitches.marketplaceFrozen
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30'
              }`}
            >
              {killswitches.marketplaceFrozen ? 'Disarm Freeze' : 'Arm Freeze (Lock)'}
            </button>
          </div>

          {/* Switch 2: Developer Submissions Freeze */}
          <div
            className={`p-5 rounded-xl border transition-all duration-200 ${
              killswitches.submissionsFrozen
                ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-[#121218] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase text-zinc-200">
                Submissions Lock
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  killswitches.submissionsFrozen
                    ? 'bg-amber-500 text-black font-black animate-pulse'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {killswitches.submissionsFrozen ? 'LOCKED' : 'NORMAL'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Prevents developers from publishing or updating game packages during security audits.
            </p>
            <button
              onClick={() => handleToggle('submissionsFrozen', killswitches.submissionsFrozen)}
              className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                killswitches.submissionsFrozen
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-black border border-amber-500/30'
              }`}
            >
              {killswitches.submissionsFrozen ? 'Unlock Submissions' : 'Lock Submissions'}
            </button>
          </div>

          {/* Switch 3: Global Maintenance Mode */}
          <div
            className={`p-5 rounded-xl border transition-all duration-200 ${
              killswitches.maintenanceMode
                ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_20px_rgba(255,30,39,0.25)]'
                : 'bg-[#121218] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase text-zinc-200">
                Maintenance Banner
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  killswitches.maintenanceMode
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {killswitches.maintenanceMode ? 'BROADCASTING' : 'OFF'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Broadcasts a persistent system alert notification across all active user sessions.
            </p>
            <button
              onClick={() => handleToggle('maintenanceMode', killswitches.maintenanceMode)}
              className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                killswitches.maintenanceMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30'
              }`}
            >
              {killswitches.maintenanceMode ? 'Disable Broadcast' : 'Enable Broadcast'}
            </button>
          </div>
        </div>

        {/* ── Sovereign Live Marquee Broadcast Dispatcher ──────────────── */}
        <div
          className="p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden space-y-5"
          style={{
            background:
              broadcastSeverity === 'CRITICAL'
                ? 'linear-gradient(135deg, rgba(255,30,39,0.08) 0%, rgba(13,13,18,0.98) 75%)'
                : broadcastSeverity === 'WARNING'
                ? 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(13,13,18,0.98) 75%)'
                : 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(13,13,18,0.98) 75%)',
            borderColor:
              broadcastSeverity === 'CRITICAL'
                ? 'rgba(255,30,39,0.35)'
                : broadcastSeverity === 'WARNING'
                ? 'rgba(245,158,11,0.35)'
                : 'rgba(16,185,129,0.35)',
          }}
        >
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                  broadcastSeverity === 'CRITICAL'
                    ? 'bg-red-500/10 border-red-500/30 text-[#FF1E27]'
                    : broadcastSeverity === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                <Radio className={`w-5 h-5 ${broadcastActive ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>Sovereign Broadcast Dispatcher</span>
                  <span
                    className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                      broadcastActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-500 border border-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        broadcastActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'
                      }`}
                    />
                    {broadcastActive ? 'LIVE ON AIR' : 'STANDBY // OFF AIR'}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Transmit an emergency or informational marquee ticker broadcasted live across the Storefront
                </p>
              </div>
            </div>

            {/* Live Toggle Pill */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBroadcastActive(!broadcastActive)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  broadcastActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'bg-[#14141c] text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {broadcastActive ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Armed (Active)</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Silenced (Muted)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Severity & Quick Templates */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Severity Level:
              </span>
              <div className="flex items-center gap-2">
                {(['INFO', 'WARNING', 'CRITICAL'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setBroadcastSeverity(lvl)}
                    className={`py-1 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      broadcastSeverity === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(255,30,39,0.4)]'
                          : lvl === 'WARNING'
                          ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-[#14141c] text-zinc-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Templates Pill list */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase mr-1">Presets:</span>
              {PRESET_BROADCASTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setBroadcastMessage(preset.text);
                    setBroadcastSeverity(preset.severity);
                  }}
                  className="py-1 px-2.5 rounded-lg text-[10px] font-mono text-zinc-300 hover:text-white bg-[#14141c] hover:bg-[#1c1c28] border border-white/[0.06] transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Announcement Message (Max 160 Characters):</span>
              <span className={broadcastMessage.length > 150 ? 'text-amber-400 font-bold' : ''}>
                {broadcastMessage.length}/160
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={160}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="e.g. SYSTEM ADVISORY: Server maintenance scheduled for 02:00 UTC. Save your progress..."
              className="w-full bg-[#121218] border border-white/[0.08] focus:border-[#FF1E27] rounded-xl p-3 text-xs text-white outline-none resize-none font-mono leading-relaxed placeholder:text-zinc-600"
            />
          </div>

          {/* Live Preview Strip */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Storefront Marquee Ticker Preview:
            </span>
            <div
              className={`p-3 rounded-xl border font-mono text-xs overflow-hidden flex items-center gap-3 ${
                broadcastSeverity === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-500/40 text-red-200'
                  : broadcastSeverity === 'WARNING'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  broadcastActive
                    ? broadcastSeverity === 'CRITICAL'
                      ? 'bg-red-500 animate-ping'
                      : broadcastSeverity === 'WARNING'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-emerald-400 animate-ping'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="font-black uppercase tracking-wider shrink-0 text-[11px]">
                {broadcastSeverity === 'CRITICAL'
                  ? 'CRITICAL ALERT // '
                  : broadcastSeverity === 'WARNING'
                  ? 'ADVISORY // '
                  : 'BROADCAST // '}
              </span>
              <span className="truncate text-zinc-300">
                {broadcastMessage || '(Type a message above or pick a preset to preview)'}
              </span>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-zinc-400 shrink-0 hidden sm:inline">
                SOVEREIGN MARQUEE
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={handleDispatchBroadcast}
              disabled={broadcasting}
              className={`py-2.5 px-6 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                broadcastSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FF1E27] hover:bg-[#E0151E] text-white shadow-[0_0_20px_rgba(255,30,39,0.35)]'
              }`}
            >
              {broadcastSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Broadcast Dispatched</span>
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  <span>{broadcasting ? 'Deploying...' : 'Deploy Broadcast Platform-Wide'}</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-[#141012] border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-red-400 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF1E27]" />
              <span>Nuclear Option: Global Session Revocation</span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instantly terminates all active desktop and mobile sessions system-wide. Forces every user,
              developer, and reviewer to re-authenticate.
            </p>
          </div>
          <button
            onClick={handlePurgeSessions}
            disabled={purgeLoading}
            className="py-2.5 px-5 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(255,30,39,0.4)] cursor-pointer active:scale-95 shrink-0 disabled:opacity-50"
          >
            {purgeLoading ? 'Purging Sessions...' : 'Purge All Sessions'}
          </button>
        </div>
      </div>
    </motion.section>
  );
}

