import { Router } from 'express';
import messageController from "../controllers/message.controller.js";
import { authenticate } from '../middleware/auth.middleware.js';

const messageRouter = Router();

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Get all messages for a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of messages
 */
messageRouter.get("/:conversationId", authenticate, messageController.getMessages);
messageRouter.post("/send", messageController.sendMessage);

export default messageRouter;
