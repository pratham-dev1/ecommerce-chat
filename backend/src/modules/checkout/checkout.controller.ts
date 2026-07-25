import type { Request, Response } from "express";

export async function createCheckoutSessionController(_req: Request, res: Response) {
  res.status(201).json({ sessionId: "checkout_session_placeholder" });
}
