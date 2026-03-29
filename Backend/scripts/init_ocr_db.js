/**
 * Initialize OCR database table
 * Run once: node scripts/init_ocr_db.js
 */

const pool = require("../config/db");

async function initializeOCRTable() {
  try {
    console.log("🔄 Initializing OCR_RECEIPTS table...");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ocr_receipts (
        id SERIAL PRIMARY KEY,
        amount NUMERIC(12, 2),
        date TEXT,
        merchant TEXT,
        raw_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log("✅ OCR_RECEIPTS table created successfully (or already exists)");

    // Create index on date for faster queries
    const indexQuery = `
      CREATE INDEX IF NOT EXISTS idx_ocr_receipts_created_at 
      ON ocr_receipts(created_at DESC);
    `;
    
    await pool.query(indexQuery);
    console.log("✅ Index created successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing table:", err.message);
    process.exit(1);
  }
}

initializeOCRTable();
