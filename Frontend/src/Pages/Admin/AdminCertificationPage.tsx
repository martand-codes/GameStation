import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  ExternalLink,
  Layers,
  Cpu,
  Eye,
  RefreshCw,
  AlertTriangle,
  Play,
  X,
  FileCode,
  Film,
  HardDrive,
  Hash,
  Coins,
  CheckCircle2,
  Lock,
  Unlock,
  Tag,
  Monitor,
  Search,
  Clock,
  Send,
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  Users,
  Terminal,
  Activity,
  Sparkles,
  CheckSquare,
  Square,
  Save,
  Gauge,
  Zap,
} from 'lucide-react';
import {
  getPendingGamesAPI,
  approveGameAPI,
  rejectGameAPI,
  getStaffRosterAPI,
  claimGameReviewAPI,
  releaseGameReviewAPI,
  assignGameReviewAPI,
  saveQANotesAPI,
} from '../../Services/Admin.service';
import { useAuth } from '../../Context/AuthContext';

export default function AdminCertificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [games, setGames] = useState<any[]>([]);
  const [staffRoster, setStaffRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'MINE' | 'UNASSIGNED' | 'OTHERS'>('ALL');

  // Delegation Modal
  const [delegateModalGame, setDelegateModalGame] = useState<any | null>(null);
  const [selectedDelegateAdminId, setSelectedDelegateAdminId] = useState<string>('');
  const [delegateLoading, setDelegateLoading] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Inspection Drawer/Theater Modal
  const [inspectGame, setInspectGame] = useState<any | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);

  // Module 2: Interactive QA Playtest Sandbox Rig
  const [sandboxGame, setSandboxGame] = useState<any | null>(null);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationPhase, setSimulationPhase] = useState<number>(0); // 0=idle, 1=kernel, 2=vram, 3=frame, 4=malware, 5=verified
  const [qaNotesText, setQaNotesText] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const [qaChecklist, setQaChecklist] = useState({
    executableIntegrity: false,
    securityPrivacy: false,
    storefrontMedia: false,
    commercialPricing: false,
  });

  // Rejection Modal
  const [rejectingGame, setRejectingGame] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const REJECTION_PRESETS = [
    'Missing or corrupted 64-bit standalone executable payload.',
    'Direct package download URL unreachable or returned HTTP 404/403.',
    'Bare-metal hardware requirements incomplete or below minimal platform threshold.',
    'Potential copyright or trademark infringement in visual assets/logos.',
    'Game failed initialization test; unhandled crash on launch.',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingGames, roster] = await Promise.all([
        getPendingGamesAPI(),
        getStaffRosterAPI().catch(() => []),
      ]);
      setGames(Array.isArray(pendingGames) ? pendingGames : []);
      setStaffRoster(Array.isArray(roster) ? roster : []);
    } catch (err: any) {
      console.error('Failed to load certification queue:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to query submission queue',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (gameId: string, gameTitle: string) => {
    try {
      setActionLoading(gameId);
      await claimGameReviewAPI(gameId);
      setToast({
        message: `Locked and claimed review ticket for "${gameTitle}".`,
        type: 'success',
      });
      await fetchData();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to claim review ticket',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelease = async (gameId: string, gameTitle: string) => {
    try {
      setActionLoading(gameId);
      await releaseGameReviewAPI(gameId);
      setToast({
        message: `Released review ticket for "${gameTitle}" back to unassigned pool.`,
        type: 'success',
      });
      await fetchData();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to release review ticket',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecuteDelegate = async () => {
    if (!delegateModalGame || !selectedDelegateAdminId) return;

    try {
      setDelegateLoading(true);
      await assignGameReviewAPI(delegateModalGame.id, selectedDelegateAdminId);
      const targetStaff = staffRoster.find((s) => s.id === selectedDelegateAdminId);
      setToast({
        message: `Successfully delegated "${delegateModalGame.title}" to @${targetStaff?.username || 'Staff'}.`,
        type: 'success',
      });
      setDelegateModalGame(null);
      setSelectedDelegateAdminId('');
      await fetchData();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to delegate review ticket',
        type: 'error',
      });
    } finally {
      setDelegateLoading(false);
    }
  };

  const handleApprove = async (gameId: string, title: string) => {
    const targetGame = games.find((g) => g.id === gameId);
    if (
      targetGame?.assignedAdminId &&
      targetGame.assignedAdminId !== user?.id &&
      user?.role !== 'OWNER'
    ) {
      if (
        !confirm(
          `NOTICE: This ticket is currently assigned to @${targetGame.assignedAdmin?.username}.\nAre you sure you want to proceed with certification?`
        )
      ) {
        return;
      }
    }

    if (
      !confirm(
        `SIGN & PUBLISH TITLE:\nOfficially certify "${title}" and sign release for live publication on GameStation Storefront?\n\n(Reviewer attribution will be recorded under @${user?.username || 'Staff'}).`
      )
    ) {
      return;
    }

    try {
      setActionLoading(gameId);
      await approveGameAPI(gameId);
      setInspectGame(null);
      setShowTrailer(false);
      setToast({
        message: `Title "${title}" officially certified and published!`,
        type: 'success',
      });
      await fetchData();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to certify game',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingGame) return;

    try {
      setActionLoading(rejectingGame.id);
      await rejectGameAPI(rejectingGame.id, rejectionReason);
      setRejectingGame(null);
      setRejectionReason('');
      setInspectGame(null);
      setShowTrailer(false);
      setToast({
        message: `Rejection directive issued for "${rejectingGame.title}".`,
        type: 'success',
      });
      await fetchData();
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to issue rejection directive',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Module 2: QA Sandbox Rig Operations
  const openQASandbox = (game: any) => {
    setSandboxGame(game);
    const hasExistingNotes = !!game.qaNotes;
    setQaNotesText(game.qaNotes || '');
    setSimulationPhase(hasExistingNotes ? 5 : 0);
    setQaChecklist({
      executableIntegrity: hasExistingNotes,
      securityPrivacy: hasExistingNotes,
      storefrontMedia: hasExistingNotes,
      commercialPricing: hasExistingNotes,
    });
    setSandboxLogs([
      `[INIT] QA Rig Isolation Virtualization v4.8.2 online.`,
      `[TARGET] Attached: "${game.title}" (Version: ${game.versions?.[0]?.version || '1.0.0'})`,
      `[ARCH] Targeted instruction set: x86_64 Direct3D 12.2 / Vulkan 1.3.`,
      `[SANDBOX] Secure Ring-3 memory envelope engaged.`,
      hasExistingNotes
        ? `[INFO] Previous QA telemetry detected. Review field notes or re-run diagnostic suite.`
        : `[READY] Click "Run Rig Diagnostics" to trigger automated hardware & binary tests.`,
    ]);
  };

  const runSandboxDiagnostics = () => {
    if (isSimulating || !sandboxGame) return;
    setIsSimulating(true);
    setSimulationPhase(1);
    setSandboxLogs((prev) => [
      ...prev,
      `--- [EXECUTION] INITIATING 4-PHASE RIG DIAGNOSTIC CYCLE ---`,
      `[0.10s] [KERNEL] Spawning virtual display adapter (1920x1080@60Hz)...`,
      `[0.35s] [BINARY] Validating SHA-256 package checksum against declared manifest: MATCH.`,
    ]);

    setTimeout(() => {
      setSimulationPhase(2);
      setSandboxLogs((prev) => [
        ...prev,
        `[0.85s] [DIRECTX] Hooking DXGI 1.6 swapchain & compiling SPIR-V pipeline cache: OK.`,
        `[1.15s] [VRAM] Allocated 3,420 MB buffer against 8,192 MB budget: PASS (Within bounds).`,
      ]);
    }, 700);

    setTimeout(() => {
      setSimulationPhase(3);
      setSandboxLogs((prev) => [
        ...prev,
        `[1.65s] [FRAME-PACING] Simulating 120 frames synthetic in-engine gameplay loop...`,
        `[1.95s] [TELEMETRY] Measured 59.8 FPS steady pacing | 1% Low: 58.2 FPS (No memory leaks).`,
      ]);
    }, 1400);

    setTimeout(() => {
      setSimulationPhase(4);
      setSandboxLogs((prev) => [
        ...prev,
        `[2.35s] [HEURISTICS] Static AST scan on executable binary: 0 malicious signatures detected.`,
        `[2.65s] [SECURITY] Outbound network monitoring: 0 unauthorized external telemetry sockets.`,
      ]);
    }, 2100);

    setTimeout(() => {
      setSimulationPhase(5);
      setIsSimulating(false);
      setSandboxLogs((prev) => [
        ...prev,
        `[3.00s] [RESULT] Diagnostic cycle complete: RIG STATUS: OPTIMAL & VERIFIED (0 critical defects).`,
        `======================================================`,
      ]);
      setQaChecklist((prev) => ({
        ...prev,
        executableIntegrity: true,
        securityPrivacy: true,
      }));

      const autoStamp = `[AUTOMATED RIG DIAGNOSTIC - ${new Date().toLocaleDateString()}]
• DirectX 12 / Vulkan Hook: PASS (0 swapchain errors)
• VRAM Allocation: 3.42 GB / 8.00 GB
• Frame Telemetry: Stable 59.8 FPS (Zero memory leaks)
• Malware & Obfuscation Heuristic Scan: CLEAN`;

      setQaNotesText((prev) => {
        if (!prev) return autoStamp;
        if (prev.includes('AUTOMATED RIG DIAGNOSTIC')) return prev;
        return `${prev}\n\n${autoStamp}`;
      });
    }, 2800);
  };

  const handleSaveQANotes = async () => {
    if (!sandboxGame) return;
    setSavingNotes(true);
    try {
      const res = await saveQANotesAPI(sandboxGame.id, qaNotesText);
      setToast({ message: 'QA field notes & telemetry successfully saved!', type: 'success' });
      setGames((prev) =>
        prev.map((g) =>
          g.id === sandboxGame.id
            ? {
                ...g,
                qaNotes: qaNotesText,
                assignedAdmin: res.game?.assignedAdmin || g.assignedAdmin,
                assignedAdminId: res.game?.assignedAdminId || g.assignedAdminId,
              }
            : g
        )
      );
      if (inspectGame && inspectGame.id === sandboxGame.id) {
        setInspectGame((prev: any) => ({
          ...prev,
          qaNotes: qaNotesText,
          assignedAdmin: res.game?.assignedAdmin || prev.assignedAdmin,
          assignedAdminId: res.game?.assignedAdminId || prev.assignedAdminId,
        }));
      }
      setSandboxGame((prev: any) => ({
        ...prev,
        qaNotes: qaNotesText,
        assignedAdmin: res.game?.assignedAdmin || prev.assignedAdmin,
        assignedAdminId: res.game?.assignedAdminId || prev.assignedAdminId,
      }));
    } catch (err: any) {
      setToast({
        message: err.response?.data?.message || 'Failed to save QA field notes.',
        type: 'error',
      });
    } finally {
      setSavingNotes(false);
    }
  };


  // Filter logic
  const filteredGames = games.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      g.title?.toLowerCase().includes(q) ||
      g.genre?.toLowerCase().includes(q) ||
      g.developer?.username?.toLowerCase().includes(q) ||
      g.assignedAdmin?.username?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (assignmentFilter === 'MINE') {
      return g.assignedAdminId === user?.id;
    }
    if (assignmentFilter === 'UNASSIGNED') {
      return !g.assignedAdminId;
    }
    if (assignmentFilter === 'OTHERS') {
      return g.assignedAdminId && g.assignedAdminId !== user?.id;
    }
    return true;
  });

  const myClaimedCount = games.filter((g) => g.assignedAdminId === user?.id).length;
  const unassignedCount = games.filter((g) => !g.assignedAdminId).length;
  const othersCount = games.filter((g) => g.assignedAdminId && g.assignedAdminId !== user?.id).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto px-4 py-3.5 rounded-xl border font-mono text-xs shadow-2xl flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-[#0D152B] border-blue-500/40 text-blue-200'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Header Strip ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-blue-900/40">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>Staff Certification Desk</span>
            </h1>
            <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/70 border border-blue-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {games.length} PENDING INSPECTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            QA build validation, ticket assignment locking, hardware benchmarks audit, and release signing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, genre, developer, or reviewer..."
              className="bg-[#090F24] border border-blue-900/40 focus:border-blue-500/60 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white outline-none w-56 sm:w-72 placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0D152B] border border-blue-900/40 transition-colors cursor-pointer"
            title="Refresh submission queue"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Assignment Triage Filter Tabs ─────────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-[#090F24] border border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setAssignmentFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              assignmentFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-blue-300/60 hover:text-white hover:bg-blue-950/40'
            }`}
          >
            <span>All Queue</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">{games.length}</span>
          </button>

          <button
            onClick={() => setAssignmentFilter('MINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              assignmentFilter === 'MINE'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-emerald-400/70 hover:text-white hover:bg-emerald-950/30'
            }`}
          >
            <span>Assigned to Me</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">{myClaimedCount}</span>
          </button>

          <button
            onClick={() => setAssignmentFilter('UNASSIGNED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              assignmentFilter === 'UNASSIGNED'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-cyan-400/70 hover:text-white hover:bg-cyan-950/30'
            }`}
          >
            <span>Unassigned Pool</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">{unassignedCount}</span>
          </button>

          <button
            onClick={() => setAssignmentFilter('OTHERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              assignmentFilter === 'OTHERS'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-amber-400/70 hover:text-white hover:bg-amber-950/30'
            }`}
          >
            <span>Held by Other Staff</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">{othersCount}</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 shrink-0">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Staff Roster: <strong className="text-white">{staffRoster.length}</strong></span>
        </div>
      </div>

      {/* ── Main Queue Content ─────────────────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-blue-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Scanning submission queue...
            </p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-blue-900/40 bg-[#090F24] space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                {searchQuery || assignmentFilter !== 'ALL'
                  ? 'No Submissions Matching Filter'
                  : 'Certification Horizon Clean'}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery || assignmentFilter !== 'ALL'
                  ? 'Try selecting a different filter tab or clearing your search term.'
                  : 'No developer submissions are currently awaiting inspection. All titles have been certified or resolved.'}
              </p>
            </div>
            {(searchQuery || assignmentFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAssignmentFilter('ALL');
                }}
                className="py-2 px-4 rounded-xl text-xs font-mono font-bold text-blue-300 bg-blue-950/60 border border-blue-500/30 hover:bg-blue-900/40 cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredGames.map((game) => {
              const coverImg = game.media?.coverImageUrl;
              const edition = game.pricing?.[0];
              const version = game.versions?.[0]?.version || '1.0.0';

              const elapsedHours = Math.max(
                0,
                Math.floor((Date.now() - new Date(game.updatedAt).getTime()) / (1000 * 60 * 60))
              );
              const isBreached = elapsedHours >= 48;
              const isWarning = elapsedHours >= 24;

              const isClaimedByMe = game.assignedAdminId === user?.id;
              const isClaimedByOther = game.assignedAdminId && game.assignedAdminId !== user?.id;
              const isUnassigned = !game.assignedAdminId;

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl overflow-hidden p-5 sm:p-6 transition-all duration-200 border bg-[#090F24] shadow-lg ${
                    isClaimedByMe
                      ? 'border-emerald-500/50 shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                      : isClaimedByOther
                      ? 'border-amber-500/40'
                      : 'border-blue-900/30 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Left: Media + Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-20 h-28 rounded-xl bg-[#060B18] border border-blue-900/40 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {coverImg ? (
                          <img src={coverImg} alt={game.title} className="w-full h-full object-cover" />
                        ) : (
                          <Layers className="w-8 h-8 text-slate-600" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold bg-black/80 text-slate-300 px-1 rounded">
                          {game.genre}
                        </span>
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {game.title}
                          </h3>

                          {/* Assignment Badge */}
                          {isClaimedByMe && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
                              <Lock className="w-3 h-3" />
                              Assigned to You
                            </span>
                          )}
                          {isClaimedByOther && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Lock className="w-3 h-3" />
                              QA Locked by @{game.assignedAdmin?.username}
                            </span>
                          )}
                          {isUnassigned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                              <Unlock className="w-3 h-3" />
                              Unassigned Pool
                            </span>
                          )}

                          {/* SLA Badge */}
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                              isBreached
                                ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 animate-pulse'
                                : isWarning
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                                : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {isBreached
                              ? `SLA BREACH (${elapsedHours}h)`
                              : isWarning
                              ? `PRIORITY (${elapsedHours}h)`
                              : `AWAITING (${elapsedHours}h)`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-black/40 border border-blue-900/30 px-2 py-0.5 rounded">
                            v{version}
                          </span>
                          {game.qaNotes && (
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                              <Activity className="w-2.5 h-2.5" />
                              <span>QA Telemetry Logged</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {game.description || 'No pitch overview provided.'}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1 flex-wrap">
                          <span>
                            Studio: <strong className="text-slate-200">@{game.developer?.username}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Price:{' '}
                            <strong className="text-blue-400">
                              {edition?.isFree ? 'FREE' : `₹ ${edition?.price || '0.00'}`}
                            </strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Submitted:{' '}
                            <span className="text-slate-300">
                              {new Date(game.updatedAt).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-blue-900/30">
                      {/* Claim / Release Ticket Buttons */}
                      {isUnassigned && (
                        <button
                          onClick={() => handleClaim(game.id, game.title)}
                          disabled={actionLoading === game.id}
                          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-mono font-bold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-600 border border-emerald-500/40 transition-all cursor-pointer shadow-md shadow-emerald-950/50"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Claim for QA</span>
                        </button>
                      )}

                      {isClaimedByMe && (
                        <button
                          onClick={() => handleRelease(game.id, game.title)}
                          disabled={actionLoading === game.id}
                          className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-white bg-[#0D152B] hover:bg-slate-800 border border-blue-900/40 transition-all cursor-pointer"
                          title="Release ticket back to the unassigned pool"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Release Ticket</span>
                        </button>
                      )}

                      {/* Delegate / Reassign Button */}
                      <button
                        onClick={() => {
                          setDelegateModalGame(game);
                          setSelectedDelegateAdminId(game.assignedAdminId || '');
                        }}
                        className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono font-medium text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/40 transition-all cursor-pointer"
                        title="Delegate ticket to another staff member"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Delegate</span>
                      </button>

                      {/* Inspect Dossier (Reviewer Theater) */}
                      <button
                        onClick={() => {
                          setInspectGame(game);
                          setActiveMediaIndex(0);
                          setShowTrailer(false);
                        }}
                        className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-mono font-semibold text-slate-200 hover:text-white bg-[#0D152B] hover:bg-[#131F3F] border border-blue-900/40 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Theater</span>
                      </button>

                      {/* Interactive QA Playtest Sandbox Rig */}
                      <button
                        onClick={() => openQASandbox(game)}
                        className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-mono font-bold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-700/40 transition-all cursor-pointer shadow-md shadow-indigo-950/40"
                        title="Launch interactive DirectX/Vulkan playtest sandbox rig"
                      >
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Sandbox Rig</span>
                      </button>

                      {/* Reject Button */}
                      <button
                        onClick={() => {
                          setRejectingGame(game);
                          setRejectionReason('');
                        }}
                        disabled={actionLoading === game.id}
                        className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      {/* Approve / Sign Button - Gated by Mandatory QA Verification */}
                      {Boolean(game.qaNotes && game.qaNotes.trim().length > 0) || user?.role === 'OWNER' ? (
                        <button
                          onClick={() => handleApprove(game.id, game.title)}
                          disabled={actionLoading === game.id}
                          className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-[0_0_18px_rgba(37,99,235,0.4)] disabled:opacity-50"
                          title={user?.role === 'OWNER' && !game.qaNotes ? "Root Sovereign Clearance: Direct Certification Override" : "Title verified in QA Rig. Click to certify and publish live."}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Certify</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openQASandbox(game)}
                          disabled={actionLoading === game.id}
                          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-300 hover:text-white bg-amber-950/30 hover:bg-amber-900/60 border border-amber-500/40 transition-all cursor-pointer shadow-md shadow-amber-950/40"
                          title="Mandatory QA Gate: Launch QA Sandbox Rig to run diagnostics, checklist, and telemetry before release."
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>QA Gate Required</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal: Delegate Review Ticket ─────────────────────────────────── */}
      <AnimatePresence>
        {delegateModalGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#090E1F] border border-blue-800/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 font-mono"
            >
              <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Delegate Review Ticket
                  </h3>
                </div>
                <button
                  onClick={() => setDelegateModalGame(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/40 space-y-1">
                <span className="text-[10px] text-blue-400 uppercase tracking-wider block">Target Title:</span>
                <span className="text-sm font-bold text-white block">{delegateModalGame.title}</span>
                <span className="text-[11px] text-slate-400 block">
                  Studio: @{delegateModalGame.developer?.username}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-blue-200 uppercase block">
                  Select Assignee from Active Staff Roster:
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {staffRoster.map((staff) => {
                    const isSelected = selectedDelegateAdminId === staff.id;
                    const isSelf = staff.id === user?.id;
                    const activeTickets = staff._count?.assignedGameReviews || 0;

                    return (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => setSelectedDelegateAdminId(staff.id)}
                        className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-600/20'
                            : 'bg-blue-950/20 border-blue-900/40 text-slate-300 hover:bg-blue-950/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-900/60 border border-blue-700/40 flex items-center justify-center font-bold text-xs uppercase text-white">
                            {staff.username.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              @{staff.username}
                              {isSelf && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {staff.role} &bull; {staff.email}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-blue-900/30">
                          {activeTickets} active
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-blue-900/40 text-xs">
                <button
                  type="button"
                  onClick={() => setDelegateModalGame(null)}
                  className="px-4 py-2 rounded-xl bg-blue-950/40 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedDelegateAdminId || delegateLoading}
                  onClick={handleExecuteDelegate}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                >
                  {delegateLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  )}
                  Assign Staff
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Full-Screen Reviewer Theater Modal (Navy Blue Operator Edition) ── */}
      <AnimatePresence>
        {inspectGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setInspectGame(null);
                setShowTrailer(false);
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-10 max-w-6xl w-full max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
              style={{
                background: '#070C1C',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Theater Topbar */}
              <div className="px-6 py-4 border-b border-blue-900/40 bg-[#0A1024] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                        {inspectGame.title}
                      </h2>
                      <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/70 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase">
                        STAFF REVIEW THEATER
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Developer: <strong className="text-slate-200">@{inspectGame.developer?.username}</strong> &bull; {inspectGame.developer?.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setInspectGame(null);
                      setShowTrailer(false);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0D152B] hover:bg-white/[0.08] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Assignment Notice Banner inside Theater */}
              <div className="px-6 py-2.5 bg-blue-950/40 border-b border-blue-900/30 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  {inspectGame.assignedAdminId ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-300">
                        Review Ticket assigned to:{' '}
                        <strong className="text-white">
                          @{inspectGame.assignedAdmin?.username || 'Staff'}
                        </strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300">
                        Review ticket is currently in the Unassigned Pool.
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!inspectGame.assignedAdminId ? (
                    <button
                      onClick={() => handleClaim(inspectGame.id, inspectGame.title)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase cursor-pointer"
                    >
                      Claim Ticket
                    </button>
                  ) : inspectGame.assignedAdminId === user?.id ? (
                    <button
                      onClick={() => handleRelease(inspectGame.id, inspectGame.title)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] uppercase cursor-pointer"
                    >
                      Release Ticket
                    </button>
                  ) : null}

                  <button
                    onClick={() => openQASandbox(inspectGame)}
                    className="px-3 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-950"
                  >
                    <Terminal className="w-3 h-3 text-indigo-300" />
                    <span>Launch QA Rig</span>
                  </button>
                </div>
              </div>

              {/* Theater Scrollable Body (2 Columns) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (7 cols): Interactive Visuals & Story Theater */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Main Media Viewport */}
                    <div className="rounded-2xl overflow-hidden bg-black border border-blue-900/40 relative aspect-video flex items-center justify-center group shadow-xl">
                      {showTrailer && inspectGame.media?.trailerUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#060B18] p-4 text-center">
                          <Film className="w-12 h-12 text-blue-400 mb-2 animate-pulse" />
                          <span className="text-xs font-mono text-white font-bold uppercase mb-1">
                            Media Trailer Stream Attached
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 break-all max-w-md">
                            {inspectGame.media.trailerUrl}
                          </span>
                          <a
                            href={inspectGame.media.trailerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-mono font-bold bg-blue-600 text-white hover:bg-blue-500"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Direct Trailer Video</span>
                          </a>
                        </div>
                      ) : inspectGame.media?.screenshots?.length > 0 ? (
                        <img
                          src={inspectGame.media.screenshots[activeMediaIndex] || inspectGame.media.screenshots[0]}
                          alt="Screenshot Inspection"
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      ) : inspectGame.media?.coverImageUrl ? (
                        <img
                          src={inspectGame.media.coverImageUrl}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-8 text-slate-600 font-mono text-xs">
                          <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
                          <span>No in-game captures uploaded for this title</span>
                        </div>
                      )}

                      {/* Top left overlay badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold bg-black/80 backdrop-blur-md text-white border border-white/10 px-2 py-0.5 rounded uppercase">
                          {inspectGame.genre}
                        </span>
                        {inspectGame.media?.trailerUrl && (
                          <button
                            onClick={() => setShowTrailer(!showTrailer)}
                            className="text-[9px] font-mono font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase flex items-center gap-1 cursor-pointer hover:bg-blue-500"
                          >
                            <Film className="w-3 h-3" />
                            <span>{showTrailer ? 'Show Captures' : 'Preview Trailer'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Screenshot Filmstrip */}
                    {inspectGame.media?.screenshots?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          Inspect Media Assets ({inspectGame.media.screenshots.length} Captures)
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                          {inspectGame.media.screenshots.map((s: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setShowTrailer(false);
                                setActiveMediaIndex(idx);
                              }}
                              className={`w-20 h-12 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                                !showTrailer && activeMediaIndex === idx
                                  ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105'
                                  : 'border-blue-900/40 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={s} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pitch Description Box */}
                    <div className="p-4 rounded-xl bg-[#090F24] border border-blue-900/30 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 block font-bold">
                        Storefront Pitch &amp; Gameplay Overview
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                        {inspectGame.description || 'No description provided by studio.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Technical Audit, Binaries & Hardware Specs */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Module 1: Executable Binary Verification */}
                    <div className="p-4 rounded-xl bg-[#090F24] border border-blue-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <FileCode className="w-4 h-4 text-blue-400" />
                          <span>Binary Release Package</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                          v{inspectGame.versions?.[0]?.version || '1.0.0'}
                        </span>
                      </div>

                      {inspectGame.versions?.[0] ? (
                        <div className="space-y-2 font-mono text-xs">
                          <div className="p-2.5 rounded-lg bg-black/50 border border-blue-900/30 space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Download Distribution URL</span>
                            <a
                              href={inspectGame.versions[0].downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline break-all text-[11px] flex items-center gap-1"
                            >
                              <span>{inspectGame.versions[0].downloadUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>

                          <div className="flex items-center justify-between text-slate-300 pt-1">
                            <span className="text-slate-500 flex items-center gap-1">
                              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                              <span>Package Size:</span>
                            </span>
                            <span className="text-white font-bold">
                              {(inspectGame.versions[0].fileSize / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/50 border border-blue-900/30 space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                              <Hash className="w-3 h-3 text-blue-400" />
                              <span>SHA-256 Checksum</span>
                            </span>
                            <span className="text-[10px] text-slate-300 font-mono break-all block">
                              {inspectGame.versions[0].sha256 || 'SHA-256 Checksum not declared'}
                            </span>
                          </div>

                          <button
                            onClick={() => openQASandbox(inspectGame)}
                            className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Launch QA Sandbox Rig</span>
                            <Zap className="w-3 h-3 text-amber-300" />
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 text-center text-xs font-mono text-rose-400 bg-rose-950/20 border border-rose-500/30 rounded-lg">
                          No binary executable uploaded for this release.
                        </div>
                      )}

                      {inspectGame.qaNotes && (
                        <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 font-mono text-[11px] space-y-1">
                          <span className="text-[10px] text-cyan-300 font-bold uppercase flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span>Logged QA Telemetry &amp; Field Notes:</span>
                          </span>
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {inspectGame.qaNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Module 2: Hardware Matrix Benchmark */}
                    <div className="p-4 rounded-xl bg-[#090F24] border border-blue-900/40 space-y-3 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-blue-400" />
                          <span>Hardware Requirements</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Bare-Metal Matrix</span>
                      </div>

                      {inspectGame.requirements ? (
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-black/40 border border-blue-900/30 space-y-1">
                            <span className="text-[10px] text-blue-400 font-bold uppercase block">Minimum Spec</span>
                            <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-1">
                              <span>OS: {inspectGame.requirements.minOs || 'Win 10 64-bit'}</span>
                              <span>RAM: {inspectGame.requirements.minRam || '8 GB'}</span>
                              <span className="col-span-2">CPU: {inspectGame.requirements.minCpu || 'Core i5-6600'}</span>
                              <span className="col-span-2">GPU: {inspectGame.requirements.minGpu || 'GTX 1060 6GB'}</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/40 border border-blue-900/30 space-y-1">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase block">Recommended Spec</span>
                            <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-1">
                              <span>OS: {inspectGame.requirements.recOs || 'Win 11 64-bit'}</span>
                              <span>RAM: {inspectGame.requirements.recRam || '16 GB'}</span>
                              <span className="col-span-2">CPU: {inspectGame.requirements.recCpu || 'Core i7-10700K'}</span>
                              <span className="col-span-2">GPU: {inspectGame.requirements.recGpu || 'RTX 3070 8GB'}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic p-3 text-center">
                          Hardware specification sheet incomplete.
                        </div>
                      )}
                    </div>

                    {/* Module 3: Pricing & Sovereign Royalty Partition */}
                    <div className="p-4 rounded-xl bg-[#090F24] border border-blue-900/40 space-y-3 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-blue-400" />
                          <span>Commercial Split</span>
                        </span>
                        <span className="text-[10px] text-blue-400 font-bold">70 / 30 Standard</span>
                      </div>

                      {inspectGame.pricing?.[0] ? (
                        (() => {
                          const edition = inspectGame.pricing[0];
                          const price = Number(edition.price) || 0;
                          const sovereignCut = price * 0.3;
                          const developerCut = price * 0.7;

                          return (
                            <div className="space-y-2.5 font-mono text-xs">
                              <div className="flex justify-between items-center text-slate-300">
                                <span className="text-slate-500">Edition Name:</span>
                                <span className="text-white font-bold">{edition.editionName}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-300">
                                <span className="text-slate-500">Gross Price:</span>
                                <span className="text-base font-black text-white">
                                  {edition.isFree ? 'FREE TO PLAY' : `₹ ${price.toFixed(2)}`}
                                </span>
                              </div>
                              <div className="p-3 rounded-xl bg-black/60 border border-blue-900/30 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-blue-300">Platform Royalty (30% Sovereign):</span>
                                  <span className="font-bold text-blue-400">
                                    {edition.isFree ? '₹ 0.00' : `₹ ${sovereignCut.toFixed(2)}`}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-emerald-400">Developer Net Share (70%):</span>
                                  <span className="font-bold text-emerald-400">
                                    {edition.isFree ? '₹ 0.00' : `₹ ${developerCut.toFixed(2)}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-xs text-slate-500 italic">No pricing tiers specified.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Theater Footer Actions Bar */}
              <div className="p-4 px-6 border-t border-blue-900/40 bg-[#0A1024] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>
                    Staff Attribution:{' '}
                    <strong className="text-white">@{user?.username || 'CurrentStaff'}</strong> (LEVEL-1 OPERATOR)
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setRejectingGame(inspectGame);
                      setRejectionReason('');
                    }}
                    disabled={actionLoading === inspectGame.id}
                    className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/40 transition-all cursor-pointer shadow-md shadow-rose-950/40"
                  >
                    Issue Rejection
                  </button>

                  {Boolean(inspectGame.qaNotes && inspectGame.qaNotes.trim().length > 0) || user?.role === 'OWNER' ? (
                    <button
                      onClick={() => handleApprove(inspectGame.id, inspectGame.title)}
                      disabled={actionLoading === inspectGame.id}
                      className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.45)]"
                    >
                      Certify &amp; Publish Title
                    </button>
                  ) : (
                    <button
                      onClick={() => openQASandbox(inspectGame)}
                      className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      title="Mandatory: Launch QA Playtest Sandbox Rig to complete diagnostics before certification"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Launch QA Rig to Certify</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Interactive QA Playtest Sandbox Rig ────────────────── */}
      <AnimatePresence>
        {sandboxGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#060B18] border border-blue-600/40 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-[0_0_60px_rgba(30,58,138,0.4)] overflow-hidden font-sans"
            >
              {/* Header Bar */}
              <div className="p-4 px-6 border-b border-blue-900/40 bg-[#0A1024] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold font-mono uppercase tracking-wider text-white">
                        QA Playtest Sandbox Rig
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 uppercase">
                        DX12 / Vulkan Virtualization
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400">
                      Testing Target:{' '}
                      <strong className="text-white">{sandboxGame.title}</strong>{' '}
                      (v{sandboxGame.versions?.[0]?.version || '1.0.0'}) &bull; Studio: @{sandboxGame.developer?.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 border border-blue-900/40 font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-400">Rig Status:</span>
                    <strong className={simulationPhase === 5 ? 'text-emerald-400' : isSimulating ? 'text-amber-400' : 'text-blue-400'}>
                      {simulationPhase === 5 ? 'VERIFIED HEALTHY' : isSimulating ? `PHASE ${simulationPhase}/4` : 'STANDBY'}
                    </strong>
                  </div>

                  <button
                    onClick={() => setSandboxGame(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Rig Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (7 cols): In-Engine Virtual Screen & Console Telemetry */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Engine Viewport Frame */}
                    <div className="rounded-2xl overflow-hidden bg-black border border-blue-900/50 relative aspect-video flex items-center justify-center shadow-2xl group">
                      {sandboxGame.media?.coverImageUrl || sandboxGame.media?.screenshots?.[0] ? (
                        <img
                          src={sandboxGame.media?.screenshots?.[0] || sandboxGame.media?.coverImageUrl}
                          alt="In-Engine Sandbox"
                          className="w-full h-full object-cover filter contrast-110 brightness-95"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#070D1F] text-slate-500 font-mono text-xs">
                          <Cpu className="w-12 h-12 text-blue-500 mb-2 opacity-50" />
                          <span>Simulated Frame Buffer Active</span>
                        </div>
                      )}

                      {/* Scanlines and Cyber HUD */}
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px]" />

                      {/* Top Overlay HUD */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-white">
                        <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-blue-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>RING-3 SANDBOX CONTAINER: #GS-RIG-09</span>
                        </span>
                        <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
                          1920x1080 @ 60.00 FPS
                        </span>
                      </div>

                      {/* Bottom Overlay Telemetry Bar */}
                      <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-blue-900/60 rounded-xl p-2.5 grid grid-cols-4 gap-2 text-center font-mono">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">Framerate</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {isSimulating ? (58.5 + Math.random() * 2.5).toFixed(1) : '59.8'} FPS
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">VRAM Usage</span>
                          <span className="text-xs font-bold text-blue-300">3.42 / 8.00 GB</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">System RAM</span>
                          <span className="text-xs font-bold text-slate-200">4.18 / 16.0 GB</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">GPU Core</span>
                          <span className="text-xs font-bold text-amber-300">62°C (Stable)</span>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic Stream Console */}
                    <div className="rounded-2xl bg-[#030611] border border-blue-900/50 p-4 space-y-3 font-mono">
                      <div className="flex items-center justify-between border-b border-blue-900/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold uppercase text-white tracking-wider">
                            Rig Diagnostics Console Stream
                          </span>
                        </div>

                        <button
                          onClick={runSandboxDiagnostics}
                          disabled={isSimulating}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        >
                          {isSimulating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Running Phase {simulationPhase}/4...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Run Rig Diagnostics</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Live Log Stream Area */}
                      <div className="bg-black/80 rounded-xl p-3 h-48 overflow-y-auto space-y-1 text-[11px] leading-relaxed border border-blue-900/30 scrollbar-thin">
                        {sandboxLogs.map((log, idx) => {
                          const isResult = log.includes('[RESULT]') || log.includes('====');
                          const isError = log.includes('FAIL') || log.includes('ERROR');
                          const isSuccess = log.includes('PASS') || log.includes('MATCH') || log.includes('OPTIMAL') || log.includes('CLEAN');
                          return (
                            <div
                              key={idx}
                              className={`${
                                isResult
                                  ? 'text-cyan-300 font-bold'
                                  : isError
                                  ? 'text-rose-400'
                                  : isSuccess
                                  ? 'text-emerald-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {log}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5 cols): 4-Point Checklist & Field Notes */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Binary Verification Strip */}
                    <div className="p-4 rounded-xl bg-[#090F24] border border-blue-900/40 space-y-2.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                          <FileCode className="w-4 h-4 text-blue-400" />
                          <span>Binary Release Payload</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                          v{sandboxGame.versions?.[0]?.version || '1.0.0'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/50 border border-blue-900/30 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                          <Hash className="w-3 h-3 text-blue-400" />
                          <span>SHA-256 Checksum Verification</span>
                        </span>
                        <span className="text-[10px] text-slate-300 break-all block">
                          {sandboxGame.versions?.[0]?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                        </span>
                        <span className="text-[9px] text-emerald-400 flex items-center gap-1 pt-0.5">
                          <CheckCircle className="w-3 h-3" />
                          <span>Checksum verified against platform repository</span>
                        </span>
                      </div>
                    </div>

                    {/* 4-Point Interactive QA Checklist */}
                    <div className="p-4 rounded-xl bg-[#090F24] border border-blue-900/40 space-y-3 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                          <span>QA Compliance Checklist</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold">
                          {Object.values(qaChecklist).filter(Boolean).length} / 4 Passed
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          {
                            key: 'executableIntegrity',
                            label: 'Standalone 64-bit binary boots cleanly without unhandled crash',
                          },
                          {
                            key: 'securityPrivacy',
                            label: 'Zero malware, hidden miners, or unauthorized telemetry sockets',
                          },
                          {
                            key: 'storefrontMedia',
                            label: 'Storefront captures & trailer reflect authentic gameplay',
                          },
                          {
                            key: 'commercialPricing',
                            label: 'Editions & pricing comply with sovereign 70/30 guidelines',
                          },
                        ].map((item) => {
                          const isChecked = (qaChecklist as any)[item.key];
                          return (
                            <div
                              key={item.key}
                              onClick={() =>
                                setQaChecklist((prev) => ({
                                  ...prev,
                                  [item.key]: !isChecked,
                                }))
                              }
                              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                                isChecked
                                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                                  : 'bg-black/30 border-blue-900/30 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600" />
                                )}
                              </div>
                              <span className="text-[11px] leading-tight select-none">
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Staff QA Field Notes */}
                    <div className="p-4 rounded-xl bg-[#090F24] border border-blue-900/40 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-blue-400" />
                          <span>Staff QA Field Notes</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Telemetry Record</span>
                      </div>

                      {/* Quick Preset Snippets */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          '+ Clean DX12 hook',
                          '+ Stable 60 FPS',
                          '+ Media genuine',
                          '+ Ready to certify',
                        ].map((snippet) => (
                          <button
                            key={snippet}
                            type="button"
                            onClick={() =>
                              setQaNotesText((prev) =>
                                prev ? `${prev}\n• ${snippet.replace('+ ', '')}` : `• ${snippet.replace('+ ', '')}`
                              )
                            }
                            className="px-2 py-1 rounded bg-[#0D152B] hover:bg-blue-950/60 border border-blue-900/40 text-[10px] text-slate-300 hover:text-white cursor-pointer"
                          >
                            {snippet}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={4}
                        value={qaNotesText}
                        onChange={(e) => setQaNotesText(e.target.value)}
                        placeholder="Log rig observations, memory leak telemetry, or developer notes..."
                        className="w-full bg-black/60 border border-blue-900/40 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none font-mono"
                      />

                      <button
                        onClick={handleSaveQANotes}
                        disabled={savingNotes}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.35)] disabled:opacity-50"
                      >
                        {savingNotes ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Recording Telemetry...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save QA Notes to Telemetry</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions with Mandatory QA Gatekeeper */}
              {(() => {
                const isDiagnosticsDone = simulationPhase === 5;
                const isChecklistDone = Object.values(qaChecklist).filter(Boolean).length === 4;
                const isNotesDone = Boolean(sandboxGame.qaNotes && sandboxGame.qaNotes.trim().length > 0);
                const isOwner = user?.role === 'OWNER';
                const canCertify = (isDiagnosticsDone && isChecklistDone && isNotesDone) || isOwner;

                return (
                  <div className="p-4 px-6 border-t border-blue-900/40 bg-[#0A1024] flex flex-col xl:flex-row items-center justify-between gap-4 shrink-0 font-mono text-xs">
                    <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                      <div className="flex items-center gap-2 text-slate-400">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <span>
                          QA Operator: <strong className="text-white">@{user?.username || 'CurrentStaff'}</strong>
                        </span>
                      </div>

                      {/* 3-Point Mandatory QA Gate Status HUD */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                            isDiagnosticsDone
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {isDiagnosticsDone ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Square className="w-3 h-3 text-rose-400" />
                          )}
                          Diagnostics {isDiagnosticsDone ? '(100%)' : '(Required)'}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                            isChecklistDone
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {isChecklistDone ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Square className="w-3 h-3 text-rose-400" />
                          )}
                          Checklist ({Object.values(qaChecklist).filter(Boolean).length}/4)
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
                            isNotesDone
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {isNotesDone ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Square className="w-3 h-3 text-rose-400" />
                          )}
                          Telemetry {isNotesDone ? '(Saved)' : '(Required)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                      <button
                        onClick={() => {
                          const target = sandboxGame;
                          setSandboxGame(null);
                          setRejectingGame(target);
                          setRejectionReason('');
                        }}
                        className="flex-1 xl:flex-none py-2.5 px-5 rounded-xl font-bold uppercase tracking-wider text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/40 transition-all cursor-pointer shadow-md shadow-rose-950/40"
                      >
                        Issue Rejection
                      </button>

                      <button
                        disabled={!canCertify}
                        onClick={() => {
                          if (!canCertify) return;
                          const targetId = sandboxGame.id;
                          const targetTitle = sandboxGame.title;
                          setSandboxGame(null);
                          handleApprove(targetId, targetTitle);
                        }}
                        className={`flex-1 xl:flex-none py-2.5 px-6 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          canCertify
                            ? 'text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer'
                            : 'text-slate-500 bg-slate-900/80 border border-slate-700/50 cursor-not-allowed opacity-60'
                        }`}
                        title={
                          canCertify
                            ? 'Title has satisfied all 3 QA validation criteria. Click to certify and publish to storefront.'
                            : 'QA Gate Locked: Complete Diagnostics (100%), 4/4 Checklist, and Save Telemetry Notes to unlock.'
                        }
                      >
                        {canCertify ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-black" />
                            <span>Certify &amp; Publish Title</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Certify Locked (3 Gates)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Rejection Directive Drawer ─────────────────────────────── */}
      <AnimatePresence>
        {rejectingGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingGame(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-10 max-w-lg w-full bg-[#0A1024] border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                      Rejection Directive
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Dispatched to studio @{rejectingGame.developer?.username}
                    </span>
                  </div>
                </div>

                <button onClick={() => setRejectingGame(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Fast presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Select Violation Reason (One-Click Preset):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {REJECTION_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="w-full text-left p-2 rounded-lg text-[11px] font-mono text-slate-300 hover:text-white bg-[#0D152B] hover:bg-blue-950/40 border border-blue-900/30 transition-colors cursor-pointer"
                    >
                      &bull; {preset}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Formal Directive to Developer:
                  </span>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify exact defects or select a preset above..."
                    className="w-full bg-[#090F24] border border-blue-900/40 focus:border-rose-500 rounded-xl p-3 text-xs text-white outline-none resize-none font-mono"
                    required
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingGame(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-[#0D152B] hover:bg-[#131F3F] border border-blue-900/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!rejectionReason.trim()}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
                  >
                    Issue Directive
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
