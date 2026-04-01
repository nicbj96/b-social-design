import FirmaLayout from "@/components/FirmaLayout";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
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

function StatusBadge({ status }: { status: EventStatus }) {
  const { t } = useTranslation();
  const colors: Record<string, string> = {
    aktiv: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    afsluttet: "bg-white/5 text-muted-foreground border-white/10",
    promoted: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${colors[status] || colors.draft}`}>
      {status === "promoted" ? t('firma.events_status_promoted') : status}
    </span>
  );
}

function BoostModal({ event, onClose }: { event: FirmaEvent; onClose: () => void }) {
  const { t } = useTranslation();
  const [budget, setBudget] = useState(200);
  const [duration, setDuration] = useState(7);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1} ref={(el: HTMLDivElement | null) => el?.focus()}>
      <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{t('firma.events_boost_title')}: {event.title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-muted-foreground"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{t('firma.events_budget')}: {budget} {t('firma.events_currency')}</label>
            <input type="range" min={50} max={500} step={50} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>50 {t('firma.events_currency')}</span><span>500 {t('firma.events_currency')}</span></div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{t('firma.events_estimated_reach')}</label>
            <p className="text-2xl font-bold text-primary">{(budget * 8).toLocaleString()} {t('firma.events_users')}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">{t('firma.events_duration')}</label>
            <div className="flex gap-2">
              {[3, 7, 14].map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${duration === d ? "bg-primary/15 text-primary border border-primary/30" : "bg-white/5 text-muted-foreground border border-white/10"}`}>
                  {d} {t('firma.events_days')}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            {t('firma.events_start_boost')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FirmaEvents() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("alle");
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [boostEvent, setBoostEvent] = useState<FirmaEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const filtered = MOCK_EVENTS.filter((e) => {
    if (filterStatus !== "alle" && e.status !== filterStatus) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const now = new Date(2026, 3, 1);
  const daysInMonth = new Date(2026, 4, 0).getDate();
  const firstDay = now.getDay() || 7;

  return (
    <FirmaLayout>
      <div className="space-y-6">
        {boostEvent && <BoostModal event={boostEvent} onClose={() => setBoostEvent(null)} />}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('firma.events_title')}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t('firma.events_subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}><List size={16} /></button>
              <button onClick={() => setViewMode("calendar")} className={`p-2 ${viewMode === "calendar" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}><Calendar size={16} /></button>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus size={16} /> {t('firma.events_create')}
            </button>
          </div>
        </div>

        {/* Create event form */}
        {showCreate && (
          <div className="glass-card rounded-xl p-4 space-y-4">
            <h2 className="font-semibold">{t('firma.events_new')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t('firma.events_label_title')}</label>
                <input type="text" placeholder={t('firma.events_placeholder_title')} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t('firma.events_label_date')}</label>
                <input type="date" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t('firma.events_label_location')}</label>
                <input type="text" placeholder={t('firma.events_placeholder_address')} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t('firma.events_label_tags')}</label>
                <input type="text" placeholder={t('firma.events_placeholder_tags')} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground mb-1 block">{t('firma.events_label_description')}</label>
                <textarea rows={3} placeholder={t('firma.events_placeholder_description')} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">{t('firma.events_save_draft')}</button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">{t('firma.events_publish')}</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-muted-foreground text-sm">{t('firma.events_cancel')}</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
            <input type="text" placeholder={t('firma.events_search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-2">
            {(["alle", "aktiv", "draft", "promoted", "afsluttet"] as const).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground hover:text-foreground"}`}>
                {s === "alle" ? t('firma.events_filter_all') : s}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar view */}
        {viewMode === "calendar" && (
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-3">{t('firma.events_calendar_april_2026')}</h3>
            <div className="grid grid-cols-7 gap-1 text-center">
              {[t('firma.events_day_mon'), t('firma.events_day_tue'), t('firma.events_day_wed'), t('firma.events_day_thu'), t('firma.events_day_fri'), t('firma.events_day_sat'), t('firma.events_day_sun')].map((d) => (
                <div key={d} className="text-xs text-muted-foreground py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay - 1 }).map((_, i) => (<div key={`e${i}`} />))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const eventsOnDay = MOCK_EVENTS.filter((e) => {
                  const d = new Date(e.date);
                  return d.getMonth() === 3 && d.getDate() === day;
                });
                return (
                  <div key={day} className={`py-2 rounded-lg text-sm ${eventsOnDay.length > 0 ? "bg-primary/10" : "hover:bg-white/5"}`}>
                    {day}
                    {eventsOnDay.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Events list */}
        {viewMode === "list" && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {filtered.map((event) => (
                <div key={event.id}>
                  <div className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {event.image ? <img src={event.image} alt="" className="w-full h-full object-cover" loading="lazy" /> : <CalendarPlus size={18} className="text-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <div className="flex gap-1 mt-1">
                            {event.tags.map((tag) => (<span key={tag} className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-muted-foreground">{tag}</span>))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground hidden sm:block">{event.date}</span>
                        <StatusBadge status={event.status} />
                        <button onClick={(e) => { e.stopPropagation(); setBoostEvent(event); }} className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground">
                          <Megaphone size={14} />
                        </button>
                        {expandedId === event.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  {/* Expand panel */}
                  {expandedId === event.id && (
                    <div className="px-4 py-4 bg-white/[0.02] border-t border-white/5">
                      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{t('firma.events_signups')}</span>
                          <span>{event.signups} / {event.maxSignups}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(event.signups / event.maxSignups) * 100}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {event.views.toLocaleString()} {t('firma.events_views')}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-1"><Edit size={12} /> {t('firma.events_edit')}</button>
                        <button className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-1"><Copy size={12} /> {t('firma.events_duplicate')}</button>
                        {confirmDelete === event.id ? (
                          <>
                            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs bg-red-500/15 text-red-400 border border-red-500/20">{t('firma.events_confirm_delete')}</button>
                            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground">{t('firma.events_cancel')}</button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDelete(event.id)} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-1"><Trash2 size={12} /> {t('firma.events_delete')}</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}
