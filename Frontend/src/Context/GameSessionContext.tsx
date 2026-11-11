import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { LibraryItem } from '../Services/Library.service';
import { recordPlaytimeAPI } from '../Services/Telemetry.service';
import { useToast } from './ToastContext';

export interface ActiveSession {
  gameId: string;
  title: string;
  genre: string;
  developerName: string;
  bannerImageUrl?: string;
  coverImageUrl?: string;
  trailerUrl?: string;
  version: string;
  hardwareSpecs: {
    minOs?: string;
    minCpu?: string;
    minGpu?: string;
    minMem?: string;
    optGpu?: string;
    optMem?: string;
  };
  initialPlaytimeSeconds: number; // Stored in DB prior to session
  sessionSeconds: number; // Accumulated in this session
}

export interface SessionSummary {
  gameId: string;
  title: string;
  sessionSeconds: number;
  totalPlaytimeSeconds: number;
  canReview: boolean; // Eligible for verified review if total >= 600s (10 mins)
  endedAt: string;
}

interface GameSessionContextType {
  activeSession: ActiveSession | null;
  isLauncherOpen: boolean;
  isMinimized: boolean;
  sessionSummary: SessionSummary | null;
  launchGame: (item: LibraryItem) => void;
  minimizeSession: () => void;
  restoreSession: () => void;
  endSession: () => Promise<void>;
  clearSessionSummary: () => void;
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  // Tracks unsynced seconds in the current batch
  const unsyncedSecondsRef = useRef(0);
  const activeSessionRef = useRef<ActiveSession | null>(null);
  activeSessionRef.current = activeSession;

  // 1-second interval timer for active session
  useEffect(() => {
    if (!activeSession) return;

    const timer = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sessionSeconds: prev.sessionSeconds + 1,
        };
      });
      unsyncedSecondsRef.current += 1;
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession?.gameId]);

  // Periodic Heartbeat Sync to PostgreSQL (every 60 seconds)
  useEffect(() => {
    if (!activeSession) return;

    const heartbeatInterval = setInterval(async () => {
      const current = activeSessionRef.current;
      const secondsToSync = unsyncedSecondsRef.current;

      if (current && secondsToSync >= 10) {
        try {
          await recordPlaytimeAPI(current.gameId, secondsToSync);
          unsyncedSecondsRef.current = 0;
          console.log(`[HEARTBEAT] Synced +${secondsToSync}s to DB for "${current.title}"`);
        } catch (err) {
          console.error('[HEARTBEAT ERROR] Failed to sync playtime heartbeat:', err);
        }
      }
    }, 60000); // 60 seconds

    return () => clearInterval(heartbeatInterval);
  }, [activeSession?.gameId]);

  // Launch a game from Player Library
  const launchGame = (item: LibraryItem) => {
    // If another session is running, prompt or stop previous
    if (activeSession && activeSession.gameId !== item.game.id) {
      toast.warning(`Switching runtime from "${activeSession.title}" to "${item.game.title}"...`);
      endSession();
    }

    const latestVersion = item.game.versions && item.game.versions.length > 0 ? item.game.versions[0].version : 'v1.0.0';
    const reqs = item.game.requirements;

    const newSession: ActiveSession = {
      gameId: item.game.id,
      title: item.game.title,
      genre: item.game.genre || 'Action',
      developerName: item.game.developer?.username || 'Verified Studio',
      bannerImageUrl: item.game.media?.bannerImageUrl || item.game.media?.coverImageUrl,
      coverImageUrl: item.game.media?.coverImageUrl,
      trailerUrl: item.game.media?.trailerUrl || undefined,
      version: latestVersion,
      hardwareSpecs: {
        minOs: reqs?.minOs,
        minCpu: reqs?.minCpu,
        minGpu: reqs?.minGpu,
        minMem: reqs?.minMem,
        optGpu: reqs?.optGpu,
        optMem: reqs?.optMem,
      },
      initialPlaytimeSeconds: item.playTime || 0,
      sessionSeconds: 0,
    };

    unsyncedSecondsRef.current = 0;
    setActiveSession(newSession);
    setIsLauncherOpen(true);
    setIsMinimized(false);
  };

  const minimizeSession = () => {
    setIsMinimized(true);
    setIsLauncherOpen(false);
    toast.info(`Game session minimized: "${activeSession?.title}" running in background.`);
  };

  const restoreSession = () => {
    setIsMinimized(false);
    setIsLauncherOpen(true);
  };

  const endSession = async () => {
    const current = activeSessionRef.current;
    if (!current) return;

    const finalSeconds = unsyncedSecondsRef.current;
    const totalSessionSeconds = current.sessionSeconds;
    const newTotalPlaytime = current.initialPlaytimeSeconds + totalSessionSeconds;

    // Send final batch to database
    if (finalSeconds > 0) {
      try {
        await recordPlaytimeAPI(current.gameId, finalSeconds);
      } catch (err) {
        console.error('Final session sync failed:', err);
      }
    }

    unsyncedSecondsRef.current = 0;

    // Create session summary report for the player
    setSessionSummary({
      gameId: current.gameId,
      title: current.title,
      sessionSeconds: totalSessionSeconds,
      totalPlaytimeSeconds: newTotalPlaytime,
      canReview: newTotalPlaytime >= 600, // 10 minutes threshold for verified review
      endedAt: new Date().toISOString(),
    });

    setActiveSession(null);
    setIsLauncherOpen(false);
    setIsMinimized(false);
  };

  const clearSessionSummary = () => {
    setSessionSummary(null);
  };

  return (
    <GameSessionContext.Provider
      value={{
        activeSession,
        isLauncherOpen,
        isMinimized,
        sessionSummary,
        launchGame,
        minimizeSession,
        restoreSession,
        endSession,
        clearSessionSummary,
      }}
    >
      {children}
    </GameSessionContext.Provider>
  );
};

export const useGameSession = () => {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
};
