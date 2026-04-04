import db from "../config/db.js";

// Save a new message securely into the database
export const processMessage = async (data) => {
    let { senderId, receiverId, conversationId, content, isGroup } = data;

    // 1. If it's a direct message (1-on-1) and we don't have a conversation ID yet
    if (isGroup === false && !conversationId) {
        
        // Check if an old chat already exists between these two users
        const [existingChats] = await db.execute(
            `SELECT c.id FROM conversations c 
             JOIN conversation_participants p1 ON c.id = p1.conversation_id 
             JOIN conversation_participants p2 ON c.id = p2.conversation_id 
             WHERE c.type = 'direct' AND p1.user_id = ? AND p2.user_id = ?`,
            [senderId, receiverId]
        );

        if (existingChats.length > 0) {
            // Yes, an old chat exists! Let's use its ID
            conversationId = existingChats[0].id;
        } else {
            // No chat exists. Let's create a brand new direct chat
            const [newChat] = await db.execute(`INSERT INTO conversations (type) VALUES ('direct')`);
            conversationId = newChat.insertId;

            // Add both users to this newly created chat
            await db.execute(
                `INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)`,
                [conversationId, senderId, conversationId, receiverId]
            );
        }
    }

    // 2. Save the actual text message into the messages table
    const [msgResult] = await db.execute(
        `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
        [conversationId, senderId, content]
    );
    const newMessageId = msgResult.insertId;

    // 3. Update the conversation to remember what the last message was
    await db.execute(
        `UPDATE conversations SET last_message_id = ? WHERE id = ?`,
        [newMessageId, conversationId]
    );

    // Return the message info to the socket so it can be sent to other users
    return {
        id: newMessageId,
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        created_at: new Date()
    };
};

// Find out which users are in a conversation so Socket.io knows who to send it to
export const getConversationParticipants = async (conversationId) => {
    const [users] = await db.execute(
        `SELECT user_id FROM conversation_participants WHERE conversation_id = ?`,
        [conversationId]
    );
    
    // Converts [{user_id: 1}, {user_id: 2}] into a simple array: [1, 2]
    return users.map(user => user.user_id);
};

export default { processMessage, getConversationParticipants };
