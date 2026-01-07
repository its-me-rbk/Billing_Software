
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

export default function Admin_Add_Customer({ onClose, onSubmit, initialData = null, mode = "add" }) {
  const [customer, setCustomer] = useState(
    initialData || {
      name: "",
      phone: "",
      email: "",
      loyaltyPoints: 0,
      address: "",
      notes: "",
    }
  );

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!customer.name || !customer.phone) {
      alert("Name & Phone Number are required!");
      return;
    }
    onSubmit(customer);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[650px] p-6 relative animate-fadeIn">

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <FiX size={22} />
        </button>

        <h2 className="text-2xl font-semibold mb-5">{mode === "edit" ? "Edit Customer" : "Add New Customer"}</h2>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter customer name"
              value={customer.name}
              onChange={handleChange}
              className="border w-full p-3 rounded-md mt-1 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="+91 xxxxxx xxxxx"
              value={customer.phone}
              onChange={handleChange}
              className="border w-full p-3 rounded-md mt-1 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="customer@email.com"
              value={customer.email}
              onChange={handleChange}
              className="border w-full p-3 rounded-md mt-1 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Loyalty Points */}
          <div>
            <label className="block text-sm font-medium">
              Initial Loyalty Points
            </label>
            <input
              type="number"
              name="loyaltyPoints"
              value={customer.loyaltyPoints}
              onChange={handleChange}
              className="border w-full p-3 rounded-md mt-1 focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Address */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            name="address"
            placeholder="Enter full address"
            value={customer.address}
            onChange={handleChange}
            className="border w-full p-3 rounded-md mt-1 focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Prescription Notes */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Prescription Notes</label>
          <textarea
            name="notes"
            placeholder="Add any prescription or medical notes..."
            value={customer.notes}
            onChange={handleChange}
            className="border w-full p-3 rounded-md mt-1 min-h-[100px] focus:ring-2 focus:ring-green-500"
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {mode === "edit" ? "Save Changes" : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
