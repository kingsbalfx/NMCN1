import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../services/api";

const avatarStyles = [
  { id: "clinical-hero", label: "Clinical Hero" },
  { id: "ward-captain", label: "Ward Captain" },
  { id: "research-sage", label: "Research Sage" },
  { id: "emergency-star", label: "Emergency Star" }
];

export default function SettingsPage() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    avatar_gender: "female",
    avatar_style: "clinical-hero"
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const res = await api.get("/users/profile");
    setForm({
      full_name: res.data.full_name || "",
      phone: res.data.phone || "",
      avatar_gender: res.data.avatar_gender || "female",
      avatar_style: res.data.avatar_style || "clinical-hero"
    });
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    try {
      await api.put("/users/profile", form);
      setMessage("Profile saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ maxWidth: 920, margin: "0 auto", paddingBottom: 48 }}>
          <section style={{ background: "#111827", color: "#fff", borderRadius: 8, padding: 24, marginBottom: 18 }}>
            <p style={{ margin: 0, color: "#93c5fd", fontWeight: 800 }}>Student Identity</p>
            <h1 style={{ margin: "8px 0", fontSize: 32 }}>Profile and avatar</h1>
            <p style={{ margin: 0, color: "#d1d5db" }}>Choose the identity that appears across your learning map and progress screens.</p>
          </section>

          <section style={panelStyle}>
            <label style={labelStyle}>
              Full name
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={fieldStyle} />
            </label>

            <div style={{ marginBottom: 16 }}>
              <p style={labelTextStyle}>Avatar gender</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["female", "male"].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setForm({ ...form, avatar_gender: gender })}
                    style={choiceStyle(form.avatar_gender === gender)}
                  >
                    {gender === "female" ? "Female Nurse" : "Male Nurse"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <p style={labelTextStyle}>Avatar class</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                {avatarStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setForm({ ...form, avatar_style: style.id })}
                    style={choiceStyle(form.avatar_style === style.id)}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={saveProfile} disabled={saving} style={saveButtonStyle}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {message && <p style={{ color: "#15803d", fontWeight: 700 }}>{message}</p>}
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

const panelStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 20
};

const labelStyle = {
  display: "block",
  marginBottom: 14,
  color: "#334155",
  fontWeight: 700
};

const labelTextStyle = {
  margin: "0 0 8px",
  color: "#334155",
  fontWeight: 800
};

const fieldStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: 6,
  padding: 11,
  borderRadius: 8,
  border: "1px solid #cbd5e1"
};

const choiceStyle = (active) => ({
  border: active ? "2px solid #2563eb" : "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "12px 14px",
  background: active ? "#eff6ff" : "#ffffff",
  color: active ? "#1d4ed8" : "#0f172a",
  fontWeight: 800,
  cursor: "pointer"
});

const saveButtonStyle = {
  border: 0,
  borderRadius: 8,
  padding: "12px 16px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer"
};
