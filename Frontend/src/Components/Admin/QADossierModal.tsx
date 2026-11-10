import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  X,
  UserCheck,
  Clock,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Activity,
  Layers,
  FileCode,
  ShieldAlert,
} from 'lucide-react';

interface QADossierModalProps {
  game: any | null;
  onClose: () => void;
}

export const QADossierModal: React.FC<QADossierModalProps> = ({ game, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!game) return null;

  const handleCopyNotes = () => {
    const textToCopy = `=====================================================
GAMESTATION QA CERTIFICATION DOSSIER
=====================================================
Title: ${game.title}
Studio: @${game.developer?.username || 'Unknown'}
Status: ${game.status}
Reviewer: @${game.reviewedByAdmin?.username || 'System Root'}
Certification Date: ${game.reviewedAt ? new Date(game.reviewedAt).toLocaleString() : 'N/A'}
Audit ID: GS-QA-${game.id?.slice(0, 8).toUpperCase()}

[QA COMPLIANCE CHECKLIST]
[x] Standalone 64-bit binary boots cleanly without unhandled crash
[x] Zero malware, hidden miners, or unauthorized telemetry sockets
[x] Storefront captures & trailer reflect authentic gameplay
[x] Editions & pricing comply with sovereign 70/30 guidelines

[TELEMETRY & QA FIELD NOTES]
${game.qaNotes || 'Standard pre-flight certification baseline. No manual caveats logged.'}
=====================================================`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isPublished = game.status === 'PUBLISHED';
  const isRejected = game.status === 'REJECTED';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#090E1F] border border-blue-800/60 rounded-2xl max-w-2xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden font-mono text-xs flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-blue-900/40 bg-[#060A17] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                    Official QA Certification Dossier
                  </span>
                  <span className="text-[10px] text-blue-400/40">
                    // GS-QA-{game.id?.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide truncate max-w-sm sm:max-w-md">
                  {game.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-blue-900/30 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            {/* Title & Status Summary Card */}
            <div className="p-4 rounded-xl bg-[#0C142B] border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={game.media?.coverImageUrl || '/placeholder.png'}
                  alt={game.title}
                  className="w-12 h-16 object-cover rounded-lg bg-black border border-blue-900/40 shrink-0"
                />
                <div>
                  <div className="text-sm font-bold text-white">{game.title}</div>
                  <div className="text-[11px] text-blue-300/70 font-sans mt-0.5">
                    Studio: <span className="font-mono text-cyan-300 font-semibold">@{game.developer?.username}</span>
                  </div>
                  <div className="text-[10px] text-blue-400/40 mt-0.5">
                    Genre: {game.genre || 'Action / Adventure'}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-900/30">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isPublished
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : isRejected
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPublished ? 'bg-emerald-400' : isRejected ? 'bg-rose-400' : 'bg-amber-400'
                    }`}
                  />
                  {game.status}
                </span>

                <div className="text-[10px] text-blue-400/60 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {game.reviewedAt ? new Date(game.reviewedAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Certification Attribution & Security Fingerprint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/30 space-y-1">
                <div className="text-[10px] text-blue-400/60 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-cyan-400" />
                  Reviewer Staff Signature
                </div>
                <div className="text-white font-bold text-xs">
                  {game.reviewedByAdmin ? (
                    <span className="text-cyan-300">@{game.reviewedByAdmin.username}</span>
                  ) : (
                    <span className="text-zinc-400">Automated / Root Clearance</span>
                  )}
                </div>
                <div className="text-[10px] text-blue-400/50">Level-1 Staff Certification Seal</div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/30 space-y-1">
                <div className="text-[10px] text-blue-400/60 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-emerald-400" />
                  Sandbox Rig Environment
                </div>
                <div className="text-white font-bold text-xs">DX12 / Vulkan Virtualization</div>
                <div className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Ring-3 Isolated Test Complete
                </div>
              </div>
            </div>

            {/* Compliance Matrix Checklist */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/30 space-y-2.5">
              <div className="text-[10px] text-blue-400/70 uppercase tracking-wider font-bold">
                Platform TRC / Lotcheck Verification Criteria
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>64-bit clean executable boot</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>AST anti-malware heuristic clean</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Storefront media gameplay verified</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sovereign 70/30 pricing compliance</span>
                </div>
              </div>
            </div>

            {/* Telemetry & QA Field Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  Staff QA Field Notes & Telemetry Log
                </div>

                <button
                  onClick={handleCopyNotes}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-900/30 hover:bg-blue-900/60 border border-blue-800/40 text-blue-300 text-[10px] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Log</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#040711] border border-blue-900/50 font-mono text-[11px] leading-relaxed text-blue-200/90 whitespace-pre-wrap max-h-56 overflow-y-auto custom-scrollbar select-text shadow-inner">
                {game.qaNotes ? (
                  game.qaNotes
                ) : (
                  <span className="text-blue-400/40 italic">
                    Standard pre-flight certification baseline. No manual caveats logged during release approval.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-blue-900/40 bg-[#060A17] flex items-center justify-between shrink-0">
            <span className="text-[10px] text-blue-400/50">
              GameStation Trust & Safety Compliance Rig
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs font-mono transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

