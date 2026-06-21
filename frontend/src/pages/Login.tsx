import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Card from "../components/Card";
import { Input } from "../components/Input";
import PixelIcon from "../components/PixelIcon";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  { label: "Placement Head", email: "admin@resolvex.com", password: "Admin@123" },
  { label: "Faculty Coordinator", email: "agent@resolvex.com", password: "Agent@123" },
  { label: "Student", email: "customer@resolvex.com", password: "Customer@123" }
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
    <div className="app-page">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-6">
        <section className="app-surface relative flex min-h-[44vh] flex-col justify-between overflow-hidden p-6 lg:min-h-[calc(100vh-3rem)] lg:p-8">
          <div className="pointer-events-none absolute inset-0 chat-pattern opacity-70" />
          <div className="relative z-[1]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-accent-500 text-[#0B0B0A] shadow-glow">
                <PixelIcon name="shield" size={28} />
              </div>
              <div>
                <p className="display-type text-3xl leading-none">ResolveX</p>
                <p className="text-[11px] font-black uppercase app-text-muted">Placement Support Desk</p>
              </div>
            </div>

            <div className="mt-16 max-w-2xl lg:mt-24">
              <p className="eyebrow">
                Campus Placement Support
              </p>
              <h1 className="display-type mt-6 text-6xl leading-[0.88] app-text-primary sm:text-7xl xl:text-8xl">
                Resolve Queries.
                <br />
                Assign Faculty.
                <br />
                Close Clean.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 app-text-muted">
                Prioritize placement queries, assign faculty ownership, and keep every student conversation moving from one focused workspace.
              </p>
            </div>
          </div>

          <div className="relative z-[1] mt-10 grid gap-3 sm:grid-cols-3 lg:mt-0">
            {["Live query clarity", "Role-aware routing", "Faculty replies"].map((item) => (
              <div key={item} className="app-card-muted p-4">
                <PixelIcon className="mb-3 text-accent-400" name="check" size={20} />
                <p className="text-xs font-black uppercase app-text-primary">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center lg:min-h-[calc(100vh-3rem)]">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-accent-500 text-[#0B0B0A] shadow-glow lg:hidden">
                <PixelIcon name="shield" size={30} />
              </div>
              <p className="eyebrow">Welcome back</p>
              <h1 className="display-type mt-4 text-5xl leading-none app-text-primary">Sign in</h1>
              <p className="mt-3 text-sm leading-6 app-text-muted">
                Manage placement support queries with a focused campus desk workspace.
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
                      <PixelIcon className="pointer-events-none absolute left-3 top-2.5 app-text-subtle" name="mail" size={20} />
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
                      <PixelIcon className="pointer-events-none absolute left-3 top-2.5 app-text-subtle" name="lock" size={20} />
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
                    <p className="app-alert-error">
                      {error}
                    </p>
                  )}

                  <Button className="w-full" disabled={submitting} type="submit" variant="primary">
                    {submitting ? "Signing in..." : "Login"}
                    <PixelIcon name="arrow" size={18} />
                  </Button>
                </div>

                <p className="mt-6 text-center text-sm app-text-muted">
                  New student?{" "}
                  <Link className="font-semibold text-accent-400 hover:text-accent-300" to="/register">
                    Create account
                  </Link>
                </p>
              </form>
            </Card>

            <Card className="mt-4 p-4">
              <p className="text-xs font-black uppercase app-text-primary">Demo credentials</p>
              <div className="mt-3 grid gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    className="flex items-center justify-between gap-3 rounded-sm border border-orange-200/80 bg-orange-50/70 px-3 py-2 text-left text-sm transition hover:border-accent-500/45 hover:bg-accent-500/10 dark:border-white/10 dark:bg-[#0B0B0A]/70"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    type="button"
                  >
                    <span>
                      <span className="block text-xs font-black uppercase app-text-primary">{account.label}</span>
                      <span className="block font-mono text-xs app-text-muted">
                        {account.email} -- {account.password}
                      </span>
                    </span>
                    <PixelIcon className="text-accent-400" name="command" size={18} />
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
