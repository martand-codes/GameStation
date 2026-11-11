import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface ActivePlayerSession {
  socketId: string;
  userId: string;
  username: string;
  gameId: string;
  gameTitle: string;
  coverImageUrl?: string;
  startedAt: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'GAME_LAUNCH' | 'GAME_STOP' | 'REVIEW_POSTED' | 'STUDIO_REPLY' | 'COMMUNITY_VOTE';
  username: string;
  gameTitle: string;
  gameId?: string;
  details?: string;
  timestamp: string;
}

export interface PlatformNotification {
  id: string;
  type: 'REVIEW' | 'DEVELOPER_REPLY' | 'CERTIFICATION' | 'SALE' | 'SYSTEM' | 'BROADCAST';
  title: string;
  message: string;
  targetUrl?: string;
  targetRole?: string;
  targetUserId?: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeSessions: ActivePlayerSession[];
  recentActivities: ActivityFeedItem[];
  notifications: PlatformNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  getGameActivePlayerCount: (gameId: string) => number;
  notifyGameStart: (game: { gameId: string; gameTitle: string; coverImageUrl?: string }) => void;
  notifyGameStop: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeSessions: [],
  recentActivities: [],
  notifications: [],
  unreadCount: 0,
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
  clearNotifications: () => {},
  getGameActivePlayerCount: () => 0,
  notifyGameStart: () => {},
  notifyGameStop: () => {},
});

const SOCKET_URL = 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActivePlayerSession[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityFeedItem[]>([]);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('[WebSocket Client] Connected to GameStation Live Engine:', socketInstance.id);
      setIsConnected(true);

      // Identify user if logged in on connection
      if (user) {
        socketInstance.emit('auth:identify', {
          userId: user.id,
          role: user.role,
          username: user.username,
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('[WebSocket Client] Disconnected from GameStation Live Engine');
      setIsConnected(false);
    });

    // Initial state from server
    socketInstance.on('presence:initial', (data: {
      activeSessions: ActivePlayerSession[];
      recentActivities: ActivityFeedItem[];
    }) => {
      if (data?.activeSessions) setActiveSessions(data.activeSessions);
      if (data?.recentActivities) setRecentActivities(data.recentActivities);
    });

    // Initial Notifications
    socketInstance.on('notifications:initial', (initialNotifs: PlatformNotification[]) => {
      if (initialNotifs) setNotifications(initialNotifs);
    });

    // Real-time Incoming Notification
    socketInstance.on('notification:new', (notif: PlatformNotification) => {
      setNotifications((prev) => [notif, ...prev]);

      // Pop toast notification
      if (notif.type === 'CERTIFICATION' || notif.type === 'SALE') {
        toast.success(`${notif.title} — ${notif.message}`);
      } else if (notif.type === 'REVIEW' || notif.type === 'DEVELOPER_REPLY') {
        toast.info(`${notif.title} — ${notif.message}`);
      } else {
        toast.info(notif.title);
      }
    });

    // Real-time Presence Updates
    socketInstance.on('presence:update', (sessions: ActivePlayerSession[]) => {
      setActiveSessions(sessions);
    });

    // Real-time Activity Ticker Item
    socketInstance.on('activity:new', (activity: ActivityFeedItem) => {
      setRecentActivities((prev) => [activity, ...prev.slice(0, 24)]);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Sync user credentials when login state changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && user) {
      socketRef.current.emit('auth:identify', {
        userId: user.id,
        role: user.role,
        username: user.username,
      });
    }
  }, [user?.id, user?.role, user?.username]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getGameActivePlayerCount = (gameId: string) => {
    return activeSessions.filter((s) => s.gameId === gameId).length;
  };

  const notifyGameStart = (game: { gameId: string; gameTitle: string; coverImageUrl?: string }) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit('player:play:start', {
      userId: user.id,
      username: user.username,
      gameId: game.gameId,
      gameTitle: game.gameTitle,
      coverImageUrl: game.coverImageUrl,
    });
  };

  const notifyGameStop = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('player:play:stop');
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        activeSessions,
        recentActivities,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        getGameActivePlayerCount,
        notifyGameStart,
        notifyGameStop,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
