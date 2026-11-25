import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Smooth scroll (Lenis) yang disinkronkan dengan ScrollTrigger.
export function initScroll(reduced) {
  const lenis = new Lenis({ lerp: 0.16, smoothWheel: !reduced });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Link "#section" pakai Lenis supaya ikut halus dan tetap benar saat ada section yang di-pin.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#top" ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    lenis.scrollTo(target, { duration: 1.6 });
  });

  document.querySelectorAll("[data-to-top]").forEach((btn) =>
    btn.addEventListener("click", () => lenis.scrollTo(0, { duration: 2.2 }))
  );

  return lenis;
}
