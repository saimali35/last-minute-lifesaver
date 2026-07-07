import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function Signup() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  async function handleSignup() {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data?.message || "Signup failed");
        return;
      }

      // Registration also returns a token, so log the user straight in
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
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

        <h2 className="text-lg font-semibold mb-1">Create your account</h2>
        <p className="text-sm text-muted mb-6">Start beating deadlines today</p>

        {error && (
          <p className="text-danger text-sm mb-4 bg-[#EF444411] px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-muted font-grotesk"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-muted font-grotesk"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-muted font-grotesk"
          />
          <button
            onClick={handleSignup}
            disabled={loading}
            className="bg-amber text-bg font-bold py-2.5 rounded-lg hover:brightness-110 transition cursor-pointer border-0 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </div>

        <p className="text-sm text-muted text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-amber cursor-pointer hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}