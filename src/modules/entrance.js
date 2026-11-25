import gsap from "gsap";
import { rgb01 } from "./palette.js";

// ------------------------------------------------------------
// Pintu masuk galeri: lampu gantung tua (kap enamel + bohlam Edison)
// di ruang museum gelap.
// - Lampu berayun seperti bandul: didorong kecepatan scroll & gerak mouse.
// - Tali tarik (simulasi tali Verlet) dengan bandul kayu di ujungnya:
//   tarik ke bawah lalu lepas untuk menyalakan / mematikan lampu.
// - Berkas cahaya mengikuti sudut lampu; debu hanya terlihat di dalamnya.
// Saat halaman dibuka lampu sudah menyala.
// ------------------------------------------------------------

const DUST = 120;
const SEG = 14;

export function initEntrance(canvas, { reduced }) {
  const ctx = canvas.getContext("2d");
  const wall = rgb01("deep").map((v) => Math.round(v * 255));
  const handle = document.querySelector("[data-lamp-pull]");

  let w = 0;
  let h = 0;
  let texture = null;
  let visible = false;
  let last = 0;
  let audio = null;

  const lamp = { on: true, light: 1, angle: 0.18, vel: 0, len: 0 };
  const dust = Array.from({ length: DUST }, () => ({
    x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6,
    vx: (Math.random() - 0.5) * 0.004, vy: -0.002 - Math.random() * 0.005, tw: Math.random() * 6.28,
  }));

  // tali tarik: titik-titik Verlet
  let rope = [];
  let segLen = 9;
  const drag = { active: false, x: 0, y: 0, startY: 0, pulled: 0 };

  function makeTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = Math.random() * 26 - 13;
      img.data[i] = wall[0] + n;
      img.data[i + 1] = wall[1] + n;
      img.data[i + 2] = wall[2] + n;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return ctx.createPattern(c, "repeat");
  }

  // Ujung kabel lampu (pusat kap) dan titik kait tali tarik di bibir kap.
  function lampGeom() {
    const px = w / 2;
    const py = -4;
    const a = lamp.angle;
    const bx = px + Math.sin(a) * lamp.len;
    const by = py + Math.cos(a) * lamp.len;
    const shadeW = Math.min(150, Math.max(96, w * 0.09));
    // kait tali di sisi kanan bibir kap
    const hx = bx + Math.cos(a) * shadeW * 0.36 + Math.sin(a) * shadeW * 0.42;
    const hy = by - Math.sin(a) * shadeW * 0.36 + Math.cos(a) * shadeW * 0.42;
    return { px, py, bx, by, a, shadeW, hx, hy };
  }

  function resetRope() {
    const g = lampGeom();
    rope = Array.from({ length: SEG }, (_, i) => ({ x: g.hx, y: g.hy + i * segLen, ox: g.hx, oy: g.hy + i * segLen }));
  }

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w;
    canvas.height = h;
    lamp.len = Math.max(150, h * 0.3);
    segLen = Math.max(7, h * 0.012);
    texture = makeTexture();
    resetRope();
    draw(0);
  };

  // ---------- fisika ----------
  function physics(dt, time) {
    // bandul: g/L, redaman, ditambah "angin" halus supaya tidak pernah diam mati
    const k = 9.8 / (lamp.len / 120);
    const wind = Math.sin(time * 0.7) * 0.05 + Math.sin(time * 1.9) * 0.02;
    lamp.vel += (-k * Math.sin(lamp.angle) - 0.55 * lamp.vel + wind) * dt;
    lamp.angle += lamp.vel * dt;

    const g = lampGeom();
    const grav = 1400;
    for (let i = 1; i < rope.length; i++) {
      const p = rope[i];
      const vx = (p.x - p.ox) * 0.985;
      const vy = (p.y - p.oy) * 0.985;
      p.ox = p.x;
      p.oy = p.y;
      p.x += vx;
      p.y += vy + grav * dt * dt;
    }
    rope[0].x = g.hx;
    rope[0].y = g.hy;
    const tip = rope[rope.length - 1];
    if (drag.active) {
      tip.x = drag.x;
      tip.y = drag.y;
    }
    for (let it = 0; it < 12; it++) {
      for (let i = 0; i < rope.length - 1; i++) {
        const a = rope[i];
        const b = rope[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.001;
        // tali boleh sedikit melar saat ditarik (pegas di dalam fiting)
        const rest = drag.active ? segLen * (1 + Math.min(0.35, drag.pulled / 400)) : segLen;
        const diff = (d - rest) / d;
        const ia = i === 0 ? 0 : 0.5;
        const ib = i + 1 === rope.length - 1 && drag.active ? 0 : i === 0 ? 1 : 0.5;
        a.x += dx * diff * ia;
        a.y += dy * diff * ia;
        b.x -= dx * diff * ib;
        b.y -= dy * diff * ib;
      }
      rope[0].x = g.hx;
      rope[0].y = g.hy;
    }
    // tarikan tali ikut menggoyang lampu sedikit
    if (drag.active) lamp.vel += (tip.x - g.hx) * 0.00004;
  }

  // ---------- gambar ----------
  function draw(time) {
    const L = lamp.light;
    const g = lampGeom();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = texture;
    ctx.fillRect(0, 0, w, h);

    // cahaya
    if (L > 0.01) {
      ctx.globalCompositeOperation = "lighter";
      const dir = g.a;
      const floor = h * 1.02;
      const reach = (floor - g.by) / Math.max(0.3, Math.cos(dir));
      const spread = Math.max(w * 0.34, 260);
      const ex = g.bx + Math.sin(dir) * reach;
      const ey = g.by + Math.cos(dir) * reach;
      const nx = Math.cos(dir);
      const ny = -Math.sin(dir);
      const beam = ctx.createLinearGradient(g.bx, g.by, ex, ey);
      beam.addColorStop(0, `rgba(255,224,170,${0.42 * L})`);
      beam.addColorStop(0.5, `rgba(255,220,165,${0.13 * L})`);
      beam.addColorStop(1, `rgba(255,214,160,${0.03 * L})`);
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(g.bx - nx * g.shadeW * 0.45, g.by - ny * g.shadeW * 0.45);
      ctx.lineTo(g.bx + nx * g.shadeW * 0.45, g.by + ny * g.shadeW * 0.45);
      ctx.lineTo(ex + nx * spread, ey + ny * spread);
      ctx.lineTo(ex - nx * spread, ey - ny * spread);
      ctx.closePath();
      ctx.fill();

      const pool = ctx.createRadialGradient(ex, h, 0, ex, h, spread * 1.2);
      pool.addColorStop(0, `rgba(255,226,180,${0.4 * L})`);
      pool.addColorStop(1, "rgba(255,226,180,0)");
      ctx.fillStyle = pool;
      ctx.beginPath();
      ctx.ellipse(ex, h, spread * 1.2, spread * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      const halo = ctx.createRadialGradient(g.bx, g.by, 0, g.bx, g.by, Math.max(w, h) * 0.6);
      halo.addColorStop(0, `rgba(255,222,170,${0.16 * L})`);
      halo.addColorStop(1, "rgba(255,222,170,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      for (const d of dust) {
        const px = d.x * w;
        const py = d.y * h;
        // jarak titik ke sumbu berkas cahaya
        const rx = px - g.bx;
        const ry = py - g.by;
        const along = rx * Math.sin(dir) + ry * Math.cos(dir);
        if (along < 0) continue;
        const across = Math.abs(rx * nx + ry * ny);
        const half = g.shadeW * 0.45 + (spread - g.shadeW * 0.45) * (along / reach);
        const inside = 1 - Math.min(1, across / half);
        if (inside <= 0) continue;
        ctx.fillStyle = `rgba(255,240,215,${inside * L * (0.35 + 0.35 * Math.sin(time * 1.3 + d.tw))})`;
        ctx.beginPath();
        ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // gelap: sedikit sinar bulan dari kanan atas supaya lampu tetap terlihat
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = "source-over";

    // kabel dari langit-langit
    ctx.strokeStyle = "#08071a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.px, g.py);
    ctx.lineTo(g.bx, g.by - 22);
    ctx.stroke();
    ctx.fillStyle = "#0b0a1c";
    ctx.fillRect(g.px - 34, 0, 68, 10); // rozet di langit-langit

    // kap lampu (enamel tua) + bohlam
    ctx.save();
    ctx.translate(g.bx, g.by);
    ctx.rotate(-g.a);
    const sw = g.shadeW;
    // fiting
    ctx.fillStyle = "#2a2618";
    ctx.fillRect(-9, -30, 18, 14);
    // bohlam Edison
    const glow = lamp.light;
    const bulb = ctx.createRadialGradient(0, sw * 0.32, 2, 0, sw * 0.32, sw * 0.2);
    bulb.addColorStop(0, `rgba(255,${200 + 55 * glow},${140 + 80 * glow},1)`);
    bulb.addColorStop(1, `rgba(${80 + 175 * glow},${60 + 140 * glow},${30 + 80 * glow},0.9)`);
    ctx.fillStyle = bulb;
    ctx.beginPath();
    ctx.ellipse(0, sw * 0.3, sw * 0.12, sw * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();
    if (glow > 0.05) {
      ctx.strokeStyle = `rgba(255,170,60,${glow})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath(); // filamen
      ctx.moveTo(-sw * 0.05, sw * 0.24);
      for (let i = 0; i <= 6; i++) ctx.lineTo(-sw * 0.05 + (i * sw * 0.1) / 6, sw * 0.32 + (i % 2 ? -4 : 4));
      ctx.stroke();
    }
    // kap
    const shade = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0);
    shade.addColorStop(0, "#14301f");
    shade.addColorStop(0.35, "#2f6b49");
    shade.addColorStop(0.55, "#3c8059");
    shade.addColorStop(1, "#0f2617");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(-14, -20);
    ctx.lineTo(14, -20);
    ctx.quadraticCurveTo(sw * 0.2, 0, sw / 2, sw * 0.22);
    ctx.lineTo(-sw / 2, sw * 0.22);
    ctx.quadraticCurveTo(-sw * 0.2, 0, -14, -20);
    ctx.fill();
    // bibir kap: dalam putih enamel (terang kalau menyala)
    ctx.fillStyle = `rgba(${200 + 55 * glow},${195 + 50 * glow},${170 + 40 * glow},1)`;
    ctx.beginPath();
    ctx.ellipse(0, sw * 0.22, sw / 2, sw * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0b1d12";
    ctx.lineWidth = 2;
    ctx.stroke();
    // kilap & bercak karat
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.ellipse(-sw * 0.16, sw * 0.04, sw * 0.04, sw * 0.12, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(120,70,30,0.35)";
    ctx.beginPath();
    ctx.arc(sw * 0.22, sw * 0.12, sw * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // tali tarik
    ctx.strokeStyle = "#d8cfb4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rope[0].x, rope[0].y);
    for (let i = 1; i < rope.length; i++) ctx.lineTo(rope[i].x, rope[i].y);
    ctx.stroke();
    const tip = rope[rope.length - 1];
    const bead = ctx.createRadialGradient(tip.x - 3, tip.y + 2, 1, tip.x, tip.y + 6, 10);
    bead.addColorStop(0, "#e0b67a");
    bead.addColorStop(1, "#6b4321");
    ctx.fillStyle = bead;
    ctx.beginPath();
    ctx.ellipse(tip.x, tip.y + 7, 6.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (handle) handle.style.transform = `translate(${tip.x - 22}px, ${tip.y - 14}px)`;
  }

  // ---------- saklar ----------
  function click() {
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime;
      const o = audio.createOscillator();
      const gn = audio.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(1800, t);
      o.frequency.exponentialRampToValueAtTime(300, t + 0.03);
      gn.gain.setValueAtTime(0.06, t);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(gn).connect(audio.destination);
      o.start(t);
      o.stop(t + 0.06);
    } catch {}
  }

  function toggle() {
    lamp.on = !lamp.on;
    handle?.classList.add("used");
    click();
    lamp.vel += 0.25; // lampu ikut terguncang
    gsap.killTweensOf(lamp, "light");
    if (lamp.on) {
      gsap.timeline()
        .to(lamp, { light: 0.6, duration: 0.04 })
        .to(lamp, { light: 0.1, duration: 0.06 }, "+=0.05")
        .to(lamp, { light: 1, duration: 0.25, ease: "power2.out" }, "+=0.07");
    } else {
      gsap.to(lamp, { light: 0, duration: 0.12 });
    }
    handle?.setAttribute("aria-pressed", String(lamp.on));
    handle?.setAttribute("aria-label", lamp.on ? "Turn the lamp off" : "Turn the lamp on");
  }

  if (handle) {
    const toCanvas = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    handle.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const p = toCanvas(e);
      drag.active = true;
      drag.startY = p.y;
      drag.x = p.x;
      drag.y = p.y;
      drag.pulled = 0;
      drag.moved = false;
    });
    handle.addEventListener("pointermove", (e) => {
      if (!drag.active) return;
      const p = toCanvas(e);
      const g = lampGeom();
      // tali tidak bisa ditarik lebih jauh dari panjangnya + pegas
      const max = segLen * SEG * 1.4;
      const dx = p.x - g.hx;
      const dy = p.y - g.hy;
      const d = Math.hypot(dx, dy);
      const k = d > max ? max / d : 1;
      drag.x = g.hx + dx * k;
      drag.y = g.hy + dy * k;
      drag.pulled = Math.max(0, p.y - drag.startY);
      if (Math.abs(p.y - drag.startY) > 4) drag.moved = true;
    });
    const release = () => {
      if (!drag.active) return;
      drag.active = false;
      // tarikan cukup jauh (atau klik/ketuk biasa) = saklar berpindah
      if (drag.pulled > 28 || !drag.moved) {
        if (!drag.moved) {
          const tip = rope[rope.length - 1];
          tip.oy = tip.y - 18; // ketukan: tali tersentak ke bawah lalu memantul
        }
        toggle();
      }
    };
    handle.addEventListener("pointerup", release);
    handle.addEventListener("pointercancel", release);
    handle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const tip = rope[rope.length - 1];
        tip.oy = tip.y - 18;
        toggle();
      }
    });
  }

  // mouse yang lewat dekat lampu mendorongnya pelan
  let lastMouse = null;
  canvas.parentElement.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (lastMouse) {
      const g = lampGeom();
      const near = Math.hypot(x - g.bx, y - g.by) < g.shadeW * 1.2;
      if (near) lamp.vel += gsap.utils.clamp(-0.4, 0.4, (x - lastMouse.x) * 0.006);
    }
    lastMouse = { x, y };
  });

  // scroll cepat menggoyang lampu
  let lastY = window.scrollY;
  window.addEventListener("scroll", () => {
    const dy = window.scrollY - lastY;
    lastY = window.scrollY;
    if (visible) lamp.vel += gsap.utils.clamp(-0.08, 0.08, dy * 0.0012);
  }, { passive: true });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  if (reduced) {
    lamp.angle = 0;
    return;
  }
  gsap.ticker.add((time) => {
    if (!visible || document.hidden) {
      last = time;
      return;
    }
    const dt = Math.min(1 / 30, time - last || 1 / 60);
    last = time;
    // beberapa sub-langkah supaya tali stabil
    for (let i = 0; i < 2; i++) physics(dt / 2, time);
    for (const d of dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y < -0.02) d.y = 1.02;
      if (d.x < -0.02) d.x = 1.02;
      if (d.x > 1.02) d.x = -0.02;
    }
    draw(time);
  });
}
