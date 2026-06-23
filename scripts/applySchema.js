import { readFile } from "node:fs/promises";
import pool from "../src/config/db.js";

const schemaUrl = new URL("../database/schema.sql", import.meta.url);

const applySchema = async () => {
  const sql = await readFile(schemaUrl, "utf8");
  const statements = sql
    .split(";")
    .map((statement) =>
      statement
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter(Boolean);

  try {
    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log("Esquema de Scynara aplicado correctamente.");
  } finally {
    await pool.end();
  }
};

applySchema().catch((error) => {
  console.error("No se pudo aplicar el esquema:", error.message);
  process.exitCode = 1;
});
