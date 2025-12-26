
const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  invoice: { type: String, required: true, unique: true },
  customerName: { type: String, default: "No Name" },
  customerAddress: { type: String, default: "" },
  customerPhone: { type: String, default: "" },
  customerEmail: { type: String, default: "" },

  items: [
    {
      _id: { type: String, required: true }, // product id
      name: String,
      batchNumber: String,  // REQUIRED for batch deduction
      price: Number,
      qty: Number,
      gst: Number,
      taxableAmount: Number,
      sgst: Number,
      cgst: Number,
      hsn: String,
    }
  ],

  subtotal: Number,
  discount: Number,
  gst: Number,
  total: Number,

  paymentMethod: { type: String, default: "Cash" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bill", BillSchema);



