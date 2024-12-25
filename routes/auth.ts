import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../src/middlewares/authenticateToken";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

router.get("/protected", authenticateToken, (req: any, res) => {
  res.status(200).json({ message: `Welcome user with ${req.user.userId} ID` });
  return;
});

router.get("/me", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId; // Достаем userId из токена
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: userId },
      select: ["id", "username", "email"], // Указываем, какие поля вернуть
    });

    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email уже используется" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await userRepository.save(newUser);

    res.status(201).json({ message: "Пользователь успешно создан" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

// Маршрут для логина
router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email } });
  
      if (!existingUser) {
        res.status(404).json({ message: "Пользователь не найден" });
        return;
      }
  
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Неверный пароль" });
        return;
      }
  
      const token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, JWT_SECRET, {
        expiresIn: "1h",
      });
  
      res.status(200).json({ message: "Авторизация успешна", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка на сервере" });
    }
  });
  
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

export default router;
