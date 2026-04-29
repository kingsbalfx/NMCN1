'use client';

import { useState } from "react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import axios from "axios";

export default function GenerateQuestionsPage() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState([]);

  const handleGenerateMultiple = async (e) => {
    e.preventDefault();
    if (!topic || count < 1 || count > 50) {
      setMessage("Please enter a valid topic and count (1-50)");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        "/api/admin/ai-questions/generate",
        { topic, count: parseInt(count), difficulty },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      setQuestions(response.data.questions || []);
      setMessage(`✅ Generated ${response.data.questions?.length || count} questions successfully`);
      setTopic("");
      setCount(5);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOne = async (e) => {
    e.preventDefault();
    if (!topic) {
      setMessage("Please enter a topic");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        "/api/admin/ai-questions/generate-one",
        { topic, difficulty },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      setQuestions([response.data.question]);
      setMessage("✅ Generated 1 question successfully");
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 0" }}>
          <h1 style={{ marginTop: 0, color: "#063c91" }}>AI Question Generator</h1>
          <p style={{ color: "#666", marginBottom: 30 }}>Generate nursing exam questions automatically using AI</p>

          <form onSubmit={handleGenerateMultiple} style={{ background: "#f9f9f9", padding: 20, borderRadius: 10, marginBottom: 30 }}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: 600, color: "#063c91" }}>Topic *</label>
              <input
                type="text"
                placeholder="e.g., Pharmacology, Anatomy, Pathophysiology"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontFamily: "inherit",
                  fontSize: 14,
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 5, fontWeight: 600, color: "#063c91" }}>Number of Questions *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontFamily: "inherit",
                    fontSize: 14,
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 5, fontWeight: 600, color: "#063c91" }}>Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontFamily: "inherit",
                    fontSize: 14,
                    boxSizing: "border-box"
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 20px",
                  background: "#0066ff",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Generating..." : "Generate Multiple"}
              </button>

              <button
                type="button"
                onClick={handleGenerateOne}
                disabled={loading || !topic}
                style={{
                  padding: "12px 20px",
                  background: "#00cc88",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading || !topic ? 0.7 : 1
                }}
              >
                {loading ? "Generating..." : "Generate 1"}
              </button>
            </div>
          </form>

          {message && (
            <div style={{
              padding: 15,
              borderRadius: 6,
              marginBottom: 20,
              background: message.includes("✅") ? "#e8f5e9" : "#ffebee",
              color: message.includes("✅") ? "#2e7d32" : "#c62828",
              fontWeight: 500
            }}>
              {message}
            </div>
          )}

          {questions.length > 0 && (
            <div>
              <h2 style={{ color: "#063c91", marginBottom: 15 }}>Generated Questions ({questions.length})</h2>
              {questions.map((q, idx) => (
                <div key={idx} style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 15
                }}>
                  <p style={{ marginBottom: 10, fontWeight: 500 }}>
                    <strong>Q{idx + 1}:</strong> {q.question || q.text || JSON.stringify(q)}
                  </p>
                  {q.options && (
                    <ul style={{ marginLeft: 20, marginBottom: 10 }}>
                      {q.options.map((opt, i) => (
                        <li key={i} style={{ marginBottom: 5 }}>{opt}</li>
                      ))}
                    </ul>
                  )}
                  {q.answer && (
                    <p style={{ color: "#0066ff", marginBottom: 0 }}>
                      <strong>Answer:</strong> {q.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
