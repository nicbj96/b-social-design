import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useTags } from "@/context/TagContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { searchTags, getOverkategorier, type TagNode } from "@/lib/tagTree";
import { getOverkategoriForTag } from "@/lib/tagEngine";
import { useFadeUp } from "@/lib/useFadeUp";
import { pageBase } from "@/lib/pageCSSBase";
import { Check, MapPin, Compass, Loader2, Search, X, ChevronDown, Sparkles, SlidersHorizontal, Plus } from "lucide-react";

/* ── Scoped CSS ── */
const onboardingCSS = `
${pageBase("ob")}

/* ── Hero background ── */
.ob-root {
  position: relative;
}
.ob-bg {
  position: fixed; inset: 0; z-index: 0;
  background: url('/onboarding-hero.png') center/cover no-repeat;
}
.ob-bg::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(6,10,15,0.6) 0%, rgba(6,10,15,0.85) 40%, rgba(6,10,15,0.97) 100%);
}

/* ── Layout ── */
.ob-container {
  position: relative; z-index: 1;
  min-height: 100svh; display: flex; flex-direction: column;
}
.ob-progress-area {
  padding: 56px 24px 8px 24px;
}
.ob-progress-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.ob-step-label {
  color: rgba(255,255,255,0.25); font-size: 12px; font-weight: 500;
  font-family: var(--sans);
}

/* ── Progress bar ── */
.ob-progress-track {
  height: 3px; border-radius: 100px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}
.ob-progress-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--teal), #6ee7de);
  transition: width 0.5s cubic-bezier(0.23,1,0.32,1);
  box-shadow: 0 0 12px var(--teal-glow);
}

/* ── Content area ── */
.ob-content {
  flex: 1; padding: 12px 24px 32px 24px;
  display: flex; flex-direction: column; overflow: hidden;
}

/* ── Step header ── */
.ob-step-header { margin-bottom: 20px; }
.ob-icon-box {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(78,205,196,0.08);
  border: 1px solid rgba(78,205,196,0.18);
  margin-bottom: 12px;
  box-shadow: 0 0 20px rgba(78,205,196,0.08);
}
.ob-icon-box svg { color: var(--teal); }
.ob-title {
  font-family: var(--serif); font-weight: 400;
  font-size: 26px; letter-spacing: -0.5px;
  color: var(--pg-white); line-height: 1.15;
}
.ob-subtitle {
  color: rgba(255,255,255,0.4); font-size: 14px;
  margin-top: 6px; font-family: var(--sans);
}

/* ── Search input ── */
.ob-search-wrap {
  position: relative; margin-bottom: 12px;
}
.ob-search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.3); pointer-events: none;
}
.ob-search-input {
  width: 100%; padding: 14px 40px 14px 40px;
  border-radius: 16px; font-size: 14px;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--pg-white); font-family: var(--sans);
  outline: none; transition: border-color 0.3s, box-shadow 0.3s;
}
.ob-search-input:focus {
  border-color: rgba(78,205,196,0.5);
  box-shadow: 0 0 0 3px rgba(78,205,196,0.08);
}
.ob-search-input::placeholder { color: rgba(255,255,255,0.28); }
.ob-search-clear {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(255,255,255,0.3);
  cursor: pointer; padding: 0; transition: color 0.2s;
}
.ob-search-clear:hover { color: rgba(255,255,255,0.6); }

/* ── Tag search (step 2, smaller) ── */
.ob-tag-search-input {
  width: 100%; padding: 10px 32px 10px 36px;
  border-radius: 12px; font-size: 13px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--pg-white); font-family: var(--sans);
  outline: none; transition: border-color 0.3s;
}
.ob-tag-search-input:focus { border-color: rgba(78,205,196,0.4); }
.ob-tag-search-input::placeholder { color: rgba(255,255,255,0.28); }
.ob-tag-search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.3); pointer-events: none;
}
.ob-tag-search-clear {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(255,255,255,0.3);
  cursor: pointer; padding: 0;
}

/* ── City dropdown ── */
.ob-dropdown {
  position: absolute; top: 100%; margin-top: 6px;
  left: 0; right: 0; z-index: 50;
  border-radius: 14px; max-height: 200px; overflow-y: auto;
  background: rgba(18,22,32,0.95);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.ob-dropdown-item {
  width: 100%; text-align: left; padding: 12px 16px;
  font-size: 14px; display: flex; align-items: center; gap: 8px;
  background: none; border: none; color: rgba(255,255,255,0.8);
  cursor: pointer; transition: background 0.15s; font-family: var(--sans);
}
.ob-dropdown-item:hover { background: rgba(255,255,255,0.06); }
.ob-dropdown-item.ob-already-added {
  color: var(--teal); background: rgba(78,205,196,0.08);
}
.ob-dropdown-pin { color: rgba(255,255,255,0.3); flex-shrink: 0; }
.ob-dropdown-name { flex: 1; }
.ob-dropdown-zip { color: rgba(255,255,255,0.3); font-size: 12px; }

/* ── Selected city chips ── */
.ob-selected-cities {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
}
.ob-city-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 100px;
  background: rgba(78,205,196,0.1);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(78,205,196,0.25);
  animation: ob-chip-in 0.25s ease-out;
}
@keyframes ob-chip-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.ob-city-chip svg { color: var(--teal); }
.ob-city-chip-name {
  color: var(--teal); font-size: 13px; font-weight: 500;
  font-family: var(--sans);
}
.ob-city-chip-primary {
  color: rgba(78,205,196,0.4); font-size: 11px; font-family: var(--sans);
}
.ob-city-chip-remove {
  background: none; border: none; padding: 0; margin-left: 2px;
  color: rgba(78,205,196,0.5); cursor: pointer; transition: color 0.2s;
}
.ob-city-chip-remove:hover { color: var(--teal); }

/* ── Popular cities label ── */
.ob-section-label {
  color: rgba(255,255,255,0.3); font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 2px;
  margin-bottom: 12px; font-family: var(--sans);
}

/* ── Popular city grid ── */
.ob-city-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.ob-city-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 14px 8px; border-radius: 16px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; transition: all 0.25s;
  font-family: var(--sans);
}
.ob-city-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.12);
}
.ob-city-card.ob-active {
  background: rgba(78,205,196,0.1);
  border-color: rgba(78,205,196,0.35);
  box-shadow: 0 0 16px rgba(78,205,196,0.08);
}
.ob-city-emoji { font-size: 24px; line-height: 1; }
.ob-city-name {
  font-size: 12px; font-weight: 500;
  color: rgba(255,255,255,0.6);
}
.ob-city-card.ob-active .ob-city-name { color: var(--teal); }

/* ── Spacer ── */
.ob-spacer { flex: 1; }

/* ── Buttons ── */
.ob-btn-primary {
  width: 100%; padding: 16px; border-radius: 16px;
  background: linear-gradient(135deg, var(--teal), #3dbdb5);
  color: var(--bg); font-weight: 600; font-size: 15px;
  border: none; cursor: pointer; font-family: var(--sans);
  transition: all 0.3s; margin-top: 16px;
  box-shadow: 0 4px 24px rgba(78,205,196,0.25);
}
.ob-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(78,205,196,0.35);
}
.ob-btn-primary:active { transform: scale(0.98); }
.ob-btn-primary:disabled {
  opacity: 0.35; cursor: not-allowed; transform: none;
  box-shadow: none;
}
.ob-btn-back {
  padding: 14px 20px; border-radius: 16px;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6); font-weight: 500; font-size: 14px;
  cursor: pointer; font-family: var(--sans); transition: all 0.25s;
}
.ob-btn-back:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.8);
}
.ob-btn-finish {
  width: 100%; padding: 16px; border-radius: 16px;
  background: linear-gradient(135deg, var(--teal), #3dbdb5);
  color: var(--bg); font-weight: 600; font-size: 15px;
  border: none; cursor: pointer; font-family: var(--sans);
  transition: all 0.3s; display: flex; align-items: center;
  justify-content: center; gap: 8px;
  box-shadow: 0 4px 24px rgba(78,205,196,0.25);
}
.ob-btn-finish:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(78,205,196,0.35);
}
.ob-btn-finish:active { transform: scale(0.98); }
.ob-btn-finish:disabled { opacity: 0.55; cursor: not-allowed; }
.ob-btn-back-text {
  background: none; border: none; padding: 0;
  color: rgba(255,255,255,0.4); font-size: 14px;
  cursor: pointer; font-family: var(--sans);
  transition: color 0.2s;
}
.ob-btn-back-text:hover { color: rgba(255,255,255,0.6); }

/* ── Nav row ── */
.ob-nav-row { display: flex; gap: 12px; margin-top: 12px; }
.ob-nav-row .ob-btn-primary { margin-top: 0; flex: 1; }

/* ── Finish nav ── */
.ob-finish-nav { display: flex; flex-direction: column; gap: 12px; }

/* ── Tag selection bar ── */
.ob-tag-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.ob-tag-count {
  color: var(--teal); font-size: 12px; font-weight: 700;
  font-family: var(--sans);
}
.ob-tag-reset {
  background: none; border: none; padding: 0;
  color: rgba(255,255,255,0.3); font-size: 12px;
  cursor: pointer; font-family: var(--sans);
  transition: color 0.2s;
}
.ob-tag-reset:hover { color: rgba(255,255,255,0.6); }

/* ── Tag scroll area ── */
.ob-tag-scroll {
  flex: 1; overflow-y: auto; min-height: 0;
  scrollbar-width: none;
}
.ob-tag-scroll::-webkit-scrollbar { display: none; }
.ob-tag-no-match {
  color: rgba(255,255,255,0.25); font-size: 12px;
  text-align: center; padding: 16px 0; font-family: var(--sans);
}

/* ── Search result chips ── */
.ob-search-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ob-search-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 7px 12px; border-radius: 14px;
  font-size: 11px; font-weight: 500;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5); cursor: pointer;
  transition: all 0.25s; font-family: var(--sans);
}
.ob-search-chip:hover {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
}
.ob-search-chip.ob-active {
  background: rgba(78,205,196,0.15);
  color: var(--teal);
  border-color: rgba(78,205,196,0.35);
}
.ob-search-chip-emoji { font-size: 12px; }
.ob-search-chip-plus { color: rgba(255,255,255,0.2); margin-left: 2px; }

/* ── Overkategori group ── */
.ob-over-group {
  border-radius: 16px; overflow: hidden;
  transition: all 0.25s;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 6px;
}
.ob-over-group.ob-has-sel {
  background: rgba(78,205,196,0.05);
  border-color: rgba(78,205,196,0.2);
}
.ob-over-btn {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; text-align: left;
  background: none; border: none; cursor: pointer;
  font-family: var(--sans);
}
.ob-over-emoji { font-size: 18px; line-height: 1; }
.ob-over-label {
  flex: 1; font-size: 14px; font-weight: 600;
  color: rgba(255,255,255,0.8);
}
.ob-over-group.ob-has-sel .ob-over-label { color: var(--teal); }
.ob-over-count {
  padding: 2px 7px; border-radius: 100px;
  background: rgba(78,205,196,0.15); color: var(--teal);
  font-size: 11px; font-weight: 700;
}
.ob-checkbox {
  width: 20px; height: 20px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  background: rgba(255,255,255,0.08);
}
.ob-checkbox.ob-checked {
  background: var(--teal);
  box-shadow: 0 0 10px rgba(78,205,196,0.3);
}
.ob-checkbox.ob-checked svg { color: #fff; }
.ob-chevron {
  color: rgba(255,255,255,0.25); transition: transform 0.25s;
  cursor: pointer;
}
.ob-chevron:hover { color: rgba(255,255,255,0.5); }
.ob-chevron.ob-expanded { transform: rotate(180deg); }

/* ── Kategori children area ── */
.ob-kat-children {
  padding: 4px 12px 12px 12px;
  display: flex; flex-direction: column; gap: 6px;
}

/* ── KategoriRow ── */
.ob-kat-row { display: flex; flex-direction: column; gap: 4px; }
.ob-kat-btn {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 12px; text-align: left;
  background: rgba(255,255,255,0.03);
  border: none; cursor: pointer; transition: all 0.2s;
  font-family: var(--sans);
}
.ob-kat-btn:hover { background: rgba(255,255,255,0.05); }
.ob-kat-btn.ob-active {
  background: rgba(78,205,196,0.1);
  box-shadow: inset 0 0 0 1px rgba(78,205,196,0.25);
}
.ob-kat-emoji { font-size: 14px; }
.ob-kat-label {
  flex: 1; font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.6);
}
.ob-kat-btn.ob-active .ob-kat-label { color: var(--teal); }
.ob-kat-count {
  padding: 1px 6px; border-radius: 100px;
  background: rgba(78,205,196,0.15); color: var(--teal);
  font-size: 9px; font-weight: 700;
}
.ob-kat-check {
  width: 16px; height: 16px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); transition: all 0.2s;
}
.ob-kat-check.ob-checked {
  background: var(--teal);
}
.ob-kat-check.ob-checked svg { color: #fff; }

/* ── Sub-tag chips ── */
.ob-sub-chips {
  padding-left: 24px; display: flex; flex-wrap: wrap; gap: 4px;
}
.ob-sub-chip {
  display: flex; align-items: center; gap: 3px;
  padding: 5px 10px; border-radius: 10px;
  font-size: 12px; font-weight: 500;
  background: rgba(255,255,255,0.04);
  border: none; color: rgba(255,255,255,0.4);
  cursor: pointer; transition: all 0.2s;
  font-family: var(--sans);
}
.ob-sub-chip:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.6);
}
.ob-sub-chip.ob-active {
  background: rgba(78,205,196,0.15);
  color: var(--teal);
  box-shadow: inset 0 0 0 1px rgba(78,205,196,0.25);
}

/* ── Radius step ── */
.ob-radius-center {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.ob-radius-circle {
  border-radius: 50%;
  border: 2px solid rgba(78,205,196,0.25);
  background: rgba(78,205,196,0.04);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 24px; transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
  box-shadow: 0 0 40px rgba(78,205,196,0.06);
}
.ob-radius-value {
  color: var(--teal); font-weight: 700; font-size: 24px;
  font-family: var(--sans);
}
.ob-radius-label {
  color: rgba(255,255,255,0.3); font-size: 12px;
  font-family: var(--sans);
}
.ob-radius-desc {
  color: rgba(255,255,255,0.5); font-size: 14px;
  text-align: center; margin-bottom: 16px; font-family: var(--sans);
}
.ob-radius-desc .ob-teal { color: var(--teal); font-weight: 600; }

/* ── Slider ── */
.ob-slider-wrap { width: 100%; padding: 0 16px; margin-bottom: 24px; }
.ob-slider {
  width: 100%; height: 6px; border-radius: 100px;
  appearance: none; -webkit-appearance: none;
  cursor: pointer; outline: none;
}
.ob-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--teal);
  box-shadow: 0 0 12px rgba(78,205,196,0.4);
  cursor: pointer; border: 3px solid var(--bg);
}
.ob-slider::-moz-range-thumb {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--teal);
  box-shadow: 0 0 12px rgba(78,205,196,0.4);
  cursor: pointer; border: 3px solid var(--bg);
}
.ob-slider-labels {
  display: flex; justify-content: space-between; margin-top: 8px;
}
.ob-slider-label-text {
  color: rgba(255,255,255,0.3); font-size: 12px; font-family: var(--sans);
}

/* ── Radius presets ── */
.ob-presets {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
}
.ob-preset {
  padding: 10px 14px; border-radius: 14px;
  font-size: 12px; font-weight: 600;
  display: flex; flex-direction: column; align-items: center;
  min-width: 62px; cursor: pointer;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4);
  transition: all 0.25s; font-family: var(--sans);
}
.ob-preset:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.12);
}
.ob-preset.ob-active {
  background: linear-gradient(135deg, var(--teal), #3dbdb5);
  color: var(--bg); border-color: transparent;
  box-shadow: 0 4px 20px rgba(78,205,196,0.25);
}
.ob-preset-desc {
  font-size: 11px; font-weight: 400; margin-top: 2px;
  color: rgba(255,255,255,0.25);
}
.ob-preset.ob-active .ob-preset-desc { color: rgba(6,10,15,0.6); }

/* ── Profile summary card ── */
.ob-summary {
  border-radius: 14px; padding: 14px 16px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 12px; margin-top: 16px;
}
.ob-summary-title {
  color: rgba(255,255,255,0.3); font-size: 11px;
  text-transform: uppercase; letter-spacing: 2px;
  font-weight: 600; margin-bottom: 8px; font-family: var(--sans);
}
.ob-summary-chips {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.ob-summary-chip {
  padding: 4px 10px; border-radius: 10px;
  font-size: 12px; display: flex; align-items: center; gap: 4px;
  font-family: var(--sans);
}
.ob-summary-chip-city {
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6);
}
.ob-summary-chip-tags {
  background: rgba(78,205,196,0.12); color: var(--teal); font-weight: 600;
}
.ob-summary-chip-radius {
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6);
}
`;

/* ── Alle danske byer ── */
const DANISH_CITIES = [
  "Aalborg","Aarhus","København","Odense","Esbjerg","Randers","Kolding","Horsens",
  "Vejle","Roskilde","Herning","Silkeborg","Næstved","Fredericia","Viborg","Køge",
  "Holstebro","Taastrup","Slagelse","Hillerød","Holbæk","Sønderborg","Svendborg",
  "Hjørring","Frederikshavn","Nørresundby","Ringsted","Haderslev","Skive","Birkerød",
  "Helsingør","Frederiksberg","Gentofte","Gladsaxe","Lyngby","Ballerup","Hvidovre",
  "Brøndby","Albertslund","Ishøj","Vallensbæk","Greve","Solrød","Stevns","Faxe",
  "Vordingborg","Guldborgsund","Lolland","Bornholm","Kalundborg","Odsherred",
  "Sorø","Lejre","Skanderborg","Favrskov","Hedensted","Billund","Varde","Vejen",
  "Tønder","Aabenraa","Fanø","Frederikssund","Halsnæs","Gribskov","Rudersdal",
  "Furesø","Allerød","Hørsholm","Dragør","Tårnby","Thisted","Morsø","Lemvig",
  "Struer","Ringkøbing-Skjern","Ikast-Brande","Norddjurs","Syddjurs","Odder",
  "Samsø","Mariagerfjord","Rebild","Vesthimmerland","Jammerbugt","Brønderslev",
  "Læsø","Nyborg","Assens","Faaborg-Midtfyn","Kerteminde","Nordfyns","Langeland","Ærø",
  "Middelfart","Frederiksberg","Nykøbing Falster","Nykøbing Mors","Skagen","Blokhus",
  "Løkken","Hvide Sande","Sæby","Grenaa","Ebeltoft","Ry","Brande","Give","Jelling",
  "Bramming","Ribe","Toftlund","Padborg","Kruså","Augustenborg","Nordborg","Gudhjem",
  "Rønne","Nexø","Allinge","Hasle","Maribo","Nakskov","Sasksøbing","Stege",
];

const ZIP_TO_CITY: Record<string, string> = {
  "9000":"Aalborg","8000":"Aarhus","1000":"København","5000":"Odense","6700":"Esbjerg",
  "8900":"Randers","6000":"Kolding","8700":"Horsens","7100":"Vejle","4000":"Roskilde",
  "7400":"Herning","8600":"Silkeborg","4700":"Næstved","7000":"Fredericia","8800":"Viborg",
  "4600":"Køge","7500":"Holstebro","2630":"Taastrup","4200":"Slagelse","3400":"Hillerød",
  "4300":"Holbæk","6400":"Sønderborg","5700":"Svendborg","9800":"Hjørring",
  "9900":"Frederikshavn","9400":"Nørresundby","4100":"Ringsted","6100":"Haderslev",
  "7800":"Skive","3460":"Birkerød","3000":"Helsingør","2000":"Frederiksberg",
  "2820":"Gentofte","2860":"Søborg","2800":"Lyngby","2750":"Ballerup","2650":"Hvidovre",
  "2605":"Brøndby","2620":"Albertslund","2635":"Ishøj","2625":"Vallensbæk","2670":"Greve",
  "2680":"Solrød","4640":"Faxe","4760":"Vordingborg","3700":"Rønne","4400":"Kalundborg",
  "4180":"Sorø","4320":"Lejre","8660":"Skanderborg","8700":"Horsens","7190":"Billund",
  "6800":"Varde","6600":"Vejen","6270":"Tønder","6200":"Aabenraa","6720":"Fanø",
  "3600":"Frederikssund","3500":"Værløse","2970":"Hørsholm","2791":"Dragør",
  "2770":"Kastrup","7700":"Thisted","7620":"Lemvig","7600":"Struer","8500":"Grenaa",
  "8400":"Ebeltoft","8680":"Ry","7330":"Brande","7323":"Give","7300":"Jelling",
  "6740":"Bramming","6760":"Ribe","6520":"Toftlund","6330":"Padborg","6440":"Augustenborg",
  "6430":"Nordborg","3760":"Gudhjem","3730":"Nexø","3770":"Allinge","3790":"Hasle",
  "4930":"Maribo","4900":"Nakskov","4990":"Sasksøbing","4780":"Stege",
};

function lookupZip(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d{4}$/.test(trimmed)) return ZIP_TO_CITY[trimmed] || null;
  return null;
}

const ALL_CITIES = [...new Set(DANISH_CITIES)].sort((a, b) => a.localeCompare(b, "da"));

const POPULAR_CITIES = [
  { name: "København", emoji: "\u{1F3F0}" },
  { name: "Aarhus", emoji: "\u{1F3D9}\u{FE0F}" },
  { name: "Aalborg", emoji: "\u{1F3E0}" },
  { name: "Odense", emoji: "\u{1F337}" },
  { name: "Esbjerg", emoji: "\u2693" },
  { name: "Vejle", emoji: "\u{1F30A}" },
];

const RADIUS_PRESETS = [
  { km: 10, label: "10 km", desc: "N\u00E6romr\u00E5de" },
  { km: 25, label: "25 km", desc: "Regionen" },
  { km: 50, label: "50+", desc: "St\u00F8rre omr\u00E5de" },
  { km: 100, label: "100 km", desc: "Landsdelen" },
  { km: 0, label: "Hele DK", desc: "Alt i Danmark" },
];

function countSelected(node: TagNode, selected: Set<string>): number {
  let count = selected.has(node.tag) ? 1 : 0;
  if (node.children) {
    for (const c of node.children) count += countSelected(c, selected);
  }
  return count;
}

function getAllDescendantTags(node: TagNode): string[] {
  const tags: string[] = [];
  if (node.children) {
    for (const c of node.children) {
      tags.push(c.tag);
      tags.push(...getAllDescendantTags(c));
    }
  }
  return tags;
}

function KategoriRow({ kat, selectedTags, onToggle, onSelectAll }: {
  kat: TagNode;
  selectedTags: Set<string>;
  onToggle: (tag: string) => void;
  onSelectAll: (tags: string[]) => void;
}) {
  const children = kat.children || [];
  const katSelected = selectedTags.has(kat.tag);
  const childCount = children.filter(c => selectedTags.has(c.tag)).length;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (katSelected && children.length > 0) setExpanded(true);
  }, [katSelected]);

  const handleKatClick = () => {
    if (katSelected) {
      onToggle(kat.tag);
    } else {
      onSelectAll([kat.tag, ...children.map(c => c.tag)]);
      if (children.length > 0) setExpanded(true);
    }
  };

  return (
    <div className="ob-kat-row">
      <button
        onClick={handleKatClick}
        className={`ob-kat-btn${katSelected ? " ob-active" : ""}`}
        data-testid={`tag-kat-${kat.tag}`}
      >
        <span className="ob-kat-emoji">{kat.emoji}</span>
        <span className="ob-kat-label">{kat.label}</span>
        {childCount > 0 && (
          <span className="ob-kat-count">{childCount}</span>
        )}
        <div className={`ob-kat-check${katSelected ? " ob-checked" : ""}`}>
          {katSelected && <Check size={10} />}
        </div>
        {children.length > 0 && (
          <ChevronDown
            size={12}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className={`ob-chevron${expanded ? " ob-expanded" : ""}`}
          />
        )}
      </button>
      {expanded && children.length > 0 && (
        <div className="ob-sub-chips">
          {children.map(under => {
            const active = selectedTags.has(under.tag);
            return (
              <button
                key={under.tag}
                onClick={() => onToggle(under.tag)}
                className={`ob-sub-chip${active ? " ob-active" : ""}`}
                data-testid={`tag-under-${under.tag}`}
              >
                <span>{under.emoji}</span>
                <span>{under.label}</span>
                {active && <Check size={8} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OverkategoriGroup({ over, selectedTags, onToggle, onSelectAll, forceExpand }: {
  over: TagNode;
  selectedTags: Set<string>;
  onToggle: (tag: string) => void;
  onSelectAll: (tags: string[]) => void;
  forceExpand?: boolean;
}) {
  const kategorier = over.children || [];
  const overSelected = selectedTags.has(over.tag);
  const selCount = countSelected(over, selectedTags) - (overSelected ? 1 : 0);
  const hasSelections = overSelected || selCount > 0;
  const [expanded, setExpanded] = useState(forceExpand || false);

  useEffect(() => {
    if (forceExpand) setExpanded(true);
  }, [forceExpand]);

  useEffect(() => {
    if (overSelected && kategorier.length > 0) setExpanded(true);
  }, [overSelected]);

  const handleOverClick = () => {
    if (overSelected) {
      onToggle(over.tag);
    } else {
      const all = [over.tag, ...getAllDescendantTags(over)];
      onSelectAll(all);
      if (kategorier.length > 0) setExpanded(true);
    }
  };

  return (
    <div className={`ob-over-group${hasSelections ? " ob-has-sel" : ""}`}>
      <button
        onClick={handleOverClick}
        className="ob-over-btn"
        data-testid={`tag-over-${over.tag}`}
      >
        <span className="ob-over-emoji">{over.emoji}</span>
        <span className="ob-over-label">{over.label}</span>
        {selCount > 0 && (
          <span className="ob-over-count">{selCount}</span>
        )}
        <div className={`ob-checkbox${overSelected ? " ob-checked" : ""}`}>
          {overSelected && <Check size={12} />}
        </div>
        {kategorier.length > 0 && (
          <ChevronDown
            size={14}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className={`ob-chevron${expanded ? " ob-expanded" : ""}`}
          />
        )}
      </button>

      {expanded && kategorier.length > 0 && (
        <div className="ob-kat-children">
          {kategorier.map(kat => (
            <KategoriRow
              key={kat.tag}
              kat={kat}
              selectedTags={selectedTags}
              onToggle={onToggle}
              onSelectAll={onSelectAll}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResultChip({ node, isSelected, onToggle }: {
  node: TagNode; isSelected: boolean; onToggle: (tag: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(node.tag)}
      className={`ob-search-chip${isSelected ? " ob-active" : ""}`}
    >
      <span className="ob-search-chip-emoji">{node.emoji}</span>
      <span>{node.label}</span>
      {isSelected ? <Check size={10} /> : <span className="ob-search-chip-plus">+</span>}
    </button>
  );
}

export default function Onboarding() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setCity, setCities, setOnboardingInterests, setSelectedTags: setContextTags, setRadius } = useTags();
  const { user, refreshProfile } = useAuth();
  const containerRef = useFadeUp("ob");

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [zipMatch, setZipMatch] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [tagSearch, setTagSearch] = useState("");
  const tagSearchRef = useRef<HTMLInputElement>(null);

  const [selectedRadius, setSelectedRadius] = useState(25);
  const [saving, setSaving] = useState(false);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return [];
    const q = citySearch.trim();
    const zipCity = lookupZip(q);
    if (zipCity) return [zipCity];
    const lower = q.toLowerCase();
    return ALL_CITIES.filter(c => c.toLowerCase().includes(lower) && !selectedCities.includes(c)).slice(0, 8);
  }, [citySearch, selectedCities]);

  useEffect(() => {
    setZipMatch(lookupZip(citySearch.trim()));
  }, [citySearch]);

  const searchResults = useMemo(() => {
    if (!tagSearch.trim()) return [];
    return searchTags(tagSearch).slice(0, 20);
  }, [tagSearch]);

  const isSearching = tagSearch.trim().length > 0;

  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) &&
          searchRef.current && !searchRef.current.contains(target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addCity = (city: string) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities(prev => [...prev, city]);
    }
    setCitySearch("");
    setShowCityDropdown(false);
    setZipMatch(null);
  };

  const removeCity = (city: string) => {
    setSelectedCities(prev => prev.filter(c => c !== city));
  };

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const selectAllTags = useCallback((tags: string[]) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      for (const tag of tags) next.add(tag);
      return next;
    });
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    const tagArray = [...selectedTags];
    const vibeKeys = [...new Set(
      tagArray.map(tag => getOverkategoriForTag(tag)).filter(Boolean) as string[]
    )];
    const primaryCity = selectedCities[0] || "";

    setCity(primaryCity);
    setCities(selectedCities);
    setOnboardingInterests(tagArray);
    setContextTags(tagArray);
    setRadius(selectedRadius);

    if (user?.id) {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          city: primaryCity,
          interests: tagArray,
          vibe_tags: vibeKeys,
          radius_km: selectedRadius,
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (error) console.error("Onboarding save error:", error);
      await refreshProfile();
    }

    setSaving(false);
    setLocation("/feed");
  };

  const tagCount = selectedTags.size;
  const radiusLabel = selectedRadius === 0 ? t('onboarding.all_dk') : `${selectedRadius} km`;
  const radiusCircleSize = selectedRadius === 0 ? 200 : Math.min(80 + (selectedRadius / 200) * 120, 200);

  return (
    <div className="ob-root" ref={containerRef} data-testid="onboarding-page">
      <style>{onboardingCSS}</style>

      {/* Background hero with overlay */}
      <div className="ob-bg" />

      <div className="ob-container">
        {/* Premium progress bar */}
        <div className="ob-progress-area ob-fade-up">
          <div className="ob-progress-header">
            <div className="ob-eyebrow">
              <div className="ob-eyebrow-line" />
              Onboarding
            </div>
            <span className="ob-step-label">{t('common.step_of', { step, total: totalSteps })}</span>
          </div>
          <div className="ob-progress-track">
            <div className="ob-progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="ob-content">

          {/* ── STEP 1: City selection ── */}
          {step === 1 && (
            <>
              <div className="ob-step-header ob-fade-up ob-d1">
                <div className="ob-icon-box">
                  <MapPin size={18} />
                </div>
                <h1 className="ob-title">{t('onboarding.where_experience')}</h1>
                <p className="ob-subtitle">{t('onboarding.select_cities')}</p>
              </div>

              <div className="ob-search-wrap ob-fade-up ob-d2">
                <Search size={16} className="ob-search-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  inputMode="search"
                  value={citySearch}
                  onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                  onFocus={() => citySearch && setShowCityDropdown(true)}
                  placeholder={t('onboarding.city_or_zip')}
                  className="ob-search-input"
                  data-testid="input-city-search"
                />
                {citySearch && (
                  <button onClick={() => { setCitySearch(""); setShowCityDropdown(false); }} className="ob-search-clear"><X size={16} /></button>
                )}
                {showCityDropdown && filteredCities.length > 0 && (
                  <div ref={dropdownRef} className="ob-dropdown">
                    {filteredCities.map(city => {
                      const alreadyAdded = selectedCities.includes(city);
                      return (
                        <button key={city} onClick={() => !alreadyAdded && addCity(city)} className={`ob-dropdown-item${alreadyAdded ? " ob-already-added" : ""}`}>
                          <MapPin size={14} className="ob-dropdown-pin" />
                          <span className="ob-dropdown-name">{city}</span>
                          {zipMatch && <span className="ob-dropdown-zip">({citySearch})</span>}
                          {alreadyAdded ? <Check size={14} /> : <Plus size={14} className="ob-dropdown-pin" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedCities.length > 0 && (
                <div className="ob-selected-cities ob-fade-up ob-d2">
                  {selectedCities.map((city, i) => (
                    <div key={city} className="ob-city-chip">
                      <MapPin size={12} />
                      <span className="ob-city-chip-name">{city}</span>
                      {i === 0 && <span className="ob-city-chip-primary">{t('onboarding.primary')}</span>}
                      <button onClick={() => removeCity(city)} className="ob-city-chip-remove"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}

              <p className="ob-section-label ob-fade-up ob-d3">{t('onboarding.popular_cities')}</p>
              <div className="ob-city-grid ob-fade-up ob-d3">
                {POPULAR_CITIES.map(c => {
                  const active = selectedCities.includes(c.name);
                  return (
                    <button key={c.name} onClick={() => active ? removeCity(c.name) : addCity(c.name)}
                      className={`ob-city-card${active ? " ob-active" : ""}`}
                      data-testid={`city-${c.name}`}
                    >
                      <span className="ob-city-emoji">{c.emoji}</span>
                      <span className="ob-city-name">{c.name}</span>
                      {active && <Check size={12} />}
                    </button>
                  );
                })}
              </div>

              <div className="ob-spacer" />

              <button
                onClick={() => selectedCities.length > 0 ? setStep(2) : null}
                disabled={selectedCities.length === 0}
                className="ob-btn-primary ob-fade-up ob-d4"
                data-testid="button-next-step-1"
              >
                {t('common.continue')}
              </button>
            </>
          )}

          {/* ── STEP 2: Tag selection ── */}
          {step === 2 && (
            <>
              <div className="ob-step-header ob-fade-up ob-d1">
                <div className="ob-icon-box">
                  <Sparkles size={18} />
                </div>
                <h1 className="ob-title">{t('onboarding.what_interests')}</h1>
                <p className="ob-subtitle">{t('onboarding.select_interests')}</p>
              </div>

              <div className="ob-search-wrap ob-fade-up ob-d2">
                <Search size={14} className="ob-tag-search-icon" />
                <input
                  ref={tagSearchRef}
                  type="text"
                  value={tagSearch}
                  onChange={e => setTagSearch(e.target.value)}
                  placeholder={t('tags.search')}
                  className="ob-tag-search-input"
                  data-testid="input-tag-search"
                />
                {tagSearch && (
                  <button onClick={() => setTagSearch("")} className="ob-tag-search-clear"><X size={12} /></button>
                )}
              </div>

              {tagCount > 0 && (
                <div className="ob-tag-bar ob-fade-up ob-d2">
                  <span className="ob-tag-count">{t('tags.selected_count', { count: tagCount })}</span>
                  <button onClick={() => setSelectedTags(new Set())} className="ob-tag-reset">{t('tags.reset')}</button>
                </div>
              )}

              <div className="ob-tag-scroll ob-fade-up ob-d3">
                {isSearching ? (
                  searchResults.length > 0 ? (
                    <div className="ob-search-chips">
                      {searchResults.map(node => (
                        <SearchResultChip
                          key={node.tag}
                          node={node}
                          isSelected={selectedTags.has(node.tag)}
                          onToggle={toggleTag}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="ob-tag-no-match">{t('tags.no_match', { query: tagSearch })}</p>
                  )
                ) : (
                  getOverkategorier().map(over => (
                    <OverkategoriGroup
                      key={over.tag}
                      over={over}
                      selectedTags={selectedTags}
                      onToggle={toggleTag}
                      onSelectAll={selectAllTags}
                    />
                  ))
                )}
              </div>

              <div className="ob-nav-row ob-fade-up ob-d4">
                <button onClick={() => setStep(1)} className="ob-btn-back">
                  {t('common.back')}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="ob-btn-primary"
                  data-testid="button-next-step-2"
                >
                  {tagCount > 0 ? t('onboarding.continue_with', { count: tagCount }) : t('common.continue')}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Radius selection ── */}
          {step === 3 && (
            <>
              <div className="ob-step-header ob-fade-up ob-d1">
                <div className="ob-icon-box">
                  <Compass size={18} />
                </div>
                <h1 className="ob-title">{t('onboarding.how_far')}</h1>
                <p className="ob-subtitle">{t('onboarding.set_radius')}</p>
              </div>

              <div className="ob-radius-center ob-fade-up ob-d2">
                <div
                  className="ob-radius-circle"
                  style={{ width: radiusCircleSize, height: radiusCircleSize }}
                >
                  <div style={{ textAlign: "center" }}>
                    <p className="ob-radius-value">{radiusLabel}</p>
                    <p className="ob-radius-label">{t('onboarding.radius')}</p>
                  </div>
                </div>

                <p className="ob-radius-desc">
                  {t('onboarding.experiences_within')} <span className="ob-teal">{radiusLabel}</span> {t('onboarding.of_city', { city: selectedCities[0] || t('onboarding.your_city') })}
                </p>

                <div className="ob-slider-wrap">
                  <input type="range" min="0" max="250" step="5" value={selectedRadius} onChange={e => setSelectedRadius(Number(e.target.value))}
                    className="ob-slider"
                    style={{ background: `linear-gradient(to right, #4ECDC4 0%, #4ECDC4 ${(selectedRadius / 250) * 100}%, rgba(255,255,255,0.1) ${(selectedRadius / 250) * 100}%, rgba(255,255,255,0.1) 100%)` }}
                    data-testid="radius-slider"
                  />
                  <div className="ob-slider-labels">
                    <span className="ob-slider-label-text">{t('onboarding.all_dk')}</span>
                    <span className="ob-slider-label-text">250 km</span>
                  </div>
                </div>

                <div className="ob-presets ob-fade-up ob-d3">
                  {RADIUS_PRESETS.map(p => {
                    const active = selectedRadius === p.km;
                    return (
                      <button key={p.km} onClick={() => setSelectedRadius(p.km)} className={`ob-preset${active ? " ob-active" : ""}`}>
                        <span>{p.km === 0 ? t('onboarding.all_dk') : p.label}</span>
                        <span className="ob-preset-desc">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ob-summary ob-fade-up ob-d3">
                <p className="ob-summary-title">{t('onboarding.your_profile')}</p>
                <div className="ob-summary-chips">
                  <span className="ob-summary-chip ob-summary-chip-city"><MapPin size={10} /> {selectedCities.join(", ")}</span>
                  <span className="ob-summary-chip ob-summary-chip-tags">{t('onboarding.tags_count', { count: tagCount })}</span>
                  <span className="ob-summary-chip ob-summary-chip-radius">{radiusLabel}</span>
                </div>
              </div>

              <div className="ob-finish-nav ob-fade-up ob-d4">
                <button onClick={handleFinish} disabled={saving} className="ob-btn-finish" data-testid="button-kom-i-gang-onboarding">
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? t('onboarding.setting_up') : t('onboarding.start_feed')}
                </button>
                <button onClick={() => setStep(2)} className="ob-btn-back-text">{t('common.back')}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
