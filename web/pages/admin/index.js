import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminDashboard() {
  const cards = [
    { title: "Upload Curriculum", href: "/admin/curriculum", desc: "Parse curriculum text into AI-ready courses and learning blocks", icon: "AI" },
    { title: "Clinical Logbook", href: "/admin/clinical-logbook", desc: "Review submitted student procedures and supervisor evidence" },
    { title: "Generate Questions (AI)", href: "/admin/generate-questions", desc: "Auto-generate exam questions using AI", icon: "✨" },
    { title: "Manage Subjects", href: "/admin/subjects", desc: "View and organize nursing subjects and topics" },
    { title: "Manage Questions", href: "/admin/questions", desc: "Add, edit, and remove exam questions" },
    { title: "View Users", href: "/admin/users", desc: "Monitor student accounts and subscriptions" }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <h1 style={{ marginTop: 0, color: "#063c91" }}>Admin Panel</h1>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
          {cards.map(card => (
            <a key={card.href} href={card.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ padding: 20, borderRadius: 10, background: "#fff", boxShadow: "0 4px 12px rgba(10,20,40,0.08)", cursor: "pointer" }}>
                <h3 style={{ marginTop: 0, color: "#0066ff" }}>{card.title}</h3>
                <p style={{ marginBottom: 0, color: "#666", fontSize: 14 }}>{card.desc}</p>
              </div>
            </a>
          ))}
        </section>
      </Layout>
    </ProtectedRoute>
  );
}
