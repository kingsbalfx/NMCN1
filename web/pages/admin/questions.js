import { useState } from "react";
import api from "../../services/api";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function QuestionsAdmin() {
  const [form, setForm] = useState({});

  const submit = async () => {
    await api.post("/admin/questions", form);
    alert("Question added");
  };

  return (
    <ProtectedRoute>
      <Layout>
        <h2>Add Question</h2>

        <input placeholder="Topic ID" onChange={e => setForm({ ...form, topic_id: e.target.value })} />
        <select onChange={e => setForm({ ...form, type: e.target.value })}>
          <option value="mcq">MCQ</option>
          <option value="essay">Essay</option>
          <option value="fill_blank">Fill Blank</option>
          <option value="clinical">Clinical</option>
        </select>

        <select onChange={e => setForm({ ...form, difficulty: e.target.value })}>
          <option value="easy">Easy</option>
          <option value="hard">Hard</option>
          <option value="pro">Pro</option>
        </select>

        <textarea
          placeholder="Question"
          onChange={e => setForm({ ...form, question: e.target.value })}
        />

        <textarea
          placeholder="Options (JSON for MCQ)"
          onChange={e => setForm({ ...form, options: JSON.parse(e.target.value) })}
        />

        <input
          placeholder="Correct Answer"
          onChange={e => setForm({ ...form, correct_answer: e.target.value })}
        />

        <textarea
          placeholder="Explanation"
          onChange={e => setForm({ ...form, explanation: e.target.value })}
        />

        <button onClick={submit}>Save Question</button>
      </Layout>
    </ProtectedRoute>
  );
}
