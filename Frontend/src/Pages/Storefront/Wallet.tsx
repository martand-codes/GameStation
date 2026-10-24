import { useState } from 'react';
import { useWallet } from '../../Context/WalletContext';
import { topUpWalletAPI } from '../../Services/Wallet.service';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  Terminal, 
  ExternalLink, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  Gift
} from 'lucide-react';

const PRESET_TIERS = [
  { amount: 100, label: '100 PTS', badge: 'STARTER' },
  { amount: 500, label: '500 PTS', badge: 'RECOMMENDED' },
  { amount: 1000, label: '1,000 PTS', badge: 'POPULAR' },
  { amount: 2500, label: '2,500 PTS', badge: 'WHALE' },
];

export default function Wallet() {
  const { balance, transactions, loading, refreshWallet } = useWallet();
  const [selectedTier, setSelectedTier] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const finalAmount = isCustom ? Number(customAmount) || 0 : selectedTier;

  const handleTopUp = async () => {
    if (finalAmount < 10) {
      setErrorMessage('Minimum top-up amount is ₹10 (10 PTS)');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const res = await topUpWalletAPI(finalAmount);
      if (res.success && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setErrorMessage('Failed to generate top-up checkout session.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Top-up error:', err);
      setErrorMessage(err.response?.data?.message || 'Error communicating with payment gateway');
      setIsProcessing(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-8 font-mono max-w-6xl mx-auto">
      {/* Header Breadcrumb / Terminal Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Coins className="h-4 w-4 animate-spin-slow" />
            <span>CORE_FINANCE://wallet.balance</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#E6EDF3] tracking-tight">
            GameStation <span className="text-emerald-400">PTS</span> Wallet
          </h1>
        </div>

        <button
          onClick={() => refreshWallet()}
          disabled={loading}
          className="flex items-center gap-2 border border-[#30363D] hover:border-emerald-500/50 bg-[#0D1117] text-xs px-3 py-1.5 rounded text-[#8B949E] hover:text-[#C9D1D9] transition-all self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>[REFRESH_LEDGER]</span>
        </button>
      </div>

      {/* Main Holographic Balance Vault */}
      <div className="relative bg-[#0D1117] border border-emerald-500/40 rounded-lg p-6 md:p-8 overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        {/* Subtle Cyber scanline */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz4KPC9zdmc+')] z-10 pointer-events-none opacity-40" />

        <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" /> SECURE_CREDIT_VAULT
              </span>
              <span className="text-xs text-[#8B949E]">CURRENCY: 1 PTS = ₹1.00 INR</span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                ₹{balance.toFixed(2)}
              </span>
              <span className="text-xl md:text-2xl font-bold text-emerald-400/80 tracking-widest">
                PTS
              </span>
            </div>

            <p className="text-xs text-[#8B949E] max-w-xl">
              Use your PTS to purchase any game instantly with zero gateway latency. Instant refunds from eligible game revocations are deposited directly into this vault.
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-[#161B22]/80 border border-[#30363D] p-4 rounded-md text-xs min-w-[240px]">
            <div className="flex justify-between items-center text-[#8B949E]">
              <span>Active Network:</span>
              <span className="text-emerald-400 font-bold">GAMESTATION_MAIN</span>
            </div>
            <div className="flex justify-between items-center text-[#8B949E]">
              <span>Vault ID:</span>
              <span className="text-white font-mono">0x{Math.random().toString(16).substring(2, 8).toUpperCase()}...</span>
            </div>
            <div className="flex justify-between items-center text-[#8B949E]">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top-Up Interface */}
      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6">
        <div className="flex items-center gap-2 border-b border-[#30363D] pb-3 mb-6">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
            Recharge Vault // Top-Up PTS
          </h2>
        </div>

        <p className="text-xs text-[#8B949E] mb-4">
          Select an allotment of GameStation Points to top up via secure Stripe Gateway:
        </p>

        {/* Preset Tier Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {PRESET_TIERS.map((tier) => {
            const isSelected = !isCustom && selectedTier === tier.amount;
            return (
              <button
                key={tier.amount}
                type="button"
                onClick={() => {
                  setIsCustom(false);
                  setSelectedTier(tier.amount);
                }}
                className={`relative flex flex-col items-center justify-center p-5 rounded-md border text-center transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'border-[#30363D] bg-[#161B22] text-[#8B949E] hover:border-[#484F58] hover:text-white'
                }`}
              >
                {tier.badge && (
                  <span className={`absolute -top-2.5 px-2 py-0.5 text-[9px] font-black rounded-sm uppercase tracking-wider ${
                    isSelected ? 'bg-emerald-500 text-black' : 'bg-[#21262D] text-[#8B949E] border border-[#30363D]'
                  }`}>
                    {tier.badge}
                  </span>
                )}
                <span className="text-xl font-black mb-1">{tier.label}</span>
                <span className="text-xs text-emerald-400 font-bold">₹{tier.amount} INR</span>
              </button>
            );
          })}
        </div>

        {/* Custom Amount Field */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-[#161B22] border border-[#30363D] p-4 rounded-md mb-6">
          <label className="text-xs text-[#8B949E] flex items-center gap-2 whitespace-nowrap">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Custom PTS Quantity:</span>
          </label>
          <div className="flex-1 flex items-center bg-[#0D1117] border border-[#30363D] rounded px-3 py-1.5 focus-within:border-emerald-500/60 transition-colors">
            <span className="text-emerald-400 font-bold mr-2 text-sm">₹</span>
            <input
              type="number"
              min="10"
              max="50000"
              placeholder="e.g. 250"
              value={customAmount}
              onChange={(e) => {
                setIsCustom(true);
                setCustomAmount(e.target.value);
              }}
              onFocus={() => setIsCustom(true)}
              className="bg-transparent text-white text-sm w-full outline-none placeholder-[#484F58]"
            />
            <span className="text-xs text-[#8B949E] font-bold">PTS</span>
          </div>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
            <span>[ERROR]</span> {errorMessage}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleTopUp}
          disabled={isProcessing || finalAmount < 10}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold text-sm rounded-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] uppercase tracking-wider"
        >
          <CreditCard className="h-4 w-4" />
          {isProcessing ? 'Connecting to Stripe Gateway...' : `Authorize Recharge of ₹${finalAmount} PTS`}
          <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70" />
        </button>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363D] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
              Cryptographic Transaction History
            </h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            {['ALL', 'TOP_UP', 'GAME_PURCHASE', 'REFUND'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                  filterType === type
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                    : 'border-[#30363D] text-[#8B949E] hover:text-white hover:border-[#484F58]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-[#8B949E] text-xs">
            <Terminal className="h-8 w-8 text-[#30363D] mx-auto mb-2" />
            <p>No transaction records found matching filter [{filterType}].</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#30363D] text-[#8B949E] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Details / Reference</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262D]">
                {filteredTransactions.map((tx) => {
                  const isCredit = tx.type === 'TOP_UP' || tx.type === 'REFUND' || tx.type === 'BONUS';
                  return (
                    <tr key={tx.id} className="hover:bg-[#161B22]/50 transition-colors">
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          tx.type === 'TOP_UP'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.type === 'REFUND'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : tx.type === 'BONUS'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {tx.type === 'TOP_UP' && <ArrowDownLeft className="h-3 w-3" />}
                          {tx.type === 'REFUND' && <RotateCcw className="h-3 w-3" />}
                          {tx.type === 'BONUS' && <Gift className="h-3 w-3" />}
                          {tx.type === 'GAME_PURCHASE' && <ArrowUpRight className="h-3 w-3" />}
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold font-mono">
                        <span className={isCredit ? 'text-emerald-400' : 'text-amber-400'}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)} PTS
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[#C9D1D9]">
                        <p className="line-clamp-1">{tx.description || 'System Ledger Transaction'}</p>
                        {tx.referenceId && (
                          <span className="text-[10px] text-[#484F58]">Ref: {tx.referenceId.slice(0, 18)}...</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right text-[#8B949E] whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
