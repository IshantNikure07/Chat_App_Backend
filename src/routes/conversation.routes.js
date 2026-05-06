import { Router } from 'express';
import conversationController from "../controllers/conversation.controller.js";
import { authenticate } from '../middleware/auth.middleware.js';

const conversationRouter = Router();

// Apply auth middleware to all conversation routes securely
conversationRouter.use(authenticate);
/**
 * @swagger
 * /api/conversation:
 *   post:
 *     summary: Create a new conversation (direct or group)
 *     description: Creates a new conversation or returns existing direct conversation if already present
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: number
 *                 example: 2
 *               type:
 *                 type: string
 *                 enum: [direct, group]
 *                 example: direct
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Conversation created successfully
 *                 conversationId:
 *                   type: number
 *                   example: 12
 *
 *       200:
 *         description: Conversation already exists (for direct chat)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Conversation already exists
 *                 conversationId:
 *                   type: number
 *                   example: 12
 *
 *       400:
 *         description: Bad request (validation error or self chat)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Cannot create conversation with yourself
 *
 *       404:
 *         description: Receiver not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Receiver user not found
 *
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *
 *       500:
 *         description: Internal server error
 */
conversationRouter.post("/", conversationController.createConversation);


/**
 * @swagger
 * /api/conversation:
 *   get:
 *     summary: Get all conversations
 *     tags: [Conversation]
 *     security:
 *       - bearerAuth: []       
 *     responses:
 *       200:
 *         description: Conversations fetched successfully
 *       400:
 *         description: Bad request
 */
conversationRouter.get("/", conversationController.getConversations);

export default conversationRouter;
