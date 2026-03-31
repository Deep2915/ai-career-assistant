import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getConversations,
  getAllChats,
  getChatsByConversation,
  sendChat,
  deleteConversation,
} from "../controllers/chatController.js";

const router = Router();

router.get("/conversations", verifyToken, getConversations);
router.get("/chats", verifyToken, getAllChats);
router.get("/chats/:conversationId", verifyToken, getChatsByConversation);
router.post("/chat", verifyToken, sendChat);
router.delete("/conversations/:conversationId", verifyToken, deleteConversation);

export default router;
