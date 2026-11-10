import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Plus, ShieldCheck, ChevronDown, Radio, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChiefHeroProps {
  onOpenInviteModal: () => void;
  onScrollToDeck: () => void;
}

export default function ChiefHero({ onOpenInviteModal, onScrollToDeck }: ChiefHeroProps) {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  // Natural scroll tracking on the hero section (no artificial height / no empty black dead zone)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Hero smoothly fades up, dissolves and floats out as user scrolls toward the Command Deck
  const exitOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const exitY = useTransform(scrollYProgress, [0, 0.6], [0, -70]);
  const exitScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.96]);
  const exitBlur = useTransform(scrollYProgress, [0, 0.55], ['blur(0px)', 'blur(8px)']);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[88vh] flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden select-none"
    >
      {/* ── Subtle Ambient Lighting & Grid ───────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 35%, rgba(255,30,39,0.12) 0%, transparent 60%),
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 56px 56px, 56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 40%, transparent 95%)',
        }}
      />

      {/* ── Scroll-driven exit wrapper ────────────────────────────────────── */}
      <motion.div
        style={{
          opacity: exitOpacity,
          y: exitY,
          scale: exitScale,
          filter: exitBlur,
        }}
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center pt-8 pb-12"
      >
        {/* Step 1: Tactical Security Badge (Enters 0.1s) */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0d0d12]/90 border border-red-500/25 shadow-[0_0_20px_rgba(255,30,39,0.15)] mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1E27]" />
          </span>
          <span className="text-[10px] font-mono font-medium tracking-[0.25em] text-zinc-400 uppercase">
            SOVEREIGN ENCLAVE
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF1E27] uppercase">
            ROOT LEVEL 0 ACTIVE
          </span>
        </motion.div>

        {/* Step 2: "WELCOME BACK, CHIEF" — Smooth cinematic fade up entrance (Enters 0.3s) */}
        <div className="w-full overflow-hidden py-2">
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="whitespace-nowrap font-black uppercase tracking-tight text-white font-sans drop-shadow-xl"
            style={{
              fontSize: 'clamp(2.1rem, 5.2vw, 5.2rem)',
              lineHeight: 1.05,
            }}
          >
            WELCOME BACK,&nbsp;
            <motion.span
              animate={{
                textShadow: [
                  '0 0 0px rgba(255,30,39,0)',
                  '0 0 32px rgba(255,30,39,0.7)',
                  '0 0 0px rgba(255,30,39,0)',
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="text-[#FF1E27] inline-block font-black"
            >
              CHIEF
            </motion.span>
          </motion.h1>
        </div>

        {/* Step 3: Subtle Red Laser Accent Divider (Enters 0.8s) */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 w-full max-w-xl h-[1px] origin-center"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,30,39,0.2) 20%, #FF1E27 50%, rgba(255,30,39,0.2) 80%, transparent 100%)',
          }}
        />

        {/* Step 4: Status Subtitle (Enters 1.1s) */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.05, ease: 'easeOut' }}
          className="mt-5 text-xs sm:text-sm text-zinc-400 max-w-xl font-normal leading-relaxed tracking-normal"
        >
          Master sovereign governance is live. Platform settlement volume, certification queues, and
          air-gapped cryptographic protocols are at your command.
        </motion.p>

        {/* Step 5: High-Tech Telemetry Badges (Enters 1.4s) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.35, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-2.5 mt-8"
        >
          {[
            { label: 'BIP-39 AIR-GAPPED', dotColor: '#FF1E27', textColor: 'text-zinc-300' },
            { label: 'GENESIS SEALED', dotColor: '#10B981', textColor: 'text-zinc-300' },
            { label: 'SENTINEL ACTIVE', dotColor: '#06B6D4', textColor: 'text-zinc-300' },
          ].map(({ label, dotColor, textColor }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e0e14]/90 border border-white/[0.08] shadow-sm"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
              />
              <span className={`text-[10px] font-mono font-medium tracking-wider uppercase ${textColor}`}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Step 6: Primary Command Buttons (Enters 1.7s) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.65, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-3.5 mt-9"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenInviteModal}
            className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white font-mono cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #FF1E27 0%, #D8131B 100%)',
              boxShadow: '0 0 24px rgba(255,30,39,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Issue Staff Directive</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/certification/queue')}
            className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-300 hover:text-white font-mono cursor-pointer transition-all duration-200"
            style={{
              background: '#0e0e13',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 14px rgba(0,0,0,0.4)',
            }}
          >
            <ShieldCheck className="w-4 h-4 text-[#FF1E27]" />
            <span>Certification Desk</span>
          </motion.button>
        </motion.div>

        {/* Step 7: Scroll Cue Indicator (Enters 2.1s) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.1 }}
          onClick={onScrollToDeck}
          className="mt-14 flex flex-col items-center gap-2 cursor-pointer group text-zinc-500 hover:text-[#FF1E27] transition-colors"
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase">
            Access Command Deck
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </motion.div>
    </section>
  );
}
