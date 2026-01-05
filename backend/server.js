
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

/* ================= Middleware ================= */
app.use(cors());
app.use(express.json());

/* ================= Database ================= */
connectDB();

/* ================= Routes ================= */
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/customers", require("./routes/Customer"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));

/* 👉 General Settings Route */
app.use(
  "/api/general-settings",
  require("./routes/generalSettings_routes")
);

/* ================= Root ================= */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* ================= Server ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
