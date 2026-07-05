import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function Login() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  async function handleLogin() {
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data?.message || "Login failed");
        return;
      }

      // Store the JWT and basic user info for later authenticated requests
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center font-grotesk">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
          >
            ⚡
          </div>
          <h1 className="text-xl font-bold">LifeSaver AI</h1>
        </div>

        <h2 className="text-lg font-semibold mb-1">Welcome back</h2>
        <p className="text-sm text-muted mb-6">Sign in to your account</p>

        {error && (
          <p className="text-danger text-sm mb-4 bg-[#EF444411] px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-muted font-grotesk"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-muted font-grotesk"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-amber text-bg font-bold py-2.5 rounded-lg hover:brightness-110 transition cursor-pointer border-0 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-sm text-muted text-center mt-4">
          Don't have an account?{" "}
          <span className="text-amber cursor-pointer hover:underline">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}