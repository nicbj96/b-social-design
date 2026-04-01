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

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(`${prefix}-visible`);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold }
    );

    root.querySelectorAll(`.${prefix}-fade-up`).forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [prefix, threshold]);

  return containerRef;
}
