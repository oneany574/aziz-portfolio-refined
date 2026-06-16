import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Aziz's AI Assistant — a friendly, knowledgeable AI companion built into Aziz Khaldi's portfolio website.

About Aziz Khaldi:
- Aziz is a senior creative developer and motion designer with a passion for crafting premium, award-winning digital experiences.
- He specializes in high-end portfolio sites, interactive web experiences, motion design, and front-end engineering.
- His work blends bold typography, smooth scrolling, cinematic animations, and a dark, premium aesthetic.
- Tech he loves: React, TanStack Start, Framer Motion, GSAP, Lenis, Three.js, Tailwind CSS, and modern web standards.

Your role:
- Help visitors learn about Aziz, his work, services, and process.
- Answer general questions like ChatGPT would — helpful, conversational, accurate.
- Use markdown (headings, lists, **bold**, code blocks) to format responses clearly.
- Be concise by default; expand when the user asks for detail.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
