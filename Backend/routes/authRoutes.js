const express = require("express");
const router = express.Router();
const { loginUser , signupAdmin, forgotPassword } = require("../controllers/authController");

router.post("/login", loginUser);
router.post("/signup", signupAdmin);
router.post("/forgot-password", forgotPassword);

module.exports = router;