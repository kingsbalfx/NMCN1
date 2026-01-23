import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function CBT() {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [time, setTime] = useState(3600);

  useEffect(() => {
    api.post("/exams/cbt/start", { topic_id: 1 }).then((res) => {
      setExam(res.data);
    });
  }, []);

  useEffect(() => {
    if (time <= 0) submit();
    const timer = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [time]);

  const submit = async () => {
    const payload = Object.entries(answers).map(([qid, ans]) => ({
      question_id: qid,
      answer: ans,
    }));

    const res = await api.post("/exams/cbt/submit", {
      answers: payload,
      exam_id: 1,
    });

    alert("Score: " + res.data.score);
  };

  if (!exam) return <p>Loading exam...</p>;

  return (
    <ProtectedRoute>
      <Layout>
        <h2>CBT Exam</h2>
        <p>Time Left: {Math.floor(time / 60)} mins</p>

        {exam.questions.map((q, i) => (
          <div key={q.id}>
            <p>{i + 1}. {q.question}</p>
            {Object.entries(q.options).map(([k, v]) => (
              <label key={k}>
                <input
                  type="radio"
                  name={q.id}
                  onChange={() =>
                    setAnswers({ ...answers, [q.id]: k })
                  }
                />
                {k}. {v}
              </label>
            ))}
          </div>
        ))}

        <button onClick={submit}>Submit Exam</button>
      </Layout>
    </ProtectedRoute>
  );
}
