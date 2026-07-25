import { Router } from "express";

import { validateRequest } from "../../common/middleware/validateRequest";
import { asyncHandler } from "../../common/utils/asyncHandler";
import {
  createProductController,
  deleteProductController,
  getProductController,
  listProductsController,
  updateProductController,
} from "./products.controller";
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductSchema,
} from "./products.validation";

export const productsRouter = Router();

productsRouter.get(
  "/",
  validateRequest({ query: listProductsQuerySchema }),
  asyncHandler(listProductsController),
);
productsRouter.post(
  "/",
  validateRequest({ body: createProductSchema }),
  asyncHandler(createProductController),
);
productsRouter.get(
  "/:productId",
  validateRequest({ params: productIdParamsSchema }),
  asyncHandler(getProductController),
);
productsRouter.patch(
  "/:productId",
  validateRequest({ body: updateProductSchema, params: productIdParamsSchema }),
  asyncHandler(updateProductController),
);
productsRouter.delete(
  "/:productId",
  validateRequest({ params: productIdParamsSchema }),
  asyncHandler(deleteProductController),
);
