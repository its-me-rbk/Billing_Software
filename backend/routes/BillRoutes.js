
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
          const loyaltyAdd = Math.floor(amount / 1000);
          await Customer.findByIdAndUpdate(customerId, { $inc: { totalPurchase: amount, loyaltyPoints: loyaltyAdd } });
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
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    // Restore stock for each item
    for (let item of bill.items || []) {
      try {
        // Prefer product id stored in item._id
        let product = null;
        if (item._id) {
          product = await Product.findById(item._id).exec();
        }
        if (!product) {
          product = await Product.findOne({ name: item.name }).exec();
        }

        if (!product) {
          console.warn(`Product not found for bill item: ${item.name} (${item._id})`);
          continue;
        }

        const batchNumber = item.batchNumber;
        let batch = null;
        if (batchNumber) batch = product.batches.find(b => b.batchNumber === batchNumber);

        if (batch) {
          batch.quantity = (Number(batch.quantity) || 0) + (Number(item.qty) || 0);
        } else {
          // Try to find in archivedBatches and unarchive if present
          const archivedIdx = (product.archivedBatches || []).findIndex(b => b.batchNumber === batchNumber);
          if (archivedIdx !== -1) {
            const [archivedBatch] = product.archivedBatches.splice(archivedIdx, 1);
            // ensure quantity exists
            archivedBatch.quantity = (Number(archivedBatch.quantity) || 0) + (Number(item.qty) || 0);
            product.batches.push(archivedBatch);
          } else {
            // If batch not found anywhere, create a new batch record to hold restored quantity
            product.batches.push({
              batchNumber: batchNumber || `restored-${Date.now()}`,
              expiryDate: item.expiryDate || null,
              price: item.price || 0,
              gst: item.gst || 0,
              quantity: Number(item.qty) || 0,
              barcode: item.barcode || ''
            });
          }
        }

        await product.save();
      } catch (err) {
        console.error('Failed to restore stock for item', item, err);
      }
    }

    // Reduce customer's totalPurchase if we can identify the customer
    try {
      // Try customerId on bill (if present), else match by phone or email
      let customer = null;
      if (bill.customerId) {
        customer = await Customer.findById(bill.customerId).exec();
      }
      if (!customer && bill.customerPhone) {
        customer = await Customer.findOne({ phone: bill.customerPhone }).exec();
      }
      if (!customer && bill.customerEmail) {
        customer = await Customer.findOne({ email: bill.customerEmail }).exec();
      }

      if (customer) {
        const amount = Number(bill.total) || 0;
        if (amount > 0) {
            // decrement totalPurchase and reduce loyalty points accordingly
            const loyaltyRemove = Math.floor(amount / 1000);
            // load customer and update safely to avoid negative loyalty
            try {
              const cust = await Customer.findById(customer._id).exec();
              if (cust) {
                cust.totalPurchase = Math.max(0, (Number(cust.totalPurchase) || 0) - amount);
                cust.loyaltyPoints = Math.max(0, (Number(cust.loyaltyPoints) || 0) - loyaltyRemove);
                await cust.save();
              }
            } catch (err) {
              console.error('Failed to decrement customer totals on bill delete:', err);
            }
        }
      }
    } catch (err) {
      console.error('Failed to update customer totalPurchase on bill delete:', err);
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bill deleted and stock/customer reverted where possible' });
  } catch {
    res.status(500).json({ error: "Unable to delete bill" });
  }
});

module.exports = router;
