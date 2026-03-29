const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Generate random password
const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Send password email
const sendPasswordEmail = async (email, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your New Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50;">Password Reset</h2>
        <p>Your password has been reset successfully.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>New Password:</strong> ${password}</p>
        <p>Please keep your password secure. You can change it after logging in.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>Your Company Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const userQuery = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userQuery.rows[0];
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    await sendPasswordEmail(email, password);

    res.json({ message: "New password sent to your email!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

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