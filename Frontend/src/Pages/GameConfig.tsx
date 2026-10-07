import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameByIdAPI, updateGameAPI, updatePricingAPI, updateMediaAPI, submitGameAPI } from '../Services/Game.service';
import { ArrowLeft, Save, Upload, DollarSign, Send, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

export default function GameConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [iconUrl, setIconUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    if (id) fetchGame(id);
  }, [id]);

  const fetchGame = async (gameId: string) => {
    try {
      const data = await getGameByIdAPI(gameId);
      setGame(data);
      setTitle(data.title);
      setGenre(data.genre || "");
      setDescription(data.description || "");
      setTags(data.tags ? data.tags.join(", ") : "");
      if (data.pricing) {
        setPrice(data.pricing.price);
        setCurrency(data.pricing.currency);
      }
      if (data.media) {
        setIconUrl(data.media.iconUrl || "");
        setBannerUrl(data.media.bannerUrl || "");
      }
    } catch (err) {
      alert("Failed to load game config");
      navigate('/developer/portal');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      await updateGameAPI(id!, { title, genre, description, tags: tagsArray });
      alert("Details saved!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleSavePricing = async () => {
    try {
      await updatePricingAPI(id!, { price: Number(price), currency });
      alert("Pricing saved!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleSaveMedia = async () => {
    try {
      await updateMediaAPI(id!, { iconUrl, bannerUrl, screenshots: [] });
      alert("Media saved!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleSubmitReview = async () => {
    if (!confirm("Are you sure you want to submit for review? You won't be able to edit while pending.")) return;
    try {
      await submitGameAPI(id!);
      alert("Game submitted successfully!");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed. Ensure pricing and media are set.");
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center font-mono">LOADING_CONFIG...</div>;
  if (!game) return null;

  const isDraft = game.status === 'DRAFT';

  return (
    <>
      <div className="max-w-4xl mx-auto pb-20 mt-8">
        <button 
          onClick={() => navigate('/developer/portal')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white break-words max-w-full">{game.title}</h1>
              <span className="px-2 py-1 text-xs font-bold rounded border bg-neutral-900 border-neutral-700 whitespace-nowrap">{game.status}</span>
            </div>
            <p className="text-neutral-500 font-mono text-sm">ID: {game.id}</p>
          </div>
          
          {isDraft && (
            <button 
              onClick={handleSubmitReview}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              <Send className="w-4 h-4" /> Submit for Review
            </button>
          )}
        </div>

        {!isDraft && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 mb-8 flex gap-3 text-yellow-200">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold">Read-Only Mode</p>
              <p className="text-sm opacity-80">This game is currently {game.status}. Configuration is locked to prevent changes during review or publication.</p>
            </div>
          </div>
        )}

        <div className="grid gap-8">
          {/* Details Section */}
          <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" /> Core Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Title</label>
                <input 
                  type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={!isDraft}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors disabled:opacity-50" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Genre</label>
                  <input 
                    type="text" value={genre} onChange={e => setGenre(e.target.value)} disabled={!isDraft} placeholder="e.g. RPG, Shooter"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors disabled:opacity-50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Tags (comma separated)</label>
                  <input 
                    type="text" value={tags} onChange={e => setTags(e.target.value)} disabled={!isDraft} placeholder="e.g. Multiplayer, Sci-Fi"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors disabled:opacity-50" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Description</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)} disabled={!isDraft} rows={4}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors disabled:opacity-50" 
                />
              </div>
              {isDraft && (
                <button onClick={handleSaveDetails} className="flex items-center gap-2 text-sm font-bold bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded transition-colors">
                  <Save className="w-4 h-4" /> Save Details
                </button>
              )}
            </div>
          </section>

          {/* Pricing Section */}
          <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
              <DollarSign className="w-5 h-5" /> Pricing Configuration
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Price Amount</label>
                <input 
                  type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} disabled={!isDraft}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Currency</label>
                <select 
                  value={currency} onChange={e => setCurrency(e.target.value)} disabled={!isDraft}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            {isDraft && (
              <button onClick={handleSavePricing} className="flex items-center gap-2 text-sm font-bold bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded transition-colors">
                <Save className="w-4 h-4" /> Save Pricing
              </button>
            )}
          </section>

          {/* Media Section */}
          <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400">
              <Upload className="w-5 h-5" /> Media Assets
            </h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Icon URL</label>
                <input 
                  type="text" value={iconUrl} onChange={e => setIconUrl(e.target.value)} disabled={!isDraft} placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Banner URL</label>
                <input 
                  type="text" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} disabled={!isDraft} placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50" 
                />
              </div>
            </div>
            {isDraft && (
              <button onClick={handleSaveMedia} className="flex items-center gap-2 text-sm font-bold bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded transition-colors">
                <Save className="w-4 h-4" /> Save Media
              </button>
            )}
          </section>

          {/* Versions Section */}
          <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-400">
              <Upload className="w-5 h-5" /> Game Versions
            </h2>
            <div className="space-y-4 mb-4">
              {game.versions && game.versions.length > 0 ? (
                <ul className="space-y-2">
                  {game.versions.map((v: any) => (
                    <li key={v.id} className="flex justify-between items-center bg-neutral-950 p-3 rounded border border-neutral-800">
                      <span className="font-bold">v{v.version}</span>
                      <span className="text-xs text-neutral-500">{v.downloadUrl || "No URL"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">No versions uploaded yet.</p>
              )}
              
              {isDraft && (
                <div className="pt-4 border-t border-neutral-800">
                  <h3 className="text-sm font-bold mb-3">Add New Version</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <input 
                      type="text" id="newVersion" placeholder="Version (e.g. 1.0.0)"
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors" 
                    />
                    <input 
                      type="text" id="newUrl" placeholder="Download URL"
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors" 
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      const v = (document.getElementById('newVersion') as HTMLInputElement).value;
                      const u = (document.getElementById('newUrl') as HTMLInputElement).value;
                      if (!v) return alert("Version is required");
                      try {
                        const { addVersionAPI } = await import('../Services/Game.service');
                        await addVersionAPI(id!, { version: v, downloadUrl: u });
                        alert("Version added!");
                        fetchGame(id!);
                        (document.getElementById('newVersion') as HTMLInputElement).value = "";
                        (document.getElementById('newUrl') as HTMLInputElement).value = "";
                      } catch (err: any) {
                        alert(err.response?.data?.message || "Failed");
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-bold bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Version
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
