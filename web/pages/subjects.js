import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Subjects() {
  return (
    <ProtectedRoute>
      <Layout>
        <h2>Subjects</h2>
        <ul>
          <li>Anatomy & Physiology</li>
          <li>Medical-Surgical Nursing</li>
          <li>Midwifery</li>
          <li>Community Health Nursing</li>
        </ul>
      </Layout>
    </ProtectedRoute>
  );
}
