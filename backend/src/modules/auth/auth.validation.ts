import { z } from "zod";

import { registerSchema as userRegisterSchema } from "../users/users.validation";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = userRegisterSchema;

export type LoginInput = z.infer<typeof loginSchema>;
