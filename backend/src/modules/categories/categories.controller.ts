import type { Request, Response } from "express";

export async function listCategoriesController(_req: Request, res: Response) {
  res.status(200).json([]);
}
