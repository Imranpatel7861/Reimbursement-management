const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const pool = require("../config/db");
const { parseReceipt } = require("../utils/parseReceipt");

const OCR_API_URL = "https://api.ocr.space/parse/image";
const OCR_API_KEY = process.env.OCR_API_KEY || "helloworld";

/**
 * POST /api/ocr
 * 
 * Handles receipt image upload, OCR processing, and data extraction.
 * 
 * Request:
 *   - File: multipart/form-data with "receipt" field
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "amount": "123.45",
 *     "date": "2025-10-04",
 *     "merchant": "Restaurant Name",
 *     "rawText": "full OCR text..."
 *   }
 * }
 */
const processReceipt = async (req, res) => {
  // Validate file upload
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: "No receipt image uploaded." 
    });
  }

  const filePath = req.file.path;
  
  try {
    // 1. Call OCR.space API with file stream
    const formData = new FormData();
    formData.append("apikey", OCR_API_KEY);
    formData.append("file", fs.createReadStream(filePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("isOverlayRequired", "false");
    formData.append("OCREngine", "2"); // Engine 2 better for receipts/invoices

    const contentLength = await new Promise((resolve, reject) => {
      formData.getLength((err, length) => 
        err ? reject(err) : resolve(length)
      );
    });

    const ocrResponse = await axios.post(OCR_API_URL, formData, {
      headers: { ...formData.getHeaders(), "Content-Length": contentLength },
      timeout: 15000
    });

    // 2. Extract raw text from OCR response
    const parsedResults = ocrResponse.data.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      throw new Error("OCR API returned no text");
    }

    const rawText = parsedResults[0].ParsedText || "";
    if (!rawText.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Receipt image is blank or unreadable. Please try with a clearer image." 
      });
    }

    // 3. Parse OCR text and extract structured data
    const extractedData = parseReceipt(rawText);

    // 4. Store in PostgreSQL (non-blocking, optional)
    storeOCRData(extractedData).catch(err => {
      console.warn("DB insert warning:", err.message);
    });

    // 5. Return parsed data to frontend
    res.json({
      success: true,
      data: extractedData
    });

  } catch (err) {
    console.error("[OCR Error]", err.message);
    
    // Determine appropriate error message
    let errorMsg = "Failed to process receipt.";
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      errorMsg = "OCR service timeout. Please try again.";
    } else if (err.response?.status === 403) {
      errorMsg = "OCR service authentication failed.";
    }

    return res.status(500).json({ 
      success: false, 
      message: errorMsg 
    });

  } finally {
    // Always cleanup temp file
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.warn("Temp file cleanup failed:", err.message);
      });
    }
  }
};

/**
 * Optional: Store OCR data in PostgreSQL
 * This is non-blocking and won't affect the API response if DB is unavailable
 */
async function storeOCRData(extractedData) {
  try {
    const query = `
      INSERT INTO ocr_receipts (amount, date, merchant, raw_text)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    
    const numericAmount = extractedData.amount 
      ? parseFloat(extractedData.amount.replace(/,/g, ''))
      : null;

    const result = await pool.query(query, [
      numericAmount,
      extractedData.date,
      extractedData.merchant,
      extractedData.rawText
    ]);

    console.log("[DB] OCR receipt stored with ID:", result.rows[0]?.id);
  } catch (err) {
    // Table might not exist or DB connection issue
    console.warn("[DB Warning] Could not store OCR data:", err.message);
  }
}

module.exports = { processReceipt };
