import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white fixed left-0 top-0 flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Cylinder Tracker
      </div>
      <nav className="flex-1 p-4 space-y-3">
        <Link to="/dashboard" className="block hover:bg-gray-700 p-2 rounded">
          Dashboard
        </Link>
        <Link to="/cylinders" className="block hover:bg-gray-700 p-2 rounded">
          Cylinders
        </Link>
        <Link to="/suppliers" className="block hover:bg-gray-700 p-2 rounded">
          Suppliers
        </Link>
        <Link to="/customers" className="block hover:bg-gray-700 p-2 rounded">
          Customers
        </Link>
        <Link to="/payments" className="block hover:bg-gray-700 p-2 rounded">
          Payments
        </Link>
        <Link to="/reports" className="block hover:bg-gray-700 p-2 rounded">
          Reports
        </Link>
        <Link to="/settings" className="block hover:bg-gray-700 p-2 rounded">
          Settings
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <Link to="/" className="block hover:bg-red-600 p-2 rounded text-center">
          Logout
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
