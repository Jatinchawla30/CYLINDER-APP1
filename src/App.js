import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout
import Sidebar from "./components/layout/Sidebar";

// Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Main Pages
import Dashboard from "./components/dashboard/Dashboard";
import Cylinders from "./components/cylinders/Cylinders";
import Suppliers from "./components/suppliers/Suppliers";
import Jobs from "./components/jobs/Jobs";
import Reports from "./components/reports/Reports";
import Settings from "./components/settings/Settings";
import Customers from "./components/Customers";
import Payments from "./components/Payments";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Routes>
            {/* Auth */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard & Modules */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cylinders" element={<Cylinders />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
