import React, { useState } from "react";

export default function Cylinders() {
  const [cylinders, setCylinders] = useState([
    { id: "C1", size: "20L", status: "Available", customer: "" },
    { id: "C2", size: "50L", status: "Issued", customer: "ABC Foods" },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cylinders</h1>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Size</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Customer</th>
            </tr>
          </thead>
          <tbody>
            {cylinders.map((c, i) => (
              <tr
                key={i}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2">{c.id}</td>
                <td className="px-4 py-2">{c.size}</td>
                <td className="px-4 py-2">{c.status}</td>
                <td className="px-4 py-2">{c.customer || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
