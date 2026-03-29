const pool = require("../config/db");
const multer = require("multer");
const sharp = require("sharp");

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Submit expense with receipt
// In your expenseController.js
exports.submitExpense = async (req, res) => {
  try {
    const { employee_id, company_id, amount, currency, category, description, expense_date } = req.body;
    const receiptFile = req.file;

    await pool.query("BEGIN");

    // Insert expense
    const expenseResult = await pool.query(
      `INSERT INTO expenses
       (employee_id, company_id, amount, currency, category, description, expense_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING id`,
      [employee_id, company_id, amount, currency, category, description, expense_date]
    );

    const expenseId = expenseResult.rows[0].id;

    // Store receipt as BLOB
    if (receiptFile) {
      const resizedImage = await sharp(receiptFile.buffer)
        .resize(800)
        .toBuffer();

      await pool.query(
        `UPDATE expenses SET receipt = $1 WHERE id = $2`,
        [resizedImage, expenseId]
      );
    }

    // Find the employee's manager
    const managerResult = await pool.query(
      `SELECT manager_id FROM users WHERE id = $1`,
      [employee_id]
    );

    if (managerResult.rows[0]?.manager_id) {
      // Create initial approval workflow for manager
      await pool.query(
        `INSERT INTO approval_workflow
         (expense_id, approver_id, role, sequence, status)
         VALUES ($1, $2, 'MANAGER', 1, 'PENDING')`,
        [expenseId, managerResult.rows[0].manager_id]
      );
    }

    await pool.query("COMMIT");

    res.status(201).json({ success: true, expenseId });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to submit expense" });
  }
};

// Get user currency based on country
exports.getUserCurrency = async (req, res) => {
  try {
    const { country } = req.query;

    // Map country to currency (simplified)
    const countryToCurrency = {
      "United States": "USD",
      "India": "INR",
      "United Kingdom": "GBP",
      "Japan": "JPY",
      "China": "CNY",
      "Canada": "CAD",
      "Australia": "AUD",
      "Brazil": "BRL",
      "Russia": "RUB",
      "South Korea": "KRW",
      "Mexico": "MXN",
      "Indonesia": "IDR",
      "Saudi Arabia": "SAR",
      "Turkey": "TRY",
      "South Africa": "ZAR",
      "Argentina": "ARS",
      "Switzerland": "CHF",
      "European Union": "EUR",
    };

    const currency = countryToCurrency[country] || "USD";
    res.json({ currency });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch currency" });
  }
};

// expenseController.js
exports.getExpensesByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const expensesQuery = await pool.query(
      `SELECT e.id, e.description, e.expense_date, e.category,
              e.amount, e.currency, e.status, e.paid_by,
              u.name as employee_name,
              (e.receipt IS NOT NULL) as has_receipt
       FROM expenses e
       JOIN users u ON e.employee_id = u.id
       WHERE e.employee_id = $1
       ORDER BY e.expense_date DESC`,
      [employeeId]
    );

    res.json(expensesQuery.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// expenseController.js
exports.getExpenseReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receiptQuery = await pool.query(
      "SELECT receipt FROM expenses WHERE id = $1",
      [id]
    );

    if (receiptQuery.rows.length === 0 || !receiptQuery.rows[0].receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    const receipt = receiptQuery.rows[0].receipt;

    res.set('Content-Type', 'image/jpeg');
    res.send(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch receipt" });
  }
};