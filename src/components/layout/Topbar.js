import React from "react";
import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="outline-none text-sm w-64"
        />
      </div>
      <div className="flex items-center gap-6">
        <Bell className="text-gray-600 cursor-pointer" size={20} />
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
          U
        </div>
      </div>
    </header>
  );
}
