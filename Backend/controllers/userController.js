const pool = require("../config/db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

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
    subject: "Your Account Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #2c3e50;">Welcome to Our Platform!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
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


exports.createUser = async (req, res) => {
  try {
    const { name, email, role, manager_id } = req.body;
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, manager_id, company_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, manager_id`,
      [name, email, hashedPassword, role, manager_id, req.user.company_id]
    );

    await sendPasswordEmail(email, password);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.sendNewPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, id]
    );

    const user = await pool.query(
      `SELECT email FROM users WHERE id = $1`,
      [id]
    );

    await sendPasswordEmail(user.rows[0].email, password);

    res.json({ message: "New password sent to the user's email!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, manager_id } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name=$1,email=$2,manager_id=$3
       WHERE id=$4
       RETURNING id,name,email`,
      [name, email, manager_id || null, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {

    const { role } = req.query;

    const result = await pool.query(
      `SELECT id,name,email,role,manager_id
       FROM users
       WHERE role=$1 AND company_id=$2
       ORDER BY created_at DESC`,
      [role, req.user.company_id]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, email, manager_id } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name=$1,email=$2,manager_id=$3
       WHERE id=$4
       RETURNING id,name,email`,
      [name, email, manager_id || null, id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM users WHERE id=$1",
      [id]
    );

    res.json({ message: "User deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};