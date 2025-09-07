import React, { useState } from "react";

export default function Suppliers() {
  const [suppliers] = useState([
    { name: "GasCo", contact: "9012345678", cylindersSupplied: 50 },
    { name: "OxygenPlus", contact: "9998887770", cylindersSupplied: 20 },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Suppliers</h1>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Cylinders Supplied</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr
                key={i}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{s.contact}</td>
                <td className="px-4 py-2">{s.cylindersSupplied}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
