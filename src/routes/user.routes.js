import { Router } from 'express';
import userController from "../controllers/user.controller.js";
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from "../middleware/upload.middleware.js";

const userRouter = Router();

// userRouter.use(authenticate);

userRouter.get("/", userController.getUsers);
userRouter.get("/search/:name", userController.searchFriend);
userRouter.post("/:userId/upload-avatar", authenticate, upload.single("avatar"), userController.uploadAvatar);

export default userRouter;