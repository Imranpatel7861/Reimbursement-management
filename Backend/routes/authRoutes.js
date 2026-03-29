const express = require("express");
const router = express.Router();
const { loginUser , signupAdmin, forgotPassword } = require("../controllers/authController");
const { getUserProfile } = require("../controllers/authController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/login", loginUser);
router.post("/signup", signupAdmin);
router.post("/forgot-password", forgotPassword);
router.get("/profile", verifyToken, getUserProfile);

module.exports = router;