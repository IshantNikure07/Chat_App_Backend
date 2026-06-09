import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

dotenv.config();

let adapterConfig;

if (process.env.DATABASE_URL) {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    adapterConfig = {
      host: dbUrl.hostname,
      port: dbUrl.port ? parseInt(dbUrl.port, 10) : 3306,
      user: dbUrl.username,
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.substring(1),
      connectionLimit: 10,
      allowPublicKeyRetrieval: true,
      ssl: {
        rejectUnauthorized: false
      }
    };
  } catch (error) {
    adapterConfig = {
      host: process.env.DB_HOST || "localhost",
      port: 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "chat_app_backend",
      connectionLimit: 10,
      allowPublicKeyRetrieval: true,
    };
  }
} else {
  adapterConfig = {
    host: process.env.DB_HOST || "localhost",
    port: 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "chat_app_backend",
    connectionLimit: 10,
    allowPublicKeyRetrieval: true,
  };
}

const adapter = new PrismaMariaDb(adapterConfig);

const prisma = new PrismaClient({ adapter });

export default prisma;
