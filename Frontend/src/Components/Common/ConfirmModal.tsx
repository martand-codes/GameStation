import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Confirm Directive',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      border: 'border-red-500/40',
      glow: 'shadow-[0_0_35px_rgba(239,68,68,0.25)]',
      iconBg: 'bg-red-500/10 border-red-500/30 text-red-400',
      icon: AlertOctagon,
      btn: 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40',
      titleColor: 'text-red-400',
    },
    warning: {
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_35px_rgba(245,158,11,0.25)]',
      iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: AlertTriangle,
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40',
      titleColor: 'text-amber-400',
    },
    info: {
      border: 'border-blue-500/40',
      glow: 'shadow-[0_0_35px_rgba(59,130,246,0.25)]',
      iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      icon: Info,
      btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40',
      titleColor: 'text-blue-400',
    },
  }[variant];

  const Icon = variantStyles.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.18 }}
          className={`relative w-full max-w-lg p-6 rounded-2xl bg-[#080B12] border ${variantStyles.border} ${variantStyles.glow} text-white font-mono shadow-2xl`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${variantStyles.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold tracking-tight uppercase ${variantStyles.titleColor}`}>
                  {title}
                </h3>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  AUTHORIZATION REQUIRED
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="text-xs text-zinc-300 leading-relaxed font-sans mb-6 whitespace-pre-line bg-black/40 p-4 rounded-xl border border-white/[0.06]">
            {description}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`py-2.5 px-5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer ${variantStyles.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

