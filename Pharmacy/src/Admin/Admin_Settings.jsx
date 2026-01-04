

import React, { useState } from "react";
import {
  Cog6ToothIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  BellIcon,
  PrinterIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import GeneralSettings from "./general_setting";
import SettingsUserRole from "./settings_User_role";
import SettingSecurity from "./Settings_seurity";
import SettingsNotification from "./Settings_notifcation";
import SettingsPrint from "./Setting_print"; 

const menuItems = [
  { id: "general", label: "General", icon: Cog6ToothIcon },
  { id: "users", label: "Users & Roles", icon: UsersIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "print", label: "Print Settings", icon: PrinterIcon },
  { id: "security", label: "Security", icon: ShieldCheckIcon },
];

export default function AdminSettings() {
  const [active, setActive] = useState("general");

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* LEFT MENU */}
      <div className="fixed top-6 left-65 w-80 bg-white rounded-2xl shadow-lg p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <li
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition
                  ${
                    isActive
                      ? "bg-teal-500 text-white shadow"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="ml-[480px] pt-10 px-10 max-w-5xl">
        {active === "general" && <GeneralSettings />}
        {active === "users" && <SettingsUserRole />}
        {active === "notifications" && <SettingsNotification />}
        {active === "security" && <SettingSecurity />}
        {active === "print" && <SettingsPrint />} {/* Render Print Settings */}

        {active !== "general" &&
          active !== "users" &&
          active !== "security" &&
          active !== "notifications" &&
          active !== "print" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-gray-500">
              Select a setting to configure
            </div>
          )}
      </div>
    </div>
  );
}
