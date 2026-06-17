import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@resolvex.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const currentUser = await login({ email, password });
      navigate(currentUser.role === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm bg-orange-500 text-black">
            <ShieldCheck size={28} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back to ResolveX</h1>
          <p className="mt-2 text-sm text-neutral-400">Resolve customer issues faster.</p>
        </div>

        <form className="panel-card rounded-sm p-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-3.5 text-neutral-500" size={18} />
                <input
                  className="field pl-10"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 text-neutral-500" size={18} />
                <input
                  className="field pl-10"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

            <button className="primary-button w-full" disabled={submitting} type="submit">
              {submitting ? "Signing in..." : "Login"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-400">
            New customer?{" "}
            <Link className="font-semibold text-orange-400 hover:text-orange-300" to="/register">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
