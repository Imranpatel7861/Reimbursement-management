const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

const ocrRoutes = require("./routes/ocrRoutes.js");
const companyRoutes = require("./routes/companyRoutes.js");
const expenseRoutes = require("./routes/expensesRoutes.js");
const approvalRoutes = require("./routes/approvalRoutes.js");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://lvw98rvl-5173.inc1.devtunnels.ms"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/approvals", approvalRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});