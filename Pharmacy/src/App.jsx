



// import React, { useState, useEffect } from "react";

// // Login Page
// import Home from "./Components/Home";

// // Admin Pages
// import AdminSidebar from "./Admin/Admin_side_nav";
// import AdminDashboard from "./Admin/Admin_dashboard";
// import AdminProducts from "./Admin/Admin_products";
// import CreateBill from "./Admin/Admin_Billing_page";
// import AdminSupplier from "./Admin/Admin_Supplier";
// import AdminReport from "./Admin/Admin_reports";
// import AdminCustomers from "./Admin/Admin_customers";

// // Cashier Pages
// import CashierSidebar from "./Cashier/Cashier_nav";
// import CashierDashboard from "./Cashier/Cashier_dashboard";

// const App = () => {
//   // 🔹 Restore state from sessionStorage (NOT localStorage)
//   const [page, setPage] = useState(() => {
//     return sessionStorage.getItem("page") || "login";
//   });

//   const [role, setRole] = useState(() => {
//     return sessionStorage.getItem("role") || "";
//   });

//   // 🔹 Sync page to sessionStorage
//   useEffect(() => {
//     sessionStorage.setItem("page", page);
//   }, [page]);

//   // 🔹 Sync role to sessionStorage
//   useEffect(() => {
//     sessionStorage.setItem("role", role);
//   }, [role]);

//   // 🔹 Logout handler
//   const handleLogout = () => {
//     sessionStorage.clear();
//     setPage("login");
//     setRole("");
//   };

//   // ---------------- PAGE RENDERER ----------------
//   const renderPage = () => {
//     if (role === "Admin") {
//       switch (page) {
//         case "admin_dashboard":
//           return <AdminDashboard />;
//         case "admin_products":
//           return <AdminProducts setPage={setPage} />;
//         case "admin_billing":
//           return <CreateBill />;
//         case "admin_suppliers":
//           return <AdminSupplier />;
//         case "admin_reports":
//           return <AdminReport />;
//         case "admin_customers":
//           return <AdminCustomers />;
//         default:
//           return <AdminDashboard />;
//       }
//     }

//     if (role === "Cashier") {
//       switch (page) {
//         case "cashier_dashboard":
//           return <CashierDashboard />;
//         default:
//           return <CashierDashboard />;
//       }
//     }

//     return null;
//   };

//   return (
//     <div className="min-h-screen w-full">
//       {/* ---------------- LOGIN PAGE ---------------- */}
//       {page === "login" && (
//         <div className="min-h-screen flex items-center justify-center">
//           <Home setPage={setPage} setRole={setRole} />
//         </div>
//       )}

//       {/* ---------------- ADMIN LAYOUT ---------------- */}
//       {page !== "login" && role === "Admin" && (
//         <div className="flex min-h-screen w-full">
//           <div className="w-[250px] h-screen fixed top-0 left-0 bg-white shadow-lg">
//             <AdminSidebar
//               setPage={setPage}
//               activePage={page}
//               onLogout={handleLogout}
//             />
//           </div>

//           <div className="ml-[250px] flex-1 h-screen overflow-y-auto p-4 bg-gray-100">
//             {renderPage()}
//           </div>
//         </div>
//       )}

//       {/* ---------------- CASHIER LAYOUT ---------------- */}
//       {page !== "login" && role === "Cashier" && (
//         <div className="flex min-h-screen w-full">
//           <div className="w-[250px] h-screen fixed top-0 left-0 bg-white shadow-lg">
//             <CashierSidebar
//               setPage={setPage}
//               activePage={page}
//               onLogout={handleLogout}
//             />
//           </div>

//           <div className="ml-[250px] flex-1 h-screen overflow-y-auto p-4 bg-gray-100">
//             {renderPage()}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;













import React, { useState, useEffect } from "react";

// Login Page
import Home from "./Components/Home";

// Admin Pages
import AdminSidebar from "./Admin/Admin_side_nav";
import AdminDashboard from "./Admin/Admin_dashboard";
import AdminProducts from "./Admin/Admin_products";
import CreateBill from "./Admin/Admin_Billing_page";
import AdminSupplier from "./Admin/Admin_Supplier";
import AdminReport from "./Admin/Admin_reports";
import AdminCustomers from "./Admin/Admin_customers";
import AdminSettings from "./Admin/Admin_Settings"; // ✅ NEW

// Cashier Pages
import CashierSidebar from "./Cashier/Cashier_nav";
import CashierDashboard from "./Cashier/Cashier_dashboard";

const App = () => {
  // 🔹 Restore page from sessionStorage
  const [page, setPage] = useState(() => {
    return sessionStorage.getItem("page") || "login";
  });

  // 🔹 Restore role from sessionStorage
  const [role, setRole] = useState(() => {
    return sessionStorage.getItem("role") || "";
  });

  // 🔹 Sync page
  useEffect(() => {
    sessionStorage.setItem("page", page);
  }, [page]);

  // 🔹 Sync role
  useEffect(() => {
    sessionStorage.setItem("role", role);
  }, [role]);

  // 🔹 Logout
  const handleLogout = () => {
    sessionStorage.clear();
    setPage("login");
    setRole("");
  };

  // ---------------- PAGE RENDERER ----------------
  const renderPage = () => {
    if (role === "Admin") {
      switch (page) {
        case "admin_dashboard":
          return <AdminDashboard />;

        case "admin_products":
          return <AdminProducts setPage={setPage} />;

        case "admin_billing":
          return <CreateBill />;

        case "admin_suppliers":
          return <AdminSupplier />;

        case "admin_reports":
          return <AdminReport />;

        case "admin_customers":
          return <AdminCustomers />;

        case "admin_settings": // ✅ SETTINGS PAGE
          return <AdminSettings />;

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
    <div className="min-h-screen w-full">
      {/* ---------------- LOGIN ---------------- */}
      {page === "login" && (
        <div className="min-h-screen flex items-center justify-center">
          <Home setPage={setPage} setRole={setRole} />
        </div>
      )}

      {/* ---------------- ADMIN LAYOUT ---------------- */}
      {page !== "login" && role === "Admin" && (
        <div className="flex min-h-screen w-full">
          <div className="w-[250px] h-screen fixed top-0 left-0 bg-white shadow-lg">
            <AdminSidebar
              setPage={setPage}
              activePage={page}
              onLogout={handleLogout}
            />
          </div>

          <div className="ml-[250px] flex-1 h-screen overflow-y-auto p-4 bg-gray-100">
            {renderPage()}
          </div>
        </div>
      )}

      {/* ---------------- CASHIER LAYOUT ---------------- */}
      {page !== "login" && role === "Cashier" && (
        <div className="flex min-h-screen w-full">
          <div className="w-[250px] h-screen fixed top-0 left-0 bg-white shadow-lg">
            <CashierSidebar
              setPage={setPage}
              activePage={page}
              onLogout={handleLogout}
            />
          </div>

          <div className="ml-[250px] flex-1 h-screen overflow-y-auto p-4 bg-gray-100">
            {renderPage()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
