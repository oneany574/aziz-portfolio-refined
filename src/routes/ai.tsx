import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Plus, Send, Sparkles, Trash2, MessageSquare } from "lucide-react";
import {
  deriveTitle,
  INITIAL_GREETING,
  loadThreads,
  newThread,
  saveThreads,
  type Thread,
} from "@/lib/ai-threads";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Aziz Khaldi" },
      {
        name: "description",
        content:
          "Chat with Aziz's AI assistant — ask about his work, services, or anything else.",
      },
    ],
  }),
  component: AIPage,
});

function AIPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Bootstrap once on client (StrictMode-safe)
  useEffect(() => {
    const stored = loadThreads();
    if (stored.length === 0) {
      const t = newThread();
      setThreads([t]);
      setActiveId(t.id);
      saveThreads([t]);
    } else {
      setThreads(stored);
      setActiveId(stored[0].id);
    }
    setHydrated(true);
  }, []);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );

  const handleNew = () => {
    const t = newThread();
    const next = [t, ...threads];
    setThreads(next);
    setActiveId(t.id);
    saveThreads(next);
  };

  const handleDelete = (id: string) => {
    const next = threads.filter((t) => t.id !== id);
    if (next.length === 0) {
      const t = newThread();
      setThreads([t]);
      setActiveId(t.id);
      saveThreads([t]);
      return;
    }
    setThreads(next);
    if (activeId === id) setActiveId(next[0].id);
    saveThreads(next);
  };

  const handleMessagesChange = useCallback(
    (id: string, messages: UIMessage[]) => {
      setThreads((prev) => {
        const next = prev.map((t) =>
          t.id === id
            ? {
                ...t,
                messages,
                title: t.title === "New chat" ? deriveTitle(messages) : t.title,
                updatedAt: Date.now(),
              }
            : t,
        );
        saveThreads(next);
        return next;
      });
    },
    [],
  );

  if (!hydrated || !active) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-secondary/20 md:flex">
        <div className="flex items-center justify-between p-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>
        <button
          onClick={handleNew}
          className="mx-3 mb-3 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {threads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <div
                key={t.id}
                className={`group mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                <button
                  onClick={() => setActiveId(t.id)}
                  className="flex flex-1 items-center gap-2 truncate text-left"
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t.title}</span>
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  aria-label="Delete thread"
                  className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border p-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          History stored in this browser
        </div>
      </aside>

      {/* Chat window */}
      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Aziz's AI Assistant</div>
              <div className="text-xs text-muted-foreground">Powered by Lovable AI</div>
            </div>
          </div>
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground md:hidden">
            ← Back
          </Link>
        </header>

        <ChatWindow
          key={active.id}
          thread={active}
          onMessagesChange={(msgs) => handleMessagesChange(active.id, msgs)}
        />
      </main>
    </div>
  );
}

const transport = new DefaultChatTransport({ api: "/api/chat" });

function ChatWindow({
  thread,
  onMessagesChange,
}: {
  thread: Thread;
  onMessagesChange: (m: UIMessage[]) => void;
}) {
  const { messages, sendMessage, status } = useChat({
    id: thread.id,
    messages: thread.messages.length > 0 ? thread.messages : [INITIAL_GREETING],
    transport,
  });

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    onMessagesChange(messages);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [thread.id, status]);

  const submit = async () => {
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
          {status === "submitted" && (
            <div className="my-6 flex gap-3">
              <Avatar role="assistant" />
              <div className="flex items-center gap-1.5 pt-2">
                <Dot delay={0} />
                <Dot delay={0.15} />
                <Dot delay={0.3} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-secondary/30 p-2 focus-within:border-accent">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Ask anything about Aziz, his work, or just chat…"
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={submit}
            disabled={isBusy || !input.trim()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-opacity disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          AI responses may be inaccurate. Press Enter to send.
        </p>
      </div>
    </>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

  return (
    <div className={`my-6 flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={message.role} />
      <div className={`flex max-w-[85%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm text-accent-foreground"
              : "prose prose-invert prose-sm max-w-none text-foreground prose-headings:font-display prose-headings:tracking-tight prose-p:my-2 prose-pre:bg-secondary/50 prose-code:text-accent"
          }
        >
          {isUser ? text : <ReactMarkdown>{text}</ReactMarkdown>}
        </div>
      </div>
    </div>
  );
}

function Avatar({ role }: { role: string }) {
  if (role === "user") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
        You
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}
