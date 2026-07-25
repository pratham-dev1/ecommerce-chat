import { Sequelize } from "sequelize";

import { env } from "./env";

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: "postgres",
  logging: false,
  timezone: "UTC",
});

export const databaseConfig = {
  url: env.databaseUrl,
};
