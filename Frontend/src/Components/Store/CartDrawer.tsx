import { useState } from 'react';
import { X, Trash2, CreditCard, CheckCircle, Coins } from 'lucide-react';
import { useCart } from '../../Context/CartContext';
import { useWallet } from '../../Context/WalletContext';
import { checkoutWithWalletAPI } from '../../Services/Wallet.service';
import { Link } from 'react-router-dom';

import { api } from '../../Api/Axios';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, total, clearCart } = useCart();
  const { balance, refreshWallet } = useWallet();
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasEnoughPTS = balance >= total && total > 0;

  const handleWalletCheckout = async () => {
    try {
      setCheckoutStatus('processing');
      setErrorMessage(null);

      const response = await checkoutWithWalletAPI({
        items: items.map(item => ({
          gameId: item.gameId,
          editionName: item.editionName,
        })),
      });

      if (response.success) {
        setCheckoutStatus('success');
        clearCart();
        await refreshWallet();
        setTimeout(() => {
          onClose();
          setCheckoutStatus('idle');
        }, 1800);
      } else {
        setCheckoutStatus('idle');
        setErrorMessage(response.message || 'Payment initialization failed');
      }
    } catch (err: any) {
      console.error('Wallet checkout error:', err);
      setCheckoutStatus('idle');
      setErrorMessage(err.response?.data?.message || 'Error executing wallet checkout');
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutStatus('processing');
      setErrorMessage(null);

      const response = await api.post('/payments/cart-checkout', {
        items: items.map(item => ({
          gameId: item.gameId,
          editionName: item.editionName,
        })),
      });

      if (response.data.success && response.data.checkoutUrl) {
        // Redirect to secure Stripe checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        setCheckoutStatus('idle');
        setErrorMessage(response.data.message || 'Payment initialization failed');
      }
    } catch (err: any) {
      console.error('Cart checkout error:', err);
      setCheckoutStatus('idle');
      setErrorMessage(err.response?.data?.message || 'Error connecting to payment gateway');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Payment Processing Modal */}
      {checkoutStatus !== 'idle' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center animate-in fade-in zoom-in duration-500">
          <div className="bg-[#0D1117] border border-[#30363D] p-8 rounded-md shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col items-center justify-center w-full max-w-sm">
            {checkoutStatus === 'processing' ? (
              <>
                <div className="w-16 h-16 border-4 border-[#161b22] border-t-emerald-500 rounded-full animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
                <p className="text-[#8B949E] text-sm text-center">Connecting to secure gateway. Please do not close this window.</p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle className="h-20 w-20 text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                <p className="text-[#8B949E] text-sm text-center">Your items have been added to your library.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0D1117] border-l border-[#30363D] z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363D] bg-[#161b22]">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-emerald-400">~/</span> Cart
          </h2>
          <button onClick={onClose} className="text-[#8B949E] hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#8B949E]">
              <p className="mb-2">Your cart is empty.</p>
              <p className="text-xs">Browse the store to find something you like.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={`${item.gameId}-${item.editionName}-${idx}`} className="bg-[#161b22] border border-[#30363D] rounded-md p-3 flex gap-3">
                  {item.coverImageUrl ? (
                    <img src={item.coverImageUrl} alt={item.title} className="w-16 h-20 object-cover rounded-sm border border-[#30363D]" />
                  ) : (
                    <div className="w-16 h-20 bg-black border border-[#30363D] rounded-sm flex items-center justify-center">
                      <span className="text-xs text-[#8B949E]">No IMG</span>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                      <p className="text-xs text-emerald-400 mt-1">{item.editionName}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-white">₹{item.price.toFixed(2)}</span>
                      <button 
                        onClick={() => removeFromCart(item.gameId, item.editionName)}
                        className="text-[#8B949E] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-[#161b22] border-t border-[#30363D] mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#8B949E] uppercase tracking-widest text-xs">Total:</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest"
                >
                  Clear All
                </button>
                <span className="text-xl font-bold text-white">₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            {errorMessage && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                {errorMessage}
              </div>
            )}

            {/* Dual Checkout Options */}
            <div className="space-y-2">
              {/* Option 1: Instant PTS Wallet */}
              {hasEnoughPTS ? (
                <button
                  onClick={handleWalletCheckout}
                  disabled={checkoutStatus === 'processing'}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-black font-black rounded-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] text-xs uppercase tracking-wider"
                >
                  <Coins className="h-4 w-4" />
                  <span>1-Click Pay ₹{total.toFixed(2)} PTS (Vault: ₹{balance.toFixed(0)})</span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 bg-[#0D1117] border border-[#30363D] rounded text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#8B949E]">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    <span>PTS Vault: ₹{balance.toFixed(0)}</span>
                  </div>
                  <Link
                    to="/store/wallet"
                    onClick={onClose}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    + Top Up PTS
                  </Link>
                </div>
              )}

              {/* Option 2: Stripe Gateway */}
              <button 
                onClick={handleCheckout}
                disabled={checkoutStatus === 'processing'}
                className="w-full py-2.5 bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] hover:border-emerald-500/50 disabled:opacity-50 text-white font-bold rounded-sm flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider"
              >
                <CreditCard className="h-4 w-4 text-[#8B949E]" />
                <span>{checkoutStatus === 'processing' ? 'Connecting to Stripe...' : `Pay ₹${total.toFixed(2)} with Stripe`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
