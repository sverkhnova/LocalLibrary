import "reflect-metadata";
import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Подключено к базе данных PostgreSQL");
  })
  .catch((error) => console.error("❌ Ошибка подключения", error));
