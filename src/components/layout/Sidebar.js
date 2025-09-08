// src/components/layout/Sidebar.js
import { Home, Package, Users, Briefcase, FileText, UserCog, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Cylinder App
      </div>
      <nav className="flex-1 p-4 space-y-3">
        <Link to="/" className="flex items-center gap-2 hover:text-yellow-400">
          <Home size={20} /> Dashboard
        </Link>
        <Link to="/cylinders" className="flex items-center gap-2 hover:text-yellow-400">
          <Package size={20} /> Cylinders
        </Link>
        <Link to="/suppliers" className="flex items-center gap-2 hover:text-yellow-400">
          <Users size={20} /> Suppliers
        </Link>
        <Link to="/customers" className="flex items-center gap-2 hover:text-yellow-400">
          <Users size={20} /> Customers
        </Link>
        <Link to="/jobs" className="flex items-center gap-2 hover:text-yellow-400">
          <Briefcase size={20} /> Jobs
        </Link>
        <Link to="/payments" className="flex items-center gap-2 hover:text-yellow-400">
          <CreditCard size={20} /> Payments
        </Link>
        <Link to="/reports" className="flex items-center gap-2 hover:text-yellow-400">
          <FileText size={20} /> Reports
        </Link>
        <Link to="/settings" className="flex items-center gap-2 hover:text-yellow-400">
          <UserCog size={20} /> Settings
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
