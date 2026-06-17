import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, UserRound, UserPlus } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Card from "../components/Card";
import { Input } from "../components/Input";
import ThemeToggle from "../components/ThemeToggle";
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
    <div className="min-h-screen bg-neutral-50 text-neutral-950 transition-colors dark:bg-neutral-950 dark:text-white">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="relative hidden min-h-[calc(100vh-3rem)] overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(249,115,22,0.22),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-500 text-neutral-950">
                <ShieldCheck size={21} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">ResolveX</p>
                <p className="text-xs text-neutral-400">Customer support workspace</p>
              </div>
            </div>

            <div className="mt-24 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Customer registration</p>
              <h1 className="mt-5 text-5xl font-semibold tracking-tight">Get support into one clear queue.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-neutral-300">
                Create a customer account, submit tickets, and keep the full conversation history attached to every issue.
              </p>
            </div>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-3">
            {["Clear intake", "Priority context", "Conversation history"].map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle2 className="mb-3 text-orange-400" size={18} aria-hidden="true" />
                <p className="text-sm font-medium text-white">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-3rem)] items-center justify-center py-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-neutral-950 text-orange-500 dark:bg-white dark:text-orange-600 lg:hidden">
                <UserPlus size={24} aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">Create account</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                Join ResolveX as a customer
              </h1>
              <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                Customer accounts can create tickets and track support responses.
              </p>
            </div>

            <Card className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="label" htmlFor="fullName">
                      Full name
                    </label>
                    <div className="relative mt-2">
                      <UserRound className="pointer-events-none absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" size={18} />
                      <Input
                        className="pl-10"
                        id="fullName"
                        minLength={2}
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="email">
                      Email
                    </label>
                    <div className="relative mt-2">
                      <Mail className="pointer-events-none absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" size={18} />
                      <Input
                        className="pl-10"
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
                    <Input
                      className="mt-2"
                      id="password"
                      minLength={8}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Use at least 8 characters.</p>
                  </div>

                  {error && (
                    <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                      {error}
                    </p>
                  )}

                  <Button className="w-full" disabled={submitting} type="submit" variant="primary">
                    {submitting ? "Creating..." : "Register"}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </div>

                <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
                  Already registered?{" "}
                  <Link className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400" to="/login">
                    Login
                  </Link>
                </p>
              </form>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
