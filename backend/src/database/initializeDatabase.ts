import { sequelize } from "../config/database";
import "./models";

export async function initializeDatabase() {
  await sequelize.authenticate();
  console.log("Database connected");

  await sequelize.sync({ alter: true });
}
