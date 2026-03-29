const pool = require("../config/db");

exports.getCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const companyQuery = await pool.query(
      "SELECT id, name, currency, country FROM companies WHERE id = $1",
      [id]
    );
    if (companyQuery.rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(companyQuery.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};