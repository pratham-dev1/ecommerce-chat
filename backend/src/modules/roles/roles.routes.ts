import { Router } from "express";

import { authenticate } from "../../common/middleware/authenticate";
import { requireGrant } from "../../common/middleware/requireGrant";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { listRolesController } from "./roles.controller";

export const rolesRouter = Router();

rolesRouter.get(
  "/",
  authenticate,
  requireGrant("READ_USER"),
  asyncHandler(listRolesController),
);
