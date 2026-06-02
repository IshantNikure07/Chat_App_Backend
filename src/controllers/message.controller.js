import db from "../config/db.js";

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

export default { getMessages };
