import React from 'react';
import TagPill from './TagPill';

interface TagRowProps {
  tags: { slug: string; name: string; emoji?: string; level: number }[];
  maxVisible?: number; // default 3
  size?: 'sm' | 'md';
  clickable?: boolean;
  className?: string;
}

const TagRow: React.FC<TagRowProps> = ({
  tags,
  maxVisible = 3,
  size = 'md',
  clickable = false,
  className = '',
}) => {
  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = Math.max(0, tags.length - maxVisible);

  return (
    <div
      className={`flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide ${className}`}
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {visibleTags.map((tag) => (
        <TagPill
          key={`${tag.level}-${tag.slug}`}
          slug={tag.slug}
          name={tag.name}
          emoji={tag.emoji}
          level={tag.level}
          size={size}
          clickable={clickable}
        />
      ))}

      {hiddenCount > 0 && (
        <div className="flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};

export default TagRow;
