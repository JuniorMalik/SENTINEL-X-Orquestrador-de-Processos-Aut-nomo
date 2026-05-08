import "reflect-metadata";
import { DataSource } from "typeorm";
import { Process } from "./entities/Process";
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // Auto-create tables for demo
  logging: false,
  entities: [Process],
  migrations: [],
  subscribers: [],
});
