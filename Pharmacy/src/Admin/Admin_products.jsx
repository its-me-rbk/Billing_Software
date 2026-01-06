import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiDownload } from "react-icons/fi";
import AddProductForm from "./Admin_Add_product_from";

const API_BASE = "http://localhost:5000/api/products";

export default function Admin_Products() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      else setProducts([]);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getBatchStatus = (batch) => {
    const qty = batch.quantity || 0;
    if (qty <= 0) return "Out of Stock";
    if (qty < 10) return "Low Stock";

    if (batch.expiryDate) {
      const exp = new Date(batch.expiryDate);
      const now = new Date();
      const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      if (exp < now) return "Expired";
      if (diff <= 30) return "Expiring Soon";
    }
    return "In Stock";
  };

  // Compute stats
  const totalProducts = products.length;
  let lowStock = 0, outOfStock = 0, expiringSoon = 0;
  products.forEach(p => {
    p.batches.forEach(b => {
      const status = getBatchStatus(b);
      if (status === "Low Stock") lowStock++;
      if (status === "Out of Stock") outOfStock++;
      if (status === "Expiring Soon") expiringSoon++;
    });
  });

  // Flatten batches
  const batchRows = products.flatMap(p =>
    p.batches.map(b => ({
      ...b,
      productId: p._id,              // add parent product id
      productName: p.name,
      category: p.category,
      manufacturer: p.manufacturer
    }))
  );

  const filteredRows = batchRows.filter(r => {
    const q = search.toLowerCase();
    return (
      r.productName.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.batchNumber?.toLowerCase().includes(q) ||
      r.manufacturer?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-2">Products & Inventory</h1>
      <p className="text-gray-600 mb-6">Manage your product catalog and stock levels</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Products" value={totalProducts} color="teal" />
        <StatCard label="Low Stock" value={lowStock} color="orange" />
        <StatCard label="Out of Stock" value={outOfStock} color="red" />
        <StatCard label="Expiring Soon" value={expiringSoon} color="yellow" />
      </div>

      {/* EXPIRING PRODUCT ALERT */}
{products.length > 0 && (
  <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
    <h2 className="font-semibold text-yellow-800 mb-2">
      ⚠ Expiring Product Alert
    </h2>

    {products.flatMap(p =>
      p.batches
        .filter(b => {
          if (!b.expiryDate) return false;
          const days =
            (new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
          return days > 0 && days <= 30;
        })
        .map((b) => (
          <p key={`${p._id || p.name}-${b.batchNumber || b.expiryDate || b.price}`} className="text-sm text-yellow-700">
            <b>{p.name}</b> (Batch {b.batchNumber}) — expires on{" "}
            {new Date(b.expiryDate).toLocaleDateString()}
          </p>
        ))
    )}
  </div>
)}


      {/* Add / Search */}
      {showAddForm && <AddProductForm onClose={() => setShowAddForm(false)} onProductAdded={fetchProducts} />}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, batch, manufacturer..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg"><FiDownload /> Export</button>
        <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg" onClick={() => setShowAddForm(true)}><FiPlus /> Add Product</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {loading ? <div className="p-6 text-center">Loading...</div> :
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <Th>Product Name</Th>
                <Th>Category</Th>
                <Th>Manufacturer</Th>
                <Th>Batch No.</Th>
                <Th>Expiry Date</Th>
                <Th>Price</Th>
                <Th>GST</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-gray-400">No products found.</td>
                </tr>
              ) : filteredRows.map((r, i) => (
                <tr key={`${r.productId || r._id}-${r.batchNumber || i}`} className="border-b">
                  <Td>{r.productName}</Td>
                  <Td>{r.category || "Unspecified"}</Td>
                  <Td>{r.manufacturer || "-"}</Td>
                  <Td>{r.batchNumber}</Td>
                  <Td>{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : "-"}</Td>
                  <Td>₹{r.price}</Td>
                  <Td>{r.gst}%</Td>
                  <Td>{r.quantity}</Td>
                  <Td><StatusBadge status={getBatchStatus(r)} /></Td>
                  <Td>
                    <FiTrash2 className="cursor-pointer text-red-600" onClick={() => deleteProduct(r.productId)} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}

const StatCard = ({ label, value, color }) => {
  const colors = {
    teal: "bg-teal-100 text-teal-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <div className={`p-4 rounded-lg shadow flex flex-col items-center justify-center ${colors[color]}`}>
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    "In Stock": "bg-green-100 text-green-700",
    "Low Stock": "bg-orange-100 text-orange-700",
    "Out of Stock": "bg-red-100 text-red-700",
    "Expiring Soon": "bg-yellow-100 text-yellow-700",
    Expired: "bg-red-200 text-red-800",
  };
  return <span className={`px-3 py-1 rounded-full text-sm ${colors[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
};

const Th = ({ children }) => <th className="py-3 px-2 font-semibold text-gray-700">{children}</th>;
const Td = ({ children }) => <td className="py-3 px-2 text-gray-800">{children}</td>;
