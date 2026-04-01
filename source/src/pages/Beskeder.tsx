import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, Send, Smile, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck, Newspaper, ExternalLink, MessageCircle, Plus, ArrowLeft, X, Loader2, Users } from "lucide-react";
import { Link } from "wouter";
import { fetchNews, formatNewsTime, type NewsItem } from "@/lib/newsEngine";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/lib/logger";

/* ── Types ── */

interface ConversationRow {
  id: string;
  created_at: string;
}

interface ParticipantRow {
  conversation_id: string;
  user_id: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ProfileRow {
  user_id: string;
  display_name: string | null;
}

interface ConversationDisplay {
  id: string;
  otherUser: ProfileRow;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

/* ── Helpers ── */

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Nu";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHrs < 24) return `${diffHrs}t`;
  if (diffDays === 1) return "I går";
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
}

function defaultAvatar(name: string | null): string {
  const initial = (name ?? "?")[0]?.toUpperCase() ?? "?";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=4ECDC4&color=0a0f1a&size=80&bold=true`;
}

/* ── Component ── */

export default function Beskeder() {
  const { t } = useTranslation();
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const myId = user?.id ?? null;

  // Conversations
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [convoLoading, setConvoLoading] = useState(true);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);

  // Messages for active conversation
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);

  // Input
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // Search / new conversation
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<ProfileRow[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // News sidebar
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Toast for "coming soon" messages
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId) ?? null;

  const commonEmojis = ["😀", "😂", "🥰", "😍", "❤️", "👍", "👋", "🎉", "🔥", "✨", "😎", "🤔", "😅", "🙏", "💪", "😢", "😡", "🥳", "💯", "👀", "🤝", "☀️", "🌙", "🎶"];

  /* ── Toast helper ── */
  const showComingSoonToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  /* ── Emoji picker handler ── */
  const handleEmojiClick = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  /* ── Fetch conversations ── */
  const loadConversations = useCallback(async () => {
    if (!myId) { setConvoLoading(false); return; }

    try {
      // Get conversation IDs the user participates in
      const { data: parts, error: partsErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", myId);

      if (partsErr || !parts || parts.length === 0) {
        setConversations([]);
        setConvoLoading(false);
        return;
      }

      const convoIds = parts.map(p => p.conversation_id);

      // For each conversation, get the other participant's profile + last message
      const convos: ConversationDisplay[] = [];

      for (const cid of convoIds) {
        // Other participant
        const { data: otherParts } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", cid)
          .neq("user_id", myId);

        const otherUserId = otherParts?.[0]?.user_id;
        let otherUser: ProfileRow = { user_id: otherUserId ?? "", display_name: t('beskeder.unknown') };

        if (otherUserId) {
          const { data: prof } = await supabase
            .from("user_profiles")
            .select("user_id, display_name")
            .eq("user_id", otherUserId)
            .single();
          if (prof) otherUser = prof;
        }

        // Last message
        const { data: lastMsgs } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", cid)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMsg = lastMsgs?.[0];

        convos.push({
          id: cid,
          otherUser,
          lastMessage: lastMsg?.content ?? t('beskeder.no_messages_yet'),
          lastMessageTime: lastMsg?.created_at ?? new Date().toISOString(),
          unread: false,
        });
      }

      // Sort by last message time (newest first)
      convos.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      setConversations(convos);
    } catch (err) {
      console.error("loadConversations error:", err);
    } finally {
      setConvoLoading(false);
    }
  }, [myId]);

  /* ── Fetch messages for active conversation ── */
  const loadMessages = useCallback(async (convoId: string) => {
    setMsgsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setMsgsLoading(false);
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    loadConversations();
    fetchNews()
      .then(items => { setAllNews(items); setNewsLoading(false); })
      .catch(() => setNewsLoading(false));
  }, [loadConversations]);

  /* ── Load messages when conversation changes ── */
  useEffect(() => {
    if (activeConvoId) {
      loadMessages(activeConvoId);
    } else {
      setMessages([]);
    }
  }, [activeConvoId, loadMessages]);

  /* ── Realtime subscription for new messages ── */
  useEffect(() => {
    if (!activeConvoId) return;

    const channel = supabase
      .channel(`messages:${activeConvoId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvoId}`,
        },
        (payload: any) => {
          const newMsg = payload.new as MessageRow;
          setMessages(prev => {
            // Skip if already have this exact message
            if (prev.some(m => m.id === newMsg.id)) return prev;
            // Replace optimistic message (same sender + content within 10s) with real one
            const optimisticIdx = prev.findIndex(m =>
              m.sender_id === newMsg.sender_id &&
              m.content === newMsg.content &&
              Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 10000
            );
            if (optimisticIdx !== -1) {
              const updated = [...prev];
              updated[optimisticIdx] = newMsg;
              return updated;
            }
            return [...prev, newMsg];
          });
          // Update last message in conversation list
          setConversations(prev =>
            prev.map(c =>
              c.id === activeConvoId
                ? { ...c, lastMessage: newMsg.content, lastMessageTime: newMsg.created_at }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvoId]);

  /* ── Scroll to bottom on new messages ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send message ── */
  const handleSend = async () => {
    if (!messageText.trim() || !activeConvoId || !myId || sending) return;

    const content = messageText.trim();
    setMessageText("");
    setSending(true);

    // Optimistic insert
    const tempId = crypto.randomUUID();
    const optimistic: MessageRow = {
      id: tempId,
      conversation_id: activeConvoId,
      sender_id: myId,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConvoId,
        sender_id: myId,
        content,
      });

    if (error) {
      console.error("Send message error:", error);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
      // Update conversation list last message
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConvoId
            ? { ...c, lastMessage: content, lastMessageTime: new Date().toISOString() }
            : c
        )
      );
    }

    setSending(false);
    inputRef.current?.focus();
  };

  /* ── Search users for new conversation ── */
  useEffect(() => {
    if (!userSearch.trim() || !showNewConvo) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id, display_name")
        .ilike("display_name", `%${userSearch.trim()}%`)
        .neq("user_id", myId ?? "")
        .limit(10);

      if (!error && data) {
        setUserResults(data);
      }
      setSearchingUsers(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, showNewConvo, myId]);

  /* ── Start new conversation ── */
  const [startingConvo, setStartingConvo] = useState<string | null>(null);
  const [convoError, setConvoError] = useState<string | null>(null);

  const startConversation = async (otherUserId: string) => {
    logger.log("[Beskeder] startConversation called", { otherUserId, myId });
    if (!myId) {
      setConvoError("Du er ikke logget ind. Prøv at genindlæse siden.");
      console.error("[Beskeder] myId is null — user not logged in");
      return;
    }
    setStartingConvo(otherUserId);
    setConvoError(null);

    try {
      // Check if conversation already exists
      logger.log("[Beskeder] Checking existing conversations...");
      const { data: myConvos, error: fetchErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", myId);
      logger.log("[Beskeder] My convos:", myConvos?.length, "error:", fetchErr?.message);

      if (myConvos) {
        for (const mc of myConvos) {
          const { data: otherInConvo } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", mc.conversation_id)
            .eq("user_id", otherUserId);

          if (otherInConvo && otherInConvo.length > 0) {
            setActiveConvoId(mc.conversation_id);
            setShowNewConvo(false);
            setUserSearch("");
            setUserResults([]);
            setStartingConvo(null);
            return;
          }
        }
      }

      // Create new conversation
      logger.log("[Beskeder] Creating new conversation...");
      const { data: newConvo, error: convoErr } = await supabase
        .from("conversations")
        .insert({})
        .select("id")
        .single();
      logger.log("[Beskeder] Create result:", { newConvo, convoErr: convoErr?.message });

      if (convoErr || !newConvo) {
        setConvoError("Kunne ikke oprette samtale: " + (convoErr?.message || "ukendt fejl"));
        setStartingConvo(null);
        return;
      }

      // Add both participants
      const { error: insertErr } = await supabase.from("conversation_participants").insert([
        { conversation_id: newConvo.id, user_id: myId },
        { conversation_id: newConvo.id, user_id: otherUserId },
      ]);

      if (insertErr) {
        setConvoError("Kunne ikke tilføje deltagere: " + insertErr.message);
        await supabase.from("conversations").delete().eq("id", newConvo.id);
        setStartingConvo(null);
        return;
      }

      await loadConversations();
      setActiveConvoId(newConvo.id);
      setShowNewConvo(false);
      setUserSearch("");
      setUserResults([]);
    } catch (err: any) {
      setConvoError("Fejl: " + (err?.message || String(err)));
    } finally {
      setStartingConvo(null);
    }
  };

  /* ── Filter conversations by search ── */
  const filteredConvos = searchQuery.trim()
    ? conversations.filter(c =>
        (c.otherUser.display_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  /* ── Loading state ── */
  if (authLoading) {
    return (
      <div className="flex h-full bg-[#0a0f1a] text-white items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#4ECDC4]" />
      </div>
    );
  }

  /* ── Not logged in state ── */
  if (!isLoggedIn) {
    return (
      <div className="flex h-full bg-[#0a0f1a] text-white items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <MessageCircle size={48} className="text-[#4ECDC4] mx-auto" />
          <h2 className="text-xl font-bold">{t('beskeder.title')}</h2>
          <p className="text-white/50 text-sm">{t('beskeder.login_prompt')}</p>
          <Link href="/auth" className="mt-4 px-5 py-2.5 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold hover:bg-[#3dbdb5] transition-all inline-block">
            Log ind
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0a0f1a] text-white overflow-hidden">
      {/* ── Conversation list (left panel) ── */}
      <div className={`w-full md:w-72 border-r border-white/10 flex flex-col flex-shrink-0 ${activeConvoId ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-6 pt-8 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">{t('beskeder.title')}</h1>
            <button
              onClick={() => setShowNewConvo(true)}
              className="w-8 h-8 rounded-lg bg-[#4ECDC4]/15 text-[#4ECDC4] flex items-center justify-center hover:bg-[#4ECDC4]/25 transition-colors"
              title={t('beskeder.new_conversation')}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            <input
              type="search"
              placeholder={t('beskeder.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {convoLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-white/30" />
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <MessageCircle size={32} className="text-white/15 mx-auto" />
              <p className="text-white/30 text-sm">
                {conversations.length === 0
                  ? t('beskeder.no_messages_yet')
                  : t('beskeder.no_results')}
              </p>
              {conversations.length === 0 && (
                <button
                  onClick={() => setShowNewConvo(true)}
                  className="text-[#4ECDC4] text-xs font-semibold hover:underline"
                >
                  {t('beskeder.start_conversation')}
                </button>
              )}
            </div>
          ) : (
            filteredConvos.map(convo => (
              <button
                key={convo.id}
                onClick={() => setActiveConvoId(convo.id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors ${
                  activeConvoId === convo.id ? "bg-white/5" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={defaultAvatar(convo.otherUser.display_name)}
                    alt={convo.otherUser.display_name ?? ""}
                    className="w-11 h-11 rounded-xl object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm truncate text-white/70">
                      {convo.otherUser.display_name ?? t('beskeder.unknown_user')}
                    </span>
                    <span className="text-xs text-white/30 ml-2">
                      {formatTime(convo.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-xs truncate text-white/35">{convo.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat area (center panel) ── */}
      <div className={`flex-1 flex flex-col min-w-0 relative ${!activeConvoId ? 'hidden md:flex' : 'flex'}`}>
        {activeConvo ? (
          <>
            {/* Toast notification */}
            {showToast && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#4ECDC4] text-[#0a0f1a] px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg animate-fade-in-out">
                {toastMsg}
              </div>
            )}

            {/* Chat header */}
            <div className="h-16 border-b border-white/10 px-4 md:px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConvoId(null)} className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 mr-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <img
                  src={defaultAvatar(activeConvo.otherUser.display_name)}
                  alt={activeConvo.otherUser.display_name ?? ""}
                  className="w-9 h-9 rounded-xl object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="font-bold text-sm leading-none">
                    {activeConvo.otherUser.display_name ?? t('beskeder.unknown_user')}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => showComingSoonToast("Opkald kommer snart")}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Phone size={16} />
                </button>
                <button
                  onClick={() => showComingSoonToast("Videoopkald kommer snart")}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Video size={16} />
                </button>
                <button
                  onClick={() => showComingSoonToast("Flere muligheder kommer snart")}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {msgsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-white/30" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/20 text-sm">{t('beskeder.write_first_message')}</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === myId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMe ? "bg-[#4ECDC4] text-[#0a0f1a]" : "bg-white/8 text-white/90"
                      }`}>
                        <p className="mb-1">{msg.content}</p>
                        <div className={`flex items-center justify-end gap-1 text-[11px] ${
                          isMe ? "text-[#0a0f1a]/50" : "text-white/30"
                        }`}>
                          {formatMessageTime(msg.created_at)}
                          {isMe && <CheckCheck size={10} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-white/10 flex-shrink-0 relative">
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 bg-[#0d1225] border border-white/10 rounded-2xl p-3 grid grid-cols-6 gap-2 w-fit shadow-lg z-40">
                  {commonEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-xl hover:bg-white/10 rounded-lg p-1.5 transition-colors text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => showComingSoonToast("Vedhæft fil kommer snart")}
                  className="p-1.5 text-white/30 hover:text-[#4ECDC4] transition-colors"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t('beskeder.message_placeholder')}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white/90 placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 text-white/30 hover:text-[#4ECDC4] transition-colors"
                >
                  <Smile size={16} />
                </button>
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="p-2 bg-[#4ECDC4] text-[#0a0f1a] rounded-xl hover:bg-[#3dbdb5] transition-all disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-xs">
              <MessageCircle size={48} className="text-white/10 mx-auto" />
              <h3 className="text-white/40 font-semibold">{t('beskeder.select_conversation')}</h3>
              <p className="text-white/20 text-sm">
                {t('beskeder.or_start_new')}
              </p>
              <button
                onClick={() => setShowNewConvo(true)}
                className="px-5 py-2.5 rounded-xl bg-[#4ECDC4]/15 text-[#4ECDC4] text-sm font-semibold hover:bg-[#4ECDC4]/25 transition-all"
              >
                {t('beskeder.new_conversation')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Column - News Sidebar ── */}
      <div className="w-80 px-6 py-8 space-y-6 overflow-y-auto hidden xl:flex flex-col custom-scrollbar border-l border-white/10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-[#4ECDC4]" />
              <h3 className="text-sm font-bold">{t('beskeder.latest_news')}</h3>
            </div>
            <span className="text-[11px] font-bold text-[#4ECDC4] bg-[#4ECDC4]/10 px-2 py-0.5 rounded-full">LIVE</span>
          </div>
          {newsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-white/10 rounded mb-1.5 w-full" />
                  <div className="h-2 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : allNews.length > 0 ? (
            <div className="space-y-3">
              {allNews.slice(0, 6).map(news => (
                <a
                  key={news.link}
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 hover:bg-white/5 rounded-xl p-1.5 -mx-1.5 transition-all"
                >
                  {news.image && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={news.image} alt="" className="w-full h-full object-cover opacity-80" loading="lazy" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 group-hover:text-[#4ECDC4] transition-colors line-clamp-2 mb-1">{news.title}</p>
                    <div className="flex items-center gap-1 text-[11px] text-white/30">
                      <span>{news.sourceEmoji} {news.source}</span>
                      <span>•</span>
                      <span>{formatNewsTime(news.pubDate)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30 text-center py-4">{t('beskeder.no_news')}</p>
          )}
        </div>
      </div>

      {/* ── New Conversation Modal ── */}
      {showNewConvo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onKeyDown={(e) => { if (e.key === 'Escape') { setShowNewConvo(false); setUserSearch(''); setUserResults([]); } }} tabIndex={-1} ref={(el) => el?.focus()}>
          <div className="bg-[#0d1225] border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-white font-bold">{t('beskeder.new_conversation')}</h2>
              <button
                onClick={() => { setShowNewConvo(false); setUserSearch(""); setUserResults([]); }}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input
                  type="text"
                  placeholder={t('beskeder.search_user_placeholder')}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50"
                />
              </div>

              {convoError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center mb-2">
                  {convoError}
                </div>
              )}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searchingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={18} className="animate-spin text-white/30" />
                  </div>
                ) : userSearch.trim() && userResults.length === 0 ? (
                  <p className="text-center py-8 text-white/30 text-sm">{t('beskeder.no_users_found')}</p>
                ) : (
                  userResults.map(u => (
                    <button
                      key={u.user_id}
                      onClick={() => startConversation(u.user_id)}
                      disabled={startingConvo === u.user_id}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left ${startingConvo === u.user_id ? "opacity-50 cursor-wait" : ""}`}
                    >
                      {startingConvo === u.user_id ? (
                        <Loader2 size={20} className="w-10 h-10 animate-spin text-[#4ECDC4]" />
                      ) : (
                        <img
                          src={defaultAvatar(u.display_name)}
                          alt={u.display_name ?? ""}
                          className="w-10 h-10 rounded-xl object-cover"
                          loading="lazy"
                        />
                      )}
                      <span className="text-white/80 text-sm font-medium">
                        {startingConvo === u.user_id ? "Opretter samtale..." : (u.display_name ?? t('beskeder.unknown'))}
                      </span>
                    </button>
                  ))
                )}
                {!userSearch.trim() && (
                  <p className="text-center py-8 text-white/20 text-xs">
                    {t('beskeder.type_name_to_search')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
  }
