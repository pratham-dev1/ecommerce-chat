import { Router } from "express";

import { asyncHandler } from "../../common/utils/asyncHandler";
import { createPaymentIntentController } from "./payments.controller";

export const paymentsRouter = Router();

paymentsRouter.post("/intents", asyncHandler(createPaymentIntentController));
