
import React, { useState } from "react";
import {
  FiPhone,
  FiMail,
  FiCalendar,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { BsPerson } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";
import { MdOutlinePlaylistAddCheck } from "react-icons/md";
import { AiOutlineCalendar } from "react-icons/ai";
import { FiPlus } from "react-icons/fi";

export default function AdminCustomer() {
  const [searchQuery, setSearchQuery] = useState("");

  const customers = [
    {
      id: 1,
      name: "John Doe",
      phone: "+91 98765 43210",
      email: "john.doe@email.com",
      lastVisit: "2025-01-10",
      loyaltyPoints: 450,
      purchases: 12500,
      hasPrescription: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "+91 98765 43211",
      email: "jane.smith@email.com",
      lastVisit: "2025-01-12",
      loyaltyPoints: 280,
      purchases: 8900,
      hasPrescription: false,
    },
    {
      id: 3,
      name: "Mike Johnson",
      phone: "+91 98765 43212",
      email: "mike.j@email.com",
      lastVisit: "2025-01-14",
      loyaltyPoints: 650,
      purchases: 15600,
      hasPrescription: true,
    },
  ];

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* ------------------ HEADER ------------------ */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-600">
            Manage customer database and loyalty program
          </p>
        </div>

        {/* ⭐ ADD CUSTOMER BUTTON */}
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow"
        >
          <FiPlus size={18} />
          Add Customer
        </button>
      </div>

      {/* ------------------ STATS ------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<BsPerson size={22} />}
          title="Total Customers"
          value="4"
        />
        <StatCard
          icon={<FaCrown size={22} className="text-blue-600" />}
          title="Loyalty Members"
          value="4"
        />
        <StatCard
          icon={<MdOutlinePlaylistAddCheck size={22} className="text-purple-600" />}
          title="With Prescriptions"
          value="2"
        />
        <StatCard
          icon={<AiOutlineCalendar size={22} className="text-orange-600" />}
          title="Visited This Week"
          value="0"
        />
      </div>

      {/* ------------------ SEARCH ------------------ */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ------------------ CUSTOMER LIST ------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <CustomerCard key={c.id} customer={c} />
        ))}
      </div>
    </div>
  );
}

/* ------------------ STAT CARD ------------------ */
const StatCard = ({ icon, title, value }) => (
  <div className="flex items-center gap-4 bg-white shadow rounded-xl p-5">
    <div className="p-3 bg-gray-100 rounded-full text-gray-700">{icon}</div>
    <div>
      <p className="text-gray-600">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

/* ------------------ CUSTOMER CARD ------------------ */
const CustomerCard = ({ customer }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 relative border border-gray-100">
      {/* Top Icons */}
      <div className="absolute top-4 right-4 flex gap-3">
        <FiEdit2 className="cursor-pointer text-gray-600 hover:text-blue-600" />
        <FiTrash2 className="cursor-pointer text-gray-600 hover:text-red-600" />
      </div>

      {/* Profile Icon */}
      <div className="flex justify-center mb-4">
        <div className="bg-teal-600 text-white p-4 rounded-full">
          <BsPerson size={30} />
        </div>
      </div>

      {/* Details */}
      <h2 className="text-lg font-semibold text-center">{customer.name}</h2>

      <div className="mt-4 space-y-3 text-gray-700">

        <div className="flex items-center gap-3">
          <FiPhone /> <span>{customer.phone}</span>
        </div>

        <div className="flex items-center gap-3">
          <FiMail /> <span>{customer.email}</span>
        </div>

        <div className="flex items-center gap-3">
          <FiCalendar /> <span>Last visit: {customer.lastVisit}</span>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 border-t pt-4 grid grid-cols-2 text-center">
        <div>
          <p className="text-gray-600">Loyalty Points</p>
          <p className="font-semibold text-teal-700">{customer.loyaltyPoints}</p>
        </div>

        <div>
          <p className="text-gray-600">Total Purchases</p>
          <p className="font-semibold">₹{customer.purchases}</p>
        </div>
      </div>

      {/* Prescription Tag */}
      {customer.hasPrescription && (
        <div className="mt-5 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-sm flex items-center gap-2">
          <MdOutlinePlaylistAddCheck />
          Has prescription notes
        </div>
      )}
    </div>
  );
};
