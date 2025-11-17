
import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiDownload, FiPlus } from "react-icons/fi";
import AddProductForm from "./Admin_Add_product_from"; 

const API_BASE = "http://localhost:5000/api/products";

export default function Admin_Products() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products from backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
     
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch products error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete product (calls backend DELETE; if backend lacks DELETE route it still removes from UI)
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        // try optimistic removal even if backend doesn't support DELETE
        setProducts((prev) => prev.filter((p) => p._id !== id));
        console.warn("Delete request failed, removed from UI only.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  };

  // Called when AddProductForm successfully creates a product
  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  // Utility: compute status from stock & expiry
  const getStatus = (p) => {
    const stock = Number(p.stockQuantity ?? p.stock ?? 0);
    const expiry = p.expiryDate || p.expiry || null;
    if (stock <= 0) return "Out of Stock";
    if (stock <= 20) return "Low Stock"; // threshold
    if (expiry) {
      const d = new Date(expiry);
      const now = new Date();
      const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) return "Expiring Soon";
    }
    return "In Stock";
  };

  // Generate unique categories from products
  const categories = ["All Categories", ...Array.from(new Set(products.map((p) => p.category || "Unspecified")))];

  // Filter products for display
  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(q)) ||
      (p.batch && p.batch.toLowerCase().includes(q)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === "All Categories" || (p.category || "Unspecified") === categoryFilter;
    const status = getStatus(p);
    const matchesStatus = statusFilter === "All Status" || status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const total = products.length;
  const lowStock = products.filter((p) => getStatus(p) === "Low Stock").length;
  const outOfStock = products.filter((p) => getStatus(p) === "Out of Stock").length;
  const expiring = products.filter((p) => getStatus(p) === "Expiring Soon").length;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-2">Products & Inventory</h1>
      <p className="text-gray-600 mb-6">Manage your product catalog and stock levels</p>

      {/* Add product modal */}
      {showAddForm && (
        <AddProductForm
          onClose={() => setShowAddForm(false)}
          onProductAdded={handleProductAdded}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Products" value={total} icon="📦" />
        <Card title="Low Stock" value={lowStock} icon="⚠️" />
        <Card title="Out of Stock" value={outOfStock} icon="🗑️" />
        <Card title="Expiring Soon" value={expiring} icon="⏰" />
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
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
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

        {/* ADD PRODUCT BUTTON — Opens Form */}
        <button
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">Loading products...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <Th>Product Name</Th>
                <Th>Category</Th>
                <Th>Manufacturer</Th>
                <Th>Batch No.</Th>
                <Th>Expiry Date</Th>
                <Th>Price</Th>
                <Th>Quantity</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <Td>{p.name}</Td>
                    <Td>{p.category || "Unspecified"}</Td>
                    <Td>{p.manufacturer}</Td>
                    <Td>{p.batchNumber || p.batch || "-"}</Td>
                    <Td>{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "-"}</Td>
                    <Td>₹{p.price ?? "-"}</Td>
                    <Td>{p.stockQuantity ?? p.stock ?? 0}</Td>
                    <Td>
                      <StatusBadge status={getStatus(p)} />
                    </Td>
                    <Td>
                      <div className="flex gap-3 text-lg">
                        <FiEdit2 className="cursor-pointer text-blue-600" />
                        <FiTrash2
                          className="cursor-pointer text-red-600"
                          onClick={() => deleteProduct(p._id)}
                        />
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
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
    <span className={`px-3 py-1 rounded-full text-sm ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

const Th = ({ children }) => <th className="py-3 font-semibold text-gray-600">{children}</th>;
const Td = ({ children }) => <td className="py-3 text-gray-700">{children}</td>;
