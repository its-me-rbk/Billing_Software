
import React, { useState } from "react";

export default function CreateBill() {
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("Cash");
  const [payments, setPayments] = useState([]);

  const productList = [
    { id: 1, name: "Paracetamol 500mg", price: 25 },
    { id: 2, name: "Dolo 650", price: 35 },
    { id: 3, name: "Amoxicillin 250mg", price: 60 },
    { id: 4, name: "Vitamin C Tablets", price: 85 },
    { id: 5, name: "Cough Syrup", price: 120 },
  ];

  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (product) => {
    const exists = items.find((i) => i.id === product.id);
    if (exists) {
      setItems(
        items.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setItems([...items, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setItems(items.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const removeItem = (id) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = subtotal * 0.18;
  const total = subtotal - (subtotal * discount) / 100 + gst;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + " min ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " hours ago";

    const days = Math.floor(seconds / 86400);
    if (days === 1) return "yesterday";
    return days + " days ago";
  };

  const handlePayment = () => {
    if (items.length === 0) return alert("Add some items!");

    const invoiceNumber = "INV-" + String(payments.length + 1).padStart(6, "0");

    const newPayment = {
      invoice: invoiceNumber,
      name: customer.name || "No Name",
      amount: total,
      method: payment, // <-- ADDED (IMPORTANT)
      date: new Date(),
    };

    setPayments([newPayment, ...payments]);

    setItems([]);
    setDiscount(0);
    setCustomer({ name: "", phone: "" });
    alert("Payment Successful!");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 flex flex-col gap-6">

      {/* MAIN BILL PAGE */}
      <div className="flex gap-6">

        {/* LEFT SIDE */}
        <div className="w-3/4 space-y-6">
          <h1 className="text-3xl font-bold">Create New Bill</h1>
          <p className="text-gray-600">Process customer transactions quickly</p>

          {/* CUSTOMER INFO */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-green-600">●</span> Customer Information
            </h2>

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

          {/* PRODUCT SEARCH */}
          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-green-600">🔍</span> Add Products
            </h2>

            <input
              type="text"
              placeholder="Search products..."
              className="border rounded-lg px-3 py-2 w-full mb-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <div className="border rounded-xl p-4 max-h-40 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No products found</p>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center py-2 border-b last:border-none"
                    >
                      <span>{p.name}</span>
                      <button
                        onClick={() => addItem(p)}
                        className="bg-teal-500 text-white px-3 py-1 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* BILL ITEMS */}
          <div className="bg-white shadow rounded-xl p-5 min-h-[200px]">
            {items.length === 0 ? (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🧾</div>
                No items added yet
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td>₹{item.price}</td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          className="border w-16 px-2 py-1 rounded-lg"
                          value={item.qty}
                          onChange={(e) =>
                            updateQty(item.id, Number(e.target.value))
                          }
                        />
                      </td>

                      <td>₹{(item.qty * item.price).toFixed(2)}</td>

                      <td>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500"
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT SIDE SUMMARY */}
        <div className="w-1/4 bg-white shadow rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Bill Summary</h2>

          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div>
            <label className="text-gray-700">Discount (%)</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full mt-1"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-between text-gray-700">
            <span>GST (18%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <div>
            <label className="text-gray-700">Payment Method</label>
            <select
              className="border rounded-lg px-3 py-2 w-full mt-1"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option>Cash</option>
              <option>Card</option>
              <option>UPI</option>
            </select>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-teal-500 text-white py-2 rounded-lg font-semibold"
          >
            Complete Payment
          </button>

          <button className="w-full border py-2 rounded-lg mt-2">
            Print Invoice
          </button>
        </div>
      </div>

      {/* RECENT PAYMENTS */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Payments</h2>

        {payments.length === 0 ? (
          <p className="text-gray-500 text-center">No recent payments</p>
        ) : (
          <div className="space-y-4">
            {payments.map((p, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 relative bg-gray-50"
              >
                <span className="absolute top-2 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-lg">
                  PAID
                </span>

                <h3 className="text-lg font-bold">{p.invoice}</h3>
                <p className="text-gray-700">{p.name}</p>

                <p className="text-sm text-gray-500">
                  {timeAgo(new Date(p.date))} • {new Date(p.date).toLocaleString()}
                </p>

                {/* ADDED PAYMENT METHOD AT BOTTOM RIGHT */}
                <div className="flex justify-between items-center mt-2">
                  <p className="font-semibold text-lg">₹{p.amount.toFixed(2)}</p>

                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">
                    {p.method}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
