"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps page content with a smooth entrance animation.
 * Also activates scroll-reveal on all .reveal* children.
 */
export default function PageWrapper({ children, className = "" }) {
  const ref = useRef(null);

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
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`animate-page-enter ${className}`}>
      {children}
    </div>
  );
}
