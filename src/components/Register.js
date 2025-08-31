import React, { useState } from "react";
import "../App.css";

export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    onRegister(email, password);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="card" style={{ width: "350px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create Account</h2>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "15px" }}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>Register</button>
        </form>
      </div>
    </div>
  );
}
