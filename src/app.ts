import "reflect-metadata";
import { AppDataSource } from "./data-source";
import express from "express";
import authRoutes from "../routes/auth";
import loginRoutes from "../routes/auth";

const app = express();

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Подключено к базе данных PostgreSQL");
  })
  .catch((error) => console.error("❌ Ошибка подключения", error));

  app.use(express.json());
  app.use("/auth", authRoutes);
  app.use("/login", loginRoutes);

  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });