import { Router } from "express";
import { requireToken } from "../Middlewares/bouncer.middleware.js";
import {
  getFriendsHandler,
  sendFriendRequestHandler,
  respondToFriendRequestHandler,
  removeFriendHandler,
  getDirectMessagesHandler,
  sendDirectMessageHandler,
} from "../Controllers/friend.controller.js";

const router = Router();

// All friend routes require authentication
router.use(requireToken);

// Friends Roster & Requests
router.get("/", getFriendsHandler);
router.post("/request", sendFriendRequestHandler);
router.post("/:id/respond", respondToFriendRequestHandler);
router.delete("/:id", removeFriendHandler);

// Direct Messages & Chat
router.get("/:friendId/messages", getDirectMessagesHandler);
router.post("/:friendId/messages", sendDirectMessageHandler);

export default router;
