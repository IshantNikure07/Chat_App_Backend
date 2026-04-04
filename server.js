import app from "./src/app.js";
import http from "http";
import { initSocket } from "./src/socket/socket.js";

const PORT = 3000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO on the same server
const io = initSocket(server);

// ✅ Start the server (not app.listen)
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});