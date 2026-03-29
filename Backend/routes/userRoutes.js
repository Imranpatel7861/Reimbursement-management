const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const { createUser, getUsersByRole, updateUser, deleteUser } = require("../controllers/userController");
const {  sendNewPassword } = require("../controllers/userController");


router.post("/", verifyToken,  createUser);
router.get("/", verifyToken, getUsersByRole);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.post("/:id/send-password", verifyToken, sendNewPassword);

module.exports = router;