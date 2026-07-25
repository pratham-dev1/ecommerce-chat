import { Router } from "express";

import { asyncHandler } from "../../common/utils/asyncHandler";
import { listCategoriesController } from "./categories.controller";

export const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(listCategoriesController));
