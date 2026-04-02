import { useEffect, useRef } from "react";

/**
 * Reusable IntersectionObserver hook for fade-up scroll animations.
 * Each page passes its own prefix so the CSS class names stay scoped.
 *
 * Usage:
 *   const containerRef = useFadeUp("fd");
 *   <div ref={containerRef}> ... <div className="fd-fade-up"> ... </div> ... </div>
 */
export function useFadeUp(prefix: string, threshold = 0.15) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Find the nearest scrollable ancestor to use as root,
    // since pages render inside .dsk-main which has overflow-y: auto
    let scrollRoot: Element | null = root.parentElement;
    while (scrollRoot && scrollRoot !== document.documentElement) {
      const ov = getComputedStyle(scrollRoot).overflowY;
      if (ov === 'auto' || ov === 'scroll') break;
      scrollRoot = scrollRoot.parentElement;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(`${prefix}-visible`);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold, root: scrollRoot || null }
    );

    root.querySelectorAll(`.${prefix}-fade-up`).forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [prefix, threshold]);

  return containerRef;
}
