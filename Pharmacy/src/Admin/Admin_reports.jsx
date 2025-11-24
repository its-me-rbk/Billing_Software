
import React from "react";
import {
  FileDown,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  BarChart,
} from "lucide-react";

export default function AdminReport() {
  return (
    <div className="p-6">
      {/* -------------------------------- HEADER -------------------------------- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <p className="text-gray-500">Generate insights and export reports</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
            <FileDown size={18} />
            Export PDF
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700">
            <FileText size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {/* --------------------------- FILTER BOX --------------------------- */}
      <div className="bg-white p-5 rounded-xl shadow-sm border mb-8">
        <div className="grid grid-cols-3 gap-6 text-sm">
          {/* Report Type */}
          <div>
            <label className="font-semibold">Report Type</label>
            <select className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none">
              <option>Sales Report</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="font-semibold">Date Range</label>
            <select className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none">
              <option>Last Month</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="font-semibold">Export Format</label>
            <select className="w-full mt-1 p-3 border rounded-lg bg-gray-50 outline-none">
              <option>PDF</option>
            </select>
          </div>
        </div>
      </div>

      {/* --------------------------- STAT CARDS --------------------------- */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<DollarSign className="w-7 h-7 text-emerald-500" />}
          title="Total Revenue"
          value="₹3,28,000"
          change="+18.2%"
        />

        <StatCard
          icon={<TrendingUp className="w-7 h-7 text-green-600" />}
          title="Net Profit"
          value="₹94,500"
          change="+12.5%"
        />

        <StatCard
          icon={<Package className="w-7 h-7 text-blue-600" />}
          title="Items Sold"
          value="12,890"
          change="+8.7%"
        />

        <StatCard
          icon={<BarChart3 className="w-7 h-7 text-orange-500" />}
          title="Avg. Order Value"
          value="₹1,245"
          change="+5.3%"
        />
      </div>

      {/* --------------------------- CHARTS SECTION --------------------------- */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold">Sales & Profit Trend</h2>
              <p className="text-gray-500 text-sm">Monthly performance overview</p>
            </div>
            <Calendar size={20} className="text-gray-600" />
          </div>

          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>📊 Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold">Category-wise Sales</h2>
              <p className="text-gray-500 text-sm">Revenue distribution</p>
            </div>
            <BarChart size={20} className="text-gray-600" />
          </div>

          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>🟢 Pie Chart Placeholder</p>
          </div>
        </div>
      </div>

      {/* ---------------- TOP PERFORMING PRODUCTS TABLE ---------------- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-10">
        <h2 className="text-xl font-semibold mb-4">Top Performing Products</h2>
        <p className="text-gray-500 mb-4">Best-selling medicines & items</p>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">Product Name</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">Quantity Sold</th>
              <th className="p-3">Growth (%)</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            <tr className="border-b">
              <td className="p-3">Paracetamol 650mg</td>
              <td className="p-3">₹52,000</td>
              <td className="p-3">1,240</td>
              <td className="p-3 text-green-600 font-medium">+12.4%</td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Vitamin D3 Tablets</td>
              <td className="p-3">₹38,500</td>
              <td className="p-3">940</td>
              <td className="p-3 text-green-600 font-medium">+9.8%</td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Cetirizine 10mg</td>
              <td className="p-3">₹29,000</td>
              <td className="p-3">760</td>
              <td className="p-3 text-green-600 font-medium">+6.3%</td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Digital Thermometer</td>
              <td className="p-3">₹19,800</td>
              <td className="p-3">210</td>
              <td className="p-3 text-green-600 font-medium">+3.1%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ---------------- EXPIRING PRODUCTS ALERT TABLE ---------------- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Expiring Products Alert
        </h2>
        <p className="text-gray-500 mb-4">
          Products that are nearing expiry — take action immediately
        </p>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-red-100 text-gray-700">
              <th className="p-3">Product Name</th>
              <th className="p-3">Batch No</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Value (₹)</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            <tr className="border-b">
              <td className="p-3">Amoxicillin 500mg</td>
              <td className="p-3">BCH1840</td>
              <td className="p-3 text-red-600 font-medium">12-Feb-2025</td>
              <td className="p-3">180</td>
              <td className="p-3">₹9,000</td>
            </tr>

            <tr className="border-b">
              <td className="p-3">ORS Powder</td>
              <td className="p-3">BCH2211</td>
              <td className="p-3 text-red-600 font-medium">05-Mar-2025</td>
              <td className="p-3">95</td>
              <td className="p-3">₹2,850</td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Cough Syrup 100ml</td>
              <td className="p-3">BCH1145</td>
              <td className="p-3 text-red-600 font-medium">28-Feb-2025</td>
              <td className="p-3">60</td>
              <td className="p-3">₹3,600</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------- STAT CARD COMPONENT ------------------- */
const StatCard = ({ icon, title, value, change }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-green-600 font-medium mt-1">▲ {change}</p>
    </div>
  );
};
