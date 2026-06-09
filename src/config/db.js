import mysql from "mysql2";
import { config } from "./config.js";

const poolConfig = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
    };

const db = mysql.createPool(poolConfig);


export default db.promise();