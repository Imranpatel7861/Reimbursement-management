const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const {
  getPendingApprovals,
  getApprovalHistory,
  handleApproval
} = require("../controllers/approvalController");

router.get("/pending", verifyToken, getPendingApprovals);
router.get("/history", verifyToken, getApprovalHistory);
router.post("/action", verifyToken, handleApproval);

module.exports = router;