import { FormEvent, useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await register({ full_name: fullName, email, password });
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Registration failed. Check the form or try another email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm bg-orange-500 text-black">
            <UserPlus size={28} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create your ResolveX account</h1>
          <p className="mt-2 text-sm text-neutral-400">Resolve customer issues faster.</p>
        </div>

        <form className="panel-card rounded-sm p-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="fullName">
                Full name
              </label>
              <input
                className="field mt-2"
                id="fullName"
                minLength={2}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                className="field mt-2"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                className="field mt-2"
                id="password"
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && <p className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

            <button className="primary-button w-full" disabled={submitting} type="submit">
              {submitting ? "Creating..." : "Register"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-400">
            Already registered?{" "}
            <Link className="font-semibold text-orange-400 hover:text-orange-300" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
