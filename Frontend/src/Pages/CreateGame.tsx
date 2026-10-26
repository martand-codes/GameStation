import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Gamepad2, 
  Sparkles, 
  Tag, 
  DollarSign, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { createGameAPI } from '../Services/Game.service';
import { useAuth } from '../Context/AuthContext';

const PRESET_GENRES = [
  'Cyberpunk / Sci-Fi',
  'Action / Adventure',
  'RPG',
  'Souls-like',
  'FPS / Tactical Shooter',
  'Strategy / RTS',
  'Horror / Survival',
  'Indie',
  'Open World',
  'Racing / Sports'
];

const QUICK_TAGS = [
  'Singleplayer',
  'Multiplayer',
  'Co-op',
  'Story Rich',
  'Open World',
  'Cyberpunk',
  'Great Soundtrack',
  'Controller Support',
  'Ray Tracing',
  'Moddable'
];

const PRESET_POSTERS = [
  {
    name: 'Cyber City',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'Neo Samurai',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'Dark Fantasy',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop'
  }
];

export default function CreateGame() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Cyberpunk / Sci-Fi');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['Singleplayer', 'Story Rich']);
  const [tagInput, setTagInput] = useState('');
  const [price, setPrice] = useState('1499');
  const [isFree, setIsFree] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleApplyPresetPoster = (preset: { cover: string; banner: string }) => {
    setCoverImageUrl(preset.cover);
    setBannerImageUrl(preset.banner);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.trim().length < 3) {
      setError('Title must be at least 3 characters long.');
      return;
    }

    if (!genre.trim()) {
      setError('Please select or specify a primary genre.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Synopsis must be at least 10 characters long.');
      return;
    }

    const numericPrice = isFree ? 0 : Number(price);
    if (!isFree && (isNaN(numericPrice) || numericPrice < 0)) {
      setError('Please enter a valid price amount.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        title: title.trim(),
        genre: genre.trim(),
        description: description.trim(),
        tags: tags,
        price: numericPrice,
      };

      if (coverImageUrl.trim()) payload.coverImageUrl = coverImageUrl.trim();
      if (bannerImageUrl.trim()) payload.bannerImageUrl = bannerImageUrl.trim();

      const created = await createGameAPI(payload);
      navigate(`/developer/games/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize game draft.');
    } finally {
      setLoading(false);
    }
  };

  // Readiness checklist calculations
  const hasTitle = title.trim().length >= 3;
  const hasGenre = genre.trim().length > 0;
  const hasDescription = description.trim().length >= 10;
  const hasPricing = isFree || (Number(price) >= 0 && price.trim().length > 0);
  const hasVisuals = Boolean(coverImageUrl || bannerImageUrl);

  if (user?.role !== 'DEVELOPER' && user?.role !== 'ADMIN' && user?.role !== 'OWNER') {
    return (
      <div className="p-8 text-center font-mono mt-20 max-w-md mx-auto bg-[#0C1017] border border-red-500/30 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.15)]">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400 opacity-80" />
        <h2 className="text-xl font-bold mb-2 text-white">DEVELOPER CLEARANCE REQUIRED</h2>
        <p className="text-sm text-neutral-400 mb-6">
          Your current account role is <span className="text-amber-400 font-bold">[{user?.role || 'GUEST'}]</span>. Only accounts registered as Developer, Admin, or Owner can register new titles.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/store')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Return to Store
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-[#161B22] hover:bg-[#21262D] text-neutral-300 font-bold rounded-lg text-xs transition-colors border border-neutral-700"
          >
            Sign In / Register as Developer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black text-[#C9D1D9] font-mono pb-24">
      
      {/* Top Breadcrumb & Action Header */}
      <div className="border-b border-neutral-800 bg-[#07090D] px-6 py-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/developer/portal')}
              className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
            </button>
            <span className="text-neutral-600 hidden sm:inline">/</span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest">Draft Pipeline:</span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                NEW_TITLE_REGISTRATION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/developer/portal')}
              className="text-xs text-neutral-400 hover:text-white px-3 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !hasTitle || !hasDescription}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  INITIALIZING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Initialize Draft & Config
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Spacious Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Banner Announcement */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
            <Gamepad2 className="w-8 h-8 text-emerald-400" />
            Initialize Game Draft
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl">
            Register your game identity, lore, initial pricing, and media assets into the GameStation network. You will be able to configure hardware specs and version builds immediately after creation.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-950/40 border border-red-500/50 text-red-200 rounded-xl text-xs flex items-center gap-3 shadow-[0_0_25px_rgba(239,68,68,0.15)]">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-bold">Initialization Error</p>
              <p className="text-neutral-400">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Title & Identity */}
            <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-[#21262D] pb-3">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-wider uppercase">Title & Core Identity</h2>
              </div>

              {/* Title */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                    Game Title <span className="text-emerald-400">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-500">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Cyber Drift: Overdrive"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-emerald-500 rounded-lg px-4 py-3 text-base font-bold text-white placeholder-neutral-600 outline-none transition-all focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                />
              </div>

              {/* Genre Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                  Primary Genre <span className="text-emerald-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_GENRES.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setGenre(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        genre === preset
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-[#0D1117] text-neutral-400 border-[#30363D] hover:text-white hover:border-neutral-500'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom genre..."
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-emerald-500 rounded-lg px-4 py-2 text-xs text-white placeholder-neutral-600 outline-none transition-colors"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                  Tags & Classifications
                </label>
                
                {/* Active tags chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161B22] border border-[#30363D] text-xs text-cyan-400 font-bold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 text-neutral-500 text-xs ml-0.5"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input for custom tag */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type a tag and press Enter or Add..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    className="flex-1 bg-[#050505] border border-[#30363D] focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(tagInput)}
                    className="px-3 py-1.5 bg-[#161B22] hover:bg-[#21262D] text-neutral-300 text-xs font-bold rounded-lg border border-[#30363D] transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 uppercase mr-1">Suggestions:</span>
                  {QUICK_TAGS.map((qTag) => (
                    <button
                      type="button"
                      key={qTag}
                      onClick={() => handleAddTag(qTag)}
                      disabled={tags.includes(qTag)}
                      className="text-[10px] text-neutral-400 hover:text-white bg-[#0D1117] px-2 py-0.5 rounded border border-[#21262D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      + {qTag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Economics & Pricing */}
            <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white tracking-wider uppercase">Distribution & Base Price</h2>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs text-emerald-400 font-bold select-none bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="rounded border-[#30363D] bg-[#0D1117] text-emerald-500 focus:ring-0"
                  />
                  FREE TO PLAY
                </label>
              </div>

              {!isFree ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                      Standard Edition Price
                    </label>
                    <div className="flex items-center bg-[#050505] border border-[#30363D] focus-within:border-amber-500 rounded-lg overflow-hidden transition-colors">
                      <span className="px-3.5 py-2.5 text-neutral-400 font-bold text-sm bg-[#0D1117] border-r border-[#30363D]">
                        ₹ INR
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="1499"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-transparent px-4 py-2.5 text-base font-bold text-white outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1">Deluxe and Ultimate tiers can be added in Game Config.</p>
                  </div>

                  <div className="p-3 bg-[#07090D] border border-[#1E2530] rounded-lg text-xs text-neutral-400 flex flex-col justify-center">
                    <span className="font-bold text-white mb-1">Standard 70/30 Dev Split</span>
                    <span>Net payout per purchase: <strong className="text-emerald-400">₹{(Number(price || 0) * 0.7).toFixed(0)}</strong></span>
                    <span className="text-[10px] text-neutral-500">Platform fee (30%): ₹{(Number(price || 0) * 0.3).toFixed(0)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>This game will be free for all players to add to their library immediately upon release.</span>
                </div>
              )}
            </div>

            {/* Section 3: Lore & Overview */}
            <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#21262D] pb-3">
                <FileText className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white tracking-wider uppercase">Game Lore & Synopsis</h2>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  Storefront Overview <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Set in a sprawling cyberpunk megacity under perpetual rain, players take on the role of an augmented courier carrying encrypted data that corporate syndicates will kill to possess..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-purple-500 rounded-lg p-4 text-xs text-white placeholder-neutral-600 outline-none transition-colors leading-relaxed resize-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  At least 10 characters. This synopsis will appear prominently in the storefront game header.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Visual Assets, Quick Presets & Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Visual Assets Configuration */}
            <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  <h2 className="text-sm font-bold text-white tracking-wider uppercase">Visual Art Assets</h2>
                </div>
                <span className="text-[10px] text-neutral-500">Optional in Draft</span>
              </div>

              {/* Cover Art (Portrait) */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  Portrait Box Art URL (600x900)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-pink-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-600 outline-none transition-colors"
                />
              </div>

              {/* Banner Art (Landscape) */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1.5">
                  Landscape Hero Banner URL (1920x1080)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-pink-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-600 outline-none transition-colors"
                />
              </div>

              {/* 1-Click Preset Art Samples */}
              <div className="pt-2 border-t border-[#21262D]">
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-2">
                  Quick-Fill Sample Artwork:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_POSTERS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handleApplyPresetPoster(preset)}
                      className="text-left p-2 rounded-lg bg-[#050505] border border-[#21262D] hover:border-emerald-500/50 hover:bg-[#0D1117] transition-all group"
                    >
                      <img
                        src={preset.cover}
                        alt={preset.name}
                        className="w-full h-16 object-cover rounded mb-1 opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-white block truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Storefront Preview */}
            <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white tracking-wider uppercase">Live Storefront Card Preview</h2>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  REALTIME
                </span>
              </div>

              {/* Simulated GameCard */}
              <div className="border border-[#30363D] bg-[#050505] rounded-xl overflow-hidden shadow-2xl">
                <div className="h-44 bg-[#0A0E15] relative overflow-hidden border-b border-[#21262D]">
                  {bannerImageUrl || coverImageUrl ? (
                    <img
                      src={bannerImageUrl || coverImageUrl}
                      alt="Game Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700 bg-gradient-to-br from-[#0D1117] to-black">
                      <Gamepad2 className="w-12 h-12 mb-2 opacity-30 text-emerald-400" />
                      <span className="text-[10px] font-mono text-neutral-600">AWAITING_VISUAL_ASSETS</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-neutral-900/90 text-neutral-400 border border-neutral-700 backdrop-blur-sm">
                      DRAFT
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-black/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-sm">
                      {genre}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-base text-white truncate mb-1">
                    {title || 'Untitled Game'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mb-3">
                    Studio: <span className="text-neutral-300 font-bold">@{user?.username || 'Studio'}</span>
                  </p>

                  <p className="text-xs text-[#8B949E] line-clamp-2 mb-4">
                    {description || 'Game description and synopsis will appear here...'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#21262D]">
                    <span className="text-xs text-neutral-400">Base Price:</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      {isFree ? 'FREE' : `₹${Number(price || 0).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Readiness Checklist */}
            <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-1">
                Readiness Protocol Checklist
              </h3>
              
              <ul className="space-y-2 text-xs">
                <li className={`flex items-center gap-2 ${hasTitle ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Title defined (minimum 3 characters)</span>
                </li>
                <li className={`flex items-center gap-2 ${hasGenre ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Primary genre categorized</span>
                </li>
                <li className={`flex items-center gap-2 ${hasDescription ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Storefront synopsis documented (&ge; 10 chars)</span>
                </li>
                <li className={`flex items-center gap-2 ${hasPricing ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Standard pricing or free-to-play configured</span>
                </li>
                <li className={`flex items-center gap-2 ${hasVisuals ? 'text-cyan-400' : 'text-neutral-600'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Visual art attached (Optional during draft)</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
