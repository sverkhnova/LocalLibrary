import express from "express";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entities/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    console.log("Body запроса:", req.body); // Логирование тела запроса

    if (!token || !newPassword) {
        res.status(400).json({ message: "Токен и новый пароль обязательны" });
        return;
    }

    try {
        console.log("Токен для проверки:", token);

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
        console.log("Расшифрованный email из токена:", decoded.email);

        // Находим пользователя по email
        const user = await AppDataSource.getRepository(User).findOneBy({
            email: decoded.email,
        });

        console.log("Найденный пользователь:", user);

        if (!user || user.resetPasswordToken !== token) {
            res.status(400).json({ message: "Неверный или устаревший токен" });
            return;
        }

        // Хэшируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Очищаем токен сброса
        user.resetPasswordToken = null;
        await AppDataSource.getRepository(User).save(user);

        res.status(200).json({ message: "Пароль успешно обновлён" });
    } catch (error) {
        console.error("Ошибка проверки токена или обновления пароля:", error);
        res.status(400).json({ message: "Ошибка проверки токена" });
    }
});

export default router;
