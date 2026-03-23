"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches IntersectionObserver to a container ref and adds
 * the "visible" class to any child with class "reveal", "reveal-left",
 * "reveal-right", or "reveal-scale" when it enters the viewport.
 *
 * Usage:
 *   const containerRef = useScrollReveal();
 *   <section ref={containerRef}>
 *     <div className="reveal">...</div>
 *     <div className="reveal delay-200">...</div>
 *   </section>
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const { threshold = 0.12, rootMargin = "0px 0px -40px 0px", ...observerOptions } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin, ...observerOptions }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [observerOptions, rootMargin, threshold]);

  return ref;
}
