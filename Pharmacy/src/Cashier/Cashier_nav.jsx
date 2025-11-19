import React from "react";
import { LayoutGrid, ShoppingCart, Users } from "lucide-react";

const CashierSidebar = ({ setPage, activePage }) => {
  return (
    <div className="h-screen w-64 bg-teal-700 text-white flex flex-col justify-between py-6 px-4">

      {/* Logo Section */}
      <div>
        <div
          className="flex items-center gap-3 px-2 mb-8 cursor-pointer"
          onClick={() => setPage("cashier_dashboard")}
        >
          <div className="bg-white p-3 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-teal-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m7-7v14"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">PharmaCare</h1>
            <p className="text-sm text-teal-100">Cashier</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-5 mt-6">

          <SidebarItem
            title="Dashboard"
            Icon={LayoutGrid}
            active={activePage === "cashier_dashboard"}
            onClick={() => setPage("cashier_dashboard")}
          />

          <SidebarItem
            title="Billing"
            Icon={ShoppingCart}
            active={activePage === "cashier_billing"}
            onClick={() => setPage("cashier_billing")}
          />

          <SidebarItem
            title="Customers"
            Icon={Users}
            active={activePage === "cashier_customers"}
            onClick={() => setPage("cashier_customers")}
          />

        </nav>
      </div>

      {/* Footer */}
      <div className="text-teal-100 text-sm px-2">
        <p className="mb-1">v1.0.0</p>
        <p>© 2025 PharmaCare</p>
      </div>
    </div>
  );
};

const SidebarItem = ({ Icon, title, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-xl 
      ${active ? "bg-white text-teal-700 shadow" : "text-teal-100 hover:text-white"}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{title}</span>
      </div>

      {active && <span className="w-2 h-2 bg-teal-600 rounded-full"></span>}
    </div>
  );
};

export default CashierSidebar;
