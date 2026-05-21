 import app from './app.js';
import pool from './config/db.js';

const startServer = async () => {
  try {
    const [rows] = await pool.query("SELECT 1"); 

    console.log("Conectado a MySQL correctamente");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
    });

  } catch (error) {
    console.error("Error conectando a MySQL:", error);
    process.exit(1);
  }
};

startServer();