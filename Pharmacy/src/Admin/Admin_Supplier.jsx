
import React, { useEffect, useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";

import Admin_Add_Supplier from "./Admin_Add_Supplier";

export default function AdminSupplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH SUPPLIERS ---------------- */
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/suppliers");
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  /* ---------------- DELETE SUPPLIER ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;

    try {
      await fetch(`http://localhost:5000/api/suppliers/${id}`, {
        method: "DELETE",
      });
      fetchSuppliers();
    } catch (error) {
      alert("Failed to delete supplier");
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredSuppliers = suppliers.filter((s) =>
    `${s.name} ${s.phone} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ---------------- STATS (Derived) ---------------- */
  const statCards = [
    {
      title: "Total Suppliers",
      value: suppliers.length,
      icon: <FiUsers size={22} />,
    },
    {
      title: "Active Suppliers",
      value: suppliers.length, // adjust when status is added
      icon: <FiCheckCircle size={22} />,
    },
    {
      title: "Pending Payments",
      value: `₹${suppliers.reduce(
        (sum, s) => sum + (s.initialDue || 0),
        0
      )}`,
      icon: <FiDollarSign size={22} />,
    },
    {
      title: "Products Supplied",
      value: suppliers.reduce(
        (sum, s) => sum + (s.productsSupplied || 0),
        0
      ),
      icon: <FiPackage size={22} />,
    },
  ];

  return (
    <div className="p-8 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Suppliers</h1>
          <p className="text-gray-500 mt-1">
            Manage supplier relationships and orders
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          + Add Supplier
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow border"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 text-white rounded-full">
                {card.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <h2 className="text-2xl font-semibold">{card.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 border">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, contact, or email..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Supplier</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Email</th>
              <th className="p-4">Products</th>
              <th className="p-4">Pending Due</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center">
                  Loading suppliers...
                </td>
              </tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center">
                  No suppliers found
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((s) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">{s.name}</td>
                  <td className="p-4">{s.phone}</td>
                  <td className="p-4">{s.email || "-"}</td>
                  <td className="p-4">{s.productsSupplied}</td>
                  <td className="p-4 text-orange-600">
                    ₹{s.initialDue}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <FiEdit className="text-blue-600 cursor-pointer" />
                      <FiTrash2
                        className="text-red-600 cursor-pointer"
                        onClick={() => handleDelete(s._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD SUPPLIER MODAL */}
      {showAddModal && (
        <Admin_Add_Supplier
          onClose={() => setShowAddModal(false)}
          refreshSuppliers={fetchSuppliers}
        />
      )}
    </div>
  );
}
