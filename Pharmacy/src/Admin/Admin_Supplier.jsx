import React, { useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";

export default function AdminSupplier() {
  const [search, setSearch] = useState("");

  const suppliers = [
    {
      name: "PharmaCo Distributors",
      lastOrder: "2025-01-10",
      contact: "+91 98765 11111",
      email: "contact@pharmaco.com",
      products: 45,
      totalOrders: 125,
      pendingPayment: "₹45,000",
      status: "Active",
    },
    {
      name: "MediLife Supplies",
      lastOrder: "2025-01-12",
      contact: "+91 98765 22222",
      email: "info@medilife.com",
      products: 38,
      totalOrders: 98,
      pendingPayment: "Paid",
      status: "Active",
    },
    {
      name: "HealthPlus Wholesale",
      lastOrder: "2025-01-08",
      contact: "+91 98765 33333",
      email: "sales@healthplus.com",
      products: 52,
      totalOrders: 156,
      pendingPayment: "₹28,000",
      status: "Active",
    },
  ];

  const statCards = [
    {
      title: "Total Suppliers",
      value: "4",
      icon: <FiUsers size={22} />,
    },
    {
      title: "Active Suppliers",
      value: "3",
      icon: <FiCheckCircle size={22} />,
    },
    {
      title: "Pending Payments",
      value: "₹88,000",
      icon: <FiDollarSign size={22} />,
    },
    {
      title: "Total Orders",
      value: "424",
      icon: <FiPackage size={22} />,
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Suppliers</h1>
          <p className="text-gray-500 mt-1">
            Manage supplier relationships and orders
          </p>
        </div>

        <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
          + Add Supplier
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow hover:shadow-md transition border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 text-white rounded-full shadow">
                {card.icon}
              </div>

              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <h2 className="text-2xl font-semibold mt-1">{card.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 border border-gray-100">
        <div className="relative w-full">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, contact, or email..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4 font-medium">Supplier Name</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4 font-medium">Total Orders</th>
              <th className="p-4 font-medium">Pending Payment</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.map((s, i) => (
              <tr key={i} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Last order: {s.lastOrder}
                  </p>
                </td>

                <td className="p-4">{s.contact}</td>
                <td className="p-4">{s.email}</td>
                <td className="p-4">{s.products}</td>
                <td className="p-4">{s.totalOrders}</td>

                <td className="p-4">
                  <span
                    className={`font-medium ${
                      s.pendingPayment === "Paid"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {s.pendingPayment}
                  </span>
                </td>

                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {s.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition cursor-pointer">
                      <FiEdit className="text-blue-600" size={18} />
                    </div>
                    <div className="p-2 rounded-full bg-gray-100 hover:bg-red-100 transition cursor-pointer">
                      <FiTrash2 className="text-red-600" size={18} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
