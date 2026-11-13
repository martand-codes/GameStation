import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Search,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  Coins,
  RefreshCw,
  Users,
  Gamepad2,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  getAdminCatalogAPI,
  moderateGameVisibilityAPI,
} from '../../Services/Admin.service';
import { useToast } from '../../Context/ToastContext';
import { QADossierModal } from '../../Components/Admin/QADossierModal';

export default function AdminCatalogPage() {
  const toast = useToast();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // QA Dossier Modal State
  const [selectedDossierGame, setSelectedDossierGame] = useState<any | null>(null);

  // Moderation Dialog State
  const [modTargetGame, setModTargetGame] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<'PUBLISHED' | 'HIDDEN' | 'REJECTED'>('HIDDEN');
  const [reasonCategory, setReasonCategory] = useState<string>('DMCA');
  const [customReason, setCustomReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, [statusFilter]);

  const fetchCatalog = async (query?: string) => {
    try {
      setLoading(true);
      const data = await getAdminCatalogAPI(query ?? search, statusFilter);
      setGames(data);
    } catch (err) {
      console.error('Failed to load admin catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog(search);
  };

  const openModerationModal = (game: any, desiredStatus: 'PUBLISHED' | 'HIDDEN' | 'REJECTED') => {
    setModTargetGame(game);
    setTargetStatus(desiredStatus);
    setReasonCategory(desiredStatus === 'HIDDEN' ? 'DMCA' : 'STANDARD_RELEASE');
    setCustomReason('');
  };

  const handleExecuteModeration = async () => {
    if (!modTargetGame) return;
    try {
      setActionLoading(true);
      const finalReason = customReason.trim()
        ? `[${reasonCategory}] ${customReason.trim()}`
        : `[${reasonCategory}] Standard staff moderation action`;

      await moderateGameVisibilityAPI(modTargetGame.id, targetStatus, finalReason);

      toast.success(`Successfully set "${modTargetGame.title}" to [${targetStatus}].`);
      setModTargetGame(null);
      await fetchCatalog(search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update game status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics computation
  const totalGames = games.length;
  const publishedCount = games.filter((g) => g.status === 'PUBLISHED').length;
  const hiddenCount = games.filter((g) => g.status === 'HIDDEN').length;
  const totalInstalls = games.reduce((acc, g) => acc + (g._count?.library || 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-900/30">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Operator Catalog Deck
            </span>
            <h1 className="text-xl md:text-2xl font-bold font-mono uppercase tracking-wider text-white">
              Storefront Catalog Moderation
            </h1>
          </div>
          <p className="text-xs text-blue-200/70 mt-1 font-sans">
            Staff oversight, intellectual property compliance, and force-visibility toggles across all distributed titles.
          </p>
        </div>

        <button
          onClick={() => fetchCatalog(search)}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-950/60 border border-blue-800/40 hover:bg-blue-900/40 text-blue-300 font-mono text-xs transition-colors cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Catalog
        </button>
      </div>

      {/* Catalog KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30">
          <div className="flex items-center justify-between text-blue-400/80 mb-1">
            <span className="text-[11px] font-mono uppercase">Total Catalog</span>
            <Gamepad2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalGames}</div>
          <div className="text-[10px] font-mono text-blue-300/50 mt-1">Platform-wide titles</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30">
          <div className="flex items-center justify-between text-emerald-400/80 mb-1">
            <span className="text-[11px] font-mono uppercase">Live On Storefront</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{publishedCount}</div>
          <div className="text-[10px] font-mono text-emerald-300/50 mt-1">Available for purchase</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30">
          <div className="flex items-center justify-between text-amber-400/80 mb-1">
            <span className="text-[11px] font-mono uppercase">Delisted / Hidden</span>
            <EyeOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{hiddenCount}</div>
          <div className="text-[10px] font-mono text-amber-300/50 mt-1">Withheld from discovery</div>
        </div>

        <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30">
          <div className="flex items-center justify-between text-cyan-400/80 mb-1">
            <span className="text-[11px] font-mono uppercase">Active Player Copies</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalInstalls}</div>
          <div className="text-[10px] font-mono text-cyan-300/50 mt-1">Installed across libraries</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#090E1F] border border-blue-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PUBLISHED', 'HIDDEN', 'PENDING', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-blue-300/60 hover:text-white hover:bg-blue-950/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, genre, developer..."
              className="bg-[#050814] border border-blue-900/50 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-blue-100 placeholder:text-blue-400/30 outline-none font-mono w-64 sm:w-80"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-3.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-mono font-bold uppercase text-blue-200 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Catalog Table */}
      <div className="rounded-xl overflow-hidden bg-[#090E1F] border border-blue-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#070B18] text-blue-300/60 font-mono uppercase tracking-wider border-b border-blue-900/30">
              <tr>
                <th className="py-3.5 px-4">Title &amp; Genre</th>
                <th className="py-3.5 px-4">Developer</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Distribution</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/20 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-blue-300/50">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                    Querying catalog state...
                  </td>
                </tr>
              ) : games.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-blue-300/50">
                    No games found matching current filters.
                  </td>
                </tr>
              ) : (
                games.map((game) => {
                  const cover = game.media?.coverImageUrl || '/placeholder.png';
                  const rawPrice = game.pricing?.price ?? (Array.isArray(game.pricing) ? game.pricing[0]?.price : undefined) ?? game.price ?? 0;
                  const isFree = Boolean(game.isFree || game.pricing?.isFree || (Array.isArray(game.pricing) && game.pricing[0]?.isFree) || Number(rawPrice) === 0);
                  const price = isFree ? 'FREE' : `₹${Number(rawPrice).toFixed(2)}`;
                  const isPublished = game.status === 'PUBLISHED';
                  const isHidden = game.status === 'HIDDEN';

                  return (
                    <tr key={game.id} className="hover:bg-blue-950/20 transition-colors">
                      {/* Game Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cover}
                            alt={game.title}
                            className="w-12 h-16 object-cover rounded-lg border border-blue-900/40 bg-black shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-sm font-sans flex items-center gap-2">
                              {game.title}
                              {isPublished && (
                                <a
                                  href={`/store/games/${game.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-400 hover:text-blue-200"
                                  title="View on Storefront"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] text-blue-300/60 uppercase">
                              {game.genre || 'Action / Indie'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Developer */}
                      <td className="py-3 px-4 text-blue-200">
                        <div className="font-semibold">@{game.developer?.username}</div>
                        <div className="text-[10px] text-blue-400/40">{game.developer?.email}</div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4 text-white font-bold">{price}</td>

                      {/* Distribution */}
                      <td className="py-3 px-4">
                        <div className="text-blue-200 flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-cyan-400" />
                          <span>{game._count?.library || 0} libraries</span>
                        </div>
                        <div className="text-[10px] text-blue-400/40">
                          {game._count?.payments || 0} purchases
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isHidden
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : game.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished
                                ? 'bg-emerald-400'
                                : isHidden
                                ? 'bg-amber-400'
                                : game.status === 'REJECTED'
                                ? 'bg-rose-400'
                                : 'bg-blue-400'
                            }`}
                          />
                          {game.status}
                        </span>
                        {game.reviewedByAdmin && (
                          <div className="text-[9px] text-blue-400/40 mt-1 flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5" />
                            by @{game.reviewedByAdmin.username}
                          </div>
                        )}
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* QA Certification Dossier Inspector */}
                          <button
                            onClick={() => setSelectedDossierGame(game)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Inspect QA Certification Dossier & Telemetry"
                          >
                            <FileText className="w-3 h-3 text-cyan-400" />
                            QA Dossier
                          </button>

                          {isPublished && (
                            <button
                              onClick={() => openModerationModal(game, 'HIDDEN')}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <EyeOff className="w-3 h-3" />
                              Delist Title
                            </button>
                          )}

                          {isHidden && (
                            <button
                              onClick={() => openModerationModal(game, 'PUBLISHED')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Relist Title
                            </button>
                          )}

                          {game.status === 'PENDING' && (
                            <a
                              href="/admin/certification"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-[11px] font-mono transition-colors"
                            >
                              Review Queue &rarr;
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Action Modal */}
      <AnimatePresence>
        {modTargetGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#090E1F] border border-blue-800/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                    {targetStatus === 'HIDDEN' ? 'Delist Title from Storefront' : 'Relist Title to Storefront'}
                  </h3>
                </div>
                <button
                  onClick={() => setModTargetGame(null)}
                  className="text-blue-300/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/40 flex items-center gap-3">
                <img
                  src={modTargetGame.media?.coverImageUrl || '/placeholder.png'}
                  alt=""
                  className="w-10 h-14 object-cover rounded bg-black border border-blue-900/40 shrink-0"
                />
                <div>
                  <div className="font-bold text-white text-sm">{modTargetGame.title}</div>
                  <div className="text-xs text-blue-300/60 font-mono">
                    Studio: @{modTargetGame.developer?.username}
                  </div>
                </div>
              </div>

              <div className="space-y-3 font-mono">
                <label className="text-xs text-blue-200/80 uppercase block">
                  Directive Category
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {targetStatus === 'HIDDEN' ? (
                    <>
                      {['DMCA_TAKEDOWN', 'MALICIOUS_CONTENT', 'CRITICAL_BUG', 'DEVELOPER_REQUEST'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setReasonCategory(cat)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            reasonCategory === cat
                              ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                              : 'bg-blue-950/20 border-blue-900/40 text-blue-300/60 hover:bg-blue-950/40'
                          }`}
                        >
                          {cat.replace('_', ' ')}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['COMPLIANCE_RESOLVED', 'STANDARD_RELEASE', 'LEGAL_CLEARANCE', 'RESTORE_SERVICE'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setReasonCategory(cat)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            reasonCategory === cat
                              ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                              : 'bg-blue-950/20 border-blue-900/40 text-blue-300/60 hover:bg-blue-950/40'
                          }`}
                        >
                          {cat.replace('_', ' ')}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 font-mono">
                <label className="text-xs text-blue-200/80 uppercase block">
                  Staff Incident Note (Logged to Flight Recorder)
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Provide detailed incident justification for staff logs..."
                  rows={3}
                  className="w-full bg-[#050814] border border-blue-900/50 focus:border-blue-500 rounded-xl p-3 text-xs text-blue-100 placeholder:text-blue-400/30 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-900/30 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setModTargetGame(null)}
                  className="px-4 py-2.5 rounded-xl bg-blue-950/40 text-blue-300/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleExecuteModeration}
                  className={`px-5 py-2.5 rounded-xl font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                    targetStatus === 'HIDDEN'
                      ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-lg shadow-amber-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : targetStatus === 'HIDDEN' ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  Confirm Directive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QA Certification Dossier Modal */}
      <QADossierModal
        game={selectedDossierGame}
        onClose={() => setSelectedDossierGame(null)}
      />
    </div>
  );
}

