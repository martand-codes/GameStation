import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Sparkles,
  ShieldAlert,
  Flame,
  Gamepad2,
  Settings,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { getStorefrontBannerAPI } from '../../Services/Governance.service';
import { useAuth } from '../../Context/AuthContext';

export interface StorefrontBannerData {
  eventId: string;
  eventName: string;
  eventTag: string;
  description: string;
  theme: 'EMERALD' | 'RUBY' | 'CYAN' | 'AMBER' | 'PURPLE';
  startDate: string;
  endDate: string;
  ctaText?: string;
  ctaLink?: string;
  backdropUrl: string;
  featuredGameId?: string | null;
  isActive: boolean;
  updatedAt: string;
}

const DEFAULT_EVERGREEN_BANNER: StorefrontBannerData = {
  eventId: 'gamestation-evergreen',
  eventName: 'GameStation is Live',
  eventTag: 'STOREFRONT SPOTLIGHT',
  description: 'Browse games from verified studios across the platform.',
  theme: 'EMERALD',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
  backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
  isActive: true,
  updatedAt: new Date().toISOString(),
};

interface StorefrontHeroBannerProps {
  customBanner?: StorefrontBannerData | null; // For live preview mode
  isPreviewMode?: boolean;
}

export const StorefrontHeroBanner: React.FC<StorefrontHeroBannerProps> = ({
  customBanner,
  isPreviewMode = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [banner, setBanner] = useState<StorefrontBannerData | null>(customBanner || null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Fetch live banner if not provided as preview
  useEffect(() => {
    if (customBanner) {
      setBanner(customBanner);
      return;
    }

    const fetchBanner = async () => {
      try {
        const data = await getStorefrontBannerAPI();
        if (data) setBanner(data);
      } catch (err) {
        console.error('Failed to load hero banner:', err);
      }
    };

    fetchBanner();
  }, [customBanner]);

  // Live countdown clock timer
  useEffect(() => {
    if (!banner?.endDate) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(banner.endDate).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [banner?.endDate]);

  const activeBanner = banner || DEFAULT_EVERGREEN_BANNER;
  const isEvergreen = timeLeft.isExpired || (!activeBanner.isActive && !isPreviewMode);

  const displayTitle = isEvergreen ? 'GameStation is Live' : activeBanner.eventName;
  const displayTag = isEvergreen ? 'STOREFRONT SPOTLIGHT' : (activeBanner.eventTag || 'PLATFORM SPECIAL EVENT');
  const displayDescription = isEvergreen
    ? 'Browse games from verified studios across the platform.'
    : activeBanner.description;

  // Visual Theme Palettes
  const themes = {
    EMERALD: {
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      borderGlow: 'border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.18)]',
      gradientOverlay: 'from-emerald-950/90 via-[#070D17]/85 to-black/95',
      ctaBtn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      timerBorder: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200',
    },
    RUBY: {
      accentText: 'text-[#FF1E27]',
      badgeBg: 'bg-[#FF1E27]/10 border-[#FF1E27]/30 text-rose-300',
      borderGlow: 'border-rose-600/40 shadow-[0_0_40px_rgba(255,30,39,0.2)]',
      gradientOverlay: 'from-rose-950/90 via-[#140608]/85 to-black/95',
      ctaBtn: 'bg-gradient-to-r from-[#FF1E27] to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(255,30,39,0.4)]',
      timerBorder: 'border-rose-500/30 bg-rose-950/40 text-rose-200',
    },
    CYAN: {
      accentText: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      borderGlow: 'border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.18)]',
      gradientOverlay: 'from-cyan-950/90 via-[#05101E]/85 to-black/95',
      ctaBtn: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]',
      timerBorder: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-200',
    },
    AMBER: {
      accentText: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      borderGlow: 'border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)]',
      gradientOverlay: 'from-amber-950/90 via-[#140D05]/85 to-black/95',
      ctaBtn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      timerBorder: 'border-amber-500/30 bg-amber-950/40 text-amber-200',
    },
    PURPLE: {
      accentText: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      borderGlow: 'border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.2)]',
      gradientOverlay: 'from-purple-950/90 via-[#10071A]/85 to-black/95',
      ctaBtn: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]',
      timerBorder: 'border-purple-500/30 bg-purple-950/40 text-purple-200',
    },
  };

  const currentTheme = themes[activeBanner.theme] || themes.EMERALD;
  const isOwner = user?.role === 'OWNER';

  return (
    <section className={`relative rounded-2xl overflow-hidden border font-sans select-none transition-all duration-300 group shadow-2xl ${currentTheme.borderGlow}`}>
      {/* ── Background Backdrop Artwork ────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src={activeBanner.backdropUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070'}
          alt={displayTitle}
          className="w-full h-full object-cover object-center filter brightness-[0.55] transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
        />
        {/* Themed Gradient Overlay Mask */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradientOverlay} opacity-95`} />
        {/* Subtle Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
      </div>

      {/* ── Content Container ──────────────────────────────────────────────────── */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between min-h-[320px] md:min-h-[360px]">
        {/* Top Header Strip: Badges & Sovereign Quick Edit */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${currentTheme.badgeBg}`}
            >
              {isEvergreen ? (
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Flame className="w-3.5 h-3.5 animate-pulse" />
              )}
              {displayTag}
            </span>

            {/* Live Indicator */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-neutral-300 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {isEvergreen ? 'STOREFRONT ACTIVE' : 'LIVE EVENT'}
            </span>
          </div>

          {/* Discreet Sovereign Owner Direct Link (Only visible to OWNER) */}
          {isOwner && !isPreviewMode && (
            <button
              onClick={() => navigate('/platform/governance/campaigns')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 hover:bg-[#FF1E27]/20 border border-[#FF1E27]/40 text-neutral-300 hover:text-white text-[10px] font-mono transition-all cursor-pointer backdrop-blur-md shadow-lg"
              title="Open Campaign Manager in Sovereign Governance"
            >
              <Settings className="w-3 h-3 text-[#FF1E27]" />
              <span>Sovereign Edit in Governance &rarr;</span>
            </button>
          )}

          {isPreviewMode && (
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold uppercase">
              WYSIWYG Live Preview
            </span>
          )}
        </div>

        {/* Center: Event Headline & Narrative */}
        <div className="max-w-3xl my-6 space-y-3">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-mono leading-tight drop-shadow-md">
            {displayTitle}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-neutral-300 font-sans leading-relaxed max-w-2xl text-shadow">
            {displayDescription}
          </p>
        </div>

        {/* Bottom Strip: Live Countdown Clock OR Evergreen Live Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-4 border-t border-white/10">
          {!isEvergreen ? (
            /* Active Event Countdown Clock */
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>ENDS IN:</span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                <div className={`px-2 py-1 rounded-md border ${currentTheme.timerBorder}`}>
                  {String(timeLeft.days).padStart(2, '0')}D
                </div>
                <span className="text-neutral-500">:</span>
                <div className={`px-2 py-1 rounded-md border ${currentTheme.timerBorder}`}>
                  {String(timeLeft.hours).padStart(2, '0')}H
                </div>
                <span className="text-neutral-500">:</span>
                <div className={`px-2 py-1 rounded-md border ${currentTheme.timerBorder}`}>
                  {String(timeLeft.minutes).padStart(2, '0')}M
                </div>
                <span className="text-neutral-500">:</span>
                <div className={`px-2 py-1 rounded-md border ${currentTheme.timerBorder}`}>
                  {String(timeLeft.seconds).padStart(2, '0')}S
                </div>
              </div>
            </div>
          ) : (
            /* Evergreen Live Fallback Indicator */
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="font-bold text-white uppercase tracking-wider">GameStation is Live</span>
              <span className="text-neutral-500">•</span>
              <span className="text-emerald-400 font-semibold">Browse Games</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

