import React from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

interface TagBreadcrumbProps {
  segments: { slug: string; name: string; emoji?: string }[];
  onNavigate?: (slug: string | null) => void; // null = "Alle"
  className?: string;
}

const TagBreadcrumb: React.FC<TagBreadcrumbProps> = ({
  segments,
  onNavigate,
  className = '',
}) => {
  const handleAllClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(null);
    }
  };

  const handleSegmentClick = (slug: string) => (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(slug);
    }
  };

  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {/* "Alle" - Always first */}
      <Link
        to="/kategori"
        onClick={handleAllClick}
        className="text-white/40 hover:text-white/60 transition-colors duration-200"
      >
        Alle
      </Link>

      {/* Segments */}
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <React.Fragment key={`${index}-${segment.slug}`}>
            {/* Separator */}
            <ChevronRight
              size={16}
              className="text-white/30 flex-shrink-0"
              strokeWidth={2}
            />

            {/* Segment Link */}
            <Link
              to={`/kategori/${segment.slug}`}
              onClick={handleSegmentClick(segment.slug)}
              className={`flex items-center gap-1 transition-colors duration-200 ${
                isLast
                  ? 'text-white/80 font-medium'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {segment.emoji && <span className="flex-shrink-0">{segment.emoji}</span>}
              <span>{segment.name}</span>
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default TagBreadcrumb;
