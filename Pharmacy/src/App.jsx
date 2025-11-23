
import React, { useState } from "react";

// Login Page
import Home from "./Components/Home";

// Admin Pages
import AdminSidebar from "./Admin/Admin_side_nav";
import AdminDashboard from "./Admin/Admin_dashboard";
import AdminProducts from "./Admin/Admin_products";
import CreateBill from "./Admin/Admin_Billing_page";   

// Cashier Pages
import CashierSidebar from "./Cashier/Cashier_nav";
import CashierDashboard from "./Cashier/Cashier_dashboard";

const App = () => {
  const [page, setPage] = useState("login");
  const [role, setRole] = useState(""); 

  // ---------- PAGE RENDERER ----------
  const renderPage = () => {
    if (role === "Admin") {
      switch (page) {
        case "admin_dashboard":
          return <AdminDashboard />;

        case "admin_products":
          return <AdminProducts setPage={setPage} />;

        case "admin_billing":                  
          return <CreateBill />;

        default:
          return <AdminDashboard />;
      }
    }

    if (role === "Cashier") {
      switch (page) {
        case "cashier_dashboard":
          return <CashierDashboard />;
        default:
          return <CashierDashboard />;
      }
    }

    return null;
  };

  return (
    <div
      className={
        page === "login"
          ? "min-h-screen flex items-center justify-center"
          : "min-h-screen flex"
      }
    >
      {/* ------------ LOGIN PAGE ------------ */}
      {page === "login" && (
        <Home setPage={setPage} setRole={setRole} />
      )}

      {/* ------------ ADMIN LAYOUT ------------ */}
      {page !== "login" && role === "Admin" && (
        <div className="flex w-full">
          <AdminSidebar setPage={setPage} activePage={page} />
          <div className="flex-1 bg-gray-100 p-4">{renderPage()}</div>
        </div>
      )}

      {/* ------------ CASHIER LAYOUT ------------ */}
      {page !== "login" && role === "Cashier" && (
        <div className="flex w-full">
          <CashierSidebar setPage={setPage} activePage={page} />
          <div className="flex-1 bg-gray-100 p-4">{renderPage()}</div>
        </div>
      )}
    </div>
  );
};

export default App;
