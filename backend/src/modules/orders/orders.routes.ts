import { Router } from "express";

import { asyncHandler } from "../../common/utils/asyncHandler";
import { listOrdersController } from "./orders.controller";

export const ordersRouter = Router();

ordersRouter.get("/", asyncHandler(listOrdersController));
