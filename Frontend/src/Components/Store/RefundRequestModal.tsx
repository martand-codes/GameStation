import { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Coins, 
  CreditCard,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { 
  getRefundEligibilityAPI, 
  requestRefundAPI, 
  type RefundEligibility 
} from '../../Services/Refund.service';
import { useWallet } from '../../Context/WalletContext';

interface RefundRequestModalProps {
  gameId: string | null;
  gameTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onRefundSuccess: (refundedAmount: number, method: 'WALLET' | 'STRIPE') => void;
}

export default function RefundRequestModal({
  gameId,
  gameTitle,
  isOpen,
  onClose,
  onRefundSuccess,
}: RefundRequestModalProps) {
  const { refreshWallet } = useWallet();
  const [eligibility, setEligibility] = useState<RefundEligibility | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<'WALLET' | 'ORIGINAL_PAYMENT'>('WALLET');
  const [reason, setReason] = useState<string>('Performance issues / bugs');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ amount: number; method: string } | null>(null);

  useEffect(() => {
    if (isOpen && gameId) {
      fetchEligibility(gameId);
    } else {
      setEligibility(null);
      setError(null);
      setSuccessInfo(null);
      setIsSubmitting(false);
    }
  }, [isOpen, gameId]);

  const fetchEligibility = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRefundEligibilityAPI(id);
      if (res.success && res.data) {
        setEligibility(res.data);
        // If originally bought with wallet, lock refund target to wallet
        if (res.data.provider === 'wallet') {
          setRefundTarget('WALLET');
        }
      } else {
        setError('Unable to retrieve refund evaluation.');
      }
    } catch (err: any) {
      console.error('Eligibility check failed:', err);
      setError(err.response?.data?.message || 'Failed to check refund eligibility.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRefund = async () => {
    if (!gameId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await requestRefundAPI(gameId, refundTarget, reason);
      if (res.success) {
        setSuccessInfo({ amount: res.refundedAmount, method: res.refundMethod });
        await refreshWallet();
        onRefundSuccess(res.refundedAmount, res.refundMethod);
      } else {
        setError(res.message || 'Refund processing failed.');
      }
    } catch (err: any) {
      console.error('Refund execution failed:', err);
      setError(err.response?.data?.message || 'Error executing refund on server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="bg-[#0B0F14] border border-[#30363D] rounded-lg max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Terminal Header */}
        <div className="bg-[#121820] border-b border-[#253240] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
              Dispute Protocol // Request Refund
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Game Title Bar */}
          <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8B949E]">Target Node</p>
              <h3 className="text-base font-bold text-white line-clamp-1">
                {eligibility?.gameTitle || gameTitle || 'Unknown Game'}
              </h3>
            </div>
            {eligibility && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-[#8B949E]">Refundable</p>
                <p className="text-base font-black text-emerald-400">
                  ₹{eligibility.refundableAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#8B949E]">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-xs">Evaluating telemetry and purchase timestamps against Steam 14-day / 2-hour rules...</p>
            </div>
          )}

          {/* Success State */}
          {successInfo && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
              <div>
                <h4 className="text-xl font-black text-white">Refund Authorized!</h4>
                <p className="text-xs text-[#8B949E] mt-1">
                  License has been revoked and ₹{successInfo.amount.toFixed(2)} has been refunded via{' '}
                  <span className="text-emerald-400 font-bold">
                    {successInfo.method === 'WALLET' ? 'GameStation PTS Wallet (Instant)' : 'Original Payment Gateway'}
                  </span>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded uppercase tracking-wider"
              >
                Close Terminal
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && !successInfo && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Eligibility Rules Report */}
          {eligibility && !loading && !successInfo && (
            <>
              {/* Rules Evaluation Box */}
              <div className="bg-[#121820] border border-[#253240] rounded p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-[#8B949E] font-bold">
                  Rule Evaluation (Steam Policy Standard)
                </p>

                {/* Playtime Check */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#8B949E]" />
                    <span>Playtime limit (&le; 2 hours / 120 mins):</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    {eligibility.playTimePass ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {eligibility.playTimeMinutes}m / 120m [PASS]
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        {eligibility.playTimeMinutes}m / 120m [EXCEEDED]
                      </span>
                    )}
                  </div>
                </div>

                {/* Purchase Window Check */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#8B949E]" />
                    <span>Purchase date limit (&le; 14 days):</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    {eligibility.purchaseDatePass ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {eligibility.daysSincePurchase}d ago [PASS]
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        {eligibility.daysSincePurchase}d ago [EXPIRED]
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* If Eligible: Form */}
              {eligibility.isEligible ? (
                <div className="space-y-4">
                  {/* Select Destination */}
                  <div>
                    <label className="text-xs text-[#8B949E] block mb-2 font-bold uppercase">
                      Select Refund Destination
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* PTS Option */}
                      <div
                        onClick={() => setRefundTarget('WALLET')}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          refundTarget === 'WALLET'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'border-[#253240] bg-[#121820] text-[#8B949E] hover:border-[#384b5f]'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 mb-1">
                          <Coins className="h-4 w-4" />
                          <span>GameStation PTS</span>
                        </div>
                        <p className="text-[10px] text-[#8B949E]">
                          ⚡ Instant credit to your PTS Wallet. Use right away.
                        </p>
                      </div>

                      {/* Stripe Option */}
                      <div
                        onClick={() => {
                          if (eligibility.provider !== 'wallet') {
                            setRefundTarget('ORIGINAL_PAYMENT');
                          }
                        }}
                        className={`p-3 rounded border transition-all ${
                          eligibility.provider === 'wallet'
                            ? 'opacity-40 cursor-not-allowed border-[#253240] bg-[#121820]'
                            : refundTarget === 'ORIGINAL_PAYMENT'
                            ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer'
                            : 'border-[#253240] bg-[#121820] text-[#8B949E] hover:border-[#384b5f] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-cyan-400 mb-1">
                          <CreditCard className="h-4 w-4" />
                          <span>Original Card / UPI</span>
                        </div>
                        <p className="text-[10px] text-[#8B949E]">
                          {eligibility.provider === 'wallet'
                            ? 'Unavailable (Bought with PTS)'
                            : '🏦 Bank reversal via Stripe (5–10 business days)'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reason Dropdown */}
                  <div>
                    <label className="text-xs text-[#8B949E] block mb-1.5 font-bold uppercase">
                      Reason for Revocation
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-[#121820] border border-[#253240] rounded px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="Performance issues / Frequent bugs">Performance issues / Frequent bugs</option>
                      <option value="Doesn't run smoothly on my PC specs">Doesn't run smoothly on my PC specs</option>
                      <option value="Purchased by accident">Purchased by accident</option>
                      <option value="Gameplay isn't what I expected">Gameplay isn't what I expected</option>
                      <option value="Other reason">Other reason</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleConfirmRefund}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing Revocation...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          <span>Authorize Refund of ₹{eligibility.refundableAmount.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-[#8B949E] text-center mt-2">
                      ⚠️ Confirming will immediately remove this game from your Library.
                    </p>
                  </div>
                </div>
              ) : (
                /* Ineligible Warning */
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    <span>Ineligible for Automated Refund</span>
                  </div>
                  <p className="text-[11px] text-[#C9D1D9]">
                    This purchase does not meet the automated refund criteria (&le; 2 hours playtime and &le; 14 days since purchase). If you believe this is an exceptional error, please contact GameStation Support.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
