import { z } from "zod";

export const productIdParamsSchema = z.object({
  productId: z.string().regex(/^\d+$/),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(100),
  search: z.string().trim().max(255).optional(),
});

export const createProductSchema = z
  .object({
    description: z.string().trim().max(5000).optional(),
    image: z.string().url().max(2048).optional(),
    name: z.string().trim().min(2).max(160),
    price: z.number().nonnegative(),
  })
  .strict();

export const updateProductSchema = createProductSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
