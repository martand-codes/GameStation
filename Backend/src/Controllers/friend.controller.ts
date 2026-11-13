import type { Response } from "express";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";
import {
  getFriendsData,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  getDirectMessages,
  sendDirectMessage,
} from "../Services/friend.service.js";

export const getFriendsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getFriendsData(userId);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load friends roster",
    });
  }
};

export const sendFriendRequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { username } = req.body;
    const result = await sendFriendRequest(userId, username);

    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to send friend request",
    });
  }
};

export const respondToFriendRequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = String(req.params.id);
    const { action } = req.body; // 'ACCEPT' | 'DECLINE'

    if (action !== "ACCEPT" && action !== "DECLINE") {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be ACCEPT or DECLINE.",
      });
    }

    const result = await respondToFriendRequest(userId, id, action);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to respond to friend request",
    });
  }
};

export const removeFriendHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const id = String(req.params.id);
    const result = await removeFriend(userId, id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to remove friend",
    });
  }
};

export const getDirectMessagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const friendId = String(req.params.friendId);
    const messages = await getDirectMessages(userId, friendId);

    res.status(200).json({ success: true, data: messages });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load chat history",
    });
  }
};

export const sendDirectMessageHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const friendId = String(req.params.friendId);
    const { content } = req.body;

    const message = await sendDirectMessage(userId, friendId, content);
    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to send direct message",
    });
  }
};
