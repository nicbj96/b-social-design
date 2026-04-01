import { useState } from "react";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';


interface Note {
  id: string;
  title: string;
  content: string;
  emoji: string;
  type: "event" | "person" | "ide";
  tag: string;
}

const DEMO_NOTES: Note[] = [
  {
    id: "n1",
    title: "Brætspil-aften",
    content: "Mads havde Settlers of Catan med — virkelig sjov aften. Husk at spørge om Ticket to Ride næste gang.",
    emoji: "🎲",
    type: "event",
    tag: "Spil",
  },
  {
    id: "n2",
    title: "Anna fra gåturen",
    content: "Arbejder på universitetet. Interesseret i vandring og fotografi. Vil gerne med på Rold Skov-turen.",
    emoji: "👩",
    type: "person",
    tag: "Kontakt",
  },
  {
    id: "n3",
    title: "Cykeltur til Nibe",
    content: "Smuk rute langs fjorden. Husk vand og solcreme. Tager ca. 1.5 time i roligt tempo. God café i Nibe havn.",
    emoji: "🚴",
    type: "event",
    tag: "Sport",
  },
  {
    id: "n4",
    title: "Ide: Fællesspisning",
    content: "Tænker vi kunne lave en fællesspisning i Vestbyen. Evt. thai-mad. Spørg Sofie om hun vil hjælpe med at arrangere.",
    emoji: "💡",
    type: "ide",
    tag: "Ide",
  },
  {
    id: "n5",
    title: "Emil — kaffe-møde",
    content: "Ny i Aalborg, flyttet fra København. Arbejder som designer. God energi. Vil gerne med til brætspil næste gang.",
    emoji: "☕",
    type: "person",
    tag: "Kontakt",
  },
  {
    id: "n6",
    title: "Fodbold 5-mands",
    content: "Kildeparken er perfekt. Vi var 5 i alt — alle niveauer. Jonas er den faste organisator. Næste gang torsdag.",
    emoji: "⚽",
    type: "event",
    tag: "Sport",
  },
  {
    id: "n7",
    title: "Fantastisk gåtur ved havnen",
    content: "Gik fra Utzon Center til Vestre Fjordpark. Fantastisk udsigt over Limfjorden. Mødte Anna på vejen — vi snakkede om at gøre det igen næste weekend.",
    emoji: "🌊",
    type: "event",
    tag: "Gåtur",
  },
  {
    id: "n8",
    title: "Skal prøve MTB i Hammer Bakker",
    content: "Mads anbefalede Hammer Bakker til mountainbike. Blå rute er god for begyndere, rød rute er mere teknisk. Husk hjelm og ekstra slange.",
    emoji: "🚵",
    type: "ide",
    tag: "Sport",
  },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; labelKey: string }> = {
  event: { bg: "bg-[#4ECDC4]/15", text: "text-[#4ECDC4]", labelKey: "notes.type_experience" },
  person: { bg: "bg-blue-500/15", text: "text-blue-400", labelKey: "notes.type_person" },
  ide: { bg: "bg-amber-500/15", text: "text-amber-400", labelKey: "notes.type_idea" },
};

export default function Noter() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);

  const filtered = DEMO_NOTES.filter((n) => {
    const matchType = !activeType || n.type === activeType;
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div
      className="relative min-h-svh pb-24"
      style={{ background: "#060a0f" }}
      data-testid="noter-page"
    >
      <div className="sticky top-0 z-30 pt-12 pb-3 px-5 flex items-center gap-3" style={{ background: "linear-gradient(to bottom, rgba(6,10,15,0.95) 60%, transparent)" }}>
        <button onClick={() => setLocation("/min-side")} className="w-9 h-9 rounded-full glass-card flex items-center justify-center"><ArrowLeft size={18} className="text-white" /></button>
        <h1 className="text-white text-xl font-serif flex-1" style={{ fontWeight: 400 }}>{t('notes.title')}</h1>
        <button className="w-9 h-9 rounded-full bg-[#4ECDC4] flex items-center justify-center">
          <Plus size={18} className="text-white" />
        </button>
      </div>

      <div className="px-5 mt-2 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder={t('notes.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/8 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]/50"
            data-testid="input-search-notes"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex gap-2">
          {[
            { key: null, labelKey: "notes.filter_all", count: DEMO_NOTES.length },
            { key: "event", labelKey: "notes.filter_experiences", count: DEMO_NOTES.filter(n => n.type === "event").length },
            { key: "person", labelKey: "notes.filter_persons", count: DEMO_NOTES.filter(n => n.type === "person").length },
            { key: "ide", labelKey: "notes.filter_ideas", count: DEMO_NOTES.filter(n => n.type === "ide").length },
          ].map((f) => (
            <button
              key={f.key || "alle"}
              onClick={() => setActiveType(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeType === f.key
                  ? "bg-[#4ECDC4] text-[#0a0f1a]"
                  : "glass-card text-white/50 hover:text-white"
              }`}
            >
              {t(f.labelKey)} ({f.count})
            </button>
          ))}
        </div>

        {/* Notes list */}
        <div className="space-y-3">
          {filtered.map((note) => {
            const colors = TYPE_COLORS[note.type];
            return (
              <div key={note.id} className="glass-card-strong rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0 text-xl`}>
                    {note.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white text-sm font-semibold">{note.title}</h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${colors.bg} ${colors.text}`}>
                        {t(colors.labelKey)}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed">{note.content}</p>
                    <span className="text-white/25 text-xs mt-1.5 block">{note.tag}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <span className="text-3xl">📝</span>
              <p className="text-white/50 text-sm mt-2">{t('notes.no_notes_found')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
