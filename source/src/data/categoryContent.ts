/* ═══════════════════════════════════════════════
   B-Social — Rig data per kategori
   Steder, aktiviteter og forslag der matcher subkategorier
   Alt er reelle steder i Danmark (primært Nordjylland/Aalborg)
   ═══════════════════════════════════════════════ */

export interface CategoryPlace {
  id: string;
  name: string;
  description: string;
  location: string;
  distance: string;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  category: string;        // parent category key
  subcategory: string;     // subcategory key
  price?: number;
  isFree?: boolean;
}

export interface CategoryActivity {
  id: string;
  title: string;
  description: string;
  emoji: string;
  image: string;
  location: string;
  distance: string;
  spots: { current: number; total: number };
  tags: string[];
  category: string;
  subcategory: string;
  price: number;
}

export interface SubcategoryInfo {
  key: string;
  label: string;
  emoji: string;
  description: string;       // kort intro til subkategorien
  heroImage: string;
  placesCount: number;       // "X steder i nærheden"
  activeUsers: number;       // "Y aktive brugere"
}

/* ═══ SPORT ═══ */
const SPORT_PLACES: CategoryPlace[] = [
  // Fodbold
  { id: "sp-1", name: "Aalborg Portland Park", description: "AaB's hjemmebane — altid gang i den på kampdage", location: "Hornevej 2, Aalborg", distance: "1.2 km", image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400", rating: 4.5, reviews: 342, tags: ["fodbold", "stadion", "AaB"], category: "sport", subcategory: "fodbold", isFree: true },
  { id: "sp-2", name: "Gigantium Fodbold", description: "Indendørs kunstgræs — perfekt til vinterfodbold", location: "Willy Brandts Vej 31, Aalborg", distance: "3.1 km", image: "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=400", rating: 4.3, reviews: 89, tags: ["fodbold", "indendørs", "kunstgræs"], category: "sport", subcategory: "fodbold", price: 100 },
  { id: "sp-3", name: "Østre Anlæg Boldbaner", description: "Åbne græsbaner midt i byen — drop-in fodbold hele sommeren", location: "Østre Anlæg, Aalborg", distance: "0.8 km", image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400", rating: 4.0, reviews: 56, tags: ["fodbold", "gratis", "drop-in"], category: "sport", subcategory: "fodbold", isFree: true },
  // Cykling
  { id: "sp-4", name: "Hammer Bakker MTB", description: "Nordjyllands bedste singletrack — 15 km spor i bøgeskov", location: "Hammer Bakker, Vodskov", distance: "8 km", image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400", rating: 4.8, reviews: 234, tags: ["cykling", "mtb", "skov"], category: "sport", subcategory: "cykling", isFree: true },
  { id: "sp-5", name: "Fjordstien Cykelrute", description: "Flad sti langs Limfjorden — perfekt til racercykel eller hygge", location: "Aalborg → Nibe", distance: "2 km start", image: "https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=400", rating: 4.6, reviews: 178, tags: ["cykling", "landevej", "natur"], category: "sport", subcategory: "cykling", isFree: true },
  { id: "sp-6", name: "Bike & Co Aalborg", description: "Cykelværksted + gruppeture hver onsdag", location: "Vesterbro 68, Aalborg", distance: "0.5 km", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400", rating: 4.4, reviews: 67, tags: ["cykling", "værksted", "fællesskab"], category: "sport", subcategory: "cykling" },
  // Løb
  { id: "sp-7", name: "Aalborg Halvmarathon Rute", description: "Den officielle rute — løb den selv eller med gruppen", location: "Kildeparken, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400", rating: 4.7, reviews: 456, tags: ["løb", "halvmarathon", "rute"], category: "sport", subcategory: "loeb", isFree: true },
  { id: "sp-8", name: "Skovbakken Trail Run", description: "Kuperet skovsti med naturforhindringer — trail for alle niveauer", location: "Mølleparken, Aalborg", distance: "1.5 km", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400", rating: 4.5, reviews: 123, tags: ["løb", "trail", "skov"], category: "sport", subcategory: "loeb", isFree: true },
  // Yoga
  { id: "sp-9", name: "Yoga i Kildeparken", description: "Gratis udendørs yoga hver søndag morgen i parken", location: "Kildeparken, Aalborg", distance: "0.4 km", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400", rating: 4.9, reviews: 289, tags: ["yoga", "gratis", "udendørs"], category: "sport", subcategory: "yoga", isFree: true },
  { id: "sp-10", name: "Hot Yoga Aalborg", description: "Bikram-inspireret — 38 grader, fuld sved, dyb stretch", location: "Boulevarden 13, Aalborg", distance: "0.6 km", image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400", rating: 4.6, reviews: 178, tags: ["yoga", "hot yoga", "studio"], category: "sport", subcategory: "yoga", price: 120 },
  // Svømning
  { id: "sp-11", name: "Haraldslund Svømmeland", description: "50m bane, wellness og vandrutsjebaner", location: "Haraldsgade, Aalborg", distance: "2 km", image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400", rating: 4.4, reviews: 567, tags: ["svømning", "wellness", "vandland"], category: "sport", subcategory: "svoemning", price: 65 },
  { id: "sp-12", name: "Vestre Fjordpark", description: "Havnebad med sauna og udsigt — Danmarks bedste fjordbad", location: "Vestre Fjordvej, Aalborg", distance: "3 km", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400", rating: 4.8, reviews: 890, tags: ["svømning", "friluft", "sauna"], category: "sport", subcategory: "svoemning", isFree: true },
  // Tennis
  { id: "sp-13", name: "Aalborg Tennisklub", description: "6 udebaner + 3 indebaner — drop-in og holdtræning", location: "Sohngaardsholmsvej, Aalborg", distance: "2.5 km", image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400", rating: 4.3, reviews: 89, tags: ["tennis", "baner", "klub"], category: "sport", subcategory: "tennis", price: 50 },
];

const SPORT_ACTIVITIES: CategoryActivity[] = [
  { id: "sa-1", title: "Drop-in fodbold 5-mands", description: "Vi mødes og spiller — alle niveauer. Bare mød op", emoji: "⚽", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400", location: "Østre Anlæg", distance: "0.8 km", spots: { current: 6, total: 10 }, tags: ["fodbold", "drop-in"], category: "sport", subcategory: "fodbold", price: 0 },
  { id: "sa-2", title: "MTB morgentur i Hammer Bakker", description: "Begyndervenlig MTB-tur med kaffe bagefter", emoji: "🚵", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400", location: "Hammer Bakker", distance: "8 km", spots: { current: 3, total: 8 }, tags: ["cykling", "mtb", "morgen"], category: "sport", subcategory: "cykling", price: 0 },
  { id: "sa-3", title: "Løbeklub: 5 km i eget tempo", description: "Alle hastigheder velkomne — vi løber sammen", emoji: "🏃", image: "https://images.unsplash.com/photo-1461896836934-bd45ba3ff2b3?w=400", location: "Kildeparken", distance: "0.3 km", spots: { current: 8, total: 15 }, tags: ["løb", "fællesskab"], category: "sport", subcategory: "loeb", price: 0 },
  { id: "sa-4", title: "Yoga i parken — søndag", description: "Flow yoga udendørs med Sara. Medbring egen måtte", emoji: "🧘", image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400", location: "Kildeparken", distance: "0.4 km", spots: { current: 12, total: 20 }, tags: ["yoga", "udendørs"], category: "sport", subcategory: "yoga", price: 0 },
  { id: "sa-5", title: "Svømmeholds for voksne", description: "Forbedre din teknik med instruktør — tirsdage", emoji: "🏊", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400", location: "Haraldslund", distance: "2 km", spots: { current: 5, total: 12 }, tags: ["svømning", "hold"], category: "sport", subcategory: "svoemning", price: 65 },
  { id: "sa-6", title: "Tennis for begyndere", description: "Lær at serve og return — udstyr udlånes", emoji: "🎾", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400", location: "Aalborg Tennisklub", distance: "2.5 km", spots: { current: 2, total: 6 }, tags: ["tennis", "begynder"], category: "sport", subcategory: "tennis", price: 0 },
  { id: "sa-7", title: "Gravel bike tur til Nibe", description: "55 km grustur langs fjorden — medbringe eget MTB/gravel", emoji: "🚴", image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400", location: "Aalborg → Nibe", distance: "Start: 0 km", spots: { current: 4, total: 10 }, tags: ["cykling", "gravel", "lang tur"], category: "sport", subcategory: "cykling", price: 0 },
  { id: "sa-8", title: "Interval-løb på stadion", description: "Fartleg og intervaller — god stemning, hårdt arbejde", emoji: "🏃", image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400", location: "Aalborg Atletikstadion", distance: "1 km", spots: { current: 9, total: 20 }, tags: ["løb", "interval", "speed"], category: "sport", subcategory: "loeb", price: 0 },
];

/* ═══ KULTUR ═══ */
const KULTUR_PLACES: CategoryPlace[] = [
  { id: "ku-1", name: "Kunsten Museum", description: "Alvar Aalto-bygning med moderne kunst og skulpturpark", location: "Kong Christians Allé, Aalborg", distance: "1.5 km", image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400", rating: 4.7, reviews: 1234, tags: ["museum", "kunst", "arkitektur"], category: "kultur", subcategory: "museum", price: 120 },
  { id: "ku-2", name: "Utzon Center", description: "Jørn Utzons sidste værk — design, arkitektur og fjordudsigt", location: "Slotspladsen 4, Aalborg", distance: "0.8 km", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400", rating: 4.6, reviews: 890, tags: ["museum", "arkitektur", "design"], category: "kultur", subcategory: "museum", price: 100 },
  { id: "ku-3", name: "Aalborg Historiske Museum", description: "Vikinger, middelalder og Aalborgs historie", location: "Algade 48, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400", rating: 4.3, reviews: 345, tags: ["museum", "historie", "viking"], category: "kultur", subcategory: "historie", isFree: true },
  { id: "ku-4", name: "Aalborg Teater", description: "Et af Danmarks ældste teatre — drama, komedie og musikal", location: "Jernbanegade 27, Aalborg", distance: "0.5 km", image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400", rating: 4.8, reviews: 678, tags: ["teater", "drama", "forestilling"], category: "kultur", subcategory: "teater", price: 180 },
  { id: "ku-5", name: "Nordkraft Kulturhus", description: "Biograf, teater, musik og kunst under ét tag", location: "Kjellerups Torv 5, Aalborg", distance: "0.4 km", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400", rating: 4.5, reviews: 567, tags: ["kulturhus", "biograf", "koncert"], category: "kultur", subcategory: "kunst" },
  { id: "ku-6", name: "Lindholm Høje Museum", description: "Vikingegravplads — en af Danmarks vigtigste arkæologiske fund", location: "Vendilavej, Nørresundby", distance: "4 km", image: "https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=400", rating: 4.7, reviews: 456, tags: ["historie", "vikinger", "museum"], category: "kultur", subcategory: "historie", price: 70 },
  { id: "ku-7", name: "Streetart i Karolinelund", description: "Farverige vægmalerier og graffiti — åben udstilling", location: "Karolinelund, Aalborg", distance: "1 km", image: "https://images.unsplash.com/photo-1567093592297-fbe748413285?w=400", rating: 4.2, reviews: 89, tags: ["kunst", "streetart", "gratis"], category: "kultur", subcategory: "kunst", isFree: true },
  { id: "ku-8", name: "Gallo-Romersk Museum", description: "Underjordisk museum under Budolfi Kirke — middelalder", location: "Algade, Aalborg", distance: "0.2 km", image: "https://images.unsplash.com/photo-1554303486-cb4b90a27751?w=400", rating: 4.1, reviews: 123, tags: ["museum", "historie", "arkæologi"], category: "kultur", subcategory: "historie", isFree: true },
];

const KULTUR_ACTIVITIES: CategoryActivity[] = [
  { id: "ka-1", title: "Guidet byvandring: Aalborgs historie", description: "2 timers vandring gennem 1000 års historie", emoji: "📜", image: "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?w=400", location: "Budolfi Plads", distance: "0.2 km", spots: { current: 8, total: 15 }, tags: ["historie", "byvandring"], category: "kultur", subcategory: "historie", price: 0 },
  { id: "ka-2", title: "Kunstworkshop: Akvarelmaling", description: "Lær akvarelteknik med lokale kunstnere", emoji: "🎨", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400", location: "Nordkraft", distance: "0.4 km", spots: { current: 4, total: 10 }, tags: ["kunst", "workshop", "kreativt"], category: "kultur", subcategory: "kunst", price: 150 },
  { id: "ka-3", title: "Teater: Improvisationsaften", description: "Drop-in impro — ingen erfaring nødvendig", emoji: "🎭", image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400", location: "Aalborg Teater", distance: "0.5 km", spots: { current: 6, total: 12 }, tags: ["teater", "impro", "sjovt"], category: "kultur", subcategory: "teater", price: 0 },
  { id: "ka-4", title: "Museum efter mørkets frembrud", description: "Kunsten åbner for natudstilling med vin og musik", emoji: "🏛️", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400", location: "Kunsten Museum", distance: "1.5 km", spots: { current: 15, total: 40 }, tags: ["museum", "aften", "vin"], category: "kultur", subcategory: "museum", price: 150 },
];

/* ═══ NATUR ═══ */
const NATUR_PLACES: CategoryPlace[] = [
  { id: "na-1", name: "Hammer Bakker", description: "Bakket bøgeskov med 15 km MTB-spor og vandresti", location: "Vodskov", distance: "8 km", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400", rating: 4.8, reviews: 567, tags: ["vandring", "mtb", "skov"], category: "natur", subcategory: "vandring", isFree: true },
  { id: "na-2", name: "Rold Skov — Troldeskoven", description: "Danmarks eneste sprækkedal — mossede klippeformationer", location: "Rold Skov", distance: "25 km", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400", rating: 4.9, reviews: 890, tags: ["vandring", "natur", "eventyr"], category: "natur", subcategory: "vandring", isFree: true },
  { id: "na-3", name: "Lille Vildmose", description: "Nordjyllands vildeste natur — krondyr, ørne og højmose", location: "Lille Vildmose Center", distance: "30 km", image: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400", rating: 4.7, reviews: 345, tags: ["dyrespot", "natur", "fugletårn"], category: "natur", subcategory: "dyrespot", isFree: true },
  { id: "na-4", name: "Egholm Ø", description: "Tag færgen til den bilfrie ø — køer, strand og ro", location: "Egholm Færgeleje, Aalborg", distance: "3 km", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", rating: 4.6, reviews: 456, tags: ["natur", "ø", "strand"], category: "natur", subcategory: "badning", price: 40 },
  { id: "na-5", name: "Aalborg Fjordsti", description: "Flad sti langs Limfjorden — perfekt til hundeluftning", location: "Aalborg Vestby", distance: "1 km", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", rating: 4.4, reviews: 234, tags: ["hundetur", "gåtur", "fjord"], category: "natur", subcategory: "hund", isFree: true },
  { id: "na-6", name: "Hals Havn — Fiskeplads", description: "Havfiskeri fra molen + sild i sæsonen", location: "Hals Havn", distance: "35 km", image: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=400", rating: 4.3, reviews: 89, tags: ["fiskeri", "hav", "mole"], category: "natur", subcategory: "fiskeri", isFree: true },
  { id: "na-7", name: "Shelter ved Lindenborg Å", description: "Primitiv overnatning i skoven — bålplads inkluderet", location: "Rebild Bakker", distance: "20 km", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400", rating: 4.5, reviews: 67, tags: ["shelter", "overnatning", "bål"], category: "natur", subcategory: "shelter", isFree: true },
  { id: "na-8", name: "Vestre Fjordpark Strand", description: "Populær badestrand med sauna og legeplads", location: "Vestre Fjordvej, Aalborg", distance: "3 km", image: "https://images.unsplash.com/photo-1519314793478-81a89b69502e?w=400", rating: 4.8, reviews: 1200, tags: ["badning", "strand", "sauna"], category: "natur", subcategory: "badning", isFree: true },
  { id: "na-9", name: "Rævedammen MTB Trail", description: "Teknisk singletrack i Hammer Bakker — for øvede", location: "Hammer Bakker", distance: "8 km", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400", rating: 4.6, reviews: 145, tags: ["mtb", "trail", "teknisk"], category: "natur", subcategory: "mtb", isFree: true },
  { id: "na-10", name: "Nibe Fjord Fuglereservat", description: "Vigtig rasteplads for trækfugle — tårn og skjul", location: "Nibe", distance: "20 km", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400", rating: 4.5, reviews: 78, tags: ["fugle", "natur", "fuglekiggeri"], category: "natur", subcategory: "dyrespot", isFree: true },
];

const NATUR_ACTIVITIES: CategoryActivity[] = [
  { id: "naa-1", title: "Guidet vandring i Rold Skov", description: "3 timers tur med skovguide — lær om floraen", emoji: "🥾", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400", location: "Rold Skov", distance: "25 km", spots: { current: 5, total: 12 }, tags: ["vandring", "guidet"], category: "natur", subcategory: "vandring", price: 0 },
  { id: "naa-2", title: "Hundetur langs fjorden", description: "Social gåtur med hunde — alle racer velkomne", emoji: "🐕", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400", location: "Fjordstien, Aalborg", distance: "1 km", spots: { current: 4, total: 8 }, tags: ["hundetur", "social"], category: "natur", subcategory: "hund", price: 0 },
  { id: "naa-3", title: "Fjordfiskeri fra kajak", description: "Fisketur på Limfjorden i kajak — udstyr inkluderet", emoji: "🎣", image: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=400", location: "Aalborg Kajakklub", distance: "2 km", spots: { current: 2, total: 4 }, tags: ["fiskeri", "kajak"], category: "natur", subcategory: "fiskeri", price: 200 },
  { id: "naa-4", title: "Shelter-overnatning + bål", description: "En nat i skoven — vi laver mad over bål", emoji: "⛺", image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400", location: "Rebild Bakker", distance: "20 km", spots: { current: 3, total: 6 }, tags: ["shelter", "bål", "overnatning"], category: "natur", subcategory: "shelter", price: 0 },
  { id: "naa-5", title: "Fuglekiggeri i Lille Vildmose", description: "Tidlig morgentur — trane, ørn og krondyr", emoji: "🦌", image: "https://images.unsplash.com/photo-1557008075-7f2c5b7825c6?w=400", location: "Lille Vildmose", distance: "30 km", spots: { current: 6, total: 10 }, tags: ["dyrespot", "fugle", "morgen"], category: "natur", subcategory: "dyrespot", price: 0 },
  { id: "naa-6", title: "MTB Night Ride", description: "Aften-MTB med lygter i Hammer Bakker", emoji: "🚵", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400", location: "Hammer Bakker", distance: "8 km", spots: { current: 7, total: 12 }, tags: ["mtb", "aften", "eventyr"], category: "natur", subcategory: "mtb", price: 0 },
];

/* ═══ MUSIK ═══ */
const MUSIK_PLACES: CategoryPlace[] = [
  { id: "mu-1", name: "Musikkens Hus", description: "Nordjyllands store koncertsal — klassisk, jazz og pop", location: "Musikkens Plads 1, Aalborg", distance: "0.6 km", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400", rating: 4.8, reviews: 1456, tags: ["koncert", "klassisk", "jazz"], category: "musik", subcategory: "koncert" },
  { id: "mu-2", name: "Skråen", description: "Intimate spillested i Nordkraft — rock, indie, hiphop", location: "Nordkraft, Aalborg", distance: "0.4 km", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", rating: 4.7, reviews: 789, tags: ["koncert", "rock", "indie"], category: "musik", subcategory: "koncert" },
  { id: "mu-3", name: "1000Fryd", description: "Selvdrevet spillested med punksjæl — koncerter og DJ-aftener", location: "Kattesundet 10, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400", rating: 4.5, reviews: 456, tags: ["koncert", "punk", "undergound"], category: "musik", subcategory: "koncert" },
  { id: "mu-4", name: "Cafe Parasollen — Jazz", description: "Intimt jazzmiljø i kælderen — live jazz hver fredag", location: "Borgergade 3, Aalborg", distance: "0.2 km", image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400", rating: 4.6, reviews: 234, tags: ["jazz", "café", "live musik"], category: "musik", subcategory: "jazz" },
  { id: "mu-5", name: "Studenterhuset Jam Night", description: "Åben scene — medbringe instrument og jam med", location: "Studenterhuset, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", rating: 4.4, reviews: 167, tags: ["jam", "åben scene", "studerende"], category: "musik", subcategory: "jam" },
  { id: "mu-6", name: "Aalborg Kongres & Kultur Center", description: "Store navne og festivaler under tag", location: "Europa Plads 4, Aalborg", distance: "0.7 km", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400", rating: 4.5, reviews: 890, tags: ["festival", "koncert", "stor"], category: "musik", subcategory: "festival" },
];

const MUSIK_ACTIVITIES: CategoryActivity[] = [
  { id: "ma-1", title: "Jam Night på Studenterhuset", description: "Tag dit instrument med — alle genrer velkomne", emoji: "🎸", image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400", location: "Studenterhuset", distance: "0.3 km", spots: { current: 5, total: 15 }, tags: ["jam", "musik", "åben"], category: "musik", subcategory: "jam", price: 0 },
  { id: "ma-2", title: "Jazz i kælderen — Parasollen", description: "Live trio + vin. Fredagsklassiker i Aalborg", emoji: "🎷", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400", location: "Cafe Parasollen", distance: "0.2 km", spots: { current: 12, total: 30 }, tags: ["jazz", "live", "vin"], category: "musik", subcategory: "jazz", price: 50 },
  { id: "ma-3", title: "Sangskriver-workshop", description: "Lær at skrive en sang på 3 timer — ingen erfaring nødvendig", emoji: "🎤", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400", location: "Nordkraft", distance: "0.4 km", spots: { current: 3, total: 8 }, tags: ["sangskrivning", "workshop"], category: "musik", subcategory: "koncert", price: 0 },
];

/* ═══ MAD & DRIKKE ═══ */
const MAD_PLACES: CategoryPlace[] = [
  { id: "md-1", name: "Café Nordkraft", description: "Trendy café med brunch, kaffe og coworking-vibe", location: "Nordkraft, Aalborg", distance: "0.4 km", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400", rating: 4.5, reviews: 567, tags: ["café", "brunch", "kaffe"], category: "mad", subcategory: "cafe" },
  { id: "md-2", name: "Street Food Aalborg", description: "10+ madboder fra hele verden under ét tag", location: "Nytorv, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", rating: 4.4, reviews: 890, tags: ["streetfood", "international", "uformelt"], category: "mad", subcategory: "streetfood" },
  { id: "md-3", name: "Mortens Kro", description: "Michelinanbefalet — ny nordisk med lokal touch", location: "Morten Pedersens Gade 4", distance: "0.5 km", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400", rating: 4.8, reviews: 234, tags: ["restaurant", "nordisk", "fine dining"], category: "mad", subcategory: "restaurant", price: 450 },
  { id: "md-4", name: "Vinhus Nytorv", description: "100+ vine fra hele verden — smagning hver torsdag", location: "Nytorv, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400", rating: 4.6, reviews: 178, tags: ["vin", "smagning", "bar"], category: "mad", subcategory: "vinbar", price: 200 },
  { id: "md-5", name: "Aalborg Ost & Delikatesse", description: "Specialost, charcuteri og lokale produkter", location: "Algade, Aalborg", distance: "0.2 km", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400", rating: 4.5, reviews: 89, tags: ["delikatesse", "ost", "lokalt"], category: "mad", subcategory: "madmarked" },
  { id: "md-6", name: "Fru Jensen — Kaffe & Kage", description: "Hyggelig kaffebar med hjemmebagt — Aalborgs bedste kanelbolle", location: "Bispensgade, Aalborg", distance: "0.1 km", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400", rating: 4.7, reviews: 456, tags: ["café", "kage", "hygge"], category: "mad", subcategory: "cafe" },
];

const MAD_ACTIVITIES: CategoryActivity[] = [
  { id: "mda-1", title: "Kaffesmagning: Ethiopia vs Colombia", description: "Lær forskel på specialty kaffe — gratis prøver", emoji: "☕", image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400", location: "Café Nordkraft", distance: "0.4 km", spots: { current: 6, total: 10 }, tags: ["kaffe", "smagning"], category: "mad", subcategory: "cafe", price: 0 },
  { id: "mda-2", title: "Street Food Tour Aalborg", description: "Smag 5 boder med lokal guide — historier + mad", emoji: "🍜", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", location: "Nytorv", distance: "0.3 km", spots: { current: 4, total: 8 }, tags: ["streetfood", "tour", "guide"], category: "mad", subcategory: "streetfood", price: 250 },
  { id: "mda-3", title: "Vinsmagning: Franske klassikere", description: "6 vine + ost. Lær at smage som en sommelier", emoji: "🍷", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400", location: "Vinhus Nytorv", distance: "0.3 km", spots: { current: 8, total: 15 }, tags: ["vin", "smagning", "fransk"], category: "mad", subcategory: "vinbar", price: 350 },
  { id: "mda-4", title: "Madklub: Thai hjemmelavet", description: "Vi laver thai-mad sammen i fælles køkken", emoji: "🍽️", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400", location: "Nordkraft Køkken", distance: "0.4 km", spots: { current: 3, total: 6 }, tags: ["madklub", "thai", "fælles"], category: "mad", subcategory: "restaurant", price: 100 },
];

/* ═══ SPIL ═══ */
const SPIL_PLACES: CategoryPlace[] = [
  { id: "spi-1", name: "Brætspilscaféen Aalborg", description: "500+ spil til rådighed — drop-in eller book bord", location: "Vesterbro, Aalborg", distance: "0.5 km", image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400", rating: 4.7, reviews: 345, tags: ["brætspil", "café", "hygge"], category: "spil", subcategory: "braetspil" },
  { id: "spi-2", name: "Locked Aalborg — Escape Room", description: "4 rum med forskellige temaer — kan I slippe ud?", location: "Algade, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400", rating: 4.6, reviews: 567, tags: ["escape room", "puslespil", "hold"], category: "spil", subcategory: "escape", price: 200 },
  { id: "spi-3", name: "Quiz Night — Irish House", description: "Pub quiz hver onsdag — hold på max 6 personer", location: "Jomfru Ane Gade, Aalborg", distance: "0.2 km", image: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400", rating: 4.4, reviews: 234, tags: ["quiz", "pub", "social"], category: "spil", subcategory: "quiz" },
  { id: "spi-4", name: "POWER Esport Lounge", description: "Gaming stole, skærme og turneringer — PC og konsol", location: "Friis Shoppingcenter", distance: "0.4 km", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400", rating: 4.3, reviews: 189, tags: ["esport", "gaming", "turnering"], category: "spil", subcategory: "esport", price: 50 },
  { id: "spi-5", name: "Dungeons & Dragons Guild", description: "Rollespilsgrupper der mødes fast — nye spillere velkomne", location: "Studenterhuset, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=400", rating: 4.8, reviews: 78, tags: ["rollespil", "D&D", "fantasy"], category: "spil", subcategory: "braetspil", isFree: true },
];

const SPIL_ACTIVITIES: CategoryActivity[] = [
  { id: "spa-1", title: "Brætspilsaften: Settlers + snacks", description: "Vi tager spil med — du tager snacks med", emoji: "🎲", image: "https://images.unsplash.com/photo-1606503153255-59d8b2e4b0c4?w=400", location: "Brætspilscaféen", distance: "0.5 km", spots: { current: 3, total: 6 }, tags: ["brætspil", "aften"], category: "spil", subcategory: "braetspil", price: 0 },
  { id: "spa-2", title: "Escape Room Challenge", description: "Hold mod hold — hvem løser gåden først?", emoji: "🔐", image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400", location: "Locked Aalborg", distance: "0.3 km", spots: { current: 4, total: 8 }, tags: ["escape", "konkurrence"], category: "spil", subcategory: "escape", price: 200 },
  { id: "spa-3", title: "Quiz-aften: Pop Culture Edition", description: "Film, serier og musik — kan du det?", emoji: "🧩", image: "https://images.unsplash.com/photo-1546427660-eb346c344ba5?w=400", location: "Irish House", distance: "0.2 km", spots: { current: 12, total: 30 }, tags: ["quiz", "pop culture"], category: "spil", subcategory: "quiz", price: 0 },
  { id: "spa-4", title: "FIFA Turnering", description: "1v1 bracket — præmie til vinderen", emoji: "🎮", image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400", location: "POWER Esport", distance: "0.4 km", spots: { current: 8, total: 16 }, tags: ["esport", "fifa", "turnering"], category: "spil", subcategory: "esport", price: 50 },
];

/* ═══ KREATIVT ═══ */
const KREATIVT_PLACES: CategoryPlace[] = [
  { id: "kr-1", name: "Nordkraft Atelier", description: "Åbent værksted med maleri, keramik og tekstil", location: "Nordkraft, Aalborg", distance: "0.4 km", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400", rating: 4.6, reviews: 234, tags: ["kunst", "værksted", "keramik"], category: "kreativt", subcategory: "kunst" },
  { id: "kr-2", name: "Fotoklubben Aalborg", description: "Mødested for fotografer — udstillinger og fotowalk", location: "Vesterbro, Aalborg", distance: "0.5 km", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400", rating: 4.4, reviews: 89, tags: ["foto", "klub", "udstilling"], category: "kreativt", subcategory: "fotografering" },
  { id: "kr-3", name: "Maker Space Aalborg", description: "3D-print, lasercutter og elektronik-værksted", location: "Karolinelund, Aalborg", distance: "1 km", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400", rating: 4.5, reviews: 123, tags: ["maker", "3d-print", "DIY"], category: "kreativt", subcategory: "haandvaerk" },
  { id: "kr-4", name: "Keramik Aalborg", description: "Dreje, glasere, brænde — kurser for alle niveauer", location: "Reberbansgade, Aalborg", distance: "0.6 km", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400", rating: 4.7, reviews: 178, tags: ["keramik", "kursus", "håndværk"], category: "kreativt", subcategory: "keramik", price: 350 },
  { id: "kr-5", name: "Skrivegruppen — Nordkraft", description: "Mødested for skribenter — deling og feedback", location: "Nordkraft", distance: "0.4 km", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400", rating: 4.3, reviews: 45, tags: ["skrivning", "gruppe", "kreativt"], category: "kreativt", subcategory: "skrivning", isFree: true },
];

const KREATIVT_ACTIVITIES: CategoryActivity[] = [
  { id: "kra-1", title: "Fotowalk: Aalborg i gyldent lys", description: "Guidet fotowalk ved solnedgang — alle kameraer velkomne", emoji: "📸", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400", location: "Havnefronten", distance: "0.5 km", spots: { current: 4, total: 10 }, tags: ["foto", "fotowalk", "solnedgang"], category: "kreativt", subcategory: "fotografering", price: 0 },
  { id: "kra-2", title: "Keramik: Lær at dreje", description: "2 timer ved drejeskiven — tag din skål med hjem", emoji: "🏺", image: "https://images.unsplash.com/photo-1556122071-e404cb6f31c0?w=400", location: "Keramik Aalborg", distance: "0.6 km", spots: { current: 2, total: 6 }, tags: ["keramik", "workshop"], category: "kreativt", subcategory: "keramik", price: 350 },
  { id: "kra-3", title: "Skrivegruppe: Flash Fiction", description: "Skriv en historie på 500 ord — del den med gruppen", emoji: "✍️", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400", location: "Nordkraft", distance: "0.4 km", spots: { current: 3, total: 8 }, tags: ["skrivning", "kreativt"], category: "kreativt", subcategory: "skrivning", price: 0 },
  { id: "kra-4", title: "DIY Workshop: Byg en højtaler", description: "Lodde, samle og teste — du går hjem med en højtaler", emoji: "🔨", image: "https://images.unsplash.com/photo-1563520240344-52b067aa5f84?w=400", location: "Maker Space", distance: "1 km", spots: { current: 3, total: 6 }, tags: ["DIY", "elektronik", "maker"], category: "kreativt", subcategory: "haandvaerk", price: 200 },
];

/* ═══ FITNESS ═══ */
const FITNESS_PLACES: CategoryPlace[] = [
  { id: "fi-1", name: "CrossFit Aalborg", description: "WODs, olympic lifts og community — prøvetime gratis", location: "Østhavnen, Aalborg", distance: "2 km", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", rating: 4.7, reviews: 345, tags: ["crossfit", "styrke", "community"], category: "fitness", subcategory: "crossfit", price: 150 },
  { id: "fi-2", name: "Aalborg Bokseklub", description: "Boksning for alle — fra nybegynder til kamp", location: "Kastetvej, Aalborg", distance: "1.5 km", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400", rating: 4.6, reviews: 178, tags: ["boksning", "kampsport", "træning"], category: "fitness", subcategory: "kampsport" },
  { id: "fi-3", name: "Vinterbadeklubben Aalborg", description: "Isbad + sauna ved fjorden — ren terapi", location: "Vestre Fjordpark", distance: "3 km", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400", rating: 4.9, reviews: 456, tags: ["vinterbadning", "sauna", "koldt"], category: "fitness", subcategory: "vinterbadning", isFree: true },
  { id: "fi-4", name: "Aalborg Klatreklub", description: "Indendørs bouldering og toprope — kurser for alle", location: "Sohngaardsholmsvej, Aalborg", distance: "2.5 km", image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400", rating: 4.5, reviews: 234, tags: ["klatring", "boulder", "indendørs"], category: "fitness", subcategory: "klatring", price: 100 },
  { id: "fi-5", name: "Aalborg Dansestudio", description: "Salsa, hiphop, ballet — drop-in timer hver uge", location: "Boulevarden, Aalborg", distance: "0.6 km", image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400", rating: 4.4, reviews: 167, tags: ["dans", "salsa", "hiphop"], category: "fitness", subcategory: "dans", price: 80 },
  { id: "fi-6", name: "Parkour Park Aalborg", description: "Udendørs parkouranlæg med vaults, wall runs og precision jumps", location: "Eternitten, Aalborg", distance: "2 km", image: "https://images.unsplash.com/photo-1564769625392-651b89c75014?w=400", rating: 4.3, reviews: 89, tags: ["parkour", "fri bevægelse", "udendørs"], category: "fitness", subcategory: "skating", isFree: true },
];

const FITNESS_ACTIVITIES: CategoryActivity[] = [
  { id: "fia-1", title: "CrossFit: Open Gym", description: "Kom og træn frit — coaches er til stede", emoji: "🔥", image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400", location: "CrossFit Aalborg", distance: "2 km", spots: { current: 8, total: 20 }, tags: ["crossfit", "open gym"], category: "fitness", subcategory: "crossfit", price: 0 },
  { id: "fia-2", title: "Boksehold for begyndere", description: "Lær det basale — posearbejde, fodarbejde, skyggeboksning", emoji: "🥊", image: "https://images.unsplash.com/photo-1615117950084-6dbb4e0a8093?w=400", location: "Aalborg Bokseklub", distance: "1.5 km", spots: { current: 5, total: 12 }, tags: ["boksning", "begynder"], category: "fitness", subcategory: "kampsport", price: 0 },
  { id: "fi-3a", title: "Vinterbadning + sauna", description: "Morgendyk kl. 7 — perfekt start på dagen", emoji: "🥶", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400", location: "Vestre Fjordpark", distance: "3 km", spots: { current: 6, total: 15 }, tags: ["vinterbadning", "morgen"], category: "fitness", subcategory: "vinterbadning", price: 0 },
  { id: "fia-4", title: "Bouldering Session", description: "Drop-in klatring — begyndere får intro", emoji: "🧗", image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400", location: "Aalborg Klatreklub", distance: "2.5 km", spots: { current: 4, total: 10 }, tags: ["klatring", "boulder"], category: "fitness", subcategory: "klatring", price: 100 },
  { id: "fia-5", title: "Salsa for begyndere", description: "Lær de grundlæggende trin — ingen partner nødvendig", emoji: "💃", image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400", location: "Aalborg Dansestudio", distance: "0.6 km", spots: { current: 7, total: 16 }, tags: ["dans", "salsa", "begynder"], category: "fitness", subcategory: "dans", price: 80 },
];

/* ═══ OUTDOOR ═══ */
const OUTDOOR_PLACES: CategoryPlace[] = [
  { id: "ou-1", name: "Lille Vildmose Observationspost", description: "Se kronvildt og havørn — fugletårn og natursti", location: "Lille Vildmose", distance: "30 km", image: "https://images.unsplash.com/photo-1557008075-7f2c5b7825c6?w=400", rating: 4.8, reviews: 345, tags: ["fuglekiggeri", "vildt", "natur"], category: "outdoor", subcategory: "fuglekiggeri", isFree: true },
  { id: "ou-2", name: "Svampeskov Rold", description: "Karl Johan, kantarel og trompetsvamp i sæsonen", location: "Rold Skov", distance: "25 km", image: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400", rating: 4.5, reviews: 89, tags: ["svampejagt", "skov", "foraging"], category: "outdoor", subcategory: "svampejagt", isFree: true },
  { id: "ou-3", name: "Aalborg Kajakklub", description: "Kajak og SUP udlejning — kurser for begyndere", location: "Skudehavnen, Aalborg", distance: "1.5 km", image: "https://images.unsplash.com/photo-1544551763-77932d56a0d2?w=400", rating: 4.6, reviews: 234, tags: ["kajak", "SUP", "vand"], category: "outdoor", subcategory: "kajak", price: 200 },
  { id: "ou-4", name: "Ridecenteret Aalborg", description: "Rideskole med ponyer og heste — alle aldre", location: "Frejlev, Aalborg", distance: "6 km", image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400", rating: 4.4, reviews: 156, tags: ["ridning", "heste", "natur"], category: "outdoor", subcategory: "ridning", price: 300 },
  { id: "ou-5", name: "Stjerneobservatoriet Aalborg", description: "Kig på planeter og stjerner — guidede aftener", location: "Skovbakken, Aalborg", distance: "2 km", image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400", rating: 4.7, reviews: 67, tags: ["stjerner", "astronomi", "aften"], category: "outdoor", subcategory: "stjerneturen", isFree: true },
  { id: "ou-6", name: "Bushcraft Base Camp", description: "Lær overlevelsesteknikker i naturen — bål, shelter, navigation", location: "Rebild Bakker", distance: "20 km", image: "https://images.unsplash.com/photo-1515444744130-4eb649ab7e5e?w=400", rating: 4.6, reviews: 45, tags: ["bushcraft", "overlevelse", "primitiv"], category: "outdoor", subcategory: "overlevelse", price: 250 },
];

const OUTDOOR_ACTIVITIES: CategoryActivity[] = [
  { id: "oua-1", title: "Fugletur: Traner i Lille Vildmose", description: "Guidet morgentur — kikkert udlånes", emoji: "🐦", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400", location: "Lille Vildmose", distance: "30 km", spots: { current: 5, total: 10 }, tags: ["fuglekiggeri", "guidet"], category: "outdoor", subcategory: "fuglekiggeri", price: 0 },
  { id: "oua-2", title: "Svampejagt med ekspert", description: "Lær at finde spiselige svampe — vi laver suppe bagefter", emoji: "🍄", image: "https://images.unsplash.com/photo-1611077542788-ac57e1b5d695?w=400", location: "Rold Skov", distance: "25 km", spots: { current: 4, total: 8 }, tags: ["svampejagt", "foraging"], category: "outdoor", subcategory: "svampejagt", price: 100 },
  { id: "oua-3", title: "SUP begynderkursus", description: "2 timer på vandet — balance, padling, leg", emoji: "🛶", image: "https://images.unsplash.com/photo-1526290329107-b0070a9cee89?w=400", location: "Aalborg Kajakklub", distance: "1.5 km", spots: { current: 3, total: 6 }, tags: ["SUP", "begynder", "vand"], category: "outdoor", subcategory: "kajak", price: 200 },
  { id: "oua-4", title: "Bushcraft: Byg dit eget shelter", description: "Lær at bygge i naturen — med hvad du finder", emoji: "🏕️", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400", location: "Rebild Bakker", distance: "20 km", spots: { current: 2, total: 6 }, tags: ["bushcraft", "shelter"], category: "outdoor", subcategory: "overlevelse", price: 250 },
  { id: "oua-5", title: "Stjerneaften: Planeter i kikkert", description: "Jupiter, Saturn og Mælkevejen — guidet observation", emoji: "⭐", image: "https://images.unsplash.com/photo-1532978379173-523e16f371f2?w=400", location: "Skovbakken", distance: "2 km", spots: { current: 8, total: 20 }, tags: ["stjerner", "astronomi"], category: "outdoor", subcategory: "stjerneturen", price: 0 },
];

/* ═══ SOCIALT ═══ */
const SOCIALT_PLACES: CategoryPlace[] = [
  { id: "so-1", name: "Café Nordkraft Lounge", description: "Det bedste sted at møde nye mennesker over kaffe", location: "Nordkraft, Aalborg", distance: "0.4 km", image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400", rating: 4.5, reviews: 567, tags: ["kaffe", "social", "lounge"], category: "socialt", subcategory: "kaffe" },
  { id: "so-2", name: "Hundeskoven Østre Anlæg", description: "Indhegnet hundepark — masser af andre hundeejere", location: "Østre Anlæg, Aalborg", distance: "0.8 km", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400", rating: 4.3, reviews: 234, tags: ["hund", "park", "social"], category: "socialt", subcategory: "hundetur", isFree: true },
  { id: "so-3", name: "Sprogcafé Aalborg", description: "Øv dansk, engelsk, tysk — gratis sprogmøde hver tirsdag", location: "Hovedbiblioteket, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400", rating: 4.4, reviews: 123, tags: ["sprog", "cafe", "gratis"], category: "socialt", subcategory: "spraakcafe", isFree: true },
  { id: "so-4", name: "Aalborg Bogklub", description: "Mødested for bogorme — ny bog hver måned", location: "Café KaffeFair", distance: "0.5 km", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400", rating: 4.6, reviews: 67, tags: ["bogklub", "læsning", "diskussion"], category: "socialt", subcategory: "bogklub", isFree: true },
  { id: "so-5", name: "Filmklubben Nordkraft", description: "Ugens film + debat bagefter — biograf + social", location: "Nordkraft Bio", distance: "0.4 km", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400", rating: 4.5, reviews: 189, tags: ["film", "debat", "bio"], category: "socialt", subcategory: "filmaften", price: 80 },
];

const SOCIALT_ACTIVITIES: CategoryActivity[] = [
  { id: "soa-1", title: "Kaffe & Snak — drop-in", description: "Mød nye mennesker over kaffe. Bare duk op", emoji: "☕", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400", location: "Café Nordkraft", distance: "0.4 km", spots: { current: 2, total: 6 }, tags: ["kaffe", "social"], category: "socialt", subcategory: "kaffe", price: 0 },
  { id: "soa-2", title: "Hundetur i Østre Anlæg", description: "Social gåtur med hunde — alle racer velkomne", emoji: "🐕", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400", location: "Østre Anlæg", distance: "0.8 km", spots: { current: 4, total: 8 }, tags: ["hund", "gåtur"], category: "socialt", subcategory: "hundetur", price: 0 },
  { id: "soa-3", title: "Sprog-tandem: Dansk-Engelsk", description: "30 min dansk, 30 min engelsk — perfekt balance", emoji: "🗣️", image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400", location: "Hovedbiblioteket", distance: "0.3 km", spots: { current: 3, total: 6 }, tags: ["sprog", "tandem"], category: "socialt", subcategory: "spraakcafe", price: 0 },
  { id: "soa-4", title: "Bogklub: Marts-bogen", description: "Vi læser sammen og diskuterer — kaffe inkluderet", emoji: "📚", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400", location: "Café KaffeFair", distance: "0.5 km", spots: { current: 5, total: 10 }, tags: ["bogklub", "læsning"], category: "socialt", subcategory: "bogklub", price: 0 },
  { id: "soa-5", title: "Filmaften: Oscar-vinderen", description: "Se filmen på stort lærred + debat bagefter med popcorn", emoji: "🎬", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", location: "Nordkraft Bio", distance: "0.4 km", spots: { current: 10, total: 25 }, tags: ["film", "debat", "hygge"], category: "socialt", subcategory: "filmaften", price: 80 },
];

/* ═══ EVENTS ═══ */
const EVENTS_PLACES: CategoryPlace[] = [
  { id: "ev-1", name: "Skråen — Stand-up Scene", description: "Nordjyllands største stand-up-scene — nye acts hver uge", location: "Nordkraft, Aalborg", distance: "0.4 km", image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400", rating: 4.7, reviews: 456, tags: ["stand-up", "comedy", "scene"], category: "events", subcategory: "stand-up" },
  { id: "ev-2", name: "Irish House — Quiz", description: "Pub quiz, trivia og god stemning — onsdag aften", location: "Jomfru Ane Gade", distance: "0.2 km", image: "https://images.unsplash.com/photo-1594652634010-275456c808d0?w=400", rating: 4.4, reviews: 345, tags: ["quiz", "pub", "trivia"], category: "events", subcategory: "quiz" },
  { id: "ev-3", name: "Aalborg Loppemarked", description: "Kæmpe loppemarked i Karolinelund — vintage og kuriøsiteter", location: "Karolinelund", distance: "1 km", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400", rating: 4.3, reviews: 234, tags: ["loppemarked", "vintage", "fund"], category: "events", subcategory: "loppemarked", isFree: true },
  { id: "ev-4", name: "Fællesspisning Nordkraft", description: "Fælles madklub — skift tema hver uge, lav mad sammen", location: "Nordkraft Køkken", distance: "0.4 km", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", rating: 4.6, reviews: 167, tags: ["mad", "fælles", "social"], category: "events", subcategory: "faellesspisning", price: 100 },
  { id: "ev-5", name: "Udendørsbiograf Aalborg", description: "Film under stjernerne i Kildeparken — sommer special", location: "Kildeparken", distance: "0.4 km", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", rating: 4.8, reviews: 345, tags: ["biograf", "udendørs", "sommer"], category: "events", subcategory: "udendoersbiograf", isFree: true },
];

const EVENTS_ACTIVITIES: CategoryActivity[] = [
  { id: "eva-1", title: "Stand-up: Open Mic Night", description: "5 min på scenen — alle kan prøve", emoji: "🎤", image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=400", location: "Skråen", distance: "0.4 km", spots: { current: 8, total: 15 }, tags: ["stand-up", "open mic"], category: "events", subcategory: "stand-up", price: 0 },
  { id: "eva-2", title: "Quiz: Nørd-edition", description: "Sci-fi, gaming, tech — det nørdede quiz-hold vinder", emoji: "🧠", image: "https://images.unsplash.com/photo-1546443046-a4ef3a3d7b9e?w=400", location: "Irish House", distance: "0.2 km", spots: { current: 15, total: 30 }, tags: ["quiz", "nørd"], category: "events", subcategory: "quiz", price: 0 },
  { id: "eva-3", title: "Loppemarked: Forår", description: "Sælg og køb — 80+ stande med alt fra vintage til vinyl", emoji: "🛍️", image: "https://images.unsplash.com/photo-1590212151175-e58edd96185b?w=400", location: "Karolinelund", distance: "1 km", spots: { current: 40, total: 80 }, tags: ["loppemarked", "vintage"], category: "events", subcategory: "loppemarked", price: 0 },
  { id: "eva-4", title: "Fællesspisning: Mexicansk aften", description: "Tacos, guacamole, salsa — vi laver det hele sammen", emoji: "🍲", image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400", location: "Nordkraft Køkken", distance: "0.4 km", spots: { current: 4, total: 8 }, tags: ["mad", "fælles"], category: "events", subcategory: "faellesspisning", price: 100 },
];

/* ═══ KARRIERE ═══ */
const KARRIERE_PLACES: CategoryPlace[] = [
  { id: "ka2-1", name: "Aalborg Startup Hub", description: "Coworking, events og mentoring for iværksættere", location: "Nytorv, Aalborg", distance: "0.3 km", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400", rating: 4.6, reviews: 234, tags: ["startup", "coworking", "netværk"], category: "karriere", subcategory: "startup" },
  { id: "ka2-2", name: "Frivilligcenter Aalborg", description: "Find frivilligt arbejde — 50+ organisationer i Aalborg", location: "Vesterbro, Aalborg", distance: "0.5 km", image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400", rating: 4.4, reviews: 89, tags: ["frivilligt", "hjælp", "community"], category: "karriere", subcategory: "frivilligt", isFree: true },
  { id: "ka2-3", name: "AAU Innovationshub", description: "Universitetets hub for tech, viden og samarbejde", location: "Aalborg Universitet", distance: "4 km", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400", rating: 4.5, reviews: 167, tags: ["innovation", "tech", "universitet"], category: "karriere", subcategory: "netvaerk" },
];

const KARRIERE_ACTIVITIES: CategoryActivity[] = [
  { id: "kaa-1", title: "Netværksmøde: Tech i Nordjylland", description: "30 min keynote + networking med snacks", emoji: "🤝", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400", location: "Startup Hub", distance: "0.3 km", spots: { current: 15, total: 40 }, tags: ["netværk", "tech"], category: "karriere", subcategory: "netvaerk", price: 0 },
  { id: "kaa-2", title: "Iværksætter-workshop: Pitch din idé", description: "Lær at pitche på 5 min — feedback fra jury", emoji: "🚀", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400", location: "AAU Innovationshub", distance: "4 km", spots: { current: 6, total: 15 }, tags: ["startup", "pitch", "workshop"], category: "karriere", subcategory: "startup", price: 0 },
  { id: "kaa-3", title: "Frivillig: Lektiehjælp for unge", description: "Hjælp gymnasieelever med matematik og dansk", emoji: "🤲", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400", location: "Frivilligcenter", distance: "0.5 km", spots: { current: 3, total: 8 }, tags: ["frivilligt", "uddannelse"], category: "karriere", subcategory: "frivilligt", price: 0 },
  { id: "kaa-4", title: "Mentorprogram: Start din karriere", description: "Bliv parret med en erfaren mentor i din branche", emoji: "🎓", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400", location: "Online + Aalborg", distance: "0 km", spots: { current: 10, total: 20 }, tags: ["mentor", "karriere"], category: "karriere", subcategory: "mentoring", price: 0 },
];

/* ═══ TECH ═══ */
const TECH_PLACES: CategoryPlace[] = [
  { id: "te-1", name: "Gaming Lounge Aalborg", description: "PC og konsol — turneringer og chill gaming", location: "Friis, Aalborg", distance: "0.4 km", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400", rating: 4.4, reviews: 234, tags: ["gaming", "PC", "konsol"], category: "tech", subcategory: "gaming", price: 50 },
  { id: "te-2", name: "Aalborg Droneklub", description: "FPV, foto-droner og racerbaner — begyndere velkomne", location: "Østhavnen", distance: "2 km", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400", rating: 4.5, reviews: 78, tags: ["drone", "FPV", "foto"], category: "tech", subcategory: "drone", isFree: true },
  { id: "te-3", name: "Maker Space — 3D Print Lab", description: "Prusa, Ender og resin — brug maskinerne eller lær at printe", location: "Karolinelund", distance: "1 km", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", rating: 4.6, reviews: 123, tags: ["3d-print", "maker", "prototype"], category: "tech", subcategory: "3d-print", price: 100 },
  { id: "te-4", name: "AAU Coding Meetup", description: "Maanedligt meetup for udviklere — alle sprog og niveauer", location: "Aalborg Universitet", distance: "4 km", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400", rating: 4.5, reviews: 167, tags: ["coding", "meetup", "programmering"], category: "tech", subcategory: "programmering", isFree: true },
];

const TECH_ACTIVITIES: CategoryActivity[] = [
  { id: "tea-1", title: "CS2 Turnering", description: "5v5 bracket — præmier til top 3", emoji: "🎮", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400", location: "Gaming Lounge", distance: "0.4 km", spots: { current: 16, total: 40 }, tags: ["gaming", "CS2", "turnering"], category: "tech", subcategory: "gaming", price: 50 },
  { id: "tea-2", title: "Drone Race Meetup", description: "FPV racing på bane — nybegyndere får instruktion", emoji: "🛸", image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400", location: "Østhavnen", distance: "2 km", spots: { current: 5, total: 12 }, tags: ["drone", "race", "FPV"], category: "tech", subcategory: "drone", price: 0 },
  { id: "tea-3", title: "3D-print Workshop: Design & Print", description: "Lær Fusion360 + print dit eget design", emoji: "🖨️", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400", location: "Maker Space", distance: "1 km", spots: { current: 3, total: 8 }, tags: ["3d-print", "design"], category: "tech", subcategory: "3d-print", price: 150 },
  { id: "tea-4", title: "Hackathon: 24 timer", description: "Byg noget fedt på 24 timer — mad og kaffe inkluderet", emoji: "💻", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400", location: "AAU", distance: "4 km", spots: { current: 20, total: 50 }, tags: ["hackathon", "coding"], category: "tech", subcategory: "hackathon", price: 0 },
  { id: "tea-5", title: "Coding Meetup: React & TypeScript", description: "Lightning talks + live coding — alle niveauer", emoji: "👨‍💻", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400", location: "AAU", distance: "4 km", spots: { current: 12, total: 30 }, tags: ["coding", "react", "typescript"], category: "tech", subcategory: "programmering", price: 0 },
];

/* ═══ SÆSON ═══ (forår currently) */
const SAESON_PLACES: CategoryPlace[] = [
  { id: "sae-1", name: "Rebild Bakker Forårsvandring", description: "Anemoner og fuglefløjt — Nordjyllands smukkeste forår", location: "Rebild Bakker", distance: "20 km", image: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400", rating: 4.7, reviews: 345, tags: ["vandring", "forår", "blomster"], category: "saesonspecial", subcategory: "foraarsvandring", isFree: true },
  { id: "sae-2", name: "Fjordstien — Forårs Cykeltur", description: "Langs Limfjorden i forårssolen — flad og let rute", location: "Aalborg → Nibe", distance: "2 km", image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400", rating: 4.5, reviews: 178, tags: ["cykling", "forår"], category: "saesonspecial", subcategory: "cykelture", isFree: true },
  { id: "sae-3", name: "Nibe Fjord Fuglekiggeri", description: "Forårstræk — tusindvis af vadefugle og ænder", location: "Nibe", distance: "20 km", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400", rating: 4.6, reviews: 89, tags: ["fuglekiggeri", "forår"], category: "saesonspecial", subcategory: "fuglekiggeri", isFree: true },
];

const SAESON_ACTIVITIES: CategoryActivity[] = [
  { id: "saea-1", title: "Forårsvandring i Rebild", description: "Guidet tur gennem anemoner og sprækkedal", emoji: "🌸", image: "https://images.unsplash.com/photo-1440186347098-386b7459ad6b?w=400", location: "Rebild Bakker", distance: "20 km", spots: { current: 6, total: 15 }, tags: ["vandring", "forår"], category: "saesonspecial", subcategory: "foraarsvandring", price: 0 },
  { id: "saea-2", title: "Cykeltur langs fjorden", description: "40 km forårssol — vi tager den i roligt tempo", emoji: "🚴", image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400", location: "Aalborg → Nibe", distance: "0 km", spots: { current: 4, total: 10 }, tags: ["cykling", "forår"], category: "saesonspecial", subcategory: "cykelture", price: 0 },
  { id: "saea-3", title: "Fugletur: Forårstrækket", description: "Guidet tur — hvad flyver forbi Nibe Bredning?", emoji: "🐦", image: "https://images.unsplash.com/photo-1621342786106-a09c05e2a3d0?w=400", location: "Nibe", distance: "20 km", spots: { current: 3, total: 8 }, tags: ["fuglekiggeri", "forår"], category: "saesonspecial", subcategory: "fuglekiggeri", price: 0 },
  { id: "saea-4", title: "Forårs-loppemarked i Karolinelund", description: "80+ stande — vintage, planter, vinyl og mad", emoji: "🛍️", image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400", location: "Karolinelund", distance: "1 km", spots: { current: 30, total: 80 }, tags: ["loppemarked", "forår"], category: "saesonspecial", subcategory: "foraarsloppemarked", price: 0 },
];


/* ═══════════════════════════════════════════════
   MASTER LOOKUP — used by CategoryDetail page
   ═══════════════════════════════════════════════ */

const ALL_PLACES: Record<string, CategoryPlace[]> = {
  // Legacy keys (data stored under these)
  sport: SPORT_PLACES,
  kultur: KULTUR_PLACES,
  natur: NATUR_PLACES,
  musik: MUSIK_PLACES,
  mad: MAD_PLACES,
  spil: SPIL_PLACES,
  kreativt: KREATIVT_PLACES,
  fitness: FITNESS_PLACES,
  outdoor: OUTDOOR_PLACES,
  socialt: SOCIALT_PLACES,
  events: EVENTS_PLACES,
  karriere: KARRIERE_PLACES,
  tech: TECH_PLACES,
  saesonspecial: SAESON_PLACES,

  // New 10 locked category aliases → aggregate relevant legacy data
  aktiv: [...SPORT_PLACES, ...FITNESS_PLACES],
  ture: [...OUTDOOR_PLACES, ...NATUR_PLACES.filter(p => p.subcategory === "vandring" || p.tags.some(t => t.includes("vandring") || t.includes("cykling") || t.includes("kajak")))],
  logi: [], // new category — content comes from Supabase
  rejser: [], // new category — content comes from Supabase
  communities: [...SOCIALT_PLACES, ...SPIL_PLACES, ...KARRIERE_PLACES, ...TECH_PLACES],
  wellness: [...SPORT_PLACES.filter(p => p.subcategory === "yoga" || p.tags.some(t => t.includes("yoga") || t.includes("meditation") || t.includes("sauna")))],
};

const ALL_ACTIVITIES: Record<string, CategoryActivity[]> = {
  // Legacy keys
  sport: SPORT_ACTIVITIES,
  kultur: KULTUR_ACTIVITIES,
  natur: NATUR_ACTIVITIES,
  musik: MUSIK_ACTIVITIES,
  mad: MAD_ACTIVITIES,
  spil: SPIL_ACTIVITIES,
  kreativt: KREATIVT_ACTIVITIES,
  fitness: FITNESS_ACTIVITIES,
  outdoor: OUTDOOR_ACTIVITIES,
  socialt: SOCIALT_ACTIVITIES,
  events: EVENTS_ACTIVITIES,
  karriere: KARRIERE_ACTIVITIES,
  tech: TECH_ACTIVITIES,
  saesonspecial: SAESON_ACTIVITIES,

  // New 10 locked category aliases
  aktiv: [...SPORT_ACTIVITIES, ...FITNESS_ACTIVITIES],
  ture: [...OUTDOOR_ACTIVITIES, ...NATUR_ACTIVITIES.filter(a => a.tags.some(t => t.includes("vandring") || t.includes("cykling") || t.includes("kajak")))],
  logi: [],
  rejser: [],
  communities: [...SOCIALT_ACTIVITIES, ...SPIL_ACTIVITIES, ...KARRIERE_ACTIVITIES, ...TECH_ACTIVITIES],
  wellness: [...SPORT_ACTIVITIES.filter(a => a.subcategory === "yoga" || a.tags.some(t => t.includes("yoga") || t.includes("meditation")))],
};

/** Get all places for a category */
export function getCategoryPlaces(categoryKey: string): CategoryPlace[] {
  return ALL_PLACES[categoryKey] || [];
}

/** Get all activities for a category */
export function getCategoryActivities(categoryKey: string): CategoryActivity[] {
  return ALL_ACTIVITIES[categoryKey] || [];
}

/** Get places for a specific subcategory */
export function getSubcategoryPlaces(categoryKey: string, subcategoryKey: string): CategoryPlace[] {
  const places = ALL_PLACES[categoryKey] || [];
  return places.filter(p => p.subcategory === subcategoryKey);
}

/** Get activities for a specific subcategory */
export function getSubcategoryActivities(categoryKey: string, subcategoryKey: string): CategoryActivity[] {
  const activities = ALL_ACTIVITIES[categoryKey] || [];
  return activities.filter(a => a.subcategory === subcategoryKey);
}

/** Subcategory info for hero sections */
export const SUBCATEGORY_INFO: Record<string, SubcategoryInfo> = {
  fodbold: { key: "fodbold", label: "Fodbold", emoji: "⚽", description: "Find baner, hold og drop-in kampe i Aalborg", heroImage: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600", placesCount: 3, activeUsers: 47 },
  cykling: { key: "cykling", label: "Cykling", emoji: "🚴", description: "MTB, landevej og gravel — ruter og fællesture", heroImage: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600", placesCount: 3, activeUsers: 62 },
  loeb: { key: "loeb", label: "Løb", emoji: "🏃", description: "Fra 5K hyggeløb til trail og interval — find din pace", heroImage: "https://images.unsplash.com/photo-1461896836934-bd45ba3ff2b3?w=600", placesCount: 2, activeUsers: 85 },
  yoga: { key: "yoga", label: "Yoga", emoji: "🧘", description: "Udendørs flow, hot yoga og meditation", heroImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600", placesCount: 2, activeUsers: 53 },
  svoemning: { key: "svoemning", label: "Svømning", emoji: "🏊", description: "Svømmehaller, havnebad og fjordbadning", heroImage: "https://images.unsplash.com/photo-1519314793478-81a89b69502e?w=600", placesCount: 2, activeUsers: 41 },
  tennis: { key: "tennis", label: "Tennis", emoji: "🎾", description: "Baner og hold — find en makkker", heroImage: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600", placesCount: 1, activeUsers: 28 },
  museum: { key: "museum", label: "Museer", emoji: "🏛️", description: "Kunst, historie og design i Aalborg", heroImage: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600", placesCount: 3, activeUsers: 34 },
  teater: { key: "teater", label: "Teater", emoji: "🎭", description: "Drama, komedie og impro", heroImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600", placesCount: 2, activeUsers: 29 },
  kunst: { key: "kunst", label: "Kunst", emoji: "🎨", description: "Streetart, gallerier og workshops", heroImage: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600", placesCount: 2, activeUsers: 38 },
  historie: { key: "historie", label: "Historie", emoji: "📜", description: "Fra vikinger til nutid", heroImage: "https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=600", placesCount: 3, activeUsers: 22 },
  vandring: { key: "vandring", label: "Vandring", emoji: "🥾", description: "Skov, kyst og bakke — Nordjyllands bedste stier", heroImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600", placesCount: 2, activeUsers: 73 },
  mtb: { key: "mtb", label: "MTB", emoji: "🚵", description: "Singletrack, trail og fedt terræn", heroImage: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=600", placesCount: 2, activeUsers: 45 },
  hund: { key: "hund", label: "Hundeluftning", emoji: "🐕", description: "Gåture med andre hundeejere", heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600", placesCount: 1, activeUsers: 56 },
  fiskeri: { key: "fiskeri", label: "Fiskeri", emoji: "🎣", description: "Kyst, fjord og å — fiskepladser i Nordjylland", heroImage: "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600", placesCount: 1, activeUsers: 19 },
  badning: { key: "badning", label: "Badning", emoji: "🏊", description: "Strande, fjordbad og svømmeland", heroImage: "https://images.unsplash.com/photo-1519314793478-81a89b69502e?w=600", placesCount: 2, activeUsers: 64 },
  shelter: { key: "shelter", label: "Shelters", emoji: "⛺", description: "Primitiv overnatning under åben himmel", heroImage: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600", placesCount: 1, activeUsers: 31 },
  dyrespot: { key: "dyrespot", label: "Dyrespots", emoji: "🦌", description: "Krondyr, ørne og traner i Nordjylland", heroImage: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600", placesCount: 2, activeUsers: 25 },
  koncert: { key: "koncert", label: "Koncerter", emoji: "🎤", description: "Live musik fra indie til klassisk", heroImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600", placesCount: 3, activeUsers: 89 },
  jazz: { key: "jazz", label: "Jazz", emoji: "🎷", description: "Intime jazz-aftener i Aalborg", heroImage: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600", placesCount: 1, activeUsers: 23 },
  jam: { key: "jam", label: "Jam Sessions", emoji: "🎸", description: "Medbringe instrument — spil med andre", heroImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600", placesCount: 1, activeUsers: 34 },
  festival: { key: "festival", label: "Festivaler", emoji: "🎪", description: "Store og små festivaler i Nordjylland", heroImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600", placesCount: 1, activeUsers: 120 },
};

/** Get total content count for a category */
export function getCategoryContentCount(categoryKey: string): { places: number; activities: number; total: number } {
  const places = (ALL_PLACES[categoryKey] || []).length;
  const activities = (ALL_ACTIVITIES[categoryKey] || []).length;
  return { places, activities, total: places + activities };
}

/**
 * LAZY LOADING SUPPORT
 * To reduce initial bundle size (68KB), pages can dynamically import categoryContent
 * using React.lazy() or dynamic import() instead of static imports.
 *
 * MIGRATION GUIDE for CategoryDetail.tsx and similar:
 * ───────────────────────────────────────────────────
 * 1. Remove static import:
 *    - import { getCategoryPlaces, getCategoryActivities, ... } from "@/data/categoryContent"
 *
 * 2. Use dynamic import in useEffect/useMemo:
 *    const [places, setPlaces] = useState<CategoryPlace[]>([]);
 *    const [activities, setActivities] = useState<CategoryActivity[]>([]);
 *
 *    useEffect(() => {
 *      import('@/data/categoryContent').then(m => {
 *        setPlaces(m.getCategoryPlaces(category));
 *        setActivities(m.getCategoryActivities(category));
 *      });
 *    }, [category, activeSub]);
 *
 * 3. Expected bundle savings: 68KB reduction in initial JS chunk
 *    Current: ~180KB (tagTree + categoryContent)
 *    After:   ~112KB (tagTree only in initial chunk)
 */

export async function loadCategoryPlaces(categoryKey: string): Promise<CategoryPlace[]> {
  return getCategoryPlaces(categoryKey);
}

export async function loadCategoryActivities(categoryKey: string): Promise<CategoryActivity[]> {
  return getCategoryActivities(categoryKey);
}

export async function loadSubcategoryPlaces(categoryKey: string, subcategoryKey: string): Promise<CategoryPlace[]> {
  return getSubcategoryPlaces(categoryKey, subcategoryKey);
}

export async function loadSubcategoryActivities(categoryKey: string, subcategoryKey: string): Promise<CategoryActivity[]> {
  return getSubcategoryActivities(categoryKey, subcategoryKey);
}
