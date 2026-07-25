import { Router } from "express";

import { validateRequest } from "../../common/middleware/validateRequest";
import { asyncHandler } from "../../common/utils/asyncHandler";
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post("/login", validateRequest({ body: loginSchema }), asyncHandler(loginController));
authRouter.post("/logout", asyncHandler(logoutController));
authRouter.post("/refresh", asyncHandler(refreshController));
authRouter.post(
  "/signup",
  validateRequest({ body: registerSchema }),
  asyncHandler(registerController),
);
