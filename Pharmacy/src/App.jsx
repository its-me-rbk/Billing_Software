
// import React, { useState } from "react";
// import Home from "./Components/Home";
// import AdminSidebar from "./Admin/Admin_side_nav";
// import AdminDashboard from "./Admin/Admin_dashboard";

// const App = () => {
//   const [page, setPage] = useState("login");

//   return (
//     <div
//       className={
//         page === "login"
//           ? "min-h-screen flex items-center justify-center"  
//           : "min-h-screen flex"                               
//       }
//     >
//       {page === "login" && <Home setPage={setPage} />}

//       {page === "admin" && (
//         <div className="flex w-full">
//           <AdminSidebar />
//           <div className="flex-1 bg-gray-100">
//             <AdminDashboard />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;





import React, { useState } from "react";
import Home from "./Components/Home";
import AdminSidebar from "./Admin/Admin_side_nav";
import AdminDashboard from "./Admin/Admin_dashboard";
import AdminProducts from "./Admin/Admin_Products";

const App = () => {
  const [page, setPage] = useState("login");

  const renderPage = () => {
    switch (page) {
      case "admin_dashboard":
        return <AdminDashboard />;
      case "admin_products":
        return <AdminProducts />;
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
      {/* LOGIN PAGE */}
      {page === "login" && <Home setPage={setPage} />}

      {/* ADMIN PANEL */}
      {page !== "login" && (
        <div className="flex w-full">
          <AdminSidebar setPage={setPage} activePage={page} />

          <div className="flex-1 bg-gray-100 p-4">
            {renderPage()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
