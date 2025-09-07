import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Package, Users, Truck, CreditCard, BarChart3 } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: <Home size={18} /> },
  { to: "/cylinders", label: "Cylinders", icon: <Package size={18} /> },
  { to: "/customers", label: "Customers", icon: <Users size={18} /> },
  { to: "/suppliers", label: "Suppliers", icon: <Truck size={18} /> },
  { to: "/payments", label: "Payments", icon: <CreditCard size={18} /> },
  { to: "/reports", label: "Reports", icon: <BarChart3 size={18} /> },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
      <div className="p-6 text-xl font-bold">Cylinder Tracker</div>
      <nav className="mt-6 space-y-1">
        {links.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-6 py-2 text-gray-700 hover:bg-gray-100 ${
              pathname === to ? "bg-gray-100 font-semibold text-blue-600" : ""
            }`}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
