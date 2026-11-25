import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { initGalleryThread, initArchiveThread } from "./thread.js";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => gsap.utils.toArray(s, root);

// Galeri "Selected work": scroll vertikal menggerakkan kartu ke samping.
// Hanya aktif di desktop; di mobile kartu tersusun biasa ke bawah.
export function initWorks() {
  const section = $("[data-works]");
  const pin = $("[data-works-pin]", section);
  const track = $("[data-works-track]", section);
  const bar = $("[data-works-progress]", section);
  const current = $("[data-works-current]", section);

  section.classList.add("is-horizontal");

  const distance = () => track.offsetLeft + track.scrollWidth - pin.clientWidth;

  const scroll = gsap.to(track, {
    x: () => -distance(),
    ease: "none", // wajib "none" untuk containerAnimation
    scrollTrigger: {
      trigger: pin,
      pin: true,
      start: "top top",
      end: () => "+=" + distance(),
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    },
  });

  $$(".card", section).forEach((card, i) => {
    // Gambar bergeser sedikit di dalam bingkainya (parallax horizontal).
    gsap.fromTo(
      $("[data-card-img]", card),
      { xPercent: -7 },
      {
        xPercent: 7,
        ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: scroll, start: "left right", end: "right left", scrub: true },
      }
    );

    // Nomor berganti begitu tepi kiri kartu melewati tengah layar (dan kembali saat scroll mundur).
    const setCurrent = (n) => (current.textContent = String(n).padStart(2, "0"));
    ScrollTrigger.create({
      trigger: card,
      containerAnimation: scroll,
      start: "left center",
      onEnter: () => setCurrent(i + 1),
      onLeaveBack: () => setCurrent(Math.max(i, 1)),
    });
  });

  const stopThread = initGalleryThread(scroll);
  return () => {
    stopThread?.();
    section.classList.remove("is-horizontal");
  };
}

// HP & tablet: tiap kartu menempel di atas (CSS sticky); kartu sebelumnya
// mengecil dan meredup saat kartu berikutnya naik menutupinya.
export function initWorksStack() {
  const cards = $$("[data-works] .card");
  cards.slice(0, -1).forEach((card, i) =>
    // Diredupkan lewat lapisan gelap (--dim di .card::after), bukan opacity,
    // supaya kartu tetap pekat dan kartu di bawahnya tidak tembus terlihat.
    gsap.to(card, {
      scale: 0.9,
      "--dim": 0.65,
      ease: "none",
      scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top top+=72", scrub: true },
    })
  );
}

export function initSections() {
  initArchiveThread();

  // Judul skill: dari huruf ramping jadi lebar saat discroll ke tengah layar.
  $$("[data-stretch]").forEach((el) =>
    gsap.fromTo(
      el,
      { fontStretch: "62%" },
      { fontStretch: "125%", ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: true } }
    )
  );

  // Judul besar: baris demi baris naik dari balik masker.
  $$("[data-reveal-lines]").forEach((el) =>
    SplitText.create(el, {
      type: "lines",
      linesClass: "rl",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 85%" },
        }),
    })
  );

  // Blok teks biasa: muncul pelan dari bawah.
  gsap.set("[data-reveal]", { y: 40, opacity: 0 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 90%",
    once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08, overwrite: true }),
  });

  // Garis pembatas "tergambar" dari kiri.
  gsap.set("[data-rule]", { scaleX: 0 });
  ScrollTrigger.batch("[data-rule]", {
    start: "top 92%",
    once: true,
    onEnter: (els) => gsap.to(els, { scaleX: 1, duration: 1.4, ease: "expo.inOut", stagger: 0.06, overwrite: true }),
  });

  // Parallax vertikal untuk gambar di dalam bingkai.
  $$("[data-parallax]").forEach((frame) =>
    gsap.fromTo(
      frame.firstElementChild,
      { yPercent: -6 },
      { yPercent: 6, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } }
    )
  );

  // Nama raksasa di footer naik huruf per huruf.
  const giant = $("[data-giant]");
  gsap.from(SplitText.create(giant, { type: "chars" }).chars, {
    yPercent: 100,
    duration: 1.2,
    ease: "expo.out",
    stagger: 0.035,
    scrollTrigger: { trigger: ".contact__bottom", start: "top bottom" },
  });
}

// Daftar Archive: thumbnail mengikuti kursor saat baris di-hover.
export function initArchivePreview() {
  const preview = $(".preview");
  const inner = $("[data-preview-inner]");
  const list = $("[data-archive-list]");

  gsap.set(preview, { xPercent: 14, yPercent: -50, scale: 0.8 });
  const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
  const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });

  // Preview muncul di samping kursor (bukan menutupinya); pindah ke kiri kalau kursor di sisi kanan.
  let side = 1;
  const move = (e) => {
    const right = e.clientX < window.innerWidth * 0.55;
    if ((right ? 1 : -1) !== side) {
      side = right ? 1 : -1;
      gsap.to(preview, { xPercent: right ? 14 : -114, duration: 0.5, ease: "power3.out" });
    }
    xTo(e.clientX);
    yTo(e.clientY);
  };
  const videos = Array.from(inner.children, (item) => item.querySelector("video"));
  const playOnly = (i) =>
    videos.forEach((v, j) => {
      if (!v) return;
      if (j === i) v.play().catch(() => {});
      else v.pause();
    });

  const enter = (e) => {
    const row = e.target.closest("[data-row]");
    if (!row) return;
    const i = Number(row.dataset.row);
    gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out", overwrite: "auto" });
    // Satu gambar saja yang tampil; pindah baris = ganti gambar dengan fade cepat.
    [...inner.children].forEach((item, j) => item.classList.toggle("is-on", j === i));
    playOnly(i);
  };
  const leave = () => {
    gsap.to(preview, { autoAlpha: 0, scale: 0.8, duration: 0.35, ease: "power2.out", overwrite: "auto" });
    playOnly(-1);
  };

  window.addEventListener("pointermove", move);
  list.addEventListener("pointerover", enter);
  list.addEventListener("pointerleave", leave);

  return () => {
    window.removeEventListener("pointermove", move);
    list.removeEventListener("pointerover", enter);
    list.removeEventListener("pointerleave", leave);
  };
}
