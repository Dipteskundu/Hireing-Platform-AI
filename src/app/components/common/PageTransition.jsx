"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Wraps page content with a smooth enter animation on every route change.
 * Uses CSS classes from globals.css — no external deps needed.
 */
export default function PageTransition({ children, className = "" }) {
  const pathname = usePathname();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Remove then re-add the class to retrigger the animation
    el.classList.remove("page-transition-enter");
    // Force reflow
    void el.offsetWidth;
    el.classList.add("page-transition-enter");
  }, [pathname]);

  return (
    <div ref={ref} className={`page-transition-enter ${className}`}>
      {children}
    </div>
  );
}
