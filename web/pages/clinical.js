import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Clinical() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    api.get("/exams/clinical/1").then(res => {
      setQuestions(res.data);
    });
  }, []);

  return (
    <ProtectedRoute>
      <Layout>
        <h2>Clinical / OSCE Exam</h2>

        {questions.map((q, i) => (
          <div key={q.id} style={{ marginBottom: 20 }}>
            <p>{i + 1}. {q.question}</p>
            <textarea rows="4" style={{ width: "100%" }} />
          </div>
        ))}

        <button>Submit Clinical Exam</button>
      </Layout>
    </ProtectedRoute>
  );
}
