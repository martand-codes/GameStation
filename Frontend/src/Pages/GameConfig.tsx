import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getGameByIdAPI, 
  updateGameAPI, 
  updatePricingAPI, 
  addEditionAPI,
  deleteEditionAPI,
  addDiscountAPI,
  updateMediaAPI, 
  updateRequirementsAPI,
  updateTelemetryAPI,
  addVersionAPI,
  submitGameAPI 
} from '../Services/Game.service';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Layers, 
  Cpu, 
  Clock, 
  Image as ImageIcon, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Tag,
  Percent
} from 'lucide-react';

export default function GameConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'pricing' | 'media' | 'requirements' | 'telemetry' | 'versions'>('details');
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Tab 1: Core Details
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  // Tab 2: Pricing Editions
  const [editions, setEditions] = useState<any[]>([]);
  const [newEditionName, setNewEditionName] = useState("Deluxe Edition");
  const [newEditionPrice, setNewEditionPrice] = useState("2499");
  const [newEditionFeatures, setNewEditionFeatures] = useState("Digital Soundtrack, Concept Art Book, Season Pass");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [discountTargetId, setDiscountTargetId] = useState("");
  const [discountStartsAt, setDiscountStartsAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [discountEndsAt, setDiscountEndsAt] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().slice(0, 16);
  });

  // Tab 3: Media
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");

  // Tab 4: Requirements
  const [minOs, setMinOs] = useState("Windows 10 64-bit");
  const [minCpu, setMinCpu] = useState("Intel Core i5-6600K / AMD Ryzen 5 1600");
  const [minGpu, setMinGpu] = useState("NVIDIA GeForce GTX 1060 (6GB) / AMD Radeon RX 580");
  const [minMem, setMinMem] = useState("8 GB RAM");
  const [minStorage, setMinStorage] = useState("50 GB available space");
  const [minNetwork, setMinNetwork] = useState("Broadband Internet connection");

  const [optOs, setOptOs] = useState("Windows 11 64-bit");
  const [optCpu, setOptCpu] = useState("Intel Core i7-12700K / AMD Ryzen 7 5800X");
  const [optGpu, setOptGpu] = useState("NVIDIA GeForce RTX 3070 / AMD Radeon RX 6800 XT");
  const [optMem, setOptMem] = useState("16 GB RAM");
  const [optStorage, setOptStorage] = useState("70 GB SSD");
  const [optNetwork, setOptNetwork] = useState("High-speed Broadband");

  // Tab 5: Telemetry
  const [mainStoryHours, setMainStoryHours] = useState<number | string>(20);
  const [mainExtrasHours, setMainExtrasHours] = useState<number | string>(45);
  const [completionistHours, setCompletionistHours] = useState<number | string>(80);

  // Tab 6: Versions
  const [newVersionNumber, setNewVersionNumber] = useState("");
  const [newVersionUrl, setNewVersionUrl] = useState("");
  const [newVersionChangelog, setNewVersionChangelog] = useState("");

  useEffect(() => {
    if (id) fetchGame(id);
  }, [id]);

  const fetchGame = async (gameId: string) => {
    try {
      setLoading(true);
      const data = await getGameByIdAPI(gameId);
      setGame(data);

      // Core Details
      setTitle(data.title || "");
      setGenre(data.genre || "");
      setDescription(data.description || "");
      setTags(data.tags ? data.tags.join(", ") : "");

      // Pricing (Editions)
      const fetchedPricing = data.pricing || [];
      setEditions(fetchedPricing);
      if (fetchedPricing.length > 0 && !discountTargetId) {
        setDiscountTargetId(fetchedPricing[0].id);
      }

      // Media
      if (data.media) {
        setCoverImageUrl(data.media.coverImageUrl || "");
        setBannerImageUrl(data.media.bannerImageUrl || "");
        setScreenshots(data.media.screenshots || []);
        setTrailerUrl(data.media.trailerUrl || "");
      }

      // Requirements
      if (data.requirements) {
        setMinOs(data.requirements.minOs || "Windows 10 64-bit");
        setMinCpu(data.requirements.minCpu || "");
        setMinGpu(data.requirements.minGpu || "");
        setMinMem(data.requirements.minMem || "");
        setMinStorage(data.requirements.minStorage || "");
        setMinNetwork(data.requirements.minNetwork || "");

        setOptOs(data.requirements.optOs || "Windows 11 64-bit");
        setOptCpu(data.requirements.optCpu || "");
        setOptGpu(data.requirements.optGpu || "");
        setOptMem(data.requirements.optMem || "");
        setOptStorage(data.requirements.optStorage || "");
        setOptNetwork(data.requirements.optNetwork || "");
      }

      // Telemetry
      if (data.telemetry) {
        setMainStoryHours(data.telemetry.mainStoryHours ?? 20);
        setMainExtrasHours(data.telemetry.mainExtrasHours ?? 45);
        setCompletionistHours(data.telemetry.completionistHours ?? 80);
      }

    } catch (err) {
      alert("Failed to load title configuration.");
      navigate('/developer/portal');
    } finally {
      setLoading(false);
    }
  };

  const notifySuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Handlers
  const handleSaveDetails = async () => {
    try {
      setSaving(true);
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      await updateGameAPI(id!, { title, genre, description, tags: tagsArray });
      notifySuccess("Core details updated successfully!");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update details.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEditionPrice = async (editionId: string, editionName: string, priceVal: number, isFree: boolean) => {
    try {
      setSaving(true);
      await updatePricingAPI(id!, {
        id: editionId,
        editionName,
        price: Number(priceVal),
        isFree,
        currency: "INR"
      });
      notifySuccess("Edition pricing updated!");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update edition pricing.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditionName.trim()) return alert("Edition name is required");
    try {
      setSaving(true);
      const featuresArr = newEditionFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0);
      await addEditionAPI(id!, {
        editionName: newEditionName.trim(),
        price: Number(newEditionPrice),
        isFree: Number(newEditionPrice) === 0,
        currency: "INR",
        features: featuresArr
      });
      notifySuccess("New edition added!");
      setNewEditionName("");
      setNewEditionFeatures("");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add edition.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEdition = async (pricingId: string) => {
    if (!window.confirm("Are you sure you want to remove this pricing edition?")) return;
    try {
      setSaving(true);
      await deleteEditionAPI(id!, pricingId);
      notifySuccess("Edition removed.");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete edition.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = Number(discountPercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) return alert("Valid discount percentage (1-100) is required.");
    try {
      setSaving(true);
      await addDiscountAPI(id!, {
        pricingId: discountTargetId || editions[0]?.id,
        percentage: pct,
        startsAt: new Date(discountStartsAt).toISOString(),
        endsAt: new Date(discountEndsAt).toISOString()
      });
      notifySuccess("Promotional discount scheduled!");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add discount.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMedia = async () => {
    try {
      setSaving(true);
      await updateMediaAPI(id!, {
        coverImageUrl: coverImageUrl.trim() || null,
        bannerImageUrl: bannerImageUrl.trim() || null,
        screenshots: screenshots.filter(s => s.trim().length > 0),
        trailerUrl: trailerUrl.trim() || null
      });
      notifySuccess("Visual media assets updated!");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update media.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddScreenshot = () => {
    if (!newScreenshotUrl.trim()) return;
    setScreenshots([...screenshots, newScreenshotUrl.trim()]);
    setNewScreenshotUrl("");
  };

  const handleRemoveScreenshot = (indexToRemove: number) => {
    setScreenshots(screenshots.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveRequirements = async () => {
    try {
      setSaving(true);
      await updateRequirementsAPI(id!, {
        minOs, minCpu, minGpu, minMem, minStorage, minNetwork,
        optOs, optCpu, optGpu, optMem, optStorage, optNetwork
      });
      notifySuccess("System requirements updated!");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save requirements.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPresetRequirements = (preset: 'MID_RANGE' | 'HIGH_END') => {
    if (preset === 'MID_RANGE') {
      setMinOs("Windows 10 64-bit");
      setMinCpu("Intel Core i5-8400 / AMD Ryzen 5 2600");
      setMinGpu("NVIDIA GTX 1060 (6GB) / AMD Radeon RX 580");
      setMinMem("12 GB RAM");
      setMinStorage("60 GB available space");
      setMinNetwork("Broadband Internet connection");

      setOptOs("Windows 11 64-bit");
      setOptCpu("Intel Core i7-10700K / AMD Ryzen 7 3700X");
      setOptGpu("NVIDIA RTX 2070 Super / AMD Radeon RX 5700 XT");
      setOptMem("16 GB RAM");
      setOptStorage("60 GB SSD");
      setOptNetwork("High-speed Broadband");
    } else {
      setMinOs("Windows 10 64-bit");
      setMinCpu("Intel Core i7-9700K / AMD Ryzen 7 3800X");
      setMinGpu("NVIDIA RTX 2080 / AMD Radeon RX 6700 XT");
      setMinMem("16 GB RAM");
      setMinStorage("90 GB available space");
      setMinNetwork("Broadband Internet connection");

      setOptOs("Windows 11 64-bit");
      setOptCpu("Intel Core i9-13900K / AMD Ryzen 9 7900X");
      setOptGpu("NVIDIA RTX 4080 (16GB) / AMD Radeon RX 7900 XTX");
      setOptMem("32 GB RAM");
      setOptStorage("90 GB NVMe SSD");
      setOptNetwork("Fiber Gigabit Broadband");
    }
  };

  const handleSaveTelemetry = async () => {
    try {
      setSaving(true);
      await updateTelemetryAPI(id!, {
        mainStoryHours: Number(mainStoryHours),
        mainExtrasHours: Number(mainExtrasHours),
        completionistHours: Number(completionistHours)
      });
      notifySuccess("Playtime telemetry benchmarks saved!");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save telemetry.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNumber.trim()) return alert("Semantic version string required (e.g. 1.0.0)");
    try {
      setSaving(true);
      await addVersionAPI(id!, {
        version: newVersionNumber.trim(),
        downloadUrl: newVersionUrl.trim() || null,
        changelog: newVersionChangelog.trim() || null
      });
      notifySuccess(`Build v${newVersionNumber} deployed!`);
      setNewVersionNumber("");
      setNewVersionUrl("");
      setNewVersionChangelog("");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deploy version.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!window.confirm("Submit this title for storefront review? You cannot edit core details while under review.")) return;
    try {
      setSaving(true);
      await submitGameAPI(id!);
      alert("Game submitted for review! GameStation admins will evaluate and approve for public storefront.");
      fetchGame(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed. Ensure you have configured pricing, media, and at least one deployed version build.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-12 flex items-center justify-center font-mono">
        <div className="flex items-center gap-3 text-emerald-400">
          <span className="animate-spin w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full" />
          <span>LOADING_CONFIG_MATRIX...</span>
        </div>
      </div>
    );
  }

  if (!game) return null;

  const isDraft = game.status === 'DRAFT';

  return (
    <div className="min-h-full bg-black text-[#C9D1D9] font-mono pb-24">
      
      {/* Sticky Top Bar */}
      <div className="border-b border-neutral-800 bg-[#07090D] px-6 py-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/developer/portal')}
              className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Studio Registry
            </button>
            <span className="text-neutral-600 hidden sm:inline">/</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white truncate max-w-[280px] sm:max-w-md">
                  {game.title}
                </h1>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  game.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  game.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse' :
                  'bg-neutral-900 text-neutral-400 border-neutral-700'
                }`}>
                  {game.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {saveSuccessMsg && (
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30 animate-fadeIn">
                {saveSuccessMsg}
              </span>
            )}
            
            <button
              onClick={() => navigate(`/store/games/${game.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1117] hover:bg-[#161B22] border border-[#30363D] text-cyan-400 hover:border-cyan-500/40 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Store Preview
            </button>

            {isDraft && (
              <button
                onClick={handleSubmitReview}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Submit for Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {!isDraft && (
          <div className="bg-yellow-950/20 border border-yellow-700/50 rounded-xl p-4 flex items-center gap-3 text-yellow-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-400" />
            <p className="text-xs leading-relaxed">
              <strong>STATUS LOCK:</strong> This title is currently <strong>{game.status}</strong>. Modifications are read-restricted to preserve version integrity during review or live retail distribution.
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-800 overflow-x-auto pb-2">
          {[
            { id: 'details', label: '1. Core Details', icon: Layers },
            { id: 'pricing', label: '2. Pricing & Editions', icon: DollarSign },
            { id: 'media', label: '3. Media Gallery', icon: ImageIcon },
            { id: 'requirements', label: '4. Hardware Specs', icon: Cpu },
            { id: 'telemetry', label: '5. Playtime Telemetry', icon: Clock },
            { id: 'versions', label: '6. Builds & Versions', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-[#0B0E14] text-neutral-400 border-[#21262D] hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CORE DETAILS */}
        {activeTab === 'details' && (
          <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" /> Core Title Information
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Manage game metadata and storefront listing details</p>
              </div>

              {isDraft && (
                <button
                  onClick={handleSaveDetails}
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Details
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isDraft}
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                  Primary Genre
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  disabled={!isDraft}
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={!isDraft}
                placeholder="Cyberpunk, Open World, RPG, Rich Story"
                className="w-full bg-[#050505] border border-[#30363D] focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                Storefront Synopsis & Lore
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isDraft}
                className="w-full bg-[#050505] border border-[#30363D] focus:border-emerald-500 rounded-lg p-4 text-xs text-white outline-none disabled:opacity-50 leading-relaxed resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: PRICING & EDITIONS */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            {/* Existing Editions List */}
            <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#21262D] pb-4">
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" /> Configured Game Editions
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Multi-tier editions (Standard, Deluxe, Collector's) available for purchase</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editions.map((ed) => (
                  <div key={ed.id} className="bg-[#050505] border border-[#21262D] hover:border-amber-500/40 rounded-xl p-5 flex flex-col justify-between transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{ed.editionName}</span>
                        {editions.length > 1 && isDraft && (
                          <button
                            onClick={() => handleDeleteEdition(ed.id)}
                            className="text-neutral-500 hover:text-red-400 p-1"
                            title="Remove Edition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="text-2xl font-black text-amber-400 mb-3">
                        {ed.isFree ? 'FREE' : `₹${Number(ed.price).toFixed(0)}`}
                      </div>

                      {ed.features && ed.features.length > 0 && (
                        <div className="space-y-1 mb-4">
                          <p className="text-[10px] text-neutral-500 uppercase font-bold">Includes:</p>
                          <ul className="text-xs text-neutral-400 space-y-1">
                            {ed.features.map((feat: string, i: number) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Active Discounts on this edition */}
                      {ed.discounts && ed.discounts.length > 0 && (
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300">
                          <p className="font-bold flex items-center gap-1">
                            <Percent className="w-3 h-3" /> Active Discount: {Number(ed.discounts[0].percentage)}% OFF
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Valid until {new Date(ed.discounts[0].endsAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {isDraft && (
                      <div className="pt-4 border-t border-[#1C222C] mt-4 flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={Number(ed.price)}
                          id={`price-${ed.id}`}
                          className="w-24 bg-[#0B0E14] border border-[#30363D] px-2 py-1 rounded text-xs text-white"
                        />
                        <button
                          onClick={() => {
                            const val = Number((document.getElementById(`price-${ed.id}`) as HTMLInputElement).value);
                            handleUpdateEditionPrice(ed.id, ed.editionName, val, val === 0);
                          }}
                          className="px-3 py-1 bg-[#161B22] hover:bg-[#21262D] text-xs font-bold rounded border border-neutral-700 text-neutral-300"
                        >
                          Update
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Edition */}
            {isDraft && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form to add an Edition */}
                <form onSubmit={handleAddEdition} className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" /> Add Additional Edition Tier
                  </h3>
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">Edition Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Deluxe Edition / Ultimate Bundle"
                      value={newEditionName}
                      onChange={(e) => setNewEditionName(e.target.value)}
                      className="w-full bg-[#050505] border border-[#30363D] px-3.5 py-2 text-xs text-white rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">Price (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="2499"
                      value={newEditionPrice}
                      onChange={(e) => setNewEditionPrice(e.target.value)}
                      className="w-full bg-[#050505] border border-[#30363D] px-3.5 py-2 text-xs text-white rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">Bonus Perks / Features (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Season Pass, Digital Soundtrack, 1000 In-Game Coins"
                      value={newEditionFeatures}
                      onChange={(e) => setNewEditionFeatures(e.target.value)}
                      className="w-full bg-[#050505] border border-[#30363D] px-3.5 py-2 text-xs text-white rounded-lg outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Add Edition Tier
                  </button>
                </form>

                {/* Form to schedule a promotional discount */}
                <form onSubmit={handleAddDiscount} className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Percent className="w-4 h-4 text-amber-400" /> Launch Seasonal Discount
                  </h3>
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">Apply to Edition</label>
                    <select
                      value={discountTargetId}
                      onChange={(e) => setDiscountTargetId(e.target.value)}
                      className="w-full bg-[#050505] border border-[#30363D] px-3.5 py-2 text-xs text-white rounded-lg outline-none"
                    >
                      {editions.map(ed => (
                        <option key={ed.id} value={ed.id}>{ed.editionName} (₹{Number(ed.price)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">Discount Percentage (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full bg-[#050505] border border-[#30363D] px-3.5 py-2 text-xs text-white rounded-lg outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={discountStartsAt}
                        onChange={(e) => setDiscountStartsAt(e.target.value)}
                        className="w-full bg-[#050505] border border-[#30363D] px-3 py-1.5 text-xs text-white rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        value={discountEndsAt}
                        onChange={(e) => setDiscountEndsAt(e.target.value)}
                        className="w-full bg-[#050505] border border-[#30363D] px-3 py-1.5 text-xs text-white rounded-lg outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Activate Promotion
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEDIA GALLERY */}
        {activeTab === 'media' && (
          <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-400" /> Visual Assets & Showcase
                </h2>
                <p className="text-xs text-neutral-500 mt-1">High-resolution cover artwork, hero banners, screenshots, and trailers</p>
              </div>

              {isDraft && (
                <button
                  onClick={handleSaveMedia}
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Media Assets
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Image */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                  Portrait Cover Image URL (600x900)
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  disabled={!isDraft}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-pink-500 rounded-lg px-4 py-2.5 text-xs text-white outline-none disabled:opacity-50 mb-3"
                />
                {coverImageUrl && (
                  <div className="h-44 w-32 rounded-lg overflow-hidden border border-[#30363D] bg-neutral-950">
                    <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                  Landscape Hero Banner URL (1920x1080)
                </label>
                <input
                  type="url"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  disabled={!isDraft}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#050505] border border-[#30363D] focus:border-pink-500 rounded-lg px-4 py-2.5 text-xs text-white outline-none disabled:opacity-50 mb-3"
                />
                {bannerImageUrl && (
                  <div className="h-44 w-full rounded-lg overflow-hidden border border-[#30363D] bg-neutral-950">
                    <img src={bannerImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Trailer URL */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                Gameplay Trailer / Video URL (YouTube embed or MP4)
              </label>
              <input
                type="text"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                disabled={!isDraft}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[#050505] border border-[#30363D] focus:border-pink-500 rounded-lg px-4 py-2.5 text-xs text-white outline-none disabled:opacity-50"
              />
            </div>

            {/* Screenshots Gallery */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-bold mb-2">
                Screenshots Gallery ({screenshots.length} attached)
              </label>

              {isDraft && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="url"
                    placeholder="Add screenshot image URL..."
                    value={newScreenshotUrl}
                    onChange={(e) => setNewScreenshotUrl(e.target.value)}
                    className="flex-1 bg-[#050505] border border-[#30363D] focus:border-pink-500 rounded-lg px-3.5 py-2 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddScreenshot}
                    className="px-4 py-2 bg-[#161B22] hover:bg-[#21262D] text-xs font-bold rounded-lg border border-neutral-700 text-white"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {screenshots.map((s, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-[#30363D] bg-neutral-950 group h-28">
                    <img src={s} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    {isDraft && (
                      <button
                        onClick={() => handleRemoveScreenshot(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-black/80 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove screenshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HARDWARE REQUIREMENTS */}
        {activeTab === 'requirements' && (
          <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#21262D] pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" /> PC Hardware Compatibility Specs
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Minimum bare-metal and optimal yield specifications for players</p>
              </div>

              {isDraft && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetRequirements('MID_RANGE')}
                    className="px-3 py-1.5 bg-[#0D1117] hover:bg-[#161B22] text-[11px] font-bold text-neutral-300 rounded border border-[#30363D]"
                  >
                    Preset: Mid-Range PC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetRequirements('HIGH_END')}
                    className="px-3 py-1.5 bg-[#0D1117] hover:bg-[#161B22] text-[11px] font-bold text-neutral-300 rounded border border-[#30363D]"
                  >
                    Preset: High-End Rig
                  </button>
                  <button
                    onClick={handleSaveRequirements}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save Specs
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Minimum Specs */}
              <div className="space-y-4 bg-[#050505] p-5 rounded-xl border border-[#21262D]">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest pb-2 border-b border-[#21262D]">
                  Bare-Metal Minimum Specs
                </h3>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Operating System</label>
                  <input type="text" value={minOs} onChange={e => setMinOs(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Processor (CPU)</label>
                  <input type="text" value={minCpu} onChange={e => setMinCpu(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Graphics (GPU)</label>
                  <input type="text" value={minGpu} onChange={e => setMinGpu(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Memory (RAM)</label>
                  <input type="text" value={minMem} onChange={e => setMinMem(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Storage</label>
                  <input type="text" value={minStorage} onChange={e => setMinStorage(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Network</label>
                  <input type="text" value={minNetwork} onChange={e => setMinNetwork(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
              </div>

              {/* Recommended Specs */}
              <div className="space-y-4 bg-[#050505] p-5 rounded-xl border border-[#21262D]">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest pb-2 border-b border-[#21262D]">
                  Optimal Yield (Enjoyable) Specs
                </h3>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Operating System</label>
                  <input type="text" value={optOs} onChange={e => setOptOs(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Processor (CPU)</label>
                  <input type="text" value={optCpu} onChange={e => setOptCpu(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Graphics (GPU)</label>
                  <input type="text" value={optGpu} onChange={e => setOptGpu(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Memory (RAM)</label>
                  <input type="text" value={optMem} onChange={e => setOptMem(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Storage</label>
                  <input type="text" value={optStorage} onChange={e => setOptStorage(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-neutral-500 mb-1">Network</label>
                  <input type="text" value={optNetwork} onChange={e => setOptNetwork(e.target.value)} disabled={!isDraft} className="w-full bg-[#0D1117] border border-[#30363D] px-3 py-2 text-xs text-white rounded outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TELEMETRY BENCHMARKS */}
        {activeTab === 'telemetry' && (
          <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" /> Playtime Telemetry Benchmarks
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Target expected hours for main story, side quests, and 100% completionist playthroughs</p>
              </div>

              {isDraft && (
                <button
                  onClick={handleSaveTelemetry}
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Telemetry
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#050505] p-5 rounded-xl border border-[#21262D]">
                <label className="block text-xs uppercase text-neutral-400 font-bold mb-2">
                  Main Story (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={mainStoryHours}
                  onChange={(e) => setMainStoryHours(e.target.value)}
                  disabled={!isDraft}
                  className="w-full bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-lg px-4 py-2.5 text-lg font-black text-white outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-2">Core critical campaign progression only.</p>
              </div>

              <div className="bg-[#050505] p-5 rounded-xl border border-[#21262D]">
                <label className="block text-xs uppercase text-neutral-400 font-bold mb-2">
                  Main + Extras (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={mainExtrasHours}
                  onChange={(e) => setMainExtrasHours(e.target.value)}
                  disabled={!isDraft}
                  className="w-full bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-lg px-4 py-2.5 text-lg font-black text-white outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-2">Campaign plus side quests and exploration.</p>
              </div>

              <div className="bg-[#050505] p-5 rounded-xl border border-[#21262D]">
                <label className="block text-xs uppercase text-neutral-400 font-bold mb-2">
                  Completionist 100% (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={completionistHours}
                  onChange={(e) => setCompletionistHours(e.target.value)}
                  disabled={!isDraft}
                  className="w-full bg-[#0D1117] border border-[#30363D] focus:border-purple-500 rounded-lg px-4 py-2.5 text-lg font-black text-white outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-2">All achievements, collectibles, and secrets.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: VERSIONS & BUILDS */}
        {activeTab === 'versions' && (
          <div className="space-y-8">
            <div className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#21262D] pb-4">
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-400" /> Released Build Versions & Patch Notes
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Deploy game client binary updates with changelogs</p>
              </div>

              {/* Version History Table */}
              {game.versions && game.versions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#050505] text-neutral-400 uppercase tracking-wider border-b border-[#21262D]">
                      <tr>
                        <th className="p-3">Version</th>
                        <th className="p-3">Release Date</th>
                        <th className="p-3">Download URL</th>
                        <th className="p-3">Changelog</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C222C]">
                      {game.versions.map((v: any) => (
                        <tr key={v.id} className="hover:bg-[#0D1117]">
                          <td className="p-3 font-bold text-orange-400">v{v.version}</td>
                          <td className="p-3 text-neutral-500 font-mono">
                            {new Date(v.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-cyan-400 truncate max-w-xs">{v.downloadUrl || "Local Distribution"}</td>
                          <td className="p-3 text-neutral-300 max-w-sm">{v.changelog || "Initial game launch"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500">
                  <p>No builds deployed yet. You must upload at least one version (e.g. v1.0.0) before submitting for review.</p>
                </div>
              )}
            </div>

            {/* Deploy New Version Form */}
            {isDraft && (
              <form onSubmit={handleAddVersion} className="bg-[#0B0E14] border border-[#21262D] rounded-xl p-6 sm:p-8 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" /> Deploy New Game Client Version
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">
                      Semantic Version String (e.g. 1.0.0) *
                    </label>
                    <input
                      type="text"
                      placeholder="1.0.0"
                      value={newVersionNumber}
                      onChange={(e) => setNewVersionNumber(e.target.value)}
                      className="w-full bg-[#050505] border border-[#30363D] px-3.5 py-2 text-xs text-white rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">
                      Client Package / Download URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://cdn.gamestation.gg/builds/v1.0.0.zip"
                      value={newVersionUrl}
                      onChange={(e) => setNewVersionUrl(e.target.value)}
                      className="w-full bg-[#050505] border border-[#30363D] px-3.5 py-2 text-xs text-white rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 font-bold mb-1">
                    Changelog & Patch Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="List fixes, new game modes, frame rate optimizations..."
                    value={newVersionChangelog}
                    onChange={(e) => setNewVersionChangelog(e.target.value)}
                    className="w-full bg-[#050505] border border-[#30363D] px-3.5 py-2 text-xs text-white rounded-lg outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-xs transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                >
                  Deploy Client Version
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
