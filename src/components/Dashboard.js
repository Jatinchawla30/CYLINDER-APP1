import React from "react";
import "../App.css";

export default function Dashboard({ onLogout }) {
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1>Cylinder Tracker Dashboard</h1>
        <button className="btn-secondary" onClick={onLogout}>Sign Out</button>
      </div>

      <div className="card">
        <div style={{ marginBottom: "10px" }}>
          <button className="btn-primary" style={{ marginRight: "10px" }}>+ Add Cylinder</button>
          <button className="btn-primary" style={{ marginRight: "10px" }}>+ Add Customer</button>
          <button className="btn-primary">+ Add Supplier</button>
        </div>
        <button className="btn-danger" style={{ marginTop: "10px" }}>💲 Quick Payment</button>
      </div>

      <div className="card">
        <h2>Cylinders</h2>
        <p>No cylinders found.</p>
      </div>

      <div className="card">
        <h2>Customers</h2>
        <p>No customers found.</p>
      </div>

      <div className="card">
        <h2>Suppliers</h2>
        <p>No suppliers found.</p>
      </div>
    </div>
  );
}
