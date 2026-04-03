import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { ArrowLeft, MapPin, Users, Star, ChevronDown, ChevronRight, Search, X, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Event } from "@/lib/data";
import { getEvents } from "@/lib/data";
import { getCategoryEmoji, getEventImage, formatDanishDate } from "@/lib/eventHelpers";

import { useJoin } from "@/context/JoinContext";
import { getCategoryByKey, ALL_CATEGORIES } from "@/data/categories";
import { fetchPlaces, fetchEvents as fetchSupabaseEvents, type Place } from "@/lib/supabase";
import type { TagNode } from "@/lib/tagTree";
import { lazyLoadTagTree, lazyLoadTagFunctions, lazyLoadCategoryFunctions } from "@/lib/lazyDataLoader";
import type { CategoryPlace, CategoryActivity } from "@/data/categoryContent";

import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";

/* ═══════════════════════════════════════════════
   SCOPED CSS
   ═══════════════════════════════════════════════ */
const categoryDetailCSS = `${pageBase("cd")}

/* ── Hero ── */
.cd-hero {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}
.cd-hero-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.cd-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, var(--bg) 0%, rgba(6,10,15,0.55) 40%, rgba(0,0,0,0.2) 100%);
}
.cd-hero-back {
  position: absolute; top: 48px; left: 20px;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10;
  color: rgba(255,255,255,0.7);
  transition: background 0.25s, border-color 0.25s;
}
.cd-hero-back:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}
.cd-hero-content {
  position: absolute; bottom: 16px; left: 20px; right: 20px;
}
.cd-hero-breadcrumb {
  color: rgba(255,255,255,0.5);
  font-size: 11px;
  margin-bottom: 2px;
  font-family: var(--sans);
}
.cd-hero-title {
  font-family: var(--serif);
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 400;
  color: var(--pg-white);
  line-height: 1.15;
}
.cd-hero-title-bold {
  font-family: var(--sans);
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 700;
  color: var(--pg-white);
  line-height: 1.15;
}
.cd-hero-sub-desc {
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  margin-top: 4px;
  font-family: var(--sans);
}
.cd-hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}
.cd-hero-meta-text {
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  font-family: var(--sans);
}

/* ── Active Users ── */
.cd-avatars-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cd-avatars-stack {
  display: flex;
}
.cd-avatars-stack img + img {
  margin-left: -8px;
}
.cd-avatar-img {
  width: 20px; height: 20px;
  border-radius: 50%;
  border: 2px solid var(--bg);
  object-fit: cover;
}
.cd-avatars-text {
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  font-family: var(--sans);
}

/* ── Subcategory chip bar ── */
.cd-chips-bar {
  padding: 0 20px;
  margin-top: 12px;
  margin-bottom: 8px;
}
.cd-chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.cd-chips-scroll::-webkit-scrollbar { display: none; }

/* ── SubChip ── */
.cd-subchip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s;
  font-family: var(--sans);
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255,255,255,0.6);
}
.cd-subchip:hover {
  color: var(--pg-white);
  background: rgba(255,255,255,0.1);
}
.cd-subchip.active {
  background: var(--teal);
  color: var(--bg);
  border-color: var(--teal);
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(78,205,196,0.2);
}
.cd-subchip-count {
  font-size: 11px;
  margin-left: 2px;
}
.cd-subchip.active .cd-subchip-count {
  color: rgba(255,255,255,0.7);
}
.cd-subchip:not(.active) .cd-subchip-count {
  color: rgba(255,255,255,0.3);
}

/* ── Search + price section ── */
.cd-search-section {
  padding: 0 20px;
  margin-top: 8px;
  margin-bottom: 12px;
  position: relative;
}
.cd-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cd-search-wrap {
  position: relative;
  flex: 1;
}
.cd-search-icon {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.3);
}
.cd-search-input {
  width: 100%;
  padding: 10px 32px 10px 36px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--pg-white);
  font-size: 14px;
  font-family: var(--sans);
  outline: none;
  transition: border-color 0.25s, background 0.25s;
}
.cd-search-input:focus {
  border-color: rgba(78,205,196,0.4);
  background: rgba(255,255,255,0.08);
}
.cd-search-input::placeholder {
  color: rgba(255,255,255,0.3);
}
.cd-search-clear {
  position: absolute;
  right: 10px; top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  background: none; border: none; padding: 0;
  transition: color 0.2s;
}
.cd-search-clear:hover {
  color: rgba(255,255,255,0.6);
}

/* ── Price filter buttons ── */
.cd-price-btn {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s;
  font-family: var(--sans);
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5);
}
.cd-price-btn:hover {
  background: rgba(255,255,255,0.1);
}
.cd-price-btn.active-gratis {
  background: var(--teal);
  color: var(--bg);
  border-color: var(--teal);
  box-shadow: 0 4px 20px rgba(78,205,196,0.25);
}
.cd-price-btn.active-premium {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
  box-shadow: 0 4px 20px rgba(245,158,11,0.25);
}

/* ── Autocomplete suggestions dropdown ── */
.cd-suggestions {
  position: absolute;
  left: 20px; right: 20px;
  margin-top: 6px;
  z-index: 20;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
}
.cd-suggestions-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.cd-suggestions-header svg {
  color: var(--teal);
}
.cd-suggestions-label {
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  font-weight: 500;
  font-family: var(--sans);
}
.cd-suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ── Suggestion chip ── */
.cd-suggestion-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.6);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  border: none;
  font-family: var(--sans);
}
.cd-suggestion-chip:hover {
  background: rgba(78,205,196,0.15);
  color: var(--teal);
}

/* ── Filter results bar ── */
.cd-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.cd-filter-count {
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  font-family: var(--sans);
}
.cd-filter-reset {
  color: var(--teal);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: none; border: none; padding: 0;
  font-family: var(--sans);
}

/* ── Content area ── */
.cd-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 8px;
}

/* ── Collapsible Section ── */
.cd-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  margin-bottom: 8px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
}
.cd-section-icon {
  font-size: 14px;
}
.cd-section-title {
  color: var(--pg-white);
  font-weight: 600;
  font-size: 14px;
  font-family: var(--sans);
}
.cd-section-badge {
  padding: 2px 6px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--sans);
}
.cd-section-badge-default {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.4);
}
.cd-section-chevron {
  color: rgba(255,255,255,0.3);
  margin-left: auto;
  transition: transform 0.3s cubic-bezier(0.23,1,0.32,1);
}
.cd-section-chevron.open {
  transform: rotate(180deg);
}

/* ── Grid ── */
.cd-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 20px;
}

/* ── Show-all button ── */
.cd-show-all {
  margin: 8px 20px 0;
}
.cd-show-all-btn {
  width: 100%;
  padding: 8px 0;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
  transition: background 0.2s;
}
.cd-show-all-btn:hover {
  background: rgba(255,255,255,0.1);
}

/* ── Events list ── */
.cd-events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 20px;
}

/* ── CompactCard ── */
.cd-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: background 0.3s, border-color 0.3s, transform 0.3s;
}
.cd-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-2px);
}
.cd-card-img-wrap {
  position: relative;
  height: 112px;
}
.cd-card-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.cd-card-img-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 100%);
}
.cd-card-badge {
  position: absolute;
  top: 8px; right: 8px;
  padding: 2px 6px;
  border-radius: 100px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--sans);
}
.cd-badge-teal { background: rgba(78,205,196,0.8); }
.cd-badge-amber { background: rgba(245,158,11,0.8); }
.cd-card-title-area {
  position: absolute;
  bottom: 8px; left: 10px; right: 10px;
}
.cd-card-title {
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--sans);
}
.cd-card-emoji {
  margin-right: 2px;
}
.cd-card-body {
  padding: 10px 10px 10px;
}
.cd-card-subtitle {
  color: rgba(255,255,255,0.45);
  font-size: 11px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
  font-family: var(--sans);
}
.cd-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.cd-card-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: rgba(255,255,255,0.5);
}
.cd-card-rating svg { color: #fbbf24; }
.cd-card-distance {
  color: rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  gap: 2px;
}
.cd-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}
.cd-card-tag {
  padding: 2px 6px;
  border-radius: 100px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.35);
  font-size: 11px;
  font-family: var(--sans);
}

/* ── SpotsBar ── */
.cd-spots {
  margin-top: 6px;
}
.cd-spots-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}
.cd-spots-left {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--sans);
}
.cd-spots-right {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--sans);
}
.cd-spots-right.teal { color: var(--teal); }
.cd-spots-right.orange { color: #fb923c; }
.cd-spots-track {
  height: 4px;
  border-radius: 100px;
  background: rgba(255,255,255,0.1);
  overflow: hidden;
}
.cd-spots-fill {
  height: 100%;
  border-radius: 100px;
}
.cd-spots-fill.teal { background: var(--teal); }
.cd-spots-fill.orange { background: #fb923c; }

/* ── Join button ── */
.cd-join-btn {
  width: 100%;
  margin-top: 8px;
  padding: 6px 0;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.25s, color 0.25s;
  font-family: var(--sans);
}
.cd-join-btn.join {
  background: rgba(78,205,196,0.15);
  color: var(--teal);
}
.cd-join-btn.join:hover {
  background: rgba(78,205,196,0.25);
}
.cd-join-btn.joined {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
}

/* ── EventMiniCard ── */
.cd-event-card {
  display: flex;
  gap: 10px;
  padding-right: 12px;
  cursor: pointer;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: background 0.25s;
}
.cd-event-card:hover {
  background: rgba(255,255,255,0.08);
}
.cd-event-img-wrap {
  position: relative;
  width: 64px; height: 64px;
  flex-shrink: 0;
  overflow: hidden;
}
.cd-event-img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.cd-event-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 0;
  min-width: 0;
  flex: 1;
}
.cd-event-title {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--sans);
}
.cd-event-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.cd-event-date {
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  font-family: var(--sans);
}
.cd-event-price {
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--sans);
}
.cd-event-price.free {
  background: rgba(78,205,196,0.2);
  color: var(--teal);
}
.cd-event-price.paid {
  background: rgba(245,158,11,0.2);
  color: #fbbf24;
}

/* ── SupabasePlaceCard ── */
.cd-supa-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: background 0.3s, border-color 0.3s, transform 0.3s;
}
.cd-supa-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-2px);
}
.cd-supa-body {
  padding: 12px;
}
.cd-supa-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 4px;
}
.cd-supa-name {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  padding-right: 8px;
  font-family: var(--sans);
}
.cd-supa-free-badge {
  padding: 2px 6px;
  border-radius: 100px;
  background: rgba(78,205,196,0.2);
  color: var(--teal);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  font-family: var(--sans);
}
.cd-supa-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 12px;
}
.cd-supa-rating {
  color: rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  gap: 2px;
}
.cd-supa-rating svg { color: #fbbf24; }
.cd-supa-dot {
  color: rgba(255,255,255,0.25);
}
.cd-supa-city {
  color: rgba(255,255,255,0.35);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.cd-supa-region {
  color: rgba(255,255,255,0.3);
  font-size: 11px;
}
.cd-supa-desc {
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
  line-height: 1.5;
  font-family: var(--sans);
}
.cd-supa-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.cd-supa-tag {
  padding: 2px 6px;
  border-radius: 100px;
  background: rgba(78,205,196,0.08);
  color: rgba(78,205,196,0.6);
  font-size: 8px;
  font-family: var(--sans);
}

/* ── Empty state ── */
.cd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 20px;
  text-align: center;
}
.cd-empty-emoji {
  font-size: 36px;
  margin-bottom: 12px;
}
.cd-empty-text {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  font-family: var(--sans);
}
.cd-empty-sub {
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  margin-top: 4px;
  font-family: var(--sans);
}
.cd-empty-btn {
  margin-top: 12px;
  color: var(--teal);
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .cd-root { padding-bottom: 96px; }
}
`;

/* ═══════════════════════════════════════════════
   SMART SEARCH ENGINE
   Maps category keys to related tag-tree entries
   so "musik" → koncert, jazz, festival, jam etc.
   ═══════════════════════════════════════════════ */

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  // 10 låste kategorier
  events: ["festival", "koncert", "stand-up", "quiz", "loppemarked", "julemarked", "fællesspisning", "netværk", "singles", "frivilligt"],
  logi: ["shelter", "camping", "vandrerhjem", "hytter", "glamping", "bål", "overnatning"],
  ture: ["vandring", "cykling", "mtb", "kajak", "sup", "geocaching", "orienteringsløb", "overlevelse", "bushcraft", "gåtur"],
  natur: ["natur", "skov", "strand", "nationalpark", "fiskeri", "fuglekiggeri", "hundeskov", "dyrespotting", "badning", "svampejagt", "naturlegeplads"],
  aktiv: ["cykling", "løb", "fodbold", "svømning", "fitness", "kampsport", "klatring", "tennis", "dans", "crossfit", "calisthenics", "hiit", "basketball", "golf", "ridning"],
  mad: ["mad", "madlavning", "streetfood", "sushi", "grillaften", "vinsmagning", "ølsmagning", "kaffe", "restaurant", "cafe", "bar", "foodmarket"],
  kultur: ["kunst", "maleri", "galleri", "museum", "teater", "stand-up", "impro", "poesi", "keramik", "koncert", "musik", "fotografering", "film", "kreativt"],
  rejser: ["tog", "samkørsel", "cykelruter", "færge", "roadtrip", "flydeals", "transport", "rejse", "bus", "metro"],
  communities: ["bogklub", "brætspil", "gaming", "sprogcafé", "tech", "startup", "filmaften", "ridning", "rollespil", "kortspil", "esport", "lan-party", "programmering", "hackathon"],
  wellness: ["yoga", "meditation", "sauna", "vinterbadning", "breathwork", "mindfulness", "wellness"],
  // Legacy aliases for backward compat
  musik: ["musik", "koncert", "festival", "rock", "pop", "elektronisk", "jazz", "klassisk", "hip-hop", "metal", "akustisk", "kor", "jam-session", "dj", "psytrance", "goa", "goa-trance", "electronic music", "techno", "house", "openair", "rave", "natteliv"],
  natteliv: ["natteliv", "klub", "bar", "dj", "rave", "dance", "techno", "elektronisk", "psytrance", "goa", "electronic", "house", "nightlife", "clubbing"],
  sport: ["cykling", "løb", "fodbold", "svømning", "fitness", "kampsport", "vandsport", "basketball", "tennis", "golf", "klatring", "rulleskøjter", "ridning"],
  spil: ["gaming", "brætspil", "rollespil", "kortspil", "esport", "lan-party"],
  kreativt: ["kunst", "fotografering", "film", "keramik", "strik", "skrivning"],
  fitness: ["fitness", "crossfit", "kampsport", "klatring", "dans", "calisthenics", "hiit"],
  outdoor: ["outdoor", "overlevelse", "geocaching", "rafting", "zip-line", "treetop", "bueskydning"],
  socialt: ["social", "netværk", "hygge", "book-club", "quiz", "filmaften", "picnic", "fællesspisning"],
  karriere: ["tech", "startup", "programmering", "foredrag", "hackathon", "netværk"],
  tech: ["tech", "programmering", "ai", "gaming", "drone", "3d-print", "hackathon"],
};

/** Get all tag-tree tags relevant to a category */
function getCategoryRelatedTags(categoryKey: string, tagTree: any): string[] {
  const base = CATEGORY_TAG_MAP[categoryKey] || [];
  const expanded: string[] = [...base];
  if (!tagTree) return expanded;
  for (const tag of base) {
    const parent = tagTree.find((p: any) => p.tag === tag);
    if (parent?.children) {
      expanded.push(...parent.children.map((c: any) => c.tag));
    }
  }
  return [...new Set(expanded)];
}

/** Smart search suggestions from tag tree within category context */
function getSmartSuggestions(query: string, categoryKey: string, tagTree: any): TagNode[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const relatedTags = getCategoryRelatedTags(categoryKey, tagTree);

  const results: TagNode[] = [];
  const seen = new Set<string>();

  if (!tagTree || !Array.isArray(tagTree)) return [];
  for (const parent of tagTree) {
    // Check parent match
    if (parent.tag.includes(q) || parent.label.toLowerCase().includes(q)) {
      // Only show if relevant to this category
      if (relatedTags.includes(parent.tag) || relatedTags.some(item => parent.children?.some(c => c.tag === item))) {
        if (!seen.has(parent.tag)) {
          results.push({ tag: parent.tag, emoji: parent.emoji, label: parent.label });
          seen.add(parent.tag);
        }
        if (parent.children) {
          for (const child of parent.children) {
            if (!seen.has(child.tag)) {
              results.push(child);
              seen.add(child.tag);
            }
          }
        }
      }
    }
    // Check children
    if (parent.children) {
      for (const child of parent.children) {
        if ((child.tag.includes(q) || child.label.toLowerCase().includes(q)) && !seen.has(child.tag)) {
          if (relatedTags.includes(child.tag) || relatedTags.includes(parent.tag)) {
            if (!seen.has(parent.tag)) {
              results.push({ tag: parent.tag, emoji: parent.emoji, label: parent.label });
              seen.add(parent.tag);
            }
            results.push(child);
            seen.add(child.tag);
          }
        }
      }
    }
  }

  return results.slice(0, 8);
}

/* ═══════════════════════════════════════════════
   COMPACT CARD COMPONENTS
   ═══════════════════════════════════════════════ */

function SpotsBar({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation();
  const remaining = total - current;
  const pct = Math.round((current / total) * 100);
  const almostFull = remaining <= 2;
  const tone = almostFull ? "orange" : "teal";
  return (
    <div className="cd-spots">
      <div className="cd-spots-row">
        <span className="cd-spots-left"><Users size={9} />{current}/{total}</span>
        <span className={`cd-spots-right ${tone}`}>
          {t('category.spots_remaining', { count: remaining })}
        </span>
      </div>
      <div className="cd-spots-track">
        <div className={`cd-spots-fill ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Compact card — used for both steder and aktiviteter in the grid ── */
function CompactCard({
  image, title, subtitle, badge, rating, distance, tags, spots, onJoin, isJoined, emoji
}: {
  image: string; title: string; subtitle: string; badge?: { text: string; color: string };
  rating?: number; distance?: string; tags?: string[];
  spots?: { current: number; total: number }; onJoin?: () => void; isJoined?: boolean; emoji?: string;
}) {
  const { t } = useTranslation();
  const badgeClass = badge?.color.includes("4ECDC4") ? "cd-badge-teal" : "cd-badge-amber";
  return (
    <div className="cd-card">
      <div className="cd-card-img-wrap">
        <img src={image} alt={title} className="cd-card-img" loading="lazy" />
        <div className="cd-card-img-gradient" />
        {badge && (
          <span className={`cd-card-badge ${badgeClass}`}>
            {badge.text}
          </span>
        )}
        <div className="cd-card-title-area">
          <h3 className="cd-card-title">
            {emoji && <span className="cd-card-emoji">{emoji}</span>}{title}
          </h3>
        </div>
      </div>
      <div className="cd-card-body">
        <p className="cd-card-subtitle">{subtitle}</p>
        <div className="cd-card-meta">
          {rating && (
            <span className="cd-card-rating">
              <Star size={9} fill="#fbbf24" /> {rating}
            </span>
          )}
          {distance && (
            <span className="cd-card-distance">
              <MapPin size={8} /> {distance}
            </span>
          )}
        </div>
        {tags && tags.length > 0 && (
          <div className="cd-card-tags">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="cd-card-tag">{tag}</span>
            ))}
          </div>
        )}
        {spots && (
          <SpotsBar current={spots.current + (isJoined ? 1 : 0)} total={spots.total} />
        )}
        {onJoin && (
          <button
            onClick={onJoin}
            className={`cd-join-btn ${isJoined ? "joined" : "join"}`}
          >
            {isJoined ? t('category.unsubscribe') : t('category.join')}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Event mini-card ── */
function EventMiniCard({ event }: { event: Event }) {
  const { t } = useTranslation();
  const isGratis = !event.price || event.price === 0;
  return (
    <Link href={`/event/${event.id}`}>
      <div className="cd-event-card">
        <div className="cd-event-img-wrap">
          <img src={getEventImage(event)} alt={event.title} className="cd-event-img" loading="lazy" />
        </div>
        <div className="cd-event-body">
          <h3 className="cd-event-title">{event.title}</h3>
          <div className="cd-event-meta">
            <span className="cd-event-date">{formatDanishDate(event.date)}</span>
            <span className={`cd-event-price ${isGratis ? "free" : "paid"}`}>
              {isGratis ? t('events.free') : `${event.price} ${t('events.currency')}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Supabase place card (improved) ── */
function SupabasePlaceCard({ place }: { place: Place }) {
  const { t } = useTranslation();
  const isFree = place.smart_tags?.includes("gratis");
  return (
    <Link href={`/sted/sb-${place.id}`} style={{ textDecoration: "none" }}>
    <div className="cd-supa-card">
      <div className="cd-supa-body">
        <div className="cd-supa-header">
          <h3 className="cd-supa-name">{place.name}</h3>
          {isFree && (
            <span className="cd-supa-free-badge">{t('events.free')}</span>
          )}
        </div>
        <div className="cd-supa-meta">
          <span className="cd-supa-rating">
            <Star size={9} fill="#fbbf24" />
            {place.rating_avg?.toFixed(1)}
          </span>
          <span className="cd-supa-dot">&middot;</span>
          <span className="cd-supa-city">
            <MapPin size={8} />{place.city}
          </span>
          {place.region && place.region !== "Nordjylland" && (
            <>
              <span className="cd-supa-dot">&middot;</span>
              <span className="cd-supa-region">{place.region}</span>
            </>
          )}
        </div>
        <p className="cd-supa-desc">{place.description}</p>
        {place.tags && place.tags.length > 0 && (
          <div className="cd-supa-tags">
            {place.tags.slice(0, 3).map(tag => (
              <span key={tag} className="cd-supa-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
    </Link>
  );
}

/* ── Collapsible section ── */
function Section({ title, icon, count, badge, children, defaultOpen = true }: {
  title: string; icon: string; count?: number; badge?: { text: string; color: string };
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const badgeStyle = badge ? {
    background: badge.color.includes("4ECDC4") ? "rgba(78,205,196,0.2)" : badge.color.includes("amber") ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.1)",
    color: badge.color.includes("4ECDC4") ? "#4ECDC4" : badge.color.includes("amber") ? "#fbbf24" : "rgba(255,255,255,0.4)",
  } : undefined;
  return (
    <section className="cd-fade-up">
      <button
        onClick={() => setOpen(!open)}
        className="cd-section-header"
      >
        <span className="cd-section-icon">{icon}</span>
        <h2 className="cd-section-title">{title}</h2>
        {count !== undefined && (
          <span
            className={`cd-section-badge ${!badge ? "cd-section-badge-default" : ""}`}
            style={badgeStyle}
          >
            {badge ? badge.text : count}
          </span>
        )}
        <ChevronDown size={14} className={`cd-section-chevron ${open ? "open" : ""}`} />
      </button>
      {open && children}
    </section>
  );
}

/* ── Subcategory chip ── */
function SubChip({ label, emoji, active, count, onClick }: { label: string; emoji: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`cd-subchip ${active ? "active" : ""}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {count > 0 && <span className="cd-subchip-count">{count}</span>}
    </button>
  );
}

/* ── Active users avatars ── */
const AVATARS = [
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&crop=face",
];

function ActiveUsers({ count }: { count: number }) {
  const { t } = useTranslation();
  return (
    <div className="cd-avatars-wrap">
      <div className="cd-avatars-stack">
        {AVATARS.map((a, i) => (
          <img key={i} src={a} alt="" className="cd-avatar-img" loading="lazy" />
        ))}
      </div>
      <span className="cd-avatars-text">+{count} {t('category.active_users')}</span>
    </div>
  );
}

/* ── Smart suggestion chip (in autocomplete) ── */
function SuggestionChip({ node, onClick }: { node: TagNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cd-suggestion-chip"
    >
      <span>{node.emoji}</span>
      <span>{node.label}</span>
    </button>
  );
}


/* ═══════════════════════════════════════════════
   CATEGORY DETAIL PAGE — Smart Search Redesign
   ═══════════════════════════════════════════════ */
export default function CategoryDetail() {
  const { t } = useTranslation();
  const containerRef = useFadeUp("cd");

  // Lazy load data
  const [tagTree, setTagTree] = useState<any>(null);
  const [categoryFunctions, setCategoryFunctions] = useState<any>(null);

  useEffect(() => {
    // Load both datasets on component mount
    Promise.all([
      lazyLoadTagTree(),
      lazyLoadCategoryFunctions()
    ]).then(([tree, funcs]) => {
      setTagTree(tree);
      setCategoryFunctions(funcs);
    }).catch(err => console.error('Error loading data:', err));
  }, []);


  const [, setLocation] = useLocation();
  const [, params] = useRoute("/kategori/:category");
  const category = params?.category || "";

  const catData = getCategoryByKey(category);
  const label = catData?.label || category;
  const emoji = catData?.emoji || getCategoryEmoji(category);
  const heroImg = catData?.image?.replace("w=400", "w=800");
  const subcats = catData?.subcategories || [];

  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<"alle" | "gratis" | "premium">("alle");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSub(null);
    setSearchQuery("");
    setPriceFilter("alle");
    setShowSuggestions(false);
  }, [category]);
  const { joinEvent, leaveEvent, isJoined } = useJoin();

  /* ── Data sources ── */
  const { data: allJsonEvents } = useQuery<Event[]>({ queryKey: ["events"], queryFn: () => Promise.resolve(getEvents()), staleTime: 2 * 60 * 1000 });
  const { data: supabasePlaces } = useQuery<Place[]>({ queryKey: ["supabase-places-500"], queryFn: () => fetchPlaces({ limit: 500 }), staleTime: 30 * 60 * 1000 });
  const { data: supabaseEvents } = useQuery({ queryKey: ["supabase-events"], queryFn: fetchSupabaseEvents, staleTime: 2 * 60 * 1000 });

  /* ── Smart suggestions from tag tree ── */
  const suggestions = useMemo(() => {
    return getSmartSuggestions(searchQuery, category, tagTree);
  }, [searchQuery, category, tagTree]);

  /* ── Rich content from categoryContent.ts ── */
  const places = useMemo(() => {
    if (!categoryFunctions) return [];
    if (activeSub) return categoryFunctions.getSubcategoryPlaces(category, activeSub);
    return categoryFunctions.getCategoryPlaces(category);
  }, [category, activeSub, categoryFunctions]);

  const activities = useMemo(() => {
    if (!categoryFunctions) return [];
    if (activeSub) return categoryFunctions.getSubcategoryActivities(category, activeSub);
    return categoryFunctions.getCategoryActivities(category);
  }, [category, activeSub, categoryFunctions]);

  /* ── Matching events from events.json ── */
  const matchingEvents = useMemo(() => {
    const evts = allJsonEvents || [];
    const catLower = category.toLowerCase();
    const subLower = activeSub?.toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    return evts.filter(e => {
      const eCat = (e.category || "").toLowerCase();
      const tags = (e.interest_tags || []).map(item => item.toLowerCase());
      const title = (e.title || "").toLowerCase();
      const desc = (e.description || "").toLowerCase();

      // Category match (broad)
      const matchesCat = eCat.includes(catLower) || tags.some(item => item.includes(catLower));

      if (!matchesCat) return false;

      // Search filter
      if (q) {
        const matchesQ = title.includes(q) || desc.includes(q) || tags.some(item => item.includes(q)) || eCat.includes(q);
        if (!matchesQ) return false;
      }

      // Sub filter
      if (subLower) {
        return eCat.includes(subLower) || tags.some(item => item.includes(subLower)) || title.includes(subLower) || desc.includes(subLower);
      }

      return true;
    }).slice(0, 6);
  }, [allJsonEvents, category, activeSub, searchQuery]);

  /* ── SMART Matching Supabase places — tag-tree aware ── */
  const matchingSupabasePlaces = useMemo(() => {
    if (!supabasePlaces) return [];
    const q = searchQuery.toLowerCase().trim();
    const relatedTags = getCategoryRelatedTags(category, tagTree);

    return supabasePlaces.filter(p => {
      const cats = (p.main_categories || []).map(c => c.toLowerCase());
      const tags = (p.tags || []).map(item => item.toLowerCase());
      const smartTags = (p.smart_tags || []).map(item => item.toLowerCase());
      const name = p.name.toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const allText = [...cats, ...tags, ...smartTags, name, desc];

      // Must match category (broad: check main_categories OR if tags overlap with category's related tags)
      const matchesCat = cats.some(c => {
        // Direct category name match
        if (c.includes(category)) return true;
        // Match against the 10 locked category labels
        const catLabel = (catData?.label || "").toLowerCase();
        if (catLabel && c.includes(catLabel)) return true;
        return false;
      }) || tags.some(item => relatedTags.includes(item)) || smartTags.some(item => relatedTags.includes(item));

      if (!matchesCat) return false;

      // Search filter — smart: expand query through tag tree
      if (q) {
        // Direct text match
        const directMatch = allText.some(item => item.includes(q));
        if (directMatch) return true;

        // Tag tree expansion: if user types "jazz", also match "musik", "koncert" etc.
        const tagResults = searchTags(q);
        const expandedTerms = tagResults.map(item => item.tag.toLowerCase());
        return tags.some(item => expandedTerms.includes(item)) || smartTags.some(item => expandedTerms.includes(item));
      }

      // Price filter
      if (priceFilter === "gratis") {
        return smartTags.includes("gratis");
      }
      if (priceFilter === "premium") {
        return !smartTags.includes("gratis");
      }

      return true;
    });
  }, [supabasePlaces, category, searchQuery, priceFilter, catData]);

  /* ── Subcategory info ── */
  const subInfo = activeSub ? SUBCATEGORY_INFO[activeSub] : null;

  /* ── Counts per subcategory ── */
  const subCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of subcats) {
      const p = categoryFunctions?.getSubcategoryPlaces(category, sub.key)?.length || 0;
      const a = categoryFunctions?.getSubcategoryActivities(category, sub.key)?.length || 0;
      counts[sub.key] = p + a;
    }
    return counts;
  }, [category, subcats]);

  /* ── Filter content by search query + price ── */
  const filteredPlaces = useMemo(() => {
    let result = places;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      // Smart search: expand through tag tree
      const tagResults = searchTags(q);
      const expandedTerms = [q, ...tagResults.map(item => item.tag.toLowerCase()), ...tagResults.map(item => item.label.toLowerCase())];

      result = result.filter(p =>
        expandedTerms.some(term =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }
    if (priceFilter === "gratis") result = result.filter(p => p.isFree);
    if (priceFilter === "premium") result = result.filter(p => !p.isFree && p.price && p.price > 0);
    return result;
  }, [places, searchQuery, priceFilter]);

  const filteredActivities = useMemo(() => {
    let result = activities;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const tagResults = searchTags(q);
      const expandedTerms = [q, ...tagResults.map(item => item.tag.toLowerCase()), ...tagResults.map(item => item.label.toLowerCase())];

      result = result.filter(a =>
        expandedTerms.some(term =>
          a.title.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }
    if (priceFilter === "gratis") result = result.filter(a => a.price === 0);
    if (priceFilter === "premium") result = result.filter(a => a.price > 0);
    return result;
  }, [activities, searchQuery, priceFilter]);

  const totalLocalContent = filteredPlaces.length + filteredActivities.length;
  const totalDbContent = matchingSupabasePlaces.length;
  const totalContent = totalLocalContent + totalDbContent;
  const freeActivities = filteredActivities.filter(a => a.price === 0);
  const paidActivities = filteredActivities.filter(a => a.price > 0);

  const hasActiveFilter = searchQuery.trim().length > 0 || priceFilter !== "alle";

  // Apply suggestion
  const applySuggestion = useCallback((tag: TagNode) => {
    setSearchQuery(tag.label);
    setShowSuggestions(false);
    searchRef.current?.blur();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <style>{categoryDetailCSS}</style>
      <div
        ref={containerRef}
        className="cd-root"
        data-testid="category-detail-page"
      >
        {/* ── Compact Hero ── */}
        <div className="cd-hero cd-fade-up">
          <img
            src={subInfo?.heroImage || heroImg || ""}
            alt={label}
            className="cd-hero-img"
            loading="eager"
          />
          <div className="cd-hero-overlay" />
          <button
            onClick={() => activeSub ? setActiveSub(null) : setLocation("/udforsk")}
            className="cd-hero-back"
            data-testid="btn-back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="cd-hero-content">
            {activeSub && subInfo ? (
              <>
                <p className="cd-hero-breadcrumb">{emoji} {label}</p>
                <h1 className="cd-hero-title">{subInfo.emoji} {subInfo.label}</h1>
                <p className="cd-hero-sub-desc">{subInfo.description}</p>
              </>
            ) : (
              <>
                <h1 className="cd-hero-title-bold">{emoji} {label}</h1>
                <div className="cd-hero-meta">
                  <span className="cd-hero-meta-text">{totalContent} {t('category.experiences')}</span>
                  <ActiveUsers count={subcats.length * 15 + 20} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Subcategory Filter Bar (sticky feel) ── */}
        {subcats.length > 0 && (
          <div className="cd-chips-bar cd-fade-up cd-d1">
            <div className="cd-chips-scroll">
              <SubChip
                label={t('category.all')}
                emoji={emoji}
                active={!activeSub}
                count={places.length + activities.length}
                onClick={() => setActiveSub(null)}
              />
              {subcats.map(sub => (
                <SubChip
                  key={sub.key}
                  label={sub.label}
                  emoji={sub.emoji}
                  active={activeSub === sub.key}
                  count={subCounts[sub.key] || 0}
                  onClick={() => setActiveSub(activeSub === sub.key ? null : sub.key)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Smart Search + Gratis / Premium ── */}
        <div className="cd-search-section cd-fade-up cd-d2" data-testid="search-price-section" ref={suggestionsRef}>
          <div className="cd-search-row">
            <div className="cd-search-wrap">
              <Search size={16} className="cd-search-icon" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                placeholder={t('category.search_in', { label })}
                className="cd-search-input"
                data-testid="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                  className="cd-search-clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setPriceFilter(priceFilter === "gratis" ? "alle" : "gratis")}
              className={`cd-price-btn ${priceFilter === "gratis" ? "active-gratis" : ""}`}
              data-testid="btn-gratis"
            >
              {t('events.free')}
            </button>
            <button
              onClick={() => setPriceFilter(priceFilter === "premium" ? "alle" : "premium")}
              className={`cd-price-btn ${priceFilter === "premium" ? "active-premium" : ""}`}
              data-testid="btn-premium"
            >
              {t('category.premium')}
            </button>
          </div>

          {/* ── Smart Autocomplete Suggestions ── */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="cd-suggestions">
              <div className="cd-suggestions-header">
                <Sparkles size={12} />
                <span className="cd-suggestions-label">{t('category.suggestions_in', { label })}</span>
              </div>
              <div className="cd-suggestions-grid">
                {suggestions.map(s => (
                  <SuggestionChip key={s.tag} node={s} onClick={() => applySuggestion(s)} />
                ))}
              </div>
            </div>
          )}

          {hasActiveFilter && (
            <div className="cd-filter-bar">
              <span className="cd-filter-count">{totalContent} {t('category.results')}</span>
              <button
                onClick={() => { setSearchQuery(""); setPriceFilter("alle"); setShowSuggestions(false); }}
                className="cd-filter-reset"
                data-testid="clear-filter-btn"
              >
                {t('category.reset')}
              </button>
            </div>
          )}
        </div>

        {/* ═══ CONTENT — compact grid layout ═══ */}
        <div className="cd-content cd-fade-up cd-d3">

          {/* ── Supabase steder (real data first!) ── */}
          {matchingSupabasePlaces.length > 0 && (
            <Section title={t('category.places_in_denmark')} icon="📍" count={matchingSupabasePlaces.length} badge={{ text: `${matchingSupabasePlaces.length}`, color: "bg-[#4ECDC4]/20 text-[#4ECDC4]" }} defaultOpen={true}>
              <div className="cd-grid">
                {matchingSupabasePlaces.slice(0, 12).map(p => (
                  <SupabasePlaceCard key={p.id} place={p} />
                ))}
              </div>
              {matchingSupabasePlaces.length > 12 && (
                <div className="cd-show-all">
                  <button className="cd-show-all-btn">
                    {t('category.show_all_places', { count: matchingSupabasePlaces.length })}
                  </button>
                </div>
              )}
            </Section>
          )}

          {/* ── Hardcoded steder — 2-column compact grid ── */}
          {filteredPlaces.length > 0 && (
            <Section title={t('category.places')} icon="🏟️" count={filteredPlaces.length} defaultOpen={true}>
              <div className="cd-grid">
                {filteredPlaces.map(p => (
                  <CompactCard
                    key={p.id}
                    image={p.image}
                    title={p.name}
                    subtitle={p.description}
                    badge={p.isFree ? { text: t('events.free'), color: "bg-[#4ECDC4]/80" } : p.price ? { text: `${p.price} ${t('events.currency')}`, color: "bg-amber-500/80" } : undefined}
                    rating={p.rating}
                    distance={p.distance}
                    tags={p.tags}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* ── Gratis aktiviteter — compact grid ── */}
          {freeActivities.length > 0 && (
            <Section title={t('events.free')} icon="🎯" count={freeActivities.length} badge={{ text: `${freeActivities.length}`, color: "bg-[#4ECDC4]/20 text-[#4ECDC4]" }} defaultOpen={true}>
              <div className="cd-grid">
                {freeActivities.map(a => (
                  <CompactCard
                    key={a.id}
                    image={a.image}
                    title={a.title}
                    subtitle={a.description}
                    emoji={a.emoji}
                    badge={{ text: t('events.free'), color: "bg-[#4ECDC4]/80" }}
                    distance={a.distance}
                    spots={a.spots}
                    onJoin={() => isJoined(a.id) ? leaveEvent(a.id) : joinEvent(a.id, a.title)}
                    isJoined={isJoined(a.id)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* ── Betalte oplevelser — compact grid ── */}
          {paidActivities.length > 0 && (
            <Section title={t('category.paid_experiences')} icon="💎" count={paidActivities.length} badge={{ text: `${paidActivities.length}`, color: "bg-amber-500/20 text-amber-400" }} defaultOpen={true}>
              <div className="cd-grid">
                {paidActivities.map(a => (
                  <CompactCard
                    key={a.id}
                    image={a.image}
                    title={a.title}
                    subtitle={a.description}
                    emoji={a.emoji}
                    badge={{ text: `${a.price} ${t('events.currency')}`, color: "bg-amber-500/80" }}
                    distance={a.distance}
                    spots={a.spots}
                    onJoin={() => isJoined(a.id) ? leaveEvent(a.id) : joinEvent(a.id, a.title)}
                    isJoined={isJoined(a.id)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* ── Events from events.json ── */}
          {matchingEvents.length > 0 && (
            <Section title={t('category.upcoming_events')} icon="🎪" count={matchingEvents.length} defaultOpen={matchingEvents.length <= 4}>
              <div className="cd-events-list">
                {matchingEvents.map(e => <EventMiniCard key={e.id} event={e} />)}
              </div>
            </Section>
          )}

          {/* ── Empty state ── */}
          {totalContent === 0 && (
            <div className="cd-empty">
              <span className="cd-empty-emoji">🔍</span>
              <p className="cd-empty-text">
                {hasActiveFilter ? t('category.no_results_with_filters') : t('category.no_experiences_yet')}
              </p>
              <p className="cd-empty-sub">
                {hasActiveFilter ? t('category.try_changing_filters') : t('category.be_first_create_activity')}
              </p>
              {hasActiveFilter ? (
                <button onClick={() => { setSearchQuery(""); setPriceFilter("alle"); }} className="cd-empty-btn">
                  {t('category.reset_filters')}
                </button>
              ) : (
                <button onClick={() => setActiveSub(null)} className="cd-empty-btn">
                  {t('category.show_all_in', { label })}
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
