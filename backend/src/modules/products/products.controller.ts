import type { Request, Response } from "express";

import { ProductsService } from "./products.service";
import { listProductsQuerySchema } from "./products.validation";

const productsService = new ProductsService();

export async function createProductController(req: Request, res: Response) {
  const product = await productsService.createProduct(req.body);
  res.status(201).json(product);
}

export async function listProductsController(req: Request, res: Response) {
  const query = listProductsQuerySchema.parse(req.query);
  const products = await productsService.listProducts(query);
  res.status(200).json(products);
}

export async function getProductController(req: Request, res: Response) {
  const product = await productsService.getProductById(Number(req.params.productId));

  res.status(200).json(product);
}

export async function updateProductController(req: Request, res: Response) {
  const product = await productsService.updateProduct(Number(req.params.productId), req.body);
  res.status(200).json(product);
}

export async function deleteProductController(req: Request, res: Response) {
  await productsService.deleteProduct(Number(req.params.productId));
  res.status(204).send();
}
