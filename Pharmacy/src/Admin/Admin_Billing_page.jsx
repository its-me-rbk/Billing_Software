

import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js"; 
import logo from '../assets/logo_c.png'

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

  const [logoSrc, setLogoSrc] = useState('');

  
  useEffect(() => {
    fetchProducts();
    fetchBills();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      setLogoSrc(canvas.toDataURL('image/png'));
    };
    img.src = logo;
  })

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
          gst: batch.gst,
          batchNumber: batch.batchNumber,
          price: batch.price,
          cgst: batch.price*Number(qty)*(batch.gst/100)/2,
          sgst: batch.price*Number(qty)*(batch.gst/100)/2,
          qty: Number(qty),
          total: (batch.price*((1+batch.gst/100)))*Number(qty),
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
  const gst = items.reduce((sum,i)=> sum + i.cgst + i.sgst, 0);
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
      customerAddress: customer.address,
      customerPhone: customer.phone,
      customerEmail: customer.email,
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
      setCustomer({ name: "", address: "", phone: "" , email: ""});
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

// Add this function inside your component to create bill print data
const getBillPrintData = (bill) => {

   /* ================= NUMBER TO WORDS (INDIAN) ================= */
  const numberToWords = (num) => {
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
      "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
      "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
      if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
      return "";
    };

    return inWords(Math.floor(num)) + " Rupees Only";
  };

  // Calculate accurate totals from items
  const itemsWithTaxes = bill.items.map(item => {
    const itemSubtotal = item.price * item.qty;
    const cgst = itemSubtotal * (item.gst/2)
    const sgst = itemSubtotal * (item.gst/2)
    const gst = item.gst
    
    return {
      ...item,
      subtotal: itemSubtotal,
      gst: gst,
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      total: (itemSubtotal + cgst + sgst).toFixed(2)
    };
  });

  // Overall calculations
  const grandSubtotal = bill.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalGst = itemsWithTaxes.reduce((sum, item) => sum + (parseFloat(item.cgst) + parseFloat(item.sgst)), 0);
  const grandTotal = parseFloat(bill.total.toFixed(2));

  return {
    // Invoice Details
    invoice: {
      number: bill.invoice,
      date: new Date(bill.createdAt).toLocaleDateString('en-IN'),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN') // 7 days from now
    },

    // Business Details (Update these with your actual info)
    business: {
      name: "Vendharaa Pharmaceuticals",
      address: "Your Business Address, Dharmapuri",
      dlNo: "ABCD19813",
      gstin: "87239N09386F",
      contact: "+91 94429 59826",
      email: "vendharaapharmaceuticals@gmail.com"
    },

    // Customer Details
    customer: {
      name: bill.customerName || "Walk-in Customer",
      phone: bill.customerPhone || "Not Available",
      address: bill.customerAddress || "Address Not Available", // Add if available
      email: bill.customerEmail || "Not Available" // Add if available
    },

    // Items with tax breakdown
    items: itemsWithTaxes,

    // Summary Calculations
    summary: {
      subtotal: grandSubtotal.toFixed(2),
      discount: bill.discount || 0,
      discountAmount: ((grandSubtotal * (bill.discount || 0)) / 100).toFixed(2),
      taxableAmount: (grandSubtotal - ((grandSubtotal * (bill.discount || 0)) / 100)).toFixed(2),
      cgstTotal: (totalGst / 2).toFixed(2),
      sgstTotal: (totalGst / 2).toFixed(2),
      totalGst: totalGst.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    },

    // Payment Details
    payment: {
      method: bill.paymentMethod || "Cash",
      amount: grandTotal.toFixed(2),
      status: bill.paid ? "Paid" : "Pending"
    },

    // Formatted amounts for display
    formatted: {
      subtotal: grandSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      grandTotal: grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      words: numberToWords(grandTotal) // Use your existing numberToWords function
    },

    // Additional info
    placeOfSupply: "Dharmapuri",
    countryOfSupply: "India",
    terms: [
      "Goods once sold will not be taken back",
      "Please verify items before leaving counter"
    ],

    // Bank Details (Update with actual info)
    bank: {
      accountHolder: "Vendharaa Pharmaceuticals",
      accountNumber: "XXXXXXX",
      ifsc: "XXXXXXXX",
      accountType: "Current",
      bankName: "Bank Name",
      upi: "vendharaa-upi@upi"
    }
  };
};


const printBill = (billId) => {

  const bill = bills.find(b => b._id === billId);
  if (!bill) return;

  const printData = getBillPrintData(bill);
  const content = document.getElementById(`print-${billId}`);

  /* ================= TOTAL CALCULATION (FIXED) ================= */
  let totalAmount = 0;

  content.querySelectorAll("tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length > 0) {
      const amountText = cells[cells.length - 1].innerText;
      const value = amountText.replace(/[₹,]/g, "").trim();
      totalAmount += Number(value) || 0;
    }
  });

  const win = window.open("", "", "width=900,height=1000");

win.document.write(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vendharaa Invoice ${printData.invoice.number}</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: "Helvetica Neue", Arial, sans-serif;
      }

      body {
        background: #f5f5f5;
        padding: 20px;
      }

      .invoice-wrapper {
        max-width: 900px;
        margin: 0 auto;
        background: #ffffff;
        padding: 30px 40px;
      }

      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
      }

      .invoice-title {
        font-size: 26px;
        font-weight: 600;
      }

      .invoice-meta {
        margin-top: 10px;
        font-size: 13px;
        color: #555;
        line-height: 1.5;
      }

      .logo {
        text-align: right;
      }

      .logo span {
        display: block;
        font-size: 26px;
        font-weight: 700;
        color: #2d7fd0;
      }

      .logo small {
        font-size: 14px;
        color: #4a4a4a;
      }

      .top-boxes {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
      }

      .card {
        flex: 1;
        background: #f5f5f5;
        padding: 18px 20px;
        border-radius: 4px;
        font-size: 13px;
      }

      .card-title {
        font-weight: 600;
        margin-bottom: 10px;
        font-size: 14px;
      }

      .label {
        font-weight: 600;
        margin-top: 4px;
      }
      .label span {
        font-weight: 500;
        margin-top: 4px;
      }

      .sub-header {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin: 10px 2px 18px;
        color: #777;
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      .items-table thead {
        background: #333333;
        color: #ffffff;
      }

      .items-table th,
      .items-table td {
        padding: 10px 8px;
      }

      .items-table th {
        font-weight: 500;
        text-align: left;
      }

      .items-table tbody td {
        border-bottom: 1px solid #e0e0e0;
        height: 40px;
      }

      /* Bottom section: use grid */
      .bottom-section {
        display: grid;
        grid-template-columns: 2fr 1.5fr;
        gap: 40px;
        margin-top: 40px;
        align-items: flex-start;
      }

      .bank-details {
        font-size: 13px;
        display: grid;
        grid-template-columns: 1fr 120px; /* left text, right QR */
        column-gap: 20px;
        align-items: start;
      }

      .bank-left {
        /* left column with text */
      }

      .bank-details h3 {
        font-size: 14px;
        margin-bottom: 10px;
      }

      .bank-details .label {
        margin-top: 6px;
      }

      .upi-qr-wrapper {
        justify-self: end;      /* push QR to right side of its grid cell */
        align-self: start;      /* align with top of bank details */
        text-align: center;
        font-size: 12px;
        color: #777;
      }

      .upi-caption {
        margin-bottom: 6px;
      }

      .square-box {
        width: 110px;
        height: 110px;
        background: #222;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        text-align: center;
        border-radius: 4px;
      }

      .terms {
        margin-top: 25px;
        font-size: 12px;
        grid-column: 1 / -1; /* span both columns under bank + QR */
      }

      .terms .label {
        margin-bottom: 6px;
      }

      .amount-summary {
        font-size: 13px;
      }

      .amount-summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }

      .amount-summary-row.total {
        font-size: 20px;
        font-weight: 700;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid #e0e0e0;
      }

      .amount-summary-row.total span:last-child {
        font-size: 22px;
      }

      .amount-summary h3 {
        font-size: 18px;
        margin-bottom: 12px;
      }

      .invoice-words {
        margin-top: 14px;
        font-size: 11px;
        color: #777;
      }

      .footer {
        margin-top: 30px;
        font-size: 11px;
        color: #777;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .qr-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        font-size: 11px;
      }

      @media print {
        body {
          background: #ffffff;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
        }
        .invoice-wrapper {
          box-shadow: none;
          border: none;
          margin: 0;
          max-width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="invoice-wrapper">
      <!-- Header -->
      <div class="invoice-header">
        <div>
          <div class="invoice-title">Invoice</div>
          <div class="invoice-meta">
            Invoice: ${printData.invoice.number}<br />
            Invoice Date: ${printData.invoice.date}<br />
            Due Date: ${printData.invoice.dueDate}
          </div>
        </div>
        <div class="logo">
          <br/>
          ${logoSrc ? `<img src="${logoSrc}" style="max-height: 70px;" alt="Vendharaa Logo">` : ''}
        </div>
      </div>

      <!-- Billed by / Billed to -->
      <div class="top-boxes">
        <div class="card">
          <div class="card-title">Billed By</div>
          <div class="label">${printData.business.name}</div>
          ${printData.business.address}<br />
          <div class="label">DL No: <span>${printData.business.dlNo}</span></div>
          <div class="label">GSTIN: <span>${printData.business.gstin}</span></div>
          <div class="label">Contact No: <span>${printData.business.contact}</span></div>
          <div class="label">Email Id: <span>${printData.business.email}</span></div>
        </div>
        <div class="card">
          <div class="card-title">Billed To</div>
          <div class="label">${printData.customer.name}</div>
          ${printData.customer.address}<br />
          <div class="label">Contact No: <span>${printData.customer.phone}</span></div>
          <div class="label">Email Id: <span>${printData.customer.email}<span/></div>
        </div>
      </div>

      <div class="sub-header">
        <span>Place of Supply: ${printData.placeOfSupply}</span>
        <span>Country of supply: ${printData.countryOfSupply}</span>
      </div>

      <!-- Items table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Item Name & Batch</th>
            <th>HSN</th>
            <th>Price</th>
            <th>QTY</th>
            <th>GST</th>
            <th>Taxable Amount</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${printData.items.map(item => `
            <tr>
              <td>${item.name}<br/><small>#${item.batchNumber}</small></td>
              <td>3004XXXX</td> <!-- Update with actual HSN -->
              <td>₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
              <td>${item.qty}</td>
              <td>${item.gst}%</td>
              <td>₹${parseFloat(item.subtotal).toLocaleString('en-IN')}</td>
              <td>₹${(item.sgst)/100}</td>
              <td>₹${(item.cgst)/100}</td>
              <td>₹${item.total}</td>
            </tr>
          `).join('')}
          </tbody>
      </table>

      <!-- Bottom section with grid -->
      <div class="bottom-section">
        <!-- Bank & payment details + UPI QR -->
        <div class="bank-details">
          <div class="bank-left">
            <h3>Bank &amp; Payment Details</h3>
            <div class="label">Account Holder Name: <span>${printData.bank.accountHolder}</span></div>
            <div class="label">Account Number: <span>${printData.bank.accountNumber}</span></div>
            <div class="label">IFSC: <span>${printData.bank.ifsc}</span></div>
            <div class="label">Account Type: <span>${printData.bank.accountType}</span></div>
            <div class="label">Bank: <span>${printData.bank.bankName}</span></div>
            <div class="label">UPI: <span>${printData.bank.upi}</span></div>
          </div>

          <div class="upi-qr-wrapper">
            <div class="upi-caption">UPI - Scan To Pay</div>
            <div class="square-box">
              <!-- Replace with your QR image -->
              Static UPI Scanner<br />image
            </div>
          </div>

          <div class="terms">
            <div class="label">Terms and Conditions</div>
            1.<br />
            2.
          </div>
        </div>

        <!-- Amount summary -->
        <div class="amount-summary">
          <h3>Summary</h3>
          <div class="amount-summary-row">
            <span>Sub Total</span>
            <span>₹${printData.summary.subtotal}</span>
          </div>
          <div class="amount-summary-row">
            <span>Discount (${printData.summary.discount}%)</span>
            <span>₹${printData.summary.discountAmount}</span>
          </div>
          <div class="amount-summary-row">
            <span>Taxable Amount</span>
            <span>₹${printData.summary.taxableAmount}</span>
          </div>
          <div class="amount-summary-row">
            <span>CGST</span>
            <span>₹${printData.summary.cgstTotal}</span>
          </div>
          <div class="amount-summary-row">
            <span>SGST</span>
            <span>₹${printData.summary.sgstTotal}</span>
          </div>

          <div class="amount-summary-row total">
            <span>Total</span>
            <span>₹${printData.summary.grandTotal}</span>
          </div>

          <div class="invoice-words">
            Invoice Total (In Words):<br />
            ${printData.formatted.words}
          </div>
        </div>
      </div>

      <!-- Footer with QR for detailed invoice -->
      <div class="footer">
        <div>
          For any enquiries, email us on ${printData.business.email}<br />
          or call us on ${printData.business.contact}
        </div>
        <div class="qr-box">
          <span>Scan To View<br />Detailed Invoice</span>
          <div class="square-box">QR Image</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `);

  win.document.close();
  win.focus();

  // Delay for image rendering
  setTimeout(() => {
    requestAnimationFrame(() => {
      win.print();
      win.close();
    });
  }, 100);
  
};

  const downloadBill = (billId, invoice) => {
  const bill = bills.find(b => b._id === billId);
  if (!bill) return;

  const printData = getBillPrintData(bill);

  // Create a VISIBLE temp container (will be removed after download)
  const container = document.createElement('div');
  container.id = 'pdf-container';
  container.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 794px;  /* Exact A4 width */
    height: auto;
    background: white;
    z-index: 999999;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
  `;
  
  // COMPLETE HTML WITH PDF-OPTIMIZED CSS
  container.innerHTML = `
      <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vendharaa Invoice ${printData.invoice.number}</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: "Helvetica Neue", Arial, sans-serif;
      }

      body {
        background: #f5f5f5;
        padding: 20px;
      }

      .invoice-wrapper {
        max-width: 900px;
        margin: 0 auto;
        background: #ffffff;
        padding: 30px 40px;
      }

      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
      }

      .invoice-title {
        font-size: 26px;
        font-weight: 600;
      }

      .invoice-meta {
        margin-top: 10px;
        font-size: 13px;
        color: #555;
        line-height: 1.5;
      }

      .logo {
        text-align: right;
      }

      .logo span {
        display: block;
        font-size: 26px;
        font-weight: 700;
        color: #2d7fd0;
      }

      .logo small {
        font-size: 14px;
        color: #4a4a4a;
      }

      .top-boxes {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
      }

      .card {
        flex: 1;
        background: #f5f5f5;
        padding: 18px 20px;
        border-radius: 4px;
        font-size: 13px;
      }

      .card-title {
        font-weight: 600;
        margin-bottom: 10px;
        font-size: 14px;
      }

      .label {
        font-weight: 600;
        margin-top: 4px;
      }
      .label span {
        font-weight: 500;
        margin-top: 4px;
      }

      .sub-header {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin: 10px 2px 18px;
        color: #777;
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      .items-table thead {
        background: #333333;
        color: #ffffff;
      }

      .items-table th,
      .items-table td {
        padding: 10px 8px;
      }

      .items-table th {
        font-weight: 500;
        text-align: left;
      }

      .items-table tbody td {
        border-bottom: 1px solid #e0e0e0;
        height: 40px;
      }

      /* Bottom section: use grid */
      .bottom-section {
        display: grid;
        grid-template-columns: 2fr 1.5fr;
        gap: 40px;
        margin-top: 40px;
        align-items: flex-start;
      }

      .bank-details {
        font-size: 13px;
        display: grid;
        grid-template-columns: 1fr 120px; /* left text, right QR */
        column-gap: 20px;
        align-items: start;
      }

      .bank-left {
        /* left column with text */
      }

      .bank-details h3 {
        font-size: 14px;
        margin-bottom: 10px;
      }

      .bank-details .label {
        margin-top: 6px;
      }

      .upi-qr-wrapper {
        justify-self: end;      /* push QR to right side of its grid cell */
        align-self: start;      /* align with top of bank details */
        text-align: center;
        font-size: 12px;
        color: #777;
      }

      .upi-caption {
        margin-bottom: 6px;
      }

      .square-box {
        width: 110px;
        height: 110px;
        background: #222;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        text-align: center;
        border-radius: 4px;
      }

      .terms {
        margin-top: 25px;
        font-size: 12px;
        grid-column: 1 / -1; /* span both columns under bank + QR */
      }

      .terms .label {
        margin-bottom: 6px;
      }

      .amount-summary {
        font-size: 13px;
      }

      .amount-summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }

      .amount-summary-row.total {
        font-size: 20px;
        font-weight: 700;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid #e0e0e0;
      }

      .amount-summary-row.total span:last-child {
        font-size: 22px;
      }

      .amount-summary h3 {
        font-size: 18px;
        margin-bottom: 12px;
      }

      .invoice-words {
        margin-top: 14px;
        font-size: 11px;
        color: #777;
      }

      .footer {
        margin-top: 30px;
        font-size: 11px;
        color: #777;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .qr-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        font-size: 11px;
      }

      @media print {
        body {
          background: #ffffff;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
        }
        .invoice-wrapper {
          box-shadow: none;
          border: none;
          margin: 0;
          max-width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="invoice-wrapper">
      <!-- Header -->
      <div class="invoice-header">
        <div>
          <div class="invoice-title">Invoice</div>
          <div class="invoice-meta">
            Invoice: ${printData.invoice.number}<br />
            Invoice Date: ${printData.invoice.date}<br />
            Due Date: ${printData.invoice.dueDate}
          </div>
        </div>
        <div class="logo">
          <br/>
          ${logoSrc ? `<img src="${logoSrc}" style="max-height: 70px;" alt="Vendharaa Logo">` : ''}
        </div>
      </div>

      <!-- Billed by / Billed to -->
      <div class="top-boxes">
        <div class="card">
          <div class="card-title">Billed By</div>
          <div class="label">${printData.business.name}</div>
          ${printData.business.address}<br />
          <div class="label">DL No: <span>${printData.business.dlNo}</span></div>
          <div class="label">GSTIN: <span>${printData.business.gstin}</span></div>
          <div class="label">Contact No: <span>${printData.business.contact}</span></div>
          <div class="label">Email Id: <span>${printData.business.email}</span></div>
        </div>
        <div class="card">
          <div class="card-title">Billed To</div>
          <div class="label">${printData.customer.name}</div>
          ${printData.customer.address}<br />
          <div class="label">Contact No: <span>${printData.customer.phone}</span></div>
          <div class="label">Email Id: <span>${printData.customer.email}<span/></div>
        </div>
      </div>

      <div class="sub-header">
        <span>Place of Supply: ${printData.placeOfSupply}</span>
        <span>Country of supply: ${printData.countryOfSupply}</span>
      </div>

      <!-- Items table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Item Name & Batch</th>
            <th>HSN</th>
            <th>Price</th>
            <th>QTY</th>
            <th>GST</th>
            <th>Taxable Amount</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${printData.items.map(item => `
            <tr>
              <td>${item.name}<br/><small>#${item.batchNumber}</small></td>
              <td>3004XXXX</td> <!-- Update with actual HSN -->
              <td>₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
              <td>${item.qty}</td>
              <td>${item.gst}%</td>
              <td>₹${parseFloat(item.subtotal).toLocaleString('en-IN')}</td>
              <td>₹${(item.sgst)/100}</td>
              <td>₹${(item.cgst)/100}</td>
              <td>₹${item.total}</td>
            </tr>
          `).join('')}
          </tbody>
      </table>

      <!-- Bottom section with grid -->
      <div class="bottom-section">
        <!-- Bank & payment details + UPI QR -->
        <div class="bank-details">
          <div class="bank-left">
            <h3>Bank &amp; Payment Details</h3>
            <div class="label">Account Holder Name: <span>${printData.bank.accountHolder}</span></div>
            <div class="label">Account Number: <span>${printData.bank.accountNumber}</span></div>
            <div class="label">IFSC: <span>${printData.bank.ifsc}</span></div>
            <div class="label">Account Type: <span>${printData.bank.accountType}</span></div>
            <div class="label">Bank: <span>${printData.bank.bankName}</span></div>
            <div class="label">UPI: <span>${printData.bank.upi}</span></div>
          </div>

          <div class="upi-qr-wrapper">
            <div class="upi-caption">UPI - Scan To Pay</div>
            <div class="square-box">
              <!-- Replace with your QR image -->
              Static UPI Scanner<br />image
            </div>
          </div>

          <div class="terms">
            <div class="label">Terms and Conditions</div>
            1.<br />
            2.
          </div>
        </div>

        <!-- Amount summary -->
        <div class="amount-summary">
          <h3>Summary</h3>
          <div class="amount-summary-row">
            <span>Sub Total</span>
            <span>₹${printData.summary.subtotal}</span>
          </div>
          <div class="amount-summary-row">
            <span>Discount (${printData.summary.discount}%)</span>
            <span>₹${printData.summary.discountAmount}</span>
          </div>
          <div class="amount-summary-row">
            <span>Taxable Amount</span>
            <span>₹${printData.summary.taxableAmount}</span>
          </div>
          <div class="amount-summary-row">
            <span>CGST</span>
            <span>₹${printData.summary.cgstTotal}</span>
          </div>
          <div class="amount-summary-row">
            <span>SGST</span>
            <span>₹${printData.summary.sgstTotal}</span>
          </div>

          <div class="amount-summary-row total">
            <span>Total</span>
            <span>₹${printData.summary.grandTotal}</span>
          </div>

          <div class="invoice-words">
            Invoice Total (In Words):<br />
            ${printData.formatted.words}
          </div>
        </div>
      </div>

      <!-- Footer with QR for detailed invoice -->
      <div class="footer">
        <div>
          For any enquiries, email us on ${printData.business.email}<br />
          or call us on ${printData.business.contact}
        </div>
        <div class="qr-box">
          <span>Scan To View<br />Detailed Invoice</span>
          <div class="square-box">QR Image</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  document.body.appendChild(container);

  // Generate PDF immediately (no delay needed for visible container)
  html2pdf()
    .set({
      filename: `${invoice}.pdf`,
      margin: [0, 0, 0, 0],
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        width: 794,  // A4 width in pixels at 96dpi
        height: 1123 // A4 height in pixels at 96dpi
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    })
    .from(container)
    .save()
    .then(() => {
      document.body.removeChild(container);
    })
    .catch(err => {
      console.error('PDF Error:', err);
      document.body.removeChild(container);
    });
};

  return (
    <div className="w-full min-h-screen p-6 flex flex-col gap-8">
     
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
                placeholder="Customer Address"
                className="border rounded-lg px-3 py-2 w-full"
                value={customer.address}
                onChange={(e) =>
                  setCustomer({ ...customer, address: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Customer Phone Number"
                className="border rounded-lg px-3 py-2 w-full"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Customer Email Address"
                className="border rounded-lg px-3 py-2 w-full"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
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
                      <th className="p-2 border">HSN</th>
                      <th className="p-2 border">Qty</th>
                      <th className="p-2 border">Price</th>
                      <th className="p-2 border">GST</th>
                      <th className="p-2 border">CGST</th>
                      <th className="p-2 border">SGST</th>
                      <th className="p-2 border">Total</th>
                      <th className="p-2 border">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={`${i._id}-${i.batchNumber}`}>
                        <td className="p-2 border">{i.name}</td>
                        <td className="p-2 border">{i.batchNumber}</td>
                        <td className="p-2 border">{i.hsn || "N/A"}</td>
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
                        <td className="p-2 border">{i.gst}</td>
                        <td className="p-2 border">{i.cgst}</td>
                        <td className="p-2 border">{i.sgst}</td>
                        <td className="p-2 border">{(i.total).toFixed(2)}</td>
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
          {/* <div>
            <label>Discount (%)</label>
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-full"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div> */}
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
                className="bg-white shadow rounded-xl p-4 flex flex-col gap-3"
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
                  <span>Customer Name: {b.customerName || "No Name"}<br/> Customer Address: {b.customerAddress || "Not Available"}<br/> Customer Phone Number: {b.customerPhone || "Not Available"}<br/> Customer E-Mail Address: {b.customerEmail || "Not Available"}</span>
                  <span>{b.paymentMethod || "Cash"}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  {new Date(b.createdAt).toLocaleString()}
                </p>
                <div className="border-t pt-2">
                  <p className="font-semibold mb-1">Products:</p>
                  <div className="overflow-hidden border rounded-sm text-sm text-gray-700">
                    <table className="w-full min-w-[200px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-1.5 text-left font-medium text-xs">Item Name & Batch</th>
                          <th className="p-1.5 text-center text-xs font-medium">HSN</th>
                          <th className="p-1.5 text-center text-xs font-medium">Price</th>
                          <th className="p-1.5 text-center text-xs font-medium">Qty</th>
                          <th className="p-1.5 text-center text-xs font-medium">GST</th>
                          <th className="p-1.5 text-center text-xs font-medium">Taxable Amount</th>
                          <th className="p-1.5 text-center text-xs font-medium">SGST</th>
                          <th className="p-1.5 text-center text-xs font-medium">CGST</th>
                          <th className="p-1.5 text-right text-xs font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.items.map((item) => (
                          <tr key={`${item._id}-${item.batchNumber}`} className="border-t border-gray-100 last:border-b-0">
                            <td className="p-1.5 font-medium max-w-[120px] truncate">{item.name}
                              {item.batchNumber && (
                                <div className="text-xs text-gray-500 font-normal">#{item.batchNumber}</div>
                              )}
                            </td>
                            <td className="p-1.5 text-center text-xs">{item.hsn || "N/A"}</td>
                            <td className="p-1.5 text-center text-xs">₹{item.price.toFixed(0)}</td>
                            <td className="p-1.5 text-center text-xs">{item.qty}</td>
                            <td className="p-1.5 text-center text-xs">{item.gst}%</td>
                            <td className="p-1.5 text-center text-xs">₹{(item.price*item.qty).toFixed(2)}</td>
                            <td className="p-1.5 text-center text-xs">₹{((item.price*item.qty)*((item.gst/100)/2)).toFixed(2)}</td>
                            <td className="p-1.5 text-center text-xs">₹{((item.price*item.qty)*((item.gst/100)/2)).toFixed(2)}</td>
                            <td className="p-1.5 text-right font-medium text-xs">₹{((item.price*((1+item.gst/100)))*item.qty).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex flex-col items-end font-bold text-lg mt-2 space-y-1">
                  <span>Sub Total: ₹{b.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span>Discount ({b.discount}%): ₹{b.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span>SGST: ₹{(b.gst/2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span>CGST: ₹{(b.gst/2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span>Total: ₹{b.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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


