import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <Layout>
        <h1>Admin Panel</h1>
        <ul>
          <li><a href="/admin/subjects">Manage Subjects</a></li>
          <li><a href="/admin/questions">Manage Questions</a></li>
          <li><a href="/admin/users">View Users</a></li>
        </ul>
      </Layout>
    </ProtectedRoute>
  );
}
