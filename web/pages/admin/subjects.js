import { useEffect, useState } from "react";
import api from "../../services/api";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function SubjectsAdmin() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    api.get("/admin/subjects").then(res => setSubjects(res.data));
  }, []);

  const add = async () => {
    await api.post("/admin/subjects", { name, category });
    window.location.reload();
  };

  return (
    <ProtectedRoute>
      <Layout>
        <h2>Subjects</h2>

        <input placeholder="Subject Name" onChange={e => setName(e.target.value)} />
        <input placeholder="Category (nursing/midwifery)" onChange={e => setCategory(e.target.value)} />
        <button onClick={add}>Add Subject</button>

        <ul>
          {subjects.map(s => (
            <li key={s.id}>{s.name} ({s.category})</li>
          ))}
        </ul>
      </Layout>
    </ProtectedRoute>
  );
}
