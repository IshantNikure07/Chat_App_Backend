import { Router } from 'express';
import userController from "../controllers/user.controller.js";
import { authenticate } from '../middleware/auth.middleware.js';

const userRouter = Router();

// userRouter.use(authenticate);

userRouter.get("/", userController.getUsers);
userRouter.get("/search/:name", userController.searchFriend);

export default userRouter;