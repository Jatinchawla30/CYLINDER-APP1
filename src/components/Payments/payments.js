import React, { useState } from "react";

export default function Payments() {
  const [payments] = useState([
    { customer: "ABC Foods", amount: 5000, date: "2025-09-01", mode: "UPI" },
    { customer: "XYZ Traders", amount: 7000, date: "2025-08-28", mode: "Cash" },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Mode</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr
                key={i}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2">{p.customer}</td>
                <td className="px-4 py-2">₹{p.amount}</td>
                <td className="px-4 py-2">{p.date}</td>
                <td className="px-4 py-2">{p.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
