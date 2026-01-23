import { useEffect, useState } from "react";
import api from "../../services/api";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/users").then(res => setUsers(res.data));
  }, []);

  return (
    <ProtectedRoute>
      <Layout>
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Subscription</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.subscription_expiry || "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Layout>
    </ProtectedRoute>
  );
}
