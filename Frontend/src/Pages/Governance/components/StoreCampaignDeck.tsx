import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  Calendar,
  Image as ImageIcon,
  Tag,
  Palette,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Send,
  Zap,
} from 'lucide-react';
import {
  getStorefrontBannerAPI,
  updateStorefrontBannerAPI,
} from '../../../Services/Governance.service';
import { useToast } from '../../../Context/ToastContext';
import {
  StorefrontHeroBanner,
  type StorefrontBannerData,
} from '../../../Components/Store/StorefrontHeroBanner';

// Seeded Artwork Presets for Quick 1-Click Injection
const ARTWORK_PRESETS = [
  {
    name: 'Cyberpunk 2077',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
    theme: 'CYAN' as const,
  },
  {
    name: 'Elden Ring / Souls',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070',
    theme: 'AMBER' as const,
  },
  {
    name: 'Sovereign Red / GTA',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070',
    theme: 'RUBY' as const,
  },
  {
    name: 'Indie Matrix / Silksong',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070',
    theme: 'EMERALD' as const,
  },
  {
    name: 'Vaporwave Synth',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2070',
    theme: 'PURPLE' as const,
  },
];

export default function StoreCampaignDeck() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<StorefrontBannerData>({
    eventId: 'event-genesis',
    eventName: 'CYBER HARVEST // STOREFRONT GENESIS',
    eventTag: '🔥 FEATURED PLATFORM EVENT',
    description:
      'Celebrate the official opening of GameStation. Discover 20 premier titles from 12 iconic developer studios with certified Ring-3 stability.',
    theme: 'EMERALD',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    ctaText: 'EXPLORE CATALOG',
    ctaLink: '/store',
    backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
    featuredGameId: null,
    isActive: true,
    updatedAt: new Date().toISOString(),
  });

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const data = await getStorefrontBannerAPI();
      if (data) {
        setFormData({
          ...data,
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '',
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch current banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventName.trim()) {
      toast.warning('Event headline is required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      const updated = await updateStorefrontBannerAPI(payload);
      toast.success(`Storefront Campaign "${updated.eventName}" deployed live to storefront!`);
      fetchBanner();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to deploy campaign banner');
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (type: 'LAUNCH' | 'SUMMER' | 'STUDIO' | 'FLASH') => {
    const now = new Date();
    if (type === 'LAUNCH') {
      setFormData((prev) => ({
        ...prev,
        eventName: 'CYBER HARVEST // STOREFRONT GENESIS',
        eventTag: '🚀 PLATFORM LAUNCH SPECIAL',
        description:
          'GameStation is officially open. 20 handcrafted titles across 12 iconic studios with dual editions, certified benchmarks, and 70/30 fair royalty guarantees.',
        theme: 'EMERALD',
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        ctaText: 'EXPLORE LINEUP',
        ctaLink: '/store',
        backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
      }));
    } else if (type === 'SUMMER') {
      setFormData((prev) => ({
        ...prev,
        eventName: 'MIDNIGHT CYBER SALE // UP TO 75% OFF',
        eventTag: '⚡ SEASONAL MEGA SALE',
        description:
          'Massive promotional markdowns across RPGs, souls-likes, and open-world adventures. Limited time storefront event with bonus GameStation reward points.',
        theme: 'AMBER',
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        ctaText: 'GRAB DISCOUNTS',
        ctaLink: '/store',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070',
      }));
    } else if (type === 'STUDIO') {
      setFormData((prev) => ({
        ...prev,
        eventName: 'STUDIO SPOTLIGHT // ROCKSTAR & FROM SOFTWARE',
        eventTag: '💎 DEVELOPER SHOWCASE',
        description:
          'Direct technical immersion into the greatest open-world and dark fantasy masterpieces. Certified 60 FPS verified builds with deluxe bonus soundtracks.',
        theme: 'RUBY',
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        ctaText: 'VIEW STUDIO COLLECTION',
        ctaLink: '/store',
        backdropUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070',
      }));
    } else if (type === 'FLASH') {
      setFormData((prev) => ({
        ...prev,
        eventName: '48-HOUR INDIE REVELATION',
        eventTag: '🔥 FLASH SPOTLIGHT',
        description:
          'Experience award-winning independent gems including Hollow Knight: Silksong and Hades. Deep combat, atmospheric lore, and zero microtransactions.',
        theme: 'PURPLE',
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        ctaText: 'PLAY INDIES NOW',
        ctaLink: '/store',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2070',
      }));
    }
    toast.info('Applied campaign template. Review the live preview below!');
  };

  return (
    <div className="space-y-8 font-sans select-none pb-12">
      {/* ── Top Header Strip ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#FF1E27] tracking-wider uppercase">
              Sovereign Merchandising
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
              Storefront CMS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-1 font-mono uppercase">
            Storefront Campaigns & Hero Spotlight
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Configure the live hero event banner, promotional countdown clocks, and custom artwork for all players.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBanner}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* ── 1-Click Event Templates Bar ───────────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#09090e] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold uppercase tracking-wider">Quick Campaign Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyTemplate('LAUNCH')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono transition-colors cursor-pointer"
          >
            🚀 Launch Genesis
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('SUMMER')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-mono transition-colors cursor-pointer"
          >
            ⚡ Seasonal Mega Sale
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('STUDIO')}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-mono transition-colors cursor-pointer"
          >
            💎 Studio Showcase
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('FLASH')}
            className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-mono transition-colors cursor-pointer"
          >
            🔥 48H Indie Flash
          </button>
        </div>
      </div>

      {/* ── Live WYSIWYG Preview Section ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-wider">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Interactive Storefront Live Preview</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Real-time rendering matches `/store` exactly
          </span>
        </div>

        {/* Live Card Component */}
        <StorefrontHeroBanner customBanner={formData} isPreviewMode={true} />
      </div>

      {/* ── Campaign Configuration Form ──────────────────────────────────────────── */}
      <form onSubmit={handleDeploy} className="space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-[#0d0d12] border border-white/[0.08] shadow-2xl space-y-6">
          <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF1E27]" />
              Event Metadata & Directives
            </h3>

            {/* Active Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <span className="text-xs font-mono text-zinc-400 uppercase font-semibold">
                Status:
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border transition-all ${formData.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
              >
                {formData.isActive ? '● Live on Storefront' : '○ Standby / Hidden'}
              </button>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Event Headline */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                1. Event Headline / Name *
              </label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                placeholder="e.g. CYBER HARVEST // STOREFRONT GENESIS"
                className="w-full bg-[#07070a] border border-white/[0.08] focus:border-[#FF1E27]/60 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            {/* 2. Event Tag / Badge */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                2. Category Badge Tag *
              </label>
              <input
                type="text"
                value={formData.eventTag}
                onChange={(e) => setFormData({ ...formData, eventTag: e.target.value })}
                placeholder="e.g. 🔥 FEATURED PLATFORM EVENT"
                className="w-full bg-[#07070a] border border-white/[0.08] focus:border-[#FF1E27]/60 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            {/* 3. Start Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                3. Campaign Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#07070a] border border-white/[0.08] focus:border-blue-500/60 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            {/* 4. End Date (Countdown Target) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                4. Campaign End Date (Drives Live Countdown)
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#07070a] border border-white/[0.08] focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            {/* 5. Theme Palette */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                5. Lighting Accent & Theme Glow
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'EMERALD', label: 'Emerald Matrix', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
                  { id: 'RUBY', label: 'Ruby Sovereign', color: 'border-rose-500 bg-rose-950/40 text-rose-300' },
                  { id: 'CYAN', label: 'Cyber Cyan', color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300' },
                  { id: 'AMBER', label: 'Treasury Gold', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                  { id: 'PURPLE', label: 'Neon Vaporwave', color: 'border-purple-500 bg-purple-950/40 text-purple-300' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: t.id as any })}
                    className={`p-3 rounded-xl border text-xs font-mono text-center transition-all cursor-pointer ${formData.theme === t.id
                        ? `${t.color} font-bold shadow-lg scale-[1.02]`
                        : 'border-white/[0.08] bg-[#07070a] text-zinc-400 hover:text-white'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Description / Narrative */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                6. Narrative Description / Sub-headline
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the platform event or discounts available to players..."
                className="w-full bg-[#07070a] border border-white/[0.08] focus:border-[#FF1E27]/60 rounded-xl p-3.5 text-xs text-white font-sans leading-relaxed outline-none"
              />
            </div>

            {/* 7. Backdrop Artwork URL & Presets */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                7. Hero Backdrop Artwork URL
              </label>
              <input
                type="text"
                value={formData.backdropUrl}
                onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#07070a] border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
              />

              {/* Quick Artwork Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Quick Backdrop Presets:
                </span>
                {ARTWORK_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        backdropUrl: preset.url,
                        theme: preset.theme,
                      })
                    }
                    className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500">
              Immediate deployment &bull; All active players will see updates instantly
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF1E27] to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(255,30,39,0.35)] cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Deploying Event...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Deploy Campaign to Live Storefront</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
