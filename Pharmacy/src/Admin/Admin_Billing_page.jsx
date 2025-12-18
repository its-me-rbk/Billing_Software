

import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js"; 

const API_PRODUCTS = "http://localhost:5000/api/products";
const API_BILLS = "http://localhost:5000/api/bills";

export default function Admin_Billing_Page() {
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [qty, setQty] = useState("");

  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("Cash");

  const [productSearch, setProductSearch] = useState("");
  const [bills, setBills] = useState([]);

  
  useEffect(() => {
    fetchProducts();
    fetchBills();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_PRODUCTS);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  // ---------------------- FETCH BILLS ----------------------
  const fetchBills = async () => {
    try {
      const res = await fetch(API_BILLS);
      const data = await res.json();
      setBills(Array.isArray(data) ? data : []);
    } catch {
      setBills([]);
    }
  };

  // ---------------------- FILTER PRODUCTS ----------------------
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ---------------------- LOAD BATCHES ----------------------
  const loadBatches = async (productName) => {
    try {
      const res = await fetch(`${API_PRODUCTS}/batches/${productName}`);
      const data = await res.json();
      setBatches(data);
    } catch {
      setBatches([]);
    }
  };

  // ---------------------- ADD ITEM ----------------------
  const addItem = () => {
    const product = products.find((p) => p.name === selectedProduct);
    const batch = batches.find((b) => b.batchNumber === selectedBatch);

    if (!product || !batch) return alert("Select valid product and batch");
    if (qty > batch.quantity) return alert("Not enough stock!");

    const exists = items.find(
      (i) => i._id === product._id && i.batchNumber === batch.batchNumber
    );

    if (exists) {
      setItems(
        items.map((i) =>
          i._id === product._id && i.batchNumber === batch.batchNumber
            ? { ...i, qty: i.qty + Number(qty) }
            : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          _id: product._id,
          name: product.name,
          batchNumber: batch.batchNumber,
          price: batch.price,
          qty: Number(qty),
        },
      ]);
    }

    setQty("");
    setSelectedBatch("");
    setProductSearch("");
    setSelectedProduct("");
  };

  // ---------------------- UPDATE QUANTITY ----------------------
  const updateQty = (id, batchNumber, newQty) => {
    const productBatch = items.find(
      (i) => i._id === id && i.batchNumber === batchNumber
    );
    if (!productBatch) return;
    if (newQty < 1 || newQty > batches.find((b) => b.batchNumber === batchNumber)?.quantity)
      return;

    setItems(
      items.map((i) =>
        i._id === id && i.batchNumber === batchNumber ? { ...i, qty: newQty } : i
      )
    );
  };

  // ---------------------- REMOVE ITEM ----------------------
  const removeItem = (id, batchNumber) => {
    setItems(items.filter((i) => !(i._id === id && i.batchNumber === batchNumber)));
  };

  // ---------------------- BILL CALCULATIONS ----------------------
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const gst = subtotal * 0.18;
  const total = subtotal - (subtotal * discount) / 100 + gst;

  // ---------------------- COMPLETE PAYMENT ----------------------
  const handlePayment = async () => {
    if (items.length === 0) return alert("Add some items first!");

    // Update stock
    for (const item of items) {
      const batch = batches.find((b) => b.batchNumber === item.batchNumber);
      const newStock = (batch?.quantity ?? 0) - item.qty;
      await fetch(`${API_PRODUCTS}/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchNumber: item.batchNumber, quantity: newStock }),
      });
    }

    const invoiceNo = "INV-" + String(Date.now()).slice(-6);

    const payload = {
      invoice: invoiceNo,
      customerName: customer.name || "No Name",
      customerPhone: customer.phone,
      items,
      subtotal,
      discount,
      gst,
      total,
      paymentMethod: payment,
      paid: true,
    };

    const res = await fetch(API_BILLS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Bill created successfully!");
      setItems([]);
      setCustomer({ name: "", phone: "" });
      setDiscount(0);
      setPayment("Cash");
      setSelectedProduct("");
      setSelectedBatch("");
      setProductSearch("");
      fetchProducts();
      fetchBills();
    } else {
      alert("Failed to save bill!");
    }
  };

 
  const printBill = (billId) => {
    const content = document.getElementById(`print-${billId}`);
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 6px; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
    win.close();
  };


  const downloadBill = (billId, invoice) => {
    const element = document.getElementById(`print-${billId}`);
    html2pdf()
      .from(element)
      .set({
        filename: `${invoice}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4" },
      })
      .save();
  };
  

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 flex flex-col gap-8">
     
      <div className="flex flex-col md:flex-row gap-6">
       
        <div className="md:w-3/4 space-y-6">
          <h1 className="text-3xl font-bold">Create New Bill</h1>

          {/* CUSTOMER */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                className="border rounded-lg px-3 py-2 w-full"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="border rounded-lg px-3 py-2 w-full"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
            </div>
          </div>

          {/* SEARCH PRODUCT */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">Add Products</h2>

            {/* Product Search Input */}
            <input
              type="text"
              placeholder="Search products…"
              className="border rounded-lg px-3 py-2 w-full mb-4"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />

            {/* Suggestions */}
            {productSearch && (
              <div className="border rounded-xl p-2 max-h-40 overflow-y-auto mb-4">
                {filteredProducts.length === 0 ? (
                  <p className="text-gray-500">No products found</p>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p._id}
                      className="flex justify-between items-center py-1 border-b"
                    >
                      <span>{p.name}</span>
                      <button
                        onClick={() => {
                          setSelectedProduct(p.name);
                          loadBatches(p.name);
                          setProductSearch(p.name);
                        }}
                        className="px-3 py-1 bg-teal-500 text-white rounded-lg"
                      >
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Batch & Qty Selection */}
            {selectedProduct && (
              <div className="flex gap-4">
                <select
                  className="p-2 border flex-1"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="">Select Batch</option>
                  {batches.map((b) => (
                    <option key={b.batchNumber} value={b.batchNumber}>
                      {b.batchNumber} — Qty: {b.quantity}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  className="p-2 border w-24"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />

                <button
                  onClick={addItem}
                  className="bg-blue-600 text-white px-4 rounded"
                >
                  Add
                </button>
              </div>
            )}

            {/* ITEMS TABLE */}
            {items.length > 0 && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border">Product</th>
                      <th className="p-2 border">Batch</th>
                      <th className="p-2 border">Qty</th>
                      <th className="p-2 border">Price</th>
                      <th className="p-2 border">Total</th>
                      <th className="p-2 border">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={`${i._id}-${i.batchNumber}`}>
                        <td className="p-2 border">{i.name}</td>
                        <td className="p-2 border">{i.batchNumber}</td>
                        <td className="p-2 border">
                          <input
                            type="number"
                            className="border w-16 px-2 py-1 rounded-lg"
                            value={i.qty}
                            min="1"
                            onChange={(e) =>
                              updateQty(i._id, i.batchNumber, Number(e.target.value))
                            }
                          />
                        </td>
                        <td className="p-2 border">{i.price}</td>
                        <td className="p-2 border">{(i.qty * i.price).toFixed(2)}</td>
                        <td className="p-2 border">
                          <button
                            onClick={() => removeItem(i._id, i.batchNumber)}
                            className="text-red-500"
                          >
                            ✖
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ---------------------- RIGHT SUMMARY ---------------------- */}
        <div className="md:w-1/4 bg-white shadow rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Bill Summary</h2>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div>
            <label>Discount (%)</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-between">
            <span>GST (18%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <select
            className="border rounded-lg px-3 py-2 w-full"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option>Cash</option>
            <option>Card</option>
            <option>UPI</option>
          </select>
          <button
            onClick={handlePayment}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
          >
            Complete Payment
          </button>
        </div>
      </div>

      {/* ---------------------- RECENT BILLS ---------------------- */}
      <div className="mt-5">
        <h2 className="text-xl font-semibold mb-4">Recent Bills</h2>
        {bills.length === 0 ? (
          <p className="text-gray-500">No bills created yet</p>
        ) : (
          <div className="space-y-4">
            {bills.map((b) => (
              <div
                key={b._id}
                className="bg-white shadow rounded-xl p-4 flex flex-col gap-3 border"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">{b.invoice}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => printBill(b._id)}
                      className="px-3 py-1 bg-gray-700 text-white rounded"
                    >
                      Print
                    </button>
                    <button
                      onClick={() => downloadBill(b._id, b.invoice)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{b.customerName || "No Name"}</span>
                  <span>{b.paymentMethod || "Cash"}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  {new Date(b.createdAt).toLocaleString()}
                </p>
                <div className="border-t pt-2">
                  <p className="font-semibold mb-1">Products:</p>
                  <ul className="list-disc pl-5 text-gray-700 text-sm">
                    {b.items.map((item) => (
                      <li key={`${item._id}-${item.batchNumber}`}>
                        {item.name} — ₹{item.price} × {item.qty} = ₹
                        {(item.price * item.qty).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-end font-bold text-lg mt-2">
                  <span>Total: ₹{b.total.toFixed(2)}</span>
                </div>

                {/* Hidden div for print/download */}
                <div id={`print-${b._id}`} style={{ display: "none" }}>
                  <h2>Invoice: {b.invoice}</h2>
                  <p>Customer: {b.customerName}</p>
                  <p>Payment: {b.paymentMethod}</p>
                  <hr />
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.price}</td>
                          <td>₹{(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h3>Total: ₹{b.total.toFixed(2)}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


