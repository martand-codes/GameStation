import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Cpu,
  KeyRound,
  Shield,
  Flame,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  FileKey,
} from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';
import {
  getSecurityChallengeAPI,
  verifySecurityChallengeAPI,
  breakGlassOverrideAPI,
} from '../../../Services/Governance.service';

interface SovereignGreeterGateProps {
  onUnlocked: () => void;
}

export default function SovereignGreeterGate({ onUnlocked }: SovereignGreeterGateProps) {
  const { user } = useAuth();

  // Challenge state
  const [challenge, setChallenge] = useState<{
    questionIndex: number;
    question: string;
    totalQuestions: number;
  } | null>(null);

  const [answerInput, setAnswerInput] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [loading, setLoading] = useState(false);
  const [fetchingChallenge, setFetchingChallenge] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');

  // Break-glass seed fallback mode
  const [isBreakGlassMode, setIsBreakGlassMode] = useState(false);
  const [seedInput, setSeedInput] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17 && hour < 22) setGreeting('Good evening');
    else setGreeting('Working late');

    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    try {
      setFetchingChallenge(true);
      setError(null);
      const data = await getSecurityChallengeAPI();
      setChallenge(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to establish connection with security enclave.');
    } finally {
      setFetchingChallenge(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBreakGlassMode) {
      handleBreakGlass();
      return;
    }

    if (!answerInput.trim()) {
      setError('Challenge response cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await verifySecurityChallengeAPI({
        questionIndex: challenge?.questionIndex || 1,
        answer: answerInput,
      });

      setIsSuccess(true);
      sessionStorage.setItem('gamestation_sovereign_session_cleared', 'true');
      setTimeout(() => {
        onUnlocked();
      }, 750);
    } catch (err: any) {
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      if (nextAttempts <= 0) {
        setError('Zero attempts remaining. Gate locked. Use Danger Zone Break-Glass Seed Phrase below.');
      } else {
        setError(err.response?.data?.message || `Incorrect answer. ${nextAttempts} attempt(s) remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBreakGlass = async () => {
    if (!seedInput.trim()) {
      setError('Please enter your 12-word cryptographic recovery seed phrase.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await breakGlassOverrideAPI(seedInput);

      setIsSuccess(true);
      sessionStorage.setItem('gamestation_sovereign_session_cleared', 'true');
      setTimeout(() => {
        onUnlocked();
      }, 750);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Emergency Break-Glass failed: Invalid seed phrase.');
    } finally {
      setLoading(false);
    }
  };

  // Ambient floating background elements
  const floatingObjects = [
    { icon: Gamepad2, size: 68, top: '8%', left: '6%', duration: 13, delay: 0, rot: 25 },
    { icon: Cpu, size: 48, top: '16%', right: '8%', duration: 15, delay: 1, rot: -20 },
    { icon: Shield, size: 56, bottom: '12%', left: '7%', duration: 12, delay: 2, rot: 15 },
    { icon: Gamepad2, size: 76, bottom: '15%', right: '7%', duration: 16, delay: 0.5, rot: -30 },
    { icon: KeyRound, size: 44, top: '46%', left: '4%', duration: 11, delay: 3, rot: 45 },
    { icon: Flame, size: 48, top: '42%', right: '5%', duration: 14, delay: 1.5, rot: -15 },
    { icon: Gamepad2, size: 52, top: '5%', left: '46%', duration: 18, delay: 2.5, rot: 10 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#060609] select-none font-sans overflow-y-auto">
      {/* ── 1. AMBIENT MOVING GAMEPADS & CYBER ARTIFACTS IN BACKGROUND ──────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingObjects.map((item, idx) => (
          <motion.div
            key={idx}
            className="absolute text-red-500/12"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
            animate={{
              y: [-22, 26, -22],
              x: [-18, 20, -18],
              rotate: [0, item.rot, -item.rot, 0],
              scale: [1, 1.08, 0.94, 1],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
          >
            <item.icon
              style={{ width: item.size, height: item.size }}
              className="drop-shadow-[0_0_20px_rgba(255,30,39,0.22)]"
            />
          </motion.div>
        ))}

        {/* Ambient Pulsing Radial Glows */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-red-600/15 blur-[160px] rounded-full"
        />

        {/* Cyber Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ── 2. EXPANDED COMMAND-DECK CARD (max-w-3xl) ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-3xl rounded-3xl border border-white/[0.08] bg-[#0c0c14]/95 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-7 z-10 my-auto"
        style={{
          boxShadow: '0 0 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Top Header Strip */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF1E27] shadow-[0_0_15px_rgba(255,30,39,0.35)] shrink-0">
              <Flame className="w-5 h-5 text-[#FF1E27]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-black tracking-widest uppercase text-white">
                  GAMESTATION GOVERNANCE
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold hidden sm:inline">
                  // ROOT_SYS_0
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 block">
                Direct Sovereign Authority &amp; Security Clearance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#FF1E27] animate-pulse" />
            <span>Air-Gapped Level-0</span>
          </div>
        </div>

        {/* Personalized Executive Greeter Banner */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#FF1E27] tracking-wider uppercase">
              {greeting}, Chief @{user?.username || 'Owner'}
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-[11px] font-mono text-zinc-400">
              Sovereign Clearance Gate
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Authorize Yourself, Chief!
          </h1>
        </div>

        {/* ── 3. CHALLENGE CARD DISPLAY ───────────────────────────────────── */}
        {!isBreakGlassMode ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#12121a] border border-white/[0.07] space-y-3 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.05] pb-3">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                <Shield className="w-4 h-4 text-[#FF1E27]" />
                <span className="text-white font-bold tracking-wider uppercase">
                  ROTATING VECTOR 0{challenge?.questionIndex || 1} OF 03
                </span>
              </div>

              {/* Attempt Counter Meter */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-zinc-500 text-[11px]">Attempts:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((num) => (
                    <span
                      key={num}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        num <= attemptsLeft
                          ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]'
                          : 'bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div className="pt-1">
              <span className="text-[10px] font-mono text-[#FF1E27] font-bold uppercase tracking-widest block mb-1">
                Personal Challenge Question:
              </span>
              <p className="text-base sm:text-lg font-mono text-zinc-100 font-bold tracking-tight">
                {fetchingChallenge ? (
                  <span className="text-zinc-500 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FF1E27]" />
                    Drawing random cryptographic challenge vector...
                  </span>
                ) : (
                  `"${challenge?.question || 'When will Kalyuga End?'}"`
                )}
              </p>
            </div>
          </div>
        ) : (
          /* Break-Glass Seed Phrase Notice */
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone // Offline Seed Phrase Verification</span>
            </div>
            <p className="text-xs text-amber-200/80 font-sans leading-relaxed">
              This protocol uses your physical 12-word cryptographic seed phrase minted during root Genesis. It permanently bypasses forgotten questions and unlocks the enclave.
            </p>
          </div>
        )}

        {/* ── 4. RESPONSE FORM ────────────────────────────────────────────── */}
        <form onSubmit={handleVerify} className="space-y-5">
          {!isBreakGlassMode ? (
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-300 font-semibold uppercase tracking-wider block">
                Your Challenge Response
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound className="w-5 h-5 text-[#FF1E27]" />
                </div>
                <input
                  type="text"
                  autoFocus
                  disabled={loading || isSuccess || attemptsLeft <= 0}
                  value={answerInput}
                  onChange={(e) => {
                    setAnswerInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your secret response..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#14141e] border border-white/[0.08] focus:border-red-500/60 focus:bg-[#161622] text-base font-mono text-white placeholder-zinc-600 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>12-Word Recovery Seed Phrase</span>
                <span className="text-[10px] font-mono text-amber-500/80">Space-separated 12 words</span>
              </label>

              <div className="relative">
                <div className="absolute top-3.5 left-4 pointer-events-none text-amber-400">
                  <FileKey className="w-5 h-5" />
                </div>
                <textarea
                  rows={2}
                  autoFocus
                  disabled={loading || isSuccess}
                  value={seedInput}
                  onChange={(e) => {
                    setSeedInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="alpha apex aurora beacon blade breeze canvas cascade cipher comet crystal delta..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#14141e] border border-amber-500/30 focus:border-amber-400 focus:bg-[#161622] text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Inline Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-xs font-mono text-red-300"
              >
                <AlertCircle className="w-4 h-4 text-[#FF1E27] shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Action Button */}
          <div className="space-y-3 pt-1">
            <button
              type="submit"
              disabled={loading || isSuccess || (!isBreakGlassMode && attemptsLeft <= 0)}
              className={`w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-3 shadow-xl cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                  : 'bg-[#FF1E27] hover:bg-[#E0151E] text-white shadow-[0_0_25px_rgba(255,30,39,0.35)] active:scale-[0.98]'
              }`}
            >
              {isSuccess ? (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Clearance Confirmed · Welcome, Chief!</span>
                </>
              ) : loading ? (
                <span>Verifying Cryptographic Vector...</span>
              ) : (
                <>
                  <span>
                    {isBreakGlassMode ? 'Execute Break-Glass Root Override' : 'Authorize Yourself, Chief!'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            {/* ── DANGER ZONE: EMERGENCY OVERRIDE BUTTON ── */}
            <div className="pt-2">
              {!isBreakGlassMode ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBreakGlassMode(true);
                      setError(null);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-amber-950/20 hover:bg-amber-950/35 border border-amber-500/30 hover:border-amber-500/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-xs font-bold text-amber-300 block uppercase tracking-wider">
                          Danger Zone // Emergency Break-Glass
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          Bypass challenge using your offline 12-word seed phrase
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                      Initiate Override &rarr;
                    </span>
                  </button>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={fetchChallenge}
                      className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Reroll another question vector"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reroll Vector</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsBreakGlassMode(false);
                    setError(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-mono text-zinc-400 hover:text-white bg-[#14141e] border border-white/[0.08] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>&larr; Cancel Break-Glass &amp; Return to Challenge Question</span>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* ── 5. BOTTOM SECURITY FOOTER ───────────────────────────────────── */}
        <div className="pt-4 border-t border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>PostgreSQL: 2ms</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>BIP-39 Armed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E27]" />
            <span>Password Bypassed</span>
          </span>
          <span className="flex items-center gap-1.5 text-right justify-end">
            <span>0 Breaches Logged</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
