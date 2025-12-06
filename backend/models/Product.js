// // models/Product.js
// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   category: { type: String },
//   manufacturer: { type: String },
//   batchNumber: { type: String },
//   expiryDate: { type: String },
//   price: { type: Number },
//   stockQuantity: { type: Number },
//   barcode: { type: String },
// }, { timestamps: true });

// module.exports = mongoose.model("Product", productSchema);








// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    batches: [
      {
        batchNumber: { type: String, required: true },
        expiryDate: { type: String },
        price: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        barcode: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);






