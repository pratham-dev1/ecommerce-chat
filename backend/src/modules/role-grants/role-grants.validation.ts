import { z } from "zod";

export const roleGrantIdParamsSchema = z.object({
  roleGrantId: z.string().regex(/^\d+$/),
});

export const createRoleGrantSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    roleId: z.number().int().positive(),
  })
  .strict();

export const updateRoleGrantSchema = createRoleGrantSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export type CreateRoleGrantInput = z.infer<typeof createRoleGrantSchema>;
export type UpdateRoleGrantInput = z.infer<typeof updateRoleGrantSchema>;
