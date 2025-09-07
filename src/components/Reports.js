import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", payments: 12000 },
  { month: "Feb", payments: 18000 },
  { month: "Mar", payments: 15000 },
  { month: "Apr", payments: 20000 },
];

export default function Reports() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Monthly Payments</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="payments" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
