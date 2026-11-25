import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

const $ = (s) => document.querySelector(s);
let reelTrigger = null;

// clip-path inset() yang membingkai kapsul [data-pill] di dalam hero.
// Panggung video (.reel) sebenarnya selebar layar; clip-path ini yang membuatnya
// terlihat seperti kapsul kecil, lalu dibuka sampai penuh saat discroll.
// scale 0 = titik di tengah kapsul (dipakai untuk animasi intro).
// Di desktop yang tampil kapsul di baris nama; di HP jendela besar di bawah nama.
function pillClip(scale = 1) {
  const pill = [...document.querySelectorAll("[data-pill]")].find((el) => el.offsetWidth > 0);
  const h = $("[data-hero]").getBoundingClientRect();
  const p = pill.getBoundingClientRect();
  const cx = p.left + p.width / 2 - h.left;
  const cy = p.top + p.height / 2 - h.top;
  const hw = (p.width * scale) / 2;
  const hh = (p.height * scale) / 2;
  const radius = Math.min(parseFloat(getComputedStyle(pill).borderTopLeftRadius) || 0, p.height / 2) * scale;
  return `inset(${cy - hh}px ${h.width - cx - hw}px ${h.height - cy - hh}px ${cx - hw}px round ${radius}px)`;
}

// Setelah ukuran nama berubah (resize), kapsul pindah posisi: samakan lagi.
export function syncPill() {
  if (!reelTrigger || reelTrigger.progress === 0) gsap.set("[data-reel]", { clipPath: pillClip() });
}

// Loader (hitung 000 → 100) lalu nama muncul huruf per huruf dan kapsul "terbuka".
export function playIntro({ reduced }) {
  if (reduced) {
    syncPill();
    return;
  }

  const split = SplitText.create("[data-hero-text]", { type: "chars", charsClass: "hchar", mask: "chars" });

  gsap
    .timeline({ defaults: { ease: "expo.out" }, delay: 0.15 })
    .from(split.chars, { yPercent: 115, duration: 1.2, stagger: 0.03 })
    .from(".hero__star", { scale: 0, rotate: -140, duration: 1.5 }, "<0.15")
    .fromTo(
      "[data-reel]",
      { clipPath: () => pillClip(0) },
      { clipPath: () => pillClip(1), duration: 1.2, ease: "expo.inOut" },
      "<"
    )
    .from(".hero__caption, .hero__tagline", { y: 18, opacity: 0, stagger: 0.08, duration: 1 }, "<0.3")
    .from("[data-nav] > *", { y: -16, opacity: 0, stagger: 0.06, duration: 1 }, "<");
}

// Hero di-pin: kapsul membesar sampai penuh layar, HUD kamera muncul,
// lalu baris teks reel naik satu per satu.
export function initHeroReel() {
  gsap.set(".reel__line > span", { yPercent: 115 });

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: "[data-hero]",
      start: "top top",
      end: "+=220%",
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  tl.fromTo(
    "[data-reel]",
    { clipPath: () => pillClip() },
    { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "power3.inOut", duration: 1, immediateRender: false },
    0
  )
    .to(".hero__line--1", { xPercent: -8, duration: 1 }, 0)
    .to(".hero__line--3", { xPercent: 8, duration: 1 }, 0)
    .to(".hero__star svg", { rotate: 180, duration: 1 }, 0)
    .call(() => window.dispatchEvent(new Event("reel:open")), null, 0.7)
    .to(".reel__hud, .reel__sound", { opacity: 1, duration: 0.2 }, 0.85)
    .to(".reel__line > span", { yPercent: 0, stagger: 0.14, duration: 0.4, ease: "power3.out" }, 0.9)
    .to({}, { duration: 0.5 }); // jeda sebentar sebelum lanjut ke section berikutnya

  reelTrigger = tl.scrollTrigger;
  return () => (reelTrigger = null);
}

// Timecode HUD + tombol suara. Berjalan hanya saat reel terlihat.
// Tombol suara untuk video reel (kalau ada).
export function initReelHud() {
  const video = $("[data-reel-video]");
  const sound = $("[data-sound]");
  sound?.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted) video.play();
    sound.textContent = video.muted ? "Sound off" : "Sound on";
  });
}
