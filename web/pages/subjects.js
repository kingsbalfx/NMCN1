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
          <li>pharmacoly</li>
          <li>nursing-ethics&laws</li>
          <li>geriatic-nursing</li>
          <li>primary-health-care</li>
          <li>Reproductive-health</li>
          <li>mental-health/psychiatric-nursing</li>
          <li>health-economics</li>
          <li>nutrition&dietetics</li>
          <li>Fundamentals</li>
          <li>paediatrics</li>
        </ul>
      </Layout>
    </ProtectedRoute>
  );
}
