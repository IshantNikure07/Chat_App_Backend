import express from "express";
import morgan from "morgan";
import db from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "*",   // or specify your frontend URL e.g., "http://localhost:8081"
    credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/auth", authRoutes);

export default app;