import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ticketApi } from "../api/ticketApi";
import type { TicketCategory, TicketPriority } from "../types";
import { categories, priorities } from "../types";

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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">New Ticket</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Create support ticket</h1>
      </div>

      <form className="panel-card rounded-sm p-6" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              className="field mt-2"
              id="title"
              maxLength={180}
              minLength={3}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              className="field mt-2 min-h-40 resize-y"
              id="description"
              minLength={10}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="category">
                Category
              </label>
              <select
                className="field mt-2"
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value as TicketCategory)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="priority">
                Priority
              </label>
              <select
                className="field mt-2"
                id="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TicketPriority)}
              >
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}

          <button className="primary-button w-full sm:w-auto" disabled={submitting} type="submit">
            <Send size={18} aria-hidden="true" />
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
