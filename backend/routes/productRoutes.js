// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ADD PRODUCT
router.post("/add", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.json({ success: true, message: "Product added", product: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

module.exports = router;
