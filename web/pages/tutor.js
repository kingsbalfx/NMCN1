import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../services/api";

const quickPrompts = [
  "Explain vital signs monitoring in simple terms",
  "How do I answer priority nursing questions?",
  "What are the five rights of medication administration?",
  "Make wound dressing easy to remember"
];

export default function TutorPage() {
  const [courses, setCourses] = useState([]);
  const [courseCode, setCourseCode] = useState("");
  const [question, setQuestion] = useState("");
  const [learningLevel, setLearningLevel] = useState("simple");
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
    loadHistory();
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.code === courseCode),
    [courses, courseCode]
  );

  async function loadCourses() {
    try {
      const res = await api.get("/curriculum/ai/courses");
      const list = res.data.courses || [];
      setCourses(list);
      if (list[0]?.code) setCourseCode(list[0].code);
    } catch (err) {
      setError("Could not load curriculum courses.");
    }
  }

  async function loadHistory() {
    try {
      const res = await api.get("/questions/tutor/history");
      setHistory(res.data.history || []);
    } catch (err) {
      // History is helpful, but the tutor should still be usable without it.
    }
  }

  async function askTutor(prompt = question) {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/questions/tutor/ask", {
        question_text: prompt,
        courseCode,
        topic: selectedCourse?.title || "General Nursing",
        learningLevel
      });
      setAnswer(res.data.explanation);
      setQuestion(prompt);
      await loadHistory();
    } catch (err) {
      setError(err?.response?.data?.error || "The tutor could not answer right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 48 }}>
          <section style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.7fr)",
            gap: 20,
            alignItems: "stretch"
          }}>
            <div style={{
              borderRadius: 8,
              padding: 28,
              background: "#102a2c",
              color: "white",
              border: "1px solid #1f4a4d"
            }}>
              <p style={{ margin: "0 0 8px", color: "#8ee3d0", fontWeight: 700 }}>AI Tutor</p>
              <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.08 }}>Ask the curriculum to teach you.</h1>
              <p style={{ maxWidth: 650, color: "#c7d2d4", lineHeight: 1.7 }}>
                Get simple explanations, exam steps, bedside examples, memory hooks, and image prompts for nursing topics.
              </p>

              <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
                <select
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  style={inputStyle}
                >
                  {courses.map((course) => (
                    <option key={course.code} value={course.code}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={5}
                  placeholder="Ask anything from your nursing curriculum..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <select
                    value={learningLevel}
                    onChange={(e) => setLearningLevel(e.target.value)}
                    style={{ ...inputStyle, width: 180 }}
                  >
                    <option value="simple">Simple</option>
                    <option value="exam">Exam focus</option>
                    <option value="clinical">Clinical practice</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => askTutor()}
                    disabled={loading || !question.trim()}
                    style={primaryButtonStyle}
                  >
                    {loading ? "Thinking..." : "Ask Tutor"}
                  </button>
                </div>
              </div>
            </div>

            <aside style={{
              borderRadius: 8,
              padding: 22,
              background: "#f7fbfb",
              border: "1px solid #dbe8e7"
            }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Quick Prompts</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => askTutor(prompt)}
                    style={promptButtonStyle}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </aside>
          </section>

          {error && (
            <p style={{ padding: 14, borderRadius: 8, background: "#fee2e2", color: "#991b1b" }}>{error}</p>
          )}

          {answer && (
            <section style={answerPanelStyle}>
              <div>
                <p style={{ margin: "0 0 6px", color: "#0f766e", fontWeight: 700 }}>{answer.topic}</p>
                <h2 style={{ margin: "0 0 12px", color: "#0f172a" }}>Tutor Explanation</h2>
                <p style={{ color: "#334155", lineHeight: 1.8 }}>{answer.answer}</p>
              </div>

              <div style={twoColumnStyle}>
                <InfoBlock title="Steps" items={answer.steps || []} />
                <div style={miniPanelStyle}>
                  <h3 style={miniTitleStyle}>Bedside Example</h3>
                  <p style={miniTextStyle}>{answer.bedside_example}</p>
                </div>
                <div style={miniPanelStyle}>
                  <h3 style={miniTitleStyle}>Memory Hook</h3>
                  <p style={miniTextStyle}>{answer.memory_hook}</p>
                </div>
                <div style={miniPanelStyle}>
                  <h3 style={miniTitleStyle}>Image Prompt</h3>
                  <p style={miniTextStyle}>{answer.image_prompt}</p>
                </div>
              </div>

              {answer.quick_check && (
                <div style={{
                  marginTop: 18,
                  padding: 18,
                  borderRadius: 8,
                  background: "#ecfeff",
                  border: "1px solid #a5f3fc"
                }}>
                  <strong style={{ color: "#155e75" }}>{answer.quick_check.question}</strong>
                  <p style={{ marginBottom: 0, color: "#164e63" }}>{answer.quick_check.answer}</p>
                </div>
              )}
            </section>
          )}

          <section style={{ marginTop: 24 }}>
            <h2 style={{ color: "#0f172a", fontSize: 20 }}>Recent Tutor Sessions</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {history.length === 0 && (
                <p style={{ color: "#64748b" }}>No tutor sessions yet. Ask your first question above.</p>
              )}
              {history.map((item) => (
                <article key={item.id} style={{
                  padding: 16,
                  borderRadius: 8,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0"
                }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#0f172a" }}>{item.question}</p>
                  <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
                    {item.response?.answer || "Saved tutor response"}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function InfoBlock({ title, items }) {
  return (
    <div style={miniPanelStyle}>
      <h3 style={miniTitleStyle}>{title}</h3>
      <ol style={{ margin: 0, paddingLeft: 18, color: "#475569", lineHeight: 1.7 }}>
        {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
      </ol>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 14,
  color: "#0f172a",
  background: "#ffffff"
};

const primaryButtonStyle = {
  border: 0,
  borderRadius: 8,
  padding: "12px 18px",
  background: "#14b8a6",
  color: "#052e2b",
  fontWeight: 800,
  cursor: "pointer"
};

const promptButtonStyle = {
  textAlign: "left",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: 12,
  background: "#ffffff",
  color: "#0f172a",
  cursor: "pointer"
};

const answerPanelStyle = {
  marginTop: 24,
  padding: 24,
  borderRadius: 8,
  background: "#ffffff",
  border: "1px solid #dbe8e7",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)"
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14
};

const miniPanelStyle = {
  padding: 16,
  borderRadius: 8,
  background: "#f8fafc",
  border: "1px solid #e2e8f0"
};

const miniTitleStyle = {
  margin: "0 0 8px",
  color: "#0f172a",
  fontSize: 15
};

const miniTextStyle = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.7
};
