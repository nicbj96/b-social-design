
import { useState } from "react";

const CATEGORIES = [
  {
    key: "aktiv", label: "Aktiv & sport", emoji: "⚽",
    gradient: "from-blue-500 to-blue-800",
    hex: "#3b82f6",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&auto=format",
    subcategories: [
      { key: "fodbold", label: "Fodbold", emoji: "⚽", tags: ["5v5", "7v7", "11v11", "Futsal", "Indendørs", "Udendørs"] },
      { key: "loeb", label: "Løb", emoji: "🏃", tags: ["Parkrun", "Intervalløb", "Trailløb", "Maraton", "5K", "10K", "Ultra"] },
      { key: "fitness", label: "Fitness", emoji: "💪", tags: ["CrossFit", "Styrketræning", "HIIT", "Calisthenics", "Bootcamp", "Funktionel"] },
      { key: "svoemning", label: "Svømning", emoji: "🏊", tags: ["Frisvømning", "Havsvømning", "Masters", "Vinterbad", "Stævne"] },
      { key: "kampsport", label: "Kampsport", emoji: "🥊", tags: ["Boksning", "MMA", "Jiu-Jitsu", "Karate", "Taekwondo", "Judo"] },
      { key: "klatring", label: "Klatring", emoji: "🧗", tags: ["Indendørs", "Udendørs", "Bouldering", "Via Ferrata", "Top-reb"] },
      { key: "tennis", label: "Tennis & padel", emoji: "🎾", tags: ["Tennis", "Padel", "Pickleball", "Squash", "Badminton"] },
      { key: "dans", label: "Dans", emoji: "💃", tags: ["Salsa", "Bachata", "Lindy Hop", "Hip-Hop", "Swing", "Tango", "Zumba"] },
    ]
  },
  {
    key: "natur", label: "Natur & friluftsliv", emoji: "🌿",
    gradient: "from-emerald-500 to-emerald-900",
    hex: "#10b981",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format",
    subcategories: [
      { key: "skov", label: "Skov", emoji: "🌲", tags: ["Bøgeskov", "Nåleskov", "Skovbad", "Svampetur", "Familietur"] },
      { key: "strand", label: "Strand", emoji: "🏖️", tags: ["Nordsø", "Østersø", "Klitter", "Stenrev", "Solnedgang"] },
      { key: "nationalpark", label: "Nationalpark", emoji: "🌿", tags: ["Vadehavet", "Thy", "Mols Bjerge", "Rebild", "Skjoldungernes"] },
      { key: "fiskeri", label: "Fiskeri", emoji: "🎣", tags: ["Lystfiskeri", "Havfiskeri", "Fluefiskeri", "Isfiskeri", "Bræt"] },
      { key: "fuglekiggeri", label: "Fuglekiggeri", emoji: "🐦", tags: ["Trækfugle", "Havørn", "Vadeland", "Hejre", "Strandskade"] },
      { key: "dyrespotting", label: "Dyrespotting", emoji: "🦌", tags: ["Sæler", "Hjorte", "Marsvin", "Vildsvin", "Heste"] },
      { key: "badning", label: "Badning", emoji: "🏊", tags: ["Havnebad", "Søbad", "Strandbad", "Naturpool", "Åbad"] },
    ]
  },
  {
    key: "wellness", label: "Wellness & balance", emoji: "🧘",
    gradient: "from-teal-400 to-teal-800",
    hex: "#14b8a6",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format",
    subcategories: [
      { key: "yoga", label: "Yoga", emoji: "🧘", tags: ["Vinyasa", "Yin Yoga", "Hot Yoga", "Kundalini", "Ashtanga", "Yoga Nidra"] },
      { key: "meditation", label: "Meditation", emoji: "🌸", tags: ["Mindfulness", "Vipassana", "Guidet", "Breathwork", "Loving Kindness"] },
      { key: "sauna", label: "Sauna", emoji: "🧖", tags: ["Finsk sauna", "Infrared", "Dampbad", "Udendørs", "Mobile sauna"] },
      { key: "vinterbadning", label: "Vinterbadning", emoji: "🥶", tags: ["Havn", "Sø", "Hav", "Kilde", "Gruppe", "Solo"] },
      { key: "breathwork", label: "Breathwork", emoji: "🌬️", tags: ["Wim Hof", "Holotropisk", "Somatic", "Box Breathing"] },
      { key: "mindfulness", label: "Mindfulness", emoji: "🌿", tags: ["MBSR", "Skovbad", "Qigong", "Tai Chi", "Retreat"] },
    ]
  },
  {
    key: "vand", label: "Vand & strand", emoji: "🏄",
    gradient: "from-cyan-400 to-blue-800",
    hex: "#06b6d4",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format",
    subcategories: [
      { key: "surfing", label: "Surfing", emoji: "🏄", tags: ["Begynder", "Longboard", "Shortboard", "Bodyboard", "Surf Camp"] },
      { key: "windsurfing", label: "Windsurfing", emoji: "🏄‍♂️", tags: ["Race", "Freestyle", "Freeride", "Wave", "Begynder"] },
      { key: "kitesurfing", label: "Kitesurfing", emoji: "🪁", tags: ["Begynder", "Freestyle", "Wave", "Race", "Foil"] },
      { key: "sup", label: "SUP", emoji: "🛶", tags: ["Yoga-SUP", "Race", "Havtur", "Tur", "Elv"] },
      { key: "dykning", label: "Dykning", emoji: "🤿", tags: ["Open Water", "Apnea", "Vragdyk", "Snorkling", "Freediving"] },
      { key: "sejlsport", label: "Sejlsport", emoji: "⛵", tags: ["Jolle", "Kølbåd", "Catamaran", "Optimist", "Kapsejlads"] },
      { key: "vandski", label: "Vandski & wake", emoji: "🎿", tags: ["Vandski", "Wakeboard", "Wakesurf", "Kneeboard"] },
    ]
  },
  {
    key: "ekstrem", label: "Ekstremsport", emoji: "🪂",
    gradient: "from-orange-500 to-red-900",
    hex: "#f97316",
    image: "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?w=600&auto=format",
    subcategories: [
      { key: "faldskærm", label: "Faldskærm", emoji: "🪂", tags: ["Tandem", "AFF Kursus", "Freefly", "Wingsuit", "Præcision"] },
      { key: "klatring-ekstrem", label: "Ekstrem klatring", emoji: "🧗", tags: ["Multi-pitch", "Is-klatring", "Via Ferrata", "Big Wall", "Soloklim"] },
      { key: "mtb-ekstrem", label: "MTB Ekstrem", emoji: "🚵", tags: ["Downhill", "Enduro", "Freeride", "Dirt Jump", "Slopestyle"] },
      { key: "bungee", label: "Bungee & BASE", emoji: "⚡", tags: ["Bungee Classic", "BASE Jump", "Highline", "Bridge Jump"] },
      { key: "parkour", label: "Parkour", emoji: "🏃", tags: ["Begynder", "Urban", "Naturlig", "Freestyle", "Freerunning"] },
      { key: "ski", label: "Ski & snowboard", emoji: "⛷️", tags: ["Piste", "Off-Piste", "Freestyle", "Freeriding", "Backcountry"] },
      { key: "bmx", label: "BMX", emoji: "🚲", tags: ["Dirt", "Park", "Street", "Flatland", "Race"] },
    ]
  },
  {
    key: "motor", label: "Motor & hjul", emoji: "🏍️",
    gradient: "from-zinc-500 to-zinc-900",
    hex: "#52525b",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&auto=format",
    subcategories: [
      { key: "mctraef", label: "MC-træf", emoji: "🏍️", tags: ["Weekend", "Dagstræf", "Parade", "Rally", "Tourbike", "Custom"] },
      { key: "biltraef", label: "Biltræf", emoji: "🚗", tags: ["Veteran", "Moderne", "Supercar", "JDM", "American", "European"] },
      { key: "trackday", label: "Track days", emoji: "🏁", tags: ["Begynder", "Avanceret", "Motorcykel", "Bil", "Halvdag", "Heldag"] },
      { key: "klassisk", label: "Klassiske biler", emoji: "🏎️", tags: ["Pre-war", "50'erne", "60'erne", "70'erne", "Veteran", "Oldtimer"] },
      { key: "dragrace", label: "Drag racing", emoji: "🔥", tags: ["Street", "Dragstrip", "MC Drag", "Lovlig gade", "Quarter mile"] },
      { key: "drift", label: "Drift", emoji: "💨", tags: ["Begynder", "Pro", "Tandem", "Competition", "Practice Day"] },
      { key: "gokart", label: "Go-kart", emoji: "🏎️", tags: ["Indendørs", "Udendørs", "El-kart", "Benzin", "Teambuilding"] },
      { key: "carscoffee", label: "Cars & Coffee", emoji: "☕", tags: ["Månedlig", "Supercar", "Klassisk", "JDM", "Uformel"] },
    ]
  },
  {
    key: "ture", label: "Ture & eventyr", emoji: "🥾",
    gradient: "from-green-500 to-green-900",
    hex: "#16a34a",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&auto=format",
    subcategories: [
      { key: "vandring", label: "Vandring", emoji: "🥾", tags: ["Dagtur", "Flerdagstur", "Bjergtur", "Pilgrimsrute", "Hærvej", "Camino"] },
      { key: "cykling", label: "Cykelture", emoji: "🚴", tags: ["Landevej", "Gravel", "E-cykel", "Vestkysten", "Bornholm", "Etapeløb"] },
      { key: "mtb", label: "MTB", emoji: "🚵", tags: ["Singletrack", "Begynder", "Teknisk", "Guidet", "Weekendtur"] },
      { key: "kajak", label: "Kajak & SUP", emoji: "🛶", tags: ["Havkajak", "SUP", "Flodkajak", "Dag", "Overnatning", "Kursus"] },
      { key: "geocaching", label: "Geocaching", emoji: "📍", tags: ["Traditionel", "Mystery", "Multi-cache", "Night Cache", "EarthCache"] },
      { key: "orienteringsloeb", label: "Orienteringsløb", emoji: "🗺️", tags: ["Sprint", "Klassisk", "Natorientering", "MTB-O", "Trail-O"] },
      { key: "overlevelse", label: "Bushcraft", emoji: "🏕️", tags: ["Ildtænding", "Shelter", "Vild madlavning", "Navigation", "Sporing"] },
    ]
  },
  {
    key: "mad", label: "Mad & hangouts", emoji: "🍽️",
    gradient: "from-amber-500 to-amber-900",
    hex: "#f59e0b",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format",
    subcategories: [
      { key: "streetfood", label: "Street Food", emoji: "🍜", tags: ["Food Truck", "Marked", "Pop-up", "Asiatisk", "BBQ", "Mexicansk"] },
      { key: "madlavning", label: "Madlavning", emoji: "👩‍🍳", tags: ["Kursus", "Sushi", "Bagning", "Fermentering", "Pop-up dinner", "Grill"] },
      { key: "oelsmagning", label: "Ølsmagning", emoji: "🍺", tags: ["Craft Øl", "Bryggeri", "IPA", "Stout", "Sour", "Smagning"] },
      { key: "vinsmagning", label: "Vinsmagning", emoji: "🍷", tags: ["Naturvin", "Klassisk", "Champagne", "Rødvin", "Hvidvin", "Rosé"] },
      { key: "cafe", label: "Caféer", emoji: "☕", tags: ["Specialty kaffe", "Brunch", "Te-ceremoni", "Barista", "Takeaway", "Hygge"] },
      { key: "restaurant", label: "Restauranter", emoji: "🍽️", tags: ["Dansk", "Japansk", "Indisk", "Vegansk", "Fine Dining", "Sushi"] },
      { key: "foodmarket", label: "Food Markets", emoji: "🏪", tags: ["Streetfood", "Bøndermarked", "Madmarked", "Torvemarked", "Weekend"] },
    ]
  },
  {
    key: "kultur", label: "Oplevelser & kultur", emoji: "🎭",
    gradient: "from-purple-500 to-purple-900",
    hex: "#a855f7",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&auto=format",
    subcategories: [
      { key: "museum", label: "Museer", emoji: "🏛️", tags: ["Kunstmuseum", "Historisk", "Naturhistorie", "Videnskab", "Interaktivt"] },
      { key: "teater", label: "Teater", emoji: "🎭", tags: ["Drama", "Komedie", "Musical", "Improv", "Børneteater", "Opera"] },
      { key: "koncert", label: "Koncerter", emoji: "🎤", tags: ["Rock", "Jazz", "Klassisk", "Pop", "Elektronisk", "Indie", "Hiphop"] },
      { key: "kunst", label: "Kunst", emoji: "🎨", tags: ["Galleri", "Udstilling", "Street Art", "Keramik", "Skulptur", "Fotografi"] },
      { key: "fotografering", label: "Fotografering", emoji: "📸", tags: ["Portræt", "Natur", "Drone", "Gadebilleder", "Makro", "Film"] },
      { key: "kreativt", label: "Kreativt", emoji: "🖌️", tags: ["Maleri", "Tegning", "Keramik", "Strik", "Syning", "Digital kunst"] },
    ]
  },
  {
    key: "communities", label: "Communities & clubs", emoji: "👥",
    gradient: "from-red-500 to-red-900",
    hex: "#dc2626",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format",
    subcategories: [
      { key: "bogklub", label: "Bogklub", emoji: "📚", tags: ["Skønlitteratur", "Krimi", "Fantasy", "Faglitteratur", "Lydbøger"] },
      { key: "braetspil", label: "Brætspil", emoji: "🎲", tags: ["Strategispil", "Party Games", "RPG", "Kortspil", "Warhammer", "D&D"] },
      { key: "gaming", label: "Gaming", emoji: "🎮", tags: ["PC Gaming", "Konsol", "VR", "Esport", "LAN Party", "Retro", "Mobile"] },
      { key: "tech", label: "Tech & coding", emoji: "💻", tags: ["Hackathon", "AI & ML", "Open Source", "Robotik", "Cybersikkerhed"] },
      { key: "startup", label: "Startup", emoji: "🚀", tags: ["Pitch Night", "Demo Day", "Investor Meet", "Startup Weekend", "Scale-up"] },
      { key: "filmaften", label: "Filmklub", emoji: "🎬", tags: ["Dokumentar", "Kortfilm", "Klassikere", "Sci-Fi", "Horror", "Animation"] },
      { key: "ridning", label: "Ridning", emoji: "🐎", tags: ["Begynder", "Springning", "Dressur", "Western", "Ridelejr"] },
    ]
  },
  {
    key: "events", label: "Events & fællesskab", emoji: "🎉",
    gradient: "from-yellow-400 to-yellow-800",
    hex: "#eab308",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&auto=format",
    subcategories: [
      { key: "festival", label: "Festivaler", emoji: "🎪", tags: ["Musikfestival", "Byfest", "Kulturfestival", "Gadefest", "Open Air"] },
      { key: "stand-up", label: "Stand-up", emoji: "🎤", tags: ["Open Mic", "Improv", "Comedy Show", "Tryout", "Professionel"] },
      { key: "quiz", label: "Quiz-aftener", emoji: "🧠", tags: ["Pub Quiz", "Musik Quiz", "Nørd Quiz", "Generel Viden", "Trivia"] },
      { key: "loppemarked", label: "Loppemarkeder", emoji: "🛍️", tags: ["Vintage", "Kræmmermarked", "Brocante", "Vinyl", "Antikviteter"] },
      { key: "faellesspisning", label: "Fællesspisning", emoji: "🍲", tags: ["Middag for fremmede", "Madklub", "Pop-up dinner", "International"] },
      { key: "netvaerk", label: "Netværk", emoji: "🤝", tags: ["Startup", "Business", "After Work", "Speed Networking", "Women in Biz"] },
      { key: "singles", label: "Singles", emoji: "💖", tags: ["Speeddating", "Aktivitetsdating", "Single Hike", "Quiz singler"] },
    ]
  },
  {
    key: "logi", label: "Logi & base", emoji: "🏕️",
    gradient: "from-amber-600 to-amber-900",
    hex: "#b45309",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format",
    subcategories: [
      { key: "shelter", label: "Shelter", emoji: "⛺", tags: ["Primitiv", "Skovly", "Kystly", "Åben", "Platform"] },
      { key: "camping", label: "Camping", emoji: "🏕️", tags: ["Telt", "Autocamping", "Hammock", "Wild Camping", "Festival Camping"] },
      { key: "vandrerhjem", label: "Vandrerhjem", emoji: "🏠", tags: ["Budget", "Hostel", "Dormitory", "Privat rum", "Ungdomsvandrehjem"] },
      { key: "hytter", label: "Hytter", emoji: "🛖", tags: ["Bjerg", "Skov", "Kyst", "Feriehus", "Hytte med sauna"] },
      { key: "glamping", label: "Glamping", emoji: "✨", tags: ["Safari telt", "Treehotel", "Boble-telt", "Yurt", "Containerhotel"] },
      { key: "baal", label: "Bål & overnatning", emoji: "🔥", tags: ["Strandbål", "Skovbål", "Shelter med bål", "Primitiv lejrplads"] },
    ]
  },
  {
    key: "rejser", label: "Rejser & transport", emoji: "🚆",
    gradient: "from-sky-500 to-sky-900",
    hex: "#0284c7",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format",
    subcategories: [
      { key: "tog", label: "Tog", emoji: "🚆", tags: ["InterRail", "Dagtog", "Nattog", "Panoramatog", "Højhastighedstog"] },
      { key: "samkoersel", label: "Samkørsel", emoji: "🚗", tags: ["Pendler", "Weekendtur", "Roadtrip-del", "BlaBlaCar", "Elektrisk"] },
      { key: "cykelruter", label: "Cykelruter", emoji: "🚴", tags: ["Vestkysten", "Bornholm Rundt", "EV-ruter", "E1 Europa", "Kystvejen"] },
      { key: "faerge", label: "Færge", emoji: "⛴️", tags: ["Danmark", "Nordsø", "Østersø", "Øfærge", "Krydstogt"] },
      { key: "roadtrip", label: "Road Trip", emoji: "🛣️", tags: ["Solo", "Gruppe", "Autocamper", "Motorcykel", "Vanlife", "Weekend"] },
      { key: "flydeals", label: "Fly-deals", emoji: "✈️", tags: ["Europa", "Verden", "Weekend city break", "Budget", "Last minute"] },
    ]
  },
];

function TagChip({ label }) {
  const [active, setActive] = useState(false);
  return (
    <button
      onClick={() => setActive(!active)}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
        active
          ? "bg-white text-gray-900 border-white shadow-lg scale-105"
          : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function SubcategoryRow({ sub, catHex }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left"
      >
        <span className="text-lg">{sub.emoji}</span>
        <span className="text-white font-medium text-sm flex-1">{sub.label}</span>
        <span className="text-white/60 text-xs">{sub.tags.length} tags</span>
        <span className={`text-white/60 transition-transform duration-200 ${open ? "rotate-90" : ""}`}>›</span>
      </button>
      {open && (
        <div className="mt-1 ml-4 flex flex-wrap gap-1.5 pb-2">
          {sub.tags.map(tag => <TagChip key={tag} label={tag} />)}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ cat, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${open ? "col-span-1 md:col-span-2" : ""}`}
      style={{ background: `linear-gradient(135deg, ${cat.hex}cc, ${cat.hex}22)` }}
    >
      {/* Header */}
      <div
        className="relative cursor-pointer select-none"
        onClick={() => setOpen(!open)}
        style={{ minHeight: open ? "120px" : "180px" }}
      >
        <img
          src={cat.image}
          alt={cat.label}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${cat.gradient} opacity-70`} />
        <div className="relative z-10 p-5 flex flex-col justify-end h-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl mb-1">{cat.emoji}</div>
              <div className="text-white font-bold text-lg leading-tight">{cat.label}</div>
              <div className="text-white/60 text-xs mt-0.5">{cat.subcategories.length} underkategorier</div>
            </div>
            <div className={`w-9 h-9 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
              <span className="text-white text-xl font-light">+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded subcategories */}
      {open && (
        <div className="p-4 pt-2" style={{ background: `${cat.hex}33` }}>
          <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3 px-1">
            Vælg underkategori
          </div>
          {cat.subcategories.map(sub => (
            <SubcategoryRow key={sub.key} sub={sub} catHex={cat.hex} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TagTreeConcept() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid"); // grid | tree

  const filtered = CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategories.some(s =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="px-6 pt-10 pb-6 text-center max-w-2xl mx-auto">
        <div className="text-5xl mb-3">🗂️</div>
        <h1 className="text-3xl font-black tracking-tight mb-2">B-Social Tag Tree</h1>
        <p className="text-gray-400 text-sm mb-6">
          13 kategorier · 89 underkategorier · 400+ tags<br/>
          Klik en kategori → fold underkategorier ud → vælg tags
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mb-6">
          {[
            ["63.5K", "Events i DB"],
            ["5.7K", "Seed events"],
            ["397", "Steder"],
            ["176", "Aktiviteter"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-white font-black text-xl">{n}</div>
              <div className="text-gray-500 text-xs">{l}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søg kategori eller tag..."
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-6 text-xs text-gray-500 px-4">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600"/><span>Kategori (meta)</span></div>
        <div className="flex items-center gap-1.5"><span>›</span><span>Underkategori</span></div>
        <div className="flex items-center gap-1.5"><div className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20"/><span>Tag (klikbar)</span></div>
      </div>

      {/* Grid */}
      <div className="px-4 pb-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
        {filtered.map((cat, i) => (
          <CategoryCard key={cat.key} cat={cat} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-20">
          Ingen resultater for "{search}"
        </div>
      )}
    </div>
  );
}
