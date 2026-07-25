import type { CorsOptions } from "cors";

import { env } from "./env";

export const corsOptions: CorsOptions = {
  credentials: true,
  origin: env.clientUrl,
};
