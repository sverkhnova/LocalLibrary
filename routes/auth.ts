import express from "express";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entities/User";
import bcrypt from "bcrypt";


const router = express.Router();

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

export default router;
