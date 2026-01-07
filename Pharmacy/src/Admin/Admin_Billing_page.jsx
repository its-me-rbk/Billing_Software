import React, { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js"; 
import { UPIQR } from '@adityavijay21/upiqr';
import logo from '../assets/logo_c.png'

const API_PRODUCTS = "http://localhost:5000/api/products";
const API_BILLS = "http://localhost:5000/api/bills";
const API_GENERAL_SETTINGS = "http://localhost:5000/api/general-settings/get";
const API_CUSTOMERS = "http://localhost:5000/api/customers";

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function Admin_Billing_Page() {
  const [generalSettings, setGeneralSettings] = useState(null);
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

  // Customers
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const inputClass = "border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition";
  const selectClass = "border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white";
  const smallInputClass = "border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition";
  const primaryBtnClass = "bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700 transition font-medium";
  const ghostBtnClass = "border border-gray-300 text-gray-800 rounded-lg px-3 py-1 hover:bg-gray-100 transition font-medium";
  const subtleBtnClass = "bg-gray-700 text-white rounded-lg px-3 py-1 hover:bg-gray-800 transition font-medium";
  const dangerBtnClass = "border border-red-200 text-red-600 rounded-lg px-3 py-1 hover:bg-red-50 transition font-medium flex items-center gap-1";

  useEffect(() => {
    fetchProducts();
    fetchBills();
    fetchGeneralSettings();
    fetchCustomers();
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
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_PRODUCTS);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(API_CUSTOMERS);
      const data = await res.json();
      // Handle both array and {success,data}
      const list = Array.isArray(data) ? data : (data?.data || []);
      setCustomers(Array.isArray(list) ? list : []);
    } catch {
      setCustomers([]);
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

  const fetchGeneralSettings = async () => {
    try {
      const res = await fetch(API_GENERAL_SETTINGS);
      const data = await res.json();
      setGeneralSettings(data && data.success ? data.data : null);
    } catch {
      setGeneralSettings(null);
    }
  };

  // ---------------------- FILTER PRODUCTS ----------------------
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ---------------------- FILTER CUSTOMERS ----------------------
  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return false;
    return (
      c.name?.toLowerCase().includes(q) ||
      String(c.phone || c.mobile || "").toLowerCase().includes(q)
    );
  });

  const selectCustomer = (c) => {
    setSelectedCustomerId(c._id || c.id || null);
    setCustomer({
      name: c.name || "",
      address: c.address || "",
      phone: c.phone || c.mobile || "",
      email: c.email || "",
    });
    setCustomerSearch(`${c.name}${c.phone ? ` (${c.phone})` : ""}`);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomerId(null);
    setCustomerSearch("");
  };

  const handleSaveNewCustomer = async () => {
    try {
      // Basic validation
      const name = (customer.name || "").trim();
      const phone = String(customer.phone || "").trim();
      const address = (customer.address || "").trim();
      const email = (customer.email || "").trim();

      if (!name || !phone) {
        alert("Please enter customer name and phone number.");
        return;
      }

      // If a customer with same phone exists locally, prefer selecting it
      const existingLocal = customers.find(c => String(c.phone) === phone);
      if (existingLocal) {
        selectCustomer(existingLocal);
        alert("Customer with this phone already exists. Selected existing record.");
        return;
      }

      setSavingCustomer(true);

      const res = await fetch(API_CUSTOMERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, address })
      });

      const data = await res.json();

      if (res.status === 409) {
        // Exists on server; try to select it locally after refreshing list
        await fetchCustomers();
        const match = customers.find(c => String(c.phone) === phone);
        if (match) {
          selectCustomer(match);
        }
        alert(data?.message || "Customer already exists.");
        setSavingCustomer(false);
        return;
      }

      if (!res.ok || !data?.success) {
        alert(data?.message || "Failed to save customer.");
        setSavingCustomer(false);
        return;
      }

      const saved = data.data;
      // Update UI selection and list
      setSelectedCustomerId(saved._id);
      setCustomer({
        name: saved.name || name,
        address: saved.address || address,
        phone: saved.phone || phone,
        email: saved.email || email,
      });
      setCustomerSearch(`${saved.name}${saved.phone ? ` (${saved.phone})` : ""}`);
      await fetchCustomers();
      alert("Customer saved successfully.");
    } catch (err) {
      console.error("Save customer error:", err);
      alert("Unexpected error while saving customer.");
    } finally {
      setSavingCustomer(false);
    }
  };

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
    // Prevent adding expired batch
    if (batch.expiryDate && new Date(batch.expiryDate).getTime() <= Date.now()) {
      return alert("Cannot add expired batch to bill.");
    }
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

  const generateInvoiceNumber = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Filter bills for current MMYY (assumes invoice stored as string)
    const periodBills = bills.filter(bill => {
      if (!bill.invoice) return false;
      const match = bill.invoice.match(/#(\d{2})(\d{2})(\d{4})/);
      return match && match[1] === month && match[2] === year;
    });
    
    // Get highest sequence number (or 0)
    let maxSeq = 0;
    periodBills.forEach(bill => {
      const match = bill.invoice.match(/#(\d{2})(\d{2})(\d{4})/);
      if (match) {
        const seq = parseInt(match[3], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    });
    
    const nextSeq = String(maxSeq + 1).padStart(4, '0');
    return `#${month}${year}${nextSeq}`;
  };

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

    const invoiceNo = generateInvoiceNumber();

    const payload = {
      invoice: invoiceNo,
      customerName: customer.name || "No Name",
      customerAddress: customer.address,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      ...(selectedCustomerId ? { customerId: selectedCustomerId } : {}),
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
      fetchCustomers();
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
      const cgst = itemSubtotal * (item.gst/2/100)
      const sgst = itemSubtotal * (item.gst/2/100)
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
        name: generalSettings.pharmacyName,
        address: generalSettings.address,
        dlNo: generalSettings.licenseNumber,
        gstin: generalSettings.gstNumber,
        contact: generalSettings.phone,
        email: generalSettings.email
      },

      // Customer Details
      customer: {
        name: bill.customerName || "Walk-in Customer",
        phone: bill.customerPhone || "Not Available",
        address: bill.customerAddress || "Address Not Available",
        email: bill.customerEmail || "Not Available"
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
        words: numberToWords(grandTotal)
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
        upi: "greendwarftech@uboi"
      }
    };
  };


  const printBill = async (billId) => {

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

    let dynamicQrUrl = ''; 
    try {
      const { qr } = await new UPIQR()
        .set({ 
          upiId: printData.bank.upi,
          name: printData.business.name,
          amount: Number(printData.summary.grandTotal),
          transactionNote: `Invoice${printData.invoice.number.slice(1)}`
        })
        .generate();
      
      dynamicQrUrl = qr;
    } catch (error) {
      console.error('QR Generation failed:', error);
      // setDynamicQrUrl(''); // Fallback to empty or static QR
    }

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
                  <td>3004XXXX</td>
                  <td>₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
                  <td>${item.qty}</td>
                  <td>${item.gst}%</td>
                  <td>₹${parseFloat(item.subtotal).toLocaleString('en-IN')}</td>
                  <td>₹${parseFloat(item.sgst).toLocaleString('en-IN')}</td>
                  <td>₹${parseFloat(item.cgst).toLocaleString('en-IN')}</td>
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
                  <img src=${dynamicQrUrl} alt="UPI QR" width="100px" height="100px"/>
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
        // win.print();
        // win.close();
      });
    }, 100);
    
  };

  const downloadBill = async (billId, invoice) => {
    const bill = bills.find(b => b._id === billId);
    if (!bill) return;

    const printData = getBillPrintData(bill);

    let dynamicQrUrl = ''; 
    try {
      const { qr } = await new UPIQR()
        .set({ 
          upiId: printData.bank.upi,
          name: printData.business.name,
          amount: Number(printData.summary.grandTotal),
          transactionNote: `Invoice${printData.invoice.number.slice(1)}`
        })
        .generate();
      
      dynamicQrUrl = qr;
    } catch (error) {
      console.error('QR Generation failed:', error);
      // setDynamicQrUrl(''); // Fallback to empty or static QR
    }

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
                <td>3004XXXX</td>
                <td>₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
                <td>${item.qty}</td>
                <td>${item.gst}%</td>
                <td>₹${parseFloat(item.subtotal).toLocaleString('en-IN')}</td>
                <td>₹${parseFloat(item.sgst).toLocaleString('en-IN')}</td>
                <td>₹${parseFloat(item.cgst).toLocaleString('en-IN')}</td>
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
                <img src=${dynamicQrUrl} alt="UPI QR" width="100px" height="100px"/>
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
            {/* Existing customer search */}
            <div className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="Search existing customers by name or phone…"
                className={inputClass}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              {selectedCustomerId && (
                <div className="flex items-center justify-between bg-teal-50 border border-teal-200 text-teal-800 px-3 py-2 rounded">
                  <span className="text-sm">Existing customer selected</span>
                  <button onClick={clearSelectedCustomer} className={ghostBtnClass}>Clear</button>
                </div>
              )}
              {customerSearch && (
                <div className="border rounded-xl p-2 max-h-40 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No matching customers</p>
                  ) : (
                    filteredCustomers.map((c) => (
                      <div key={c._id || c.id}
                           className="flex justify-between items-center py-1 border-b last:border-b-0">
                        <div className="text-sm">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-gray-600">{c.phone || c.mobile || "No phone"}</div>
                          {c.address && <div className="text-gray-500 truncate max-w-[280px]">{c.address}</div>}
                        </div>
                        <button onClick={() => selectCustomer(c)} className={ghostBtnClass}>Use</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                className={inputClass}
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Customer Address"
                className={inputClass}
                value={customer.address}
                onChange={(e) =>
                  setCustomer({ ...customer, address: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Customer Phone Number"
                className={inputClass}
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Customer Email Address"
                className={inputClass}
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveNewCustomer}
                disabled={savingCustomer || !(customer.name && customer.phone)}
                className={`${primaryBtnClass} disabled:opacity-60`}
              >
                {savingCustomer ? "Saving..." : "Save as new customer"}
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">Add Products</h2>
            <input
              type="text"
              placeholder="Search products…"
              className={inputClass + " mb-4"}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
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
                        className={ghostBtnClass}
                      >
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedProduct && (
              <div className="flex gap-4">
                <select
                  className={selectClass}
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="">Select Batch</option>
                  {batches.map((b) => {
                    const isExpired = b.expiryDate ? new Date(b.expiryDate).getTime() <= Date.now() : false;
                    return (
                      <option key={b.batchNumber} value={b.batchNumber} disabled={isExpired}>
                        {b.batchNumber} — Qty: {b.quantity}{isExpired ? ' — Expired' : ''}
                      </option>
                    );
                  })}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  className={`${smallInputClass} w-24`}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />

                <button
                  onClick={addItem}
                  className={primaryBtnClass}
                >
                  Add
                </button>
              </div>
            )}

            {items.length > 0 && (
              <div className="overflow-x-auto mt-4 space-y-3">
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
                      <th className="p-2 border w-[120px]">Remove</th>
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
                        <td className="p-2 border">{`₹${Number(i.price).toFixed(2)}`}</td>
                        <td className="p-2 border">{i.gst}%</td>
                        <td className="p-2 border">{`₹${Number(i.cgst).toFixed(2)}`}</td>
                        <td className="p-2 border">{`₹${Number(i.sgst).toFixed(2)}`}</td>
                        <td className="p-2 border">{(i.total).toFixed(2)}</td>
                        <td className="p-2 border w-[120px]">
                          <button
                            onClick={() => removeItem(i._id, i.batchNumber)}
                            className={`${dangerBtnClass} !px-2`}
                          >
                            <TrashIcon size={14} />
                            <span className="text-sm">Remove</span>
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

        <div className="md:w-1/4 bg-white shadow rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Bill Summary</h2>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <select
            className={selectClass}
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option>Cash</option>
            <option>Card</option>
            <option>UPI</option>
          </select>
          <button
            onClick={handlePayment}
            className={`${primaryBtnClass} w-full`}
          >
            Complete Payment
          </button>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-xl font-semibold mb-4">Recent Bills</h2>
        {bills.length === 0 ? (
          <p className="text-gray-500">No bills created yet</p>
        ) : (
          <div className="space-y-4">
            {bills.map((b) => (
              <div key={b._id} className="bg-white shadow rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">{b.invoice}</p>
                  <div className="flex items-center">
                    <div className="flex gap-2">
                      <button onClick={() => printBill(b._id)} className={subtleBtnClass}>Print</button>
                      <button onClick={() => downloadBill(b._id, b.invoice)} className={primaryBtnClass}>Download</button>
                    </div>
                    <button onClick={async () => {
                      if (!window.confirm('Delete this bill? This will restore stock and adjust customer totals.')) return;
                      try {
                        const res = await fetch(`${API_BILLS}/${b._id}`, { method: 'DELETE' });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || data?.message || 'Delete failed');
                        alert(data?.message || data?.success ? 'Bill deleted' : 'Bill deleted');
                        // Refresh lists
                        fetchProducts();
                        fetchBills();
                        fetchCustomers();
                      } catch (err) {
                        console.error(err);
                        alert('Failed to delete bill');
                      }
                    }} className="ml-6 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium flex items-center gap-1">Delete</button>
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


