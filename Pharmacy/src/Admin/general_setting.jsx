
import React, { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

const API_BASE = "http://localhost:5000/api/general-settings";

export default function GeneralSettings() {
  const [formData, setFormData] = useState({
    pharmacyName: "",
    licenseNumber: "",
    gstNumber: "",
    address: "",
    phone: "",
    email: "",
    openingTime: "",
    closingTime: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================= Load Settings ================= */
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch(`${API_BASE}/get`);
      const json = await res.json();
      if (json.success && json.data) {
        setFormData(json.data);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await fetch(`${API_BASE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setLoading(false);
    alert("Settings saved successfully");
  };

  return (
    <div className="space-y-10">
      {/* ================= Pharmacy Information ================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md border border-gray-200 p-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          Pharmacy Information
        </h2>

        {/* Pharmacy Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Pharmacy Name
          </label>
          <input
            type="text"
            name="pharmacyName"
            value={formData.pharmacyName}
            onChange={handleChange}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 border border-transparent focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* License & GST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              GST Number
            </label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded-lg px-4 py-3"
            />
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 resize-none"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded-lg px-4 py-3"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-xl shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v8a2 2 0 01-2 2z"
            />
          </svg>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* ================= Business Hours ================= */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-8">
          Business Hours
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["openingTime", "closingTime"].map((field) => (
            <div key={field} className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {field === "openingTime" ? "Opening Time" : "Closing Time"}
              </label>

              <input
                type="time"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 pr-12"
              />

              <ClockIcon className="absolute right-4 top-[52px] h-5 w-5 text-gray-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

