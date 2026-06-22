import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../services/api";

export default function StudyPlanPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users/study-plan");
      setPlan(res.data.plan);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not build your study plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 48 }}>
          <section style={{
            borderRadius: 8,
            padding: 26,
            background: "#132018",
            color: "#f2fff6",
            border: "1px solid #24442f",
            marginBottom: 18
          }}>
            <p style={{ margin: 0, color: "#86efac", fontWeight: 800, letterSpacing: 1 }}>Adaptive Study Plan</p>
            <h1 style={{ margin: "8px 0", fontSize: 34, lineHeight: 1.08 }}>Today’s route through the curriculum.</h1>
            <p style={{ maxWidth: 720, margin: 0, color: "#c9dfd0", lineHeight: 1.7 }}>
              Your plan uses course progress, quiz scores, tutor activity, and curriculum coverage to choose what to study next.
            </p>
          </section>

          {loading && <p style={noticeStyle}>Building your study route...</p>}
          {error && <p style={{ ...noticeStyle, background: "#fee2e2", color: "#991b1b" }}>{error}</p>}

          {plan && (
            <>
              <section style={metricGridStyle}>
                <Metric label="Readiness" value={plan.readiness} />
                <Metric label="Average Score" value={plan.average_exam_score ? `${plan.average_exam_score}%` : "New"} />
                <Metric label="XP Target" value={plan.rewards?.xp_target || 180} />
                <Metric label="Badge Goal" value={plan.rewards?.badge || "Steady Climber"} />
              </section>

              <section style={panelStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: "0 0 6px" }}>Daily Quests</h2>
                    <p style={{ margin: 0, color: "#64748b" }}>{plan.weekly_goal}</p>
                  </div>
                  <button type="button" onClick={loadPlan} style={buttonStyle}>Refresh Plan</button>
                </div>
                <div style={questGridStyle}>
                  {(plan.daily_quests || []).map((quest) => (
                    <article key={quest.id} style={questStyle}>
                      <span style={pillStyle}>{quest.xp} XP</span>
                      <h3 style={{ margin: "10px 0 6px", color: "#0f172a" }}>{quest.title}</h3>
                      <p style={{ margin: "0 0 8px", color: "#475569", lineHeight: 1.6 }}>{quest.task}</p>
                      <strong style={{ color: "#15803d" }}>{quest.courseCode}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <section style={{ ...panelStyle, marginTop: 18 }}>
                <h2 style={{ marginTop: 0 }}>Priority Courses</h2>
                <div style={{ display: "grid", gap: 12 }}>
                  {(plan.weak_areas || []).map((course) => (
                    <article key={course.courseCode} style={courseStyle}>
                      <div>
                        <p style={{ margin: "0 0 4px", color: "#15803d", fontWeight: 800 }}>{course.courseCode}</p>
                        <h3 style={{ margin: 0, color: "#0f172a" }}>{course.title}</h3>
                        <p style={{ margin: "8px 0 0", color: "#64748b" }}>{course.reason}</p>
                      </div>
                      <span style={{
                        alignSelf: "start",
                        borderRadius: 999,
                        padding: "6px 10px",
                        background: course.priority === "high" ? "#fee2e2" : "#e0f2fe",
                        color: course.priority === "high" ? "#991b1b" : "#075985",
                        fontWeight: 800,
                        fontSize: 12,
                        textTransform: "uppercase"
                      }}>
                        {course.priority}
                      </span>
                      <div style={{ gridColumn: "1 / -1", display: "grid", gap: 8 }}>
                        {(course.next_actions || []).map((action, index) => (
                          <div key={`${course.courseCode}-${action.type}-${index}`} style={actionStyle}>
                            <span>{action.label}</span>
                            <strong>{action.minutes} min</strong>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricStyle}>
      <p style={{ margin: 0, color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
      <strong style={{ display: "block", marginTop: 8, color: "#0f172a", fontSize: 22 }}>{value}</strong>
    </div>
  );
}

const noticeStyle = {
  padding: 14,
  borderRadius: 8,
  background: "#ecfeff",
  color: "#155e75"
};

const metricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginBottom: 18
};

const metricStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 16
};

const panelStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 18
};

const buttonStyle = {
  border: 0,
  borderRadius: 8,
  padding: "10px 14px",
  background: "#16a34a",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer"
};

const questGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 16
};

const questStyle = {
  border: "1px solid #dcfce7",
  borderRadius: 8,
  padding: 16,
  background: "#f7fef9"
};

const pillStyle = {
  display: "inline-block",
  borderRadius: 999,
  padding: "5px 9px",
  background: "#dcfce7",
  color: "#166534",
  fontWeight: 800,
  fontSize: 12
};

const courseStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 16
};

const actionStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: 10,
  borderRadius: 8,
  background: "#f8fafc",
  color: "#334155"
};
