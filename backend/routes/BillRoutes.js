// const express =require( "express");
// const Bill =require("../models/Bill.js");

// const router = express.Router();

// // CREATE BILL
// router.post("/", async (req, res) => {
//   try {
//     const bill = await Bill.create(req.body);
//     res.json(bill);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create bill" });
//   }
// });

// // GET ALL BILLS
// router.get("/", async (req, res) => {
//   try {
//     const bills = await Bill.find().sort({ createdAt: -1 });
//     res.json(bills);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch bills" });
//   }
// });

// // GET SINGLE BILL
// router.get("/:id", async (req, res) => {
//   try {
//     const bill = await Bill.findById(req.params.id);
//     res.json(bill);
//   } catch (err) {
//     res.status(500).json({ error: "Bill not found" });
//   }
// });

// // DELETE BILL
// router.delete("/:id", async (req, res) => {
//   try {
//     await Bill.findByIdAndDelete(req.params.id);
//     res.json({ message: "Bill deleted" });
//   } catch (err) {
//     res.status(500).json({ error: "Unable to delete bill" });
//   }
// });

// module.exports=router;











// routes/billRoutes.js
const express = require("express");
const router = express.Router();

const Bill = require("../models/Bill");
const Product = require("../models/Product");

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
