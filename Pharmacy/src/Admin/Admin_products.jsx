// Admin_Products.jsx
import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiUpload, FiDownload, FiPlus } from "react-icons/fi";

export default function Admin_Products() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Paracetamol 500mg",
      category: "Pain Relief",
      manufacturer: "PharmaCo",
      batch: "PC-2024-001",
      expiry: "2025-12-31",
      price: 100,
      stock: 450,
      status: "In Stock",
    },
    {
      id: 2,
      name: "Amoxicillin 250mg",
      category: "Antibiotic",
      manufacturer: "MediLife",
      batch: "ML-2024-056",
      expiry: "2025-08-15",
      price: 200,
      stock: 15,
      status: "Low Stock",
    },
    {
      id: 3,
      name: "Vitamin D3",
      category: "Supplements",
      manufacturer: "HealthPlus",
      batch: "HP-2024-120",
      expiry: "2025-11-20",
      price: 150,
      stock: 280,
      status: "In Stock",
    },
    {
      id: 4,
      name: "Aspirin 75mg",
      category: "Pain Relief",
      manufacturer: "PharmaCo",
      batch: "PC-2024-089",
      expiry: "2025-01-20",
      price: 80,
      stock: 120,
      status: "Expiring Soon",
    },
    {
      id: 5,
      name: "Ibuprofen 400mg",
      category: "Pain Relief",
      manufacturer: "MediLife",
      batch: "ML-2024-034",
      expiry: "2026-03-10",
      price: 150,
      stock: 0,
      status: "Out of Stock",
    },
  ]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.batch.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All Categories" || p.category === categoryFilter;

    const matchesStatus =
      statusFilter === "All Status" || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-2">Products & Inventory</h1>
      <p className="text-gray-600 mb-6">
        Manage your product catalog and stock levels
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Products" value={products.length} icon="📦" />
        <Card
          title="Low Stock"
          value={products.filter((p) => p.status === "Low Stock").length}
          icon="⚠️"
        />
        <Card
          title="Out of Stock"
          value={products.filter((p) => p.status === "Out of Stock").length}
          icon="🗑️"
        />
        <Card
          title="Expiring Soon"
          value={products.filter((p) => p.status === "Expiring Soon").length}
          icon="⏰"
        />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Search by name, batch, or manufacturer..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded-lg"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option>All Categories</option>
          <option>Pain Relief</option>
          <option>Antibiotic</option>
          <option>Supplements</option>
        </select>

        <select
          className="px-4 py-2 border rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Expiring Soon</option>
          <option>Out of Stock</option>
        </select>

        <button className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg">
          <FiDownload /> Export
        </button>

        <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg">
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <Th>Product Name</Th>
              <Th>Category</Th>
              <Th>Manufacturer</Th>
              <Th>Batch No.</Th>
              <Th>Expiry Date</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <Td>{p.name}</Td>
                <Td>{p.category}</Td>
                <Td>{p.manufacturer}</Td>
                <Td>{p.batch}</Td>
                <Td>{p.expiry}</Td>
                <Td>₹{p.price}</Td>
                <Td>{p.stock}</Td>
                <Td>
                  <StatusBadge status={p.status} />
                </Td>
                <Td>
                  <div className="flex gap-3 text-lg">
                    <FiEdit2 className="cursor-pointer text-blue-600" />
                    <FiTrash2
                      className="cursor-pointer text-red-600"
                      onClick={() => deleteProduct(p.id)}
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Small Components ---------- */
const Card = ({ title, value, icon }) => (
  <div className="p-5 bg-white shadow rounded-xl flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-gray-600">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    "In Stock": "bg-green-100 text-green-700",
    "Low Stock": "bg-orange-100 text-orange-700",
    "Out of Stock": "bg-red-100 text-red-700",
    "Expiring Soon": "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[status]}`}>
      {status}
    </span>
  );
};

const Th = ({ children }) => (
  <th className="py-3 font-semibold text-gray-600">{children}</th>
);

const Td = ({ children }) => <td className="py-3 text-gray-700">{children}</td>;
