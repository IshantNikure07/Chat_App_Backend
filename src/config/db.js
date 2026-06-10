import mysql from "mysql2";
import { config } from "./config.js";

let poolConfig;

if (process.env.DATABASE_URL) {
  console.log("Connecting to MySQL using DATABASE_URL");
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    poolConfig = {
      host: dbUrl.hostname,
      port: dbUrl.port ? parseInt(dbUrl.port, 10) : 3306,
      user: dbUrl.username,
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.substring(1),
      ssl: {
        rejectUnauthorized: false,
      },
      waitForConnections: true,
      connectionLimit: 10,
    };
  } catch (error) {
    poolConfig = process.env.DATABASE_URL;
  }
} else {
  console.log("Connecting to MySQL using config.db");
  poolConfig = {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: 10,
  };
}

const db = mysql.createPool(poolConfig);



export default db.promise();