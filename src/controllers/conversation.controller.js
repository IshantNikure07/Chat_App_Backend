import db from "../config/db.js";
import Joi from "joi";

const createConversationSchema = Joi.object({
    receiverId: Joi.number().required(),
    type: Joi.string().valid("direct", "group").default("direct")
});

async function createConversation(req, res) {
    try {
        const { error, value } = createConversationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { receiverId, type } = value;
        const senderId = req.user.id;

        if (senderId === receiverId) {
            return res.status(400).json({ success: false, message: "Cannot create conversation with yourself" });
        }

        // Verify receiver exists
        const [receiverRow] = await db.query("SELECT id FROM users WHERE id = ?", [receiverId]);
        if (receiverRow.length === 0) {
            return res.status(404).json({ success: false, message: "Receiver user not found" });
        }

        if (type === "direct") {
            const [existingChats] = await db.query(
                `SELECT c.id FROM conversations c 
                 JOIN conversation_participants p1 ON c.id = p1.conversation_id 
                 JOIN conversation_participants p2 ON c.id = p2.conversation_id 
                 WHERE c.type = 'direct' AND p1.user_id = ? AND p2.user_id = ?`,
                [senderId, receiverId]
            );

            if (existingChats.length > 0) {
                return res.status(200).json({ 
                    success: true, 
                    message: "Conversation already exists", 
                    conversationId: existingChats[0].id 
                });
            }
        }

        const [newChat] = await db.query("INSERT INTO conversations (type) VALUES (?)", [type]);
        const conversationId = newChat.insertId;

        await db.query(
            "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)",
            [conversationId, senderId, conversationId, receiverId]
        );

        return res.status(201).json({ 
            success: true, 
            message: "Conversation created successfully", 
            conversationId 
        });

    } catch (error) {
        console.error("Create Conversation Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function getConversations(req, res) {
    try {
        const userId = req.user.id;

        const [conversations] = await db.query(
            `SELECT 
                c.id as conversation_id, c.type, c.last_message_id,
                m.content as last_message_content, m.created_at as last_message_time,
                u.id as other_user_id, u.username as other_user_name, u.email as other_user_email
            FROM conversations c
            JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
            LEFT JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
            LEFT JOIN users u ON cp2.user_id = u.id
            LEFT JOIN messages m ON c.last_message_id = m.id
            ORDER BY m.created_at DESC, c.id DESC`,
            [userId, userId]
        );

        const formattedConversations = conversations.reduce((acc, row) => {
            if (!acc[row.conversation_id]) {
                acc[row.conversation_id] = {
                    id: row.conversation_id,
                    type: row.type,
                    lastMessage: row.last_message_id ? {
                        id: row.last_message_id,
                        content: row.last_message_content,
                        createdAt: row.last_message_time
                    } : null,
                    participants: []
                };
            }
            if (row.other_user_id) {
                acc[row.conversation_id].participants.push({
                    id: row.other_user_id,
                    username: row.other_user_name,
                    email: row.other_user_email
                });
            }
            return acc;
        }, {});

        // Sort formatted conversations by last message time or conversation ID
        const sortedConversations = Object.values(formattedConversations).sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            if (timeA !== timeB) return timeB - timeA;
            return b.id - a.id;
        });

        return res.status(200).json({ 
            success: true, 
            conversations: sortedConversations 
        });

    } catch (error) {
        console.error("Get Conversations Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default { createConversation, getConversations };
