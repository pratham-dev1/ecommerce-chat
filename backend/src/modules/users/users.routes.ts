import { Router } from "express";

import { authenticate } from "../../common/middleware/authenticate";
import { requireGrant } from "../../common/middleware/requireGrant";
import { validateRequest } from "../../common/middleware/validateRequest";
import { asyncHandler } from "../../common/utils/asyncHandler";
import {
  createUserController,
  deleteUserController,
  getCurrentUserController,
  getUserController,
  listUsersController,
  updateUserController,
} from "./users.controller";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamsSchema,
} from "./users.validation";

export const usersRouter = Router();

usersRouter.get(
  "/",
  authenticate,
  requireGrant("READ_USER"),
  validateRequest({ query: listUsersQuerySchema }),
  asyncHandler(listUsersController),
);
usersRouter.post(
  "/",
  authenticate,
  requireGrant("CREATE_USER"),
  validateRequest({ body: createUserSchema }),
  asyncHandler(createUserController),
);
usersRouter.get("/me", authenticate, asyncHandler(getCurrentUserController));
usersRouter.get(
  "/:userId",
  authenticate,
  requireGrant("READ_USER"),
  validateRequest({ params: userIdParamsSchema }),
  asyncHandler(getUserController),
);
usersRouter.patch(
  "/:userId",
  authenticate,
  requireGrant("EDIT_USER"),
  validateRequest({ body: updateUserSchema, params: userIdParamsSchema }),
  asyncHandler(updateUserController),
);
usersRouter.delete(
  "/:userId",
  authenticate,
  requireGrant("EDIT_USER"),
  validateRequest({ params: userIdParamsSchema }),
  asyncHandler(deleteUserController),
);
