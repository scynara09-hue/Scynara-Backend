import * as dotenv from 'dotenv';
dotenv.config();
import pool from './src/config/db.js';

async function check() {
  try {
    const [rows] = await pool.query('SELECT id_usuario, nombre, correo, rol, estado, id_tienda FROM Usuarios');
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();