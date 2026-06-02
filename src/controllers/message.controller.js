import db from "../config/db.js";
import MessageService from "../services/message.service.js";

async function getMessages(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify the user is part of the conversation
        const [participantCheck] = await db.query(
            "SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?",
            [conversationId, userId]
        );

        if (participantCheck.length === 0) {
            return res.status(403).json({ success: false, message: "You are not a participant of this conversation" });
        }

        const [messages] = await db.query(
            `SELECT m.id, m.content, m.sender_id, m.created_at
             FROM messages m
             WHERE m.conversation_id = ?
             ORDER BY m.created_at ASC`,
            [conversationId]
        );

        const formattedMessages = messages.map(msg => {
            const date = new Date(msg.created_at);
            const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            
            return {
                id: msg.id.toString(),
                text: msg.content,
                sender: msg.sender_id === userId ? 'me' : 'other',
                time: timeStr
            };
        });

        return res.status(200).json({
            success: true,
            messages: formattedMessages
        });

    } catch (error) {
        console.error("Get Messages Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security: []
 *     parameters:
 *       - in: header
 *         name: x-internal-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal API key for validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender_id
 *               - receiver_id
 *               - message
 *             properties:
 *               sender_id:
 *                 type: string
 *                 description: The sender's user ID
 *               receiver_id:
 *                 type: string
 *                 description: The receiver's user ID
 *               message:
 *                 type: string
 *                 description: The message text content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden (Invalid API Key)
 *       500:
 *         description: Internal server error
 */
async function sendMessage(req, res) {
    try {
        const apiKey = req.headers['x-internal-api-key'] || req.headers['internal-api-key'];
        if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
            return res.status(403).json({ success: false, message: "Forbidden: Invalid Internal API Key" });
        }

        const { sender_id, receiver_id, message } = req.body;

        if (!sender_id || !receiver_id || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: sender_id, receiver_id, message" 
            });
        }

        const savedMessage = await MessageService.processMessage({
            senderId: Number(sender_id),
            receiverId: Number(receiver_id),
            content: message,
            isGroup: false
        });

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: savedMessage
        });
    } catch (error) {
        console.error("Send Message Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default { getMessages, sendMessage };
