import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

import { AppError } from "../errors/AppError";

type RequestSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    const parsedBody = schemas.body?.safeParse(req.body);
    const parsedParams = schemas.params?.safeParse(req.params);
    const parsedQuery = schemas.query?.safeParse(req.query);

    const hasError =
      (parsedBody && !parsedBody.success) ||
      (parsedParams && !parsedParams.success) ||
      (parsedQuery && !parsedQuery.success);

    if (hasError) {
      next(new AppError("Invalid request payload", 400, "VALIDATION_ERROR"));
      return;
    }

    next();
  };
}
