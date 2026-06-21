import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";

import type { Comment, CommentAttachment, User } from "../types";
import { cn } from "../utils/cn";
import { roleLabel } from "../utils/roles";
import Avatar from "./Avatar";
import Button from "./Button";
import PixelIcon from "./PixelIcon";

const emojis = [":)", ":D", "OK", "++", "DONE", "FIX", "PIN", "NOTE", "SHIP", "FAST", "THANKS", "CLEAR"];
const maxAttachments = 4;
const maxAttachmentBytes = 5_242_880;

function quickResponseCategoriesForRole(role?: User["role"]) {
  if (role === "support_agent") {
    return [
      {
        name: "Faculty",
        responses: [
          "Please upload your updated resume in PDF format.",
          "Please check the eligibility criteria for this company.",
          "Your query has been forwarded to the placement cell."
        ]
      },
      {
        name: "Documents",
        responses: [
          "Please attach the required document for verification.",
          "Please share your registration ID for this drive."
        ]
      },
      {
        name: "Schedule",
        responses: ["Your interview schedule will be updated shortly."]
      }
    ];
  }

  if (role === "admin") {
    return [
      {
        name: "Placement Head",
        responses: [
          "Assigned to faculty coordinator for review.",
          "Priority updated due to placement deadline."
        ]
      },
      {
        name: "Handover",
        responses: ["Reassignment approved and forwarded to another faculty coordinator."]
      },
      {
        name: "Review",
        responses: ["This query has been resolved after placement cell review."]
      }
    ];
  }

  if (role === "customer") {
    return [
      {
        name: "Student",
        responses: [
          "I have uploaded the required document.",
          "Please update me about the interview schedule."
        ]
      },
      {
        name: "Registration",
        responses: [
          "I am facing an issue with company registration.",
          "My resume is not getting accepted."
        ]
      },
      {
        name: "Eligibility",
        responses: ["I need clarification about eligibility."]
      }
    ];
  }

  return [];
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function attachmentId(file: File) {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${file.name}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function dayKey(value: string) {
  return new Date(value).toDateString();
}

function formatDay(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(date);
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentTile({ attachment, mine }: { attachment: CommentAttachment; mine?: boolean }) {
  const isImage = attachment.type.startsWith("image/") && attachment.url;

  if (isImage) {
    return (
      <a
        className={cn(
          "group mt-2 block overflow-hidden rounded-lg border dark:rounded-sm",
          mine
            ? "border-black/15 bg-black/10"
            : "border-orange-200/45 bg-white/75 shadow-[0_10px_28px_rgba(120,72,30,0.08)] dark:border-[#3A332F] dark:bg-black/20 dark:shadow-none"
        )}
        href={attachment.url || undefined}
        rel="noreferrer"
        target="_blank"
      >
        <img alt={attachment.name} className="max-h-56 w-full object-cover transition group-hover:scale-[1.01]" src={attachment.url || ""} />
        <span className={cn("flex items-center gap-2 px-3 py-2 text-xs", mine ? "text-[#0B0B0A]" : "app-text-primary")}>
          <PixelIcon name="image" size={15} />
          <span className="truncate">{attachment.name}</span>
        </span>
      </a>
    );
  }

  return (
    <a
      className={cn(
        "mt-2 flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-xs transition dark:rounded-sm",
        mine
          ? "border-black/15 bg-black/10 text-[#0B0B0A] hover:bg-black/15"
          : "border-orange-200/45 bg-white/65 text-stone-950 shadow-[0_8px_24px_rgba(120,72,30,0.07)] hover:bg-white/85 dark:border-[#3A332F] dark:bg-white/[0.04] dark:text-[#F5F1EA] dark:shadow-none dark:hover:bg-white/[0.07]"
      )}
      download={attachment.name}
      href={attachment.url || undefined}
      rel="noreferrer"
      target={attachment.url ? "_blank" : undefined}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md dark:rounded-sm", mine ? "bg-black/10" : "bg-accent-500/15 text-orange-700 dark:text-accent-300")}>
        <PixelIcon name="file" size={18} />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-black uppercase">{attachment.name}</span>
        <span className="mt-0.5 block text-[11px] opacity-75">{formatFileSize(attachment.size)}</span>
      </span>
    </a>
  );
}

interface ChatThreadProps {
  comments: Comment[];
  currentUser: User | null;
  error?: string;
  onSend: (message: string, attachments: CommentAttachment[]) => Promise<void>;
  onRetryComment?: (comment: Comment) => Promise<void>;
  submitting?: boolean;
  subtitle?: string;
  syncing?: boolean;
  title?: string;
}

export default function ChatThread({
  comments,
  currentUser,
  error,
  onRetryComment,
  onSend,
  submitting = false,
  subtitle = "Every reply stays attached to this placement query.",
  syncing = false,
  title = "Conversation"
}: ChatThreadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<CommentAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const quickResponseCategories = useMemo(() => quickResponseCategoriesForRole(currentUser?.role), [currentUser?.role]);
  const canUseQuickReplies = quickResponseCategories.length > 0;

  const hasContent = message.trim().length > 0 || attachments.length > 0;

  const normalizedComments = useMemo(
    () => [...comments].sort((first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()),
    [comments]
  );

  const lastCommentKey = normalizedComments.map((comment) => `${comment.id}:${comment.delivery_status || "sent"}`).join("|");

  useLayoutEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !shouldStickToBottomRef.current) return;
    scrollElement.scrollTop = scrollElement.scrollHeight;
  }, [lastCommentKey]);

  function handleScroll() {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    const distanceFromBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 96;
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    setAttachmentError("");
    const availableSlots = maxAttachments - attachments.length;
    const selectedFiles = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      setAttachmentError(`You can attach up to ${maxAttachments} files.`);
    }

    const nextAttachments: CommentAttachment[] = [];
    for (const file of selectedFiles) {
      if (file.size > maxAttachmentBytes) {
        setAttachmentError("Each attachment must be smaller than 5 MB.");
        continue;
      }
      nextAttachments.push({
        id: attachmentId(file),
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        url: await fileToDataUrl(file)
      });
    }

    if (nextAttachments.length) {
      setAttachments((current) => [...current, ...nextAttachments].slice(0, maxAttachments));
    }
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!hasContent || submitting) return;

    try {
      await onSend(message, attachments);
      setMessage("");
      setAttachments([]);
      setEmojiOpen(false);
      setQuickOpen(false);
    } catch {
      // Parent components own the user-facing error state; keep the draft intact.
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      handleSubmit();
    }
  }

  function insertText(value: string) {
    setMessage((current) => (current ? `${current}${value}` : value));
  }

  function insertQuickResponse(value: string) {
    setMessage((current) => (current ? `${current.trim()}\n\n${value}` : value));
    setQuickOpen(false);
  }

  return (
    <section className="app-card flex min-h-[560px] flex-col overflow-hidden lg:min-h-[calc(100vh-8rem)]">
      <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-orange-200/40 bg-[#FFFDF8]/84 px-4 py-4 backdrop-blur-xl dark:border-[#3A332F] dark:bg-[#171717]/95 dark:backdrop-blur-none sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Chat thread</p>
          <h2 className="display-type mt-3 truncate text-4xl leading-none app-text-primary">{title}</h2>
          <p className="mt-2 text-sm app-text-muted">{subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-orange-200/45 bg-white/65 px-3 py-2 text-xs font-black uppercase text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_22px_rgba(120,72,30,0.06)] dark:rounded-sm dark:border-[#3A332F] dark:bg-white/[0.04] dark:text-[#F5F1EA] dark:shadow-none sm:self-auto">
          <PixelIcon name="chat" size={17} />
          {syncing ? "Syncing..." : `${comments.length} ${comments.length === 1 ? "message" : "messages"}`}
        </div>
      </div>

      <div className="chat-pattern min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5" onScroll={handleScroll} ref={scrollRef}>
        {normalizedComments.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center text-center">
            <div className="app-card max-w-sm p-6 backdrop-blur">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-500/30 bg-accent-500/10 text-orange-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:rounded-sm dark:text-accent-300 dark:shadow-none">
                <PixelIcon name="chat" size={36} />
              </div>
              <h3 className="display-type mt-5 text-3xl leading-none app-text-primary">No messages yet</h3>
              <p className="mt-3 text-sm leading-6 app-text-muted">Start the chat with placement context, screenshots, or the next support step.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {normalizedComments.map((comment, index) => {
              const previous = normalizedComments[index - 1];
              const showDate = !previous || dayKey(previous.created_at) !== dayKey(comment.created_at);
              const grouped =
                previous &&
                previous.author.id === comment.author.id &&
                dayKey(previous.created_at) === dayKey(comment.created_at);
              const mine = currentUser?.id === comment.author.id;
              const commentAttachments = comment.attachments || [];
              const sending = comment.delivery_status === "sending";
              const failed = comment.delivery_status === "failed";
              const supportAuthor = comment.author.role === "admin" || comment.author.role === "support_agent";

              return (
                <div key={comment.id}>
                  {showDate && (
                    <div className="sticky top-0 z-[1] my-4 flex justify-center">
                      <span className="rounded-full border border-orange-200/45 bg-[#FFFDF8]/90 px-3 py-1 text-xs font-black uppercase text-stone-600 shadow-[0_10px_28px_rgba(120,72,30,0.10)] backdrop-blur dark:rounded-sm dark:border-[#3A332F] dark:bg-[#111111] dark:text-[#C4BFB7] dark:shadow-black/20 dark:backdrop-blur-none">
                        {formatDay(comment.created_at)}
                      </span>
                    </div>
                  )}

                  <div className={cn("flex gap-2 py-1", mine ? "justify-end" : "justify-start", grouped && !showDate ? "mt-0.5" : "mt-3")}>
                    {!mine && <div className="w-9">{!grouped && <Avatar size="sm" user={comment.author} />}</div>}
                    <div className={cn("max-w-[82%] sm:max-w-[68%] xl:max-w-[58%]", mine ? "items-end" : "items-start")}>
                      {!grouped && (
                        <div className={cn("mb-1 flex items-center gap-2 px-1", mine ? "justify-end" : "justify-start")}>
                          <span className="max-w-44 truncate text-xs font-black uppercase app-text-primary">
                            {mine ? "You" : comment.author.full_name}
                          </span>
                          <span className={cn("text-[11px] capitalize", supportAuthor ? "text-orange-700 dark:text-accent-300" : "app-text-muted")}>
                            {roleLabel(comment.author.role)}
                          </span>
                          <span className="text-[11px] app-text-subtle">{formatTime(comment.created_at)}</span>
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-[0_12px_34px_rgba(120,72,30,0.10)] dark:rounded-sm dark:shadow-lg",
                          mine
                            ? "bg-[linear-gradient(135deg,#FF714B,#FF4B24)] text-[#0B0B0A] shadow-[0_14px_34px_rgba(255,75,36,0.18)] dark:bg-[linear-gradient(135deg,#FF4B24,#D93618)]"
                            : cn(
                                "border bg-[#FFFDF8]/88 text-stone-950 shadow-orange-950/10 backdrop-blur dark:bg-[#171717] dark:text-[#F5F1EA] dark:shadow-black/15 dark:backdrop-blur-none",
                                supportAuthor
                                  ? "border-orange-200/60 border-l-4 border-l-accent-500 dark:border-[#3A332F] dark:border-l-accent-500"
                                  : "border-orange-200/45 border-l-4 border-l-sky-500/70 dark:border-[#3A332F] dark:border-l-sky-400/70"
                              )
                        )}
                      >
                        {comment.message && <p className="whitespace-pre-wrap break-words">{comment.message}</p>}
                        {commentAttachments.map((attachment) => (
                          <AttachmentTile key={attachment.id} attachment={attachment} mine={mine} />
                        ))}
                        {(sending || failed) && (
                          <div
                            className={cn(
                              "mt-2 flex items-center justify-between gap-3 border-t pt-2 text-[11px] font-black uppercase",
                              mine ? "border-black/15 text-[#0B0B0A]/70" : "border-orange-200/70 text-stone-600 dark:border-[#3A332F] dark:text-[#C4BFB7]"
                            )}
                          >
                            <span>{sending ? "Sending..." : "Failed to send"}</span>
                            {failed && onRetryComment && (
                              <button
                                className="rounded-md border border-current/25 px-2 py-1 transition hover:bg-current/10 dark:rounded-sm"
                                onClick={() => {
                                  void onRetryComment(comment).catch(() => undefined);
                                }}
                                type="button"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {mine && <div className="w-9">{!grouped && <Avatar size="sm" user={comment.author} />}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form className="sticky bottom-0 border-t border-orange-200/40 bg-[#FFFDF8]/90 p-3 backdrop-blur-xl dark:border-[#3A332F] dark:bg-[#0B0B0A] dark:backdrop-blur-none sm:p-4" onSubmit={handleSubmit}>
        {canUseQuickReplies && quickOpen && (
          <div className="app-dropdown mb-3 max-h-72 overflow-y-auto p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase app-text-primary">
                <PixelIcon className="text-accent-400" name="spark" size={19} />
                Quick replies
              </div>
              <button
                aria-label="Close quick replies"
                className="app-text-muted transition hover:text-stone-950 dark:hover:text-[#F5F1EA]"
                onClick={() => setQuickOpen(false)}
                type="button"
              >
                <PixelIcon name="close" size={18} />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {quickResponseCategories.map((category) => (
                <div key={category.name}>
                  <p className="mb-2 text-[11px] font-black uppercase app-text-muted">{category.name}</p>
                  <div className="space-y-2">
                    {category.responses.map((response) => (
                      <button
                        key={response}
                        className="w-full rounded-xl border border-orange-200/45 bg-white/60 p-3 text-left text-xs leading-5 text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] transition hover:border-accent-500/45 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 dark:rounded-sm dark:border-[#3A332F] dark:bg-white/[0.03] dark:text-[#F5F1EA] dark:shadow-none"
                        onClick={() => insertQuickResponse(response)}
                        type="button"
                      >
                        {response}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {emojiOpen && (
          <div className="app-dropdown mb-3 flex flex-wrap gap-2 p-3">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-orange-200/45 bg-white/45 px-2 font-mono text-xs text-stone-950 transition hover:border-accent-500/45 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 dark:rounded-sm dark:border-[#3A332F] dark:bg-transparent dark:text-[#F5F1EA]"
                onClick={() => insertText(emoji)}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <span
                key={attachment.id}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-orange-200/45 bg-white/60 px-3 py-1.5 text-xs text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.70)] dark:rounded-sm dark:border-[#3A332F] dark:bg-white/[0.05] dark:text-[#F5F1EA] dark:shadow-none"
              >
                <PixelIcon name={attachment.type.startsWith("image/") ? "image" : "file"} size={15} />
                <span className="max-w-40 truncate">{attachment.name}</span>
                <button
                  aria-label={`Remove ${attachment.name}`}
                  className="app-text-muted transition hover:text-stone-950 dark:hover:text-[#F5F1EA]"
                  onClick={() => setAttachments((current) => current.filter((item) => item.id !== attachment.id))}
                  type="button"
                >
                  <PixelIcon name="close" size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {(error || attachmentError) && (
          <p className="app-alert-error mb-3">{error || attachmentError}</p>
        )}

        <div className="flex items-end gap-2 rounded-2xl border border-orange-200/45 bg-white/72 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_14px_38px_rgba(120,72,30,0.10)] backdrop-blur dark:rounded-sm dark:border-[#3A332F] dark:bg-[#111111] dark:shadow-black/30 dark:backdrop-blur-none">
          <input
            accept="image/*,application/pdf,.pdf,text/plain,.txt"
            className="sr-only"
            multiple
            onChange={handleFiles}
            ref={fileInputRef}
            type="file"
          />
          <button
            aria-label="Attach files"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl app-text-muted transition hover:bg-accent-500/10 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 dark:rounded-sm dark:hover:bg-white/10 dark:hover:text-[#F5F1EA]"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <PixelIcon name="attach" size={21} />
          </button>

          <button
            aria-expanded={emojiOpen}
            aria-label="Open emoji picker"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl app-text-muted transition hover:bg-accent-500/10 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 dark:rounded-sm dark:hover:bg-white/10 dark:hover:text-[#F5F1EA]"
            onClick={() => setEmojiOpen((current) => !current)}
            type="button"
          >
            <PixelIcon name="emoji" size={21} />
          </button>

          {canUseQuickReplies && (
            <button
              aria-expanded={quickOpen}
              className="hidden h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-black uppercase app-text-primary transition hover:bg-accent-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 dark:rounded-sm dark:hover:bg-white/10 sm:inline-flex"
              onClick={() => setQuickOpen((current) => !current)}
              type="button"
            >
              <PixelIcon name="spark" size={17} />
              Quick replies
              <PixelIcon className={cn("transition", quickOpen && "rotate-90")} name="arrow" size={15} />
            </button>
          )}

          <textarea
            aria-label="Type your message"
            className="max-h-36 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm leading-6 text-stone-950 outline-none placeholder:text-stone-400 dark:text-[#F5F1EA] dark:placeholder:text-[#A7A29A]"
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message this query..."
            rows={1}
            value={message}
          />

          {canUseQuickReplies && (
            <button
              aria-expanded={quickOpen}
              aria-label="Open quick replies"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl app-text-muted transition hover:bg-accent-500/10 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 dark:rounded-sm dark:hover:bg-white/10 dark:hover:text-[#F5F1EA] sm:hidden"
              onClick={() => setQuickOpen((current) => !current)}
              type="button"
            >
              <PixelIcon name="spark" size={20} />
            </button>
          )}

          <Button className="h-10 w-10 shrink-0 rounded-xl px-0 dark:rounded-sm" disabled={!hasContent || submitting} type="submit" variant="primary">
            <PixelIcon name="send" size={20} />
            <span className="sr-only">{submitting ? "Sending" : "Send message"}</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
