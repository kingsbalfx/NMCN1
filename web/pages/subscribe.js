import api from "../services/api";

export default function Subscribe() {
  const pay = async () => {
    const res = await api.post("/payments/initiate", { amount: 5000 });

    window.location.href = res.data.authorization_url;
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Activate Subscription</h2>
      <p>₦5,000 / month</p>
      <button onClick={pay}>Pay with Paystack</button>
    </div>
  );
}
