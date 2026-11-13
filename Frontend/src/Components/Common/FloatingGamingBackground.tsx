import React from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  Swords,
  Dice5,
  Ghost,
  Flame,
  Sparkles,
  Zap,
  Crosshair,
  Award,
} from 'lucide-react';

export default function FloatingGamingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* ── 1. AMBIENT GLOWING NEON NEBULAS ──────────────────────────────── */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-red-600/20 blur-[160px]"
      />

      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.1, 0.18, 0.1],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[-10%] right-[15%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[180px]"
      />

      <motion.div
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[40%] right-[5%] w-[450px] h-[450px] rounded-full bg-cyan-600/15 blur-[170px]"
      />

      {/* ── 2. RETRO CYBERPUNK PERSPECTIVE GRID ───────────────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_65%,transparent_100%)] opacity-40" />

      {/* ── 3. FLOATING GAMING ARTIFACTS (HERO GAMEPADS & ICONS) ──────────── */}

      {/* Hero Gamepad Left Top */}
      <motion.div
        initial={{ y: 0, rotate: -14 }}
        animate={{
          y: [-12, 14, -12],
          rotate: [-14, -8, -14],
          x: [-5, 8, -5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[12%] left-[6%] sm:left-[10%] text-red-500/25 hidden md:flex items-center justify-center p-4 rounded-3xl bg-red-500/[0.03] border border-red-500/10 backdrop-blur-sm shadow-[0_0_40px_rgba(239,68,68,0.08)]"
      >
        <Gamepad2 className="w-14 h-14" />
      </motion.div>

      {/* Hero Gamepad Right Center */}
      <motion.div
        initial={{ y: 0, rotate: 18 }}
        animate={{
          y: [16, -14, 16],
          rotate: [18, 10, 18],
          x: [8, -6, 8],
        }}
        transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute top-[42%] right-[5%] sm:right-[8%] text-purple-400/25 hidden md:flex items-center justify-center p-5 rounded-3xl bg-purple-500/[0.03] border border-purple-500/10 backdrop-blur-sm shadow-[0_0_40px_rgba(168,85,247,0.08)]"
      >
        <Gamepad2 className="w-16 h-16" />
      </motion.div>

      {/* Cyber Swords Left Bottom */}
      <motion.div
        animate={{
          y: [-10, 18, -10],
          rotate: [12, 22, 12],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute bottom-[16%] left-[7%] sm:left-[12%] text-cyan-400/25 hidden sm:flex items-center justify-center p-3.5 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/10 backdrop-blur-sm shadow-[0_0_30px_rgba(6,182,212,0.08)]"
      >
        <Swords className="w-10 h-10" />
      </motion.div>

      {/* Gold Championship Trophy Top Right */}
      <motion.div
        animate={{
          y: [-15, 12, -15],
          rotate: [-8, 6, -8],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="absolute top-[14%] right-[8%] sm:right-[14%] text-amber-400/25 hidden sm:flex items-center justify-center p-3.5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 backdrop-blur-sm shadow-[0_0_30px_rgba(245,158,11,0.08)]"
      >
        <Trophy className="w-11 h-11" />
      </motion.div>

      {/* Retro Arcade Ghost Left Center */}
      <motion.div
        animate={{
          y: [12, -16, 12],
          x: [-6, 6, -6],
          rotate: [-5, 8, -5],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[48%] left-[4%] sm:left-[6%] text-emerald-400/25 hidden lg:flex items-center justify-center p-3 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 backdrop-blur-sm"
      >
        <Ghost className="w-9 h-9" />
      </motion.div>

      {/* Tumbling Dice Bottom Right */}
      <motion.div
        animate={{
          y: [10, -18, 10],
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-[18%] right-[12%] sm:right-[16%] text-rose-400/25 hidden sm:flex items-center justify-center p-3 rounded-2xl bg-rose-500/[0.03] border border-rose-500/10 backdrop-blur-sm"
      >
        <Dice5 className="w-9 h-9" />
      </motion.div>

      {/* ── 4. DRIFTING RETRO AMBIENT PARTICLES ──────────────────────────── */}
      {/* Flame Particle */}
      <motion.div
        animate={{
          y: [-8, 14, -8],
          opacity: [0.3, 0.6, 0.3],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[28%] left-[22%] text-red-500/30 hidden xl:block"
      >
        <Flame className="w-6 h-6" />
      </motion.div>

      {/* Crosshair Particle */}
      <motion.div
        animate={{
          rotate: [0, 360],
          opacity: [0.2, 0.45, 0.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[35%] right-[24%] text-cyan-400/30 hidden xl:block"
      >
        <Crosshair className="w-6 h-6" />
      </motion.div>

      {/* Electric Bolt Particle */}
      <motion.div
        animate={{
          y: [6, -10, 6],
          opacity: [0.25, 0.55, 0.25],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        className="absolute top-[34%] right-[22%] text-amber-400/30 hidden xl:block"
      >
        <Zap className="w-5 h-5 fill-current" />
      </motion.div>

      {/* Sparkles Particle */}
      <motion.div
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
        className="absolute bottom-[28%] left-[20%] text-purple-400/30 hidden xl:block"
      >
        <Sparkles className="w-5 h-5" />
      </motion.div>

      {/* Subtle Drift Embers */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: `${15 + i * 14}%`,
              y: '105%',
              opacity: 0,
            }}
            animate={{
              y: '-10%',
              opacity: [0, 0.4, 0.7, 0],
            }}
            transition={{
              duration: 14 + (i % 4) * 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2.5,
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-red-400/40 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          />
        ))}
      </div>
    </div>
  );
}

