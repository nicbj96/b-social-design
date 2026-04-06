// ══════════════════════════════════════════════════
// MOCK DATA — bruges i stedet for Supabase
// Designeren kan redigere dette frit til at teste UI
// ══════════════════════════════════════════════════

export const mockEvents = [
  { id: '1', title: 'Jazzkoncert i Tivoli', location: 'København', date: '2026-04-12', category: 'musik' },
  { id: '2', title: 'Havnerundt Løb', location: 'Aarhus', date: '2026-04-15', category: 'sport' },
  { id: '3', title: 'Street Food Festival', location: 'Odense', date: '2026-04-18', category: 'mad' },
  { id: '4', title: 'Yoga i parken', location: 'Aalborg', date: '2026-04-20', category: 'wellness' },
  { id: '5', title: 'Tech Meetup', location: 'København', date: '2026-04-22', category: 'tech' },
  { id: '6', title: 'Naturoplevelse Mols Bjerge', location: 'Ebeltoft', date: '2026-04-25', category: 'natur' },
];

export const mockPlaces = [
  { id: '1', name: 'Tivoli', city: 'København', main_categories: ['kultur'], rating_avg: 4.8, rating_count: 1200 },
  { id: '2', name: 'Den Gamle By', city: 'Aarhus', main_categories: ['kultur'], rating_avg: 4.6, rating_count: 890 },
  { id: '3', name: 'Naturpark Thy', city: 'Thisted', main_categories: ['natur'], rating_avg: 4.7, rating_count: 540 },
  { id: '4', name: 'Street Food Aarhus', city: 'Aarhus', main_categories: ['mad'], rating_avg: 4.4, rating_count: 320 },
];

export const mockL1Categories = [
  { slug: 'musik', name: 'Musik', emoji: '🎵', total_count: 240 },
  { slug: 'sport', name: 'Sport', emoji: '⚽', total_count: 180 },
  { slug: 'natur', name: 'Natur', emoji: '🌿', total_count: 160 },
  { slug: 'mad', name: 'Mad', emoji: '🍽️', total_count: 140 },
  { slug: 'kultur', name: 'Kultur', emoji: '🎭', total_count: 120 },
  { slug: 'wellness', name: 'Wellness', emoji: '🧘', total_count: 100 },
  { slug: 'gaming', name: 'Gaming', emoji: '🎮', total_count: 90 },
  { slug: 'tech', name: 'Tech', emoji: '💻', total_count: 80 },
  { slug: 'rejser', name: 'Rejser', emoji: '✈️', total_count: 70 },
  { slug: 'film', name: 'Film', emoji: '🎬', total_count: 60 },
];

export const mockPopularTags = [
  { slug: 'koncert', name: 'Koncert', emoji: '🎤' },
  { slug: 'festival', name: 'Festival', emoji: '🎪' },
  { slug: 'vandring', name: 'Vandring', emoji: '🥾' },
  { slug: 'restaurant', name: 'Restaurant', emoji: '🍷' },
  { slug: 'yoga', name: 'Yoga', emoji: '🧘' },
  { slug: 'fodbold', name: 'Fodbold', emoji: '⚽' },
  { slug: 'cykling', name: 'Cykling', emoji: '🚴' },
  { slug: 'kunst', name: 'Kunst', emoji: '🎨' },
];
