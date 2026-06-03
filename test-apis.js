import * as dotenv from 'dotenv';
dotenv.config();
import { loginUser } from './src/services/auth.service.js';
import pool from './src/config/db.js';

async function testAll() {
  try {
    const res = await loginUser({ email: 'admin@scynara.com', password: 'aAdmin1234!' });
    const token = res.token;
    
    // Simulate HTTP requests internally or via fetch if server is running
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const profileRes = await fetch('http://localhost:3030/auth/me', { headers });
    console.log('GET /auth/me:', profileRes.status);
    
    const ventasRes = await fetch('http://localhost:3030/ventas', { headers });
    console.log('GET /ventas:', ventasRes.status);

    const productsRes = await fetch('http://localhost:3030/products', { headers });
    console.log('GET /products:', productsRes.status);

    const customersRes = await fetch('http://localhost:3030/clientes', { headers });
    console.log('GET /clientes:', customersRes.status);

  } catch (error) {
    console.error("Failed:", error);
  } finally {
    pool.end();
  }
}
testAll();