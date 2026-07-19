import { useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      if (isSignup) {
        const r = await api.post("/auth/signup", { email, password });
        login(r.data.access_token);
      } else {
        const form = new URLSearchParams();
        form.append("username", email);
        form.append("password", password);
        const r = await api.post("/auth/login", form);
        login(r.data.access_token);
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>{isSignup ? "Sign Up" : "Log In"}</h2>
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 8, padding: 8 }} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 8, padding: 8 }} />
      <button onClick={submit} style={{ width: "100%", padding: 8 }}>
        {isSignup ? "Sign Up" : "Log In"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p style={{ cursor: "pointer", color: "blue" }} onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? "Have an account? Log in" : "No account? Sign up"}
      </p>
    </div>
  );
}
