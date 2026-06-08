import { Router } from 'express';
import conversationController from "../controllers/conversation.controller.js";
import { authenticate, authenticateOrInternalKey } from '../middleware/auth.middleware.js';

const conversationRouter = Router();

conversationRouter.post("/", authenticateOrInternalKey, conversationController.createConversation);
conversationRouter.get("/", authenticate, conversationController.getConversations);

export default conversationRouter;
