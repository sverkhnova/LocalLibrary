import { DataSource } from "typeorm";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "postgres", // Указываем базу данных
  host: "localhost", // Где база находится (локально)
  port: 5432, // Порт PostgreSQL (по умолчанию 5432)
  username: "postgres", // Имя пользователя
  password: "qwer5555", // Пароль (укажи свой пароль)
  database: "local_library", // Название базы, например "local_library"
  synchronize: true, // Автоматически синхронизирует схему БД
  logging: true, // Показывает запросы SQL в консоли
  entities: [User], // Место, где лежат твои сущности (модели)
});

console.log("AppDataSource config loaded!");