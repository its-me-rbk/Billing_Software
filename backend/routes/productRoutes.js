// // routes/productRoutes.js
// const express = require("express");
// const router = express.Router();
// const Product = require("../models/Product");

// // ADD PRODUCT
// router.post("/add", async (req, res) => {
//   try {
//     const newProduct = await Product.create(req.body);
//     res.json({ success: true, message: "Product added", product: newProduct });
//   } catch (err) {
//     res.status(400).json({ success: false, error: err.message });
//   }
// });

// // GET ALL PRODUCTS
// router.get("/", async (req, res) => {
//   const products = await Product.find();
//   res.json(products);
// });

// module.exports = router;


















// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ADD PRODUCT / ADD BATCH
router.post("/add", async (req, res) => {
  try {
    const { name, batchNumber, expiryDate, price, quantity, barcode } = req.body;

    let product = await Product.findOne({ name });

    if (!product) {
      // create product with first batch
      product = await Product.create({
        name,
        batches: [{ batchNumber, expiryDate, price, quantity, barcode }]
      });
    } else {
      // check if same batch already exists
      const existingBatch = product.batches.find(
        (b) => b.batchNumber === batchNumber
      );

      if (existingBatch) {
        existingBatch.quantity += quantity; // increase stock
      } else {
        // add new batch
        product.batches.push({
          batchNumber,
          expiryDate,
          price,
          quantity,
          barcode
        });
      }

      await product.save();
    }

    res.json({
      success: true,
      message: "Product / Batch added",
      product
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// GET BATCHES OF A PRODUCT BY NAME
router.get("/batches/:name", async (req, res) => {
  try {
    const product = await Product.findOne({ name: req.params.name });

    if (!product)
      return res.status(404).json({ error: "Product not found" });

    res.json(product.batches);
  } catch {
    res.status(500).json({ error: "Error fetching batches" });
  }
});

module.exports = router;
