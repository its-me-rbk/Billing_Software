import React from "react";
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Package,
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

const salesData = [
  { name: "Mon", sales: 4000, profit: 1200 },
  { name: "Tue", sales: 5000, profit: 1500 },
  { name: "Wed", sales: 3500, profit: 1100 },
  { name: "Thu", sales: 6500, profit: 2000 },
  { name: "Fri", sales: 7200, profit: 2200 },
  { name: "Sat", sales: 8500, profit: 2600 },
  { name: "Sun", sales: 6000, profit: 1800 },
];

const categoryData = [
  { name: "Prescription", value: 35 },
  { name: "OTC", value: 25 },
  { name: "Personal Care", value: 15 },
  { name: "Others", value: 5 },
];

const COLORS = ["#0d9488", "#14b8a6", "#115e59", "#99f6e4"];

const AdminDashboard = () => {
  return (
    <div className="p-6">

      {/* Title */}
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-500">Welcome back! Here’s what’s happening today.</p>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 flex items-center gap-2">
          + Create Bill
        </button>

        <button className="border px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
          🧾 Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">

        {/* Total Sales */}
        <Card
          icon={<DollarSign className="text-white" />}
          bg="bg-teal-600"
          title="Total Sales"
          value="₹45,231"
          percent="+12.5%"
          positive={true}
        />

        {/* Pending Bills */}
        <Card
          icon={<ShoppingCart className="text-white" />}
          bg="bg-blue-600"
          title="Pending Bills"
          value="23"
          percent="-5.2%"
          positive={false}
        />

        {/* Low Stock Items */}
        <Card
          icon={<AlertTriangle className="text-white" />}
          bg="bg-orange-600"
          title="Low Stock Items"
          value="12"
          percent="+3"
          positive={true}
        />

        {/* Expiring Soon */}
        <Card
          icon={<Clock className="text-white" />}
          bg="bg-red-600"
          title="Expiring Soon"
          value="8"
          percent="+2"
          positive={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* Sales Overview */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold">Sales Overview</h2>
              <p className="text-gray-500 text-sm">Weekly sales and profit trends</p>
            </div>
            <TrendingUp className="text-teal-600" />
          </div>

          <LineChart width={500} height={260} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={3} />
            <Line type="monotone" dataKey="profit" stroke="#14b8a6" strokeWidth={3} />
          </LineChart>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold">Sales by Category</h2>
              <p className="text-gray-500 text-sm">Product category breakdown</p>
            </div>
            <Package className="text-teal-600" />
          </div>

          <PieChart width={400} height={260}>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              fill="#0d9488"
              dataKey="value"
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



// Reusable Card Component
const Card = ({ icon, bg, title, value, percent, positive }) => (
  <div className="bg-white rounded-xl shadow p-5 flex gap-4 items-start">

    <div className={`${bg} p-3 rounded-xl text-white`}>
      {icon}
    </div>

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
