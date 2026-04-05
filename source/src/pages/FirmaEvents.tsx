import FirmaLayout from "@/components/FirmaLayout";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  CalendarPlus,
  MapPin,
  Clock,
  Tag,
  Image,
  Megaphone,
  Edit,
  Trash2,
  Eye,
  Filter,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  List,
  Upload,
  Loader2,
} from "lucide-react";

type EventStatus = "draft" | "aktiv" | "afsluttet" | "promoted";

interface FirmaEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  status: EventStatus;
  tags: string[];
  views: number;
  signups: number;
  maxSignups: number;
  description: string;
  image?: string;
}

const MOCK_EVENTS: FirmaEvent[] = [
  { id: 1, title: "Sommertræning i parken", date: "2026-04-15", location: "Aalborg, Kildeparken", status: "aktiv", tags: ["Fitness", "Outdoor"], views: 2340, signups: 45, maxSignups: 60, description: "Kom og vær med til sommertræning i Kildeparken. Vi træner styrke og cardio i det fri.", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300" },
  { id: 2, title: "MTB tur - Rebild", date: "2026-04-20", location: "Rebild Bakker", status: "aktiv", tags: ["Cykling", "MTB", "Natur"], views: 1890, signups: 28, maxSignups: 40, description: "Mountain bike tur gennem Rebild Bakker. Alle niveauer velkomne.", image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=300" },
  { id: 3, title: "Yoga på stranden", date: "2026-05-01", location: "Blokhus Strand", status: "draft", tags: ["Yoga", "Wellness"], views: 0, signups: 0, maxSignups: 30, description: "Morgenyoga på Blokhus Strand med professionel instruktør." },
  { id: 4, title: "Løbeklub opstart", date: "2026-03-01", location: "Aalborg Storcenter", status: "afsluttet", tags: ["Løb"], views: 4210, signups: 67, maxSignups: 80, description: "Opstart af ny løbeklub i Aalborg. Ugentlige løbeture for alle niveauer." },
  { id: 5, title: "Paddle Tennis turnering", date: "2026-04-28", location: "Aalborg Padel", status: "promoted", tags: ["Padel", "Turnering"], views: 3100, signups: 32, maxSignups: 48, description: "Stor padel-turnering med præmier. Tilmelding i par." },
];

/* ── Scoped CSS ── */
const firmaEventsCSS = `
${pageBase("fe")}

/* ── Page layout ── */
.fe-page { padding: 0; }
.fe-content { display: flex; flex-direction: column; gap: 28px; }

/* ── Header row ── */
.fe-header {
  display: flex; flex-wrap: wrap; align-items: center;
  justify-content: space-between; gap: 16px;
}
.fe-header-left { display: flex; flex-direction: column; gap: 4px; }
.fe-title {
  font-family: var(--serif); font-weight: 400;
  font-size: 28px; letter-spacing: -0.5px;
  color: var(--pg-white);
}
.fe-subtitle { font-size: 14px; color: var(--pg-white-muted); margin-top: 2px; }
.fe-header-actions { display: flex; align-items: center; gap: 10px; }

/* ── View toggle ── */
.fe-view-toggle {
  display: flex; border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
}
.fe-view-btn {
  padding: 9px 12px; background: transparent; border: none;
  color: var(--pg-white-muted); cursor: pointer;
  transition: all 0.25s; display: flex; align-items: center;
}
.fe-view-btn.active {
  background: rgba(78,205,196,0.12); color: var(--teal);
}
.fe-view-btn:hover:not(.active) { color: var(--pg-white); }

/* ── Create button ── */
.fe-create-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 24px; background: var(--teal); color: var(--bg);
  border: none; border-radius: 100px; font-size: 14px;
  font-weight: 600; cursor: pointer; font-family: var(--sans);
  transition: all 0.3s;
}
.fe-create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--teal-glow);
}

/* ── Create form ── */
.fe-form {
  background: var(--glass-bg); backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 28px;
}
.fe-form-title {
  font-family: var(--serif); font-size: 22px; font-weight: 400;
  color: var(--pg-white); margin-bottom: 20px;
}
.fe-form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
  align-items: start;
}
.fe-form-full { grid-column: 1 / -1; }
.fe-form-label {
  display: block; font-size: 11px; font-weight: 500;
  color: var(--teal); text-transform: uppercase;
  letter-spacing: 1.5px; margin-bottom: 6px;
}
.fe-form-actions { display: flex; gap: 12px; margin-top: 24px; }
.fe-btn-publish {
  padding: 10px 24px; background: #10b981; color: #fff;
  border: none; border-radius: 100px; font-size: 13px;
  font-weight: 600; cursor: pointer; font-family: var(--sans);
  transition: all 0.25s;
}
.fe-btn-publish:hover { box-shadow: 0 4px 16px rgba(16,185,129,0.35); }
.fe-btn-cancel {
  padding: 10px 24px; background: transparent; border: none;
  color: var(--pg-white-muted); font-size: 13px; cursor: pointer;
  font-family: var(--sans); transition: color 0.25s;
}
.fe-btn-cancel:hover { color: var(--pg-white); }

/* ── Filters ── */
.fe-filters {
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
}
.fe-search-wrap {
  position: relative; flex: 1; min-width: 220px;
}
.fe-search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: var(--pg-white-muted); pointer-events: none;
}
.fe-search-input {
  width: 100%; padding: 12px 18px 12px 42px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; color: var(--pg-white); font-size: 14px;
  font-family: var(--sans); outline: none; transition: border-color 0.25s;
}
.fe-search-input:focus { border-color: rgba(78,205,196,0.4); }
.fe-search-input::placeholder { color: rgba(255,255,255,0.3); }
.fe-filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.fe-pill {
  padding: 8px 18px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 100px;
  font-size: 12px; font-weight: 500; color: var(--pg-white-muted);
  cursor: pointer; transition: all 0.25s; font-family: var(--sans);
  text-transform: capitalize;
}
.fe-pill:hover { background: rgba(255,255,255,0.08); color: var(--pg-white-dim); }
.fe-pill.active {
  background: rgba(78,205,196,0.12); color: var(--teal);
  border-color: rgba(78,205,196,0.25); font-weight: 600;
}

/* ── Calendar ── */
.fe-calendar {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 24px;
}
.fe-cal-title {
  font-family: var(--serif); font-size: 20px; font-weight: 400;
  color: var(--pg-white); margin-bottom: 16px;
}
.fe-cal-grid {
  display: grid; grid-template-columns: repeat(7,1fr); gap: 4px;
  text-align: center;
}
.fe-cal-head {
  font-size: 11px; color: var(--pg-white-muted); padding: 6px 0;
  text-transform: uppercase; letter-spacing: 1px; font-weight: 500;
}
.fe-cal-day {
  padding: 10px 0; border-radius: 10px; font-size: 14px;
  color: var(--pg-white-dim); transition: background 0.2s;
  position: relative; cursor: default;
}
.fe-cal-day:hover { background: rgba(255,255,255,0.04); }
.fe-cal-day.has-event {
  background: rgba(78,205,196,0.08);
  color: var(--pg-white);
}
.fe-cal-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--teal); margin: 4px auto 0;
}

/* ── Event list card ── */
.fe-list {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  overflow: hidden;
}
.fe-event-row {
  padding: 16px 20px; cursor: pointer;
  transition: background 0.25s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.fe-event-row:last-child { border-bottom: none; }
.fe-event-row:hover { background: rgba(255,255,255,0.03); }
.fe-event-top {
  display: flex; align-items: center; justify-content: space-between;
}
.fe-event-left { display: flex; align-items: center; gap: 14px; }
.fe-event-thumb {
  width: 44px; height: 44px; border-radius: 10px;
  background: rgba(78,205,196,0.08); display: flex;
  align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.fe-event-thumb img {
  width: 100%; height: 100%; object-fit: cover;
}
.fe-event-thumb svg { color: var(--teal); }
.fe-event-info { display: flex; flex-direction: column; gap: 4px; }
.fe-event-name {
  font-size: 15px; font-weight: 500; color: var(--pg-white);
}
.fe-event-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.fe-tag {
  padding: 2px 10px; border-radius: 100px; font-size: 11px;
  background: rgba(255,255,255,0.05); color: var(--pg-white-muted);
  border: 1px solid rgba(255,255,255,0.06);
}
.fe-event-right {
  display: flex; align-items: center; gap: 14px;
}
.fe-event-date {
  font-size: 13px; color: var(--pg-white-muted);
}
.fe-boost-btn {
  padding: 6px; border-radius: 8px; background: transparent;
  border: none; color: var(--pg-white-muted); cursor: pointer;
  transition: all 0.2s;
}
.fe-boost-btn:hover { background: rgba(255,255,255,0.08); color: var(--teal); }
.fe-chevron { color: var(--pg-white-muted); flex-shrink: 0; }

/* ── Status badge ── */
.fe-badge {
  padding: 3px 12px; border-radius: 100px; font-size: 11px;
  font-weight: 500; border: 1px solid; white-space: nowrap;
}
.fe-badge-aktiv { background: rgba(16,185,129,0.1); color: #34d399; border-color: rgba(16,185,129,0.2); }
.fe-badge-draft { background: rgba(234,179,8,0.1); color: #facc15; border-color: rgba(234,179,8,0.2); }
.fe-badge-afsluttet { background: rgba(255,255,255,0.04); color: var(--pg-white-muted); border-color: rgba(255,255,255,0.08); }
.fe-badge-promoted { background: rgba(59,130,246,0.1); color: #60a5fa; border-color: rgba(59,130,246,0.2); }

/* ── Expand panel ── */
.fe-expand {
  padding: 20px 24px; background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(255,255,255,0.04);
  animation: fe-slide-down 0.3s ease;
}
@keyframes fe-slide-down {
  from { opacity: 0; max-height: 0; transform: translateY(-8px); }
  to { opacity: 1; max-height: 400px; transform: translateY(0); }
}
.fe-expand-desc {
  font-size: 14px; color: var(--pg-white-dim); line-height: 1.6;
  margin-bottom: 16px;
}
.fe-progress-wrap { margin-bottom: 16px; }
.fe-progress-header {
  display: flex; justify-content: space-between;
  font-size: 12px; margin-bottom: 6px;
}
.fe-progress-label { color: var(--pg-white-muted); }
.fe-progress-value { color: var(--pg-white); }
.fe-progress-bar {
  height: 6px; border-radius: 100px;
  background: rgba(255,255,255,0.08); overflow: hidden;
}
.fe-progress-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--teal), rgba(78,205,196,0.6));
  transition: width 0.5s cubic-bezier(0.23,1,0.32,1);
}
.fe-expand-meta {
  display: flex; align-items: center; gap: 20px;
  font-size: 12px; color: var(--pg-white-muted);
  margin-bottom: 16px;
}
.fe-expand-meta span { display: flex; align-items: center; gap: 5px; }
.fe-expand-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.fe-action-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: 100px; font-size: 12px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: var(--pg-white-dim); cursor: pointer; font-family: var(--sans);
  transition: all 0.2s;
}
.fe-action-btn:hover { background: rgba(255,255,255,0.08); color: var(--pg-white); }
.fe-action-btn.danger:hover { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.2); }
.fe-confirm-del {
  padding: 7px 16px; border-radius: 100px; font-size: 12px;
  background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.2);
  color: #f87171; cursor: pointer; font-family: var(--sans);
  transition: all 0.2s;
}
.fe-confirm-del:hover { background: rgba(239,68,68,0.2); }

/* ── Boost modal ── */
.fe-overlay {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: fe-fade-in 0.25s ease;
}
@keyframes fe-fade-in { from { opacity: 0; } to { opacity: 1; } }
.fe-modal {
  background: rgba(12,18,28,0.95); backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
  padding: 28px; width: 100%; max-width: 420px; margin: 0 16px;
  animation: fe-modal-up 0.3s cubic-bezier(0.23,1,0.32,1);
}
@keyframes fe-modal-up {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.fe-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px;
}
.fe-modal-title {
  font-family: var(--serif); font-size: 20px; font-weight: 400;
  color: var(--pg-white);
}
.fe-modal-close {
  padding: 6px; border-radius: 8px; background: transparent;
  border: none; color: var(--pg-white-muted); cursor: pointer;
  transition: all 0.2s;
}
.fe-modal-close:hover { background: rgba(255,255,255,0.08); color: var(--pg-white); }
.fe-modal-body { display: flex; flex-direction: column; gap: 20px; }
.fe-modal-label {
  display: block; font-size: 11px; font-weight: 500;
  color: var(--pg-white-muted); text-transform: uppercase;
  letter-spacing: 1.5px; margin-bottom: 8px;
}
.fe-slider {
  width: 100%; accent-color: var(--teal); cursor: pointer;
}
.fe-slider-range {
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--pg-white-muted); margin-top: 4px;
}
.fe-reach {
  font-family: var(--serif); font-size: 32px; font-weight: 400;
  color: var(--teal); line-height: 1;
}
.fe-reach-sub { font-size: 14px; color: var(--pg-white-muted); margin-left: 4px; }
.fe-duration-grid { display: flex; gap: 8px; }
.fe-dur-btn {
  flex: 1; padding: 10px; border-radius: 10px; font-size: 13px;
  font-weight: 500; text-align: center; cursor: pointer;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: var(--pg-white-muted); transition: all 0.25s; font-family: var(--sans);
}
.fe-dur-btn.active {
  background: rgba(78,205,196,0.1); color: var(--teal);
  border-color: rgba(78,205,196,0.3);
}
.fe-dur-btn:hover:not(.active) { border-color: rgba(255,255,255,0.15); color: var(--pg-white-dim); }

/* ── Form inputs ── */
.fe-input {
  width: 100%; padding: 12px 14px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; color: var(--pg-white); font-size: 14px;
  font-family: var(--sans); outline: none; transition: all 0.25s;
}
.fe-input:focus {
  background: rgba(255,255,255,0.08);
  border-color: rgba(78,205,196,0.4);
  box-shadow: 0 0 0 3px rgba(78,205,196,0.1);
}
.fe-input.error {
  border-color: rgba(239,68,68,0.5);
  background: rgba(239,68,68,0.08);
}
.fe-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
}
.fe-input::placeholder { color: rgba(255,255,255,0.3); }

/* ── Select dropdown ── */
.fe-select {
  width: 100%; padding: 12px 14px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; color: var(--pg-white); font-size: 14px;
  font-family: var(--sans); outline: none; transition: all 0.25s;
  appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 12px center;
  background-size: 16px; padding-right: 40px;
}
.fe-select:focus {
  background-color: rgba(255,255,255,0.08);
  border-color: rgba(78,205,196,0.4);
  box-shadow: 0 0 0 3px rgba(78,205,196,0.1);
}
.fe-select.error {
  border-color: rgba(239,68,68,0.5);
  background-color: rgba(239,68,68,0.08);
}
.fe-select option {
  background: #1a1f2e; color: #fff;
}

/* ── Checkbox ── */
.fe-checkbox-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 12px; border-radius: 12px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; transition: all 0.25s;
}
.fe-checkbox-wrap:hover {
  background: rgba(255,255,255,0.06);
}
.fe-checkbox {
  width: 18px; height: 18px; cursor: pointer;
  accent-color: var(--teal);
}
.fe-checkbox-label {
  flex: 1; color: var(--pg-white); font-size: 14px;
  cursor: pointer; user-select: none;
}

/* ── Error message ── */
.fe-error-text {
  font-size: 12px; color: #f87171; margin-top: 4px;
  display: none;
}
.fe-input.error ~ .fe-error-text,
.fe-select.error ~ .fe-error-text {
  display: block;
}

/* ── Form field wrapper ── */
.fe-form-field {
  display: flex; flex-direction: column; gap: 4px;
}

/* ── Image upload ── */
.fe-img-zone {
  position: relative; border-radius: 14px;
  border: 2px dashed rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.03);
  transition: all 0.25s; cursor: pointer; overflow: hidden;
  min-height: 120px; display: flex; align-items: center; justify-content: center;
}
.fe-img-zone:hover {
  border-color: rgba(78,205,196,0.4); background: rgba(78,205,196,0.04);
}
.fe-img-zone-inner {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 20px; text-align: center;
}
.fe-img-zone-inner svg { color: var(--teal); opacity: 0.7; }
.fe-img-zone-text { font-size: 13px; color: var(--pg-white-muted); }
.fe-img-zone-sub { font-size: 11px; color: rgba(255,255,255,0.25); }
.fe-img-zone input[type="file"] {
  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%;
}
.fe-img-preview {
  position: relative; border-radius: 14px; overflow: hidden;
  height: 120px; background: rgba(0,0,0,0.3);
}
.fe-img-preview img {
  width: 100%; height: 100%; object-fit: cover;
}
.fe-img-preview-clear {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.6); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.8); transition: all 0.2s;
}
.fe-img-preview-clear:hover { background: rgba(239,68,68,0.7); }
.fe-img-uploading {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: var(--teal); gap: 6px;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .fe-header { flex-direction: column; align-items: flex-start; }
  .fe-form-grid { grid-template-columns: 1fr; }
  .fe-event-date { display: none; }
  .fe-filters { flex-direction: column; }
  .fe-search-wrap { min-width: 100%; }
  .fe-select { background-size: 14px; padding-right: 36px; }
}
`;

function StatusBadge({ status }: { status: EventStatus }) {
  const { t } = useTranslation();
  const cls = `fe-badge fe-badge-${status}`;
  return (
    <span className={cls}>
      {status === "promoted" ? t('firma.events_status_promoted') : status}
    </span>
  );
}

function BoostModal({ event, onClose }: { event: FirmaEvent; onClose: () => void }) {
  const { t } = useTranslation();
  const [budget, setBudget] = useState(200);
  const [duration, setDuration] = useState(7);
  return (
    <div
      className="fe-overlay"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
      ref={(el: HTMLDivElement | null) => el?.focus()}
    >
      <div className="fe-modal">
        <div className="fe-modal-header">
          <h3 className="fe-modal-title">{t('firma.events_boost_title')}: {event.title}</h3>
          <button onClick={onClose} className="fe-modal-close"><X size={18} /></button>
        </div>
        <div className="fe-modal-body">
          <div>
            <label className="fe-modal-label">{t('firma.events_budget')}: {budget} {t('firma.events_currency')}</label>
            <input
              type="range" min={50} max={500} step={50}
              value={budget} onChange={(e) => setBudget(Number(e.target.value))}
              className="fe-slider"
            />
            <div className="fe-slider-range">
              <span>50 {t('firma.events_currency')}</span>
              <span>500 {t('firma.events_currency')}</span>
            </div>
          </div>
          <div>
            <label className="fe-modal-label">{t('firma.events_estimated_reach')}</label>
            <span className="fe-reach">{(budget * 8).toLocaleString()}</span>
            <span className="fe-reach-sub">{t('firma.events_users')}</span>
          </div>
          <div>
            <label className="fe-modal-label">{t('firma.events_duration')}</label>
            <div className="fe-duration-grid">
              {[3, 7, 14].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`fe-dur-btn${duration === d ? " active" : ""}`}
                >
                  {d} {t('firma.events_days')}
                </button>
              ))}
            </div>
          </div>
          <button className="fe-create-btn" style={{ width: "100%", justifyContent: "center" }}>
            {t('firma.events_start_boost')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FirmaEvents() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const containerRef = useFadeUp("fe");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("alle");
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [boostEvent, setBoostEvent] = useState<FirmaEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    tags: "",
    category: "",
    price: "",
    maxSignups: "",
    isFree: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch user's events from Supabase
  const { data: events = [], refetch: refetchEvents, isLoading } = useQuery({
    queryKey: ["firma-events", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", user.id)
        .order("date", { ascending: false });
      if (error) {
        console.error("Error fetching events:", error);
        return [];
      }
      // Convert Supabase events to FirmaEvent format
      return (data || []).map((e: any) => ({
        id: parseInt(e.id) || Math.random(),
        title: e.title,
        date: e.date,
        location: e.location,
        status: e.status || "draft",
        tags: e.interest_tags || [],
        views: 0, // Not tracked in current schema
        signups: 0, // Would need to query event_rsvps
        maxSignups: e.max_participants || 0,
        description: e.description,
        image: e.image_url,
      }));
    },
    enabled: !!user?.id,
  });

  // Use real events or fallback to mock
  const eventsToDisplay = events.length > 0 ? events : MOCK_EVENTS;

  const filtered = eventsToDisplay.filter((e) => {
    if (filterStatus !== "alle" && e.status !== filterStatus) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreateEvent = async () => {
    if (!user?.id) {
      alert("Du skal være logget ind for at oprette events");
      return;
    }

    // Validation
    const errors: Record<string, boolean> = {};
    if (!formData.title?.trim()) errors.title = true;
    if (!formData.date) errors.date = true;
    if (!formData.location?.trim()) errors.location = true;
    if (!formData.category) errors.category = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert("Udfyld alle obligatoriske felter");
      return;
    }

    try {
      // Upload image if one was selected
      let imageUrl: string | null = null;
      if (imageFile) {
        setImageUploading(true);
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("event-images")
          .upload(path, imageFile, { contentType: imageFile.type, upsert: false });
        setImageUploading(false);
        if (uploadErr) {
          alert("Fejl ved upload af billede: " + uploadErr.message);
          return;
        }
        const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        category: formData.category,
        price: formData.isFree ? 0 : (formData.price ? parseFloat(formData.price) : null),
        max_participants: formData.maxSignups ? parseInt(formData.maxSignups) : null,
        created_by: user.id,
        interest_tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        status: "draft",
        image_url: imageUrl,
      });

      if (!error) {
        // Clear form and refresh
        setFormData({
          title: "",
          date: "",
          location: "",
          description: "",
          tags: "",
          category: "",
          price: "",
          maxSignups: "",
          isFree: false,
        });
        setFormErrors({});
        setImageFile(null);
        setImagePreview("");
        setShowCreate(false);
        refetchEvents();
        alert("Event oprettet!");
      } else {
        alert("Fejl ved oprettelse: " + error.message);
      }
    } catch (e) {
      console.error("Create event error:", e);
      setImageUploading(false);
      alert("Der skete en fejl");
    }
  };

  const handleDeleteEvent = async (eventId: number | string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (!error) {
        refetchEvents();
        setConfirmDelete(null);
        alert("Event slettet!");
      } else {
        alert("Fejl ved sletning: " + error.message);
      }
    } catch (e) {
      console.error("Delete event error:", e);
      alert("Der skete en fejl");
    }
  };

  const now = new Date(2026, 3, 1);
  const daysInMonth = new Date(2026, 4, 0).getDate();
  const firstDay = now.getDay() || 7;

  return (
    <FirmaLayout>
      <style>{firmaEventsCSS}</style>
      <div className="fe-root" ref={containerRef}>
        <div className="fe-content">
          {boostEvent && <BoostModal event={boostEvent} onClose={() => setBoostEvent(null)} />}

          {/* Header */}
          <div className="fe-header fe-fade-up">
            <div className="fe-header-left">
              <div className="fe-eyebrow"><div className="fe-eyebrow-line" />B-Social Firma</div>
              <h1 className="fe-title">{t('firma.events_title')}</h1>
              <p className="fe-subtitle">{t('firma.events_subtitle')}</p>
            </div>
            <div className="fe-header-actions">
              <div className="fe-view-toggle">
                <button
                  onClick={() => setViewMode("list")}
                  className={`fe-view-btn${viewMode === "list" ? " active" : ""}`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`fe-view-btn${viewMode === "calendar" ? " active" : ""}`}
                >
                  <Calendar size={16} />
                </button>
              </div>
              <button onClick={() => setShowCreate(!showCreate)} className="fe-create-btn">
                <Plus size={16} /> {t('firma.events_create')}
              </button>
            </div>
          </div>

          {/* Create event form */}
          {showCreate && (
            <div className="fe-form fe-fade-up fe-d1">
              <h2 className="fe-form-title">{t('firma.events_new')}</h2>
              <div className="fe-form-grid">
                {/* Title - Required, Full width */}
                <div className="fe-form-full fe-form-field">
                  <label className="fe-form-label">{t('firma.events_label_title')} *</label>
                  <input
                    type="text"
                    placeholder={t('firma.events_placeholder_title')}
                    className={`fe-input${formErrors.title ? " error" : ""}`}
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title && e.target.value.trim()) setFormErrors({ ...formErrors, title: false });
                    }}
                  />
                  {formErrors.title && <span className="fe-error-text">Titlen er påkrævet</span>}
                </div>

                {/* Description - Optional, Full width */}
                <div className="fe-form-full fe-form-field">
                  <label className="fe-form-label">{t('firma.events_label_description')}</label>
                  <textarea
                    rows={3}
                    placeholder={t('firma.events_placeholder_description')}
                    className="fe-input"
                    style={{ resize: "none" }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Image upload - Optional, Full width */}
                <div className="fe-form-full fe-form-field">
                  <label className="fe-form-label">
                    <Image size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Billedet til eventet
                  </label>
                  {imagePreview ? (
                    <div className="fe-img-preview">
                      <img src={imagePreview} alt="Preview" />
                      {imageUploading && (
                        <div className="fe-img-uploading">
                          <Loader2 size={14} className="animate-spin" /> Uploader…
                        </div>
                      )}
                      <button
                        type="button"
                        className="fe-img-preview-clear"
                        onClick={() => { setImageFile(null); setImagePreview(""); }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="fe-img-zone">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            alert("Billedet må maks. være 5 MB");
                            return;
                          }
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }}
                      />
                      <div className="fe-img-zone-inner">
                        <Upload size={24} />
                        <span className="fe-img-zone-text">Klik eller træk et billede hertil</span>
                        <span className="fe-img-zone-sub">JPG, PNG, WebP · maks. 5 MB</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date & Time - Required */}
                <div className="fe-form-field">
                  <label className="fe-form-label">{t('firma.events_label_date')} *</label>
                  <input
                    type="datetime-local"
                    className={`fe-input${formErrors.date ? " error" : ""}`}
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (formErrors.date && e.target.value) setFormErrors({ ...formErrors, date: false });
                    }}
                  />
                  {formErrors.date && <span className="fe-error-text">Dato og tid er påkrævet</span>}
                </div>

                {/* Location - Required */}
                <div className="fe-form-field">
                  <label className="fe-form-label">{t('firma.events_label_location')} *</label>
                  <input
                    type="text"
                    placeholder={t('firma.events_placeholder_address')}
                    className={`fe-input${formErrors.location ? " error" : ""}`}
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (formErrors.location && e.target.value.trim()) setFormErrors({ ...formErrors, location: false });
                    }}
                  />
                  {formErrors.location && <span className="fe-error-text">Lokation er påkrævet</span>}
                </div>

                {/* Category - Required */}
                <div className="fe-form-field">
                  <label className="fe-form-label">Kategori *</label>
                  <select
                    className={`fe-select${formErrors.category ? " error" : ""}`}
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (formErrors.category && e.target.value) setFormErrors({ ...formErrors, category: false });
                    }}
                  >
                    <option value="">Vælg kategori...</option>
                    <option value="events">📅 Events</option>
                    <option value="logi">🏨 Overnatning</option>
                    <option value="ture">🥾 Ture</option>
                    <option value="natur">🌿 Natur</option>
                    <option value="aktiv">⚽ Aktiv</option>
                    <option value="mad">🍽️ Mad</option>
                    <option value="kultur">🎭 Kultur</option>
                    <option value="rejser">✈️ Rejser</option>
                    <option value="communities">👥 Communities</option>
                    <option value="wellness">🧘 Wellness</option>
                  </select>
                  {formErrors.category && <span className="fe-error-text">Kategori er påkrævet</span>}
                </div>

                {/* Free Event Toggle */}
                <div className="fe-form-full">
                  <label className="fe-checkbox-wrap">
                    <input
                      type="checkbox"
                      className="fe-checkbox"
                      checked={formData.isFree}
                      onChange={(e) => {
                        setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? "" : formData.price });
                      }}
                    />
                    <span className="fe-checkbox-label">Gratis event</span>
                  </label>
                </div>

                {/* Price - Only shown if not free */}
                {!formData.isFree && (
                  <div className="fe-form-field">
                    <label className="fe-form-label">Pris (DKK)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="fe-input"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                )}

                {/* Max Participants - Optional */}
                <div className="fe-form-field">
                  <label className="fe-form-label">Max deltagere</label>
                  <input
                    type="number"
                    placeholder="Lad være tom for ubegrænset"
                    className="fe-input"
                    min="1"
                    value={formData.maxSignups}
                    onChange={(e) => setFormData({ ...formData, maxSignups: e.target.value })}
                  />
                </div>

                {/* Tags - Optional */}
                <div className="fe-form-full fe-form-field">
                  <label className="fe-form-label">{t('firma.events_label_tags')}</label>
                  <input
                    type="text"
                    placeholder="Adskil med kommaer, f.eks. yoga, udendørs, anfængere"
                    className="fe-input"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>
              <div className="fe-form-actions">
                <button className="fe-btn-publish" onClick={handleCreateEvent}>{t('firma.events_publish')}</button>
                <button onClick={() => { setShowCreate(false); setFormErrors({}); }} className="fe-btn-cancel">{t('firma.events_cancel')}</button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="fe-filters fe-fade-up fe-d1">
            <div className="fe-search-wrap">
              <Search size={16} className="fe-search-icon" />
              <input
                type="text"
                placeholder={t('firma.events_search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="fe-search-input"
              />
            </div>
            <div className="fe-filter-pills">
              {(["alle", "aktiv", "draft", "promoted", "afsluttet"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`fe-pill${filterStatus === s ? " active" : ""}`}
                >
                  {s === "alle" ? t('firma.events_filter_all') : s}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar view */}
          {viewMode === "calendar" && (
            <div className="fe-calendar fe-fade-up fe-d2">
              <h3 className="fe-cal-title">{t('firma.events_calendar_april_2026')}</h3>
              <div className="fe-cal-grid">
                {[t('firma.events_day_mon'), t('firma.events_day_tue'), t('firma.events_day_wed'), t('firma.events_day_thu'), t('firma.events_day_fri'), t('firma.events_day_sat'), t('firma.events_day_sun')].map((d) => (
                  <div key={d} className="fe-cal-head">{d}</div>
                ))}
                {Array.from({ length: firstDay - 1 }).map((_, i) => (<div key={`e${i}`} />))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const eventsOnDay = MOCK_EVENTS.filter((e) => {
                    const d = new Date(e.date);
                    return d.getMonth() === 3 && d.getDate() === day;
                  });
                  return (
                    <div key={day} className={`fe-cal-day${eventsOnDay.length > 0 ? " has-event" : ""}`}>
                      {day}
                      {eventsOnDay.length > 0 && <div className="fe-cal-dot" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events list */}
          {viewMode === "list" && (
            <div className="fe-list fe-fade-up fe-d2">
              {filtered.map((event, idx) => (
                <div key={event.id}>
                  <div
                    className="fe-event-row"
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                  >
                    <div className="fe-event-top">
                      <div className="fe-event-left">
                        <div className="fe-event-thumb">
                          {event.image
                            ? <img src={event.image} alt="" loading="lazy" />
                            : <CalendarPlus size={18} />
                          }
                        </div>
                        <div className="fe-event-info">
                          <span className="fe-event-name">{event.title}</span>
                          <div className="fe-event-tags">
                            {event.tags.map((tag: string) => (
                              <span key={tag} className="fe-tag">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="fe-event-right">
                        <span className="fe-event-date">{event.date}</span>
                        <StatusBadge status={event.status} />
                        <button
                          onClick={(e) => { e.stopPropagation(); setBoostEvent(event); }}
                          className="fe-boost-btn"
                        >
                          <Megaphone size={14} />
                        </button>
                        <span className="fe-chevron">
                          {expandedId === event.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expand panel */}
                  {expandedId === event.id && (
                    <div className="fe-expand">
                      <p className="fe-expand-desc">{event.description}</p>
                      <div className="fe-progress-wrap">
                        <div className="fe-progress-header">
                          <span className="fe-progress-label">{t('firma.events_signups')}</span>
                          <span className="fe-progress-value">{event.signups} / {event.maxSignups}</span>
                        </div>
                        <div className="fe-progress-bar">
                          <div className="fe-progress-fill" style={{ width: `${(event.signups / event.maxSignups) * 100}%` }} />
                        </div>
                      </div>
                      <div className="fe-expand-meta">
                        <span><MapPin size={12} /> {event.location}</span>
                        <span><Eye size={12} /> {event.views.toLocaleString()} {t('firma.events_views')}</span>
                      </div>
                      <div className="fe-expand-actions">
                        <button className="fe-action-btn"><Edit size={12} /> {t('firma.events_edit')}</button>
                        <button className="fe-action-btn"><Copy size={12} /> {t('firma.events_duplicate')}</button>
                        {confirmDelete === event.id ? (
                          <>
                            <button onClick={() => handleDeleteEvent(event.id)} className="fe-confirm-del">{t('firma.events_confirm_delete')}</button>
                            <button onClick={() => setConfirmDelete(null)} className="fe-btn-cancel">{t('firma.events_cancel')}</button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDelete(event.id)} className="fe-action-btn danger">
                            <Trash2 size={12} /> {t('firma.events_delete')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FirmaLayout>
  );
}
