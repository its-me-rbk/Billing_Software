import React, { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/outline";

export default function SettingSecurity() {
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
    sessionTimeout: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSecurity((prev) => ({ ...prev, [name]: value }));
  };

  const toggleOption = (key) => {
    setSecurity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password updated successfully");
  };

  return (
    <div className="space-y-10">
      {/* ================= CHANGE PASSWORD ================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-8">
          Change Password
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={security.currentPassword}
              onChange={handleChange}
              className="w-full rounded-lg bg-gray-100 border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={security.newPassword}
              onChange={handleChange}
              className="w-full rounded-lg bg-gray-100 border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={security.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg bg-gray-100 border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-6 py-3 rounded-lg transition"
        >
          <LockClosedIcon className="h-5 w-5" />
          Update Password
        </button>
      </form>

      {/* ================= SECURITY OPTIONS ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Security Options
        </h2>

        <div className="space-y-4">
          {/* Two Factor Authentication */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
            <div>
              <p className="font-medium text-gray-800">
                Two-factor authentication
              </p>
              <p className="text-sm text-gray-500">
                Add an extra layer of security
              </p>
            </div>

            <button
              onClick={() => toggleOption("twoFactor")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition
              ${security.twoFactor ? "bg-teal-500" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                ${security.twoFactor ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Session Timeout */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
            <div>
              <p className="font-medium text-gray-800">Session timeout</p>
              <p className="text-sm text-gray-500">
                Auto-logout after 30 minutes of inactivity
              </p>
            </div>

            <button
              onClick={() => toggleOption("sessionTimeout")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition
              ${security.sessionTimeout ? "bg-black" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                ${
                  security.sessionTimeout
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
