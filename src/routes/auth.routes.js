import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const authRouter = Router()

authRouter.post("/register", upload.single("avatar"), authController.register);
authRouter.get("/getMe", authController.getMe);
authRouter.post("/login", authController.login);
authRouter.post("/refreshToken", authController.refreshToken);

export default authRouter;
