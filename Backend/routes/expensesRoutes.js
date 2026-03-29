const express = require("express");
const router = express.Router();
const { submitExpense, getUserCurrency, getExpensesByEmployee, getExpenseReceipt  } = require("../controllers/expenseController");
const { verifyToken } = require("../middleware/verifyToken");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/submit", upload.single("receipt"), submitExpense);
router.get("/currency", getUserCurrency);
router.get("/employee/:id", verifyToken, getExpensesByEmployee);
router.get("/:id/receipt", verifyToken, getExpenseReceipt);

module.exports = router;