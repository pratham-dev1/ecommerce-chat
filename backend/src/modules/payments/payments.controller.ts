import type { Request, Response } from "express";

export async function createPaymentIntentController(_req: Request, res: Response) {
  res.status(201).json({ clientSecret: "payment_intent_placeholder" });
}
