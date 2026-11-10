import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Check, Copy, X } from 'lucide-react';

interface IssueInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expiryHours: number) => Promise<string | void>;
}

export default function IssueInviteModal({ isOpen, onClose, onSubmit }: IssueInviteModalProps) {
  const [expiryHours, setExpiryHours] = useState(24);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const url = await onSubmit(expiryHours);
      if (url) {
        setGeneratedUrl(url);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModalClose = () => {
    setGeneratedUrl('');
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 max-w-md w-full rounded-2xl p-6 sm:p-7 shadow-2xl select-none"
            style={{
              background: '#0e0e14',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 50px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF1E27]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    Mint Staff Directive
                  </h2>
                  <span className="text-xs text-zinc-400">Single-use recruitment token</span>
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Generate a single-use cryptographic token. The appointed operator can authenticate with
              this link to claim reviewer clearance on the platform.
            </p>

            {!generatedUrl ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2 font-mono">
                    Token Validity Timeout
                  </label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(Number(e.target.value))}
                    className="w-full bg-[#161620] border border-white/[0.1] focus:border-[#FF1E27] rounded-xl px-4 py-3 text-xs text-white outline-none cursor-pointer font-mono"
                  >
                    <option value={12} className="bg-[#161620]">12 hours (High Security)</option>
                    <option value={24} className="bg-[#161620]">24 hours (Standard Protocol)</option>
                    <option value={48} className="bg-[#161620]">48 hours (2 days)</option>
                    <option value={168} className="bg-[#161620]">7 days (Extended Window)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 py-3 px-4 bg-[#181822] hover:bg-[#20202d] text-zinc-400 hover:text-white text-xs font-semibold rounded-xl border border-white/[0.08] transition-all cursor-pointer font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="flex-1 py-3 px-4 bg-[#FF1E27] hover:bg-[#E0151E] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(255,30,39,0.35)] active:scale-95 font-mono"
                  >
                    {generating ? 'Minting...' : 'Mint Token'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-400 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-[#FF1E27]" />
                  <span>Token successfully minted. Share this link:</span>
                </div>

                <div className="bg-[#161620] border border-white/[0.1] rounded-xl p-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-300 font-mono truncate">{generatedUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="py-1.5 px-3 rounded-lg bg-[#242432] hover:bg-[#303042] text-white text-xs font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 font-mono"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#FF1E27]" />
                        <span className="text-[#FF1E27]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleModalClose}
                  className="w-full py-3 px-4 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md active:scale-95 font-mono"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
