import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout
import Sidebar from "./components/layout/Sidebar";

// Pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Cylinders from "./components/cylinders/Cylinders";
import Reports from "./components/reports/Reports";
import Settings from "./components/settings/Settings";
import Customers from "./components/Customers";
import Suppliers from "./components/Suppliers";
import Payments from "./components/Payments";
import Orders from "./components/orders/Orders";
import Jobs from "./components/jobs/Jobs";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100 text-gray-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cylinders" element={<Cylinders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/jobs" element={<Jobs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
