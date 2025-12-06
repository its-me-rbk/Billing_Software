

// import React, { useEffect, useState } from "react";

// const API_PRODUCTS = "http://localhost:5000/api/products";
// const API_BILLS = "http://localhost:5000/api/bills";

// export default function CreateBill() {
//   const [customer, setCustomer] = useState({ name: "", phone: "" });
//   const [search, setSearch] = useState("");
//   const [items, setItems] = useState([]);
//   const [discount, setDiscount] = useState(0);
//   const [payment, setPayment] = useState("Cash");

//   const [products, setProducts] = useState([]);
//   const [bills, setBills] = useState([]);

//   // ---------------------- FETCH PRODUCTS ----------------------
//   useEffect(() => {
//     fetchProducts();
//     fetchBills();
//   }, []);

//   const fetchProducts = () => {
//     fetch(API_PRODUCTS)
//       .then((res) => res.json())
//       .then((data) => setProducts(Array.isArray(data) ? data : []))
//       .catch(() => setProducts([]));
//   };

//   // ---------------------- FETCH BILLS ----------------------
//   const fetchBills = () => {
//     fetch(API_BILLS)
//       .then((res) => res.json())
//       .then((data) => setBills(Array.isArray(data) ? data : []))
//       .catch(() => setBills([]));
//   };

//   // ---------------------- FILTER PRODUCTS ----------------------
//   const filteredProducts = products.filter((p) =>
//     p.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   // ---------------------- ADD ITEMS ----------------------
//   const addItem = (product) => {
//     const stock = Number(product.stockQuantity ?? 0);
//     if (stock <= 0) return alert("This product is OUT OF STOCK!");

//     const exists = items.find((i) => i._id === product._id);

//     if (exists) {
//       if (exists.qty + 1 > stock) return alert("Not enough stock available!");
//       setItems(items.map((i) => (i._id === product._id ? { ...i, qty: i.qty + 1 } : i)));
//     } else {
//       setItems([...items, { ...product, qty: 1 }]);
//     }
//   };

//   // ---------------------- UPDATE QUANTITY ----------------------
//   const updateQty = (id, qty) => {
//     const product = products.find((p) => p._id === id);
//     const stock = Number(product.stockQuantity ?? 0);

//     if (qty > stock) return alert("Stock unavailable");
//     if (qty < 1) return;

//     setItems(items.map((i) => (i._id === id ? { ...i, qty } : i)));
//   };

//   // ---------------------- REMOVE ITEM ----------------------
//   const removeItem = (id) => {
//     setItems(items.filter((i) => i._id !== id));
//   };

//   // ---------------------- BILL CALCULATIONS ----------------------
//   const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
//   const gst = subtotal * 0.18;
//   const total = subtotal - (subtotal * discount) / 100 + gst;

//   // ---------------------- UPDATE BACKEND STOCK ----------------------
//   const updateStock = async () => {
//     for (const item of items) {
//       const newStock = Number(item.stockQuantity ?? 0) - item.qty;
//       await fetch(`${API_PRODUCTS}/${item._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ stockQuantity: newStock }),
//       });
//     }
//   };

//   // ---------------------- COMPLETE PAYMENT ----------------------
//   const handlePayment = async () => {
//     if (items.length === 0) return alert("Add some items first!");

//     await updateStock();

//     const invoiceNo = "INV-" + String(Date.now()).slice(-6);

//     const payload = {
//       invoice: invoiceNo,
//       customerName: customer.name || "No Name",
//       customerPhone: customer.phone,
//       items: items.map((i) => ({
//         _id: i._id,
//         name: i.name,
//         price: i.price,
//         qty: i.qty,
//       })),
//       subtotal,
//       discount,
//       gst,
//       total,
//       paymentMethod: payment,
//       paid: true, // default paid
//     };

//     const res = await fetch(API_BILLS, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (res.ok) {
//       alert("Bill created successfully!");
//       setItems([]);
//       setCustomer({ name: "", phone: "" });
//       setDiscount(0);
//       setPayment("Cash");

//       fetchProducts();
//       fetchBills();
//     } else {
//       alert("Failed to save bill!");
//     }
//   };

//   return (
//     <div className="w-full min-h-screen bg-gray-50 p-6 flex flex-col gap-8">
//       {/* ---------------------- MAIN SECTION ---------------------- */}
//       <div className="flex gap-6">
//         {/* ---------------------- LEFT SIDE ---------------------- */}
//         <div className="w-3/4 space-y-6">
//           <h1 className="text-3xl font-bold">Create New Bill</h1>

//           {/* CUSTOMER */}
//           <div className="bg-white shadow rounded-xl p-5">
//             <h2 className="text-lg font-semibold mb-4">Customer</h2>
//             <div className="grid grid-cols-2 gap-4">
//               <input
//                 type="text"
//                 placeholder="Customer Name"
//                 className="border rounded-lg px-3 py-2 w-full"
//                 value={customer.name}
//                 onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
//               />
//               <input
//                 type="text"
//                 placeholder="Phone Number"
//                 className="border rounded-lg px-3 py-2 w-full"
//                 value={customer.phone}
//                 onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
//               />
//             </div>
//           </div>

//           {/* SEARCH PRODUCT */}
//           <div className="bg-white shadow rounded-xl p-5">
//             <h2 className="text-lg font-semibold mb-4">Add Products</h2>

//             <input
//               type="text"
//               placeholder="Search products…"
//               className="border rounded-lg px-3 py-2 w-full mb-4"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />

//             {search && (
//               <div className="border rounded-xl p-4 max-h-40 overflow-y-auto">
//                 {filteredProducts.length === 0 ? (
//                   <p className="text-gray-500">No products found</p>
//                 ) : (
//                   filteredProducts.map((p) => (
//                     <div
//                       key={p._id}
//                       className="flex justify-between items-center py-2 border-b"
//                     >
//                       <span>
//                         {p.name}{" "}
//                         {p.stockQuantity <= 0 && (
//                           <span className="text-red-500">(Out of Stock)</span>
//                         )}
//                       </span>

//                       <button
//                         disabled={p.stockQuantity <= 0}
//                         onClick={() => addItem(p)}
//                         className={`px-3 py-1 rounded-lg ${
//                           p.stockQuantity > 0
//                             ? "bg-teal-500 text-white"
//                             : "bg-gray-300 text-gray-600 cursor-not-allowed"
//                         }`}
//                       >
//                         Add
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>

//           {/* ITEMS TABLE */}
//           <div className="bg-white shadow rounded-xl p-5 min-h-[200px]">
//             {items.length === 0 ? (
//               <p className="text-center text-gray-500">No items added yet</p>
//             ) : (
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b">
//                     <th>Product</th>
//                     <th>Price</th>
//                     <th>Qty</th>
//                     <th>Total</th>
//                     <th></th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {items.map((item) => (
//                     <tr key={item._id} className="border-b">
//                       <td>{item.name}</td>
//                       <td>₹{item.price}</td>
//                       <td>
//                         <input
//                           type="number"
//                           className="border w-16 px-2 py-1 rounded-lg"
//                           value={item.qty}
//                           min="1"
//                           onChange={(e) => updateQty(item._id, Number(e.target.value))}
//                         />
//                       </td>
//                       <td>₹{(item.qty * item.price).toFixed(2)}</td>
//                       <td>
//                         <button
//                           onClick={() => removeItem(item._id)}
//                           className="text-red-500"
//                         >
//                           ✖
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>

//         {/* ---------------------- RIGHT SUMMARY ---------------------- */}
//         <div className="w-1/4 bg-white shadow rounded-xl p-6 space-y-6">
//           <h2 className="text-xl font-semibold">Bill Summary</h2>

//           <div className="flex justify-between">
//             <span>Subtotal</span>
//             <span>₹{subtotal.toFixed(2)}</span>
//           </div>

//           <div>
//             <label>Discount (%)</label>
//             <input
//               type="number"
//               className="border rounded-lg px-3 py-2 w-full"
//               value={discount}
//               onChange={(e) => setDiscount(Number(e.target.value))}
//             />
//           </div>

//           <div className="flex justify-between">
//             <span>GST (18%)</span>
//             <span>₹{gst.toFixed(2)}</span>
//           </div>

//           <div className="flex justify-between font-bold text-lg">
//             <span>Total</span>
//             <span>₹{total.toFixed(2)}</span>
//           </div>

//           <select
//             className="border rounded-lg px-3 py-2 w-full"
//             value={payment}
//             onChange={(e) => setPayment(e.target.value)}
//           >
//             <option>Cash</option>
//             <option>Card</option>
//             <option>UPI</option>
//           </select>

//           <button
//             onClick={handlePayment}
//             className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
//           >
//             Complete Payment
//           </button>
//         </div>
//       </div>

//       {/* ---------------------- RECENT BILLS ---------------------- */}
//       <div className="mt-5">
//         <h2 className="text-xl font-semibold mb-4">Recent Bills</h2>

//         {bills.length === 0 ? (
//           <p className="text-gray-500">No bills created yet</p>
//         ) : (
//           <div className="space-y-4">
//             {bills.map((b) => (
//               <div
//                 key={b._id}
//                 className="bg-white shadow rounded-xl p-4 flex flex-col gap-3 border"
//               >
//                 {/* Header: Invoice & Paid Status */}
//                 <div className="flex justify-between items-center">
//                   <p className="font-semibold text-lg">{b.invoice}</p>
//                   {/* ALWAYS show Paid in green */}
//                   <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
//                     Paid
//                   </span>
//                 </div>

//                 {/* Customer & Payment Method */}
//                 <div className="flex justify-between text-gray-600">
//                   <span>{b.customerName || "No Name"}</span>
//                   <span>{b.paymentMethod || "Cash"}</span>
//                 </div>

//                 {/* Date & Time */}
//                 <p className="text-gray-400 text-sm">
//                   {new Date(b.createdAt).toLocaleString()}
//                 </p>

//                 {/* Purchased Products */}
//                 <div className="border-t pt-2">
//                   <p className="font-semibold mb-1">Products:</p>
//                   <ul className="list-disc pl-5 text-gray-700 text-sm">
//                     {b.items.map((item) => (
//                       <li key={item._id}>
//                         {item.name} — ₹{item.price} × {item.qty} = ₹
//                         {(item.price * item.qty).toFixed(2)}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 {/* Total Amount */}
//                 <div className="flex justify-end font-bold text-lg mt-2">
//                   <span>Total: ₹{b.total.toFixed(2)}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }









// Admin_Billing_Page.jsx
import React, { useEffect, useState } from "react";

export default function Admin_Billing_Page() {
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [qty, setQty] = useState("");

  const [billItems, setBillItems] = useState([]);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
  });

  const loadProducts = async () => {
    const res = await fetch("http://localhost:5000/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const loadBatches = async (productName) => {
    const res = await fetch(`http://localhost:5000/api/products/batches/${productName}`);
    const data = await res.json();
    setBatches(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const addItemToBill = () => {
    const product = products.find(p => p.name === selectedProduct);
    const batch = batches.find(b => b.batchNumber === selectedBatch);

    if (!product || !batch) return alert("Select valid batch!");

    if (qty > batch.quantity)
      return alert("Not enough stock!");

    const newItem = {
      _id: product._id,
      name: product.name,
      batchNumber: batch.batchNumber,
      price: batch.price,
      qty: Number(qty),
    };

    setBillItems([...billItems, newItem]);
    setQty("");
  };

  const createBill = async () => {
    const payload = {
      invoice: "INV" + Date.now(),
      customerName: customer.name,
      customerPhone: customer.phone,
      items: billItems,
      subtotal: billItems.reduce((a, b) => a + b.price * b.qty, 0),
      discount: 0,
      gst: 0,
      total: billItems.reduce((a, b) => a + b.price * b.qty, 0),
      paymentMethod: "Cash",
    };

    const res = await fetch("http://localhost:5000/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      alert("Bill Created Successfully!");
      setBillItems([]);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="p-6">

      <h2 className="text-xl font-bold mb-4">Create Bill</h2>

      {/* Customer */}
      <div className="mb-4">
        <input
          placeholder="Customer Name"
          className="p-2 border mr-2"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <input
          placeholder="Phone"
          className="p-2 border"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
      </div>

      {/* Product Selection */}
      <div className="flex gap-4 mb-4">
        <select
          className="p-2 border"
          value={selectedProduct}
          onChange={(e) => {
            setSelectedProduct(e.target.value);
            loadBatches(e.target.value);
          }}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p.name}>{p.name}</option>
          ))}
        </select>

        <select
          className="p-2 border"
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
          onClick={addItemToBill}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* Bill Items */}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Batch</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Price</th>
          </tr>
        </thead>
        <tbody>
          {billItems.map((i, index) => (
            <tr key={index}>
              <td className="p-2 border">{i.name}</td>
              <td className="p-2 border">{i.batchNumber}</td>
              <td className="p-2 border">{i.qty}</td>
              <td className="p-2 border">{i.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={createBill}
        className="mt-4 bg-green-600 text-white px-5 py-2 rounded"
      >
        Generate Bill
      </button>

    </div>
  );
}



















