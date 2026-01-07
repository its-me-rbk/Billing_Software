
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Bill = require("../models/Bill");

/**
 * ADD PRODUCT / ADD BATCH (WITH GST)
 */
/**
 * CREATE PRODUCT (product-level only, no batch)
 */
router.post("/", async (req, res) => {
  try {
    const { name, category, manufacturer } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });

    let existing = await Product.findOne({ name });
    if (existing) return res.status(409).json({ success: false, message: 'Product already exists' });

    const product = await Product.create({ name, category, manufacturer, batches: [] });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const {
      name,
      batchNumber,
      expiryDate,
      price,
      gst,
      quantity,
      barcode,
    } = req.body;

    let product = await Product.findOne({ name });

    if (!product) {
      product = await Product.create({
        name,
        batches: [
          {
            batchNumber,
            expiryDate,
            price,
            gst,
            quantity,
            barcode,
          },
        ],
      });
    } else {
      const batch = product.batches.find(
        (b) => b.batchNumber === batchNumber
      );

      if (batch) {
        batch.quantity += quantity;

        // Optional: update price & GST if needed
        batch.price = price;
        batch.gst = gst;
      } else {
        product.batches.push({
          batchNumber,
          expiryDate,
          price,
          gst,
          quantity,
          barcode,
        });
      }

      await product.save();
    }

    res.json({ success: true, message: "Product added/updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET ALL PRODUCTS
 */
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/**
 * GET BATCHES BY PRODUCT NAME
 */
router.get("/batches/:name", async (req, res) => {
  const product = await Product.findOne({ name: req.params.name });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product.batches);
});

/**
 * EXPIRING PRODUCTS (NEXT 30 DAYS)
 */
router.get("/expiring", async (req, res) => {
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + 30);

  const products = await Product.find();
  const expiring = [];

  products.forEach((p) => {
    p.batches.forEach((b) => {
      if (b.expiryDate && b.expiryDate > now && b.expiryDate <= limit) {
        expiring.push({
          productName: p.name,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          quantity: b.quantity,
        });
      }
    });
  });

  res.json(expiring);
});

/**
 * TOP PERFORMING PRODUCTS
 */
router.get("/top-performing", async (req, res) => {
  const data = await Bill.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        soldQty: { $sum: "$items.qty" },
        revenue: {
          $sum: { $multiply: ["$items.qty", "$items.price"] },
        },
      },
    },
    { $sort: { soldQty: -1 } },
    { $limit: 5 },
  ]);

  res.json(data);
});

/**
 * UPDATE PRODUCT (rename or update top-level fields)
 */
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * UPDATE BATCH for a product by batchNumber
 */
router.put("/:id/batches/:batchNumber", async (req, res) => {
  try {
    const { id, batchNumber } = req.params;
    const updates = req.body; // expected: price, gst, quantity, expiryDate, batchNumber (optional to rename)

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const batch = product.batches.find(b => b.batchNumber === batchNumber);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    // Apply updates
    Object.keys(updates).forEach(key => {
      batch[key] = updates[key];
    });

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE product
 */
router.delete("/:id", async (req, res) => {
  try {
    const prod = await Product.findByIdAndDelete(req.params.id);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE a specific batch from a product
 */
router.delete("/:id/batches/:batchNumber", async (req, res) => {
  try {
    const { id, batchNumber } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const initialLen = product.batches.length;
    product.batches = product.batches.filter(b => b.batchNumber !== batchNumber);
    if (product.batches.length === initialLen) return res.status(404).json({ success: false, message: 'Batch not found' });

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ARCHIVE a specific batch: move from `batches` -> `archivedBatches`
 */
router.put("/:id/batches/:batchNumber/archive", async (req, res) => {
  try {
    const { id, batchNumber } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const idx = product.batches.findIndex(b => b.batchNumber === batchNumber);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Batch not found' });

    const [batch] = product.batches.splice(idx, 1);
    product.archivedBatches = product.archivedBatches || [];
    product.archivedBatches.push(batch);

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * UNARCHIVE a specific batch: move from `archivedBatches` -> `batches`
 */
router.put("/:id/batches/:batchNumber/unarchive", async (req, res) => {
  try {
    const { id, batchNumber } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const idx = (product.archivedBatches || []).findIndex(b => b.batchNumber === batchNumber);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Archived batch not found' });

    const [batch] = product.archivedBatches.splice(idx, 1);
    product.batches = product.batches || [];
    product.batches.push(batch);

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET archived batches for a product
 */
router.get("/:id/archived", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product.archivedBatches || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
