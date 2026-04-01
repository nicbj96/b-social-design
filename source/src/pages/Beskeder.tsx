import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, Send, Smile, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck, Newspaper, ExternalLink, MessageCircle, Plus, ArrowLeft, X, Loader2, Users } from "lucide-react";
import { Link } from "wouter";
import { fetchNews, formatNewsTime, type NewsItem } from "@/lib/newsEngine";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/lib/logger";
import { useWebRTC } from "@/hooks/useWebRTC";
import CallModal from "@/components/CallModal";

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

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
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

const EMOJI_CATEGORIES = {
  SMILEYS: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "🫤", "😟", "🙁", "😮", "😯", "😲", "😳", "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖"],
  HANDS: ["👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪"],
  HEARTS: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
  NATURE: ["🌸", "🌺", "🌻", "🌹", "🌷", "🌼", "💐", "🍀", "🌿", "🌱", "🌳", "🌲", "🍃", "🍂", "🍁", "🌾", "🌵", "🎋", "🎍", "🍄", "🐚", "🌊", "💧", "🔥", "⭐", "🌟", "✨", "⚡", "☀️", "🌙", "🌈", "☁️", "🌤️", "🌥️", "🌦️", "❄️", "💨", "🌀"],
  FOOD: ["🍕", "🍔", "🍟", "🌭", "🍿", "🧀", "🥚", "🍳", "🥞", "🧇", "🥓", "🍗", "🍖", "🥩", "🌮", "🌯", "🫔", "🥙", "🧆", "🥗", "🥘", "🫕", "🍝", "🍜", "🍛", "🍣", "🍱", "🥟", "🍤", "🍙", "🍚", "🍘", "🍥", "🥮", "🍡", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍩", "🍪", "🍯", "🍺", "🍻", "🥂", "🍷", "🍸", "🍹", "🧃", "☕", "🍵", "🧋"],
  ACTIVITIES: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🥅", "⛳", "🏹", "🎣", "🥊", "🥋", "🎿", "⛷️", "🏂", "🏋️", "🎮", "🎯", "🎲", "🧩", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕"],
  OBJECTS: ["💡", "🔦", "📱", "💻", "⌨️", "🖥️", "🖨️", "📷", "📹", "🎥", "📞", "📺", "📻", "⏰", "⌚", "💰", "💳", "💎", "🔑", "🗝️", "🔒", "🔓", "📦", "📫", "📬", "✉️", "📝", "📄", "📋", "📌", "📎", "🔗", "✂️", "🗑️", "🧲", "🔧", "🔨", "⚙️", "🧰"],
  FLAGS: ["🇩🇰", "🇩🇪", "🇬🇧", "🇺🇸", "🇫🇷", "🇪🇸", "🇮🇹", "🇳🇴", "🇸🇪", "🇫🇮", "🇳🇱", "🇧🇪", "🇦🇹", "🇨🇭", "🇵🇹", "🇧🇷", "🇯🇵", "🇰🇷", "🇨🇳", "🇮🇳", "🇦🇺", "🏳️‍🌈"],
};

const CATEGORY_ICONS: Record<string, string> = {
  SMILEYS: "😀",
  HANDS: "👋",
  HEARTS: "❤️",
  NATURE: "🌸",
  FOOD: "🍕",
  ACTIVITIES: "🎮",
  OBJECTS: "💡",
  FLAGS: "🇩🇰",
};

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

  // Toast for notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>("SMILEYS");
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});

  // File attachments
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Chat menu
  const [showChatMenu, setShowChatMenu] = useState(false);

  // WebRTC calls
  const [isVideoCall, setIsVideoCall] = useState(false);
  const webrtc = useWebRTC(activeConvoId, myId);

  // Sync isVideoCall when receiving an incoming video call
  useEffect(() => {
    if (webrtc.callState === 'ringing' && webrtc.isIncomingVideo) {
      setIsVideoCall(true);
    }
  }, [webrtc.callState, webrtc.isIncomingVideo]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId) ?? null;

  /* ── Toast helper ── */
  const showToastMsg = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  /* ── File attachment handler ── */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeConvoId || !myId) return;

    if (file.size > 10 * 1024 * 1024) {
      showToastMsg("Filen er for stor (maks 10MB)");
      return;
    }

    setUploading(true);
    try {
      const filePath = `${activeConvoId}/${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;
      const fileMessage = `[file:${file.name}:${file.type}:${publicUrl}]`;

      // Send message with file reference
      const tempId = crypto.randomUUID();
      const optimistic: MessageRow = {
        id: tempId,
        conversation_id: activeConvoId,
        sender_id: myId,
        content: fileMessage,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimistic]);

      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConvoId,
          sender_id: myId,
          content: fileMessage,
        });

      if (msgError) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        throw msgError;
      }

      // Insert attachment record
      await supabase.from("message_attachments").insert({
        message_id: tempId,
        file_name: file.name,
        file_type: file.type,
        file_url: publicUrl,
        file_size: file.size,
      });

      // Update conversation list
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConvoId
            ? { ...c, lastMessage: `📎 ${file.name}`, lastMessageTime: new Date().toISOString() }
            : c
        )
      );

      showToastMsg("Fil vedhæftet");
    } catch (err) {
      console.error("File upload error:", err);
      showToastMsg("Fejl ved upload af fil");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ── Emoji reaction handlers ── */
  const loadReactions = useCallback(async (msgIds: string[]) => {
    if (msgIds.length === 0) return;
    try {
      const { data, error } = await supabase
        .from("message_reactions")
        .select("*")
        .in("message_id", msgIds);

      if (!error && data) {
        const grouped: Record<string, MessageReaction[]> = {};
        data.forEach(r => {
          if (!grouped[r.message_id]) grouped[r.message_id] = [];
          grouped[r.message_id].push(r);
        });
        setReactions(grouped);
      }
    } catch (err) {
      console.error("Load reactions error:", err);
    }
  }, []);

  const addReaction = async (messageId: string, emoji: string) => {
    if (!myId) return;
    try {
      const { error } = await supabase.from("message_reactions").insert({
        message_id: messageId,
        user_id: myId,
        emoji,
      });

      if (!error) {
        setReactions(prev => ({
          ...prev,
          [messageId]: [
            ...(prev[messageId] ?? []),
            {
              id: crypto.randomUUID(),
              message_id: messageId,
              user_id: myId,
              emoji,
              created_at: new Date().toISOString(),
            },
          ],
        }));
        setReactionPickerMsgId(null);
      }
    } catch (err) {
      console.error("Add reaction error:", err);
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!myId) return;
    try {
      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("emoji", emoji)
        .eq("user_id", myId);

      if (!error) {
        setReactions(prev => ({
          ...prev,
          [messageId]: (prev[messageId] ?? []).filter(r => !(r.emoji === emoji && r.user_id === myId)),
        }));
      }
    } catch (err) {
      console.error("Remove reaction error:", err);
    }
  };

  /* ── File message rendering helper ── */
  const renderFileAttachment = (content: string) => {
    const fileMatch = content.match(/^\[file:(.+?):(.+?):(.+?)\]$/);
    if (!fileMatch) return null;

    const [, fileName, fileType, fileUrl] = fileMatch;

    if (fileType.startsWith("image/")) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-xs rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
            loading="lazy"
          />
        </a>
      );
    }

    if (fileType === "application/pdf") {
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/15 transition-colors"
        >
          <span className="text-xl">📄</span>
          <span className="text-sm font-medium truncate max-w-xs">{fileName}</span>
        </a>
      );
    }

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-400 hover:underline text-sm"
      >
        📎 {fileName}
      </a>
    );
  };

  /* ── Close menus on outside click ── */
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node) &&
        (e.target as HTMLElement)?.closest("button") !== inputRef.current?.parentElement?.querySelector("[aria-label='emoji']")
      ) {
        setShowEmojiPicker(false);
      }
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(e.target as Node)) {
        setReactionPickerMsgId(null);
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) {
        setShowChatMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ── Emoji picker handler ── */
  const handleEmojiClick = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  /* ── Fetch conversations ── */
  const loadConversations = useCallback(async () => {
    if (!myId) { setConvoLoading(false); return; }

    try {
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
      const convos: ConversationDisplay[] = [];

      for (const cid of convoIds) {
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

        const { data: lastMsgs } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", cid)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMsg = lastMsgs?.[0];
        let displayMsg = lastMsg?.content ?? t('beskeder.no_messages_yet');
        if (displayMsg.match(/^\[file:.+?:.+?:.+?\]$/)) {
          const match = displayMsg.match(/^\[file:(.+?):/);
          displayMsg = `📎 ${match?.[1] ?? "Fil"}`;
        }

        convos.push({
          id: cid,
          otherUser,
          lastMessage: displayMsg,
          lastMessageTime: lastMsg?.created_at ?? new Date().toISOString(),
          unread: false,
        });
      }

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
      await loadReactions(data.map(m => m.id));
    }
    setMsgsLoading(false);
  }, [loadReactions]);

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
      setReactions({});
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
            if (prev.some(m => m.id === newMsg.id)) return prev;
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

  /* ── Realtime subscription for reactions ── */
  useEffect(() => {
    if (!activeConvoId) return;

    const channel = supabase
      .channel(`reactions:${activeConvoId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "message_reactions",
          filter: `message_id=in.(${messages.map(m => `"${m.id}"`).join(",")})`,
        },
        (payload: any) => {
          const newReaction = payload.new as MessageReaction;
          setReactions(prev => ({
            ...prev,
            [newReaction.message_id]: [...(prev[newReaction.message_id] ?? []), newReaction],
          }));
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "DELETE",
          schema: "public",
          table: "message_reactions",
          filter: `message_id=in.(${messages.map(m => `"${m.id}"`).join(",")})`,
        },
        (payload: any) => {
          const deletedReaction = payload.old as MessageReaction;
          setReactions(prev => ({
            ...prev,
            [deletedReaction.message_id]: (prev[deletedReaction.message_id] ?? []).filter(r => r.id !== deletedReaction.id),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvoId, messages]);

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
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
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

  /* ── Delete conversation (soft delete) ── */
  const handleDeleteConversation = () => {
    if (!activeConvoId) return;
    setConversations(prev => prev.filter(c => c.id !== activeConvoId));
    setActiveConvoId(null);
    setShowChatMenu(false);
    showToastMsg("Samtale slettet");
  };

  /* ── Block user ── */
  const handleBlockUser = async () => {
    if (!activeConvo || !myId) return;
    try {
      await supabase.from("blocked_users").insert({
        user_id: myId,
        blocked_user_id: activeConvo.otherUser.user_id,
      });
      setConversations(prev => prev.filter(c => c.id !== activeConvoId));
      setActiveConvoId(null);
      setShowChatMenu(false);
      showToastMsg("Bruger blokeret");
    } catch (err) {
      console.error("Block user error:", err);
      showToastMsg("Fejl ved blokering");
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
      <div className="flex h-full bg-[#060a0f] text-white items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#4ECDC4]" />
      </div>
    );
  }

  /* ── Not logged in state ── */
  if (!isLoggedIn) {
    return (
      <div className="flex h-full bg-[#060a0f] text-white items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <MessageCircle size={48} className="text-[#4ECDC4] mx-auto" />
          <h2 className="text-xl font-serif" style={{ fontWeight: 400 }}>{t('beskeder.title')}</h2>
          <p className="text-white/50 text-sm">{t('beskeder.login_prompt')}</p>
          <Link href="/auth" className="mt-4 px-5 py-2.5 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold hover:bg-[#3dbdb5] transition-all inline-block">
            Log ind
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#060a0f] text-white overflow-hidden">
      {/* ── Conversation list (left panel) ── */}
      <div className={`w-full md:w-72 border-r border-white/10 flex flex-col flex-shrink-0 ${activeConvoId ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-6 pt-8 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-serif" style={{ fontWeight: 400 }}>{t('beskeder.title')}</h1>
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
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
                <MessageCircle size={32} className="text-white/20" />
              </div>
              <p className="text-white/40 text-sm">
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
                className={`w-full flex items-center gap-3 p-4 mx-2 my-1 rounded-2xl backdrop-blur-md transition-all ${
                  activeConvoId === convo.id
                    ? "bg-white/10 border border-white/20 shadow-lg shadow-[#4ECDC4]/10"
                    : "bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 hover:shadow-md"
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
                  <h3 className="font-bold text-sm leading-none font-serif">
                    {activeConvo.otherUser.display_name ?? t('beskeder.unknown_user')}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-1 relative">
                <button
                  onClick={() => { setIsVideoCall(false); webrtc.startCall(false); }}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Starte opkald"
                >
                  <Phone size={16} />
                </button>
                <button
                  onClick={() => { setIsVideoCall(true); webrtc.startCall(true); }}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Starte videoopkald"
                >
                  <Video size={16} />
                </button>
                <div className="relative" ref={chatMenuRef}>
                  <button
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {showChatMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-[#060a0f] border border-white/15 rounded-xl shadow-xl shadow-black/40 z-50 overflow-hidden backdrop-blur-md">
                      <button
                        onClick={handleDeleteConversation}
                        className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        Slet samtale
                      </button>
                      <button
                        onClick={handleBlockUser}
                        className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border-t border-white/10"
                      >
                        Bloker bruger
                      </button>
                      <button
                        onClick={() => { showToastMsg("Rapport sendt"); setShowChatMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border-t border-white/10"
                      >
                        Rapportér
                      </button>
                      <button
                        onClick={() => { showToastMsg("Notifikationer slået fra"); setShowChatMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border-t border-white/10"
                      >
                        Slå notifikationer fra
                      </button>
                    </div>
                  )}
                </div>
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
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
                      <MessageCircle size={32} className="text-white/15" />
                    </div>
                    <p className="text-white/30 text-sm">{t('beskeder.write_first_message')}</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === myId;
                  const isFileMessage = msg.content.match(/^\[file:.+?:.+?:.+?\]$/);
                  const msgReactions = reactions[msg.id] ?? [];
                  const reactionGroups = msgReactions.reduce((acc, r) => {
                    const group = acc.find(g => g.emoji === r.emoji);
                    if (group) {
                      group.reactions.push(r);
                    } else {
                      acc.push({ emoji: r.emoji, reactions: [r] });
                    }
                    return acc;
                  }, [] as Array<{ emoji: string; reactions: MessageReaction[] }>);

                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMe ? "bg-[#4ECDC4] text-[#0a0f1a]" : "bg-white/8 text-white/90"
                        }`}>
                          {isFileMessage ? (
                            <div>{renderFileAttachment(msg.content)}</div>
                          ) : (
                            <p className="mb-1">{msg.content}</p>
                          )}
                          <div className={`flex items-center justify-end gap-1 text-[11px] ${
                            isMe ? "text-[#0a0f1a]/50" : "text-white/30"
                          }`}>
                            {formatMessageTime(msg.created_at)}
                            {isMe && <CheckCheck size={10} />}
                          </div>
                        </div>

                        {/* Reactions display */}
                        {reactionGroups.length > 0 && (
                          <div className="flex gap-1 flex-wrap justify-end px-2">
                            {reactionGroups.map(group => {
                              const userReacted = group.reactions.some(r => r.user_id === myId);
                              return (
                                <button
                                  key={group.emoji}
                                  onClick={() => {
                                    if (userReacted) {
                                      removeReaction(msg.id, group.emoji);
                                    } else {
                                      addReaction(msg.id, group.emoji);
                                    }
                                  }}
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${
                                    userReacted
                                      ? "bg-[#4ECDC4]/30 text-[#4ECDC4]"
                                      : "bg-white/5 hover:bg-white/10"
                                  } transition-colors`}
                                >
                                  <span>{group.emoji}</span>
                                  <span className="text-[10px]">{group.reactions.length}</span>
                                </button>
                              );
                            })}
                            {reactionPickerMsgId === msg.id && (
                              <div ref={reactionPickerRef} className="flex gap-1 bg-white/5 rounded-full p-1">
                                {["❤️", "😂", "👍", "😮", "😢", "🔥"].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => addReaction(msg.id, emoji)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-lg"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reaction picker button (on hover) */}
                        {reactionPickerMsgId !== msg.id && (
                          <button
                            onClick={() => setReactionPickerMsgId(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 text-xs text-white/40 hover:text-white/60"
                            title="Tilføj reaction"
                          >
                            +
                          </button>
                        )}
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
                <div ref={emojiPickerRef} className="absolute bottom-20 left-4 right-4 bg-[#060a0f] border border-white/15 rounded-2xl shadow-xl shadow-black/40 z-40 max-h-80 flex flex-col backdrop-blur-md">
                  {/* Category tabs */}
                  <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto flex-shrink-0">
                    {Object.keys(EMOJI_CATEGORIES).map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedEmojiCategory(category as keyof typeof EMOJI_CATEGORIES)}
                        className={`text-xl p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                          selectedEmojiCategory === category
                            ? "bg-[#4ECDC4]/30 text-[#4ECDC4]"
                            : "hover:bg-white/5"
                        }`}
                        title={category}
                      >
                        {CATEGORY_ICONS[category]}
                      </button>
                    ))}
                  </div>
                  {/* Emoji grid */}
                  <div className="overflow-y-auto p-2 grid grid-cols-6 gap-1">
                    {EMOJI_CATEGORIES[selectedEmojiCategory].map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl hover:bg-white/10 rounded-lg p-1.5 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="bg-white/5 border border-white/15 rounded-2xl px-3 py-2 flex items-center gap-2 backdrop-blur-md shadow-lg shadow-black/20 transition-all hover:border-white/25 hover:bg-white/8"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-1.5 text-white/30 hover:text-[#4ECDC4] transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf,video/mp4,audio/*" onChange={handleFileUpload} />
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
                  aria-label="emoji"
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
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
                <MessageCircle size={48} className="text-white/15" />
              </div>
              <h3 className="text-white/50 font-semibold font-serif text-lg">{t('beskeder.select_conversation')}</h3>
              <p className="text-white/30 text-sm">
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

        {/* WebRTC Call Modal */}
        <CallModal
          callState={webrtc.callState}
          localStream={webrtc.localStream}
          remoteStream={webrtc.remoteStream}
          isMuted={webrtc.isMuted}
          isVideoOff={webrtc.isVideoOff}
          callDuration={webrtc.callDuration}
          isVideo={isVideoCall}
          otherUserName={activeConvo?.otherUser.display_name ?? "Ukendt"}
          onAccept={webrtc.acceptCall}
          onEnd={webrtc.endCall}
          onToggleMute={webrtc.toggleMute}
          onToggleVideo={webrtc.toggleVideo}
        />
      </div>

      {/* ── Right Column - News Sidebar ── */}
      <div className="w-80 px-6 py-8 space-y-6 overflow-y-auto hidden xl:flex flex-col custom-scrollbar border-l border-white/10">
        <div className="bg-white/5 border border-white/15 rounded-2xl p-5 backdrop-blur-md shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-[#4ECDC4]" />
              <h3 className="text-sm font-bold">{t('beskeder.latest_news')}</h3>
            </div>
            <span className="text-[11px] font-bold text-[#4ECDC4] bg-[#4ECDC4]/15 px-2 py-0.5 rounded-full border border-[#4ECDC4]/20">LIVE</span>
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
            <div className="space-y-2">
              {allNews.slice(0, 6).map(news => (
                <a
                  key={news.link}
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-2 transition-all backdrop-blur-sm shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onKeyDown={(e) => { if (e.key === 'Escape') { setShowNewConvo(false); setUserSearch(''); setUserResults([]); } }} tabIndex={-1}>
          <div className="bg-[#060a0f] border border-white/15 rounded-2xl w-full max-w-md mx-4 overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
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
                      className={`w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left ${startingConvo === u.user_id ? "opacity-50 cursor-wait" : ""}`}
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; transition: background 0.2s; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
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
