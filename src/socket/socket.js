import { Server as SocketIoServer } from "socket.io";
import jwt from "jsonwebtoken";
import MessageService from "../services/message.service.js";

// Track online users mapping userId -> socket.id
export const onlineUsers = new Map();

export function initSocket(server){
    const io = new SocketIoServer(server, {
        cors: {
            origin: "*"
        },
    });
    
    io.use((socket , next)=>{
        const token = socket.handshake.auth.token;
        if(!token){
            return next(new Error("Authentication error"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("decoded",decoded);
            let userData = decoded.user;
            socket.data = userData;
            socket.data.userId = userData.id;
            socket.data.username = userData.username;
            next();
        } catch (error) {
            return next(new Error("Authentication error"));
        }
    })

    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        console.log("a user connected:", userId, socket.data.username);
        
        if (userId) {
            onlineUsers.set(userId, socket.id);
            // Optional: emit to all users that someone came online
            // io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        }

        // --- NEW: Handle Sending Messages ---
        socket.on("sendMessage", async (data, callback) => {
            try {
                // Determine whether it's direct or group based on data.isGroup
                const savedMessage = await MessageService.processMessage({
                    senderId: userId,
                    receiverId: data.receiverId,
                    conversationId: data.conversationId,
                    content: data.content,
                    isGroup: data.isGroup || false
                });

                // Fetch participants so we can emit to everyone active in tracking
                const participants = await MessageService.getConversationParticipants(savedMessage.conversation_id);

                // Real-time broadcast to all involved users currently online
                participants.forEach(participantId => {
                    const participantSocketId = onlineUsers.get(participantId);
                    if (participantSocketId) {
                        io.to(participantSocketId).emit("newMessage", savedMessage);
                    }
                });

                // Acknowledge success to front-end emitter
                if (typeof callback === 'function') {
                    callback({ status: "ok", message: savedMessage });
                }
            } catch (error) {
                console.error("[Socket] Error in sendMessage:", error.message);
                if (typeof callback === 'function') {
                    callback({ status: "error", error: error.message });
                } else {
                    socket.emit("messageError", { error: error.message });
                }
            }
        });

        socket.on("typing", (data) => {
            const receiverSocketId = onlineUsers.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", data);
            }
        });

        socket.on("stopTyping", (data) => {
            const receiverSocketId = onlineUsers.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("stopTyping", data);
            }
        });
        
        socket.on("disconnect", () => {
            console.log("user disconnected:", userId);
            if (userId) {
                onlineUsers.delete(userId);
                // Optional: emit to all users that someone went offline
                // io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            }
        });
    });

    return io;
}
