import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Coins,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Download,
  Sliders,
  CheckCircle2,
  Users,
  CreditCard,
  Send,
  History,
  CheckCheck,
  X,
  AlertCircle,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import {
  getTreasuryLedgerAPI,
  getEmpireMetricsAPI,
  updatePlatformRoyaltyRateAPI,
  getDeveloperPayoutsAPI,
  disburseDeveloperPayoutAPI,
} from '../../../Services/Governance.service';
import { useToast } from '../../../Context/ToastContext';

export default function TreasuryLedger() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'ledger' | 'payouts'>('ledger');

  // Ledger state
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [royaltyRate, setRoyaltyRate] = useState<number>(30);
  const [currentSavedRate, setCurrentSavedRate] = useState<number>(30);
  const [savingRate, setSavingRate] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Developer Payouts state
  const [payoutsData, setPayoutsData] = useState<{
    rosters: any[];
    recentPayouts: any[];
    summary: any;
  } | null>(null);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // Clearance Modal state
  const [disbursingDev, setDisbursingDev] = useState<any | null>(null);
  const [disburseAmount, setDisburseAmount] = useState<number>(0);
  const [disburseNotes, setDisburseNotes] = useState<string>('');
  const [disbursing, setDisbursing] = useState(false);
  const [disburseReceipt, setDisburseReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetchLedger();
    fetchMetrics();
    fetchPayouts();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await getEmpireMetricsAPI();
      if (data?.platformRoyaltyRate !== undefined) {
        setRoyaltyRate(data.platformRoyaltyRate);
        setCurrentSavedRate(data.platformRoyaltyRate);
      }
    } catch (e) {
      console.error('Failed to load royalty rate:', e);
    }
  };

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const data = await getTreasuryLedgerAPI();
      setLedger(data);
    } catch (err) {
      console.error('Failed to load treasury ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      setLoadingPayouts(true);
      const data = await getDeveloperPayoutsAPI();
      setPayoutsData(data);
    } catch (err) {
      console.error('Failed to load developer payouts:', err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleSaveRoyaltyRate = async () => {
    try {
      setSavingRate(true);
      await updatePlatformRoyaltyRateAPI(royaltyRate);
      setCurrentSavedRate(royaltyRate);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast.success('Platform royalty rate successfully updated');
      fetchLedger();
      fetchPayouts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update royalty rate');
    } finally {
      setSavingRate(false);
    }
  };

  const handleOpenDisburseModal = (dev: any) => {
    setDisbursingDev(dev);
    setDisburseAmount(Number(dev.pendingBalance.toFixed(2)));
    setDisburseNotes(`Royalty settlement clearance for @${dev.developerUsername}`);
  };

  const handleExecuteDisbursal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disbursingDev || disburseAmount <= 0) return;

    try {
      setDisbursing(true);
      const result = await disburseDeveloperPayoutAPI({
        developerId: disbursingDev.developerId,
        amount: disburseAmount,
        notes: disburseNotes,
      });

      setDisburseReceipt(result);
      setDisbursingDev(null);
      toast.success(`Disbursal of ₹${disburseAmount.toLocaleString('en-IN')} approved`);
      await fetchPayouts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Disbursal clearance failed');
    } finally {
      setDisbursing(false);
    }
  };

  const exportLedgerCSV = () => {
    if (ledger.length === 0) {
      toast.warning('No ledger transactions available to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Buyer Username',
      'Buyer Email',
      'Game Title',
      'Edition',
      'Developer',
      'Gross Inflow (INR)',
      'Platform Cut (INR)',
      'Developer Cut (INR)',
      'Timestamp',
    ];

    const rows = ledger.map((item) => [
      `"${item.id}"`,
      `"${item.buyer}"`,
      `"${item.buyerEmail || ''}"`,
      `"${item.gameTitle?.replace(/"/g, '""') || ''}"`,
      `"${item.edition || 'STANDARD'}"`,
      `"${item.developer}"`,
      item.grossAmount,
      item.platformCut,
      item.developerCut,
      `"${new Date(item.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gamestation_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Ledger CSV exported successfully');
  };

  const exportPayoutsCSV = () => {
    if (!payoutsData || payoutsData.rosters.length === 0) {
      toast.warning('No developer settlement records available to export.');
      return;
    }

    const headers = [
      'Developer ID',
      'Username',
      'Email',
      'Published Titles',
      'Total Sales Count',
      'Gross Volume (INR)',
      'Platform Cut (INR)',
      'Net Royalties Earned (INR)',
      'Total Disbursed (INR)',
      'Pending Balance (INR)',
      'Status',
    ];

    const rows = payoutsData.rosters.map((dev) => [
      `"${dev.developerId}"`,
      `"${dev.developerUsername}"`,
      `"${dev.developerEmail}"`,
      dev.titlesCount,
      dev.salesCount,
      dev.grossVolume.toFixed(2),
      dev.platformRoyaltyCut.toFixed(2),
      dev.netRoyaltyEarned.toFixed(2),
      dev.totalDisbursed.toFixed(2),
      dev.pendingBalance.toFixed(2),
      `"${dev.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gamestation_developer_payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalGross = ledger.reduce((acc, curr) => acc + Number(curr.grossAmount), 0);
  const totalRoyalties = ledger.reduce((acc, curr) => acc + Number(curr.platformCut), 0);
  const totalDeveloperPayouts = ledger.reduce((acc, curr) => acc + Number(curr.developerCut), 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden shadow-2xl select-none space-y-5 font-sans"
    >
      {/* ── Top Navigation Tabs & Rate Controller Strip ────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0e0e16] border border-white/[0.08] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-[#FF1E27] text-white shadow-[0_0_15px_rgba(255,30,39,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Storefront Inflow Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-[#FF1E27] text-white shadow-[0_0_15px_rgba(255,30,39,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Developer Royalty Settlements</span>
            {payoutsData && payoutsData.summary.totalPendingDisbursals > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Dynamic Take-Rate Control Pill */}
        <div className="flex items-center gap-3 bg-[#0e0e16] p-2.5 px-4 rounded-2xl border border-white/[0.08] text-xs font-mono shadow-lg">
          <Sliders className="w-4 h-4 text-[#FF1E27]" />
          <span className="text-zinc-400">Platform Take-Rate:</span>
          <span className="font-bold text-white text-sm tabular-nums text-[#FF1E27]">{royaltyRate}%</span>
          {royaltyRate !== currentSavedRate && (
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              (Live: {currentSavedRate}%)
            </span>
          )}
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={royaltyRate}
            onChange={(e) => setRoyaltyRate(Number(e.target.value))}
            className="w-24 accent-[#FF1E27] cursor-pointer"
          />
          <button
            type="button"
            onClick={handleSaveRoyaltyRate}
            disabled={savingRate || royaltyRate === currentSavedRate}
            className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              royaltyRate !== currentSavedRate
                ? 'bg-[#FF1E27] text-white cursor-pointer hover:bg-[#E0151E] shadow-[0_0_15px_rgba(255,30,39,0.5)] animate-pulse'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {saveSuccess ? 'Saved' : savingRate ? 'Saving...' : `Apply (${royaltyRate}%)`}
          </button>
        </div>
      </div>

      {/* ── Summary Cards (Context-aware) ─────────────────────────────── */}
      {activeTab === 'ledger' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0d0d12]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Cumulative Gross Inflow
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              ₹ {totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-zinc-500 font-sans mt-0.5 block">100% Volume Executed</span>
          </div>

          <div className="p-4 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-[#0d0d12]">
            <span className="text-[10px] font-mono text-[#FF1E27] font-bold uppercase tracking-wider block">
              Sovereign Treasury ({royaltyRate}% Cut)
            </span>
            <span className="text-2xl font-black font-mono text-[#FF1E27] mt-1 block drop-shadow-[0_0_12px_rgba(255,30,39,0.4)]">
              ₹ {((totalGross * royaltyRate) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-red-400/80 font-sans mt-0.5 block">
              {royaltyRate !== currentSavedRate ? `Projected at ${royaltyRate}% take-rate` : 'Net Retained Platform Royalties'}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-[#0d0d12]">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
              Developer Royalties Share ({100 - royaltyRate}%)
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              ₹ {(totalGross - (totalGross * royaltyRate) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-zinc-500 font-sans mt-0.5 block">
              {royaltyRate !== currentSavedRate ? `Projected at ${100 - royaltyRate}% payout` : 'Creator Disbursed Royalties'}
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-[#0d0d12]">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
              Pending Unsettled Balances
            </span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1 block drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              ₹ {(payoutsData?.summary?.totalPendingDisbursals || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-400/80 font-sans mt-0.5 block">Awaiting Sovereign Clearance</span>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-[#0d0d12]">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              Total Cleared Disbursals
            </span>
            <span className="text-2xl font-black font-mono text-emerald-300 mt-1 block drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              ₹ {(payoutsData?.summary?.totalClearedDisbursals || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-sans mt-0.5 block">Successfully Paid to Studios</span>
          </div>

          <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0d0d12]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Registered Developer Guild
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {payoutsData?.rosters?.length || 0} Studios
            </span>
            <span className="text-[10px] text-zinc-500 font-sans mt-0.5 block">
              Split: {payoutsData?.summary?.developerSharePercent || 70}% Dev / {payoutsData?.summary?.platformTakeRate || 30}% Platform
            </span>
          </div>
        </div>
      )}

      {/* ── TAB 1: Inflow Transactions Ledger ──────────────────────────── */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d12]">
          <div className="p-6 sm:p-7 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF1E27]" />
                <span>Sovereign Financial Ledger</span>
                <span className="text-[10px] font-mono font-bold text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-full">
                  {ledger.length} SETTLEMENTS
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Itemized cryptographic audit trail of store sales, Stripe gateway captures, and sovereign fee splits
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportLedgerCSV}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono font-medium text-zinc-300 hover:text-white bg-[#14141c] hover:bg-[#1e1e28] border border-white/[0.08] transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#FF1E27]" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={fetchLedger}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#14141c] border border-white/[0.08] transition-colors cursor-pointer"
                title="Refresh Ledger"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF1E27]' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#121218] text-zinc-400 text-xs font-mono uppercase tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-4 px-6">Purchaser</th>
                  <th className="py-4 px-6">Title & Edition</th>
                  <th className="py-4 px-6">Developer</th>
                  <th className="py-4 px-6">Gross Inflow</th>
                  <th className="py-4 px-6 text-[#FF1E27]">Sovereign {currentSavedRate}% Cut</th>
                  <th className="py-4 px-6 text-right">Settled Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                    <td className="py-4 px-6">
                      <span className="font-semibold text-white block">@{item.buyer}</span>
                      <span className="text-[10px] text-zinc-500 block truncate">{item.buyerEmail}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-zinc-200 block">{item.gameTitle}</span>
                      <span className="text-[10px] text-zinc-500 block">{item.edition}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-zinc-300">
                      @{item.developer}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-white">
                      ₹ {Number(item.grossAmount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm font-black text-[#FF1E27]">
                      + ₹ {Number(item.platformCut).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-zinc-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-zinc-500 font-mono">
                      {loading ? 'Compiling financial ledger...' : 'No purchases recorded in ledger yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Developer Royalty Disbursals Engine ─────────────────── */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          {/* Developer Settlement Roster */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d12]">
            <div className="p-6 sm:p-7 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FF1E27]" />
                  <span>Developer Royalty Settlement Roster</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {payoutsData?.rosters?.length || 0} PARTNERS
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Reconciled 70% net royalties balances against gross sales, sovereign commission, and historical disbursals
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportPayoutsCSV}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono font-medium text-zinc-300 hover:text-white bg-[#14141c] hover:bg-[#1e1e28] border border-white/[0.08] transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Payouts CSV</span>
                </button>
                <button
                  onClick={fetchPayouts}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#14141c] border border-white/[0.08] transition-colors cursor-pointer"
                  title="Refresh Settlements"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPayouts ? 'animate-spin text-[#FF1E27]' : ''}`} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead className="bg-[#121218] text-zinc-400 text-xs uppercase tracking-wider border-b border-white/[0.06]">
                  <tr>
                    <th className="py-4 px-6">Creator / Studio</th>
                    <th className="py-4 px-6">Titles &amp; Volume</th>
                    <th className="py-4 px-6">Gross Inflow</th>
                    <th className="py-4 px-6 text-zinc-400">Net Earned (70%)</th>
                    <th className="py-4 px-6 text-emerald-400">Disbursed</th>
                    <th className="py-4 px-6 text-amber-400 font-bold">Pending Balance</th>
                    <th className="py-4 px-6 text-right">Clearance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {payoutsData?.rosters?.map((dev) => (
                    <tr key={dev.developerId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-white block">@{dev.developerUsername}</span>
                        <span className="text-[10px] text-zinc-500 block truncate">{dev.developerEmail}</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-zinc-300">
                        <span>{dev.titlesCount} Title(s)</span> &bull; <span>{dev.salesCount} Sales</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-white">
                        ₹ {dev.grossVolume.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-xs text-zinc-300">
                        ₹ {dev.netRoyaltyEarned.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-xs text-emerald-400 font-medium">
                        ₹ {dev.totalDisbursed.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-sm font-bold block ${
                            dev.pendingBalance > 0
                              ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                              : 'text-zinc-500'
                          }`}
                        >
                          ₹ {dev.pendingBalance.toFixed(2)}
                        </span>
                        {dev.pendingBalance > 0 ? (
                          <span className="text-[9px] uppercase tracking-wider text-amber-400/80 block">
                            Settlement Due
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">
                            Reconciled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDisburseModal(dev)}
                          disabled={dev.pendingBalance <= 0}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                            dev.pendingBalance > 0
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95'
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          Disburse Royalty
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!payoutsData || payoutsData.rosters.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-zinc-500 font-mono">
                        {loadingPayouts ? 'Compiling developer rosters...' : 'No developer accounts found in database.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payouts Audit Trail */}
          {payoutsData?.recentPayouts && payoutsData.recentPayouts.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d12]">
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#FF1E27]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Historical Disbursals Audit Trail ({payoutsData.recentPayouts.length} Recorded)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#121218] text-zinc-400 uppercase tracking-wider border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-6">Reference Code</th>
                      <th className="py-3 px-6">Developer</th>
                      <th className="py-3 px-6">Amount Cleared</th>
                      <th className="py-3 px-6">Audit Memo</th>
                      <th className="py-3 px-6 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {payoutsData.recentPayouts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-6 text-emerald-400 font-bold">
                          {p.referenceCode}
                        </td>
                        <td className="py-3 px-6 text-white font-semibold">
                          @{p.developerUsername}
                        </td>
                        <td className="py-3 px-6 text-white font-bold text-sm">
                          ₹ {Number(p.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-6 text-zinc-400 truncate max-w-xs">
                          {p.notes || 'Royalty settlement'}
                        </td>
                        <td className="py-3 px-6 text-right text-zinc-500">
                          {new Date(p.disbursedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Disbursal Clearance Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {disbursingDev && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDisbursingDev(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 max-w-md w-full rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5"
              style={{
                background: '#0d0d12',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase">
                      Clear Developer Royalty Payout
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono">
                      Payee: <strong className="text-white">@{disbursingDev.developerUsername}</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDisbursingDev(null)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Gross Sales Generated:</span>
                  <span className="text-white font-semibold">₹ {disbursingDev.grossVolume.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Total Royalty Earned (70%):</span>
                  <span className="text-white font-semibold">₹ {disbursingDev.netRoyaltyEarned.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Prior Cleared Disbursals:</span>
                  <span className="text-emerald-400 font-semibold">₹ {disbursingDev.totalDisbursed.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/[0.06] text-amber-400 font-bold">
                  <span>Outstanding Pending Balance:</span>
                  <span className="text-base text-amber-300">₹ {disbursingDev.pendingBalance.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleExecuteDisbursal} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Disbursal Settlement Amount (INR):
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={disbursingDev.pendingBalance}
                    value={disburseAmount}
                    onChange={(e) => setDisburseAmount(Number(e.target.value))}
                    className="w-full bg-[#14141c] border border-white/[0.1] focus:border-emerald-500 rounded-xl p-3 text-white font-bold text-sm outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Settlement Notes &amp; Audit Memo:
                  </span>
                  <input
                    type="text"
                    value={disburseNotes}
                    onChange={(e) => setDisburseNotes(e.target.value)}
                    placeholder="e.g. November 2026 milestone clearance..."
                    className="w-full bg-[#14141c] border border-white/[0.1] focus:border-emerald-500 rounded-xl p-3 text-zinc-200 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisbursingDev(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 bg-[#161620] hover:bg-[#20202d] border border-white/[0.08]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disbursing || disburseAmount <= 0}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    {disbursing ? 'Authorizing...' : 'Sign & Disburse'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Settlement Receipt Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {disburseReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDisburseReceipt(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 max-w-md w-full rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 text-center font-mono"
              style={{
                background: '#0d0d12',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCheck className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Settlement Cleared Successfully
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Royalty payout has been logged in the Sovereign Flight Recorder and creator ledger.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Reference Code:</span>
                  <span className="text-emerald-400 font-bold">{disburseReceipt.referenceCode}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Payee Creator:</span>
                  <span className="text-white font-semibold">@{disburseReceipt.developerUsername}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Disbursed Amount:</span>
                  <span className="text-emerald-300 font-bold text-sm">
                    ₹ {Number(disburseReceipt.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 uppercase font-black text-[10px]">
                    SETTLED // FLIGHT RECORDER SIGNED
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDisburseReceipt(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                Close Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
