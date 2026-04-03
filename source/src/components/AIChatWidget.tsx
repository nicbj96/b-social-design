import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTags } from "@/context/TagContext";

const CHAT_API = "https://rbengtfrthqdfbcdcugp.supabase.co/functions/v1/ai-chat";

interface Message {
  role: "user" | "assistant";
  content: string;
  sentToTeam?: boolean;
}

function parsePageContext(path: string): { pageType: string; entityId?: string } {
  const eventMatch = path.match(/^\/event\/(.+)/);
  if (eventMatch) return { pageType: "event", entityId: eventMatch[1] };
  const stedMatch = path.match(/^\/sted\/(.+)/);
  if (stedMatch) return { pageType: "place", entityId: stedMatch[1] };
  const catMatch = path.match(/^\/kategori\/(.+)/);
  if (catMatch) return { pageType: "category", entityId: decodeURIComponent(catMatch[1]) };
  const knownPages: Record<string, string> = {
    "/feed": "feed", "/udforsk": "explore", "/kort": "map",
    "/kalender": "calendar", "/min-side": "profile", "/beskeder": "messages",
    "/notifikationer": "notifications", "/overblik": "overview",
    "/indstillinger": "settings",
  };
  return { pageType: knownPages[path] || "other" };
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile, session } = useAuth();
  const { selectedTags, lifeMode, priceTier, city, radius } = useTags();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const pageCtx = parsePageContext(location);
      const resp = await fetch(CHAT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
          page: location,
          pageType: pageCtx.pageType,
          entityId: pageCtx.entityId,
          userContext: profile
            ? {
                name: profile.name,
                city: profile.city,
                radius_km: profile.radius_km,
                interests: profile.interests,
                vibe_tags: profile.vibe_tags,
                discovery_mode: profile.discovery_mode,
                experience_mode: profile.experience_mode,
                energy_level: profile.energy_level,
                role: profile.role,
              }
            : null,
          tagContext: {
            selectedTags,
            lifeMode,
            priceTier,
            city,
            radius,
          },
        }),
      });

      const data = await resp.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply || "Beklager, noget gik galt.",
        sentToTeam: data.sent_to_team,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Beklager, jeg kan ikke forbinde lige nu. Prøv igen om lidt.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  // Hide on Beskeder page — has its own chat UI
  if (location === "/beskeder") return null;

  // Floating button (hidden when chat is open)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        data-chat-widget
        className="fixed bottom-24 right-4 z-[9999] w-14 h-14 rounded-full bg-[#4ECDC4] text-[#0a0f1a] shadow-lg shadow-[#4ECDC4]/30 flex items-center justify-center hover:scale-105 transition-transform md:bottom-6"
        aria-label="Åbn chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-end p-0 md:p-4 md:items-end">
      {/* Backdrop on mobile */}
      <div className="absolute inset-0 bg-black/40 md:hidden" onClick={() => setOpen(false)} />

      {/* Chat window */}
      <div className="relative w-full h-full md:w-[380px] md:h-[520px] md:max-h-[80vh] bg-[#060a0f] md:rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#060a0f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center">
              <Bot size={16} className="text-[#4ECDC4]" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold">B-Social Assistent</h3>
              <p className="text-white/40 text-[11px]">AI-drevet • Svar inden for sekunder</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Luk chat"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#4ECDC4]/10 flex items-center justify-center mx-auto mb-3">
                <Bot size={24} className="text-[#4ECDC4]" />
              </div>
              <h4 className="text-white font-semibold text-sm mb-1">Hej! 👋</h4>
              <p className="text-white/40 text-xs leading-relaxed max-w-[240px] mx-auto">
                Jeg er B-Social's AI-assistent. Spørg mig om events, steder, eller hvordan platformen virker.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {(profile
                  ? [`Events i ${profile.city || "nærheden"}`, "Hvad passer til mine interesser?", "Anbefal et sted"]
                  : ["Find events i dag", "Hvad er B-Social?", "Hjælp med at komme i gang"]
                ).map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-[#4ECDC4]/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Bot size={12} className="text-[#4ECDC4]" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#4ECDC4] text-[#0a0f1a] rounded-br-md"
                  : "bg-white/8 text-white/90 rounded-bl-md"
              }`}>
                {msg.content}
                {msg.sentToTeam && (
                  <p className="text-[10px] mt-1 opacity-60">📩 Sendt til teamet</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <User size={12} className="text-white/60" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-[#4ECDC4]/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Bot size={12} className="text-[#4ECDC4]" />
              </div>
              <div className="bg-white/8 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-white/10 bg-[#060a0f]">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv en besked..."
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50 focus:border-[#4ECDC4]/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] flex items-center justify-center hover:bg-[#3dbdb5] transition-colors disabled:opacity-30 disabled:hover:bg-[#4ECDC4] flex-shrink-0"
              aria-label="Send besked"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <p className="text-[10px] text-white/20 text-center mt-1.5">
            Drevet af AI • Svar kan indeholde fejl
          </p>
        </div>
      </div>
    </div>
  );
}
