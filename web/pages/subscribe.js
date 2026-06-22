import api from "../services/api";

export default function Subscribe() {
  const pay = async () => {
    const res = await api.post("/payments/initiate");
    window.location.href = res.data.authorization_url || res.data.authorizationUrl || "/payment-success";
  };

  return (
    <div style={{ maxWidth: 480, margin: "48px auto", padding: 24, borderRadius: 12, boxShadow: "0 6px 24px rgba(20,20,40,0.12)", background: "#fff" }}>
      <h2 style={{ margin: 0, color: "#0b3d91" }}>Activate Learning Access</h2>
      <p style={{ marginTop: 8, fontSize: 18, color: "#222" }}>NGN 450 lifetime access</p>
      <p style={{ fontSize: 14, color: "#666", margin: "8px 0 16px 0" }}>Pay once and keep permanent access to the learning game.</p>
      <ul style={{ paddingLeft: 18, color: "#555" }}>
        <li>Permanent access to downloaded question banks</li>
        <li>Practice exams and progress tracking</li>
        <li>Student-friendly resources and explanations</li>
        <li>Performance analytics and recommendations</li>
        <li>One account locked to one phone for fair use</li>
      </ul>
      <button onClick={pay} style={{ marginTop: 16, width: "100%", padding: "12px 16px", background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Pay with Paystack</button>
    </div>
  );
}
