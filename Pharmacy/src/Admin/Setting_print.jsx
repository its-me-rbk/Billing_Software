import React, { useState } from "react";

export default function SettingsPrint() {
  const [paperSize, setPaperSize] = useState("A4");
  const [showLogo, setShowLogo] = useState(true);
  const [printGST, setPrintGST] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Invoice Print Settings</h2>

      {/* Paper Size */}
      <div className="space-y-1">
        <label className="block text-gray-700 font-medium">Paper Size</label>
        <select
          value={paperSize}
          onChange={(e) => setPaperSize(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="A4">A4</option>
          <option value="A5">A5</option>
          <option value="Letter">Letter</option>
        </select>
      </div>

      {/* Show Pharmacy Logo */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-gray-800 font-medium">Show pharmacy logo</p>
          <p className="text-gray-500 text-sm">Display logo on invoices</p>
        </div>
        <button
          onClick={() => setShowLogo(!showLogo)}
          className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${
            showLogo ? "bg-indigo-500 justify-end" : "bg-gray-300 justify-start"
          }`}
        >
          <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
        </button>
      </div>

      {/* Print GST Details */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-gray-800 font-medium">Print GST details</p>
          <p className="text-gray-500 text-sm">Include tax breakdown</p>
        </div>
        <button
          onClick={() => setPrintGST(!printGST)}
          className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${
            printGST ? "bg-indigo-500 justify-end" : "bg-gray-300 justify-start"
          }`}
        >
          <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
        </button>
      </div>

      {/* Auto-Print After Billing */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-gray-800 font-medium">Auto-print after billing</p>
          <p className="text-gray-500 text-sm">Automatically print invoice on completion</p>
        </div>
        <button
          onClick={() => setAutoPrint(!autoPrint)}
          className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ${
            autoPrint ? "bg-indigo-500 justify-end" : "bg-gray-300 justify-start"
          }`}
        >
          <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
        </button>
      </div>
    </div>
  );
}
