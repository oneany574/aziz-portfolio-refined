import type { UIMessage } from "ai";

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const KEY = "aziz-ai-threads-v1";

export const INITIAL_GREETING: UIMessage = {
  id: "greeting",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: `# Hey, I'm Aziz's AI 👋

I'm an AI assistant trained on **Aziz Khaldi**'s work — a senior creative developer & motion designer crafting premium, award-winning digital experiences.

Here's what I can help you with:

- **About Aziz** — his background, skills, and creative philosophy
- **His work** — projects, case studies, and the tech behind them
- **Services** — what he offers and how to collaborate
- **General questions** — ask me anything, just like ChatGPT

What would you like to explore?`,
    },
  ],
} as UIMessage;

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Thread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(threads));
}

export function newThread(): Thread {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    updatedAt: Date.now(),
    messages: [INITIAL_GREETING],
  };
}

export function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const text = firstUser.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  return text.length > 40 ? text.slice(0, 40) + "…" : text || "New chat";
}
