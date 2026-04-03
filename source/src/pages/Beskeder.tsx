import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, Send, Smile, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck, Newspaper, ExternalLink, MessageCircle, Plus, ArrowLeft, X, Loader2, Users, Hash, Volume2, ChevronDown, Settings } from "lucide-react";
import { Link } from "wouter";
import { fetchNews, formatNewsTime, type NewsItem } from "@/lib/newsEngine";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/lib/logger";
import { useWebRTC } from "@/hooks/useWebRTC";
import CallModal from "@/components/CallModal";
import { pageBase } from "@/lib/pageCSSBase";

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

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("da-DK", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
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

/* ── Scoped CSS — Discord Style ── */

const beskederCSS = `
${pageBase("bk")}

/* Override .dsk-main > * fadeSlideIn which sets opacity:0 */
.bk-root { animation: none !important; opacity: 1 !important; }

/* ── Layout — Three-panel Discord style ── */
.bk-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Left sidebar — Channel list ── */
.bk-channels {
  width: 250px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255,255,255,0.02);
  border-right: 1px solid rgba(255,255,255,0.06);
}
@media (max-width: 767px) {
  .bk-channels { display: none; }
  .bk-channels.bk-channels-open { display: flex; position: fixed; inset: 0; z-index: 60; width: 100%; }
}

.bk-channels-header {
  height: 52px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.2s;
}
.bk-channels-header:hover { background: rgba(255,255,255,0.03); }
.bk-channels-server-name {
  font-family: var(--serif);
  font-size: 16px;
  font-weight: 400;
  color: var(--pg-white);
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bk-channels-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Channel categories */
.bk-category {
  padding: 18px 10px 4px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bk-category-name {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 1.2px;
}
.bk-category-add {
  padding: 2px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}
.bk-category-add:hover { color: rgba(255,255,255,0.6); }

/* Channel items */
.bk-channel-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}
.bk-channel-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  color: rgba(255,255,255,0.4);
  font-size: 14px;
  font-family: var(--sans);
  font-weight: 500;
}
.bk-channel-item:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.7);
}
.bk-channel-item.active {
  background: rgba(255,255,255,0.08);
  color: var(--pg-white);
}
.bk-channel-icon {
  flex-shrink: 0;
  opacity: 0.5;
}
.bk-channel-item.active .bk-channel-icon { opacity: 0.8; }
.bk-channel-item:hover .bk-channel-icon { opacity: 0.7; }
.bk-channel-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bk-channel-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* User panel at bottom of channel sidebar */
.bk-user-panel {
  height: 54px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0,0,0,0.25);
  border-top: 1px solid rgba(255,255,255,0.04);
  flex-shrink: 0;
}
.bk-user-panel-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.bk-user-panel-info {
  flex: 1;
  min-width: 0;
}
.bk-user-panel-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--pg-white);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bk-user-panel-status {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
}
.bk-user-panel-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* ── Search bar in sidebar ── */
.bk-sidebar-search {
  padding: 10px 10px 6px;
}
.bk-search-wrap {
  position: relative;
}
.bk-search-icon {
  position: absolute;
  left: 10px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.25);
  pointer-events: none;
}
.bk-search {
  width: 100%;
  padding: 7px 10px 7px 32px;
  background: rgba(0,0,0,0.3);
  border: none;
  border-radius: 4px;
  color: var(--pg-white);
  font-size: 12px;
  font-family: var(--sans);
  outline: none;
  transition: background 0.2s;
}
.bk-search::placeholder { color: rgba(255,255,255,0.3); }
.bk-search:focus { background: rgba(0,0,0,0.5); }

/* ── Chat area (center) ── */
.bk-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  background: var(--bg);
}
.bk-chat-hidden-mobile { display: none; }
@media (min-width: 768px) {
  .bk-chat-hidden-mobile { display: flex; }
}

/* Toast */
.bk-toast {
  position: absolute;
  top: 16px; left: 50%; transform: translateX(-50%);
  z-index: 40;
  background: var(--teal); color: var(--bg);
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px; font-weight: 600;
  font-family: var(--sans);
  box-shadow: 0 8px 32px rgba(78,205,196,0.3);
  animation: bk-fade-in-out 2s ease-in-out forwards;
}

/* Chat header */
.bk-chat-header {
  height: 52px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: rgba(255,255,255,0.02);
}
.bk-chat-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.bk-back-btn {
  display: none;
  width: 32px; height: 32px;
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
  border: none; color: rgba(255,255,255,0.6);
  align-items: center; justify-content: center;
  cursor: pointer; margin-right: 4px;
  transition: background 0.2s;
}
.bk-back-btn:hover { background: rgba(255,255,255,0.1); }
@media (max-width: 767px) {
  .bk-back-btn { display: flex; }
}
.bk-chat-channel-icon {
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
}
.bk-chat-name {
  font-weight: 600;
  font-size: 15px;
  font-family: var(--sans);
  color: var(--pg-white);
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bk-chat-divider-bar {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,0.1);
  margin: 0 8px;
  flex-shrink: 0;
}
.bk-chat-topic {
  font-size: 13px;
  color: rgba(255,255,255,0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bk-chat-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  position: relative;
}
.bk-icon-btn {
  padding: 8px;
  color: rgba(255,255,255,0.35);
  background: none; border: none; border-radius: 6px;
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.bk-icon-btn:hover {
  color: var(--pg-white);
  background: rgba(255,255,255,0.05);
}

/* Chat menu dropdown */
.bk-chat-menu-wrap { position: relative; }
.bk-chat-menu {
  position: absolute;
  right: 0; top: 100%; margin-top: 4px;
  background: #111318;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  z-index: 50;
  overflow: hidden;
  min-width: 180px;
}
.bk-chat-menu-item {
  width: 100%; padding: 8px 14px;
  text-align: left; font-size: 13px;
  color: rgba(255,255,255,0.7);
  background: none; border: none;
  cursor: pointer; transition: all 0.15s;
  font-family: var(--sans);
  display: block;
}
.bk-chat-menu-item:hover {
  background: rgba(78,205,196,0.1);
  color: var(--teal);
}
.bk-chat-menu-item + .bk-chat-menu-item {
  border-top: 1px solid rgba(255,255,255,0.04);
}

/* ── Messages area — Discord style ── */
.bk-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
}
.bk-messages-empty {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
}
.bk-messages-empty-inner {
  text-align: center;
}
.bk-messages-empty-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: rgba(78,205,196,0.1);
  margin: 0 auto 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--teal);
}
.bk-messages-empty-text {
  font-size: 14px; color: rgba(255,255,255,0.4);
}

/* Discord-style message row */
.bk-msg-row {
  display: flex;
  padding: 2px 16px;
  transition: background 0.1s;
  position: relative;
}
.bk-msg-row:hover {
  background: rgba(255,255,255,0.02);
}
.bk-msg-row.bk-msg-grouped {
  padding-top: 0;
}

.bk-msg-avatar-col {
  width: 40px;
  flex-shrink: 0;
  margin-right: 16px;
  padding-top: 2px;
}
.bk-msg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.2s;
}
.bk-msg-avatar:hover { opacity: 0.8; }

/* Spacer for grouped messages (no avatar) */
.bk-msg-avatar-spacer {
  width: 40px;
  flex-shrink: 0;
  margin-right: 16px;
}
.bk-msg-hover-time {
  display: none;
  font-size: 10px;
  color: rgba(255,255,255,0.2);
  width: 40px;
  text-align: center;
  padding-top: 4px;
  flex-shrink: 0;
  margin-right: 16px;
  user-select: none;
}
.bk-msg-row:hover .bk-msg-hover-time { display: block; }
.bk-msg-row:hover .bk-msg-avatar-spacer { display: none; }

.bk-msg-content-col {
  flex: 1;
  min-width: 0;
}
.bk-msg-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}
.bk-msg-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--teal);
  cursor: pointer;
  transition: text-decoration 0.1s;
}
.bk-msg-author:hover { text-decoration: underline; }
.bk-msg-author.me { color: #7dd3b0; }
.bk-msg-timestamp {
  font-size: 11px;
  color: rgba(255,255,255,0.2);
}
.bk-msg-text {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  line-height: 1.45;
  word-break: break-word;
}

/* Date separator */
.bk-date-sep {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  margin: 8px 0;
}
.bk-date-sep-line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.06);
}
.bk-date-sep-text {
  padding: 0 12px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.3);
}

/* File attachments */
.bk-file-image {
  max-width: 350px;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: block;
  margin-top: 4px;
}
.bk-file-image:hover { opacity: 0.85; }
.bk-file-pdf {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.06);
  padding: 10px 14px; border-radius: 8px;
  transition: background 0.2s;
  color: inherit; text-decoration: none;
  margin-top: 4px;
  border: 1px solid rgba(255,255,255,0.08);
}
.bk-file-pdf:hover { background: rgba(255,255,255,0.1); }
.bk-file-pdf-icon { font-size: 20px; }
.bk-file-pdf-name {
  font-size: 13px; font-weight: 500;
  max-width: 200px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.bk-file-generic {
  display: inline-flex; align-items: center; gap: 4px;
  color: var(--teal); font-size: 13px;
  text-decoration: none;
}
.bk-file-generic:hover { text-decoration: underline; }

/* Reactions */
.bk-reactions {
  display: flex; gap: 4px; flex-wrap: wrap;
  margin-top: 4px;
}
.bk-reaction-pill {
  display: flex; align-items: center; gap: 3px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.15s;
}
.bk-reaction-pill:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.12); }
.bk-reaction-pill.mine {
  background: rgba(78,205,196,0.15);
  border-color: rgba(78,205,196,0.3);
  color: var(--teal);
}
.bk-reaction-count { font-size: 11px; color: rgba(255,255,255,0.5); }
.bk-reaction-pill.mine .bk-reaction-count { color: var(--teal); }

.bk-reaction-picker {
  display: flex; gap: 4px;
  background: #111318;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.bk-reaction-quick {
  padding: 4px;
  background: none; border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.15s;
}
.bk-reaction-quick:hover { background: rgba(255,255,255,0.08); }

.bk-reaction-add {
  opacity: 0;
  position: absolute;
  right: 16px;
  top: -8px;
  display: flex;
  gap: 2px;
  background: #111318;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.bk-msg-row:hover .bk-reaction-add { opacity: 1; }
.bk-reaction-add-btn {
  padding: 4px 6px;
  background: none; border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
}
.bk-reaction-add-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }

/* ── Message input bar ── */
.bk-input-bar {
  padding: 0 16px 24px;
  flex-shrink: 0;
  position: relative;
}
.bk-input-form {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: border-color 0.2s;
}
.bk-input-form:focus-within {
  border-color: rgba(255,255,255,0.15);
}
.bk-attach-btn {
  padding: 8px 4px;
  color: rgba(255,255,255,0.35);
  background: none; border: none;
  cursor: pointer; transition: color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.bk-attach-btn:hover { color: var(--teal); }
.bk-attach-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.bk-file-input { display: none; }
.bk-msg-input {
  flex: 1;
  background: transparent;
  border: none; outline: none;
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  font-family: var(--sans);
  padding: 12px 0;
}
.bk-msg-input::placeholder { color: rgba(255,255,255,0.3); }
.bk-emoji-btn {
  padding: 8px 4px;
  color: rgba(255,255,255,0.35);
  background: none; border: none;
  cursor: pointer; transition: color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.bk-emoji-btn:hover { color: var(--teal); }
.bk-send-btn {
  padding: 8px 4px;
  background: none;
  color: var(--teal);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.bk-send-btn:hover {
  color: #3dbdb5;
}
.bk-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── Emoji picker ── */
.bk-emoji-picker {
  position: absolute;
  bottom: 60px; right: 16px;
  width: 320px;
  background: #111318;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 40;
  max-height: 320px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
@media (max-width: 767px) {
  .bk-emoji-picker { left: 16px; right: 16px; width: auto; }
}
.bk-emoji-tabs {
  display: flex; gap: 2px;
  padding: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow-x: auto; flex-shrink: 0;
}
.bk-emoji-tab {
  font-size: 18px;
  padding: 5px;
  border-radius: 4px;
  background: none; border: none;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.bk-emoji-tab:hover { background: rgba(255,255,255,0.05); }
.bk-emoji-tab.active {
  background: rgba(78,205,196,0.2);
}
.bk-emoji-grid {
  overflow-y: auto;
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1px;
}
.bk-emoji-cell {
  font-size: 20px;
  padding: 4px;
  border-radius: 4px;
  background: none; border: none;
  cursor: pointer;
  transition: background 0.15s;
  text-align: center;
}
.bk-emoji-cell:hover { background: rgba(255,255,255,0.08); }

/* ── Right sidebar — Members panel ── */
.bk-members {
  width: 240px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 16px 8px;
  background: rgba(255,255,255,0.015);
  border-left: 1px solid rgba(255,255,255,0.06);
  display: none;
}
@media (min-width: 1024px) {
  .bk-members { display: block; }
}
.bk-members-heading {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  padding: 8px 8px 6px;
}
.bk-member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.bk-member-item:hover { background: rgba(255,255,255,0.04); }
.bk-member-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.bk-member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.bk-member-status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2.5px solid var(--bg);
}
.bk-member-status.online { background: #43b581; }
.bk-member-status.idle { background: #faa61a; }
.bk-member-status.offline { background: rgba(255,255,255,0.2); }
.bk-member-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bk-member-item:hover .bk-member-name { color: rgba(255,255,255,0.8); }

/* ── No conversation selected ── */
.bk-no-convo {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
}
.bk-no-convo-inner {
  text-align: center; max-width: 280px;
}
.bk-no-convo-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(78,205,196,0.08);
  margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center;
  color: var(--teal);
}
.bk-no-convo-title {
  color: rgba(255,255,255,0.6);
  font-family: var(--serif);
  font-size: 20px; font-weight: 400;
  margin-bottom: 8px;
}
.bk-no-convo-sub {
  color: rgba(255,255,255,0.3);
  font-size: 13px; margin-bottom: 16px;
}
.bk-no-convo-btn {
  padding: 10px 20px;
  border-radius: 6px;
  background: var(--teal);
  color: var(--bg);
  font-size: 13px; font-weight: 600;
  border: none; cursor: pointer;
  transition: all 0.2s;
  font-family: var(--sans);
}
.bk-no-convo-btn:hover { background: #3dbdb5; box-shadow: 0 4px 16px rgba(78,205,196,0.3); }

/* ── New conversation modal ── */
.bk-modal-overlay {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
}
.bk-modal {
  background: #111318;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  width: 100%; max-width: 420px;
  margin: 0 16px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
}
.bk-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.bk-modal-title {
  color: var(--pg-white); font-weight: 700;
  font-size: 16px; font-family: var(--sans);
}
.bk-modal-close {
  padding: 6px;
  color: rgba(255,255,255,0.4);
  background: none; border: none; border-radius: 6px;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.bk-modal-close:hover {
  color: var(--pg-white);
  background: rgba(255,255,255,0.05);
}
.bk-modal-body { padding: 16px 20px; }
.bk-modal-search-wrap {
  position: relative; margin-bottom: 12px;
}
.bk-modal-search-icon {
  position: absolute;
  left: 12px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.25);
  pointer-events: none;
}
.bk-modal-search {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  padding: 10px 14px 10px 36px;
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  font-family: var(--sans);
  outline: none;
  transition: border-color 0.2s;
}
.bk-modal-search:focus {
  border-color: rgba(78,205,196,0.4);
}
.bk-modal-search::placeholder { color: rgba(255,255,255,0.3); }

.bk-modal-error {
  padding: 10px;
  border-radius: 6px;
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.2);
  color: #fca5a5;
  font-size: 13px; text-align: center;
  margin-bottom: 12px;
}
.bk-modal-results {
  max-height: 256px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 2px;
}
.bk-modal-user {
  width: 100%;
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: transparent;
  border: none;
  cursor: pointer; text-align: left;
  transition: all 0.15s;
  font-family: var(--sans);
}
.bk-modal-user:hover {
  background: rgba(255,255,255,0.05);
}
.bk-modal-user.loading { opacity: 0.5; cursor: wait; }
.bk-modal-user-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.bk-modal-user-name {
  font-size: 14px; font-weight: 500;
  color: rgba(255,255,255,0.7);
}
.bk-modal-hint {
  text-align: center; padding: 32px 0;
  font-size: 12px; color: rgba(255,255,255,0.2);
}
.bk-modal-no-results {
  text-align: center; padding: 32px 0;
  font-size: 13px; color: rgba(255,255,255,0.3);
}

/* ── Loading / Auth states ── */
.bk-center {
  display: flex; align-items: center; justify-content: center;
  height: 100vh;
}
.bk-auth-box {
  text-align: center; max-width: 320px; padding: 0 24px;
}
.bk-auth-icon { color: var(--teal); margin: 0 auto 16px; }
.bk-auth-title {
  font-family: var(--serif);
  font-size: 20px; font-weight: 400;
  color: var(--pg-white);
  margin-bottom: 8px;
}
.bk-auth-sub {
  font-size: 13px; color: rgba(255,255,255,0.5);
  margin-bottom: 16px;
}
.bk-auth-link {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 6px;
  background: var(--teal);
  color: var(--bg);
  font-size: 13px; font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  font-family: var(--sans);
}
.bk-auth-link:hover {
  background: #3dbdb5;
  box-shadow: 0 4px 16px rgba(78,205,196,0.3);
}

/* ── Spinner ── */
.bk-spinner {
  animation: bk-spin 1s linear infinite;
  color: var(--teal);
}
.bk-spinner-dim {
  animation: bk-spin 1s linear infinite;
  color: rgba(255,255,255,0.3);
}

/* ── Scrollbar ── */
.bk-scroll::-webkit-scrollbar { width: 4px; }
.bk-scroll::-webkit-scrollbar-track { background: transparent; }
.bk-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
}
.bk-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.2);
}

/* ── Animations ── */
@keyframes bk-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes bk-fade-in-out {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}

/* ── Mobile bottom channel button ── */
.bk-mobile-channel-btn {
  display: none;
}
@media (max-width: 767px) {
  .bk-mobile-channel-btn {
    display: flex;
    position: fixed;
    bottom: 80px;
    left: 16px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--teal);
    color: var(--bg);
    border: none;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(78,205,196,0.3);
    z-index: 50;
    transition: transform 0.2s;
  }
  .bk-mobile-channel-btn:hover { transform: scale(1.05); }
}
.bk-mobile-close {
  display: none;
}
@media (max-width: 767px) {
  .bk-mobile-close {
    display: flex;
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: none;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    align-items: center;
    justify-content: center;
    z-index: 61;
  }
}
`;

/* ── Component ── */

export default function Beskeder() {
  const { t } = useTranslation();
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const myId = user?.id ?? null;
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Mobile channel sidebar toggle
  const [mobileChannelsOpen, setMobileChannelsOpen] = useState(false);

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

      await supabase.from("message_attachments").insert({
        message_id: tempId,
        file_name: file.name,
        file_type: file.type,
        file_url: publicUrl,
        file_size: file.size,
      });

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
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={fileUrl}
            alt={fileName}
            className="bk-file-image"
            loading="lazy"
          />
        </a>
      );
    }

    if (fileType === "application/pdf") {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bk-file-pdf">
          <span className="bk-file-pdf-icon">📄</span>
          <span className="bk-file-pdf-name">{fileName}</span>
        </a>
      );
    }

    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bk-file-generic">
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

  /* ── Helper: should messages be grouped (same sender, within 5 min) ── */
  const shouldGroup = (msg: MessageRow, prevMsg: MessageRow | null): boolean => {
    if (!prevMsg) return false;
    if (msg.sender_id !== prevMsg.sender_id) return false;
    const diff = new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime();
    return diff < 5 * 60_000;
  };

  /* ── Helper: get display name for a sender ── */
  const getSenderName = (senderId: string): string => {
    if (senderId === myId) return profile?.display_name ?? "Dig";
    return activeConvo?.otherUser.display_name ?? t('beskeder.unknown_user');
  };

  /* ── Loading state ── */
  if (authLoading) {
    return (
      <div className="bk-root">
        <style>{beskederCSS}</style>
        <div className="bk-center">
          <Loader2 size={24} className="bk-spinner" />
        </div>
      </div>
    );
  }

  /* ── Not logged in state ── */
  if (!isLoggedIn) {
    return (
      <div className="bk-root">
        <style>{beskederCSS}</style>
        <div className="bk-center">
          <div className="bk-auth-box">
            <MessageCircle size={48} className="bk-auth-icon" />
            <h2 className="bk-auth-title">{t('beskeder.title')}</h2>
            <p className="bk-auth-sub">{t('beskeder.login_prompt')}</p>
            <Link href="/auth" className="bk-auth-link">
              Log ind
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bk-root" ref={containerRef}>
      <style>{beskederCSS}</style>
      <div className="bk-layout">

        {/* ── Left sidebar — Channel / Conversation list (Discord style) ── */}
        <div className={`bk-channels ${mobileChannelsOpen ? 'bk-channels-open' : ''}`}>
          {/* Mobile close button */}
          <button className="bk-mobile-close" onClick={() => setMobileChannelsOpen(false)}>
            <X size={18} />
          </button>

          {/* Server header */}
          <div className="bk-channels-header">
            <span className="bk-channels-server-name">B-Social Beskeder</span>
            <div className="bk-channels-header-actions">
              <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>

          {/* Search */}
          <div className="bk-sidebar-search">
            <div className="bk-search-wrap">
              <Search className="bk-search-icon" size={12} />
              <input
                type="search"
                placeholder={t('beskeder.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bk-search"
              />
            </div>
          </div>

          {/* Category: Direkte beskeder */}
          <div className="bk-category">
            <span className="bk-category-name">Direkte beskeder</span>
            <button
              className="bk-category-add"
              onClick={() => setShowNewConvo(true)}
              title={t('beskeder.new_conversation')}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Channel (conversation) list */}
          <div className="bk-channel-list bk-scroll">
            {convoLoading ? (
              <div className="bk-center" style={{ padding: '32px 0', height: 'auto' }}>
                <Loader2 size={18} className="bk-spinner-dim" />
              </div>
            ) : filteredConvos.length === 0 ? (
              <div style={{ padding: '24px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
                  {conversations.length === 0
                    ? t('beskeder.no_messages_yet')
                    : t('beskeder.no_results')}
                </p>
                {conversations.length === 0 && (
                  <button
                    onClick={() => setShowNewConvo(true)}
                    style={{
                      fontSize: 12, color: '#4ECDC4', background: 'none',
                      border: 'none', cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    {t('beskeder.start_conversation')}
                  </button>
                )}
              </div>
            ) : (
              filteredConvos.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => {
                    setActiveConvoId(convo.id);
                    setMobileChannelsOpen(false);
                  }}
                  className={`bk-channel-item ${activeConvoId === convo.id ? 'active' : ''}`}
                >
                  <img
                    src={defaultAvatar(convo.otherUser.display_name)}
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <span className="bk-channel-name">
                    {convo.otherUser.display_name ?? t('beskeder.unknown_user')}
                  </span>
                  {convo.unread && <span className="bk-channel-badge">1</span>}
                </button>
              ))
            )}
          </div>

          {/* User panel */}
          <div className="bk-user-panel">
            <img
              src={defaultAvatar(profile?.display_name ?? null)}
              alt=""
              className="bk-user-panel-avatar"
            />
            <div className="bk-user-panel-info">
              <div className="bk-user-panel-name">{profile?.display_name ?? "Bruger"}</div>
              <div className="bk-user-panel-status">Online</div>
            </div>
            <div className="bk-user-panel-actions">
              <button className="bk-icon-btn" title="Indstillinger">
                <Settings size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Chat area (center panel) ── */}
        <div className={`bk-chat ${!activeConvoId ? 'bk-chat-hidden-mobile' : ''}`}>
          {activeConvo ? (
            <>
              {/* Toast notification */}
              {showToast && (
                <div className="bk-toast">{toastMsg}</div>
              )}

              {/* Chat header — Discord style */}
              <div className="bk-chat-header">
                <div className="bk-chat-header-left">
                  <button onClick={() => setActiveConvoId(null)} className="bk-back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <Hash size={18} className="bk-chat-channel-icon" />
                  <h3 className="bk-chat-name">
                    {activeConvo.otherUser.display_name ?? t('beskeder.unknown_user')}
                  </h3>
                </div>
                <div className="bk-chat-header-actions">
                  <button
                    onClick={() => { setIsVideoCall(false); webrtc.startCall(false); }}
                    className="bk-icon-btn"
                    title="Starte opkald"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={() => { setIsVideoCall(true); webrtc.startCall(true); }}
                    className="bk-icon-btn"
                    title="Starte videoopkald"
                  >
                    <Video size={16} />
                  </button>
                  <div className="bk-chat-menu-wrap" ref={chatMenuRef}>
                    <button
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="bk-icon-btn"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {showChatMenu && (
                      <div className="bk-chat-menu">
                        <button onClick={handleDeleteConversation} className="bk-chat-menu-item">
                          Slet samtale
                        </button>
                        <button onClick={handleBlockUser} className="bk-chat-menu-item">
                          Bloker bruger
                        </button>
                        <button
                          onClick={() => { showToastMsg("Rapport sendt"); setShowChatMenu(false); }}
                          className="bk-chat-menu-item"
                        >
                          Rapportér
                        </button>
                        <button
                          onClick={() => { showToastMsg("Notifikationer slået fra"); setShowChatMenu(false); }}
                          className="bk-chat-menu-item"
                        >
                          Slå notifikationer fra
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages — Discord style */}
              <div className="bk-messages bk-scroll">
                {msgsLoading ? (
                  <div className="bk-center" style={{ padding: '48px 0', height: 'auto' }}>
                    <Loader2 size={20} className="bk-spinner-dim" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="bk-messages-empty">
                    <div className="bk-messages-empty-inner">
                      <div className="bk-messages-empty-icon">
                        <Hash size={32} />
                      </div>
                      <h3 style={{ color: 'var(--pg-white)', fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, marginBottom: 8 }}>
                        Velkommen til # {activeConvo.otherUser.display_name ?? "chat"}
                      </h3>
                      <p className="bk-messages-empty-text">{t('beskeder.write_first_message')}</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
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

                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const grouped = shouldGroup(msg, prevMsg);
                    const senderName = getSenderName(msg.sender_id);

                    return (
                      <div key={msg.id} className={`bk-msg-row ${grouped ? 'bk-msg-grouped' : ''}`}>
                        {/* Avatar or spacer */}
                        {grouped ? (
                          <>
                            <span className="bk-msg-avatar-spacer" />
                            <span className="bk-msg-hover-time">{formatMessageTime(msg.created_at)}</span>
                          </>
                        ) : (
                          <div className="bk-msg-avatar-col">
                            <img
                              src={defaultAvatar(senderName)}
                              alt={senderName}
                              className="bk-msg-avatar"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="bk-msg-content-col">
                          {!grouped && (
                            <div className="bk-msg-header">
                              <span className={`bk-msg-author ${isMe ? 'me' : ''}`}>{senderName}</span>
                              <span className="bk-msg-timestamp">{formatFullDate(msg.created_at)}</span>
                            </div>
                          )}
                          {isFileMessage ? (
                            <div>{renderFileAttachment(msg.content)}</div>
                          ) : (
                            <p className="bk-msg-text">{msg.content}</p>
                          )}

                          {/* Reactions */}
                          {reactionGroups.length > 0 && (
                            <div className="bk-reactions">
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
                                    className={`bk-reaction-pill ${userReacted ? 'mine' : ''}`}
                                  >
                                    <span>{group.emoji}</span>
                                    <span className="bk-reaction-count">{group.reactions.length}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Hover action bar */}
                        <div className="bk-reaction-add">
                          <button
                            onClick={() => setReactionPickerMsgId(reactionPickerMsgId === msg.id ? null : msg.id)}
                            className="bk-reaction-add-btn"
                            title="Tilføj reaction"
                          >
                            <Smile size={14} />
                          </button>
                        </div>

                        {/* Reaction picker */}
                        {reactionPickerMsgId === msg.id && (
                          <div ref={reactionPickerRef} className="bk-reaction-picker" style={{ position: 'absolute', right: 16, top: -12, zIndex: 10 }}>
                            {["❤️", "😂", "👍", "😮", "😢", "🔥"].map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                className="bk-reaction-quick"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="bk-input-bar">
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="bk-emoji-picker">
                    <div className="bk-emoji-tabs">
                      {Object.keys(EMOJI_CATEGORIES).map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedEmojiCategory(category as keyof typeof EMOJI_CATEGORIES)}
                          className={`bk-emoji-tab ${selectedEmojiCategory === category ? 'active' : ''}`}
                          title={category}
                        >
                          {CATEGORY_ICONS[category]}
                        </button>
                      ))}
                    </div>
                    <div className="bk-emoji-grid bk-scroll">
                      {EMOJI_CATEGORIES[selectedEmojiCategory].map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleEmojiClick(emoji)}
                          className="bk-emoji-cell"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="bk-input-form"
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bk-attach-btn"
                  >
                    {uploading ? <Loader2 size={16} className="bk-spinner-dim" /> : <Paperclip size={16} />}
                  </button>
                  <input type="file" ref={fileInputRef} className="bk-file-input" accept="image/*,application/pdf,video/mp4,audio/*" onChange={handleFileUpload} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Skriv til ${activeConvo.otherUser.display_name ?? "chat"}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="bk-msg-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="bk-emoji-btn"
                    aria-label="emoji"
                  >
                    <Smile size={16} />
                  </button>
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="bk-send-btn"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="bk-no-convo">
              <div className="bk-no-convo-inner">
                <div className="bk-no-convo-icon">
                  <MessageCircle size={36} />
                </div>
                <h3 className="bk-no-convo-title">{t('beskeder.select_conversation')}</h3>
                <p className="bk-no-convo-sub">
                  {t('beskeder.or_start_new')}
                </p>
                <button
                  onClick={() => setShowNewConvo(true)}
                  className="bk-no-convo-btn"
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

        {/* ── Right sidebar — Members panel ── */}
        <div className="bk-members bk-scroll">
          <h4 className="bk-members-heading">
            Online — {conversations.length}
          </h4>
          {conversations.map(convo => (
            <div
              key={convo.id}
              className="bk-member-item"
              onClick={() => setActiveConvoId(convo.id)}
            >
              <div className="bk-member-avatar-wrap">
                <img
                  src={defaultAvatar(convo.otherUser.display_name)}
                  alt=""
                  className="bk-member-avatar"
                />
                <span className="bk-member-status online" />
              </div>
              <span className="bk-member-name">
                {convo.otherUser.display_name ?? t('beskeder.unknown_user')}
              </span>
            </div>
          ))}
        </div>

        {/* ── Mobile channel sidebar toggle ── */}
        <button
          className="bk-mobile-channel-btn"
          onClick={() => setMobileChannelsOpen(true)}
          title="Samtaler"
        >
          <MessageCircle size={22} />
        </button>

        {/* ── New Conversation Modal ── */}
        {showNewConvo && (
          <div
            className="bk-modal-overlay"
            onKeyDown={(e) => { if (e.key === 'Escape') { setShowNewConvo(false); setUserSearch(''); setUserResults([]); } }}
            tabIndex={-1}
          >
            <div className="bk-modal">
              <div className="bk-modal-header">
                <h2 className="bk-modal-title">{t('beskeder.new_conversation')}</h2>
                <button
                  onClick={() => { setShowNewConvo(false); setUserSearch(""); setUserResults([]); }}
                  className="bk-modal-close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bk-modal-body">
                <div className="bk-modal-search-wrap">
                  <Search className="bk-modal-search-icon" size={14} />
                  <input
                    type="text"
                    placeholder={t('beskeder.search_user_placeholder')}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    autoFocus
                    className="bk-modal-search"
                  />
                </div>

                {convoError && (
                  <div className="bk-modal-error">{convoError}</div>
                )}
                <div className="bk-modal-results bk-scroll">
                  {searchingUsers ? (
                    <div className="bk-center" style={{ padding: '32px 0', height: 'auto' }}>
                      <Loader2 size={18} className="bk-spinner-dim" />
                    </div>
                  ) : userSearch.trim() && userResults.length === 0 ? (
                    <p className="bk-modal-no-results">{t('beskeder.no_users_found')}</p>
                  ) : (
                    userResults.map(u => (
                      <button
                        key={u.user_id}
                        onClick={() => startConversation(u.user_id)}
                        disabled={startingConvo === u.user_id}
                        className={`bk-modal-user ${startingConvo === u.user_id ? 'loading' : ''}`}
                      >
                        {startingConvo === u.user_id ? (
                          <Loader2 size={20} className="bk-spinner" style={{ width: 36, height: 36 }} />
                        ) : (
                          <img
                            src={defaultAvatar(u.display_name)}
                            alt={u.display_name ?? ""}
                            className="bk-modal-user-avatar"
                            loading="lazy"
                          />
                        )}
                        <span className="bk-modal-user-name">
                          {startingConvo === u.user_id ? "Opretter samtale..." : (u.display_name ?? t('beskeder.unknown'))}
                        </span>
                      </button>
                    ))
                  )}
                  {!userSearch.trim() && (
                    <p className="bk-modal-hint">
                      {t('beskeder.type_name_to_search')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
