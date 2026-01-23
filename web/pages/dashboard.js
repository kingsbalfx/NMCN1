import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <h1>Welcome to Kingsbal Digital Healthcare Bridge</h1>
        <p>
          Nursing & Midwifery CBT, Clinical Exams & Professional Practice
        </p>
      </Layout>
    </ProtectedRoute>
  );
}
