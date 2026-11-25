import gsap from "gsap";
import { color } from "./palette.js";

// ------------------------------------------------------------
// Reaksi ala animasi anime (sakuga) saat elemen [data-fx] diklik:
// antisipasi → benturan (gepeng + kedip terbalik 1 frame) → garis ledakan,
// kepulan asap, serpihan, dan tulisan efek suara → memantul balik.
// Canvas hanya menggambar selama efek berlangsung, selebihnya diam.
// ------------------------------------------------------------

// Diisi dari tema saat efek pertama dipakai.
let INK, PAPER, YELLOW, RED;

// Efek suara gaya komik Indonesia.
const PRESETS = {
  duar: { word: "DUAR!", size: 1.25, burst: 18, clouds: 7, debris: 8, fill: "pop" },
  ting: { word: "TING!", size: 0.95, burst: 14, clouds: 4, debris: 5, fill: "pop" },
  syut: { word: "SYUT!", size: 0.8, burst: 12, clouds: 3, debris: 3, fill: "paper" },
  klik: { word: "KLIK!", size: 0.8, burst: 10, clouds: 3, debris: 4, fill: "pop" },
};

let canvas;
let ctx;
let dpr = 1;
let running = false;
const effects = [];

const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const rand = (a, b) => a + Math.random() * (b - a);

function ensureCanvas() {
  INK = color("deep");
  PAPER = "#ffffff";
  YELLOW = color("soft"); // bayangan asap & isi tulisan kedua
  RED = color("pop");
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.className = "fx-layer";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  };
  resize();
  window.addEventListener("resize", resize);
}

function loop(now) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    const p = (now - e.born) / e.life;
    if (p >= 1) {
      effects.splice(i, 1);
      continue;
    }
    if (p >= 0) e.draw(p);
  }
  if (effects.length) requestAnimationFrame(loop);
  else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    running = false;
  }
}

function add(life, draw, delay = 0) {
  effects.push({ born: performance.now() + delay, life, draw });
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
}

// Garis ledakan: segitiga runcing yang memancar dari titik benturan.
function burst(x, y, r, count) {
  const lines = Array.from({ length: count }, (_, i) => ({
    a: (i / count) * Math.PI * 2 + rand(-0.12, 0.12),
    len: rand(0.7, 1.25),
    w: rand(0.06, 0.12),
    red: i % 3 === 0,
  }));
  add(320, (p) => {
    const t = easeOut(p);
    const inner = r * (0.3 + t * 0.55);
    for (const l of lines) {
      const outer = r * l.len * (0.55 + t * 0.75);
      if (outer <= inner) continue;
      const w = l.w * (1 - p);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(l.a - w) * inner, y + Math.sin(l.a - w) * inner);
      ctx.lineTo(x + Math.cos(l.a) * outer, y + Math.sin(l.a) * outer);
      ctx.lineTo(x + Math.cos(l.a + w) * inner, y + Math.sin(l.a + w) * inner);
      ctx.closePath();
      ctx.fillStyle = l.red ? RED : INK;
      ctx.fill();
    }
  });
  // cincin kejut tipis di awal
  add(220, (p) => {
    ctx.beginPath();
    ctx.arc(x, y, r * (0.25 + p * 0.6), 0, Math.PI * 2);
    ctx.lineWidth = 3 * (1 - p);
    ctx.strokeStyle = INK;
    ctx.stroke();
  });
}

// Kepulan asap: gumpalan lingkaran bergaris tinta yang menjauh lalu mengempis.
function clouds(x, y, r, count) {
  const puffs = Array.from({ length: count }, (_, i) => ({
    a: (i / count) * Math.PI * 2 + rand(-0.4, 0.4),
    d: rand(0.75, 1.15),
    s: rand(0.16, 0.26) * r,
    blobs: Array.from({ length: 3 }, () => ({ dx: rand(-0.6, 0.6), dy: rand(-0.5, 0.3), k: rand(0.6, 1) })),
  }));
  add(
    650,
    (p) => {
      const t = easeOut(p);
      for (const f of puffs) {
        const cx = x + Math.cos(f.a) * r * f.d * (0.45 + t * 0.7);
        const cy = y + Math.sin(f.a) * r * f.d * (0.45 + t * 0.7) - t * 10;
        const s = f.s * (1 - p * 0.75);
        if (s < 1) continue;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = INK;
        for (const b of f.blobs) {
          ctx.beginPath();
          ctx.arc(cx + b.dx * s, cy + b.dy * s, s * b.k, 0, Math.PI * 2);
          ctx.fillStyle = PAPER;
          ctx.fill();
          ctx.stroke();
        }
        // bayangan kuning di sisi bawah
        ctx.beginPath();
        ctx.arc(cx, cy + s * 0.25, s * 0.7, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.lineWidth = s * 0.35;
        ctx.strokeStyle = YELLOW;
        ctx.stroke();
      }
    },
    40
  );
}

// Serpihan kecil yang terlempar dan jatuh.
function debris(x, y, r, count) {
  const bits = Array.from({ length: count }, () => {
    const a = rand(-Math.PI, 0);
    const v = rand(0.9, 1.6) * r;
    return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: rand(0, Math.PI), spin: rand(-8, 8), s: rand(4, 8) };
  });
  add(700, (p) => {
    for (const b of bits) {
      const bx = x + b.vx * p;
      const by = y + b.vy * p + 260 * p * p;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(b.rot + b.spin * p);
      ctx.beginPath();
      ctx.moveTo(-b.s, 0);
      ctx.lineTo(0, -b.s * 0.7);
      ctx.lineTo(b.s, 0);
      ctx.lineTo(0, b.s * 0.7);
      ctx.closePath();
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = PAPER;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.restore();
    }
  });
}

// Tulisan efek suara: muncul membesar, menghentak, lalu memudar.
function sfx(x, y, word, size, fill) {
  const px = Math.round(56 * size);
  add(950, (p) => {
    const scale = p < 0.12 ? 1.7 - (p / 0.12) * 0.7 : 1 + Math.sin(Math.min(1, (p - 0.12) / 0.2) * Math.PI) * 0.04;
    const alpha = p > 0.72 ? 1 - (p - 0.72) / 0.28 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y - p * 14);
    ctx.rotate(-0.18);
    ctx.transform(1, 0, -0.22, 1, 0, 0); // miring seperti huruf komik
    ctx.scale(scale, scale);
    ctx.font = `900 ${px}px Archivo, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    // bayangan warna kedua bergeser
    ctx.fillStyle = YELLOW;
    ctx.fillText(word, px * 0.08, px * 0.08);
    ctx.lineWidth = px * 0.16;
    ctx.strokeStyle = INK;
    ctx.strokeText(word, 0, 0);
    ctx.fillStyle = fill;
    ctx.fillText(word, 0, 0);
    ctx.restore();
  });
}

// Reaksi elemen DOM: antisipasi → gepeng + kedip warna 1 frame (class fx-hit) → pantulan.
function react(el, strength) {
  gsap.killTweensOf(el, "scaleX,scaleY,y");
  gsap
    .timeline()
    .to(el, { scaleX: 0.94, scaleY: 1.07, y: -2, duration: 0.07, ease: "power2.out" })
    .call(() => el.classList.add("fx-hit"))
    .to(el, { scaleX: 1 + 0.16 * strength, scaleY: 1 - 0.22 * strength, y: 2, duration: 0.05, ease: "power4.out" })
    .call(() => el.classList.remove("fx-hit"), null, "+=0.05")
    .to(el, { scaleX: 1, scaleY: 1, y: 0, duration: 0.7, ease: "elastic.out(1, 0.32)" });
}

export function impact(el, x, y, name = "duar") {
  const preset = PRESETS[name] || PRESETS.duar;
  // Di layar sempit efek ikut mengecil supaya tidak menutupi seluruh layar.
  const k = Math.min(1, Math.max(0.55, window.innerWidth / 900));
  const size = preset.size * k;
  const r = 70 * size;
  ensureCanvas();
  react(el, preset.size);
  burst(x, y, r * 1.25, preset.burst);
  clouds(x, y, r, preset.clouds);
  debris(x, y, r, preset.debris);
  // Tulisan di kanan atas titik benturan; lebarnya diukur supaya tetap di dalam layar
  // (dengan cadangan untuk efek membesar 1.7x di awal).
  const px = Math.round(56 * size);
  ctx.font = `900 ${px}px Archivo, system-ui, sans-serif`;
  const half = (ctx.measureText(preset.word).width / 2) * 1.25 + 12;
  const side = x > window.innerWidth * 0.6 ? -1 : 1;
  const tx = Math.min(window.innerWidth - half, Math.max(half, x + side * r * 0.9));
  const ty = Math.max(px, y - r * 0.9);
  sfx(tx, ty, preset.word, size, preset.fill === "pop" ? RED : PAPER);
}

export function initSakuga({ reduced }) {
  if (reduced) return;
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-fx]");
    if (!el) return;
    // klik keyboard (Enter/Spasi) tidak punya koordinat: pakai tengah elemen
    const b = el.getBoundingClientRect();
    const fromPointer = e.detail > 0 && (e.clientX || e.clientY);
    const x = fromPointer ? e.clientX : b.left + b.width / 2;
    const y = fromPointer ? e.clientY : b.top + b.height / 2;
    impact(el, x, y, el.dataset.fx);
  });
}
