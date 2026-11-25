import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Katalog: halaman kanan membuka dari posisi tertutup (sampul di atas halaman kiri).
export function initBook() {
  const book = $("[data-book]");
  const leaf = $("[data-book-leaf]", book);
  if (!leaf || window.innerWidth < 900) return; // di HP halaman ditumpuk, tidak membuka
  gsap.fromTo(
    leaf,
    { rotateY: -178 },
    {
      rotateY: 0,
      ease: "power2.inOut",
      scrollTrigger: { trigger: book, start: "top 85%", end: "top 25%", scrub: 0.6 },
    }
  );
  gsap.from(book, { rotate: -2.5, y: 40, ease: "none", scrollTrigger: { trigger: book, start: "top 95%", end: "top 40%", scrub: true } });
}

// Laci spesimen meluncur keluar dari lemari, lalu spesimennya bergoyang di jarumnya.
export function initDrawers() {
  $$("[data-drawer]").forEach((d) => {
    const box = $(".drawer__box", d);
    gsap.fromTo(
      box,
      { rotateX: -62, y: -30, opacity: 0.4 },
      { rotateX: 0, y: 0, opacity: 1, ease: "power3.out", scrollTrigger: { trigger: d, start: "top 85%", end: "top 45%", scrub: 0.5 } }
    );
    gsap.from($$(".spec", d), {
      y: -18,
      rotate: (i) => (i % 2 ? 14 : -14),
      opacity: 0,
      duration: 0.9,
      ease: "elastic.out(1, 0.45)",
      stagger: 0.06,
      scrollTrigger: { trigger: d, start: "top 60%" },
    });
  });
}

// Kakejiku: kertas terbuka ke bawah, gulungan bawah ikut turun di tepi kertas.
export function initScroll() {
  const kake = $("[data-kake]");
  const paper = $("[data-kake-paper]", kake);
  const rod = $("[data-kake-rod]", kake);
  if (!paper) return;
  const set = (p) => {
    const h = paper.offsetHeight;
    paper.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
    rod.style.transform = `translateY(${-(1 - p) * h}px)`;
    // gulungan bawah sedikit berputar saat kertas keluar
    rod.style.setProperty("--spin", `${p * 720}deg`);
  };
  set(0);
  ScrollTrigger.create({
    trigger: kake,
    start: "top 70%",
    end: "bottom 75%",
    scrub: 0.6,
    onUpdate: (self) => set(self.progress),
    onRefresh: (self) => set(self.progress),
  });
}
