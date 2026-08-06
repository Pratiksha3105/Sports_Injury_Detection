import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { apiListChatMessages, apiSendChatMessage } from "../api/historyApi";
import type { ChatMessage } from "../types/history";
import { getApiErrorMessage } from "../utils/apiError";

export function AskAIDrawer({ analysisId, onClose }: { analysisId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiListChatMessages(analysisId)
      .then(setMessages)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Couldn't load this conversation."));
        setMessages([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setSending(true);
    // Optimistically show the user's message while waiting for the reply.
    setMessages((prev) => [
      ...(prev ?? []),
      { id: `temp-${Date.now()}`, analysis_id: analysisId, role: "user", content: text, created_at: new Date().toISOString() },
    ]);
    try {
      const reply = await apiSendChatMessage(analysisId, text);
      setMessages((prev) => [...(prev ?? []), reply]);
    } catch (err) {
      const msg = getApiErrorMessage(err, "The assistant couldn't respond. Please try again.");
      if (msg.toLowerCase().includes("isn't configured")) setNotConfigured(true);
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(7,20,16,0.4)" }} onClick={onClose}>
      <motion.div
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col border-l"
        style={{ backgroundColor: "var(--color-panel)", borderColor: "var(--color-line)" }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--color-line)" }}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: "var(--color-accent)" }} />
            <h2 className="font-display text-sm font-medium">Ask AI about this report</h2>
          </div>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages === null ? (
            <div className="flex justify-center pt-10">
              <Loader2 className="animate-spin" style={{ color: "var(--color-accent)" }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="pt-6 text-center text-sm text-[var(--color-muted)]">
              Ask anything about this specific report — e.g. "Why is my risk high?" or "Generate a weekly recovery
              plan."
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ${m.role === "user" ? "ml-auto text-white" : ""}`}
                  style={
                    m.role === "user"
                      ? { backgroundColor: "var(--color-accent)" }
                      : { backgroundColor: "var(--color-paper-dim)", color: "var(--color-ink-soft)" }
                  }
                >
                  {m.content}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {sending && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <Loader2 size={12} className="animate-spin" /> Thinking…
            </div>
          )}
        </div>

        {notConfigured ? (
          <div className="border-t p-4 text-xs text-[var(--color-muted)]" style={{ borderColor: "var(--color-line)" }}>
            The AI assistant isn't set up yet on this server — an administrator needs to add an{" "}
            <code>ANTHROPIC_API_KEY</code> to the backend environment.
          </div>
        ) : (
          <form onSubmit={handleSend} className="border-t p-3" style={{ borderColor: "var(--color-line)" }}>
            {error && <p className="mb-2 text-xs text-[var(--color-risk-critical)]">{error}</p>}
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this report…"
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ borderColor: "var(--color-line)" }}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="btn-glow flex h-9 w-9 items-center justify-center rounded-lg text-white disabled:opacity-40"
                style={{ backgroundColor: "var(--color-accent)" }}
                aria-label="Send"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
