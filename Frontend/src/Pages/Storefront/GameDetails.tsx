import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Download, Cpu, HardDrive, ShieldAlert, Disc } from 'lucide-react';
import SystemRequirements from '../../Components/Store/SystemRequirements';
import AiSystemCheck from '../../Components/Store/AiSystemCheck';
import TelemetryReviews from '../../Components/Store/TelemetryReviews';
import MediaGallery from '../../Components/Store/MediaGallery';
import GameEditions from '../../Components/Store/GameEditions';

interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  tags?: string[];
  pricing: { editionName: string; price: number; isFree: boolean; features: string[] }[];
  media: { coverImageUrl: string; bannerImageUrl: string; screenshots: string[]; trailerUrl?: string };
  developer: { username: string };
  versions: { version: string; releaseNotes: string; isLatest: boolean; releaseDate: string }[];
  telemetry?: { mainStoryHours: number; mainExtrasHours: number; completionistHours: number };
}

export default function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>(['> Initializing game node sequence...']);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLogs(prev => [...prev, `> Executing GET /store/games/${id}`]);
        const response = await axios.get(`http://localhost:5000/api/store/games/${id}`, {
          withCredentials: true
        });
        if (response.data.success) {
          setGame(response.data.data);
          setLogs(prev => [...prev, `> Query OK. Payload received.`]);
        }
      } catch (error) {
        console.error("Failed to fetch game details", error);
        setLogs(prev => [...prev, '> ERROR 404: Node not found or access denied.']);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchGameDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 font-mono text-blue-500">
        <Terminal className="h-12 w-12 mb-4 animate-pulse" />
        <div className="w-full max-w-md bg-[#0D1117] p-4 rounded-md border border-[#30363D]">
          {logs.map((log, i) => (
            <p key={i} className="text-sm mb-1">{log}</p>
          ))}
          <p className="text-sm mt-2 animate-pulse">_</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-20 font-mono">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-red-400 mb-2">CRITICAL ERROR</h2>
        <p className="text-[#8B949E]">Game instance not found in the matrix.</p>
        <button onClick={() => navigate('/store')} className="mt-6 text-blue-400 hover:underline">
          &lt; Return to safe zone
        </button>
      </div>
    );
  }

  const latestVersion = game.versions?.find(v => v.isLatest) || game.versions?.[0];

  return (
    <div className="font-mono text-[#C9D1D9] max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Title & Breadcrumbs */}
      <div className="mb-4">
        <div className="text-xs text-[#8B949E] mb-2 flex items-center gap-2">
          <span className="hover:text-white cursor-pointer transition-colors">All Games</span> &gt;
          <span className="hover:text-white cursor-pointer transition-colors">{game.genre} Games</span> &gt;
          <span className="text-white">{game.title}</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tighter drop-shadow-md">
          {game.title}
        </h1>
      </div>

      {/* Top Hero Section: Media Gallery + Info Column */}
      <div className="flex flex-col lg:flex-row gap-4 bg-[#0D1117]/30 rounded-md">
        {/* Left: Media Gallery */}
        <div className="lg:w-2/3">
          <MediaGallery
            screenshots={game.media?.screenshots || []}
            trailerUrl={game.media?.trailerUrl}
          />
        </div>
        
        {/* Right: Info Column */}
        <div className="lg:w-1/3 flex flex-col gap-3">
          <img src={game.media?.coverImageUrl} alt={game.title} className="w-full rounded-sm border border-[#30363D] shadow-md" />
          <p className="text-sm text-[#C9D1D9] line-clamp-4">{game.description}</p>
          
          <div className="text-xs space-y-1 mt-2">
            <div className="flex justify-between">
              <span className="text-[#556772]">RECENT REVIEWS:</span>
              <span className="text-emerald-500">Very Positive</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#556772]">RELEASE DATE:</span>
              <span className="text-[#8F98A0]">{latestVersion ? new Date(latestVersion.releaseDate).toLocaleDateString() : 'TBD'}</span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-[#30363D]/50">
              <span className="text-[#556772]">DEVELOPER:</span>
              <span onClick={() => navigate(`/dev/${game.developer?.username}`)} className="text-blue-400 hover:text-white cursor-pointer transition-colors hover:underline">@{game.developer?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#556772]">PUBLISHER:</span>
              <span onClick={() => navigate(`/dev/${game.developer?.username}`)} className="text-blue-400 hover:text-white cursor-pointer transition-colors hover:underline">@{game.developer?.username}</span>
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-[10px] text-[#556772] mb-1">Popular user-defined tags for this product:</p>
            <div className="flex flex-wrap gap-1">
              {game.genre && (
                <span className="px-2 py-1 bg-[#1A2634] text-blue-400 text-[10px] rounded-sm hover:bg-[#2A475E] cursor-pointer transition-colors">{game.genre}</span>
              )}
              {game.tags && game.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-[#1A2634] text-blue-400 text-[10px] rounded-sm hover:bg-[#2A475E] cursor-pointer transition-colors">{tag}</span>
              ))}
              <span className="px-2 py-1 bg-[#1A2634] text-blue-400 text-[10px] rounded-sm hover:bg-[#2A475E] cursor-pointer transition-colors">+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Action Box */}
      <GameEditions editions={game.pricing || []} title={game.title} gameId={game.id} coverImage={game.coverImage} />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">

          <section className="bg-[#0D1117] border border-[#30363D] p-6 rounded-md relative overflow-hidden">
            <h2 className="text-lg font-bold text-blue-400 border-b border-[#30363D] pb-2 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Terminal className="h-4 w-4" /> Description.txt
            </h2>
            <p className="text-[#8B949E] leading-relaxed whitespace-pre-wrap relative z-10">
              {game.description}
            </p>
          </section>

          {/* How Long To Beat / Telemetry */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0D1117] border border-[#30363D] p-4 rounded-md text-center border-t-2 border-t-purple-500">
              <p className="text-xs text-[#8B949E] uppercase tracking-widest mb-1">Main Story</p>
              <p className="text-2xl font-bold text-white">{game.telemetry?.mainStoryHours || '12.5'} <span className="text-sm text-[#484F58]">HRS</span></p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] p-4 rounded-md text-center border-t-2 border-t-emerald-500">
              <p className="text-xs text-[#8B949E] uppercase tracking-widest mb-1">Main + Extras</p>
              <p className="text-2xl font-bold text-white">{game.telemetry?.mainExtrasHours || '24.0'} <span className="text-sm text-[#484F58]">HRS</span></p>
            </div>
            <div className="bg-[#0D1117] border border-[#30363D] p-4 rounded-md text-center border-t-2 border-t-red-500">
              <p className="text-xs text-[#8B949E] uppercase tracking-widest mb-1">Completionist</p>
              <p className="text-2xl font-bold text-white">{game.telemetry?.completionistHours || '45.2'} <span className="text-sm text-[#484F58]">HRS</span></p>
            </div>
          </section>

          <SystemRequirements />
          
          <AiSystemCheck />


          <TelemetryReviews />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">

          <section className="bg-[#0D1117] border border-[#30363D] p-6 rounded-md border-l-4 border-l-blue-500">
            <h2 className="text-sm font-bold text-blue-400 border-b border-[#30363D] pb-2 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Download className="h-4 w-4" /> Version_Control
            </h2>
            {latestVersion ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/50">LATEST</span>
                  <span className="font-bold text-white text-sm">v{latestVersion.version}</span>
                </div>
                <p className="text-[#8B949E] italic">Deployed: {new Date(latestVersion.releaseDate).toLocaleDateString()}</p>
                <div className="mt-3 bg-black border border-[#30363D] p-3 text-[#484F58]">
                  <p className="text-blue-500 mb-1 font-bold">Changelog:</p>
                  <p className="whitespace-pre-wrap">{latestVersion.releaseNotes}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8B949E]">No version history found.</p>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
