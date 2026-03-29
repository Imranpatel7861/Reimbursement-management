/**
 * Converts various date formats to ISO format (YYYY-MM-DD)
 * Supports: DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD.MM.YYYY
 * @param {string} dateStr - Raw date string
 * @returns {string} - Formatted date in YYYY-MM-DD
 */
function normalizeDate(dateStr) {
  if (!dateStr) return "";
  
  // Remove common date separators and normalize
  let parts = dateStr.split(/[-/.]/);
  if (parts.length !== 3) return dateStr; // Fallback if can't parse
  
  let [p1, p2, p3] = parts.map(p => p.trim());
  let year, month, day;
  
  // Determine format based on which part is 4 digits
  if (p1.length === 4) {
    // YYYY-MM-DD or YYYY-DD-MM
    year = p1;
    month = p2;
    day = p3;
  } else if (p3.length === 4) {
    // DD-MM-YYYY or MM-DD-YYYY
    // Assume DD-MM-YYYY (common in India)
    day = p1;
    month = p2;
    year = p3;
  } else {
    return dateStr; // Can't determine format
  }
  
  // Pad month and day with zeros
  month = String(month).padStart(2, '0');
  day = String(day).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Extracts key fields from raw OCR text.
 * @param {string} text - The raw text from the OCR API
 */
function parseReceipt(text) {
  if (!text) return { amount: "", date: "", merchant: "", rawText: "" };

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // Best guess merchant: first non-empty line (usually store/vendor name)
  const merchant = lines.length > 0 ? lines[0] : "";

  // Find Total Amount
  // Strategy: Look for lines with "TOTAL", "AMOUNT", "DUE", "BALANCE" followed by a number
  let amount = "";
  const totalRegex = /(?:total|amount|due|balance).*?(\$|₹|INR|Rs\.?|USD)?\s*?(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/i;
  
  // Search from end to beginning (total is usually at the end)
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(totalRegex);
    if (match && match[2]) {
      amount = match[2].replace(/,/g, ''); // strip commas
      break;
    }
  }

  // Fallback: if no explicit total label, find the largest currency-like number
  if (!amount) {
    const allAmounts = [];
    const amountRegex = /(?:^|\s)(?:\$|₹|USD|Rs\.?)\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/ig;
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      allAmounts.push(parseFloat(match[1].replace(/,/g, '')));
    }
    if (allAmounts.length > 0) {
      amount = Math.max(...allAmounts).toString();
    }
  }

  // Find Date
  // Formats: DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD.MM.YYYY
  let date = "";
  const dateRegex = /\b(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})\b/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      date = normalizeDate(match[1]);
      break; // usually the first date is the transaction date
    }
  }

  return {
    amount: amount || "",
    date: date || "",
    merchant: merchant || "",
    rawText: text
  };
}

module.exports = { parseReceipt };
