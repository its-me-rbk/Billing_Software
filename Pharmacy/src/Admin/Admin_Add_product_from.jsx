
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

export default function Admin_Add_Product({ formScope = null, onClose, initialData = null, mode = "add", onProductAdded = null }) {
  const [form, setForm] = useState(initialData || {
    // product fields
    name: "",
    category: "",
    manufacturer: "",
    // batch fields
    batchNumber: "",
    expiryDate: "",
    price: "",
    gst: "",
    quantity: "",
    barcode: "",
  });

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitProduct = async () => {
    try {
      // EDIT MODE
      if (mode === "edit" && initialData) {
        // product-scope edit
        if (formScope === 'product') {
          const updates = {
            name: form.name,
            category: form.category,
            manufacturer: form.manufacturer,
          };
          const res = await fetch(`http://localhost:5000/api/products/${initialData.productId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
          });
          const data = await res.json();
          if (!res.ok || !data.success) { alert(data.message || 'Failed'); return; }
          alert('Product updated'); if (onProductAdded) onProductAdded(); onClose(); return;
        }

        // batch-scope edit
        if (formScope === 'batch') {
          if (!initialData.productId || !initialData.batchNumber) { alert('Missing identifiers'); return; }
          const res = await fetch(`http://localhost:5000/api/products/${initialData.productId}/batches/${initialData.batchNumber}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
              batchNumber: form.batchNumber,
              expiryDate: form.expiryDate || null,
              price: Number(form.price) || 0,
              gst: Number(form.gst) || 0,
              quantity: Number(form.quantity) || 0,
              barcode: form.barcode,
            })
          });
          const data = await res.json();
          if (!res.ok || !data.success) { alert(data.message || 'Failed'); return; }
          alert('Batch updated'); if (onProductAdded) onProductAdded(); onClose(); return;
        }
      }

      // ADD MODE
      if (formScope === 'product') {
        // Add product-level only (no batch)
        if (!form.name) { alert('Product name required'); return; }
        const res = await fetch('http://localhost:5000/api/products', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
            name: form.name,
            category: form.category,
            manufacturer: form.manufacturer,
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) { alert(data.message || data.error || 'Failed'); return; }
        alert('Product added'); if (onProductAdded) onProductAdded(); onClose(); return;
      }

      if (formScope === 'batch') {
        // Add batch to existing product by productName. If productName missing, try to resolve via productId.
        let name = initialData?.productName || form.name;
        if (!name && initialData?.productId) {
          try {
            const listRes = await fetch('http://localhost:5000/api/products');
            const list = await listRes.json();
            const found = Array.isArray(list) ? list.find(p => (p._id || p.id) === initialData.productId) : null;
            if (found) name = found.name;
          } catch (err) {
            console.error('Failed to resolve product name by id', err);
          }
        }

        if (!name) { alert('Missing product name or productId'); return; }

        const res = await fetch('http://localhost:5000/api/products/add', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
            name,
            batchNumber: form.batchNumber,
            expiryDate: form.expiryDate || null,
            price: Number(form.price) || 0,
            gst: Number(form.gst) || 0,
            quantity: Number(form.quantity) || 0,
            barcode: form.barcode,
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) { alert(data.message || data.error || 'Failed'); return; }
        alert('Batch added'); if (onProductAdded) onProductAdded(); onClose(); return;
      }

      // Fallback: submit as add
      alert('Nothing to submit');
    } catch (err) {
      console.error(err);
      alert('Server Error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-xl p-6 rounded-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <FiX size={22} />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {mode === "edit" ? (formScope === 'batch' ? 'Update Batch' : 'Update Product') : (formScope === 'batch' ? 'Add Batch' : 'Add Product')}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/** Product fields shown only when scope is 'product' */}
          {formScope === 'product' && (
            <>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Product Name</label>
                <input
                  id="product-name"
                  name="name"
                  value={form.name}
                  onChange={handle}
                  placeholder="Enter product name"
                  className="p-2 border rounded w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">Category</label>
                <select
                  id="product-category"
                  name="category"
                  value={form.category}
                  onChange={handle}
                  className="p-2 border rounded w-full"
                >
                  <option value="">Select category</option>
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Vitamins">Vitamins</option>
                  <option value="Supplements">Supplements</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">Manufacturer</label>
                <input
                  id="product-manufacturer"
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handle}
                  placeholder="Enter manufacturer"
                  className="p-2 border rounded w-full"
                />
              </div>
            </>
          )}

          {/** Batch fields shown only when scope is 'batch' */}
          {formScope === 'batch' && (
            <>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Batch Number</label>
                <input
                  id="batch-number"
                  name="batchNumber"
                  value={form.batchNumber}
                  onChange={handle}
                  placeholder="Enter batch number"
                  className="p-2 border rounded w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">Expiry Date</label>
                <input
                  id="expiry-date"
                  name="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={handle}
                  className="p-2 border rounded w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">Price (₹)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handle}
                  placeholder="Base price"
                  className="p-2 border rounded w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">GST (%)</label>
                <input
                  id="gst"
                  name="gst"
                  type="number"
                  value={form.gst}
                  onChange={handle}
                  placeholder="GST %"
                  className="p-2 border rounded w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handle}
                  placeholder="0"
                  className="p-2 border rounded w-full"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-700 mb-1 block">Barcode</label>
                <input
                  id="barcode"
                  name="barcode"
                  value={form.barcode}
                  onChange={handle}
                  placeholder="Scan or enter"
                  className="p-2 border rounded w-full"
                />
              </div>
            </>
          )}
        </div>

        <button
          onClick={submitProduct}
          className="mt-6 bg-teal-600 text-white px-4 py-2 rounded w-full"
        >
          {mode === "edit" ? (formScope === 'batch' ? 'Update Batch' : 'Update Product') : (formScope === 'batch' ? 'Add Batch' : 'Add Product')}
        </button>
      </div>
    </div>
  );
}

