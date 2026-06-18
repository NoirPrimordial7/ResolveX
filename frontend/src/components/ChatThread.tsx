import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";

import type { Comment, CommentAttachment, User } from "../types";
import { cn } from "../utils/cn";
import Avatar from "./Avatar";
import Button from "./Button";
import PixelIcon from "./PixelIcon";

const emojis = [":)", ":D", "OK", "++", "DONE", "FIX", "PIN", "NOTE", "SHIP", "FAST", "THANKS", "CLEAR"];
const maxAttachments = 4;
const maxAttachmentBytes = 1_500_000;

const quickResponseCategories = [
  {
    name: "Greeting",
    responses: [
      "Hi, thanks for reaching out. I am checking this now and will update you shortly.",
      "Thanks for the details. I have enough context to start investigating this."
    ]
  },
  {
    name: "Investigation",
    responses: [
      "I am reviewing the ticket history and the affected workflow. I will share the next step here.",
      "Could you share a screenshot or the exact page where this happens? That will help us verify the issue faster."
    ]
  },
  {
    name: "Resolution",
    responses: [
      "This should be resolved now. Please try again and let us know if you still see the issue.",
      "We have completed the fix on our side. I am marking this ticket as resolved, but you can reply here if anything is still blocked."
    ]
  }
];

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

function roleLabel(role: User["role"]) {
  return role.replace("_", " ");
}

function AttachmentTile({ attachment, mine }: { attachment: CommentAttachment; mine?: boolean }) {
  const isImage = attachment.type.startsWith("image/") && attachment.url;

  if (isImage) {
    return (
      <a
        className={cn(
          "group mt-2 block overflow-hidden rounded-sm border",
          mine ? "border-black/15 bg-black/10" : "border-white/10 bg-black/20"
        )}
        href={attachment.url || undefined}
        rel="noreferrer"
        target="_blank"
      >
        <img alt={attachment.name} className="max-h-56 w-full object-cover transition group-hover:scale-[1.01]" src={attachment.url || ""} />
        <span className={cn("flex items-center gap-2 px-3 py-2 text-xs", mine ? "text-[#0B0B0A]" : "text-[#F5F1EA]")}>
          <PixelIcon name="image" size={15} />
          <span className="truncate">{attachment.name}</span>
        </span>
      </a>
    );
  }

  return (
    <a
      className={cn(
        "mt-2 flex items-center gap-3 rounded-sm border px-3 py-2 text-left text-xs transition",
        mine
          ? "border-black/15 bg-black/10 text-[#0B0B0A] hover:bg-black/15"
          : "border-white/10 bg-white/[0.04] text-[#F5F1EA] hover:bg-white/[0.07]"
      )}
      download={attachment.name}
      href={attachment.url || undefined}
      rel="noreferrer"
      target={attachment.url ? "_blank" : undefined}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-sm", mine ? "bg-black/10" : "bg-accent-500/15 text-accent-300")}>
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
  submitting?: boolean;
  subtitle?: string;
  title?: string;
}

export default function ChatThread({
  comments,
  currentUser,
  error,
  onSend,
  submitting = false,
  subtitle = "Every reply stays attached to this ticket.",
  title = "Conversation"
}: ChatThreadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<CommentAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const canUseQuickReplies = currentUser?.role === "admin" || currentUser?.role === "support_agent";

  const hasContent = message.trim().length > 0 || attachments.length > 0;

  const normalizedComments = useMemo(
    () => [...comments].sort((first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime()),
    [comments]
  );

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
        setAttachmentError("Each attachment must be smaller than 1.5 MB.");
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
    <section className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-sm border border-white/10 bg-[#111111]/94 shadow-2xl shadow-black/30">
      <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-white/10 bg-[#171717]/95 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Chat thread</p>
          <h2 className="display-type mt-3 truncate text-4xl leading-none text-[#F5F1EA]">{title}</h2>
          <p className="mt-2 text-sm text-[#A7A29A]">{subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-sm border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase text-[#F5F1EA] sm:self-auto">
          <PixelIcon name="chat" size={17} />
          {comments.length} {comments.length === 1 ? "message" : "messages"}
        </div>
      </div>

      <div className="chat-pattern min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-5">
        {normalizedComments.length === 0 ? (
          <div className="flex min-h-[360px] items-center justify-center text-center">
            <div className="max-w-sm border border-white/10 bg-[#171717]/88 p-6 shadow-xl shadow-black/20 backdrop-blur">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-accent-500/35 bg-accent-500/10 text-accent-300">
                <PixelIcon name="chat" size={36} />
              </div>
              <h3 className="display-type mt-5 text-3xl leading-none text-[#F5F1EA]">No messages yet</h3>
              <p className="mt-3 text-sm leading-6 text-[#A7A29A]">Start the chat with context, screenshots, or the next support step.</p>
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

              return (
                <div key={comment.id}>
                  {showDate && (
                    <div className="sticky top-0 z-[1] my-4 flex justify-center">
                      <span className="rounded-sm border border-white/10 bg-[#0B0B0A]/88 px-3 py-1 text-xs font-black uppercase text-[#A7A29A] shadow-lg shadow-black/20 backdrop-blur">
                        {formatDay(comment.created_at)}
                      </span>
                    </div>
                  )}

                  <div className={cn("flex gap-2 py-1", mine ? "justify-end" : "justify-start", grouped && !showDate ? "mt-0.5" : "mt-3")}>
                    {!mine && <div className="w-9">{!grouped && <Avatar size="sm" user={comment.author} />}</div>}
                    <div className={cn("max-w-[85%] sm:max-w-[72%] xl:max-w-[60%]", mine ? "items-end" : "items-start")}>
                      {!grouped && (
                        <div className={cn("mb-1 flex items-center gap-2 px-1", mine ? "justify-end" : "justify-start")}>
                          <span className="max-w-44 truncate text-xs font-black uppercase text-[#F5F1EA]">
                            {mine ? "You" : comment.author.full_name}
                          </span>
                          <span className="text-[11px] capitalize text-[#A7A29A]">{roleLabel(comment.author.role)}</span>
                          <span className="text-[11px] text-[#726D66]">{formatTime(comment.created_at)}</span>
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-sm px-3.5 py-2.5 text-sm leading-6 shadow-lg",
                          mine
                            ? "bg-[linear-gradient(135deg,#FF4B24,#D93618)] text-[#0B0B0A] shadow-accent-600/20"
                            : "border border-white/10 bg-[#171717]/96 text-[#F5F1EA] shadow-black/15"
                        )}
                      >
                        {comment.message && <p className="whitespace-pre-wrap break-words">{comment.message}</p>}
                        {commentAttachments.map((attachment) => (
                          <AttachmentTile key={attachment.id} attachment={attachment} mine={mine} />
                        ))}
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

      <form className="sticky bottom-0 border-t border-white/10 bg-[#111111]/96 p-3 backdrop-blur-xl sm:p-4" onSubmit={handleSubmit}>
        {canUseQuickReplies && quickOpen && (
          <div className="mb-3 max-h-72 overflow-y-auto rounded-sm border border-white/10 bg-[#171717] p-3 shadow-2xl shadow-black/30">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[#F5F1EA]">
                <PixelIcon className="text-accent-400" name="spark" size={19} />
                Quick replies
              </div>
              <button
                aria-label="Close quick replies"
                className="text-[#A7A29A] transition hover:text-[#F5F1EA]"
                onClick={() => setQuickOpen(false)}
                type="button"
              >
                <PixelIcon name="close" size={18} />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {quickResponseCategories.map((category) => (
                <div key={category.name}>
                  <p className="mb-2 text-[11px] font-black uppercase text-[#A7A29A]">{category.name}</p>
                  <div className="space-y-2">
                    {category.responses.map((response) => (
                      <button
                        key={response}
                        className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-left text-xs leading-5 text-[#F5F1EA] transition hover:border-accent-500/45 hover:bg-accent-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35"
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
          <div className="mb-3 flex flex-wrap gap-2 rounded-sm border border-white/10 bg-[#171717] p-3 shadow-2xl shadow-black/30">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                className="flex h-9 min-w-9 items-center justify-center rounded-sm border border-white/10 px-2 font-mono text-xs text-[#F5F1EA] transition hover:border-accent-500/45 hover:bg-accent-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35"
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
                className="inline-flex max-w-full items-center gap-2 rounded-sm border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-[#F5F1EA]"
              >
                <PixelIcon name={attachment.type.startsWith("image/") ? "image" : "file"} size={15} />
                <span className="max-w-40 truncate">{attachment.name}</span>
                <button
                  aria-label={`Remove ${attachment.name}`}
                  className="text-[#A7A29A] transition hover:text-[#F5F1EA]"
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
          <p className="mb-3 rounded-sm border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">{error || attachmentError}</p>
        )}

        <div className="flex items-end gap-2 rounded-sm border border-white/10 bg-[#0B0B0A]/88 p-2 shadow-inner shadow-black/30">
          <input className="sr-only" multiple onChange={handleFiles} ref={fileInputRef} type="file" />
          <button
            aria-label="Attach files"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-[#A7A29A] transition hover:bg-white/10 hover:text-[#F5F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <PixelIcon name="attach" size={21} />
          </button>

          <button
            aria-expanded={emojiOpen}
            aria-label="Open emoji picker"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-[#A7A29A] transition hover:bg-white/10 hover:text-[#F5F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35"
            onClick={() => setEmojiOpen((current) => !current)}
            type="button"
          >
            <PixelIcon name="emoji" size={21} />
          </button>

          {canUseQuickReplies && (
            <button
              aria-expanded={quickOpen}
              className="hidden h-10 shrink-0 items-center gap-2 rounded-sm px-3 text-xs font-black uppercase text-[#F5F1EA] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 sm:inline-flex"
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
            className="max-h-36 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm leading-6 text-[#F5F1EA] outline-none placeholder:text-[#726D66]"
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message this ticket..."
            rows={1}
            value={message}
          />

          {canUseQuickReplies && (
            <button
              aria-expanded={quickOpen}
              aria-label="Open quick replies"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-[#A7A29A] transition hover:bg-white/10 hover:text-[#F5F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/35 sm:hidden"
              onClick={() => setQuickOpen((current) => !current)}
              type="button"
            >
              <PixelIcon name="spark" size={20} />
            </button>
          )}

          <Button className="h-10 w-10 shrink-0 rounded-sm px-0" disabled={!hasContent || submitting} type="submit" variant="primary">
            <PixelIcon name="send" size={20} />
            <span className="sr-only">{submitting ? "Sending" : "Send message"}</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
