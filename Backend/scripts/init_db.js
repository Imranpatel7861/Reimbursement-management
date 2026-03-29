const pool = require("../config/db");

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ocr_receipts (
    id SERIAL PRIMARY KEY,
    amount NUMERIC,
    date TEXT,
    merchant TEXT,
    raw_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

(async () => {
  try {
    console.log("Ensuring ocr_receipts table exists...");
    await pool.query(createTableQuery);
    console.log("Table ocr_receipts created or already exists.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    pool.end();
  }
})();
