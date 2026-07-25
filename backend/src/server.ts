import { createApp } from "./app";
import { env } from "./config/env";
import { initializeRedis } from "./config/redis";
import { initializeDatabase } from "./database/initializeDatabase";

const app = createApp();

async function main() {
  await initializeDatabase();
  await initializeRedis();

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

main().catch((error: unknown) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
