import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const authRouter = Router()

authRouter.post("/register", authController.register);
authRouter.get("/getMe", authController.getMe);
authRouter.post("/login", authController.login);
authRouter.post("/refreshToken", authController.refreshToken);

export default authRouter;
