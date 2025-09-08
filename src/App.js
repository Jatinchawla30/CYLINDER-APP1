import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Cylinders from "./components/cylinders/Cylinders";
import Suppliers from "./components/suppliers/Suppliers";
import Jobs from "./components/jobs/Jobs";
import Reports from "./components/reports/Reports";
import Settings from "./components/settings/Settings";
import Customers from "./components/Customers/costumer"; // lowercase file inside Customers folder
import Payments from "./components/Payments/payments";  // lowercase file inside Payments folder
import Orders from "./components/orders/Orders";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={<ProtectedRoute element={<Dashboard />} />}
              />
              <Route
                path="/cylinders"
                element={<ProtectedRoute element={<Cylinders />} />}
              />
              <Route
                path="/suppliers"
                element={<ProtectedRoute element={<Suppliers />} />}
              />
              <Route
                path="/jobs"
                element={<ProtectedRoute element={<Jobs />} />}
              />
              <Route
                path="/customers"
                element={<ProtectedRoute element={<Customers />} />}
              />
              <Route
                path="/payments"
                element={<ProtectedRoute element={<Payments />} />}
              />
              <Route
                path="/orders"
                element={<ProtectedRoute element={<Orders />} />}
              />
              <Route
                path="/reports"
                element={<ProtectedRoute element={<Reports />} />}
              />
              <Route
                path="/settings"
                element={<ProtectedRoute element={<Settings />} />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
