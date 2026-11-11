import { prisma } from "../prisma/db.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../Utils/errors.js";
import { sendUserNotification, broadcastPlatformEvent } from "../socket.js";

export const getFriendsData = async (userId: string) => {
  // 1. Accepted Friendships
  const acceptedFriendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: {
        select: { id: true, username: true, role: true, createdAt: true },
      },
      receiver: {
        select: { id: true, username: true, role: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const friends = acceptedFriendships.map((f) => {
    const friendUser = f.senderId === userId ? f.receiver : f.sender;
    return {
      friendshipId: f.id,
      id: friendUser.id,
      username: friendUser.username,
      role: friendUser.role,
      friendsSince: f.updatedAt,
    };
  });

  // 2. Incoming Pending Requests (People who requested to add me)
  const incomingRequests = await prisma.friendship.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
    },
    include: {
      sender: {
        select: { id: true, username: true, role: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingIncoming = incomingRequests.map((r) => ({
    friendshipId: r.id,
    sender: r.sender,
    createdAt: r.createdAt,
  }));

  // 3. Outgoing Pending Requests (Requests I sent)
  const outgoingRequests = await prisma.friendship.findMany({
    where: {
      senderId: userId,
      status: "PENDING",
    },
    include: {
      receiver: {
        select: { id: true, username: true, role: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingOutgoing = outgoingRequests.map((r) => ({
    friendshipId: r.id,
    receiver: r.receiver,
    createdAt: r.createdAt,
  }));

  return {
    friends,
    pendingIncoming,
    pendingOutgoing,
  };
};

export const sendFriendRequest = async (senderId: string, targetUsername: string) => {
  const cleanUsername = targetUsername.trim().replace(/^@/, "");

  if (!cleanUsername) {
    throw new BadRequestError("Please provide a valid username.");
  }

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { id: true, username: true },
  });

  if (!sender) {
    throw new NotFoundError("Sender user not found.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { username: cleanUsername },
    select: { id: true, username: true, role: true },
  });

  if (!targetUser) {
    throw new NotFoundError(`Player with username "@${cleanUsername}" was not found.`);
  }

  if (targetUser.id === senderId) {
    throw new BadRequestError("Social Integrity Rule: You cannot add yourself as a friend.");
  }

  // Check if existing friendship or request exists
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId, receiverId: targetUser.id },
        { senderId: targetUser.id, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      throw new BadRequestError(`You are already friends with @${targetUser.username}.`);
    }
    if (existing.status === "PENDING") {
      if (existing.senderId === senderId) {
        throw new BadRequestError("Friend request is already pending approval.");
      } else {
        // If the other user already sent a request, automatically accept it!
        const accepted = await prisma.friendship.update({
          where: { id: existing.id },
          data: { status: "ACCEPTED" },
        });

        // Notify both users
        sendUserNotification(existing.senderId, {
          type: "SYSTEM",
          title: "Friend Request Accepted",
          message: `@${sender.username} and you are now connected friends!`,
          targetUrl: "/store/friends",
        });

        return { friendship: accepted, message: `Mutual request detected! You are now friends with @${targetUser.username}.` };
      }
    }
  }

  // Create new pending friendship
  const friendship = await prisma.friendship.create({
    data: {
      senderId,
      receiverId: targetUser.id,
      status: "PENDING",
    },
    include: {
      receiver: { select: { id: true, username: true } },
    },
  });

  // Notify receiver in real time via WebSocket
  sendUserNotification(targetUser.id, {
    type: "SYSTEM",
    title: "New Friend Request",
    message: `@${sender.username} sent you a friend request.`,
    targetUrl: "/store/friends",
  });

  return { friendship, message: `Friend request dispatched to @${targetUser.username}.` };
};

export const respondToFriendRequest = async (
  userId: string,
  friendshipId: string,
  action: "ACCEPT" | "DECLINE"
) => {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
    include: {
      sender: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } },
    },
  });

  if (!friendship) {
    throw new NotFoundError("Friend request not found.");
  }

  if (friendship.receiverId !== userId) {
    throw new ForbiddenError("Clearance Violation: You can only respond to requests sent to you.");
  }

  if (friendship.status !== "PENDING") {
    throw new BadRequestError(`This request has already been ${friendship.status.toLowerCase()}.`);
  }

  if (action === "ACCEPT") {
    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });

    // Notify sender that request was accepted
    sendUserNotification(friendship.senderId, {
      type: "SYSTEM",
      title: "Friend Request Accepted",
      message: `@${friendship.receiver.username} accepted your friend request!`,
      targetUrl: "/store/friends",
    });

    return { success: true, message: `You are now friends with @${friendship.sender.username}!` };
  } else {
    // Delete or mark declined
    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { success: true, message: `Friend request from @${friendship.sender.username} was declined.` };
  }
};

export const removeFriend = async (userId: string, friendshipId: string) => {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship) {
    throw new NotFoundError("Friendship record not found.");
  }

  if (friendship.senderId !== userId && friendship.receiverId !== userId) {
    throw new ForbiddenError("You cannot unfriend this user.");
  }

  await prisma.friendship.delete({
    where: { id: friendshipId },
  });

  return { success: true, message: "Friend removed from your roster." };
};

// ── Direct Messaging ────────────────────────────────────────────────────────

export const getDirectMessages = async (userId: string, friendId: string) => {
  // Verify friendship exists and is accepted
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
  });

  if (!friendship) {
    throw new BadRequestError("You can only message players who are on your accepted friends list.");
  }

  // Fetch messages between these two players
  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, username: true } },
    },
  });

  // Mark incoming unread messages as read
  await prisma.directMessage.updateMany({
    where: {
      senderId: friendId,
      receiverId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return messages;
};

export const sendDirectMessage = async (
  senderId: string,
  receiverId: string,
  content: string
) => {
  const cleanContent = content.trim();
  if (!cleanContent) {
    throw new BadRequestError("Message content cannot be blank.");
  }

  // Verify friendship exists and is accepted
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (!friendship) {
    throw new BadRequestError("You can only message confirmed friends.");
  }

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { id: true, username: true },
  });

  const message = await prisma.directMessage.create({
    data: {
      senderId,
      receiverId,
      content: cleanContent,
    },
    include: {
      sender: { select: { id: true, username: true } },
    },
  });

  // Real-Time Delivery via WebSocket:
  // Emit to receiver's private room and sender's private room
  broadcastPlatformEvent(`chat:message:user:${receiverId}`, message);
  broadcastPlatformEvent(`chat:message:user:${senderId}`, message);

  // Send desktop/toast notification to receiver
  sendUserNotification(receiverId, {
    type: "SYSTEM",
    title: `Message from @${sender?.username}`,
    message: cleanContent.length > 60 ? `${cleanContent.slice(0, 60)}...` : cleanContent,
    targetUrl: `/store/friends?chatWith=${senderId}`,
  });

  return message;
};

