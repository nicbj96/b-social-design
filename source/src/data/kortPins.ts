/**
 * kortPins.ts — Shared map pin data
 * Extracted from Kort.tsx so other pages (e.g. Udforsk) can import
 * without creating a static dependency on the lazy-loaded Kort chunk.
 *
 * ⚠️  DO NOT import this file from inside Kort.tsx's React component tree —
 *     Kort.tsx itself imports from here, re-exporting is fine.
 */

import { OPLEVELSER_NAER_DIG } from "@/data/feedData";

export type PinCategory =
  | "sport" | "kultur" | "natur" | "musik" | "mad" | "spil" | "events"
  | "mtb" | "vandring" | "loeb" | "hund" | "fiskeri" | "badning" | "shelter"
  | "dyrespot" | "kreativt" | "fitness" | "outdoor" | "socialt" | "karriere"
  | "tech" | "aktiv_sport" | "mad_hangout" | "rejser" | "logi" | "wellness"
  | "communities" | "ture" | "aktiv";

export interface MapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: PinCategory;
  description?: string;
  descriptionKey?: string;
  rating: number;
  ratingCount?: number;
  isEvent?: boolean;
  isSupabaseEvent?: boolean;
  spots?: { current: number; total: number };
  season?: string;
  difficulty?: string;
  difficultyKey?: string;
  tags?: string[];
  city?: string;
  fromSupabase?: boolean;
  image?: string;
  date?: string;
  price?: number | null;
  eventId?: string;
}

// All supported country codes (ISO 2-letter)
export const MAP_EUROPE_CODES = [
  // Europe
  'DK','SE','NO','FI','DE','NL','BE','AT','CH','ES','FR','IT','GB','IE','PL','CZ',
  'PT','GR','HU','RO','HR','SK','SI','LT','LV','EE','BG','RS','UA','BY','LU','MT',
  'CY','LI','IS','AL','MK','BA','ME','MD','AM','GE','AZ',
  // Americas
  'US','CA','MX','BR','AR','CL','CO','PE','VE','EC','BO','PY','UY','GY',
  'CR','PA','GT','HN','SV','NI','CU','JM','DO','HT','TT',
  // Asia & Middle East
  'JP','KR','CN','TW','TH','VN','ID','MY','PH','SG','MM','KH','LA',
  'IN','BD','PK','LK','NP','KZ','UZ','KG','TJ','TM','MN','AF','TR',
  'IR','IQ','SA','AE','QA','KW','BH','OM','YE','JO','IL','LB','SY',
  // Africa & Oceania
  'ZA','EG','MA','DZ','TN','LY','NG','GH','SN','CI','CM','ET','KE','TZ',
  'UG','RW','SD','CD','AO','MZ','ZM','ZW','BW','NA','MG',
  'AU','NZ','FJ','PG',
];

/* ── All hardcoded map pins ── */
export const HARDCODED_PINS: MapPin[] = [
  // AALBORG — SPORT
  { id: "s1", name: "Aalborg Portland Park", lat: 57.043, lng: 9.903, category: "sport", descriptionKey: "map.pins.s1.desc", rating: 4.5 },
  { id: "s2", name: "Gigantium", lat: 57.025, lng: 9.945, category: "sport", descriptionKey: "map.pins.s2.desc", rating: 4.3 },
  { id: "s3", name: "Aalborg Svømmehal", lat: 57.046, lng: 9.917, category: "sport", descriptionKey: "map.pins.s3.desc", rating: 4.0 },
  { id: "s4", name: "Kildeparken", lat: 57.047, lng: 9.927, category: "sport", descriptionKey: "map.pins.s4.desc", rating: 4.4 },
  { id: "s5", name: "DGI Huset Nordkraft", lat: 57.048, lng: 9.923, category: "sport", descriptionKey: "map.pins.s5.desc", rating: 4.6 },

  // AALBORG — KULTUR
  { id: "k1", name: "Kunsten Museum", lat: 57.042, lng: 9.899, category: "kultur", descriptionKey: "map.pins.k1.desc", rating: 4.7 },
  { id: "k2", name: "Utzon Center", lat: 57.052, lng: 9.923, category: "kultur", descriptionKey: "map.pins.k2.desc", rating: 4.5 },
  { id: "k3", name: "Aalborg Teater", lat: 57.047, lng: 9.920, category: "kultur", descriptionKey: "map.pins.k3.desc", rating: 4.4 },
  { id: "k4", name: "Musikkens Hus", lat: 57.051, lng: 9.925, category: "kultur", descriptionKey: "map.pins.k4.desc", rating: 4.8 },
  { id: "k5", name: "Nordkraft Kulturhus", lat: 57.048, lng: 9.922, category: "kultur", descriptionKey: "map.pins.k5.desc", rating: 4.5 },
  { id: "k6", name: "Aalborg Historiske Museum", lat: 57.048, lng: 9.920, category: "kultur", descriptionKey: "map.pins.k6.desc", rating: 4.1 },

  // AALBORG — NATUR
  { id: "n1", name: "Lindholm Høje", lat: 57.075, lng: 9.893, category: "natur", descriptionKey: "map.pins.n1.desc", rating: 4.8 },
  { id: "n2", name: "Fjordstien", lat: 57.053, lng: 9.915, category: "natur", descriptionKey: "map.pins.n2.desc", rating: 4.3 },
  { id: "n3", name: "Aalborg Zoo", lat: 57.037, lng: 9.897, category: "natur", descriptionKey: "map.pins.n3.desc", rating: 4.4 },
  { id: "n4", name: "Mølleparken", lat: 57.045, lng: 9.917, category: "natur", descriptionKey: "map.pins.n4.desc", rating: 4.0 },
  { id: "n5", name: "Østre Anlæg", lat: 57.046, lng: 9.930, category: "natur", descriptionKey: "map.pins.n5.desc", rating: 4.2 },
  { id: "n6", name: "Limfjorden strand", lat: 57.055, lng: 9.910, category: "natur", descriptionKey: "map.pins.n6.desc", rating: 4.5 },

  // AALBORG — MAD & DRIKKE
  { id: "m1", name: "Jomfru Ane Gade", lat: 57.048, lng: 9.921, category: "mad", descriptionKey: "map.pins.m1.desc", rating: 4.2 },
  { id: "m2", name: "Streetfood Aalborg", lat: 57.048, lng: 9.922, category: "mad", descriptionKey: "map.pins.m2.desc", rating: 4.3 },
  { id: "m3", name: "Café Frederiksberg", lat: 57.044, lng: 9.912, category: "mad", descriptionKey: "map.pins.m3.desc", rating: 4.5 },
  { id: "m4", name: "Duus Vinkjælder", lat: 57.047, lng: 9.920, category: "mad", descriptionKey: "map.pins.m4.desc", rating: 4.6 },
  { id: "m5", name: "Skomagerkrækken", lat: 57.045, lng: 9.905, category: "mad", descriptionKey: "map.pins.m5.desc", rating: 4.4 },

  // AALBORG — SPIL
  { id: "sp1", name: "Brætspilscaféen", lat: 57.046, lng: 9.918, category: "spil", descriptionKey: "map.pins.sp1.desc", rating: 4.7 },
  { id: "sp2", name: "Escape House Aalborg", lat: 57.047, lng: 9.915, category: "spil", descriptionKey: "map.pins.sp2.desc", rating: 4.5 },

  // AALBORG — EVENTS (social meetups)
  { id: "e1", name: "Havnefronten meetup", lat: 57.051, lng: 9.920, category: "events", descriptionKey: "map.pins.e1.desc", rating: 4.6, isEvent: true, spots: { current: 3, total: 8 } },
  { id: "e2", name: "Kildeparken gåtur", lat: 57.047, lng: 9.927, category: "events", descriptionKey: "map.pins.e2.desc", rating: 4.4, isEvent: true, spots: { current: 2, total: 5 } },
  { id: "e3", name: "Fodbold 5-mands", lat: 57.047, lng: 9.928, category: "events", descriptionKey: "map.pins.e3.desc", rating: 4.3, isEvent: true, spots: { current: 4, total: 5 } },
  { id: "e4", name: "Brætspil-aften Vestbyen", lat: 57.044, lng: 9.910, category: "events", descriptionKey: "map.pins.e4.desc", rating: 4.5, isEvent: true, spots: { current: 3, total: 6 } },

  // MTB & TRAILS
  { id: "mtb1", name: "Hammer Bakker MTB-spor", lat: 57.105, lng: 9.862, category: "mtb", descriptionKey: "map.pins.mtb1.desc", rating: 4.7, difficultyKey: "map.difficulty.medium_hard" },
  { id: "mtb2", name: "Rold Skov Trails", lat: 56.836, lng: 9.827, category: "mtb", descriptionKey: "map.pins.mtb2.desc", rating: 4.5, difficultyKey: "map.difficulty.medium" },
  { id: "mtb3", name: "Dall Villaby MTB", lat: 57.015, lng: 9.870, category: "mtb", descriptionKey: "map.pins.mtb3.desc", rating: 4.0, difficultyKey: "map.difficulty.easy" },

  // VANDRING
  { id: "vdr1", name: "Fjordstien vandrerute", lat: 57.053, lng: 9.915, category: "vandring", descriptionKey: "map.pins.vdr1.desc", rating: 4.6, difficultyKey: "map.difficulty.easy" },
  { id: "vdr2", name: "Rold Skov Troldestien", lat: 56.840, lng: 9.830, category: "vandring", descriptionKey: "map.pins.vdr2.desc", rating: 4.8, difficultyKey: "map.difficulty.medium" },
  { id: "vdr3", name: "Lindholm Høje rundtur", lat: 57.075, lng: 9.893, category: "vandring", descriptionKey: "map.pins.vdr3.desc", rating: 4.5, difficultyKey: "map.difficulty.easy" },
  { id: "vdr4", name: "Drastrup Skov", lat: 57.020, lng: 9.840, category: "vandring", descriptionKey: "map.pins.vdr4.desc", rating: 4.4, difficultyKey: "map.difficulty.easy" },

  // LØB
  { id: "lob1", name: "Kildeparken løberute", lat: 57.047, lng: 9.927, category: "loeb", descriptionKey: "map.pins.lob1.desc", rating: 4.4, difficultyKey: "map.difficulty.easy" },
  { id: "lob2", name: "Havnefronten løbestræk", lat: 57.051, lng: 9.921, category: "loeb", descriptionKey: "map.pins.lob2.desc", rating: 4.3, difficultyKey: "map.difficulty.easy" },

  // HUND
  { id: "hnd1", name: "Lindholm Hundeskov", lat: 57.078, lng: 9.890, category: "hund", descriptionKey: "map.pins.hnd1.desc", rating: 4.5 },
  { id: "hnd2", name: "Skovhaven Hundepark", lat: 57.035, lng: 9.900, category: "hund", descriptionKey: "map.pins.hnd2.desc", rating: 4.2 },

  // FISKERI
  { id: "fsk1", name: "Limfjorden fiskeplads", lat: 57.058, lng: 9.910, category: "fiskeri", descriptionKey: "map.pins.fsk1.desc", rating: 4.3 },
  { id: "fsk2", name: "Nibe Bredning", lat: 56.990, lng: 9.640, category: "fiskeri", descriptionKey: "map.pins.fsk2.desc", rating: 4.6 },

  // BADNING
  { id: "bad1", name: "Aalborg Havnebad", lat: 57.050, lng: 9.905, category: "badning", descriptionKey: "map.pins.bad1.desc", rating: 4.7 },
  { id: "bad2", name: "Egholm Strand", lat: 57.065, lng: 9.870, category: "badning", descriptionKey: "map.pins.bad2.desc", rating: 4.4 },

  // SHELTER
  { id: "shl1", name: "Egholm shelter", lat: 57.068, lng: 9.868, category: "shelter", descriptionKey: "map.pins.shl1.desc", rating: 4.6 },
  { id: "shl2", name: "Rold Skov shelter", lat: 56.838, lng: 9.825, category: "shelter", descriptionKey: "map.pins.shl2.desc", rating: 4.4 },

  // DYRESPOT
  { id: "dyr1", name: "Lille Vildmose dyrespot", lat: 56.880, lng: 10.200, category: "dyrespot", descriptionKey: "map.pins.dyr1.desc", rating: 4.9 },
  { id: "dyr2", name: "Egholm vilde heste", lat: 57.066, lng: 9.865, category: "dyrespot", descriptionKey: "map.pins.dyr2.desc", rating: 4.5 },

  // SOCIAL from feedData
  ...OPLEVELSER_NAER_DIG.map((a) => {
    const LOCATION_COORDS: Record<string, [number, number]> = {
      "Café Nordkraft": [57.048, 9.922], "Utzon Center": [57.052, 9.923],
      "Hammer Bakker": [57.105, 9.862], "Brætspilscaféen": [57.046, 9.918],
      "Kildeparken": [57.047, 9.927], "Streetfood Aalborg": [57.048, 9.922],
      "Havnefronten": [57.051, 9.921], "Aalborg → Nibe": [57.046, 9.915],
      "Vestre Bådehavn": [57.050, 9.905], "Søgaards Bryghus": [57.047, 9.919],
      "NOVI Innovation": [57.015, 9.985], "Aalborg Kajakklub": [57.052, 9.908],
    };
    const [lat, lng] = LOCATION_COORDS[a.location] || [57.048, 9.918];
    return {
      id: a.id, name: a.title, lat, lng, category: "events" as PinCategory,
      description: a.description, rating: 4.3, isEvent: true, spots: a.spots, image: a.image,
    } satisfies MapPin;
  }),

  // KØBENHAVN
  { id: "cph1", name: "Tivoli", lat: 55.674, lng: 12.568, category: "kultur", descriptionKey: "map.pins.cph1.desc", rating: 4.7 },
  { id: "cph2", name: "Nyhavn", lat: 55.680, lng: 12.591, category: "mad", descriptionKey: "map.pins.cph2.desc", rating: 4.5 },
  { id: "cph3", name: "Kødbyen", lat: 55.668, lng: 12.561, category: "mad", descriptionKey: "map.pins.cph3.desc", rating: 4.4 },

  // AARHUS
  { id: "aar1", name: "ARoS Kunstmuseum", lat: 56.154, lng: 10.200, category: "kultur", descriptionKey: "map.pins.aar1.desc", rating: 4.8 },
  { id: "aar2", name: "Den Gamle By", lat: 56.160, lng: 10.191, category: "kultur", descriptionKey: "map.pins.aar2.desc", rating: 4.7 },

  // ODENSE
  { id: "ode1", name: "HC Andersen Hus", lat: 55.396, lng: 10.390, category: "kultur", descriptionKey: "map.pins.ode1.desc", rating: 4.6 },

  // NIBE
  { id: "nib1", name: "Nibe Havn", lat: 56.988, lng: 9.635, category: "natur", descriptionKey: "map.pins.nib1.desc", rating: 4.3 },
  { id: "nib2", name: "Nibe Festival plads", lat: 56.990, lng: 9.638, category: "musik", descriptionKey: "map.pins.nib2.desc", rating: 4.7 },

  // SKAGEN
  { id: "ska1", name: "Grenen", lat: 57.748, lng: 10.635, category: "natur", descriptionKey: "map.pins.ska1.desc", rating: 4.9 },

  // ROLD SKOV
  { id: "rol1", name: "Rebild Bakker", lat: 56.836, lng: 9.827, category: "natur", descriptionKey: "map.pins.rol1.desc", rating: 4.7 },

  // MUSIK
  { id: "mu1", name: "Skråen Musiksted", lat: 57.049, lng: 9.922, category: "musik", descriptionKey: "map.pins.mu1.desc", rating: 4.6 },
  { id: "mu2", name: "Studenterhuset", lat: 57.047, lng: 9.921, category: "musik", descriptionKey: "map.pins.mu2.desc", rating: 4.2 },

  // KREATIVT
  { id: "kr1", name: "Kunsten Museum atelierer", lat: 57.042, lng: 9.899, category: "kreativt", descriptionKey: "map.pins.kr1.desc", rating: 4.7 },
  { id: "kr2", name: "Nordkraft Atelierer", lat: 57.048, lng: 9.923, category: "kreativt", descriptionKey: "map.pins.kr2.desc", rating: 4.4 },
  { id: "kr3", name: "Aalborg Fotoklub", lat: 57.045, lng: 9.915, category: "kreativt", descriptionKey: "map.pins.kr3.desc", rating: 4.3 },

  // FITNESS
  { id: "fi1", name: "CrossFit Aalborg", lat: 57.040, lng: 9.925, category: "fitness", descriptionKey: "map.pins.fi1.desc", rating: 4.6 },
  { id: "fi2", name: "Aalborg Klatreklub", lat: 57.044, lng: 9.910, category: "fitness", descriptionKey: "map.pins.fi2.desc", rating: 4.5 },
  { id: "fi3", name: "Vestre Bådehavns Vinterbad", lat: 57.050, lng: 9.905, category: "fitness", descriptionKey: "map.pins.fi3.desc", rating: 4.8 },

  // OUTDOOR
  { id: "ou1", name: "Egholm Fuglereservat", lat: 57.065, lng: 9.865, category: "outdoor", descriptionKey: "map.pins.ou1.desc", rating: 4.6 },
  { id: "ou2", name: "Lille Vildmose Naturcenter", lat: 56.880, lng: 10.200, category: "outdoor", descriptionKey: "map.pins.ou2.desc", rating: 4.9 },
  { id: "ou3", name: "Aalborg Kajakklub", lat: 57.052, lng: 9.908, category: "outdoor", descriptionKey: "map.pins.ou3.desc", rating: 4.4 },
  { id: "ou4", name: "Aalborg Ridecenter", lat: 57.030, lng: 9.880, category: "outdoor", descriptionKey: "map.pins.ou4.desc", rating: 4.3 },

  // SOCIALT
  { id: "so1", name: "Café Ministeriet", lat: 57.047, lng: 9.919, category: "socialt", descriptionKey: "map.pins.so1.desc", rating: 4.5 },
  { id: "so2", name: "Studenterhuset Aalborg", lat: 57.047, lng: 9.921, category: "socialt", descriptionKey: "map.pins.so2.desc", rating: 4.3 },
  { id: "so3", name: "Frivilligcenter Aalborg", lat: 57.046, lng: 9.916, category: "socialt", descriptionKey: "map.pins.so3.desc", rating: 4.2 },

  // EVENTS
  { id: "ev1", name: "Aalborg Comedy Club", lat: 57.048, lng: 9.920, category: "events", descriptionKey: "map.pins.ev1.desc", rating: 4.5, isEvent: true },
  { id: "ev2", name: "Søgaards Bryghus — Pub Quiz", lat: 57.047, lng: 9.919, category: "events", descriptionKey: "map.pins.ev2.desc", rating: 4.6, isEvent: true },
  { id: "ev3", name: "Nytorv Loppemarked", lat: 57.048, lng: 9.918, category: "events", descriptionKey: "map.pins.ev3.desc", rating: 4.3, isEvent: true },

  // KARRIERE
  { id: "ka1", name: "Aalborg Startupværksted", lat: 57.046, lng: 9.922, category: "karriere", descriptionKey: "map.pins.ka1.desc", rating: 4.4 },
  { id: "ka2", name: "NOVI Innovation", lat: 57.015, lng: 9.985, category: "karriere", descriptionKey: "map.pins.ka2.desc", rating: 4.5 },
  { id: "ka3", name: "AAU Inkubator", lat: 57.015, lng: 9.975, category: "karriere", descriptionKey: "map.pins.ka3.desc", rating: 4.3 },

  // TECH
  { id: "te1", name: "Aalborg Hackerspace", lat: 57.044, lng: 9.912, category: "tech", descriptionKey: "map.pins.te1.desc", rating: 4.4 },
  { id: "te2", name: "NOVI Science Park", lat: 57.015, lng: 9.985, category: "tech", descriptionKey: "map.pins.te2.desc", rating: 4.5 },
];

export const ALL_PINS = HARDCODED_PINS;
