/**
 * OpretEvent — user event creation form
 * Route: /opret-event
 *
 * Lets any authenticated user create an event. Fields map directly to
 * the `events` table. After creation the user is redirected to the
 * new event's detail page.
 */

import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { pageBase } from "@/lib/pageCSSBase";
import {
  CalendarPlus, MapPin, Tag, Users, DollarSign,
  Image, FileText, Loader2, ChevronLeft, Check, X,
  Clock, Upload,
} from "lucide-react";
import { sendEventCreatedConfirmation } from "@/lib/email";

/* ── Categories ─────────────────────────────────────────────────────────── */

const CATEGORIES = [
  "Sport", "Fitness", "Cykling", "Løb", "Svømning", "Vandring",
  "Yoga", "Wellness", "Outdoor", "Natur", "MTB", "Padel",
  "Musik", "Kultur", "Mad & Drikke", "Kunst", "Teater", "Film",
  "Sociale", "Netværk", "Familie", "Børn", "Uddannelse", "Tech",
  "Gaming", "Frivillig", "Andet",
];

const INTEREST_TAGS = [
  "Begynder", "Øvet", "Erfaren", "Alle niveauer",
  "Gratis", "Udendørs", "Indendørs", "Hund velkomment",
  "Familievenligt", "18+", "Kvindegruppe", "Senioraktivitet",
];

/* ── CSS ─────────────────────────────────────────────────────────────────── */

const css = `
${pageBase("oe")}

.oe-root { padding-bottom: 120px; }

/* ── Back bar ── */
.oe-back {
  display: flex; align-items: center; gap: 6px;
  padding: 16px 20px 0; color: var(--teal); font-size: 14px;
  font-weight: 500; background: none; border: none; cursor: pointer;
  font-family: var(--sans); transition: opacity 0.2s;
}
.oe-back:hover { opacity: 0.75; }
.oe-back svg { width: 16px; height: 16px; }

/* ── Header ── */
.oe-header {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px 20px;
}
.oe-header-icon {
  width: 44px; height: 44px; border-radius: 14px;
  background: rgba(78,205,196,0.12); border: 1px solid rgba(78,205,196,0.25);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.oe-header-icon svg { color: var(--teal); }
.oe-header-title {
  font-family: var(--serif); font-size: 26px; font-weight: 400;
  color: var(--pg-white); margin: 0; letter-spacing: -0.5px;
}
.oe-header-sub {
  font-size: 13px; color: rgba(255,255,255,0.4); margin: 2px 0 0;
}

/* ── Form sections ── */
.oe-section {
  padding: 0 20px; margin-bottom: 20px;
}
.oe-card {
  border-radius: 16px; overflow: hidden;
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
}
.oe-card-title {
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35);
  text-transform: uppercase; letter-spacing: 2px;
  padding: 14px 16px 0; margin: 0;
  display: flex; align-items: center; gap: 6px;
}
.oe-card-title svg { color: var(--teal); opacity: 0.6; width: 13px; height: 13px; }

/* ── Field ── */
.oe-field { padding: 12px 16px; }
.oe-field + .oe-field { border-top: 1px solid rgba(255,255,255,0.05); }
.oe-label {
  display: block; font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.4); margin-bottom: 6px;
  text-transform: uppercase; letter-spacing: 1.2px;
}
.oe-label .req { color: #f87171; }
.oe-input, .oe-textarea, .oe-select {
  width: 100%; padding: 10px 12px; border-radius: 10px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.9); font-size: 15px; font-family: var(--sans);
  outline: none; transition: all 0.2s; box-sizing: border-box;
}
.oe-input:focus, .oe-textarea:focus, .oe-select:focus {
  background: rgba(255,255,255,0.08);
  border-color: rgba(78,205,196,0.35);
  box-shadow: 0 0 0 3px rgba(78,205,196,0.07);
}
.oe-input::placeholder, .oe-textarea::placeholder { color: rgba(255,255,255,0.25); }
.oe-textarea { resize: none; min-height: 100px; line-height: 1.6; }
.oe-select {
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
  padding-right: 32px; cursor: pointer;
}
.oe-select option { background: #0d1117; }
.oe-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* ── Tag chips ── */
.oe-chips {
  display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 2px;
}
.oe-chip {
  padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.18s;
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
  font-family: var(--sans);
}
.oe-chip:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
.oe-chip.active {
  background: rgba(78,205,196,0.12); color: #4ecdc4;
  border-color: rgba(78,205,196,0.3);
}

/* ── Image upload ── */
.oe-img-zone {
  border: 2px dashed rgba(255,255,255,0.12); border-radius: 14px;
  padding: 28px; text-align: center; cursor: pointer; transition: all 0.25s;
  position: relative; overflow: hidden; margin: 4px 0;
}
.oe-img-zone:hover, .oe-img-zone.drag { border-color: rgba(78,205,196,0.4); background: rgba(78,205,196,0.04); }
.oe-img-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.oe-img-zone-icon { color: rgba(255,255,255,0.2); margin-bottom: 8px; }
.oe-img-zone-text { font-size: 14px; color: rgba(255,255,255,0.35); }
.oe-img-zone-sub { font-size: 12px; color: rgba(255,255,255,0.2); margin-top: 4px; }
.oe-img-preview {
  position: relative; border-radius: 12px; overflow: hidden;
  aspect-ratio: 16/9; margin: 4px 0;
}
.oe-img-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.oe-img-preview-clear {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.6); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(4px);
}
.oe-img-uploading {
  display: flex; align-items: center; gap: 6px; padding: 10px 0;
  font-size: 13px; color: rgba(255,255,255,0.4);
}
.oe-img-uploading svg { animation: oeSpin 1s linear infinite; }
@keyframes oeSpin { to { transform: rotate(360deg); } }

/* ── Submit ── */
.oe-submit-wrap {
  padding: 0 20px; margin-top: 8px;
}
.oe-submit {
  width: 100%; padding: 16px; border-radius: 16px; border: none;
  background: linear-gradient(135deg, #4ecdc4, #45b7aa);
  color: #060a0f; font-size: 16px; font-weight: 700;
  font-family: var(--sans); cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: 0 4px 20px rgba(78,205,196,0.25);
}
.oe-submit:hover:not(:disabled) {
  transform: translateY(-2px); box-shadow: 0 8px 28px rgba(78,205,196,0.35);
}
.oe-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.oe-submit svg { animation: oeSpin 1s linear infinite; }

/* ── Error / success ── */
.oe-msg {
  padding: 12px 16px; border-radius: 12px; font-size: 14px;
  margin: 0 20px 16px;
}
.oe-msg--err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; }
.oe-msg--ok  { background: rgba(78,205,196,0.1); border: 1px solid rgba(78,205,196,0.2); color: #4ecdc4; }

/* ── Auth gate ── */
.oe-gate {
  text-align: center; padding: 80px 20px;
}
.oe-gate-icon { color: rgba(255,255,255,0.12); margin-bottom: 16px; }
.oe-gate-title { font-size: 20px; color: rgba(255,255,255,0.6); margin: 0 0 8px; }
.oe-gate-sub { font-size: 14px; color: rgba(255,255,255,0.3); }
.oe-gate-btn {
  margin-top: 24px; padding: 12px 28px; border-radius: 12px;
  background: rgba(78,205,196,0.12); border: 1px solid rgba(78,205,196,0.25);
  color: #4ecdc4; font-size: 15px; font-weight: 600;
  font-family: var(--sans); cursor: pointer; transition: all 0.2s;
}
.oe-gate-btn:hover { background: rgba(78,205,196,0.2); }
`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function today() {
  return new Date().toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function OpretEvent() {
  const { user, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();

  // Form state
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [date, setDate]                 = useState('');
  const [endDate, setEndDate]           = useState('');
  const [location, setLocation2]        = useState('');
  const [category, setCategory]         = useState('');
  const [maxParticipants, setMax]       = useState('');
  const [price, setPrice]               = useState('0');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl]         = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [drag, setDrag]                 = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [message, setMessage]           = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image upload ──────────────────────────────────────────────────────
  const handleImageFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Foto er for stort (maks 5 MB)', type: 'err' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setMessage({ text: 'Kun JPEG, PNG, WEBP og GIF er tilladt', type: 'err' });
      return;
    }
    setImageUploading(true);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `user-events/${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('event-images')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      setMessage({ text: 'Upload fejlede: ' + error.message, type: 'err' });
      setImagePreview(null);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(path);
      setImageUrl(publicUrl);
    }
    setImageUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  // ── Tag toggle ────────────────────────────────────────────────────────
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim()) {
      setMessage({ text: 'Titel er påkrævet', type: 'err' });
      return;
    }
    if (!date) {
      setMessage({ text: 'Dato og tidspunkt er påkrævet', type: 'err' });
      return;
    }
    if (!location.trim()) {
      setMessage({ text: 'Lokation er påkrævet', type: 'err' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { data, error } = await supabase
      .from('events')
      .insert({
        title:       title.trim(),
        description: description.trim() || null,
        date:        new Date(date).toISOString(),
        location:    location.trim(),
        category:    category || null,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        price:       parseFloat(price) || 0,
        image_url:   imageUrl,
        interest_tags: selectedTags.length ? selectedTags : null,
        created_by:  user.id,
        status:      'aktiv',
        source:      'user',
        country:     'DK',
      })
      .select('id')
      .single();

    if (error) {
      setMessage({ text: 'Kunne ikke oprette event: ' + error.message, type: 'err' });
      setSubmitting(false);
      return;
    }

    setMessage({ text: 'Event oprettet!', type: 'ok' });

    // Send creation confirmation email (best-effort)
    if (user.email) {
      sendEventCreatedConfirmation({
        to: user.email,
        userName: user.email.split('@')[0],
        eventTitle: title.trim(),
        eventDate: new Date(date).toISOString(),
        eventId: String(data.id),
      });
    }

    setTimeout(() => setLocation(`/event/${data.id}`), 800);
  };

  // ── Not logged in ─────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <>
        <style>{css}</style>
        <div className="oe-root">
          <div className="oe-gate">
            <CalendarPlus size={56} className="oe-gate-icon" />
            <h2 className="oe-gate-title">Log ind for at oprette et event</h2>
            <p className="oe-gate-sub">Du skal være logget ind for at oprette events på B-Social</p>
            <button
              className="oe-gate-btn"
              onClick={() => {
                sessionStorage.setItem('returnTo', '/opret-event');
                setLocation('/auth');
              }}
            >
              Log ind / Opret konto
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="oe-root">

        {/* Back */}
        <button className="oe-back" onClick={() => history.back()}>
          <ChevronLeft /> Tilbage
        </button>

        {/* Header */}
        <div className="oe-header">
          <div className="oe-header-icon"><CalendarPlus size={22} /></div>
          <div>
            <h1 className="oe-header-title">Opret event</h1>
            <p className="oe-header-sub">Del din aktivitet med andre</p>
          </div>
        </div>

        {/* Error / success */}
        {message && (
          <p className={`oe-msg oe-msg--${message.type}`}>{message.text}</p>
        )}

        {/* ── Grundlæggende info ── */}
        <div className="oe-section">
          <div className="oe-card">
            <p className="oe-card-title"><FileText size={13} />Grundlæggende info</p>

            <div className="oe-field">
              <label className="oe-label">Titel <span className="req">*</span></label>
              <input
                className="oe-input"
                type="text"
                placeholder="Hvad hedder dit event?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="oe-field">
              <label className="oe-label">Beskrivelse</label>
              <textarea
                className="oe-textarea"
                placeholder="Fortæl hvad der sker, hvem det er for, hvad man skal medbringe…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
            </div>

            <div className="oe-field">
              <label className="oe-label">Kategori</label>
              <select className="oe-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Vælg kategori…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Tid & Sted ── */}
        <div className="oe-section">
          <div className="oe-card">
            <p className="oe-card-title"><Clock size={13} />Tid & Sted</p>

            <div className="oe-field">
              <div className="oe-row2">
                <div>
                  <label className="oe-label">Start <span className="req">*</span></label>
                  <input
                    className="oe-input"
                    type="datetime-local"
                    value={date}
                    min={today()}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="oe-label">Slut (valgfrit)</label>
                  <input
                    className="oe-input"
                    type="datetime-local"
                    value={endDate}
                    min={date || today()}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="oe-field">
              <label className="oe-label">Lokation <span className="req">*</span></label>
              <input
                className="oe-input"
                type="text"
                placeholder="Adresse eller stednavn"
                value={location}
                onChange={(e) => setLocation2(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Detaljer ── */}
        <div className="oe-section">
          <div className="oe-card">
            <p className="oe-card-title"><Users size={13} />Detaljer</p>

            <div className="oe-field">
              <div className="oe-row2">
                <div>
                  <label className="oe-label">Maks. deltagere</label>
                  <input
                    className="oe-input"
                    type="number"
                    placeholder="Ubegrænset"
                    min="1"
                    max="10000"
                    value={maxParticipants}
                    onChange={(e) => setMax(e.target.value)}
                  />
                </div>
                <div>
                  <label className="oe-label">Pris (DKK)</label>
                  <input
                    className="oe-input"
                    type="number"
                    placeholder="0 = gratis"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="oe-field">
              <label className="oe-label">Tags</label>
              <div className="oe-chips">
                {INTEREST_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`oe-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {selectedTags.includes(tag) && <Check size={11} style={{ marginRight: 4 }} />}
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Billede ── */}
        <div className="oe-section">
          <div className="oe-card">
            <p className="oe-card-title"><Image size={13} />Billede</p>
            <div className="oe-field">
              {imagePreview ? (
                <div className="oe-img-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    className="oe-img-preview-clear"
                    type="button"
                    onClick={() => { setImagePreview(null); setImageUrl(null); }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : imageUploading ? (
                <div className="oe-img-uploading">
                  <Loader2 size={14} /> Uploader billede…
                </div>
              ) : (
                <div
                  className={`oe-img-zone ${drag ? 'drag' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
                  />
                  <div className="oe-img-zone-icon"><Upload size={28} /></div>
                  <p className="oe-img-zone-text">Klik eller træk et billede hertil</p>
                  <p className="oe-img-zone-sub">JPEG, PNG, WEBP — maks 5 MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="oe-submit-wrap">
          <button
            className="oe-submit"
            onClick={handleSubmit}
            disabled={submitting || imageUploading || !title.trim() || !date || !location.trim()}
          >
            {submitting
              ? <><Loader2 size={18} /> Opretter…</>
              : <><Check size={18} /> Opret event</>}
          </button>
        </div>

      </div>
    </>
  );
}
