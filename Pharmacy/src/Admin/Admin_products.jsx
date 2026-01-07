import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiDownload, FiEdit2, FiArchive } from "react-icons/fi";
import AddProductForm from "./Admin_Add_product_from";

const API_BASE = "http://localhost:5000/api/products";

export default function Admin_Products() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formScope, setFormScope] = useState(null); // 'product' | 'batch'
  const [isEditing, setIsEditing] = useState(false);
  const [archivedMap, setArchivedMap] = useState({}); // productId -> archived batches
  const [showArchived, setShowArchived] = useState(new Set());

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

  const handleEditRow = (row) => {
    // Normalize initialData for product-level or batch-level edit
    try {
      if (!row) return;
      // If row has batchNumber => batch edit
      if (row.batchNumber) {
        const init = {
          productId: row.productId || row.product?._id || row.productId,
          productName: row.productName || row.product?.name || row.name,
          batchNumber: row.batchNumber,
          expiryDate: row.expiryDate ? new Date(row.expiryDate).toISOString().slice(0,10) : "",
          price: row.price,
          gst: row.gst,
          quantity: row.quantity,
          barcode: row.barcode,
        };
        setEditRow(init);
        setShowAddForm(true);
        return;
      }

      // Otherwise product-level edit
      const initProd = {
        productId: row._id || row.productId,
        productName: row.name || row.productName,
        name: row.name || row.productName,
        category: row.category,
        manufacturer: row.manufacturer,
      };
      setEditRow(initProd);
      setShowAddForm(true);
    } catch (err) {
      console.error(err);
      setEditRow(row);
      setShowAddForm(true);
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
  // Build categorized lists: outOfStock, lowStock, expiringSoon
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const outOfStockList = [];
  const lowStockList = [];
  const expiringList = [];
  const expiredList = [];

  products.forEach((p) => {
    (p.batches || []).forEach((b) => {
      const status = getBatchStatus(b);
      if (status === "Out of Stock") outOfStockList.push({ product: p, batch: b });
      else if (status === "Low Stock") lowStockList.push({ product: p, batch: b });

      if (b && b.expiryDate) {
        const expTime = new Date(b.expiryDate).getTime();
        if (isFinite(expTime)) {
          const days = Math.ceil((expTime - Date.now()) / MS_PER_DAY);
          if (days > 0 && days <= 30) expiringList.push({ product: p, batch: b });
          if (days <= 0) expiredList.push({ product: p, batch: b });
        }
      }
    });
  });

  const lowStock = lowStockList.length;
  const outOfStock = outOfStockList.length;
  const expiringSoon = expiringList.length;
  const expiredCount = expiredList.length;

  // Build hierarchical view: filter products (if product or any batch matches)
  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const productMatches = p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.manufacturer?.toLowerCase().includes(q);
    if (productMatches) return true;
    return (p.batches || []).some((b) => (
      (b.batchNumber || "").toLowerCase().includes(q) ||
      (b.expiryDate || "").toLowerCase().includes(q)
    ));
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
        (outOfStock === 0 && lowStock === 0 && expiringSoon === 0) ? (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-green-800 mb-2">✓ Inventory Healthy</h2>
            <p className="text-sm text-green-700">No out-of-stock, low-stock items, or products expiring within the next 30 days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {outOfStock > 0 && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                <h3 className="font-semibold text-red-700 mb-2">❗ Out Of Stock</h3>
                {outOfStockList.map(({ product, batch }) => (
                  <p key={`${product._id || product.name}-o-${batch.batchNumber || batch.expiryDate}`} className="text-sm text-red-700">
                    <b>{product.name}</b> (Batch {batch.batchNumber}) — Qty: {batch.quantity}
                  </p>
                ))}
              </div>
            )}

            {lowStock > 0 && (
              <div className="bg-orange-50 border border-orange-300 rounded-xl p-4">
                <h3 className="font-semibold text-orange-700 mb-2">⚠ Low Stock</h3>
                {lowStockList.map(({ product, batch }) => (
                  <p key={`${product._id || product.name}-l-${batch.batchNumber || batch.expiryDate}`} className="text-sm text-orange-700">
                    <b>{product.name}</b> (Batch {batch.batchNumber}) — Qty: {batch.quantity}
                  </p>
                ))}
              </div>
            )}

            {expiredCount > 0 && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                <h3 className="font-semibold text-red-700 mb-2">❗ Expired Products</h3>
                {expiredList.map(({ product, batch }) => (
                  <p key={`${product._id || product.name}-x-${batch.batchNumber || batch.expiryDate}`} className="text-sm text-red-700">
                    <b>{product.name}</b> (Batch {batch.batchNumber}) — Expired on {new Date(batch.expiryDate).toLocaleDateString()}
                  </p>
                ))}
              </div>
            )}

            {expiringSoon > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠ Expiring Soon</h3>
                {expiringList.map(({ product, batch }) => (
                  <p key={`${product._id || product.name}-e-${batch.batchNumber || batch.expiryDate}`} className="text-sm text-yellow-700">
                    <b>{product.name}</b> (Batch {batch.batchNumber}) — expires on {new Date(batch.expiryDate).toLocaleDateString()}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      )}


      {/* Add / Search */}
      {showAddForm && <AddProductForm formScope={formScope} onClose={() => { setShowAddForm(false); setEditRow(null); setFormScope(null); setIsEditing(false); }} initialData={editRow ? {
        productId: editRow.productId,
        productName: editRow.productName,
        name: editRow.productName,
        category: editRow.category,
        manufacturer: editRow.manufacturer,
        batchNumber: editRow.batchNumber,
        expiryDate: editRow.expiryDate ? new Date(editRow.expiryDate).toISOString().slice(0,10) : '',
        price: editRow.price,
        gst: editRow.gst,
        quantity: editRow.quantity,
        barcode: editRow.barcode
      } : null} mode={isEditing ? "edit" : "add"} onProductAdded={fetchProducts} />}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, batch, manufacturer..."
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg"><FiDownload /> Export</button>
        <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg" onClick={() => { setFormScope('product'); setEditRow(null); setIsEditing(false); setShowAddForm(true); }}><FiPlus /> Add Product</button>
      </div>

      {/* Product cards */}
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? <div className="p-6 text-center">Loading...</div> : (
          filteredProducts.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No products found.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredProducts.map((p) => {
                const totalStock = (p.batches || []).reduce((s, b) => s + (Number(b.quantity) || 0), 0);
                return (
                  <div key={p._id} className="border rounded-lg p-4 bg-white shadow-sm w-full">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{p.name}</h3>
                        <div className="text-sm text-gray-600">{p.category || "Unspecified"} — {p.manufacturer || "-"}</div>
                        <div className="mt-2 text-sm">Total stock: <b>{totalStock}</b></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiEdit2 onClick={() => { setFormScope('product'); setIsEditing(true); handleEditRow(p); }} className="cursor-pointer text-gray-600 hover:text-blue-600" aria-label="Edit product" />
                        <FiTrash2 onClick={() => deleteProduct(p._id)} className="cursor-pointer text-red-600" aria-label="Delete product" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {(p.batches || []).length === 0 ? (
                        <div className="text-sm text-gray-500">No batches available.</div>
                      ) : (
                        (p.batches || []).map((b, idx) => (
                          <div key={`${p._id}-batch-${b.batchNumber || idx}`} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="text-sm font-medium">Batch: {b.batchNumber || "-"} — Qty: {b.quantity}</div>
                              <div className="text-xs text-gray-500">Expiry: {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "-"} • Price: ₹{b.price} • GST: {b.gst}%</div>
                            </div>
                                  <div className="flex items-center gap-2">
                                    <StatusBadge status={getBatchStatus(b)} />
                                    <FiEdit2 onClick={() => { setFormScope('batch'); setIsEditing(true); handleEditRow({ ...b, productId: p._id, productName: p.name }); }} className="cursor-pointer text-gray-600 hover:text-blue-600" aria-label="Edit batch" />
                                    <FiArchive onClick={async () => {
                                      if (!window.confirm('Archive this batch? It will be moved to archived batches.')) return;
                                      try {
                                        const res = await fetch(`${API_BASE}/${p._id}/batches/${encodeURIComponent(b.batchNumber)}/archive`, { method: 'PUT' });
                                        if (!res.ok) throw new Error('Archive failed');
                                        fetchProducts();
                                      } catch (err) { console.error(err); alert('Failed to archive batch'); }
                                    }} className="cursor-pointer text-gray-600" aria-label="Archive batch" />
                                    <FiTrash2 onClick={async () => {
                                      if (!window.confirm("Delete this batch?")) return;
                                      try {
                                        await fetch(`${API_BASE}/${p._id}/batches/${encodeURIComponent(b.batchNumber)}`, { method: 'DELETE' });
                                        fetchProducts();
                                      } catch (err) { console.error(err); }
                                    }} className="cursor-pointer text-red-600" aria-label="Delete batch" />
                                  </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button className="text-sm text-teal-600" onClick={() => { setFormScope('batch'); setEditRow({ productId: p._id, productName: p.name }); setIsEditing(false); setShowAddForm(true); }}>+ Add Batch</button>
                      <button className="text-sm text-gray-600" onClick={async () => {
                        const id = p._id;
                        const s = new Set(showArchived);
                        if (s.has(id)) {
                          s.delete(id);
                          setShowArchived(s);
                          return;
                        }
                        try {
                          const res = await fetch(`${API_BASE}/${id}/archived`);
                          const data = await res.json();
                          if (res.ok && data) {
                            setArchivedMap(prev => ({ ...prev, [id]: (data.data || []) }));
                          }
                        } catch (err) { console.error(err); }
                        s.add(id);
                        setShowArchived(s);
                      }}>{showArchived.has(p._id) ? 'Hide Archived' : 'View Archived'}</button>
                    </div>

                    {showArchived.has(p._id) && (
                      <div className="mt-3 space-y-2">
                        <h4 className="text-sm font-semibold">Archived Batches</h4>
                        {(archivedMap[p._id] || []).length === 0 ? (
                          <div className="text-sm text-gray-500">No archived batches.</div>
                        ) : (
                          (archivedMap[p._id] || []).map((ab, ai) => (
                            <div key={`arch-${p._id}-${ab.batchNumber || ai}`} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                              <div>
                                <div className="text-sm font-medium">Batch: {ab.batchNumber || '-'} — Qty: {ab.quantity}</div>
                                <div className="text-xs text-gray-500">Expiry: {ab.expiryDate ? new Date(ab.expiryDate).toLocaleDateString() : '-'} • Price: ₹{ab.price} • GST: {ab.gst}%</div>
                              </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    title="Unarchive batch"
                                    onClick={async () => {
                                      if (!window.confirm('Unarchive this batch?')) return;
                                      try {
                                        const res = await fetch(`${API_BASE}/${p._id}/batches/${encodeURIComponent(ab.batchNumber)}/unarchive`, { method: 'PUT' });
                                        if (!res.ok) throw new Error('Unarchive failed');
                                        // refresh archived list and products
                                        const arcRes = await fetch(`${API_BASE}/${p._id}/archived`);
                                        const arcData = await arcRes.json();
                                        if (arcRes.ok) setArchivedMap(prev => ({ ...prev, [p._id]: (arcData.data || []) }));
                                        fetchProducts();
                                      } catch (err) { console.error(err); alert('Failed to unarchive batch'); }
                                    }}
                                    className="cursor-pointer text-green-600 bg-white border rounded px-2 py-1 text-sm"
                                  >
                                    Unarchive
                                  </button>
                                </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
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

// removed table helpers; UI now uses cards
