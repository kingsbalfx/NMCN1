import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../services/api";

export default function CurriculumQuiz() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [studyPack, setStudyPack] = useState(null);
  const [game, setGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const groupedCourses = useMemo(() => {
    return courses.reduce((groups, course) => {
      const key = course.semester || "general";
      groups[key] = groups[key] || [];
      groups[key].push(course);
      return groups;
    }, {});
  }, [courses]);

  const loadCourses = async () => {
    try {
      const response = await api.get("/curriculum/ai/courses");
      setCourses(response.data.courses || []);
      if (response.data.courses?.length) setSelectedCourse(response.data.courses[0].code);
    } catch (error) {
      console.error("Failed to load curriculum:", error);
    }
  };

  const loadStudyPack = async (courseCode = selectedCourse) => {
    if (!courseCode) return;
    setLoading(true);
    setFeedback(null);
    setResults(null);
    setGame(null);

    try {
      const response = await api.get(`/curriculum/ai/study-pack/${courseCode}`);
      setStudyPack(response.data.pack);
    } catch (error) {
      alert(error?.response?.data?.error || "Failed to generate study pack");
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    setFeedback(null);
    setResults(null);

    try {
      const response = await api.post("/curriculum/ai/game/start", {
        courseCode: selectedCourse,
        questionCount: 6,
        timeLimit: 20,
      });
      setGame(response.data.game);
      setCurrentQuestion(0);
      setSelectedAnswer("");
    } catch (error) {
      alert(error?.response?.data?.error || "Failed to start mission");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!game || !selectedAnswer) return;
    const question = game.questions[currentQuestion];

    try {
      const response = await api.post("/curriculum/ai/game/answer", {
        gameId: game.id,
        questionId: question.id,
        answer: selectedAnswer,
        timeSpent: 20,
      });
      setFeedback(response.data);
    } catch (error) {
      alert(error?.response?.data?.error || "Failed to submit answer");
    }
  };

  const nextQuestion = async () => {
    setFeedback(null);
    setSelectedAnswer("");

    if (currentQuestion < game.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    const response = await api.post("/curriculum/ai/game/end", { gameId: game.id });
    setResults(response.data);
    setGame(null);
  };

  const selectedCourseMeta = courses.find((course) => course.code === selectedCourse);
  const activeQuestion = game?.questions?.[currentQuestion];

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ minHeight: "calc(100vh - 140px)", background: "#07111f", color: "#eef6ff", margin: "-20px", padding: "24px" }}>
          <div style={{ maxWidth: 1220, margin: "0 auto" }}>
            <header style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 18, alignItems: "stretch", marginBottom: 18 }}>
              <div style={{ borderRadius: 8, background: "linear-gradient(135deg, #0f766e, #0f172a 55%, #7c2d12)", padding: 24, border: "1px solid rgba(255,255,255,0.12)" }}>
                <p style={{ margin: 0, color: "#a7f3d0", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 800 }}>NurseQuest Mission Deck</p>
                <h1 style={{ margin: "8px 0", fontSize: 34, lineHeight: 1.05 }}>Learn the curriculum like a clinical adventure.</h1>
                <p style={{ margin: 0, color: "#cbd5e1", maxWidth: 760 }}>
                  Pick a course, generate a simple AI study pack, then enter a CBT mission mapped to the General Nursing Curriculum.
                </p>
              </div>
              <div style={{ borderRadius: 8, background: "#0f172a", padding: 18, border: "1px solid rgba(255,255,255,0.12)" }}>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5 }}>Selected Course</p>
                <h2 style={{ margin: "10px 0 4px", fontSize: 20 }}>{selectedCourseMeta?.title || "Choose a course"}</h2>
                <p style={{ margin: 0, color: "#38bdf8", fontWeight: 700 }}>{selectedCourseMeta?.code || "No code"}</p>
              </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
              <aside style={{ borderRadius: 8, background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", padding: 16, maxHeight: 720, overflow: "auto" }}>
                <h2 style={{ marginTop: 0, fontSize: 16 }}>Course Map</h2>
                {Object.entries(groupedCourses).map(([semester, semesterCourses]) => (
                  <div key={semester} style={{ marginBottom: 16 }}>
                    <p style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2 }}>{semester.replace(/_/g, " ")}</p>
                    <div style={{ display: "grid", gap: 8 }}>
                      {semesterCourses.map((course) => (
                        <button
                          key={`${semester}-${course.code}`}
                          onClick={() => {
                            setSelectedCourse(course.code);
                            setStudyPack(null);
                            setGame(null);
                            setResults(null);
                          }}
                          style={{
                            textAlign: "left",
                            padding: 12,
                            borderRadius: 8,
                            border: course.code === selectedCourse ? "1px solid #22d3ee" : "1px solid rgba(255,255,255,0.08)",
                            background: course.code === selectedCourse ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)",
                            color: "#eef6ff",
                            cursor: "pointer",
                          }}
                        >
                          <strong style={{ display: "block", fontSize: 13 }}>{course.code}</strong>
                          <span style={{ color: "#cbd5e1", fontSize: 13 }}>{course.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </aside>

              <main style={{ display: "grid", gap: 18 }}>
                <section style={{ borderRadius: 8, background: "#f8fafc", color: "#0f172a", padding: 18 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 style={{ margin: 0 }}>{selectedCourseMeta?.title || "Curriculum Mission"}</h2>
                      <p style={{ margin: "4px 0 0", color: "#64748b" }}>Generate lessons, flashcards, clinical scenarios, and CBT questions.</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => loadStudyPack()} disabled={loading || !selectedCourse} style={buttonStyle("#0f766e")}>
                        {loading ? "Generating..." : "Generate Study Pack"}
                      </button>
                      <button onClick={startGame} disabled={loading || !selectedCourse} style={buttonStyle("#7c2d12")}>
                        Start CBT Mission
                      </button>
                    </div>
                  </div>
                </section>

                {studyPack && (
                  <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)", gap: 18 }}>
                    <div style={panelLight}>
                      <p style={eyebrow}>AI Lesson</p>
                      <h2 style={{ marginTop: 0 }}>{studyPack.lesson?.title}</h2>
                      <p style={{ color: "#334155", lineHeight: 1.7 }}>{studyPack.lesson?.summary}</p>
                      <div style={{ display: "grid", gap: 10 }}>
                        {(studyPack.lesson?.sections || []).slice(0, 5).map((section) => (
                          <div key={section.heading} style={{ padding: 12, borderRadius: 8, background: "#ecfeff", border: "1px solid #bae6fd" }}>
                            <strong>{section.heading}</strong>
                            <p style={{ margin: "6px 0", color: "#334155" }}>{section.explanation}</p>
                            <small style={{ color: "#0f766e" }}>{section.bedside_example}</small>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={panelDark}>
                      <p style={eyebrowBlue}>Visual Prompt</p>
                      <p style={{ lineHeight: 1.7 }}>{studyPack.lesson?.image_prompt}</p>
                      <p style={eyebrowBlue}>Clinical Scenario</p>
                      <p style={{ lineHeight: 1.7 }}>{studyPack.clinical_scenario?.prompt}</p>
                      <ul style={{ paddingLeft: 18, color: "#cbd5e1" }}>
                        {(studyPack.clinical_scenario?.tasks || []).map((task) => <li key={task}>{task}</li>)}
                      </ul>
                    </div>
                  </section>
                )}

                {studyPack && (
                  <section style={panelLight}>
                    <p style={eyebrow}>Flashcards</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                      {(studyPack.flashcards || []).map((card) => (
                        <div key={card.front} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
                          <strong>{card.front}</strong>
                          <p style={{ marginBottom: 0, color: "#475569" }}>{card.back}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {game && activeQuestion && (
                  <section style={panelLight}>
                    <p style={eyebrow}>CBT Mission {currentQuestion + 1} of {game.questions.length}</p>
                    <h2 style={{ marginTop: 0 }}>{activeQuestion.question}</h2>
                    <div style={{ display: "grid", gap: 10 }}>
                      {Object.entries(activeQuestion.options || {}).map(([key, value]) => (
                        <label key={key} style={{ display: "flex", gap: 10, alignItems: "center", padding: 12, borderRadius: 8, border: selectedAnswer === key ? "2px solid #0f766e" : "1px solid #cbd5e1", cursor: "pointer" }}>
                          <input type="radio" name="answer" value={key} checked={selectedAnswer === key} onChange={() => setSelectedAnswer(key)} />
                          <span><strong>{key}.</strong> {value}</span>
                        </label>
                      ))}
                    </div>

                    {feedback && (
                      <div style={{ marginTop: 14, padding: 14, borderRadius: 8, background: feedback.correct ? "#dcfce7" : "#fee2e2", color: feedback.correct ? "#166534" : "#991b1b" }}>
                        <strong>{feedback.correct ? "Correct" : "Review this"}</strong>
                        <p style={{ margin: "6px 0 0" }}>{feedback.explanation}</p>
                      </div>
                    )}

                    <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                      {!feedback ? (
                        <button onClick={submitAnswer} disabled={!selectedAnswer} style={buttonStyle("#0f766e")}>Submit Answer</button>
                      ) : (
                        <button onClick={nextQuestion} style={buttonStyle("#0f172a")}>
                          {currentQuestion === game.questions.length - 1 ? "Finish Mission" : "Next Question"}
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {results && (
                  <section style={panelLight}>
                    <p style={eyebrow}>Mission Complete</p>
                    <h2 style={{ margin: 0 }}>{results.badge}</h2>
                    <p style={{ fontSize: 42, margin: "10px 0", fontWeight: 900, color: results.passed ? "#0f766e" : "#b91c1c" }}>{results.percentage}%</p>
                    <p style={{ color: "#475569" }}>You answered {results.correctAnswers} of {results.totalQuestions} questions correctly.</p>
                  </section>
                )}
              </main>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

const buttonStyle = (background) => ({
  border: 0,
  borderRadius: 8,
  background,
  color: "#fff",
  padding: "11px 14px",
  fontWeight: 800,
  cursor: "pointer",
});

const panelLight = {
  borderRadius: 8,
  background: "#fff",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  padding: 18,
};

const panelDark = {
  borderRadius: 8,
  background: "#0f172a",
  color: "#eef6ff",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: 18,
};

const eyebrow = {
  margin: "0 0 8px",
  color: "#0f766e",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.6,
  textTransform: "uppercase",
};

const eyebrowBlue = {
  margin: "0 0 8px",
  color: "#67e8f9",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1.6,
  textTransform: "uppercase",
};
