import React, { useState } from "react";
import "../App.css";

export default function Login({ onLogin, switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="card" style={{ width: "350px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Cylinder Tracker</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>Login</button>
        </form>
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Don’t have an account?{" "}
          <button onClick={switchToRegister} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer" }}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
