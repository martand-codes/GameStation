import React, { useState, useEffect } from 'react';
import {
  Terminal,
  X,
  Play,
  Square,
  Cpu,
  HardDrive,
  Zap,
  Volume2,
  VolumeX,
  ExternalLink,
  Minimize2,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';
import { useGameSession } from '../../Context/GameSessionContext';

export default function GameLauncherModal() {
  const { activeSession, isLauncherOpen, minimizeSession, endSession } = useGameSession();

  const [bootPhase, setBootPhase] = useState<'booting' | 'running'>('booting');
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [fps, setFps] = useState(144);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Boot sequence animation on new session
  useEffect(() => {
    if (!activeSession) return;

    // If session is already running (> 5 seconds), skip boot sequence directly to running
    if (activeSession.sessionSeconds > 5) {
      setBootPhase('running');
      return;
    }

    setBootPhase('booting');
    setBootLogs([]);

    const specs = activeSession.hardwareSpecs;
    const logsSequence = [
      `> [KERNEL] Allocating process heap for '${activeSession.title}'...`,
      `> [STUDIO] Authenticated cryptographic signature: @${activeSession.developerName}`,
      `> [DRM] Handshaking GameStation Cryptographic License: OWNER_AUTHENTICATED`,
      `> [HARDWARE] Target GPU: ${specs.optGpu || specs.minGpu || 'DX12 / Vulkan Hardware Acceleration'}`,
      `> [VRAM] Allocated ${specs.optMem || specs.minMem || '4.0 GB'} host memory buffers (${activeSession.version})...`,
      `> [SYSTEM] OS Target: ${specs.minOs || 'Windows 64-bit Core'}`,
      `> [INPUT] Polling DirectInput & HID gamepads: 1 device connected`,
      `> [EXEC] Spawning game_instance.exe PID: ${Math.floor(10000 + Math.random() * 90000)}`,
      `> [RUNTIME] Frame loop initialized. V-Sync locked @ 144Hz.`,
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logsSequence.length) {
        setBootLogs((prev) => [...prev, logsSequence[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBootPhase('running'), 400);
      }
    }, 220);

    return () => clearInterval(interval);
  }, [activeSession?.gameId]);

  // Dynamic FPS jitter simulation
  useEffect(() => {
    if (bootPhase !== 'running') return;
    const interval = setInterval(() => {
      setFps(Math.floor(138 + Math.random() * 10));
    }, 1500);
    return () => clearInterval(interval);
  }, [bootPhase]);

  if (!isLauncherOpen || !activeSession) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hrs = Math.floor(mins / 60);
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const specs = activeSession.hardwareSpecs;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-[#0B0F14] border border-emerald-500/40 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.3)] flex flex-col w-full ${isFullscreen ? 'h-screen rounded-none border-none' : 'max-w-4xl max-h-[90vh]'}`}>
        
        {/* Terminal Window Title Bar */}
        <div className="bg-[#121820] border-b border-[#253240] px-4 py-2.5 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block border border-red-600/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/50" />
            <span className="text-xs text-[#8B949E] ml-2 flex items-center gap-1.5 font-bold truncate max-w-[220px] sm:max-w-md">
              <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              game_instance://{activeSession.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.exe [PID 49102]
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-[#8B949E] hover:text-white transition-colors p-1"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-[#8B949E] hover:text-white transition-colors p-1 hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Minimize to Background */}
            <button
              onClick={minimizeSession}
              className="text-[#8B949E] hover:text-white transition-colors p-1"
              title="Minimize Session to Topbar (Keep Running in Background)"
            >
              <Minimize2 className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Stop / Close Process */}
            <button
              onClick={endSession}
              className="text-[#8B949E] hover:text-red-400 transition-colors p-1"
              title="End Session & Save Playtime"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Runtime Viewport Area */}
        <div className="relative bg-[#05070A] flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden min-h-[380px]">
          
          {/* Background Ambient Art / Video Preview */}
          {activeSession.bannerImageUrl && (
            <div 
              className="absolute inset-0 opacity-20 bg-cover bg-center filter blur-[2px] pointer-events-none transform scale-105"
              style={{ backgroundImage: `url(${activeSession.bannerImageUrl})` }}
            />
          )}

          {/* CRT scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-35" />

          {/* Top HUD: Genuine Hardware Telemetry from DB */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-[#0D131A]/90 border border-[#212C38] px-4 py-2.5 rounded-lg text-xs backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>FPS: {bootPhase === 'running' ? fps : '--'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[#8B949E]" title={`Required CPU: ${specs.minCpu || 'Standard'}`}>
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[130px]">{specs.minCpu || 'CPU: 18%'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[#8B949E]" title={`Allocated Memory: ${specs.optMem || specs.minMem || '4 GB'}`}>
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>VRAM: {specs.optMem || specs.minMem || '3.8 GB'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs font-mono">
                <span className="text-[#556772]">SESSION: </span>
                <span className="text-emerald-300 font-bold tracking-wider tabular-nums">
                  {formatTime(activeSession.sessionSeconds)}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                bootPhase === 'running' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {bootPhase}
              </span>
            </div>
          </div>

          {/* Center Screen: Boot sequence OR Live Game Telemetry State */}
          <div className="relative z-10 flex-1 flex flex-col justify-center my-4 overflow-y-auto">
            {bootPhase === 'booting' && (
              <div className="space-y-1.5 text-xs text-[#8B949E] max-w-xl mx-auto w-full bg-[#090D12]/95 p-5 rounded-xl border border-[#1A2633] shadow-2xl">
                {bootLogs.map((log, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">»</span>
                    <span className={index === bootLogs.length - 1 ? 'text-white font-semibold' : ''}>{log}</span>
                  </div>
                ))}
                <div className="animate-pulse text-emerald-400 font-bold">_</div>
              </div>
            )}

            {bootPhase === 'running' && (
              <div className="text-center space-y-4 py-4">
                <div className="inline-flex p-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.35)] animate-pulse">
                  <Play className="w-8 h-8 text-emerald-400 fill-emerald-400" />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase drop-shadow-md">
                    {activeSession.title}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 mt-1">
                    <span>@{activeSession.developerName}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-400">{activeSession.genre}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-emerald-300 font-mono font-bold">Version {activeSession.version}</span>
                  </div>
                </div>

                <div className="max-w-md mx-auto p-3.5 rounded-lg bg-black/60 border border-white/[0.08] text-xs text-neutral-300 font-sans space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-[11px] pb-1.5 border-b border-white/[0.06]">
                    <span>TOTAL ON RECORD:</span>
                    <span className="text-white font-bold">
                      {((activeSession.initialPlaytimeSeconds + activeSession.sessionSeconds) / 3600).toFixed(1)} Hours
                    </span>
                  </div>
                  <p className="text-[12px] text-neutral-400 leading-relaxed font-sans">
                    Process active in Ring-3 isolation. Session heartbeat syncing to PostgreSQL telemetry node every 60s.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Action buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1C2633] text-xs">
            <div className="text-[#8B949E] text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>RING-3 SANDBOX ACTIVE</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">{activeSession.version}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={minimizeSession}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 rounded font-bold transition-all text-xs cursor-pointer"
                title="Minimize and keep playing while browsing store"
              >
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Minimize to Background</span>
              </button>

              <button
                onClick={endSession}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50 rounded font-bold transition-all text-xs cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" />
                <span>Stop Process &amp; Save</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
