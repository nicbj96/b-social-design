'use client';

import React from 'react';
import { useL1Categories, usePopularTags } from '@/hooks/useTagData';
import { StatsCounter } from '@/components/StatsCounter';

export default function StatsPage() {
  const { data: categories } = useL1Categories();
  const { data: popularTags } = usePopularTags(10);

  const categoryCounts = {
    l1: categories?.filter((c: any) => c.level === 1).length || 22,
    l2: categories?.filter((c: any) => c.level === 2).length || 92,
    l3: categories?.filter((c: any) => c.level === 3).length || 679,
    aliases: categories?.filter((c: any) => c.is_alias).length || 176,
  };

  const maxCount = Math.max(...(popularTags?.map((t: any) => t.count) || [1]));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-12 md:px-12 lg:px-16">
        <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">B-Social i tal</h1>
        <p className="text-white/60">Udforsk statistikker over vores globale platform</p>
      </div>

      {/* Hero Stats Counter */}
      <div className="px-6 py-12 md:px-12 lg:px-16">
        <StatsCounter variant="hero" />
      </div>

      {/* Main Content Grid */}
      <div className="px-6 md:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Categories Section */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">Kategorier</h2>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <CategorieItem label="Overkategorier (L1)" count={categoryCounts.l1} />
                <CategorieItem label="Kategorier (L2)" count={categoryCounts.l2} />
                <CategorieItem label="Underkategorier (L3)" count={categoryCounts.l3} />
                <CategorieItem label="Aliases" count={categoryCounts.aliases} />
              </div>
            </div>
          </div>

          {/* Top Tags Section */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">Top 10 Tags</h2>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="space-y-3">
                {popularTags && popularTags.length > 0 ? (
                  popularTags.map((tag: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <span className="text-white">{tag.name}</span>
                      <span className="text-sm font-semibold text-teal-400">
                        {tag.count.toLocaleString('da-DK')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60">Indlæser tags...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tag Distribution Chart */}
      <div className="px-6 md:px-12 lg:px-16 py-12">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="mb-8 text-2xl font-bold text-white">Tag-fordeling</h2>
          <div className="space-y-6">
            {popularTags && popularTags.length > 0 ? (
              popularTags.slice(0, 8).map((tag: any, idx: number) => (
                <TagBar
                  key={idx}
                  icon={getEmojiForTag(tag.name)}
                  name={tag.name}
                  count={tag.count}
                  maxCount={maxCount}
                />
              ))
            ) : (
              <p className="text-white/60">Indlæser tags...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorieItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-4 last:border-b-0">
      <span className="text-white/80">{label}</span>
      <span className="font-bold text-teal-400">{count.toLocaleString('da-DK')}</span>
    </div>
  );
}

interface TagBarProps {
  icon: string;
  name: string;
  count: number;
  maxCount: number;
}

function TagBar({ icon, name, count, maxCount }: TagBarProps) {
  const percentage = (count / maxCount) * 100;

  return (
    <div className="flex items-center gap-4">
      <div className="flex w-24 items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-white/80">{name}</span>
      </div>
      <div className="flex-1">
        <div className="relative h-6 overflow-hidden rounded bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-right text-sm font-semibold text-white/80 w-20">
        {count.toLocaleString('da-DK')}
      </span>
    </div>
  );
}

function getEmojiForTag(tagName: string): string {
  const lowerName = tagName.toLowerCase();

  const emojiMap: { [key: string]: string } = {
    natur: '🌲',
    motion: '🏃',
    vandring: '🥾',
    kultur: '🎨',
    spil: '🎮',
    musik: '🎵',
    sport: '⚽',
    mad: '🍽️',
    fest: '🎉',
    kino: '🎬',
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(key)) return emoji;
  }

  return '🏷️';
}
