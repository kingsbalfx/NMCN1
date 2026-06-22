import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../services/api";

export default function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [logbook, setLogbook] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({
    procedure_name: "",
    category: "Basic Nursing Procedures",
    performed_at: "",
    patient_condition: "",
    reflection: "",
    supervisor_name: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const res = await api.get("/users/progress");
    setProgress(res.data.progress || []);
    setLogbook(res.data.logbook || []);
    setSummary(res.data.summary || null);
  };

  const saveLogbook = async () => {
    setSaving(true);
    try {
      await api.post("/users/logbook", form);
      setForm({
        procedure_name: "",
        category: "Basic Nursing Procedures",
        performed_at: "",
        patient_condition: "",
        reflection: "",
        supervisor_name: ""
      });
      await loadProgress();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 48 }}>
          <section style={{ background: "#07111f", color: "#eef6ff", borderRadius: 8, padding: 24, marginBottom: 18 }}>
            <p style={{ margin: 0, color: "#67e8f9", letterSpacing: 2, textTransform: "uppercase", fontSize: 12, fontWeight: 800 }}>Student Progress</p>
            <h1 style={{ margin: "8px 0", fontSize: 32 }}>XP, Clinical Logbook, and Ward Readiness</h1>
            <p style={{ margin: 0, color: "#cbd5e1" }}>Track your curriculum missions and document clinical procedures for supervisor review.</p>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
            <Metric label="Rank" value={summary?.rank || "Student Nurse"} />
            <Metric label="Total XP" value={summary?.total_xp || 0} />
            <Metric label="Lessons" value={summary?.completed_lessons || 0} />
            <Metric label="Quizzes" value={summary?.quiz_attempts || 0} />
            <Metric label="Procedures" value={(summary?.approved_procedures || 0) + (summary?.submitted_procedures || 0)} />
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: 18, alignItems: "start" }}>
            <section style={panel}>
              <h2 style={{ marginTop: 0 }}>Course Progress</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {progress.length === 0 && <p style={{ color: "#64748b" }}>No synced course progress yet. Complete a curriculum mission to start earning XP.</p>}
                {progress.map((item) => {
                  const pct = item.quiz_total ? Math.round((item.quiz_score / item.quiz_total) * 100) : 0;
                  return (
                    <div key={item.course_code} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <strong>{item.course_code}</strong>
                        <span style={{ color: "#0f766e", fontWeight: 800 }}>{item.xp || 0} XP</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", marginTop: 10, overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: "#0f766e" }} />
                      </div>
                      <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 13 }}>
                        Lesson {item.lesson_completed ? "complete" : "pending"} · Flashcards {item.flashcards_completed ? "complete" : "pending"} · Quiz {item.quiz_score || 0}/{item.quiz_total || 0}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={panel}>
              <h2 style={{ marginTop: 0 }}>Add Clinical Logbook</h2>
              <Input label="Procedure" value={form.procedure_name} onChange={(v) => setForm({ ...form, procedure_name: v })} />
              <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <Input label="Date" type="date" value={form.performed_at} onChange={(v) => setForm({ ...form, performed_at: v })} />
              <Textarea label="Patient condition" value={form.patient_condition} onChange={(v) => setForm({ ...form, patient_condition: v })} />
              <Textarea label="Reflection" value={form.reflection} onChange={(v) => setForm({ ...form, reflection: v })} />
              <Input label="Supervisor name" value={form.supervisor_name} onChange={(v) => setForm({ ...form, supervisor_name: v })} />
              <button onClick={saveLogbook} disabled={saving || !form.procedure_name} style={{ width: "100%", padding: 12, border: 0, borderRadius: 8, background: "#0f766e", color: "#fff", fontWeight: 800 }}>
                {saving ? "Saving..." : "Submit Logbook Entry"}
              </button>
            </section>
          </div>

          <section style={{ ...panel, marginTop: 18 }}>
            <h2 style={{ marginTop: 0 }}>Recent Clinical Entries</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {logbook.map((entry) => (
                <div key={entry.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                  <strong>{entry.procedure_name}</strong>
                  <p style={{ margin: "4px 0", color: "#64748b" }}>{entry.category || "Clinical procedure"} · {entry.performed_at || "No date"}</p>
                  <span style={{ color: entry.status === "approved" ? "#0f766e" : "#b45309", fontWeight: 800 }}>{entry.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
      <p style={{ margin: 0, color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
      <strong style={{ display: "block", marginTop: 6, fontSize: 22, color: "#0f172a" }}>{value}</strong>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label style={{ display: "block", marginBottom: 10, color: "#334155", fontWeight: 700 }}>
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle} />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label style={{ display: "block", marginBottom: 10, color: "#334155", fontWeight: 700 }}>
      {label}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...fieldStyle, resize: "vertical" }} />
    </label>
  );
}

const panel = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 18,
};

const fieldStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: 6,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
};
