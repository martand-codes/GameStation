import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";

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
  type: "GAME_LAUNCH" | "GAME_STOP" | "REVIEW_POSTED" | "STUDIO_REPLY" | "COMMUNITY_VOTE";
  username: string;
  gameTitle: string;
  gameId?: string;
  details?: string;
  timestamp: string;
}

export interface PlatformNotification {
  id: string;
  type: "REVIEW" | "DEVELOPER_REPLY" | "CERTIFICATION" | "SALE" | "SYSTEM" | "BROADCAST";
  title: string;
  message: string;
  targetUrl?: string;
  targetRole?: string;
  targetUserId?: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}

// Global In-Memory Socket Server Instance
let io: Server | null = null;

// Track active player gaming sessions by socket.id
const activeSessions = new Map<string, ActivePlayerSession>();

// Map of socketId to identified user credentials
const socketUserMap = new Map<string, { userId: string; role: string; username: string }>();

// Rolling buffer of notifications by userId or role
const notificationsStore: PlatformNotification[] = [
  {
    id: "notif-init-1",
    type: "SYSTEM",
    title: "GameStation Engine Active",
    message: "Real-time WebSocket telemetry pipeline connected and operational.",
    timestamp: new Date().toISOString(),
    read: false,
  },
];

// Rolling buffer of the last 30 live activities
const recentActivities: ActivityFeedItem[] = [
  {
    id: "act-init-1",
    type: "GAME_LAUNCH",
    username: "Player@04",
    gameTitle: "Grand Theft Auto Vice City",
    details: "Launched via GameStation Engine",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "act-init-2",
    type: "REVIEW_POSTED",
    username: "Player@08",
    gameTitle: "Cyberpunk 2077",
    details: "Rated Masterpiece (5.0/5)",
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];

export const initSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5000",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on("connection", (socket: Socket) => {
    // ── 0. Client Identification & Room Subscription ────────────────────────
    socket.on("auth:identify", (payload: { userId: string; role: string; username: string }) => {
      if (!payload?.userId) return;

      socketUserMap.set(socket.id, payload);

      // Join user-specific private room
      socket.join(`user:${payload.userId}`);

      // Join role-specific group room
      if (payload.role) {
        socket.join(`role:${payload.role}`);
      }

      // Filter notifications relevant to this user or role
      const userNotifs = notificationsStore.filter(
        (n) =>
          !n.targetUserId && !n.targetRole ||
          n.targetUserId === payload.userId ||
          n.targetRole === payload.role
      );

      socket.emit("notifications:initial", userNotifs.slice(0, 20));
      console.log(`[WebSocket] 👤 Identified socketId=${socket.id} as @${payload.username} (Role: ${payload.role})`);
    });

    // Send initial active state to the newly connected browser
    socket.emit("presence:initial", {
      activeSessions: Array.from(activeSessions.values()),
      recentActivities: recentActivities.slice(0, 15),
    });

    // ── 1. Event: Player Starts Playing a Game ──────────────────────────────
    socket.on("player:play:start", (payload: {
      userId: string;
      username: string;
      gameId: string;
      gameTitle: string;
      coverImageUrl?: string;
    }) => {
      if (!payload.userId || !payload.gameId) return;

      const session: ActivePlayerSession = {
        socketId: socket.id,
        userId: payload.userId,
        username: payload.username,
        gameId: payload.gameId,
        gameTitle: payload.gameTitle,
        coverImageUrl: payload.coverImageUrl,
        startedAt: new Date().toISOString(),
      };

      activeSessions.set(socket.id, session);

      // Create an activity feed item
      const activity: ActivityFeedItem = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: "GAME_LAUNCH",
        username: payload.username,
        gameTitle: payload.gameTitle,
        gameId: payload.gameId,
        details: "Entered virtual arena",
        timestamp: new Date().toISOString(),
      };

      recentActivities.unshift(activity);
      if (recentActivities.length > 30) recentActivities.pop();

      // Broadcast to ALL clients in real time
      io?.emit("presence:update", Array.from(activeSessions.values()));
      io?.emit("activity:new", activity);

      console.log(`[WebSocket] 🎮 ${payload.username} started playing "${payload.gameTitle}"`);
    });

    // ── 2. Event: Player Stops Playing ──────────────────────────────────────
    socket.on("player:play:stop", () => {
      handlePlayerStopped(socket.id);
    });

    // ── 3. Event: Browser Closes / Disconnects ──────────────────────────────
    socket.on("disconnect", (reason) => {
      socketUserMap.delete(socket.id);
      handlePlayerStopped(socket.id);
    });
  });

  return io;
};

// Helper: Handle when a player closes game or closes tab
const handlePlayerStopped = (socketId: string) => {
  const existing = activeSessions.get(socketId);
  if (existing) {
    activeSessions.delete(socketId);

    const activity: ActivityFeedItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: "GAME_STOP",
      username: existing.username,
      gameTitle: existing.gameTitle,
      gameId: existing.gameId,
      details: "Exited session",
      timestamp: new Date().toISOString(),
    };

    recentActivities.unshift(activity);
    if (recentActivities.length > 30) recentActivities.pop();

    io?.emit("presence:update", Array.from(activeSessions.values()));
    io?.emit("activity:new", activity);

    console.log(`[WebSocket] ⏹️ ${existing.username} stopped playing "${existing.gameTitle}"`);
  }
};

// ── Notification Dispatchers ────────────────────────────────────────────────

export const sendUserNotification = (
  userId: string,
  notification: Omit<PlatformNotification, "id" | "timestamp" | "read" | "targetUserId">
) => {
  if (!io) return;
  const notif: PlatformNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    targetUserId: userId,
    timestamp: new Date().toISOString(),
    read: false,
  };

  notificationsStore.unshift(notif);
  if (notificationsStore.length > 100) notificationsStore.pop();

  io.to(`user:${userId}`).emit("notification:new", notif);
  console.log(`[WebSocket Notification] -> User @${userId}: ${notif.title}`);
};

export const sendRoleNotification = (
  role: string,
  notification: Omit<PlatformNotification, "id" | "timestamp" | "read" | "targetRole">
) => {
  if (!io) return;
  const notif: PlatformNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    targetRole: role,
    timestamp: new Date().toISOString(),
    read: false,
  };

  notificationsStore.unshift(notif);
  if (notificationsStore.length > 100) notificationsStore.pop();

  io.to(`role:${role}`).emit("notification:new", notif);
  console.log(`[WebSocket Notification] -> Role [${role}]: ${notif.title}`);
};

export const broadcastPlatformEvent = (event: string, data: any) => {
  if (!io) return;
  io.emit(event, data);
};

export const broadcastActivity = (activity: Omit<ActivityFeedItem, "id" | "timestamp">) => {
  if (!io) return;
  const item: ActivityFeedItem = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
  };

  recentActivities.unshift(item);
  if (recentActivities.length > 30) recentActivities.pop();

  io.emit("activity:new", item);
};
