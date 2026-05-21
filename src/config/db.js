import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
const pool = mysql.createPool(process.env.MYSQL_PUBLIC_URL);

export default pool;