import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ------------------------------------------------------------
// Benang merah (akai ito) yang menghubungkan karya.
//
// Galeri: benang tergantung dari paku di atas tiap bingkai, melengkung
// karena beratnya sendiri, terurai mengikuti scroll, dan berayun seperti
// benang sungguhan: makin kencang scroll, makin jauh benang tertinggal
// lalu memantul kembali (pegas teredam).
//
// Daftar project: benang turun menyusuri sisi kiri, bersimpul di tiap
// baris, dan berakhir dengan rumbai di project terakhir.
// ------------------------------------------------------------

const $ = (s, r = document) => r.querySelector(s);

// Pegas teredam sederhana untuk ayunan benang.
function spring(stiff = 90, damp = 9) {
  const s = { x: 0, v: 0, target: 0 };
  s.step = (dt) => {
    const a = -stiff * (s.x - s.target) - damp * s.v;
    s.v += a * dt;
    s.x += s.v * dt;
    return Math.abs(s.v) > 0.05 || Math.abs(s.x - s.target) > 0.05;
  };
  return s;
}

function setPaths(svg, d) {
  // hanya path benang (anak langsung); jarum & rumbai punya path sendiri
  svg.querySelectorAll(":scope > path").forEach((p) => p.setAttribute("d", d));
}

// ---------- galeri horizontal ----------
// Benang dijahit oleh jarum: kosong saat galeri pertama terlihat, lalu
// memanjang dari paku pertama mengikuti progres scroll. Karena lukisan
// bergeser ke kiri sementara benang memanjang ke kanan, jarumnya tampak
// diam di layar seperti mesin jahit, dan lukisan lewat di bawahnya.
export function initGalleryThread(scrollTween) {
  const section = $("[data-works]");
  const track = $("[data-works-track]", section);
  const svg = $("[data-thread]", track);
  const outro = $(".works__outro", track);
  if (!svg) return;
  const line = $(".thread__line", svg);
  const shadow = $(".thread__shadow", svg);
  const needle = $("[data-needle]", svg);
  const strands = [...svg.querySelectorAll(":scope > path")];

  let pts = [];
  let samples = []; // [panjang, x] di sepanjang benang
  let len = 0;
  const sway = spring(70, 7);
  const drop = spring(110, 9);

  function measure() {
    const tr = track.getBoundingClientRect();
    const nails = [...track.querySelectorAll("[data-nail]")].map((n) => {
      const r = n.getBoundingClientRect();
      return [r.left + r.width / 2 - tr.left, r.top + r.height / 2 - tr.top];
    });
    if (!nails.length) return;
    const o = outro.getBoundingClientRect();
    pts = [...nails, [o.left + o.width / 2 - tr.left, nails[0][1] - 10]];
    svg.setAttribute("width", track.scrollWidth);
    svg.setAttribute("height", track.offsetHeight);
    draw();
    paint();
  }

  function draw() {
    if (!pts.length) return;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const k = 0.75 + 0.25 * Math.sin(i * 1.7);
      const sag = Math.min((bx - ax) * 0.06, 40) + drop.x * k;
      d += ` Q${(ax + bx) / 2 - sway.x * k},${Math.max(ay, by) + sag * 2} ${bx},${by}`;
    }
    setPaths(svg, d);
    len = line.getTotalLength();
    samples = [];
    const N = 160;
    for (let i = 0; i <= N; i++) samples.push([(len * i) / N, line.getPointAtLength((len * i) / N).x]);
    strands.forEach((p) => (p.style.strokeDasharray = `${len} ${len}`));
  }

  // panjang benang yang sudah dijahit, dari progres scroll
  function paint() {
    if (!samples.length) return;
    const p = scrollTween.scrollTrigger?.progress ?? 0;
    const x0 = pts[0][0];
    const x1 = pts[pts.length - 1][0];
    const tipX = x0 + (x1 - x0) * gsap.utils.clamp(0, 1, p * 1.04 - 0.02);
    let L = 0;
    for (const [l, x] of samples) {
      if (x > tipX) break;
      L = l;
    }
    const off = len - L;
    strands.forEach((p) => (p.style.strokeDashoffset = off));
    if (needle) {
      const a = line.getPointAtLength(Math.max(0, L - 2));
      const b = line.getPointAtLength(Math.min(len, L + 2));
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      needle.setAttribute("transform", `translate(${b.x},${b.y}) rotate(${ang})`);
      needle.style.opacity = L > 4 && L < len - 4 ? 1 : 0;
    }
  }

  let moving = false;
  gsap.ticker.add((time, deltaMs) => {
    const st = scrollTween.scrollTrigger;
    if (!st) return;
    const v = st.getVelocity();
    sway.target = gsap.utils.clamp(-160, 160, v * 0.06);
    drop.target = gsap.utils.clamp(0, 18, Math.abs(v) * 0.008);
    const dt = Math.min(0.05, deltaMs / 1000);
    const a = sway.step(dt);
    const b = drop.step(dt);
    if (a || b || moving) draw();
    moving = a || b;
    paint();
  });

  ScrollTrigger.addEventListener("refresh", measure);
  measure();
  return () => ScrollTrigger.removeEventListener("refresh", measure);
}

// ---------- daftar project (vertikal) ----------
export function initArchiveThread() {
  const body = $(".archive__body");
  const svg = $("[data-vthread]", body);
  const knotsG = $("[data-knots]", svg);
  const tassel = $("[data-tassel]", svg);
  const line = $(".thread__line", svg);
  const shadow = $(".thread__shadow", svg);
  if (!svg) return;

  let rows = [];
  let len = 0;
  let x = 0;
  const sway = spring(60, 6);

  function measure() {
    const b = body.getBoundingClientRect();
    x = Math.max(8, Math.min(20, b.left / 2));
    rows = [...body.querySelectorAll(".row")].map((r) => {
      const rr = r.getBoundingClientRect();
      return rr.top + rr.height / 2 - b.top;
    });
    svg.setAttribute("width", 60);
    svg.setAttribute("height", body.offsetHeight + 120);
    svg.style.left = `${-b.left}px`;
    knotsG.innerHTML = rows.map((y) => `<circle cx="${x}" cy="${y}" r="4.2" class="vthread__knot" style="opacity:0" />`).join("");
    const end = rows[rows.length - 1] ?? 0;
    tassel.innerHTML = [-4, -2, 0, 2, 4]
      .map((dx) => `<path d="M${x},${end + 6} q${dx * 0.6},20 ${dx * 1.4},${44 + Math.abs(dx)}" class="vthread__fringe" />`)
      .join("") + `<rect x="${x - 4}" y="${end + 2}" width="8" height="10" rx="2" class="vthread__cap" />`;
    draw();
  }

  function draw() {
    const end = rows[rows.length - 1] ?? 0;
    const bend = sway.x;
    const d = `M${x},-40 C${x + bend},${end * 0.33} ${x - bend},${end * 0.66} ${x},${end}`;
    setPaths(svg, d);
    len = line.getTotalLength();
    line.style.strokeDasharray = shadow.style.strokeDasharray = `${len} ${len}`;
  }

  // Benang turun mengikuti scroll; simpul muncul saat benang melewati barisnya.
  let progress = 0;
  const st = ScrollTrigger.create({
    trigger: body,
    start: "top 70%",
    end: "bottom 75%",
    onUpdate: (self) => {
      progress = self.progress;
      sway.target = gsap.utils.clamp(-26, 26, self.getVelocity() * 0.012);
      paint();
    },
  });

  function paint() {
    const end = rows[rows.length - 1] ?? 1;
    const off = len * (1 - progress);
    line.style.strokeDashoffset = shadow.style.strokeDashoffset = off;
    const reach = (end + 40) * progress - 40;
    knotsG.querySelectorAll("circle").forEach((c, i) => (c.style.opacity = rows[i] <= reach ? 1 : 0));
    tassel.style.opacity = progress > 0.985 ? 1 : 0;
  }

  gsap.ticker.add((time, deltaMs) => {
    if (sway.step(Math.min(0.05, deltaMs / 1000))) {
      draw();
      paint();
    }
  });

  ScrollTrigger.addEventListener("refresh", measure);
  measure();
  paint();
  return () => {
    st.kill();
    ScrollTrigger.removeEventListener("refresh", measure);
  };
}
