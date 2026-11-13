import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface PromptOption {
  label: string;
  value: string;
  description?: string;
}

export interface PromptModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'textarea' | 'select';
  options?: PromptOption[];
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  required?: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export default function PromptModal({
  isOpen,
  title,
  description,
  label,
  placeholder = 'Enter value...',
  defaultValue = '',
  inputType = 'text',
  options = [],
  confirmText = 'Execute Directive',
  cancelText = 'Cancel',
  variant = 'warning',
  required = false,
  onConfirm,
  onClose,
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      border: 'border-red-500/40',
      glow: 'shadow-[0_0_35px_rgba(239,68,68,0.25)]',
      iconBg: 'bg-red-500/10 border-red-500/30 text-red-400',
      btn: 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40',
      titleColor: 'text-red-400',
    },
    warning: {
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_35px_rgba(245,158,11,0.25)]',
      iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40',
      titleColor: 'text-amber-400',
    },
    info: {
      border: 'border-blue-500/40',
      glow: 'shadow-[0_0_35px_rgba(59,130,246,0.25)]',
      iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40',
      titleColor: 'text-blue-400',
    },
    primary: {
      border: 'border-[#00ffcc]/40',
      glow: 'shadow-[0_0_35px_rgba(0,255,204,0.2)]',
      iconBg: 'bg-[#00ffcc]/10 border-[#00ffcc]/30 text-[#00ffcc]',
      btn: 'bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-bold shadow-[#00ffcc]/30',
      titleColor: 'text-[#00ffcc]',
    },
  }[variant];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (required && !value.trim()) return;
    onConfirm(value);
    onClose();
  };

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
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${variantStyles.iconBg}`}
              >
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold tracking-tight uppercase ${variantStyles.titleColor}`}>
                  {title}
                </h3>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  DIRECTIVE INPUT REQUIRED
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

          {/* Description */}
          {description && (
            <div className="text-xs text-zinc-300 leading-relaxed font-sans mb-4 whitespace-pre-line bg-black/40 p-3.5 rounded-xl border border-white/[0.06]">
              {description}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {label && (
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                {label}
              </label>
            )}

            {inputType === 'select' ? (
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue(opt.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border font-mono text-xs transition-all cursor-pointer ${
                      value === opt.value
                        ? 'bg-white/10 border-white/40 text-white shadow-lg'
                        : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[10px] text-zinc-500 font-sans mt-0.5">{opt.description}</div>
                      )}
                    </div>
                    {value === opt.value && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            ) : inputType === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                rows={3}
                autoFocus
                className="w-full bg-black/50 border border-white/[0.12] focus:border-white/40 rounded-xl p-3 text-xs text-white font-mono outline-none resize-none placeholder-zinc-600 transition-colors"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="w-full bg-black/50 border border-white/[0.12] focus:border-white/40 rounded-xl p-3 text-xs text-white font-mono outline-none placeholder-zinc-600 transition-colors"
              />
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="submit"
                disabled={required && !value.trim()}
                className={`py-2.5 px-5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50 ${variantStyles.btn}`}
              >
                {confirmText}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

