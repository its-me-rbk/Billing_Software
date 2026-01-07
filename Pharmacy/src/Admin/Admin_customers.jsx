
import React, { useEffect, useState } from "react";
import {
  FiPhone,
  FiMail,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { BsPerson } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";
import { MdOutlinePlaylistAddCheck } from "react-icons/md";
import { AiOutlineCalendar } from "react-icons/ai";

import Admin_Add_Customer from "./Admin_Add_Customers";

export default function AdminCustomer() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH CUSTOMERS ---------------- */
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/customers");
      const data = await res.json();

      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADD CUSTOMER ---------------- */
  const handleAddCustomer = async (newCustomer) => {
    try {
      const res = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      fetchCustomers();
      setShowAddModal(false);
      alert("Customer added successfully!");
    } catch (error) {
      console.error("Add customer failed", error);
      alert("Failed to add customer");
    }
  };

  /* ---------------- UPDATE CUSTOMER ---------------- */
  const handleUpdateCustomer = async (updatedCustomer) => {
    if (!editCustomer) return;
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${editCustomer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCustomer),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update customer");
        return;
      }
      fetchCustomers();
      setShowAddModal(false);
      setEditCustomer(null);
      alert("Customer updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update customer");
    }
  };

  /* ---------------- DELETE CUSTOMER ---------------- */
  const handleDeleteCustomer = async (id) => {
    if (!confirm("Delete this customer? This action cannot be undone.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to delete customer");
        return;
      }
      fetchCustomers();
      alert("Customer deleted");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete customer");
    }
  };

  /* ---------------- FILTER ---------------- */
  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---------------- STATS ---------------- */
  const totalCustomers = customers.length;
  const loyaltyMembers = customers.filter((c) => c.loyaltyPoints > 0).length;
  const withPrescriptions = customers.filter((c) => c.notes).length;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-600">
            Manage customer database and loyalty program
          </p>
        </div>

        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow"
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus size={18} />
          Add Customer
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Customers" value={totalCustomers} icon={<BsPerson size={22} />} />
        <StatCard title="Loyalty Members" value={loyaltyMembers} icon={<FaCrown size={22} />} />
        <StatCard title="With Prescriptions" value={withPrescriptions} icon={<MdOutlinePlaylistAddCheck size={22} />} />
        <StatCard title="Visited This Week" value="0" icon={<AiOutlineCalendar size={22} />} />
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-center text-gray-500">Loading customers...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CustomerCard key={c._id} customer={c} onEdit={() => { setEditCustomer(c); setShowAddModal(true); }} onDelete={() => handleDeleteCustomer(c._id)} />
          ))}
        </div>
      )}

      {/* MODAL */}
      {showAddModal && (
        <Admin_Add_Customer
          onClose={() => { setShowAddModal(false); setEditCustomer(null); }}
          onSubmit={editCustomer ? handleUpdateCustomer : handleAddCustomer}
          initialData={editCustomer}
          mode={editCustomer ? "edit" : "add"}
        />
      )}
    </div>
  );
}

/* ---------------- STAT CARD ---------------- */
const StatCard = ({ title, value, icon }) => (
  <div className="flex items-center gap-4 bg-white shadow rounded-xl p-5">
    <div className="p-3 bg-gray-100 rounded-full text-gray-700">{icon}</div>
    <div>
      <p className="text-gray-600">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

/* ---------------- CUSTOMER CARD ---------------- */
const CustomerCard = ({ customer, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 relative border border-gray-100">

      <div className="absolute top-4 right-4 flex gap-3">
        <FiEdit2 onClick={onEdit} className="cursor-pointer text-gray-600 hover:text-blue-600" />
        <FiTrash2 onClick={onDelete} className="cursor-pointer text-gray-600 hover:text-red-600" />
      </div>

      <div className="flex justify-center mb-4">
        <div className="bg-teal-600 text-white p-4 rounded-full">
          <BsPerson size={30} />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-center">{customer.name}</h2>

      <div className="mt-4 space-y-3 text-gray-700">
        <div className="flex items-center gap-3">
          <FiPhone /> <span>{customer.phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <FiMail /> <span>{customer.email || "—"}</span>
        </div>
        <div className="flex items-center gap-3">
          <FiCalendar />
          <span>
            Added on: {new Date(customer.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t pt-4 grid grid-cols-2 text-center">
        <div>
          <p className="text-gray-600">Loyalty Points</p>
          <p className="font-semibold text-teal-700">
            {customer.loyaltyPoints || 0}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Total Purchases</p>
          <p className="font-semibold">₹{customer.totalPurchase}</p>
        </div>
      </div>

      {customer.notes && (
        <div className="mt-5 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-sm flex items-center gap-2">
          <MdOutlinePlaylistAddCheck />
          Has prescription notes
        </div>
      )}
    </div>
  );
};
