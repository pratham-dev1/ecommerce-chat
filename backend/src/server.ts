import { createServer } from "node:http";

import { createApp } from "./app";
import { env } from "./config/env";
import { initializeRedis } from "./config/redis";
import { initializeSocketServer } from "./config/socket";
import { initializeDatabase } from "./database/initializeDatabase";
import { registerDailyUserEmailJobs } from "./jobs/dailyUserEmail.job";

const app = createApp();
const httpServer = createServer(app);
initializeSocketServer(httpServer);

async function main() {
  await initializeDatabase();
  await initializeRedis();
  registerDailyUserEmailJobs();

  httpServer.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((error: unknown) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
