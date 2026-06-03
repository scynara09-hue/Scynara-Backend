import * as dotenv from 'dotenv';
dotenv.config();
import { loginUser } from './src/services/auth.service.js';
import pool from './src/config/db.js';

async function testLogin() {
  try {
    const res = await loginUser({ email: 'admin@scynara.com', password: 'aAdmin1234!' });
    console.log("Success:", res);
  } catch (error) {
    console.error("Failed:", error.status, error.message, error.errors);
  } finally {
    pool.end();
  }
}
testLogin();