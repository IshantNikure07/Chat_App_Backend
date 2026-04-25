import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";

const app = express();  

app.use(cors({
    origin: "*",   // or specify your frontend URL e.g., "http://localhost:8081"
    credentials: true,
}));
app.use(express.json());
app.use("/public", express.static("public"));
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Hello World!");
}); 

app.use("/api/auth", authRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/users", userRoutes);

export default app;