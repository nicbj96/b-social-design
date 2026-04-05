import React from 'react';
import { Link } from 'wouter';
import { X } from 'lucide-react';

interface TagPillProps {
  slug: string;
  name: string;
  emoji?: string;
  level: number; // 1, 2, or 3
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  selected?: boolean;
  onRemove?: () => void;
  className?: string;
}

const TagPill: React.FC<TagPillProps> = ({
  slug,
  name,
  emoji,
  level,
  size = 'md',
  clickable = false,
  selected = false,
  onRemove,
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  // Level-based styling
  const getLevelClasses = () => {
    switch (level) {
      case 1: // Overkategori - Bold, teal background
        return selected
          ? 'bg-teal-500/30 border border-teal-500/60 text-white font-semibold'
          : 'bg-teal-500/20 border border-teal-500/40 text-white font-semibold';
      case 2: // Kategori - Medium, subtle border
        return selected
          ? 'bg-white/10 border border-white/30 text-white/90 font-medium'
          : 'bg-white/5 border border-white/10 text-white/80 font-medium';
      case 3: // Underkategori - Small, minimal
        return selected
          ? 'bg-white/10 border border-white/20 text-white/80'
          : 'bg-white/5 border border-white/5 text-white/60';
      default:
        return 'bg-white/5 border border-white/10 text-white/80';
    }
  };

  const baseClasses = `
    rounded-full
    inline-flex
    items-center
    gap-1
    whitespace-nowrap
    transition-all
    duration-200
    hover:brightness-125
    ${sizeClasses[size]}
    ${getLevelClasses()}
    ${className}
  `;

  const content = (
    <>
      {emoji && <span className="flex-shrink-0">{emoji}</span>}
      <span className="flex-shrink-0">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 ml-0.5 hover:text-teal-400 transition-colors"
          aria-label={`Remove ${name}`}
        >
          <X size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        </button>
      )}
    </>
  );

  if (clickable) {
    return (
      <Link to={`/kategori/${slug}`} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
};

export default TagPill;
