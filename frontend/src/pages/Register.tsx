import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Card from "../components/Card";
import { Input } from "../components/Input";
import PixelIcon from "../components/PixelIcon";
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
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : user.role === "support_agent" ? "/agent/dashboard" : "/customer/dashboard"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ full_name: fullName, email, password });
      navigate("/customer/dashboard", { replace: true });
    } catch {
      setError("Registration failed. Check the form or try another email.");
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
              <p className="eyebrow">Student intake</p>
              <h1 className="display-type mt-6 text-6xl leading-[0.88] app-text-primary sm:text-7xl xl:text-8xl">
                Raise Queries.
                <br />
                Track Every Reply.
                <br />
                Resolve Fast.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 app-text-muted">
                Create a student account, raise placement queries, and keep the full conversation history attached to every issue.
              </p>
            </div>
          </div>

          <div className="relative z-[1] mt-10 grid gap-3 sm:grid-cols-3 lg:mt-0">
            {["Clear intake", "Priority context", "Conversation history"].map((item) => (
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
                <PixelIcon name="user" size={30} />
              </div>
              <p className="eyebrow">Create account</p>
              <h1 className="display-type mt-4 text-5xl leading-none app-text-primary">
                Join ResolveX as a student
              </h1>
              <p className="mt-3 text-sm leading-6 app-text-muted">
                Student accounts can raise placement queries and track faculty responses.
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
                      <PixelIcon className="pointer-events-none absolute left-3 top-2.5 app-text-subtle" name="user" size={20} />
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
                    <Input
                      className="mt-2"
                      id="password"
                      minLength={8}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <p className="mt-2 text-xs app-text-muted">Use at least 8 characters.</p>
                  </div>

                  {error && (
                    <p className="app-alert-error">
                      {error}
                    </p>
                  )}

                  <Button className="w-full" disabled={submitting} type="submit" variant="primary">
                    {submitting ? "Creating..." : "Register"}
                    <PixelIcon name="arrow" size={18} />
                  </Button>
                </div>

                <p className="mt-6 text-center text-sm app-text-muted">
                  Already registered?{" "}
                  <Link className="font-semibold text-accent-400 hover:text-accent-300" to="/login">
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
