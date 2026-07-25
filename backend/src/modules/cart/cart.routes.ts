import { Router } from "express";

import { asyncHandler } from "../../common/utils/asyncHandler";
import { getCartController } from "./cart.controller";

export const cartRouter = Router();

cartRouter.get("/", asyncHandler(getCartController));
