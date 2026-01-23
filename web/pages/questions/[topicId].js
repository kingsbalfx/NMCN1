import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "../../services/api";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function Questions() {
  const router = useRouter();
  const { topicId } = router.query;
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (topicId) {
      api.get(`/questions/${topicId}`).then((res) => {
        setQuestions(res.data);
      });
    }
  }, [topicId]);

  return (
    <ProtectedRoute>
      <Layout>
        <h2>Practice Questions</h2>
        {questions.map((q, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <p>{q.question}</p>
            {q.options &&
              Object.entries(q.options).map(([key, val]) => (
                <div key={key}>
                  <input type="radio" name={q.id} /> {key}. {val}
                </div>
              ))}
            <p style={{ color: "green" }}>{q.explanation}</p>
          </div>
        ))}
      </Layout>
    </ProtectedRoute>
  );
}
