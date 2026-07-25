import { Router } from "express";

import { authenticate } from "../../common/middleware/authenticate";
import { requireGrant } from "../../common/middleware/requireGrant";
import { validateRequest } from "../../common/middleware/validateRequest";
import { asyncHandler } from "../../common/utils/asyncHandler";
import {
  createRoleGrantController,
  deleteRoleGrantController,
  getRoleGrantController,
  listRoleGrantsController,
  updateRoleGrantController,
} from "./role-grants.controller";
import {
  createRoleGrantSchema,
  roleGrantIdParamsSchema,
  updateRoleGrantSchema,
} from "./role-grants.validation";

export const roleGrantsRouter = Router();

roleGrantsRouter.get(
  "/",
  authenticate,
  requireGrant("READ_USER"),
  asyncHandler(listRoleGrantsController),
);
roleGrantsRouter.post(
  "/",
  authenticate,
  requireGrant("EDIT_USER"),
  validateRequest({ body: createRoleGrantSchema }),
  asyncHandler(createRoleGrantController),
);
roleGrantsRouter.get(
  "/:roleGrantId",
  authenticate,
  requireGrant("READ_USER"),
  validateRequest({ params: roleGrantIdParamsSchema }),
  asyncHandler(getRoleGrantController),
);
roleGrantsRouter.patch(
  "/:roleGrantId",
  authenticate,
  requireGrant("EDIT_USER"),
  validateRequest({
    body: updateRoleGrantSchema,
    params: roleGrantIdParamsSchema,
  }),
  asyncHandler(updateRoleGrantController),
);
roleGrantsRouter.delete(
  "/:roleGrantId",
  authenticate,
  requireGrant("EDIT_USER"),
  validateRequest({ params: roleGrantIdParamsSchema }),
  asyncHandler(deleteRoleGrantController),
);
