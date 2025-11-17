import React, { useState } from "react";
import Home from "./Components/Home";
import AdminSidebar from "./Admin/Admin_side_nav";
import AdminDashboard from "./Admin/Admin_dashboard";
import AdminProducts from "./Admin/Admin_products";

const App = () => {
  const [page, setPage] = useState("login");

  const renderPage = () => {
    switch (page) {
      case "admin_dashboard":
        return <AdminDashboard />;
      case "admin_products":
        return <AdminProducts setPage={setPage} />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div
      className={
        page === "login"
          ? "min-h-screen flex items-center justify-center"
          : "min-h-screen flex"
      }
    >

      {/* LOGIN SCREEN */}
      {page === "login" && <Home setPage={setPage} />}

      {/* ADMIN LAYOUT */}
      {page !== "login" && (
        <div className="flex w-full">
          <AdminSidebar setPage={setPage} activePage={page} />
          <div className="flex-1 bg-gray-100 p-4">{renderPage()}</div>
        </div>
      )}
    </div>
  );
};

export default App;
