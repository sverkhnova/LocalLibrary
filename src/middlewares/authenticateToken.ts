import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Формат: "Bearer <token>"

  if (!token) {
    res.status(401).json({ message: "Требуется авторизация" });
    return; // Завершаем выполнение, чтобы Express не ожидал вызова `next()`
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Неверный токен" });
      return;
    }

    req.user = decoded as JwtPayload; // Сохраняем данные пользователя в запросе
    next(); // Передаем управление следующему middleware
  });
};
