import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal } from 'lucide-react';

interface JarvisLoaderProps {
  onComplete: () => void;
}

export default function JarvisLoader({ onComplete }: JarvisLoaderProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(10);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStep(1);
      setProgress(35);
    }, 450);

    const t2 = setTimeout(() => {
      setStep(2);
      setProgress(68);
    }, 1000);

    const t3 = setTimeout(() => {
      setStep(3);
      setProgress(90);
    }, 1600);

    const t4 = setTimeout(() => {
      setStep(4);
      setProgress(100);
    }, 2100);

    const t5 = setTimeout(() => {
      onCompleteRef.current?.();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleBypass = () => {
    onCompleteRef.current?.();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center p-6 text-white font-mono select-none overflow-hidden"
    >
      {/* Background Subtle Red Ambience */}
      <div className="absolute w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Red Gaming Reticle */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 rounded-full border border-dashed border-red-500/30"
        />
        {/* Middle Segmented Arc */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 rounded-full border-2 border-red-500/60 border-t-transparent border-b-transparent"
        />
        {/* Inner Glowing Core */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-20 h-20 rounded-full bg-red-500/15 border border-[#FF1E27] shadow-[0_0_35px_rgba(255,30,39,0.5)] flex items-center justify-center text-[#FF1E27]"
        >
          <Cpu className="w-9 h-9" />
        </motion.div>
      </div>

      {/* Terminal Telemetry Feed */}
      <div className="max-w-md w-full space-y-4 text-center z-10">
        <div className="flex items-center justify-center gap-2 text-xs text-red-500 tracking-widest uppercase font-bold">
          <Terminal className="w-3.5 h-3.5 animate-pulse" />
          <span>GAMESTATION SENTINEL PROTOCOL</span>
        </div>

        <div className="h-12 flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-slate-400"
              >
                &gt; ESTABLISHING AIR-GAPPED HANDSHAKE...
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-400 font-semibold"
              >
                &gt; VERIFYING ROOT CRYPTOGRAPHIC CIPHER...
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-emerald-400 font-semibold"
              >
                &gt; CLEARANCE GRANTED // MASTER ROOT LEVEL 0
              </motion.div>
            )}
            {step >= 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-bold text-white tracking-wide"
              >
                &gt; &quot;Welcome back, Chief. Systems operational.&quot;
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* High-Tech Crimson Red Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#111111] h-2 rounded-full overflow-hidden border border-red-500/30 p-0.5">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-600 via-[#FF1E27] to-amber-500 rounded-full shadow-[0_0_15px_rgba(255,30,39,0.7)]"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 tracking-wider">
            <span>VAULT: SECURED</span>
            <span className="text-[#FF1E27] font-bold">{progress}%</span>
            <span>STATUS: {progress === 100 ? 'ONLINE' : 'BOOTING'}</span>
          </div>
        </div>

        {/* Bypass button */}
        <div className="pt-2">
          <button
            onClick={handleBypass}
            className="text-[11px] text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest cursor-pointer active:scale-95"
          >
            [ BYPASS INITIALIZATION ]
          </button>
        </div>
      </div>
    </motion.div>
  );
}
