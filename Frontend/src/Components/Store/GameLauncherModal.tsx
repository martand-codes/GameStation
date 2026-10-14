import { useState, useEffect } from 'react';
import { Terminal, X, Play, Square, Cpu, HardDrive, Zap, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import type { LibraryItem } from '../../Services/Library.service';

interface GameLauncherModalProps {
  item: LibraryItem | null;
  onClose: () => void;
  onUpdatePlaytime?: (gameId: string, additionalSeconds: number) => void;
}

export default function GameLauncherModal({ item, onClose, onUpdatePlaytime }: GameLauncherModalProps) {
  if (!item) return null;

  const [bootPhase, setBootPhase] = useState<'booting' | 'running' | 'terminated'>('booting');
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [fps, setFps] = useState(144);

  const latestVersion = item.game.versions && item.game.versions.length > 0 ? item.game.versions[0] : null;

  // Boot sequence animation
  useEffect(() => {
    setBootPhase('booting');
    setElapsedSeconds(0);
    const logsSequence = [
      `> [KERNEL] Allocating process heap for '${item.game.title}'...`,
      `> [DRM] Handshaking GameStation Cryptographic License: ${item.libraryId.slice(0, 8).toUpperCase()}`,
      `> [DRM] Status: LICENSE_AUTHENTICATED (Permanent Owner)`,
      `> [HARDWARE] Detecting GPU: WebGL2 / Vulkan Hardware Acceleration Enabled`,
      `> [VRAM] Mounting textures and audio buffers (${latestVersion ? latestVersion.version : 'v1.0.0'})...`,
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
        setTimeout(() => setBootPhase('running'), 600);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [item]);

  // Play session timer and FPS jitter
  useEffect(() => {
    if (bootPhase !== 'running') return;

    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      // Realistic slight FPS fluctuation
      setFps(Math.floor(138 + Math.random() * 12));
    }, 1000);

    return () => clearInterval(timer);
  }, [bootPhase]);

  const handleStop = () => {
    setBootPhase('terminated');
    if (onUpdatePlaytime && elapsedSeconds > 0) {
      onUpdatePlaytime(item.game.id, elapsedSeconds);
    }
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hrs = Math.floor(mins / 60);
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="bg-[#0B0F14] border border-emerald-500/40 rounded-lg max-w-4xl w-full overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col">
        
        {/* Terminal Window Title Bar */}
        <div className="bg-[#121820] border-b border-[#253240] px-4 py-2.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block border border-red-600/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/50" />
            <span className="text-xs text-[#8B949E] ml-2 flex items-center gap-1.5 font-bold">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              game_instance://{item.game.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.exe [PID 49102]
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-[#8B949E] hover:text-white transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={handleStop}
              className="text-[#8B949E] hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Runtime Viewport Area */}
        <div className="relative bg-[#05070A] h-96 flex flex-col justify-between p-6 overflow-hidden">
          
          {/* Background Ambient Glow */}
          {item.game.media?.bannerImageUrl && (
            <div 
              className="absolute inset-0 opacity-15 bg-cover bg-center filter blur-sm pointer-events-none"
              style={{ backgroundImage: `url(${item.game.media.bannerImageUrl})` }}
            />
          )}

          {/* CRT scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30" />

          {/* Top HUD: Hardware Telemetry */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-[#0D131A]/80 border border-[#212C38] px-4 py-2 rounded-md text-xs backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>FPS: {bootPhase === 'running' ? fps : '--'}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[#8B949E]">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>CPU: 18%</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[#8B949E]">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>VRAM: 3.8GB</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs">
                <span className="text-[#556772]">SESSION: </span>
                <span className="text-emerald-300 font-bold tracking-wider">{formatTime(elapsedSeconds)}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                bootPhase === 'running' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {bootPhase}
              </span>
            </div>
          </div>

          {/* Center Screen: Boot sequence or Live Game Experience */}
          <div className="relative z-10 flex-1 flex flex-col justify-center my-4 overflow-y-auto custom-scrollbar">
            {bootPhase === 'booting' && (
              <div className="space-y-1.5 text-xs text-[#8B949E] max-w-xl mx-auto w-full bg-[#090D12]/90 p-4 rounded border border-[#1A2633]">
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
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
                  <Play className="w-10 h-10 text-emerald-400 fill-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-wide uppercase drop-shadow-md">
                    {item.game.title}
                  </h2>
                  <p className="text-xs text-emerald-400/80 mt-1">
                    {item.ownedPricing ? item.ownedPricing.editionName : 'Standard Edition'} // ACTIVE RUNTIME
                  </p>
                </div>
                <p className="text-xs text-[#8B949E] max-w-md mx-auto">
                  Game process active. Telemetry and achievements are streaming to your GameStation ID.
                </p>

                {latestVersion?.downloadUrl && (
                  <div className="pt-2">
                    <a
                      href={latestVersion.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-bold transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Launch External WebGL Build / Download Executable
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar: Action buttons */}
          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-[#1C2633] text-xs">
            <div className="text-[#8B949E] text-[11px]">
              VERSION: <span className="text-white font-bold">{latestVersion ? latestVersion.version : 'v1.0.0'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded font-bold transition-all text-xs"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" /> Stop Process & Save Session
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
