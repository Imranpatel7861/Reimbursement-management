const express = require("express");
const router = express.Router();
const { getCompany } = require("../controllers/companyController");

router.get("/:id", getCompany);

module.exports = router;