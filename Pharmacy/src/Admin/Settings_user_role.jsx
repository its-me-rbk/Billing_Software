import React from "react";
import {
  UserCircleIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function SettingsUserRole() {
  const users = [
    {
      name: "Admin User",
      email: "admin@pharmacy.com",
      role: "Admin",
      roleColor: "bg-purple-100 text-purple-700",
    },
    {
      name: "John Pharmacist",
      email: "john@pharmacy.com",
      role: "Pharmacist",
      roleColor: "bg-blue-100 text-blue-700",
    },
    {
      name: "Sarah Cashier",
      email: "sarah@pharmacy.com",
      role: "Cashier",
      roleColor: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="space-y-10">
      {/* ================= USER MANAGEMENT ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              User Management
            </h2>
            <p className="text-sm text-gray-500">
              Manage user accounts and permissions
            </p>
          </div>

          <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <PlusIcon className="h-5 w-5" />
            Add User
          </button>
        </div>

        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-teal-500 text-white">
                  <UserCircleIcon className="h-7 w-7" />
                </div>

                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${user.roleColor}`}
                >
                  {user.role}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  active
                </span>

                <button className="text-gray-500 hover:text-teal-600 transition">
                  <PencilSquareIcon className="h-5 w-5" />
                </button>

                <button className="text-gray-500 hover:text-red-500 transition">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= ROLE PERMISSIONS ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Role Permissions
        </h2>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-medium text-gray-800">Admin</h3>
            <p className="text-sm text-gray-500">
              Full access to all features and settings
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-medium text-gray-800">Pharmacist</h3>
            <p className="text-sm text-gray-500">
              Manage medicines, prescriptions, and inventory
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-medium text-gray-800">Cashier</h3>
            <p className="text-sm text-gray-500">
              Handle billing, payments, and customer checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
