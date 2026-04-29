import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/register", form);
      if (res.data?.token) localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 20, borderRadius: 10, background: "#fff", boxShadow: "0 8px 20px rgba(10,10,30,0.08)" }}>
      <h2 style={{ marginTop: 0 }}>Create Account</h2>
      {error && <div style={{ color: "#c00", marginBottom: 12, padding: 10, background: "#fee", borderRadius: 6 }}>{error}</div>}
      <input
        placeholder="Full name"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 8 }}
      />
      <input
        placeholder="Username (for login)"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 8 }}
      />
      <input
        placeholder="Email (for password recovery)"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        style={{ width: "100%", padding: 10, marginBottom: 8, boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 8 }}
      />
      <input
        placeholder="Password (min 6 characters)"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        style={{ width: "100%", padding: 10, marginBottom: 12, boxSizing: "border-box", border: "2px solid #cbd5e1", borderRadius: 8 }}
      />
      <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 12, background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, marginBottom: 12 }}>
        {loading ? "Creating account..." : "Register"}
      </button>
      <p style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>Already have an account? <a href="/login" style={{ color: "#0066ff", textDecoration: "none", fontWeight: 600 }}>Sign in</a></p>
    </div>
  );
}
