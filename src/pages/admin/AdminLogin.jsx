// src/modules/admin/pages/AdminLoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: replace with real auth
    navigate("/admin/hub");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left side – short requirement-focused content */}
      <div
        className="
          hidden lg:flex w-1/2 relative overflow-hidden border-r border-slate-800
          animate-[slide-in-left_0.6s_ease-out]
        "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-emerald-400/10 to-purple-500/20" />

        <div className="relative z-10 p-10 flex flex-col justify-between">
          <header>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
              ROOTVERSE
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-50">
              Blue Economy
              <span className="block text-sky-300">
                Traceability Admin Console
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-300/80 max-w-md">
              Configure IDs, registries and compliance rules for the entire
              RootVerse network.
            </p>
          </header>

          <div className="mt-10 space-y-4">
            <FlowRow
              label="Registry Control"
              desc="Single source of truth for vessels, farms, ponds, marine farms and CoC actors."
            />
            <FlowRow
              label="Standards & Anchoring"
              desc="GS1, GDST and blockchain anchoring settings for each business layer."
            />
            <FlowRow
              label="Audit & Lookback"
              desc="Answer 'who handled what, when' with consignment-level history."
            />
          </div>

          <footer className="mt-10 text-[11px] text-slate-400/80">
            © {new Date().getFullYear()} RootVerse Platform. Admin use only.
          </footer>
        </div>

        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-emerald-400/25 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      </div>

      {/* Right side – login form */}
      <div
        className="
          flex-1 flex items-center justify-center p-6
          animate-[slide-in-right_0.6s_ease-out]
        "
      >
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <h1 className="text-2xl font-semibold text-slate-50">
              RootVerse Admin
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Sign in to manage registries and compliance.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950/60">
            <h2 className="text-lg font-semibold text-slate-50 mb-1">
              Admin Login
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Use your RootVerse admin credentials.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-300"
                >
                  Work Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Admin ID / email"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-xs mt-1">
                <label className="inline-flex items-center gap-2 text-slate-400">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-950 text-sky-500 focus:ring-sky-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-sky-400 hover:text-sky-300"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white py-2.5 transition-colors"
              >
                Sign in
              </button>
            </form>

            <p className="mt-4 text-[11px] text-slate-500">
              This console is restricted to authorized RootVerse HQ and
              operations staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowRow({ label, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      <div>
        <div className="text-sm font-medium text-slate-50">{label}</div>
        <div className="text-xs text-slate-300/80">{desc}</div>
      </div>
    </div>
  );
}
