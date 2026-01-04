import React, { useState } from "react";

export default function SettingsNotification() {
  const [notifications, setNotifications] = useState({
    lowStock: true,
    expiryAlerts: true,
    newOrders: false,
    dailySales: true,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Notification Preferences</h2>

      {/* Notification Items */}
      <div className="space-y-4">
        {/* Low Stock Alerts */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
          <div>
            <p className="font-medium text-gray-800">Low Stock Alerts</p>
            <p className="text-sm text-gray-500">Get notified when products are running low</p>
          </div>
          <button
            onClick={() => toggleNotification("lowStock")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition
              ${notifications.lowStock ? "bg-black" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                ${notifications.lowStock ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* Expiry Alerts */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
          <div>
            <p className="font-medium text-gray-800">Expiry Alerts</p>
            <p className="text-sm text-gray-500">Notifications for expiring products</p>
          </div>
          <button
            onClick={() => toggleNotification("expiryAlerts")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition
              ${notifications.expiryAlerts ? "bg-black" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                ${notifications.expiryAlerts ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* New Orders */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
          <div>
            <p className="font-medium text-gray-800">New Orders</p>
            <p className="text-sm text-gray-500">Alert for new supplier orders</p>
          </div>
          <button
            onClick={() => toggleNotification("newOrders")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition
              ${notifications.newOrders ? "bg-black" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                ${notifications.newOrders ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* Daily Sales Report */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
          <div>
            <p className="font-medium text-gray-800">Daily Sales Report</p>
            <p className="text-sm text-gray-500">Receive daily summary via email</p>
          </div>
          <button
            onClick={() => toggleNotification("dailySales")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition
              ${notifications.dailySales ? "bg-black" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                ${notifications.dailySales ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
