import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import your pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Cylinders from "./components/cylinders/Cylinders";
import Reports from "./components/reports/Reports";
import Settings from "./components/settings/Settings";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        {/* ✅ Navbar */}
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="font-bold text-lg">Cylinder Tracker</h1>
          <nav className="space-x-4">
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/cylinders" className="hover:underline">Cylinders</Link>
            <Link to="/reports" className="hover:underline">Reports</Link>
            <Link to="/settings" className="hover:underline">Settings</Link>
            <Link to="/" className="hover:underline">Logout</Link>
          </nav>
        </header>

        {/* ✅ Page Routes */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cylinders" element={<Cylinders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
