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

  router.put("/update-profile", authenticateToken, async (req: any, res) => {
    try {
      const { username, email } = req.body;
      const userRepository = AppDataSource.getRepository(User);
  
      // Найти текущего пользователя по ID из токена
      const user = await userRepository.findOne({ where: { id: req.user.userId } });
      if (!user) {
        res.status(404).json({ message: "Пользователь не найден" });
        return;
      }
  
      // Проверить, используется ли уже email
      if (email && email !== user.email) {
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
          res.status(400).json({ message: "Email уже используется" });
          return;
        }
      }
  
      // Обновить данные пользователя
      user.username = username || user.username;
      user.email = email || user.email;
  
      await userRepository.save(user);
  
      res.status(200).json({ message: "Профиль успешно обновлён", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка на сервере" });
    }
  });  

  router.put("/update-password", authenticateToken, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
  
      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: "Пожалуйста, предоставьте текущий и новый пароль" });
        return;
      }
  
      const userRepository = AppDataSource.getRepository(User);
  
      // Найти пользователя по ID из токена
      const user = await userRepository.findOne({ where: { id: req.user.userId } });
      if (!user) {
        res.status(404).json({ message: "Пользователь не найден" });
        return;
      }
  
      // Проверить текущий пароль
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Неверный текущий пароль" });
        return;
      }
  
      // Хешировать новый пароль
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Обновить пароль пользователя
      user.password = hashedNewPassword;
      await userRepository.save(user);
  
      res.status(200).json({ message: "Пароль успешно обновлён" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка на сервере" });
    }
  });  

  router.put("/update-profile", authenticateToken, async (req: any, res) => {
    try {
      const { username, email } = req.body;
  
      if (!username && !email) {
        res.status(400).json({ message: "Необходимо указать данные для обновления" });
        return;
      }
  
      const userRepository = AppDataSource.getRepository(User);
  
      // Найти текущего пользователя
      const user = await userRepository.findOne({ where: { id: req.user.userId } });
      if (!user) {
        res.status(404).json({ message: "Пользователь не найден" });
        return;
      }
  
      // Проверка уникальности email, если пользователь хочет обновить его
      if (email && email !== user.email) {
        const emailExists = await userRepository.findOne({ where: { email } });
        if (emailExists) {
          res.status(400).json({ message: "Email уже используется" });
          return;
        }
        user.email = email; // Обновляем email
      }
  
      // Обновляем username
      if (username) {
        user.username = username;
      }
  
      await userRepository.save(user); // Сохраняем изменения
  
      res.status(200).json({
        message: "Профиль успешно обновлён",
        user: { username: user.username, email: user.email },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка на сервере" });
    }
  });
  

  router.delete("/delete-account", authenticateToken, async (req: any, res) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
  
      // Найти пользователя по ID из токена
      const user = await userRepository.findOne({ where: { id: req.user.userId } });
      if (!user) {
        res.status(404).json({ message: "Пользователь не найден" });
        return;
      }
  
      // Удалить пользователя
      await userRepository.remove(user);
  
      res.status(200).json({ message: "Аккаунт успешно удалён" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка на сервере" });
    }
  });
  
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

export default router;
