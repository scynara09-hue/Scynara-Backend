import * as dotenv from 'dotenv';
dotenv.config();
import pool from './src/config/db.js';
import { getProfile } from './src/services/auth.service.js';

async function testMe() {
  try {
    const res = await getProfile(14001, null);
    console.log("Success:", res);
  } catch (error) {
    console.error("Failed:", error.status, error.message);
  } finally {
    pool.end();
  }
}
testMe();