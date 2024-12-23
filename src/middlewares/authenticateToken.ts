import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Формат: "Bearer <token>"

    if (!token) {
        res.status(401).json({ message: "Требуется авторизация" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Декодируем токен
        (req as any).user = decoded; // Сохраняем данные пользователя в запросе
        next();
    } catch (error) {
        res.status(403).json({ message: "Неверный токен" });
    }
};
