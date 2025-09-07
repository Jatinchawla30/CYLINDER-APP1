import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Package,
  Factory,
  Users,
  DollarSign,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 flex flex-col shadow-lg">
      {/* Logo / Title */}
      <div className="p-6 text-2xl font-bold border-b border-gray-800">
        Cylinder Tracker
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3">
        <Link to="/dashboard" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <Home size={20} /> Dashboard
        </Link>

        <Link to="/cylinders" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <Package size={20} /> Cylinders
        </Link>

        <Link to="/suppliers" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <Factory size={20} /> Suppliers
        </Link>

        <Link to="/customers" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <Users size={20} /> Customers
        </Link>

        <Link to="/payments" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <DollarSign size={20} /> Payments
        </Link>

        <Link to="/reports" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <BarChart3 size={20} /> Reports
        </Link>

        <Link to="/settings" className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
          <SettingsIcon size={20} /> Settings
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <Link to="/" className="flex items-center justify-center gap-2 p-2 bg-red-600 rounded hover:bg-red-700">
          <LogOut size={20} /> Logout
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
