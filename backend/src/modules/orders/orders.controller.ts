import type { Request, Response } from "express";

export async function listOrdersController(_req: Request, res: Response) {
  res.status(200).json([]);
}
