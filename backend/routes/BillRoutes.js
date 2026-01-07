
const express = require("express");
const router = express.Router();

const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Customer = require("../models/customer");

// CREATE BILL + DEDUCT STOCK
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;

    for (let item of items) {
      const product = await Product.findOne({ name: item.name });
      if (!product) continue;

      const batch = product.batches.find(
        (b) => b.batchNumber === item.batchNumber
      );

      if (!batch) {
        return res.status(400).json({
          error: `Batch ${item.batchNumber} not found for ${item.name}`
        });
      }

      if (batch.quantity < item.qty) {
        return res.status(400).json({
          error: `Not enough stock in batch ${batch.batchNumber}`
        });
      }

      // Deduct stock
      batch.quantity -= item.qty;

      await product.save();
    }

    // Now save bill
    const bill = await Bill.create(req.body);

    // If bill has an associated customerId, increment their totalPurchase
    try {
      const customerId = req.body.customerId || req.body.customer_id || null;
      if (customerId) {
        const amount = Number(bill.total) || 0;
        if (amount > 0) {
          await Customer.findByIdAndUpdate(customerId, { $inc: { totalPurchase: amount } });
        }
      }
    } catch (err) {
      console.error('Failed to update customer totalPurchase:', err);
    }

    res.json({ success: true, bill });

  } catch (err) {
    res.status(500).json({ error: "Failed to create bill" });
  }
});

// GET ALL BILLS
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

// GET SINGLE BILL
router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    res.json(bill);
  } catch {
    res.status(500).json({ error: "Bill not found" });
  }
});

// DELETE BILL
router.delete("/:id", async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted" });
  } catch {
    res.status(500).json({ error: "Unable to delete bill" });
  }
});

module.exports = router;
