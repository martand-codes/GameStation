import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../Api/Axios';
import { CheckCircle2, Gamepad2, ArrowRight, ShieldCheck, Terminal, Download, Sparkles } from 'lucide-react';
import { useCart } from '../../Context/CartContext';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear cart since transaction succeeded
    clearCart();

    const verifySession = async () => {
      if (!sessionId) {
        setError('Missing session ID');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/payments/session-status/${sessionId}`);

        if (response.data.success) {
          setSessionData(response.data);
        } else {
          setError(response.data.message || 'Payment not verified');
        }
      } catch (err: any) {
        console.error('Session verification error:', err);
        setError('Could not verify transaction with server');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-[#C9D1D9]">
        <div className="w-16 h-16 border-4 border-[#30363D] border-t-emerald-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
        <h2 className="text-xl font-bold text-white mb-2 tracking-wider flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" /> VERIFYING_BLOCK_CHAIN_RECEIPT...
        </h2>
        <p className="text-sm text-[#8B949E]">Confirming cryptographic license with Stripe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-center max-w-md mx-auto px-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
          <ShieldCheck className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">VERIFICATION NOTICE</h2>
        <p className="text-[#8B949E] text-sm mb-6">{error}</p>
        <button
          onClick={() => navigate('/store')}
          className="px-6 py-2.5 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-white rounded-sm text-sm font-bold transition-all"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-mono animate-in fade-in zoom-in-95 duration-500">
      {/* Top Banner */}
      <div className="bg-gradient-to-b from-emerald-950/40 to-[#0D1117] border border-emerald-500/30 rounded-lg p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />
        
        <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-full mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 tracking-widest uppercase mb-1">
          <Sparkles className="w-4 h-4" /> LICENSE_ACTIVATED
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          ORDER CONFIRMED & ACTIVATED!
        </h1>

        <p className="text-[#8B949E] max-w-xl mx-auto text-sm leading-relaxed">
          Payment successfully processed via Stripe. The game licenses have been permanently tethered to your GameStation ID.
        </p>

        {/* Transaction Meta */}
        <div className="mt-6 pt-6 border-t border-[#30363D]/60 flex flex-wrap justify-center gap-6 text-xs text-[#8B949E]">
          <div>
            <span className="text-[#556772]">STATUS:</span>{' '}
            <span className="text-emerald-400 font-bold">PAID (CONFIRMED)</span>
          </div>
          {sessionData?.amountTotal > 0 && (
            <div>
              <span className="text-[#556772]">AMOUNT:</span>{' '}
              <span className="text-white font-bold">
                {sessionData?.currency} {sessionData?.amountTotal.toFixed(2)}
              </span>
            </div>
          )}
          {sessionData?.customerEmail && (
            <div>
              <span className="text-[#556772]">RECEIPT SENT TO:</span>{' '}
              <span className="text-white font-bold">{sessionData?.customerEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Unlocked Games Grid */}
      {sessionData?.games && sessionData.games.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            Games Added to Your Library ({sessionData.games.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionData.games.map((g: any) => (
              <div
                key={g.id}
                className="bg-[#161B22] border border-[#30363D] hover:border-emerald-500/50 p-4 rounded-md flex gap-4 transition-all group"
              >
                {g.media?.coverImageUrl ? (
                  <img
                    src={g.media.coverImageUrl}
                    alt={g.title}
                    className="w-20 h-28 object-cover rounded-sm border border-[#30363D]"
                  />
                ) : (
                  <div className="w-20 h-28 bg-black rounded-sm border border-[#30363D] flex items-center justify-center">
                    <Gamepad2 className="w-8 h-8 text-[#556772]" />
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-sm font-bold">
                      ACTIVATED
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-xs text-[#8B949E] line-clamp-1 mt-0.5">{g.genre}</p>
                  </div>

                  <button
                    onClick={() => navigate(`/store/games/${g.id}`)}
                    className="mt-3 px-3 py-1.5 bg-[#21262D] hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 rounded-sm text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Launch / Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={() => navigate('/store')}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-sm text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
        >
          Explore More Games <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
