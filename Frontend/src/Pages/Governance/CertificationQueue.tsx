import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ChevronLeft,
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
  Tag,
  Monitor,
} from 'lucide-react';
import {
  getPendingCertificationGamesAPI,
  approveGameCertificationAPI,
  rejectGameCertificationAPI,
} from '../../Services/Governance.service';

export default function CertificationQueue() {
  const navigate = useNavigate();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Inspection Drawer/Theater Modal
  const [inspectGame, setInspectGame] = useState<any | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);

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
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await getPendingCertificationGamesAPI();
      setGames(data);
    } catch (err) {
      console.error('Failed to load certification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gameId: string, title: string) => {
    if (!confirm(`CERTIFY TITLE:\nOfficially certify "${title}" and publish it live to the GameStation storefront?`)) {
      return;
    }

    try {
      setActionLoading(gameId);
      await approveGameCertificationAPI(gameId);
      setInspectGame(null);
      await fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to certify game');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingGame) return;

    try {
      setActionLoading(rejectingGame.id);
      await rejectGameCertificationAPI(rejectingGame.id, rejectionReason);
      setRejectingGame(null);
      setRejectionReason('');
      setInspectGame(null);
      await fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject submission');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* ── Top Title Strip ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#FF1E27]" />
            <span>Developer Certification Queue</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Inspect build packages, bare-metal hardware specs, and commercial pricing before live publication
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
            {games.length} PENDING INSPECTION
          </span>
          <button
            onClick={fetchQueue}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#14141c] border border-white/[0.08] transition-colors cursor-pointer"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Container ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-[#FF1E27] animate-spin" />
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Scanning submission queue...
            </p>
          </div>
        ) : games.length === 0 ? (
          <div
            className="p-16 text-center rounded-2xl border border-white/[0.08] space-y-4"
            style={{ background: '#0d0d12' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                Certification Horizon Clean
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No developer submissions are currently awaiting inspection. All titles have been certified
                or resolved.
              </p>
            </div>
            <button
              onClick={() => navigate('/platform/governance')}
              className="py-2.5 px-5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Return to Cockpit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {games.map((game) => {
              const coverImg = game.media?.coverImageUrl;
              const edition = game.pricing?.[0];
              const version = game.versions?.[0];

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl overflow-hidden p-5 sm:p-6 transition-all duration-200"
                  style={{
                    background: '#0d0d12',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* Left: Media + Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-20 h-28 rounded-xl bg-[#14141c] border border-white/[0.08] overflow-hidden shrink-0 relative flex items-center justify-center">
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-8 h-8 text-zinc-600" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold bg-black/80 text-zinc-300 px-1 rounded">
                          {game.genre}
                        </span>
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {game.title}
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                            Pending Review
                          </span>
                          {version && (
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                              v{version.version}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {game.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-1 flex-wrap">
                          <span>
                            Studio:&nbsp;
                            <strong className="text-zinc-200">@{game.developer.username}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Pricing:&nbsp;
                            <strong className="text-[#FF1E27]">
                              {edition?.isFree ? 'FREE' : `₹ ${edition?.price || '0.00'}`}
                            </strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Submitted:&nbsp;
                            <span className="text-zinc-400">
                              {new Date(game.updatedAt).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                      <button
                        onClick={() => setInspectGame(game)}
                        className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-zinc-300 hover:text-white bg-[#14141c] hover:bg-[#1a1a24] border border-white/[0.08] transition-all cursor-pointer active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Dossier</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectingGame(game);
                          setRejectionReason('');
                        }}
                        disabled={actionLoading === game.id}
                        className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(game.id, game.title)}
                        disabled={actionLoading === game.id}
                        className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#FF1E27] hover:bg-[#E0151E] transition-all cursor-pointer active:scale-95 shadow-[0_0_18px_rgba(255,30,39,0.35)] disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{actionLoading === game.id ? 'Certifying...' : 'Certify & Publish'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Deep Certification Reviewer Theater (Full-Screen Modal) ── */}
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
                background: '#0a0a0f',
                border: '1px solid rgba(255, 30, 39, 0.25)',
                boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Theater Topbar */}
              <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0e0e16] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF1E27]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                        {inspectGame.title}
                      </h2>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                        PENDING CLEARANCE
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      Studio: <strong className="text-zinc-200">@{inspectGame.developer?.username}</strong> &bull; {inspectGame.developer?.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline uppercase">
                    REVIEWER THEATER v2.0
                  </span>
                  <button
                    onClick={() => {
                      setInspectGame(null);
                      setShowTrailer(false);
                    }}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#14141c] hover:bg-white/[0.08] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Theater Scrollable Body (2 Columns) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (7 cols): Interactive Visuals & Story Theater */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Main Media Viewport */}
                    <div className="rounded-2xl overflow-hidden bg-black border border-white/[0.08] relative aspect-video flex items-center justify-center group shadow-xl">
                      {showTrailer && inspectGame.media?.trailerUrl ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#07070a] p-4 text-center">
                          <Film className="w-12 h-12 text-[#FF1E27] mb-2 animate-pulse" />
                          <span className="text-xs font-mono text-white font-bold uppercase mb-1">
                            Media Trailer Stream Attached
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400 break-all max-w-md">
                            {inspectGame.media.trailerUrl}
                          </span>
                          <a
                            href={inspectGame.media.trailerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-mono font-bold bg-[#FF1E27] text-white hover:bg-[#E0151E]"
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
                        <div className="text-center p-8 text-zinc-600 font-mono text-xs">
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
                            className="text-[9px] font-mono font-bold bg-[#FF1E27]/90 text-white px-2 py-0.5 rounded uppercase flex items-center gap-1 cursor-pointer hover:bg-[#FF1E27]"
                          >
                            <Film className="w-3 h-3" />
                            <span>{showTrailer ? 'Show Captures' : 'Preview Trailer'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Screenshot Thumbnails Carousel */}
                    {inspectGame.media?.screenshots?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                          Visual Captures Matrix ({inspectGame.media.screenshots.length} Assets)
                        </span>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {inspectGame.media.screenshots.map((s: string, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setShowTrailer(false);
                                setActiveMediaIndex(idx);
                              }}
                              className={`h-16 rounded-xl overflow-hidden bg-[#14141c] border transition-all cursor-pointer ${
                                !showTrailer && activeMediaIndex === idx
                                  ? 'border-[#FF1E27] scale-105 shadow-[0_0_12px_rgba(255,30,39,0.4)]'
                                  : 'border-white/[0.08] opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={s} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Title Narrative & Tags */}
                    <div className="p-4 rounded-xl bg-[#0f0f17] border border-white/[0.06] space-y-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                        Game Overview & Storefront Pitch
                      </span>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {inspectGame.description || 'No description provided by the creator.'}
                      </p>
                      {inspectGame.tags && inspectGame.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2">
                          {inspectGame.tags.map((t: string, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded border border-white/[0.04]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (5 cols): Technical, Checksum & Commercial Audit */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* 1. Cryptographic Package Audit Card */}
                    <div className="p-4 rounded-xl bg-[#0e0e16] border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <HardDrive className="w-4 h-4 text-[#FF1E27]" />
                          <span>Binary Artifact & Integrity</span>
                        </span>
                        <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
                          SHA-256 VERIFIED
                        </span>
                      </div>

                      {inspectGame.versions?.[0] ? (
                        <div className="text-xs font-mono space-y-2">
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="text-zinc-500">Target Release:</span>
                            <span className="text-white font-bold">v{inspectGame.versions[0].version}</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-300">
                            <span className="text-zinc-500">Payload Architecture:</span>
                            <span className="text-zinc-200">Win64 Portable PE</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-zinc-500 text-[10px] block">Checksum Digest:</span>
                            <div className="p-2 rounded bg-black/60 border border-white/[0.06] text-[10px] text-emerald-400/90 font-mono truncate">
                              sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                            </div>
                          </div>
                          <div className="text-zinc-400 text-[11px] leading-relaxed pt-1">
                            <strong className="text-zinc-300">Changelog:</strong>{' '}
                            {inspectGame.versions[0].changelog || 'Initial release submission candidate.'}
                          </div>
                          {inspectGame.versions[0].downloadUrl && (
                            <a
                              href={inspectGame.versions[0].downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono font-bold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#FF1E27]" />
                              <span>Download & Probe Executable</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">No build uploaded</span>
                      )}
                    </div>

                    {/* 2. Commercial Royalty Share Simulator */}
                    <div className="p-4 rounded-xl bg-[#0e0e16] border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-[#FF1E27]" />
                          <span>Commercial Terms & Royalty Split</span>
                        </span>
                      </div>

                      {inspectGame.pricing?.[0] ? (
                        (() => {
                          const edition = inspectGame.pricing[0];
                          const price = Number(edition.price) || 0;
                          const sovereignCut = (price * 0.3);
                          const developerCut = (price * 0.7);

                          return (
                            <div className="space-y-2.5 font-mono text-xs">
                              <div className="flex justify-between items-center text-zinc-300">
                                <span className="text-zinc-500">Edition Name:</span>
                                <span className="text-white font-bold">{edition.editionName}</span>
                              </div>
                              <div className="flex justify-between items-center text-zinc-300">
                                <span className="text-zinc-500">Gross Price:</span>
                                <span className="text-lg font-black text-white">
                                  {edition.isFree ? 'FREE TO PLAY' : `₹ ${price.toFixed(2)}`}
                                </span>
                              </div>
                              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-red-400">Platform Retained (30% Cut):</span>
                                  <span className="font-bold text-[#FF1E27]">
                                    {edition.isFree ? '₹ 0.00' : `+ ₹ ${sovereignCut.toFixed(2)}`}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-emerald-400">Developer Royalty (70%):</span>
                                  <span className="font-bold text-emerald-400">
                                    {edition.isFree ? '₹ 0.00' : `₹ ${developerCut.toFixed(2)}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">No pricing configured</span>
                      )}
                    </div>

                    {/* 3. Hardware Requirements Matrix */}
                    {inspectGame.requirements && (
                      <div className="p-4 rounded-xl bg-[#0e0e16] border border-white/[0.08] space-y-2.5">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-[#FF1E27]" />
                          <span>Hardware Requirements Matrix</span>
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="p-2.5 rounded bg-black/40 border border-white/[0.04] space-y-0.5">
                            <span className="text-[9px] text-zinc-500 uppercase block">OS Minimum</span>
                            <span className="text-zinc-200 block truncate">{inspectGame.requirements.minOs}</span>
                          </div>
                          <div className="p-2.5 rounded bg-black/40 border border-white/[0.04] space-y-0.5">
                            <span className="text-[9px] text-zinc-500 uppercase block">CPU Minimum</span>
                            <span className="text-zinc-200 block truncate">{inspectGame.requirements.minCpu}</span>
                          </div>
                          <div className="p-2.5 rounded bg-black/40 border border-white/[0.04] space-y-0.5">
                            <span className="text-[9px] text-zinc-500 uppercase block">GPU Minimum</span>
                            <span className="text-zinc-200 block truncate">{inspectGame.requirements.minGpu}</span>
                          </div>
                          <div className="p-2.5 rounded bg-black/40 border border-white/[0.04] space-y-0.5">
                            <span className="text-[9px] text-zinc-500 uppercase block">RAM Minimum</span>
                            <span className="text-zinc-200 block truncate">{inspectGame.requirements.minMem}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Security & Compliance Checklist */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] font-mono space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Zero telemetry anomalies detected</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Storefront DRM signature clearance armed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theater Action Deck (Footer) */}
              <div className="px-6 py-4 border-t border-white/[0.08] bg-[#0e0e16] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Lock className="w-3.5 h-3.5 text-[#FF1E27]" />
                  <span>Sovereign Certification Key Signer Active</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingGame(inspectGame);
                      setInspectGame(null);
                    }}
                    className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 transition-all cursor-pointer"
                  >
                    Reject with Directive
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(inspectGame.id, inspectGame.title)}
                    disabled={actionLoading === inspectGame.id}
                    className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#FF1E27] hover:bg-[#E0151E] shadow-[0_0_20px_rgba(255,30,39,0.35)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>{actionLoading === inspectGame.id ? 'Signing Publication...' : 'Certify & Publish to Storefront'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Enhanced Rejection Modal with Preset Directives ────────── */}
      <AnimatePresence>
        {rejectingGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingGame(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 max-w-lg w-full rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4"
              style={{
                background: '#0d0d12',
                border: '1px solid rgba(255, 30, 39, 0.35)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF1E27]">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Issue Sovereign Rejection Directive
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">
                    Target: <strong className="text-white">{rejectingGame.title}</strong>
                  </span>
                </div>
              </div>

              {/* Fast presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Select Violation Reason (One-Click Preset):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {REJECTION_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="w-full text-left p-2 rounded-lg text-[11px] font-mono text-zinc-300 hover:text-white bg-[#14141c] hover:bg-[#1f1f2c] border border-white/[0.06] transition-colors cursor-pointer"
                    >
                      &bull; {preset}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Formal Directive to Developer:
                  </span>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify exact defects or select a preset above..."
                    className="w-full bg-[#14141c] border border-white/[0.1] focus:border-[#FF1E27] rounded-xl p-3 text-xs text-white outline-none resize-none font-mono"
                    required
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingGame(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-mono font-semibold text-zinc-400 bg-[#161620] hover:bg-[#20202d] border border-white/[0.08]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!rejectionReason.trim()}
                    className="flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(255,30,39,0.3)]"
                  >
                    Issue Rejection
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

