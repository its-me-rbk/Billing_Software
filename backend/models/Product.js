

const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date },
  price: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  quantity: { type: Number, required: true },
  barcode: { type: String },
  HSN: { type: String },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String },
    manufacturer: { type: String },
    batches: [batchSchema],
    archivedBatches: { type: [batchSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
