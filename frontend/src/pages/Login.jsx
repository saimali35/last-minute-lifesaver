import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const navigate            = useNavigate();

  function handleLogin() {
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    // TODO: replace with real backend call later
    localStorage.setItem("isLoggedIn", "true");
    navigate("/");
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
            className="bg-amber text-bg font-bold py-2.5 rounded-lg hover:brightness-110 transition cursor-pointer border-0 mt-1"
          >
            Sign In
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