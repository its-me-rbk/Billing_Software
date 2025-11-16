

import React, { useState } from "react";

const Home = ({ setPage }) => {
  const [role, setRole] = useState("Pharmacist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault(); // form fix

    if (role === "Admin") {
      if (email === "admin@gmail.com" && password === "admin123") {
        setPage("admin");
        return;
      } else {
        setError("Invalid Admin Credentials!");
        return;
      }
    }

    setError("Only Admin Login Active Now!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-600 p-4 rounded-xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m7-7v14" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">PharmaCare Pro</h2>
          <p className="text-gray-500 text-sm -mt-1">Enterprise Billing System</p>
        </div>

        {/* Role Selection */}
        <p className="text-gray-700 font-medium mb-2">Login As</p>
        <div className="flex items-center gap-3 mb-6">
          {["Admin", "Pharmacist", "Cashier"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={`flex-1 border rounded-lg py-2 font-medium transition ${
                role === item
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* FORM START */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-4">
            <label className="text-gray-700 font-medium">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="absolute left-3 top-2.5 text-gray-400">📧</span>
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="text-gray-700 font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔒</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg shadow-md transition"
          >
            Sign In
          </button>
        </form>
        {/* FORM END */}

        <p className="text-center text-gray-500 text-sm mt-4">
          Demo: Admin Login → admin@gmail.com / admin123
        </p>
      </div>
    </div>
  );
};

export default Home;
