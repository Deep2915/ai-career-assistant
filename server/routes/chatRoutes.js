import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getConversations,
  getAllChats,
  getChatsByConversation,
  sendChat,
} from "../controllers/chatController.js";

const router = Router();

router.get("/conversations", verifyToken, getConversations);
router.get("/chats", verifyToken, getAllChats);
router.get("/chats/:conversationId", verifyToken, getChatsByConversation);
router.post("/chat", verifyToken, sendChat);

export default router;
