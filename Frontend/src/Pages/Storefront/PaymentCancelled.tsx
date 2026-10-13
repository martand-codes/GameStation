
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RotateCcw, ShoppingBag, ShieldAlert } from 'lucide-react';

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('game_id');
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 font-mono text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500" />

        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-red-400 tracking-widest uppercase mb-1">
          <ShieldAlert className="w-4 h-4" /> TRANSACTION_ABORTED
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
          Payment Incomplete or Cancelled
        </h1>

        <p className="text-[#8B949E] text-sm max-w-md mx-auto leading-relaxed mb-6">
          The payment session was cancelled. No charges were made to your card or account. Any items in your cart remain saved.
        </p>

        <div className="bg-[#161B22] border border-[#30363D] p-4 rounded-md text-left text-xs text-[#8B949E] mb-8 space-y-1.5">
          <p className="text-white font-bold flex items-center gap-1.5 mb-1">
            Possible reasons:
          </p>
          <p>• You clicked &quot;Back to GameStation&quot; or closed the Stripe checkout.</p>
          <p>• The payment authorization timed out or was declined by your bank.</p>
          <p>• Network interruption during checkout.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {gameId ? (
            <button
              onClick={() => navigate(`/store/games/${gameId}`)}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-sm text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retry Game Checkout
            </button>
          ) : (
            <button
              onClick={() => navigate('/store')}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-sm text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> View Cart & Store
            </button>
          )}

          <button
            onClick={() => navigate('/store')}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#C9D1D9] hover:text-white rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
}
