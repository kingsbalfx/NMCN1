import api from "../services/api";

export default function Subscribe() {
  const pay = async () => {
    const res = await api.post("/payments/initiate", { amount: 1200 });

    // For demo mode this will redirect to a demo checkout; for real, use returned authorization_url
    window.location.href = res.data.authorization_url || res.data.authorizationUrl || "/payment-success";
  };

  return (
    <div style={{ maxWidth: 480, margin: "48px auto", padding: 24, borderRadius: 12, boxShadow: "0 6px 24px rgba(20,20,40,0.12)", background: "#fff" }}>
      <h2 style={{ margin: 0, color: "#0b3d91" }}>Activate Subscription</h2>
      <p style={{ marginTop: 8, fontSize: 18, color: "#222" }}>₦1,200 / 6 months</p>
      <p style={{ fontSize: 14, color: "#666", margin: "8px 0 16px 0" }}>Get 6 months of unlimited access at this special rate!</p>
      <ul style={{ paddingLeft: 18, color: "#555" }}>
        <li>Full access to question banks (6 months)</li>
        <li>Practice exams and progress tracking</li>
        <li>Student-friendly resources and explanations</li>
        <li>Performance analytics and recommendations</li>
      </ul>
      <button onClick={pay} style={{ marginTop: 16, width: "100%", padding: "12px 16px", background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Pay with Paystack</button>
    </div>
  );
}
