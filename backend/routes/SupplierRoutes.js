const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");

/**
 * @route   POST /api/suppliers
 * @desc    Add new supplier
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      productsSupplied,
      initialDue,
    } = req.body;

    // Basic validation
    if (!name || !phone) {
      return res.status(400).json({
        message: "Supplier name and contact number are required",
      });
    }

    const supplier = new Supplier({
      name,
      phone,
      email,
      address,
      productsSupplied,
      initialDue,
    });

    const savedSupplier = await supplier.save();

    res.status(201).json({
      message: "Supplier added successfully",
      supplier: savedSupplier,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add supplier",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers
 */
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Delete supplier
 */
router.delete("/:id", async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
