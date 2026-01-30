import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    await api.post("/auth/register", { full_name, email, password });
    window.location.href = "/login";
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Register</h2>
      <input placeholder="Full Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={submit}>Create Account</button>
    </div>
  );
}
