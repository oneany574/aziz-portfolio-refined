import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function AIChatButton() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 18 }}
      className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
    >
      <Link
        to="/ai"
        aria-label="Open AI Chat"
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent px-5 py-3.5 text-sm font-medium text-accent-foreground shadow-2xl shadow-accent/30 transition-transform hover:scale-105"
      >
        <span className="absolute inset-0 -z-10 rounded-full bg-accent blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ask AI</span>
        <span className="ml-1 inline-block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-accent" />
      </Link>
    </motion.div>
  );
}
