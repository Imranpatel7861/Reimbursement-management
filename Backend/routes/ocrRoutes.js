const express = require("express");
const multer = require("multer");
const { processReceipt } = require("../controllers/ocrController");

const router = express.Router();
// Create a basic storage location for temporary files
// Ensure "uploads/" directory automatically exists by configuring multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage });

router.post("/", upload.single("receipt"), processReceipt);

module.exports = router;
