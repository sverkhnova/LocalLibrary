import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // Уникальный ID пользователя

  @Column()
  username!: string; // Имя пользователя

  @Column()
  email!: string; // Email пользователя

  @Column()
  password!: string; // Хешированный пароль

  @Column({ default: 'user' })
  role!: string; // Роль пользователя (user или admin)
}
