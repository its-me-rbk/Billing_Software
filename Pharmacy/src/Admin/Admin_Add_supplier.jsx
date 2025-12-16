
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

export default function Admin_Add_Supplier({ onClose, refreshSuppliers }) {
  const [supplier, setSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    productsSupplied: 0,
    initialDue: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSupplier({
      ...supplier,
      [name]:
        name === "productsSupplied" || name === "initialDue"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async () => {
    if (!supplier.name || !supplier.phone) {
      alert("Supplier name and contact number are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/suppliers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplier),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add supplier");
      }

      alert("Supplier added successfully");

      // Refresh supplier list if parent provides it
      if (refreshSuppliers) refreshSuppliers();

      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[600px] p-6 relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-6">Add New Supplier</h2>

        {/* SUPPLIER NAME */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Supplier Name
          </label>
          <input
            type="text"
            name="name"
            value={supplier.name}
            onChange={handleChange}
            className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* CONTACT + EMAIL */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="phone"
              value={supplier.phone}
              onChange={handleChange}
              className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={supplier.email}
              onChange={handleChange}
              className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={supplier.address}
            onChange={handleChange}
            className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* PRODUCTS + DUE */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Products Supplied
            </label>
            <input
              type="number"
              name="productsSupplied"
              value={supplier.productsSupplied}
              onChange={handleChange}
              className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Initial Payment Due
            </label>
            <input
              type="number"
              name="initialDue"
              value={supplier.initialDue}
              onChange={handleChange}
              className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}
