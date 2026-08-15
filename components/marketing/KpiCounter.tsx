"use client";

import { useEffect, useRef, useState } from "react";

interface KpiCounterProps {
  target: number;
  decimalScaled?: boolean;
}

/** Animates a number counting up from 0 to `target` once it scrolls into view. */
export function KpiCounter({ target, decimalScaled = false }: KpiCounterProps) {
  const [display, setDisplay] = useState(decimalScaled ? "0.0" : "0");
  const ref = useRef<HTMLSpanElement>(null);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const format = (value: number) =>
      decimalScaled ? (value / 10).toFixed(1) : String(Math.floor(value));

    const animate = () => {
      const duration = 1400;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setDisplay(format(target * progress));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplay(decimalScaled ? (target / 10).toFixed(1) : String(target));
        }
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countedRef.current) {
            countedRef.current = true;
            animate();
          }
        });
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [target, decimalScaled]);

  return <span ref={ref}>{display}</span>;
}
