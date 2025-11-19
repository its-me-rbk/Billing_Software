import React from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// WEEKLY BILLING TREND (Dummy Data)
const salesData = [
  { name: "Mon", sales: 3200 },
  { name: "Tue", sales: 4100 },
  { name: "Wed", sales: 3000 },
  { name: "Thu", sales: 5500 },
  { name: "Fri", sales: 6000 },
  { name: "Sat", sales: 7200 },
  { name: "Sun", sales: 4800 },
];

// BILL TYPE DISTRIBUTION
const billingCategory = [
  { name: "Prescription", value: 45 },
  { name: "OTC", value: 30 },
  { name: "General", value: 15 },
  { name: "Others", value: 10 },
];

const COLORS = ["#0d9488", "#14b8a6", "#115e59", "#99f6e4"];

const CashierDashboard = () => {
  return (
    <div className="p-6">

      {/* Title */}
      <h1 className="text-2xl font-semibold">Cashier Dashboard</h1>
      <p className="text-gray-500">Quick overview of today’s performance.</p>

      {/* Top Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 flex items-center gap-2">
          + New Bill
        </button>
        <button className="border px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
          🧾 Today Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">

        <Card
          icon={<DollarSign className="text-white" />}
          bg="bg-teal-600"
          title="Today's Sales"
          value="₹12,540"
          percent="+8.4%"
          positive={true}
        />

        <Card
          icon={<ShoppingCart className="text-white" />}
          bg="bg-blue-600"
          title="Pending Bills"
          value="7"
          percent="-2%"
          positive={false}
        />

        <Card
          icon={<Users className="text-white" />}
          bg="bg-purple-600"
          title="Total Customers Today"
          value="156"
          percent="+4.3%"
          positive={true}
        />

        <Card
          icon={<FileText className="text-white" />}
          bg="bg-orange-500"
          title="Fast-Moving Items"
          value="14"
          percent="+3"
          positive={true}
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold">Weekly Billing Trend</h2>
              <p className="text-gray-500 text-sm">Daily total bill amounts</p>
            </div>
            <TrendingUp className="text-teal-600" />
          </div>

          <LineChart width={500} height={260} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#0d9488"
              strokeWidth={3}
            />
          </LineChart>
        </div>

        {/* Billing Category Pie Chart */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold">Billing Categories</h2>
              <p className="text-gray-500 text-sm">Today's bill distribution</p>
            </div>
            <FileText className="text-teal-600" />
          </div>

          <PieChart width={400} height={260}>
            <Pie
              data={billingCategory}
              cx="50%"
              cy="50%"
              outerRadius={90}
              fill="#0d9488"
              dataKey="value"
              label
            >
              {billingCategory.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;

// Reusable Card component
const Card = ({ icon, bg, title, value, percent, positive }) => (
  <div className="bg-white rounded-xl shadow p-5 flex gap-4 items-start">
    <div className={`${bg} p-3 rounded-xl text-white`}>{icon}</div>

    <div className="flex flex-col w-full">
      <div className="flex justify-between">
        <p className="font-medium">{title}</p>

        <span
          className={`px-2 py-1 rounded-full text-sm ${
            positive
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
          {percent}
        </span>
      </div>

      <h3 className="text-xl font-semibold mt-2">{value}</h3>
    </div>
  </div>
);
