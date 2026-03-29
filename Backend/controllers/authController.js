const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userQuery.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: user.company_id
      },
      "hackathon_secret",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.signupAdmin = async (req, res) => {
  try {

    const {
      company_name,
      country,
      currency,
      name,
      email,
      password
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const companyResult = await pool.query(
      `INSERT INTO companies (name, country, currency)
       VALUES ($1,$2,$3)
       RETURNING id`,
      [company_name, country, currency]
    );

    const companyId = companyResult.rows[0].id;

    const userResult = await pool.query(
      `INSERT INTO users (name,email,password,role,company_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id,name,email,role`,
      [name, email, hashedPassword, "ADMIN", companyId]
    );

    const user = userResult.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: companyId
      },
      "hackathon_secret",
      { expiresIn: "8h" }
    );

    res.status(201).json({
      message: "Admin account created",
      token,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
};