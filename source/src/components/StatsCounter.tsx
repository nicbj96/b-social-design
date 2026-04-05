'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface StatsCounterProps {
  variant?: 'hero' | 'inline' | 'banner';
  className?: string;
}

function useAnimatedCount(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function formatNumberDK(num: number): string {
  return num.toLocaleString('da-DK');
}

function abbreviateNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M+';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+';
  }
  return num.toString();
}

export const StatsCounter: React.FC<StatsCounterProps> = ({
  variant = 'hero',
  className = '',
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      try {
        const [placesRes, eventsRes, tagsRes, countriesRes] = await Promise.all([
          supabase.from('places').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('tags_normalized').select('id', { count: 'exact', head: true }),
          supabase.from('places').select('country').not('country', 'is', null),
        ]);

        const uniqueCountries = new Set(countriesRes.data?.map((c: any) => c.country)).size;

        return {
          places: placesRes.count ?? 194097,
          events: eventsRes.count ?? 61212,
          tags: tagsRes.count ?? 793,
          countries: uniqueCountries || 117,
        };
      } catch (error) {
        return {
          places: 194097,
          events: 61212,
          tags: 793,
          countries: 117,
        };
      }
    },
    staleTime: 60 * 60 * 1000,
  });

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-6 text-sm text-white/60 ${className}`}>
        <span>📍 {abbreviateNumber(stats?.places || 194097)} steder</span>
        <span>·</span>
        <span>🎫 {abbreviateNumber(stats?.events || 61212)} events</span>
        <span>·</span>
        <span>🌍 {stats?.countries || 117} lande</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`w-full border-y border-white/10 bg-white/5 backdrop-blur-lg py-6 ${className}`}>
        <div className="flex justify-around items-center">
          <div className="flex items-center gap-3 text-white">
            <span className="text-xl">📍</span>
            <span className="font-semibold">{formatNumberDK(stats?.places || 194097)}</span>
            <span className="text-white/60">steder</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-xl">🎫</span>
            <span className="font-semibold">{formatNumberDK(stats?.events || 61212)}</span>
            <span className="text-white/60">events</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-xl">🏷️</span>
            <span className="font-semibold">{formatNumberDK(stats?.tags || 793)}</span>
            <span className="text-white/60">tags</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-xl">🌍</span>
            <span className="font-semibold">{stats?.countries || 117}</span>
            <span className="text-white/60">lande</span>
          </div>
        </div>
      </div>
    );
  }

  // Hero variant (default)
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-r from-teal-500/10 via-transparent to-cyan-500/10 p-8 md:p-12 backdrop-blur-sm ${className}`}
    >
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        <StatItem
          icon="📍"
          label="Steder"
          value={stats?.places || 194097}
          formatter={formatNumberDK}
        />
        <StatItem
          icon="🎫"
          label="Events"
          value={stats?.events || 61212}
          formatter={formatNumberDK}
        />
        <StatItem
          icon="🏷️"
          label="Tags"
          value={stats?.tags || 793}
          formatter={formatNumberDK}
        />
        <StatItem
          icon="🌍"
          label="Lande"
          value={stats?.countries || 117}
          formatter={(n) => n.toString()}
        />
      </div>
    </div>
  );
};

interface StatItemProps {
  icon: string;
  label: string;
  value: number;
  formatter: (n: number) => string;
}

function StatItem({ icon, label, value, formatter }: StatItemProps) {
  const { count, ref } = useAnimatedCount(value, 2000);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 text-center">
      <span className="text-3xl md:text-4xl">{icon}</span>
      <div className="text-3xl md:text-4xl font-bold text-white">
        {formatter(count)}
      </div>
      <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
}
