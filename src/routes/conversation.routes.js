import { Router } from 'express';
import conversationController from "../controllers/conversation.controller.js";
import { authenticate } from '../middleware/auth.middleware.js';

const conversationRouter = Router();

// Apply auth middleware to all conversation routes securely
conversationRouter.use(authenticate);

conversationRouter.post("/", conversationController.createConversation);
conversationRouter.get("/", conversationController.getConversations);

export default conversationRouter;
