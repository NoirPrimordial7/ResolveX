import { FormEvent, useState } from "react";
import { AlertTriangle, Layers, MessageSquareText, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import Button from "../components/Button";
import Card from "../components/Card";
import { Input, Textarea } from "../components/Input";
import PageHeader from "../components/PageHeader";
import type { TicketCategory, TicketPriority } from "../types";
import { categories, priorities } from "../types";
import { cn } from "../utils/cn";

const categoryDescriptions: Record<TicketCategory, string> = {
  Technical: "Bugs, outages, integrations, and product behavior.",
  Billing: "Invoices, subscriptions, renewals, and payment issues.",
  Account: "Login, permissions, profile, and workspace access.",
  General: "Questions that need support team guidance.",
  Other: "Anything that does not fit the standard categories."
};

const priorityDescriptions: Record<TicketPriority, string> = {
  Low: "Informational or non-blocking request.",
  Medium: "Important, but work can continue.",
  High: "Blocking a workflow or key customer task.",
  Urgent: "Critical issue requiring immediate attention."
};

export default function CreateTicket() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("Technical");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const ticket = await ticketApi.createTicket({ title, description, category, priority });
      navigate(`/tickets/${ticket.id}`);
    } catch {
      setError("Ticket could not be created. Please check the form.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        description="Give the support team enough detail to reproduce the issue and prioritize the response."
        eyebrow="New Ticket"
        title="Create Support Ticket"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <label className="label" htmlFor="title">
                  Ticket title
                </label>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Use a short summary of the issue or request.</p>
                <Input
                  className="mt-2"
                  id="title"
                  maxLength={180}
                  minLength={3}
                  placeholder="Example: Cannot access billing dashboard"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="description">
                  Description
                </label>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Include steps taken, expected behavior, screenshots context, or affected users.
                </p>
                <Textarea
                  className="mt-2 min-h-44 resize-y"
                  id="description"
                  minLength={10}
                  placeholder="Describe what happened and what you need help with..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Layers className="text-orange-600 dark:text-orange-400" size={18} aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Category</h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      className={cn(
                        "rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/25",
                        category === item
                          ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/35 dark:bg-orange-500/10 dark:text-orange-200"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
                      )}
                      onClick={() => setCategory(item)}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{item}</span>
                      <span className="mt-1 block text-xs leading-5 text-neutral-500 dark:text-neutral-400">{categoryDescriptions[item]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-orange-600 dark:text-orange-400" size={18} aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Priority</h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {priorities.map((item) => (
                    <button
                      key={item}
                      className={cn(
                        "rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/25",
                        priority === item
                          ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/35 dark:bg-orange-500/10 dark:text-orange-200"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
                      )}
                      onClick={() => setPriority(item)}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{item}</span>
                      <span className="mt-1 block text-xs leading-5 text-neutral-500 dark:text-neutral-400">{priorityDescriptions[item]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </p>
              )}

              <Button className="w-full sm:w-auto" disabled={submitting} type="submit" variant="primary">
                <Send size={18} aria-hidden="true" />
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </Card>

          <Card className="h-fit bg-neutral-50 p-5 dark:bg-neutral-900/60">
            <MessageSquareText className="text-orange-600 dark:text-orange-400" size={22} aria-hidden="true" />
            <h2 className="mt-4 text-base font-semibold text-neutral-950 dark:text-white">Helpful ticket details</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              <p>Include the exact page, account, or workflow where the issue happens.</p>
              <p>Mention whether this blocks work for one user, many users, or an entire team.</p>
              <p>Keep sensitive data out of the description unless support explicitly requests it.</p>
            </div>
            <div className="mt-5 rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
              Selected: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{category}</span> ·{" "}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{priority}</span>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
