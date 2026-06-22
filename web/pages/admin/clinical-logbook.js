import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../services/api";

export default function ClinicalLogbookAdmin() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/clinical-logbook");
      setEntries(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    await api.post(`/admin/clinical-logbook/${id}/status`, { status });
    await loadEntries();
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 48 }}>
          <h1 style={{ marginTop: 0, color: "#0f172a" }}>Clinical Logbook Review</h1>
          <p style={{ color: "#64748b" }}>Review submitted student procedures and mark them approved or rejected.</p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            {loading ? (
              <p style={{ padding: 18 }}>Loading entries...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <Th>Student</Th>
                    <Th>Procedure</Th>
                    <Th>Category</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <Td>{entry.student_name || entry.email}</Td>
                      <Td>{entry.procedure_name}</Td>
                      <Td>{entry.category || "N/A"}</Td>
                      <Td>{entry.performed_at || "N/A"}</Td>
                      <Td><strong>{entry.status}</strong></Td>
                      <Td>
                        <button onClick={() => updateStatus(entry.id, "approved")} style={button("#0f766e")}>Approve</button>
                        <button onClick={() => updateStatus(entry.id, "rejected")} style={{ ...button("#b91c1c"), marginLeft: 8 }}>Reject</button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function Th({ children }) {
  return <th style={{ padding: 12, textAlign: "left", color: "#334155", fontSize: 13 }}>{children}</th>;
}

function Td({ children }) {
  return <td style={{ padding: 12, color: "#334155", fontSize: 14 }}>{children}</td>;
}

const button = (background) => ({
  border: 0,
  borderRadius: 8,
  padding: "8px 10px",
  background,
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
});
