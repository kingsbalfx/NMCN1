import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/login", { 
        username_or_email: usernameOrEmail, 
        password 
      });

      if (res.data?.token) localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setResetLoading(true);
      setError("");
      await api.post("/auth/forgot-password", { email: resetEmail });
      alert("Check your email for password reset instructions");
      setForgotMode(false);
      setResetEmail("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  if (forgotMode) {
    return (
      <div style={{ maxWidth: 420, margin: "48px auto", padding: 20, borderRadius: 10, background: "#fff", boxShadow: "0 8px 20px rgba(10,10,30,0.08)" }}>
        <h2 style={{ marginTop: 0 }}>Reset Password</h2>
        {error && <div style={{ color: "#c00", marginBottom: 12, padding: 10, background: "#fee", borderRadius: 6 }}>{error}</div>}
        <p style={{ color: "#666", marginBottom: 16 }}>Enter your email and we'll send you a link to reset your password.</p>
        <input
          placeholder="Your email"
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 12, boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 8 }}
        />
        <button 
          onClick={handleForgotPassword} 
          disabled={resetLoading || !resetEmail}
          style={{ width: "100%", padding: 12, background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, marginBottom: 12 }}
        >
          {resetLoading ? "Sending..." : "Send Reset Link"}
        </button>
        <button
          onClick={() => { setForgotMode(false); setError(""); }}
          style={{ width: "100%", padding: 12, background: "#f1f5f9", color: "#0066ff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 20, borderRadius: 10, background: "#fff", boxShadow: "0 8px 20px rgba(10,10,30,0.08)" }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      {error && <div style={{ color: "#c00", marginBottom: 12, padding: 10, background: "#fee", borderRadius: 6 }}>{error}</div>}
      <input 
        placeholder="Username or Email" 
        value={usernameOrEmail}
        onChange={(e) => setUsernameOrEmail(e.target.value)} 
        style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 8 }} 
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 12, boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 8 }}
      />
      <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 12, background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, marginBottom: 12 }}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <div style={{ textAlign: "center", fontSize: 14 }}>
        <a onClick={() => setForgotMode(true)} style={{ color: "#0066ff", cursor: "pointer", textDecoration: "underline" }}>
          Forgot password?
        </a>
      </div>
      <p style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
        Don't have an account? <a href="/register" style={{ color: "#0066ff", textDecoration: "none", fontWeight: 600 }}>Register here</a>
      </p>
    </div>
  );
}
