import { useState } from "react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../services/api";

export default function AdminCurriculum() {
  const [title, setTitle] = useState("General Nursing Curriculum");
  const [curriculumText, setCurriculumText] = useState("");
  const [curriculumFile, setCurriculumFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);
  const [upload, setUpload] = useState(null);
  const [error, setError] = useState("");

  const parseCurriculum = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setUpload(null);

    try {
      const res = await api.post("/curriculum/ai/import", {
        title,
        curriculum_text: curriculumText,
      });
      setResult(res.data.parsed);
      setUpload(res.data.upload || null);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not parse curriculum");
    } finally {
      setLoading(false);
    }
  };

  const publishCurriculum = async () => {
    if (!upload?.id) return;
    setPublishing(true);
    setError("");

    try {
      const res = await api.post(`/curriculum/ai/uploads/${upload.id}/publish`);
      setUpload(res.data.upload);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not publish curriculum");
    } finally {
      setPublishing(false);
    }
  };

  const parseCurriculumFile = async () => {
    if (!curriculumFile) return;
    setLoading(true);
    setError("");
    setResult(null);
    setUpload(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("curriculum", curriculumFile);
      const res = await api.post("/curriculum/ai/import-file", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data.parsed);
      setUpload(res.data.upload || null);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not parse curriculum file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 0 48px" }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#0891b2", fontWeight: 700 }}>
              Curriculum Engine
            </p>
            <h1 style={{ margin: "8px 0", fontSize: 32, color: "#0f172a" }}>Upload Curriculum for AI Learning</h1>
            <p style={{ margin: 0, color: "#64748b", maxWidth: 760 }}>
              Upload PDF, DOCX, TXT, or paste curriculum text. The AI parser converts it into courses, topics, clinical requirements, and student-friendly learning blocks.
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: 14, borderRadius: 8, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 20, alignItems: "start" }}>
            <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
              <label style={{ display: "block", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Curriculum title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", marginBottom: 16 }}
              />

              <label style={{ display: "block", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Curriculum file</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => setCurriculumFile(e.target.files?.[0] || null)}
                style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", marginBottom: 10 }}
              />
              <button
                onClick={parseCurriculumFile}
                disabled={loading || !curriculumFile}
                style={{ width: "100%", padding: 12, border: 0, borderRadius: 8, background: loading || !curriculumFile ? "#94a3b8" : "#0f766e", color: "#fff", fontWeight: 800, cursor: loading || !curriculumFile ? "not-allowed" : "pointer", marginBottom: 18 }}
              >
                {loading ? "Parsing file..." : "Parse Uploaded File"}
              </button>

              <label style={{ display: "block", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Curriculum text</label>
              <textarea
                value={curriculumText}
                onChange={(e) => setCurriculumText(e.target.value)}
                placeholder="Paste course list, objectives, clinical requirements, evaluation rules, and procedure logbook requirements..."
                rows={20}
                style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", resize: "vertical", lineHeight: 1.5 }}
              />

              <button
                onClick={parseCurriculum}
                disabled={loading || curriculumText.trim().length < 50}
                style={{ marginTop: 16, width: "100%", padding: 13, border: 0, borderRadius: 8, background: loading ? "#94a3b8" : "#0891b2", color: "#fff", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Parsing curriculum..." : "Parse Pasted Text"}
              </button>
            </section>

            <aside style={{ background: "#0f172a", color: "#e2e8f0", borderRadius: 8, padding: 20 }}>
              <h2 style={{ marginTop: 0, color: "#fff", fontSize: 18 }}>Phase 2 Review</h2>
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>
                This stage previews parsed curriculum content before publishing. Use it to check course names, detected sections, and AI readiness.
              </p>
              <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>Course extraction</div>
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>Student summary</div>
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>Clinical requirements</div>
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>Game-ready learning blocks</div>
              </div>
            </aside>
          </div>

          {result && (
            <section style={{ marginTop: 24, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, color: "#0f172a" }}>{result.title || title}</h2>
                  <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                    {result.summary?.total_courses || result.courses?.length || 0} courses detected
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#ecfeff", color: "#0e7490", fontWeight: 700, fontSize: 12 }}>
                    {upload?.status === "published" ? "Published" : result.aiGenerated ? "AI parsed" : "Fallback parsed"}
                  </span>
                  {upload?.id && upload.status !== "published" && (
                    <button
                      onClick={publishCurriculum}
                      disabled={publishing}
                      style={{ padding: "9px 12px", borderRadius: 8, border: 0, background: "#0f766e", color: "#fff", fontWeight: 800, cursor: publishing ? "not-allowed" : "pointer" }}
                    >
                      {publishing ? "Publishing..." : "Publish Version"}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                {(result.courses || []).slice(0, 12).map((course) => (
                  <div key={`${course.code}-${course.title}`} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
                    <p style={{ margin: 0, color: "#0891b2", fontWeight: 800, fontSize: 12 }}>{course.code}</p>
                    <h3 style={{ margin: "6px 0", color: "#0f172a", fontSize: 16 }}>{course.title}</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{course.semester || "General section"}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
