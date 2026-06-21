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
  Technical: "Portal, registration, resume upload, and drive access issues.",
  Billing: "Fee receipts, offer paperwork, stipend details, or reimbursement questions.",
  Account: "Login, permissions, student profile, and placement portal access.",
  General: "Questions that need faculty or placement cell guidance.",
  Other: "Anything that does not fit the standard categories."
};

const priorityDescriptions: Record<TicketPriority, string> = {
  Low: "Informational or non-blocking request.",
  Medium: "Important, but the placement process can continue.",
  High: "Blocking a drive registration, document check, or interview step.",
  Urgent: "Placement deadline or interview issue requiring immediate attention."
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
      setError("Placement query could not be created. Please check the form.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        description="Give the placement support desk enough detail to route your query to the right faculty coordinator."
        eyebrow="New Query"
        title="Raise Placement Query"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <label className="label" htmlFor="title">
                  Query title
                </label>
                <p className="mt-1 text-sm app-text-muted">Use a short summary of the placement issue or request.</p>
                <Input
                  className="mt-2"
                  id="title"
                  maxLength={180}
                  minLength={3}
                  placeholder="Example: Resume upload failing for campus drive"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="description">
                  Description
                </label>
                <p className="mt-1 text-sm app-text-muted">
                  Include the company name, drive date, registration ID, steps tried, and any screenshot context.
                </p>
                <Textarea
                  className="mt-2 min-h-44 resize-y"
                  id="description"
                  minLength={10}
                  placeholder="Describe the placement query and what you need help with..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <PixelIcon className="text-accent-400" name="list" size={20} />
                  <h2 className="text-xs font-black uppercase app-text-primary">Category</h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      className={cn(
                        "rounded-sm border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/25",
                        category === item
                          ? "border-accent-500/35 bg-accent-500/10 text-orange-700 dark:text-accent-100"
                          : "border-orange-200/80 bg-orange-50/70 text-stone-950 hover:border-accent-500/35 hover:bg-accent-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-[#F5F1EA] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                      )}
                      onClick={() => setCategory(item)}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{item}</span>
                      <span className="mt-1 block text-xs leading-5 app-text-muted">{categoryDescriptions[item]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <PixelIcon className="text-accent-400" name="alert" size={20} />
                  <h2 className="text-xs font-black uppercase app-text-primary">Priority</h2>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {priorities.map((item) => (
                    <button
                      key={item}
                      className={cn(
                        "rounded-sm border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/25",
                        priority === item
                          ? "border-accent-500/35 bg-accent-500/10 text-orange-700 dark:text-accent-100"
                          : "border-orange-200/80 bg-orange-50/70 text-stone-950 hover:border-accent-500/35 hover:bg-accent-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-[#F5F1EA] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                      )}
                      onClick={() => setPriority(item)}
                      type="button"
                    >
                      <span className="block text-sm font-semibold">{item}</span>
                      <span className="mt-1 block text-xs leading-5 app-text-muted">{priorityDescriptions[item]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="app-alert-error">
                  {error}
                </p>
              )}

              <Button className="w-full sm:w-auto" disabled={submitting} type="submit" variant="primary">
                <PixelIcon name="send" size={18} />
                {submitting ? "Submitting..." : "Submit Query"}
              </Button>
            </div>
          </Card>

          <Card className="h-fit p-5">
            <PixelIcon className="text-accent-400" name="chat" size={26} />
            <h2 className="display-type mt-4 text-3xl leading-none app-text-primary">Helpful query details</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 app-text-muted">
              <p>Include the company, drive name, deadline, registration ID, or document involved.</p>
              <p>Mention whether this blocks registration, eligibility verification, or an interview schedule.</p>
              <p>Keep sensitive data out of the description unless a faculty coordinator explicitly requests it.</p>
            </div>
            <div className="mt-5 rounded-sm border border-orange-200/80 bg-orange-50/70 p-3 text-xs app-text-muted dark:border-white/10 dark:bg-white/[0.04]">
              Selected: <span className="font-black uppercase app-text-primary">{category}</span> -{" "}
              <span className="font-black uppercase app-text-primary">{priority}</span>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
