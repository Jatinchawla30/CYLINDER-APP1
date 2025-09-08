import React, { useState } from "react";

export default function Customers() {
  const [customers] = useState([
    { name: "ABC Foods", contact: "9876543210", balance: 12000 },
    { name: "XYZ Traders", contact: "9123456780", balance: 0 },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr
                key={i}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.contact}</td>
                <td className="px-4 py-2 text-red-600 font-semibold">
                  ₹{c.balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
