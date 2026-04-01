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
import { useFadeUp } from "@/lib/useFadeUp";
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
  if (diffDays === 1) return "I g\u00e5r";
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
  SMILEYS: ["\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}", "\u{1F605}", "\u{1F923}", "\u{1F602}", "\u{1F642}", "\u{1F609}", "\u{1F60A}", "\u{1F607}", "\u{1F970}", "\u{1F60D}", "\u{1F929}", "\u{1F618}", "\u{1F617}", "\u{1F61A}", "\u{1F619}", "\u{1F972}", "\u{1F60B}", "\u{1F61B}", "\u{1F61C}", "\u{1F92A}", "\u{1F61D}", "\u{1F911}", "\u{1F917}", "\u{1F92D}", "\u{1F92B}", "\u{1F914}", "\u{1FAE1}", "\u{1F910}", "\u{1F928}", "\u{1F610}", "\u{1F611}", "\u{1F636}", "\u{1FAE5}", "\u{1F60F}", "\u{1F612}", "\u{1F644}", "\u{1F62C}", "\u{1F925}", "\u{1F60C}", "\u{1F614}", "\u{1F62A}", "\u{1F924}", "\u{1F634}", "\u{1F637}", "\u{1F912}", "\u{1F915}", "\u{1F922}", "\u{1F92E}", "\u{1F974}", "\u{1F635}", "\u{1F92F}", "\u{1F920}", "\u{1F973}", "\u{1F978}", "\u{1F60E}", "\u{1F913}", "\u{1F9D0}", "\u{1F615}", "\u{1FAE4}", "\u{1F61F}", "\u{1F641}", "\u{1F62E}", "\u{1F62F}", "\u{1F632}", "\u{1F633}", "\u{1F97A}", "\u{1F979}", "\u{1F626}", "\u{1F627}", "\u{1F628}", "\u{1F630}", "\u{1F625}", "\u{1F622}", "\u{1F62D}", "\u{1F631}", "\u{1F616}", "\u{1F623}", "\u{1F61E}", "\u{1F613}", "\u{1F629}", "\u{1F62B}", "\u{1F971}", "\u{1F624}", "\u{1F621}", "\u{1F620}", "\u{1F92C}", "\u{1F608}", "\u{1F47F}", "\u{1F480}", "\u2620\uFE0F", "\u{1F4A9}", "\u{1F921}", "\u{1F479}", "\u{1F47A}", "\u{1F47B}", "\u{1F47D}", "\u{1F47E}", "\u{1F916}"],
  HANDS: ["\u{1F44B}", "\u{1F91A}", "\u{1F590}\uFE0F", "\u270B", "\u{1F596}", "\u{1FAF1}", "\u{1FAF2}", "\u{1FAF3}", "\u{1FAF4}", "\u{1F44C}", "\u{1F90C}", "\u{1F90F}", "\u270C\uFE0F", "\u{1F91E}", "\u{1FAF0}", "\u{1F91F}", "\u{1F918}", "\u{1F919}", "\u{1F448}", "\u{1F449}", "\u{1F446}", "\u{1F595}", "\u{1F447}", "\u261D\uFE0F", "\u{1FAF5}", "\u{1F44D}", "\u{1F44E}", "\u270A", "\u{1F44A}", "\u{1F91B}", "\u{1F91C}", "\u{1F44F}", "\u{1F64C}", "\u{1FAF6}", "\u{1F450}", "\u{1F932}", "\u{1F91D}", "\u{1F64F}", "\u270D\uFE0F", "\u{1F485}", "\u{1F933}", "\u{1F4AA}"],
  HEARTS: ["\u2764\uFE0F", "\u{1F9E1}", "\u{1F49B}", "\u{1F49A}", "\u{1F499}", "\u{1F49C}", "\u{1F5A4}", "\u{1F90D}", "\u{1F90E}", "\u{1F494}", "\u2764\uFE0F\u200D\u{1F525}", "\u2764\uFE0F\u200D\u{1FA79}", "\u{1F495}", "\u{1F49E}", "\u{1F493}", "\u{1F497}", "\u{1F496}", "\u{1F498}", "\u{1F49D}"],
  NATURE: ["\u{1F338}", "\u{1F33A}", "\u{1F33B}", "\u{1F339}", "\u{1F337}", "\u{1F33C}", "\u{1F490}", "\u{1F340}", "\u{1F33F}", "\u{1F331}", "\u{1F333}", "\u{1F332}", "\u{1F343}", "\u{1F342}", "\u{1F341}", "\u{1F33E}", "\u{1F335}", "\u{1F38B}", "\u{1F38D}", "\u{1F344}", "\u{1F41A}", "\u{1F30A}", "\u{1F4A7}", "\u{1F525}", "\u2B50", "\u{1F31F}", "\u2728", "\u26A1", "\u2600\uFE0F", "\u{1F319}", "\u{1F308}", "\u2601\uFE0F", "\u{1F324}\uFE0F", "\u{1F325}\uFE0F", "\u{1F326}\uFE0F", "\u2744\uFE0F", "\u{1F4A8}", "\u{1F300}"],
  FOOD: ["\u{1F355}", "\u{1F354}", "\u{1F35F}", "\u{1F32D}", "\u{1F37F}", "\u{1F9C0}", "\u{1F95A}", "\u{1F373}", "\u{1F95E}", "\u{1F9C7}", "\u{1F953}", "\u{1F357}", "\u{1F356}", "\u{1F969}", "\u{1F32E}", "\u{1F32F}", "\u{1FAD4}", "\u{1F959}", "\u{1F9C6}", "\u{1F957}", "\u{1F958}", "\u{1FAD5}", "\u{1F35D}", "\u{1F35C}", "\u{1F35B}", "\u{1F363}", "\u{1F371}", "\u{1F95F}", "\u{1F364}", "\u{1F359}", "\u{1F35A}", "\u{1F358}", "\u{1F365}", "\u{1F96E}", "\u{1F361}", "\u{1F9C1}", "\u{1F370}", "\u{1F382}", "\u{1F36E}", "\u{1F36D}", "\u{1F36C}", "\u{1F36B}", "\u{1F369}", "\u{1F36A}", "\u{1F36F}", "\u{1F37A}", "\u{1F37B}", "\u{1F942}", "\u{1F377}", "\u{1F378}", "\u{1F379}", "\u{1F9C3}", "\u2615", "\u{1F375}", "\u{1F9CB}"],
  ACTIVITIES: ["\u26BD", "\u{1F3C0}", "\u{1F3C8}", "\u26BE", "\u{1F94E}", "\u{1F3BE}", "\u{1F3D0}", "\u{1F3C9}", "\u{1F94F}", "\u{1F3B1}", "\u{1F3D3}", "\u{1F3F8}", "\u{1F945}", "\u26F3", "\u{1F3F9}", "\u{1F3A3}", "\u{1F94A}", "\u{1F94B}", "\u{1F3BF}", "\u26F7\uFE0F", "\u{1F3C2}", "\u{1F3CB}\uFE0F", "\u{1F3AE}", "\u{1F3AF}", "\u{1F3B2}", "\u{1F9E9}", "\u{1F3AD}", "\u{1F3A8}", "\u{1F3AC}", "\u{1F3A4}", "\u{1F3A7}", "\u{1F3BC}", "\u{1F3B5}", "\u{1F3B6}", "\u{1F3B9}", "\u{1F941}", "\u{1F3B7}", "\u{1F3BA}", "\u{1F3B8}", "\u{1FA95}"],
  OBJECTS: ["\u{1F4A1}", "\u{1F526}", "\u{1F4F1}", "\u{1F4BB}", "\u2328\uFE0F", "\u{1F5A5}\uFE0F", "\u{1F5A8}\uFE0F", "\u{1F4F7}", "\u{1F4F9}", "\u{1F3A5}", "\u{1F4DE}", "\u{1F4FA}", "\u{1F4FB}", "\u23F0", "\u231A", "\u{1F4B0}", "\u{1F4B3}", "\u{1F48E}", "\u{1F511}", "\u{1F5DD}\uFE0F", "\u{1F512}", "\u{1F513}", "\u{1F4E6}", "\u{1F4EB}", "\u{1F4EC}", "\u2709\uFE0F", "\u{1F4DD}", "\u{1F4C4}", "\u{1F4CB}", "\u{1F4CC}", "\u{1F4CE}", "\u{1F517}", "\u2702\uFE0F", "\u{1F5D1}\uFE0F", "\u{1F9F2}", "\u{1F527}", "\u{1F528}", "\u2699\uFE0F", "\u{1F9F0}"],
  FLAGS: ["\u{1F1E9}\u{1F1F0}", "\u{1F1E9}\u{1F1EA}", "\u{1F1EC}\u{1F1E7}", "\u{1F1FA}\u{1F1F8}", "\u{1F1EB}\u{1F1F7}", "\u{1F1EA}\u{1F1F8}", "\u{1F1EE}\u{1F1F9}", "\u{1F1F3}\u{1F1F4}", "\u{1F1F8}\u{1F1EA}", "\u{1F1EB}\u{1F1EE}", "\u{1F1F3}\u{1F1F1}", "\u{1F1E7}\u{1F1EA}", "\u{1F1E6}\u{1F1F9}", "\u{1F1E8}\u{1F1ED}", "\u{1F1F5}\u{1F1F9}", "\u{1F1E7}\u{1F1F7}", "\u{1F1EF}\u{1F1F5}", "\u{1F1F0}\u{1F1F7}", "\u{1F1E8}\u{1F1F3}", "\u{1F1EE}\u{1F1F3}", "\u{1F1E6}\u{1F1FA}", "\u{1F3F3}\uFE0F\u200D\u{1F308}"],
};

const CATEGORY_ICONS: Record<string, string> = {
  SMILEYS: "\u{1F600}",
  HANDS: "\u{1F44B}",
  HEARTS: "\u2764\uFE0F",
  NATURE: "\u{1F338}",
  FOOD: "\u{1F355}",
  ACTIVITIES: "\u{1F3AE}",
  OBJECTS: "\u{1F4A1}",
  FLAGS: "\u{1F1E9}\u{1F1F0}",
};

/* ── Scoped CSS ── */

const beskederCSS = `
${pageBase("bk")}

/* ── Layout ── */
.bk-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Conversation list (left panel) ── */
.bk-sidebar {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
}
@media (min-width: 768px) {
  .bk-sidebar { width: 288px; }
}
.bk-sidebar-hidden-mobile {
  display: none;
}
@media (min-width: 768px) {
  .bk-sidebar-hidden-mobile { display: flex; }
}

.bk-sidebar-header {
  padding: 32px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.bk-sidebar-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.bk-sidebar-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 22px;
  letter-spacing: -0.4px;
  color: var(--pg-white);
  line-height: 1.1;
}
.bk-new-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  background: rgba(78,205,196,0.15);
  color: var(--teal);
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.25s;
}
.bk-new-btn:hover { background: rgba(78,205,196,0.25); }

.bk-search-wrap {
  position: relative;
}
.bk-search-icon {
  position: absolute;
  left: 14px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.3);
  z-index: 1;
  pointer-events: none;
}
.bk-search {
  width: 100%;
  padding: 10px 16px 10px 40px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: var(--pg-white);
  font-size: 13px;
  font-family: var(--sans);
  outline: none;
  transition: border-color 0.25s;
}
.bk-search:focus { border-color: rgba(78,205,196,0.4); }
.bk-search::placeholder { color: rgba(255,255,255,0.3); }

.bk-convo-list {
  flex: 1;
  overflow-y: auto;
}

.bk-convo-empty {
  text-align: center;
  padding: 48px 16px;
}
.bk-convo-empty-icon {
  width: 64px; height: 64px;
  border-radius: 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  margin: 0 auto 12px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.2);
}
.bk-convo-empty-text {
  font-size: 13px; color: rgba(255,255,255,0.4);
}
.bk-convo-empty-link {
  font-size: 12px; color: var(--teal); font-weight: 600;
  background: none; border: none; cursor: pointer;
  margin-top: 8px;
}
.bk-convo-empty-link:hover { text-decoration: underline; }

.bk-convo-item {
  width: calc(100% - 16px);
  display: flex; align-items: center; gap: 12px;
  padding: 14px;
  margin: 4px 8px;
  border-radius: 16px;
  backdrop-filter: blur(12px);
  transition: all 0.25s;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  cursor: pointer;
  text-align: left;
}
.bk-convo-item:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.14);
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.bk-convo-item.active {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.16);
  box-shadow: 0 4px 20px rgba(78,205,196,0.1);
}
.bk-convo-avatar {
  width: 44px; height: 44px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}
.bk-convo-info {
  flex: 1; min-width: 0; text-align: left;
}
.bk-convo-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2px;
}
.bk-convo-name {
  font-weight: 700; font-size: 13px;
  color: rgba(255,255,255,0.7);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.bk-convo-time {
  font-size: 11px; color: rgba(255,255,255,0.3);
  margin-left: 8px; flex-shrink: 0;
}
.bk-convo-preview {
  font-size: 12px; color: rgba(255,255,255,0.35);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── Chat area (center) ── */
.bk-chat {
  flex: 1; display: flex; flex-direction: column;
  min-width: 0; position: relative;
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
  border-radius: 12px;
  font-size: 13px; font-weight: 600;
  font-family: var(--sans);
  box-shadow: 0 8px 32px rgba(78,205,196,0.3);
  animation: bk-fade-in-out 2s ease-in-out forwards;
}

/* Chat header */
.bk-chat-header {
  height: 64px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(16px);
}
@media (max-width: 767px) {
  .bk-chat-header { padding: 0 16px; }
}
.bk-chat-header-left {
  display: flex; align-items: center; gap: 12px;
}
.bk-back-btn {
  display: none;
  width: 32px; height: 32px;
  border-radius: 8px;
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
.bk-chat-avatar {
  width: 36px; height: 36px;
  border-radius: 12px;
  object-fit: cover;
}
.bk-chat-name {
  font-weight: 700; font-size: 14px;
  font-family: var(--serif);
  color: var(--pg-white);
  line-height: 1;
}
.bk-chat-header-actions {
  display: flex; align-items: center; gap: 2px;
  position: relative;
}
.bk-icon-btn {
  padding: 8px;
  color: rgba(255,255,255,0.3);
  background: none; border: none; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
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
  background: var(--bg);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  z-index: 50;
  overflow: hidden;
  backdrop-filter: blur(20px);
  min-width: 180px;
}
.bk-chat-menu-item {
  width: 100%; padding: 10px 16px;
  text-align: left; font-size: 13px;
  color: rgba(255,255,255,0.7);
  background: none; border: none;
  cursor: pointer; transition: all 0.2s;
  font-family: var(--sans);
  display: block;
}
.bk-chat-menu-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--pg-white);
}
.bk-chat-menu-item + .bk-chat-menu-item {
  border-top: 1px solid rgba(255,255,255,0.06);
}

/* Messages area */
.bk-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex; flex-direction: column; gap: 12px;
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
  border-radius: 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  margin: 0 auto 12px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.15);
}
.bk-messages-empty-text {
  font-size: 13px; color: rgba(255,255,255,0.3);
}

/* Message bubble */
.bk-msg-row {
  display: flex;
  position: relative;
}
.bk-msg-row.sent { justify-content: flex-end; }
.bk-msg-row.received { justify-content: flex-start; }
.bk-msg-col {
  display: flex; flex-direction: column;
  gap: 4px;
}
.bk-msg-row.sent .bk-msg-col { align-items: flex-end; }
.bk-msg-row.received .bk-msg-col { align-items: flex-start; }

.bk-bubble {
  max-width: 70%;
  border-radius: 18px;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
}
.bk-bubble.sent {
  background: linear-gradient(135deg, #4ECDC4 0%, #3dbdb5 100%);
  color: #0a0f1a;
  border-bottom-right-radius: 6px;
}
.bk-bubble.received {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.9);
  border-bottom-left-radius: 6px;
}
.bk-bubble p { margin-bottom: 4px; }
.bk-bubble-meta {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 4px; font-size: 11px;
}
.bk-bubble.sent .bk-bubble-meta { color: rgba(10,15,26,0.5); }
.bk-bubble.received .bk-bubble-meta { color: rgba(255,255,255,0.3); }

/* File attachments inside bubbles */
.bk-file-image {
  max-width: 280px;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: block;
}
.bk-file-image:hover { opacity: 0.8; }
.bk-file-pdf {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.1);
  padding: 8px 12px; border-radius: 10px;
  transition: background 0.2s;
  color: inherit; text-decoration: none;
}
.bk-file-pdf:hover { background: rgba(255,255,255,0.15); }
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
  padding: 0 8px;
}
.bk-msg-row.sent .bk-reactions { justify-content: flex-end; }
.bk-msg-row.received .bk-reactions { justify-content: flex-start; }
.bk-reaction-pill {
  display: flex; align-items: center; gap: 3px;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 12px;
  background: rgba(255,255,255,0.05);
  border: none; cursor: pointer;
  transition: all 0.2s;
}
.bk-reaction-pill:hover { background: rgba(255,255,255,0.1); }
.bk-reaction-pill.mine {
  background: rgba(78,205,196,0.25);
  color: var(--teal);
}
.bk-reaction-count { font-size: 10px; }

.bk-reaction-picker {
  display: flex; gap: 4px;
  background: rgba(255,255,255,0.05);
  border-radius: 100px;
  padding: 4px;
}
.bk-reaction-quick {
  padding: 4px;
  background: none; border: none;
  border-radius: 100px;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}
.bk-reaction-quick:hover { background: rgba(255,255,255,0.1); }

.bk-reaction-add {
  opacity: 0;
  padding: 2px 6px;
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  background: none; border: none;
  cursor: pointer; transition: all 0.2s;
}
.bk-msg-row:hover .bk-reaction-add { opacity: 1; }
.bk-reaction-add:hover { color: rgba(255,255,255,0.6); }

/* ── Message input bar ── */
.bk-input-bar {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
  position: relative;
}
.bk-input-form {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 8px 12px;
  display: flex; align-items: center; gap: 8px;
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  transition: all 0.25s;
}
.bk-input-form:hover,
.bk-input-form:focus-within {
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.06);
}
.bk-attach-btn {
  padding: 6px;
  color: rgba(255,255,255,0.3);
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
}
.bk-msg-input::placeholder { color: rgba(255,255,255,0.3); }
.bk-emoji-btn {
  padding: 6px;
  color: rgba(255,255,255,0.3);
  background: none; border: none;
  cursor: pointer; transition: color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.bk-emoji-btn:hover { color: var(--teal); }
.bk-send-btn {
  padding: 8px;
  background: var(--teal);
  color: var(--bg);
  border: none; border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  display: flex; align-items: center; justify-content: center;
}
.bk-send-btn:hover {
  background: #3dbdb5;
  box-shadow: 0 4px 16px rgba(78,205,196,0.3);
}
.bk-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Emoji picker ── */
.bk-emoji-picker {
  position: absolute;
  bottom: 80px; left: 16px; right: 16px;
  background: var(--bg);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 18px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.5);
  z-index: 40;
  max-height: 320px;
  display: flex; flex-direction: column;
  backdrop-filter: blur(24px);
  overflow: hidden;
}
.bk-emoji-tabs {
  display: flex; gap: 2px;
  padding: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  overflow-x: auto; flex-shrink: 0;
}
.bk-emoji-tab {
  font-size: 20px;
  padding: 6px;
  border-radius: 8px;
  background: none; border: none;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.bk-emoji-tab:hover { background: rgba(255,255,255,0.05); }
.bk-emoji-tab.active {
  background: rgba(78,205,196,0.25);
}
.bk-emoji-grid {
  overflow-y: auto;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
}
.bk-emoji-cell {
  font-size: 20px;
  padding: 6px;
  border-radius: 8px;
  background: none; border: none;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
}
.bk-emoji-cell:hover { background: rgba(255,255,255,0.1); }

/* ── No conversation selected ── */
.bk-no-convo {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
}
.bk-no-convo-inner {
  text-align: center; max-width: 280px;
}
.bk-no-convo-icon {
  width: 80px; height: 80px;
  border-radius: 24px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.15);
}
.bk-no-convo-title {
  color: rgba(255,255,255,0.5);
  font-family: var(--serif);
  font-size: 18px; font-weight: 400;
  margin-bottom: 8px;
}
.bk-no-convo-sub {
  color: rgba(255,255,255,0.3);
  font-size: 13px; margin-bottom: 16px;
}
.bk-no-convo-btn {
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(78,205,196,0.15);
  color: var(--teal);
  font-size: 13px; font-weight: 600;
  border: none; cursor: pointer;
  transition: background 0.25s;
  font-family: var(--sans);
}
.bk-no-convo-btn:hover { background: rgba(78,205,196,0.25); }

/* ── News sidebar ── */
.bk-news {
  width: 320px;
  padding: 32px 24px;
  overflow-y: auto;
  display: none; flex-direction: column; gap: 24px;
  border-left: 1px solid rgba(255,255,255,0.08);
}
@media (min-width: 1280px) {
  .bk-news { display: flex; }
}
.bk-news-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  padding: 20px;
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}
.bk-news-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.bk-news-header-left {
  display: flex; align-items: center; gap: 8px;
}
.bk-news-header-icon { color: var(--teal); }
.bk-news-header-title {
  font-size: 13px; font-weight: 700; color: var(--pg-white);
}
.bk-news-live {
  font-size: 11px; font-weight: 700;
  color: var(--teal);
  background: rgba(78,205,196,0.15);
  padding: 2px 8px;
  border-radius: 100px;
  border: 1px solid rgba(78,205,196,0.2);
}
.bk-news-skeleton {
  height: 12px;
  background: rgba(255,255,255,0.08);
  border-radius: 6px;
  margin-bottom: 8px;
}
.bk-news-skeleton.short { width: 66%; height: 8px; }
.bk-news-list { display: flex; flex-direction: column; gap: 8px; }
.bk-news-item {
  display: flex; gap: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 8px;
  transition: all 0.25s;
  text-decoration: none;
}
.bk-news-item:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.14);
}
.bk-news-thumb {
  width: 56px; height: 56px;
  border-radius: 8px;
  overflow: hidden; flex-shrink: 0;
}
.bk-news-thumb img {
  width: 100%; height: 100%;
  object-fit: cover; opacity: 0.8;
}
.bk-news-body { flex: 1; min-width: 0; }
.bk-news-title {
  font-size: 12px; font-weight: 500;
  color: rgba(255,255,255,0.8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
  transition: color 0.2s;
}
.bk-news-item:hover .bk-news-title { color: var(--teal); }
.bk-news-meta {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: rgba(255,255,255,0.3);
}
.bk-news-empty {
  font-size: 12px; color: rgba(255,255,255,0.3);
  text-align: center; padding: 16px 0;
}

/* ── New conversation modal ── */
.bk-modal-overlay {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
}
.bk-modal {
  background: var(--bg);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  width: 100%; max-width: 420px;
  margin: 0 16px;
  overflow: hidden;
  backdrop-filter: blur(24px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.bk-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
}
.bk-modal-title {
  color: var(--pg-white); font-weight: 700;
  font-size: 15px; font-family: var(--sans);
}
.bk-modal-close {
  padding: 6px;
  color: rgba(255,255,255,0.4);
  background: none; border: none; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.bk-modal-close:hover {
  color: var(--pg-white);
  background: rgba(255,255,255,0.05);
}
.bk-modal-body { padding: 20px; }
.bk-modal-search-wrap {
  position: relative; margin-bottom: 16px;
}
.bk-modal-search-icon {
  position: absolute;
  left: 12px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.3);
  pointer-events: none;
}
.bk-modal-search {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 12px 16px 12px 36px;
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  font-family: var(--sans);
  outline: none;
  transition: border-color 0.25s;
}
.bk-modal-search:focus {
  border-color: rgba(78,205,196,0.5);
}
.bk-modal-search::placeholder { color: rgba(255,255,255,0.3); }

.bk-modal-error {
  padding: 12px;
  border-radius: 12px;
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.25);
  color: #fca5a5;
  font-size: 13px; text-align: center;
  margin-bottom: 12px;
}
.bk-modal-results {
  max-height: 256px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 4px;
}
.bk-modal-user {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; text-align: left;
  transition: all 0.2s;
  font-family: var(--sans);
}
.bk-modal-user:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.14);
}
.bk-modal-user.loading { opacity: 0.5; cursor: wait; }
.bk-modal-user-avatar {
  width: 40px; height: 40px;
  border-radius: 12px;
  object-fit: cover;
}
.bk-modal-user-name {
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.8);
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
  border-radius: 12px;
  background: var(--teal);
  color: var(--bg);
  font-size: 13px; font-weight: 600;
  text-decoration: none;
  transition: all 0.25s;
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
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
}
.bk-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.25);
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
@keyframes bk-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.bk-pulse { animation: bk-pulse 2s ease-in-out infinite; }
`;

/* ── Component ── */

export default function Beskeder() {
  const { t } = useTranslation();
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const myId = user?.id ?? null;
  const containerRef = useFadeUp("bk");

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
            ? { ...c, lastMessage: `\u{1F4CE} ${file.name}`, lastMessageTime: new Date().toISOString() }
            : c
        )
      );

      showToastMsg("Fil vedh\u00e6ftet");
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
          <span className="bk-file-pdf-icon">{"\u{1F4C4}"}</span>
          <span className="bk-file-pdf-name">{fileName}</span>
        </a>
      );
    }

    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="bk-file-generic">
        {"\u{1F4CE}"} {fileName}
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
          displayMsg = `\u{1F4CE} ${match?.[1] ?? "Fil"}`;
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
      setConvoError("Du er ikke logget ind. Pr\u00f8v at genindl\u00e6se siden.");
      console.error("[Beskeder] myId is null \u2014 user not logged in");
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
        setConvoError("Kunne ikke tilf\u00f8je deltagere: " + insertErr.message);
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
      <div className="bk-layout bk-fade-up">

        {/* ── Conversation list (left panel) ── */}
        <div className={`bk-sidebar ${activeConvoId ? 'bk-sidebar-hidden-mobile' : ''}`}>
          <div className="bk-sidebar-header">
            <div className="bk-sidebar-header-row">
              <div>
                <div className="bk-eyebrow" style={{ marginBottom: 4 }}>
                  <div className="bk-eyebrow-line" />
                  B-Social
                </div>
                <h1 className="bk-sidebar-title">{t('beskeder.title')}</h1>
              </div>
              <button
                onClick={() => setShowNewConvo(true)}
                className="bk-new-btn"
                title={t('beskeder.new_conversation')}
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="bk-search-wrap">
              <Search className="bk-search-icon" size={14} />
              <input
                type="search"
                placeholder={t('beskeder.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bk-search"
              />
            </div>
          </div>

          <div className="bk-convo-list bk-scroll">
            {convoLoading ? (
              <div className="bk-center" style={{ padding: '48px 0' }}>
                <Loader2 size={20} className="bk-spinner-dim" />
              </div>
            ) : filteredConvos.length === 0 ? (
              <div className="bk-convo-empty">
                <div className="bk-convo-empty-icon">
                  <MessageCircle size={32} />
                </div>
                <p className="bk-convo-empty-text">
                  {conversations.length === 0
                    ? t('beskeder.no_messages_yet')
                    : t('beskeder.no_results')}
                </p>
                {conversations.length === 0 && (
                  <button
                    onClick={() => setShowNewConvo(true)}
                    className="bk-convo-empty-link"
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
                  className={`bk-convo-item ${activeConvoId === convo.id ? 'active' : ''}`}
                >
                  <img
                    src={defaultAvatar(convo.otherUser.display_name)}
                    alt={convo.otherUser.display_name ?? ""}
                    className="bk-convo-avatar"
                    loading="lazy"
                  />
                  <div className="bk-convo-info">
                    <div className="bk-convo-top">
                      <span className="bk-convo-name">
                        {convo.otherUser.display_name ?? t('beskeder.unknown_user')}
                      </span>
                      <span className="bk-convo-time">
                        {formatTime(convo.lastMessageTime)}
                      </span>
                    </div>
                    <p className="bk-convo-preview">{convo.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
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

              {/* Chat header */}
              <div className="bk-chat-header">
                <div className="bk-chat-header-left">
                  <button onClick={() => setActiveConvoId(null)} className="bk-back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <img
                    src={defaultAvatar(activeConvo.otherUser.display_name)}
                    alt={activeConvo.otherUser.display_name ?? ""}
                    className="bk-chat-avatar"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="bk-chat-name">
                      {activeConvo.otherUser.display_name ?? t('beskeder.unknown_user')}
                    </h3>
                  </div>
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
                          Rapport\u00e9r
                        </button>
                        <button
                          onClick={() => { showToastMsg("Notifikationer sl\u00e5et fra"); setShowChatMenu(false); }}
                          className="bk-chat-menu-item"
                        >
                          Sl\u00e5 notifikationer fra
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="bk-messages bk-scroll">
                {msgsLoading ? (
                  <div className="bk-center" style={{ padding: '48px 0' }}>
                    <Loader2 size={20} className="bk-spinner-dim" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="bk-messages-empty">
                    <div className="bk-messages-empty-inner">
                      <div className="bk-messages-empty-icon">
                        <MessageCircle size={32} />
                      </div>
                      <p className="bk-messages-empty-text">{t('beskeder.write_first_message')}</p>
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
                      <div key={msg.id} className={`bk-msg-row ${isMe ? 'sent' : 'received'}`}>
                        <div className="bk-msg-col">
                          <div className={`bk-bubble ${isMe ? 'sent' : 'received'}`}>
                            {isFileMessage ? (
                              <div>{renderFileAttachment(msg.content)}</div>
                            ) : (
                              <p>{msg.content}</p>
                            )}
                            <div className="bk-bubble-meta">
                              {formatMessageTime(msg.created_at)}
                              {isMe && <CheckCheck size={10} />}
                            </div>
                          </div>

                          {/* Reactions display */}
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
                              {reactionPickerMsgId === msg.id && (
                                <div ref={reactionPickerRef} className="bk-reaction-picker">
                                  {["\u2764\uFE0F", "\u{1F602}", "\u{1F44D}", "\u{1F62E}", "\u{1F622}", "\u{1F525}"].map(emoji => (
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
                          )}

                          {/* Reaction picker button (on hover) */}
                          {reactionPickerMsgId !== msg.id && (
                            <button
                              onClick={() => setReactionPickerMsgId(msg.id)}
                              className="bk-reaction-add"
                              title="Tilf\u00f8j reaction"
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
              <div className="bk-input-bar">
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="bk-emoji-picker">
                    {/* Category tabs */}
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
                    {/* Emoji grid */}
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
                    placeholder={t('beskeder.message_placeholder')}
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
                  <MessageCircle size={48} />
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

        {/* ── Right Column - News Sidebar ── */}
        <div className="bk-news bk-scroll">
          <div className="bk-news-card">
            <div className="bk-news-header">
              <div className="bk-news-header-left">
                <Newspaper size={16} className="bk-news-header-icon" />
                <h3 className="bk-news-header-title">{t('beskeder.latest_news')}</h3>
              </div>
              <span className="bk-news-live">LIVE</span>
            </div>
            {newsLoading ? (
              <div>
                {[1,2,3].map(i => (
                  <div key={i} className="bk-pulse">
                    <div className="bk-news-skeleton" />
                    <div className="bk-news-skeleton short" />
                  </div>
                ))}
              </div>
            ) : allNews.length > 0 ? (
              <div className="bk-news-list">
                {allNews.slice(0, 6).map(news => (
                  <a
                    key={news.link}
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bk-news-item"
                  >
                    {news.image && (
                      <div className="bk-news-thumb">
                        <img src={news.image} alt="" loading="lazy" />
                      </div>
                    )}
                    <div className="bk-news-body">
                      <p className="bk-news-title">{news.title}</p>
                      <div className="bk-news-meta">
                        <span>{news.sourceEmoji} {news.source}</span>
                        <span>{"\u2022"}</span>
                        <span>{formatNewsTime(news.pubDate)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="bk-news-empty">{t('beskeder.no_news')}</p>
            )}
          </div>
        </div>

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
                    <div className="bk-center" style={{ padding: '32px 0' }}>
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
                          <Loader2 size={20} className="bk-spinner" style={{ width: 40, height: 40 }} />
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
