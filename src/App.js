// Import React and required dependencies
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import layout components
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

// Import feature components
import Dashboard from "./components/Dashboard";
import Cylinders from "./components/Cylinders";
import Customers from "./components/Customers";
import Suppliers from "./components/Suppliers";
import Payments from "./components/Payments";
import Reports from "./components/Reports";

// Import authentication components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Main App Component
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Application Routes with Layout */}
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen bg-gray-50">
              {/* Sidebar Component */}
              <Sidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Topbar Component */}
                <Topbar />

                {/* Page Content */}
                <main className="p-6">
                  <Routes>
                    {/* Default Redirect to Dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />

                    {/* Feature Routes */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/cylinders" element={<Cylinders />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/reports" element={<Reports />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
