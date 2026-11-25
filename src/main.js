import "lenis/dist/lenis.css";
import "./styles/main.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { renderAll, profile } from "./render.js";
import { initScroll } from "./modules/scroll.js";
import { playIntro, initHeroReel, initReelHud, syncPill } from "./modules/hero.js";
import { initWorks, initWorksStack, initSections, initArchivePreview } from "./modules/sections.js";
import { initBook, initDrawers, initScroll as initKakejiku } from "./modules/museum.js";
import { initEntrance } from "./modules/entrance.js";
import { initStage, initStageScroll } from "./modules/portrait.js";
import { initVideos } from "./modules/video.js";
import { initSakuga, impact } from "./modules/sakuga.js";
import { initClock, initCopy, fitText, fontsReady, initNavTheme } from "./modules/utils.js";

gsap.registerPlugin(ScrollTrigger, SplitText);
// Di HP, address bar yang muncul/hilang tidak perlu memicu hitung ulang semua trigger.
ScrollTrigger.config({ ignoreMobileResize: true });

history.scrollRestoration = "manual";
window.scrollTo(0, 0);

renderAll();

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const lenis = initScroll(reduced);

initClock(profile.timezone);
initCopy();
initVideos(reduced);
initReelHud();
initNavTheme(gsap.ticker);
initSakuga({ reduced });

fontsReady().then(() => {
  fitText();
  window.addEventListener("resize", () => {
    fitText();
    syncPill();
  });

  const entrance = document.querySelector("[data-entrance]");
  if (entrance) initEntrance(entrance, { reduced });
  const stageState = initStage({ reduced });

  const mm = gsap.matchMedia();
  // Trigger dibuat urut dari atas ke bawah halaman: pin hero → pin galeri → sisanya.
  mm.add("(prefers-reduced-motion: no-preference)", initHeroReel);
  mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", initWorks);
  mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", initWorksStack);
  mm.add("(prefers-reduced-motion: no-preference)", () => initStageScroll(stageState));
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    initSections();
    initBook();
    initDrawers();
    initKakejiku();
  });
  mm.add("(hover: hover) and (pointer: fine)", initArchivePreview);

  playIntro({ reduced });

  // Efek sakuga juga muncul sendiri, bukan cuma saat diklik:
  // bintang di hero meledak setelah intro, dan judul kontak memberi "TING!" saat terlihat.
  if (!reduced) {
    const hit = (el, name) => {
      const b = el.getBoundingClientRect();
      impact(el, b.left + b.width / 2, b.top + b.height / 2, name);
    };
    const star = document.querySelector(".hero__star");
    setTimeout(() => window.scrollY < 50 && hit(star, "duar"), 1700);
    const mail = document.querySelector(".contact__title em");
    if (mail) ScrollTrigger.create({ trigger: mail, start: "top 75%", once: true, onEnter: () => hit(mail, "ting") });
  }

  // Gambar yang selesai dimuat bisa menggeser layout; hitung ulang posisi trigger.
  if (document.readyState === "complete") ScrollTrigger.refresh();
  else window.addEventListener("load", () => ScrollTrigger.refresh());
});
