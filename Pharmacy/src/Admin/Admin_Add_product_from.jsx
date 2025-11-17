

import React, { useState } from "react";
import { FiX, FiBarChart } from "react-icons/fi";

export default function AddProductForm({ onClose }) {

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    price: "",
    stockQuantity: "",
    barcode: "",
  });

  // handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit data to backend
  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert("Product added successfully!");
        onClose();   // close modal
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-black">
          <FiX size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add New Product</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Product Name */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Product Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 bg-gray-100"
            >
              <option value="">Select category</option>
              <option value="Medicine">Medicine</option>
              <option value="Equipment">Equipment</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Manufacturer */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Manufacturer</label>
            <input
              name="manufacturer"
              type="text"
              placeholder="Enter manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Batch Number */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Batch Number</label>
            <input
              name="batchNumber"
              type="text"
              placeholder="Enter batch number"
              value={formData.batchNumber}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Expiry */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Expiry Date</label>
            <input
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Price (₹)</label>
            <input
              name="price"
              type="number"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Stock */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Stock Quantity</label>
            <input
              name="stockQuantity"
              type="number"
              placeholder="0"
              value={formData.stockQuantity}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>

          {/* Barcode */}
          <div className="flex flex-col">
            <label className="text-sm mb-1">Barcode</label>
            <input
              name="barcode"
              type="text"
              placeholder="Scan or enter"
              value={formData.barcode}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 bg-gray-100"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-8 gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
