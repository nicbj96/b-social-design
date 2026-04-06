// Hjælpefunktioner der matcher produktionens API — men returnerer mock-data
// Designeren behøver ikke ændre dette

export function getEventImage(event: { category?: string }): string {
  const imgs: Record<string, string> = {
    musik: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&fm=webp&q=80',
    sport: 'https://images.unsplash.com/photo-1461896836934-bd45ba3ff2b3?w=600&auto=format&fit=crop&fm=webp&q=80',
    natur: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop&fm=webp&q=80',
    mad:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&fm=webp&q=80',
    kultur:'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&auto=format&fit=crop&fm=webp&q=80',
    wellness:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&fm=webp&q=80',
    tech:  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&fm=webp&q=80',
  };
  return imgs[event.category || ''] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&fm=webp&q=80';
}

export function formatDanishDate(date: string): string {
  return new Date(date).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
}
