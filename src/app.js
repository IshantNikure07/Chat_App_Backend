import express from "express";
import morgan from "morgan";
import db from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/auth", authRoutes);

export default app;