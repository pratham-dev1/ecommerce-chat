import { Router } from "express";

import { asyncHandler } from "../../common/utils/asyncHandler";
import { createCheckoutSessionController } from "./checkout.controller";

export const checkoutRouter = Router();

checkoutRouter.post("/sessions", asyncHandler(createCheckoutSessionController));
