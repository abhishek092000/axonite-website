import { useEffect, useRef } from "react";

/**
 * Attaches a scroll-driven parallax transform to an element.
 * speed: negative moves slower than scroll (background feel),
 * positive moves faster (foreground pop). 0.1–0.4 is subtle, use sparingly.
 */
export function useParallax(speed = 0.2) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Only compute while the element is near/within the viewport
      if (rect.bottom > -200 && rect.top < viewportH + 200) {
        const progress = (rect.top - viewportH / 2) * speed;
        el.style.transform = `translate3d(0, ${progress}px, 0)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return ref;
}
