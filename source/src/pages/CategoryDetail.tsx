'use client';
import { usePageMeta } from "@/hooks/usePageMeta";

import React, { useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar, ChevronRight, Star } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useEventsByTag, usePlacesByTag, useChildTags } from '@/hooks/useTagData';
import TagPill from '@/components/TagPill';
import TagRow from '@/components/TagRow';
import TagBreadcrumb from '@/components/TagBreadcrumb';
import { getEventImage, formatDanishDate } from '@/lib/eventHelpers';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TagInfo {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  level: number;
  event_count: number;
  place_count: number;
  total_count: number;
  parent_slug?: string | null;
}

// ============================================================================
// CATEGORY DETAIL PAGE
// ============================================================================

export default function CategoryDetail() {
  const [, params] = useRoute('/kategori/:category');
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'events' | 'steder'>('events');

  const category = params?.category || '';

  // Fetch tag info from tag_usage_counts
  const { data: tagInfo, isLoading: tagLoading } = useQuery({
    queryKey: ['tag-info', category],
    queryFn: async () => {
      const { data } = await supabase
        .from('tag_usage_counts')
        .select('*')
        .eq('slug', category)
        .single();
      return data as TagInfo | null;
    },
    enabled: !!category,
  });
  // Set dynamic page meta tags
  usePageMeta({
    title: tagInfo?.name || category || "Kategori",
    description: `Udforsk ${tagInfo?.name || category} - find events og steder på B-Social`,
  });

  // Fetch child tags
  const { data: childTags = [], isLoading: childTagsLoading } = useChildTags(category);

  // Fetch events
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useEventsByTag(category, { limit: 20, descendants: true });

  // Fetch places
  const {
    data: places = [],
    isLoading: placesLoading,
    isError: placesError,
  } = usePlacesByTag(category, { limit: 20, descendants: true });

  // Handle back navigation
  const handleBack = () => {
    setLocation('/udforsk');
  };

  if (tagLoading || !tagInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  // Build breadcrumb segments
  const breadcrumbSegments = [{ slug: category, name: tagInfo.name, emoji: tagInfo.emoji }];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white pb-24">
      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {/* HERO HEADER */}
      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      <div className="relative px-4 py-6 sm:px-6 lg:px-8">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none" />

        <div className="relative">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Tilbage</span>
          </button>

          {/* Hero content */}
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl">{tagInfo.emoji}</span>
            <h1 className="text-2xl sm:text-3xl font-bold">{tagInfo.name}</h1>
          </div>

          {/* Stats */}
          <div className="text-sm text-white/60 mb-6">
            {tagInfo.event_count} events · {tagInfo.place_count} steder
          </div>

          {/* Breadcrumb (only show for L2+ tags) */}
          {tagInfo.level > 1 && breadcrumbSegments.length > 0 && (
            <div className="mb-6">
              <TagBreadcrumb segments={breadcrumbSegments} />
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {/* SUBCATEGORY CHIPS (only if not L3) */}
      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {tagInfo.level < 3 && childTags.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-wrap gap-2">
            {childTags.map((child) => (
              <Link
                key={child.slug}
                to={`/kategori/${child.slug}`}
                className="block"
              >
                <TagPill
                  slug={child.slug}
                  name={child.name}
                  emoji={child.emoji}
                  level={child.level}
                  size="sm"
                  clickable
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {/* TAB BAR */}
      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur px-4 sm:px-6 lg:px-8 flex gap-8">
        <button
          onClick={() => setActiveTab('events')}
          className={`py-4 text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'border-b-2 border-teal-400 text-white'
              : 'text-white/40 border-b-2 border-transparent hover:text-white/60'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('steder')}
          className={`py-4 text-sm font-medium transition-colors ${
            activeTab === 'steder'
              ? 'border-b-2 border-teal-400 text-white'
              : 'text-white/40 border-b-2 border-transparent hover:text-white/60'
          }`}
        >
          Steder
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {/* EVENTS TAB */}
      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {eventsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-white/5 animate-pulse">
                  <div className="w-24 h-24 rounded-lg bg-white/10 flex-shrink-0" />
                  <div className="flex-grow space-y-2">
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40">Ingen events i denne kategori</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Link key={event.id} to={`/event/${event.id}`} className="block">
                  <div className="flex gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors bg-white/[0.02] border border-white/5">
                    {/* Event image */}
                    <img
                      src={getEventImage(event)}
                      alt={event.title}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />

                    {/* Event content */}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-white mb-1 line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-white/50 mb-1">
                        <Calendar size={14} />
                        <span>{formatDanishDate(event.date)}</span>
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div className="text-xs text-white/40 mb-2 line-clamp-1">
                          {event.location}
                        </div>
                      )}

                      {/* Price badge */}
                      {event.price && event.price > 0 && (
                        <div className="inline-block mb-2 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-xs text-white/80 font-medium">
                          {event.price} kr
                        </div>
                      )}

                      {/* Tags */}
                      {event.interest_tags && event.interest_tags.length > 0 && (
                        <TagRow
                          tags={event.interest_tags.slice(0, 2).map((t) => ({
                            slug: t,
                            name: t,
                            emoji: undefined,
                            level: 2,
                          }))}
                          maxVisible={2}
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Chevron */}
                    <ChevronRight
                      size={20}
                      className="text-white/20 flex-shrink-0 mt-2"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {/* STEDER TAB */}
      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'steder' && (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {placesLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-white/5 animate-pulse">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-teal-500/20 to-transparent flex-shrink-0" />
                  <div className="flex-grow space-y-2">
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40">Ingen steder i denne kategori</p>
            </div>
          ) : (
            <div className="space-y-4">
              {places.map((place) => (
                <Link key={place.id} to={`/sted/${place.id}`} className="block">
                  <div className="flex gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors bg-white/[0.02] border border-white/5">
                    {/* Gradient placeholder for place */}
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-teal-500/30 via-slate-900 to-slate-950 flex-shrink-0" />

                    {/* Place content */}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-white mb-1">{place.name}</h3>

                      {/* City, region, country */}
                      <div className="text-xs text-white/40 mb-1 line-clamp-1">
                        {place.city && place.city}
                        {place.region && place.city && ', '}
                        {place.region && place.region}
                      </div>

                      {/* Rating */}
                      {place.rating_avg > 0 && (
                        <div className="flex items-center gap-1 text-xs text-white/60 mb-2">
                          <Star size={14} className="text-yellow-400" />
                          <span>
                            {place.rating_avg.toFixed(1)} ({place.rating_count})
                          </span>
                        </div>
                      )}

                      {/* Country flag (if applicable) */}
                      {place.country && (
                        <div className="text-xs text-white/40">
                          {place.country}
                        </div>
                      )}
                    </div>

                    {/* Chevron */}
                    <ChevronRight
                      size={20}
                      className="text-white/20 flex-shrink-0 mt-2"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {/* "VIS PÅ KORT" FLOATING BUTTON */}
      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      <Link to={`/kort?tag=${category}`} className="block">
        <button className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full bg-teal-500 hover:bg-teal-600 transition-colors text-white font-medium shadow-lg">
          <MapPin size={18} />
          <span>Vis på kort</span>
        </button>
      </Link>
    </div>
  );
}
