import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import Button from "../components/Button";
import Card from "../components/Card";
import { Input, Textarea } from "../components/Input";
import PageHeader from "../components/PageHeader";
import PixelIcon from "../components/PixelIcon";
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
    <div className="space-y-5">
      <PageHeader
        description="Give the support team enough detail to reproduce the issue and prioritize the response."
        eyebrow="New Ticket"
        title="Create Support Ticket"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <label className="label" htmlFor="title">
                  Ticket title
                </label>
                <p className="mt-1 text-sm text-[#A7A29A]">Use a short summary of the issue or request.</p>
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
                <p className="mt-1 text-sm text-[#A7A29A]">
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
                  <PixelIcon className="text-accent-400" name="list" size={20} />
                  <h2 className="text-xs font-black uppercase text-[#F5F1EA]">Category</h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      className={cn(
                        "rounded-sm border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/25",
                        category === item
                          ? "border-accent-500/35 bg-accent-500/10 text-accent-100"
                          : "border-white/10 bg-white/[0.03] text-[#F5F1EA] hover:border-white/20 hover:bg-white/[0.06]"
                      )}
                      onClick={() => setCategory(item)}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{item}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#A7A29A]">{categoryDescriptions[item]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <PixelIcon className="text-accent-400" name="alert" size={20} />
                  <h2 className="text-xs font-black uppercase text-[#F5F1EA]">Priority</h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {priorities.map((item) => (
                    <button
                      key={item}
                      className={cn(
                        "rounded-sm border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/25",
                        priority === item
                          ? "border-accent-500/35 bg-accent-500/10 text-accent-100"
                          : "border-white/10 bg-white/[0.03] text-[#F5F1EA] hover:border-white/20 hover:bg-white/[0.06]"
                      )}
                      onClick={() => setPriority(item)}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{item}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#A7A29A]">{priorityDescriptions[item]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-sm border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <Button className="w-full sm:w-auto" disabled={submitting} type="submit" variant="primary">
                <PixelIcon name="send" size={18} />
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </Card>

          <Card className="h-fit bg-[#111111]/92 p-5">
            <PixelIcon className="text-accent-400" name="chat" size={26} />
            <h2 className="display-type mt-4 text-3xl leading-none text-[#F5F1EA]">Helpful ticket details</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-[#A7A29A]">
              <p>Include the exact page, account, or workflow where the issue happens.</p>
              <p>Mention whether this blocks work for one user, many users, or an entire team.</p>
              <p>Keep sensitive data out of the description unless support explicitly requests it.</p>
            </div>
            <div className="mt-5 rounded-sm border border-white/10 bg-white/[0.04] p-3 text-xs text-[#A7A29A]">
              Selected: <span className="font-black uppercase text-[#F5F1EA]">{category}</span> -{" "}
              <span className="font-black uppercase text-[#F5F1EA]">{priority}</span>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
