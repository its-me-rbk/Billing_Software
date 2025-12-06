// const mongoose = require("mongoose");

// const BillSchema = new mongoose.Schema({
//   invoice: { type: String, required: true, unique: true },
//   customerName: { type: String, default: "No Name" },
//   customerPhone: { type: String, default: "" },

//   items: [
//     {
//       _id: { type: String, required: true },
//       name: String,
//       price: Number,
//       qty: Number,
//     }
//   ],

//   subtotal: Number,
//   discount: Number,
//   gst: Number,
//   total: Number,

//   paymentMethod: { type: String, default: "Cash" },

//   createdAt: { type: Date, default: Date.now }
// });

// const Bill = mongoose.model("Bill", BillSchema);
// module.exports = Bill;











// models/Bill.js
const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  invoice: { type: String, required: true, unique: true },
  customerName: { type: String, default: "No Name" },
  customerPhone: { type: String, default: "" },

  items: [
    {
      _id: { type: String, required: true }, // product id
      name: String,
      batchNumber: String,  // REQUIRED for batch deduction
      price: Number,
      qty: Number,
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



