import React, { useState } from 'react';
import { X, Gamepad2, Sparkles, Tag, DollarSign, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import { createGameAPI } from '../../Services/Game.service';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newGame: any) => void;
}

const PRESET_GENRES = [
  'RPG',
  'Action / Adventure',
  'Cyberpunk / Sci-Fi',
  'Souls-like',
  'FPS / Shooter',
  'Strategy',
  'Indie',
  'Simulation',
  'Racing / Sports'
];

export default function CreateGameModal({ isOpen, onClose, onSuccess }: CreateGameModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Cyberpunk / Sci-Fi');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Singleplayer, Rich Story, High Octane');
  const [price, setPrice] = useState('1499');
  const [isFree, setIsFree] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.trim().length < 3) {
      setError('Title must be at least 3 characters long.');
      return;
    }

    if (!genre.trim()) {
      setError('Please select or specify a genre.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const numericPrice = isFree ? 0 : Number(price);
    if (!isFree && (isNaN(numericPrice) || numericPrice < 0)) {
      setError('Please specify a valid non-negative price.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        title: title.trim(),
        genre: genre.trim(),
        description: description.trim(),
        tags: parsedTags,
        price: numericPrice,
      };

      if (coverImageUrl.trim()) payload.coverImageUrl = coverImageUrl.trim();
      if (bannerImageUrl.trim()) payload.bannerImageUrl = bannerImageUrl.trim();

      const created = await createGameAPI(payload);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize game draft.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="bg-[#0C1017] border border-emerald-500/40 rounded-xl max-w-2xl w-full overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.2)] flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#111722] border-b border-[#223145] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                INITIALIZE NEW GAME DRAFT
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                  STAGE: DRAFT
                </span>
              </h2>
              <p className="text-xs text-[#8B949E]">Register a new title into the GameStation developer registry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-white transition-colors p-1 rounded hover:bg-[#161B22]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-[#C9D1D9]">
          
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 rounded text-xs flex items-center gap-2">
              <span className="font-bold">[ERR]:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[#8B949E] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Game Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cyber Drift: Overdrive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#050505] border border-[#30363D] focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#484F58] outline-none transition-all focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            />
          </div>

          {/* Genre Selection */}
          <div>
            <label className="block text-[#8B949E] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              Primary Genre *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_GENRES.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setGenre(preset)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
                    genre === preset
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-[#0D1117] text-[#8B949E] border-[#30363D] hover:text-[#C9D1D9] hover:border-[#8B949E]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Custom Genre if not listed above"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-[#050505] border border-[#30363D] focus:border-blue-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#484F58] outline-none transition-colors"
            />
          </div>

          {/* Pricing & Free-to-play toggle */}
          <div className="p-4 bg-[#050505] border border-[#21262D] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[#8B949E] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Standard Edition Base Price
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-emerald-400 font-bold select-none">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-[#30363D] bg-[#0D1117] text-emerald-500 focus:ring-0"
                />
                Free to Play
              </label>
            </div>

            {!isFree ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-400">₹ (INR)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="1499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] focus:border-amber-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-[#484F58] outline-none transition-colors"
                />
              </div>
            ) : (
              <div className="text-emerald-400 text-xs font-bold py-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> This title will be free to add to library for all players.
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#8B949E] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              Game Synopsis / Lore *
            </label>
            <textarea
              required
              rows={3}
              placeholder="In a neon-soaked dystopian metropolis where neural cybernetics dictate social hierarchy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#050505] border border-[#30363D] focus:border-purple-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#484F58] outline-none transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[#8B949E] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Cyberpunk, Open World, RTX, Controller Support"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#050505] border border-[#30363D] focus:border-cyan-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#484F58] outline-none transition-colors"
            />
          </div>

          {/* Media Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8B949E] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                Cover Image URL (Portrait)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full bg-[#050505] border border-[#30363D] focus:border-pink-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#484F58] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#8B949E] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                Banner Image URL (Landscape)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                className="w-full bg-[#050505] border border-[#30363D] focus:border-orange-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#484F58] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Live Preview if banner exists */}
          {bannerImageUrl && (
            <div className="relative rounded-lg overflow-hidden border border-[#30363D] h-28 bg-neutral-950">
              <img
                src={bannerImageUrl}
                alt="Banner preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-[10px] text-white rounded border border-white/20">
                Banner Preview
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#223145]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-[#30363D] text-[#8B949E] hover:text-white hover:border-[#8B949E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  INITIALIZING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  INITIALIZE DRAFT
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
