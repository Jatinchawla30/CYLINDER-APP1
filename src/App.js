// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { useAuth } from "./context/AuthContext";

// Layout
import Sidebar from "./components/layout/Sidebar";

// Auth pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Main pages (inside folders)
import Dashboard from "./components/dashboard/Dashboard";
import Cylinders from "./components/cylinders/Cylinders";
import Suppliers from "./components/suppliers/Suppliers";
import Customers from "./components/Customers";
import Jobs from "./components/jobs/Jobs";
import Payments from "./components/Payments";
import Reports from "./components/reports/Reports";
import Settings from "./components/settings/Settings";

// ✅ Protected Route wrapper
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar only visible if logged in */}
        <AuthWrapper>
          <Sidebar />
        </AuthWrapper>

        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/cylinders"
              element={
                <PrivateRoute>
                  <Cylinders />
                </PrivateRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <PrivateRoute>
                  <Suppliers />
                </PrivateRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <PrivateRoute>
                  <Customers />
                </PrivateRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <PrivateRoute>
                  <Jobs />
                </PrivateRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <PrivateRoute>
                  <Payments />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// ✅ Wrapper to conditionally show Sidebar only if logged in
function AuthWrapper({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : null;
}

export default App;
