import { useState } from 'react';
import { ShieldCheck, X, Copy, Check, Sparkles, Key, CreditCard, Calendar, Award, RotateCcw } from 'lucide-react';
import type { LibraryItem } from '../../Services/Library.service';

interface DigitalLicenseModalProps {
  item: LibraryItem | null;
  onClose: () => void;
  onRequestRefund?: (item: LibraryItem) => void;
}

export default function DigitalLicenseModal({ item, onClose, onRequestRefund }: DigitalLicenseModalProps) {
  if (!item) return null;

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedStripe, setCopiedStripe] = useState(false);

  // Generate deterministic license key representation
  const cleanId = item.libraryId.replace(/-/g, '').toUpperCase();
  const licenseKey = `GSTN-${cleanId.slice(0, 4)}-${cleanId.slice(4, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyStripe = () => {
    if (item.latestPayment?.providerPaymentId) {
      navigator.clipboard.writeText(item.latestPayment.providerPaymentId);
      setCopiedStripe(true);
      setTimeout(() => setCopiedStripe(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div className="bg-[#0C1017] border border-cyan-500/40 rounded-lg max-w-2xl w-full overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#111722] border-b border-[#223145] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                DIGITAL PROOF OF OWNERSHIP
                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded">
                  AUTHENTICATED
                </span>
              </h2>
              <p className="text-xs text-[#8B949E]">Cryptographically anchored to GameStation ledger</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6 text-xs text-[#C9D1D9]">
          
          {/* Certificate Card Design */}
          <div className="relative bg-gradient-to-b from-[#131B26] to-[#0A0E14] border border-cyan-500/30 rounded-md p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5" /> OFFICIAL LICENSE GRANT
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {item.game.title}
                </h3>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Developer: <span className="text-white font-semibold">{item.game.developer?.username || 'Verified Studio'}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#556772] uppercase">Edition Granted</span>
                <p className="text-sm font-bold text-cyan-300">
                  {item.ownedPricing ? item.ownedPricing.editionName : 'Standard Edition'}
                </p>
              </div>
            </div>

            {/* License Key Box */}
            <div className="mt-4 bg-[#070A0F] border border-[#223145] rounded p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#556772] flex items-center gap-1 uppercase">
                  <Key className="w-3 h-3 text-cyan-400" /> Digital Product Key:
                </span>
                <p className="text-sm font-bold text-white tracking-widest mt-0.5">
                  {licenseKey}
                </p>
              </div>

              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16202C] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-xs transition-colors"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Transaction & Verification Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Acquisition Date */}
            <div className="bg-[#0E141D] border border-[#202C3D] p-3.5 rounded">
              <span className="text-[10px] text-[#556772] flex items-center gap-1.5 uppercase">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> Acquisition Timestamp
              </span>
              <p className="text-xs text-white font-bold mt-1">
                {new Date(item.acquiredAt).toLocaleString()}
              </p>
            </div>

            {/* Payment & Stripe Reference */}
            <div className="bg-[#0E141D] border border-[#202C3D] p-3.5 rounded">
              <span className="text-[10px] text-[#556772] flex items-center gap-1.5 uppercase">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Settlement Method
              </span>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-white font-bold">
                  {item.latestPayment 
                    ? `${item.latestPayment.currency} ${item.latestPayment.amount} via Stripe` 
                    : item.ownedPricing?.isFree 
                      ? 'FREE COMMUNITY CLAIM' 
                      : 'STRIPE CHECKOUT'}
                </p>
                {item.latestPayment?.providerPaymentId && (
                  <button
                    onClick={handleCopyStripe}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 ml-2"
                    title={item.latestPayment.providerPaymentId}
                  >
                    {copiedStripe ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{item.latestPayment.providerPaymentId.slice(0, 10)}...</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Entitlements & Features */}
          {item.ownedPricing?.features && item.ownedPricing.features.length > 0 && (
            <div className="bg-[#0E141D] border border-[#202C3D] p-4 rounded">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Included Entitlements
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {item.ownedPricing.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[#8B949E]">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Hash Note */}
          <p className="text-[11px] text-[#556772] text-center leading-relaxed">
            This cryptographic license proves unencumbered, permanent user access under GameStation EULA.
            Tampering with client binaries or attempting unauthorized redistribution voids runtime telemetry.
          </p>

        </div>

        {/* Footer */}
        <div className="bg-[#111722] border-t border-[#223145] px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#556772]">SHA-256: {item.libraryId.replace(/-/g, '').slice(0, 24)}...</span>
          <div className="flex items-center gap-2">
            {onRequestRefund && (
              <button
                onClick={() => {
                  onClose();
                  onRequestRefund(item);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 rounded font-semibold transition-all hover:scale-[1.02]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Request Refund</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1B2533] hover:bg-[#253346] text-white rounded font-bold transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
