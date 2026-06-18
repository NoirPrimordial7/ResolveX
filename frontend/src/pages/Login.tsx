import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Card from "../components/Card";
import { Input } from "../components/Input";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  { label: "Admin", email: "admin@resolvex.com", password: "Admin@123" },
  { label: "Agent", email: "agent@resolvex.com", password: "Agent@123" },
  { label: "Customer", email: "customer@resolvex.com", password: "Customer@123" }
];

function defaultRouteForRole(role: string) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "support_agent") return "/agent/dashboard";
  return "/customer/dashboard";
}

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@resolvex.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={defaultRouteForRole(user.role)} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const currentUser = await login({ email, password });
      navigate(defaultRouteForRole(currentUser.role), { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="premium-pattern min-h-screen text-[#F5F7FB] transition-colors">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="chat-pattern relative hidden min-h-[calc(100vh-3rem)] overflow-hidden rounded-md border border-white/10 bg-[#11141B] p-8 text-white shadow-2xl shadow-black/35 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(231,111,81,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-500 text-white shadow-glow">
                <ShieldCheck size={21} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">ResolveX</p>
                <p className="text-xs text-neutral-400">Support operations dashboard</p>
              </div>
            </div>

            <div className="mt-24 max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-200">
                <Sparkles size={14} aria-hidden="true" />
                Premium ticket management
              </p>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight">Resolve customer issues faster.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-neutral-300">
                Prioritize queues, assign ownership, and keep every conversation moving from one focused workspace.
              </p>
            </div>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-3">
            {["Live queue clarity", "Role aware routing", "Fast customer replies"].map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle2 className="mb-3 text-accent-400" size={18} aria-hidden="true" />
                <p className="text-sm font-medium text-white">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-3rem)] items-center justify-center py-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-accent-500 text-white shadow-glow lg:hidden">
                <ShieldCheck size={24} aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold uppercase text-accent-400">Welcome back</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">Sign in to ResolveX</h1>
              <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                Manage support tickets with a focused admin-grade workspace.
              </p>
            </div>

            <Card className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="label" htmlFor="email">
                      Email
                    </label>
                    <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-3 top-3 text-[#6F7A91]" size={18} />
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
                    <div className="relative mt-2">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-3 text-[#6F7A91]" size={18} />
                      <Input
                        className="pl-10"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                      {error}
                    </p>
                  )}

                  <Button className="w-full" disabled={submitting} type="submit" variant="primary">
                    {submitting ? "Signing in..." : "Login"}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </div>

                <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
                  New customer?{" "}
                  <Link className="font-semibold text-accent-400 hover:text-accent-300" to="/register">
                    Create account
                  </Link>
                </p>
              </form>
            </Card>

            <Card className="mt-4 p-4">
              <p className="text-sm font-semibold text-neutral-950 dark:text-white">Demo credentials</p>
              <div className="mt-3 grid gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm transition hover:border-accent-500/40 hover:bg-accent-500/10"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    type="button"
                  >
                    <span>
                      <span className="block font-medium text-neutral-950 dark:text-white">{account.label}</span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                        {account.email} / {account.password}
                      </span>
                    </span>
                    <ArrowRight className="text-neutral-400" size={16} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
