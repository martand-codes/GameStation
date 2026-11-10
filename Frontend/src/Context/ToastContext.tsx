import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4200) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // Keep maximum 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, dur?: number) => showToast(msg, 'success', dur), [showToast]);
  const error = useCallback((msg: string, dur?: number) => showToast(msg, 'error', dur), [showToast]);
  const warning = useCallback((msg: string, dur?: number) => showToast(msg, 'warning', dur), [showToast]);
  const info = useCallback((msg: string, dur?: number) => showToast(msg, 'info', dur), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Floating Cyberpunk Toast Stack */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-2.5rem)] pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let borderClass = 'border-blue-500/40 text-blue-200 bg-[#0B1226]/95';
            let icon = <Info className="w-4 h-4 text-blue-400 shrink-0" />;
            let badge = 'SYSTEM // INFO';
            let badgeClass = 'text-blue-400 border-blue-500/30 bg-blue-500/10';

            if (t.type === 'success') {
              borderClass = 'border-emerald-500/50 text-emerald-100 bg-[#061814]/95 shadow-[0_8px_30px_rgba(16,185,129,0.15)]';
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
              badge = 'PROTOCOL // OK';
              badgeClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            } else if (t.type === 'error') {
              borderClass = 'border-rose-500/50 text-rose-100 bg-[#1f090d]/95 shadow-[0_8px_30px_rgba(244,63,94,0.2)]';
              icon = <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />;
              badge = 'CRITICAL // ALERT';
              badgeClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
            } else if (t.type === 'warning') {
              borderClass = 'border-amber-500/50 text-amber-100 bg-[#1c1305]/95 shadow-[0_8px_30px_rgba(245,158,11,0.15)]';
              icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
              badge = 'SECURITY // WARN';
              badgeClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto rounded-xl border p-3.5 backdrop-blur-md font-mono text-xs shadow-2xl flex items-start gap-3 ${borderClass}`}
              >
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeClass}`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-200 font-sans">{t.message}</p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5"
                  aria-label="Close notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

