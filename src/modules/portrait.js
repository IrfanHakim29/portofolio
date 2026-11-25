import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { rgb01 } from "./palette.js";

// ------------------------------------------------------------
// Foto sebagai lukisan tinta (sumi-e) yang muncul dari kertas kosong.
// Saat discroll: tetesan tinta jatuh dari atas, pecah memercik di kertas,
// lalu merembes melebar dengan tepi yang tidak rata. Latar hitam foto
// menjadi tinta, sosoknya tetap kertas, jadi figur muncul dari ruang kosong.
// Digambar ulang hanya saat progres scroll atau ukuran layar berubah.
// ------------------------------------------------------------

const DROPS = 6;

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2  uRes;               // ukuran canvas (px)
uniform vec4  uRect;              // posisi foto: x, y (dari atas), w, h (px)
uniform float uProg;              // 0 kertas kosong → 1 lukisan jadi
uniform float uDpr;
uniform vec3  uPaper;
uniform vec3  uInk;
uniform vec4  uDrops[${DROPS}];   // x, y (px), radius akhir (px), waktu mulai (0..1)
uniform vec2  uSafe;              // tinta tidak boleh melewati batas ini (x minimum, y minimum, px)

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.07; a *= 0.5; }
  return v;
}
float photoLum(vec2 px) {
  vec2 uv = (px - uRect.xy) / uRect.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
  return dot(texture2D(uTex, uv).rgb, vec3(0.299, 0.587, 0.114));
}

const float FALL = 0.07;  // lama tetesan jatuh (dalam satuan progres)
const float GROW = 0.42;  // lama tinta merembes

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float s = uDpr;

  // kertas washi: serat halus
  float fiber = fbm(px / (2.5 * s)) * 0.6 + fbm(vec2(px.x / (40.0 * s), px.y / (3.0 * s))) * 0.4;
  vec3 col = uPaper * (0.955 + 0.06 * fiber);

  vec2 q = px / (140.0 * s);
  float edgeA = fbm(q);
  float edgeB = fbm(q * 4.3 + 11.0);

  float stain = 0.0;   // genangan tinta yang merembes
  float drop = 0.0;    // tetesan yang sedang jatuh
  float splat = 0.0;   // percikan kecil

  for (int i = 0; i < ${DROPS}; i++) {
    vec4 d = uDrops[i];
    float t = (uProg - d.w) / FALL;
    if (t <= 0.0) continue;

    if (t < 1.0) {
      // tetesan jatuh: lonjong, makin cepat ke bawah
      float y = mix(-40.0 * s, d.y, t * t);
      vec2 dp = px - vec2(d.x, y);
      dp.y *= dp.y < 0.0 ? 0.45 : 1.0; // ekor di atas
      float r = 8.0 * s;
      drop = max(drop, smoothstep(r, r - 1.5 * s, length(dp)));
      continue;
    }

    float after = uProg - d.w - FALL;
    float g = clamp(after / GROW, 0.0, 1.0);
    float grow = 1.0 - pow(1.0 - g, 3.0);
    float r = d.z * (0.08 + 0.92 * grow);
    float rr = r * (0.74 + 0.42 * edgeA + 0.16 * edgeB);
    float dist = length(px - d.xy);
    stain = max(stain, smoothstep(rr, rr - 2.5 * s, dist));

    // percikan saat menghantam kertas
    float burst = clamp(after / 0.05, 0.0, 1.0);
    for (int k = 0; k < 10; k++) {
      float fk = float(k) + float(i) * 17.0;
      float a = hash(vec2(fk, 1.3)) * 6.2831;
      float dd = d.z * (0.16 + 0.55 * hash(vec2(fk, 2.7))) * (0.35 + 0.65 * burst);
      vec2 sp = d.xy + vec2(cos(a), sin(a)) * dd;
      float sr = s * (1.5 + 6.5 * hash(vec2(fk, 5.1))) * burst;
      splat = max(splat, smoothstep(sr, sr - 1.2 * s, length(px - sp)));
    }
  }

  // Tinta berhenti sebelum teks & menu, dengan tepi bergerigi seperti serat kertas.
  float jag = (edgeA - 0.5) * 70.0 * s + (edgeB - 0.5) * 24.0 * s;
  float safe = smoothstep(uSafe.x + jag, uSafe.x + jag + 22.0 * s, px.x) * smoothstep(uSafe.y + jag, uSafe.y + jag + 22.0 * s, px.y);
  // tepi bawah juga bergerigi, supaya tidak terlihat terpotong lurus oleh section berikutnya
  float floorY = uRes.y - 46.0 * s;
  safe *= 1.0 - smoothstep(floorY + jag, floorY + jag + 22.0 * s, px.y);
  stain *= safe;
  splat *= safe;

  // Di dalam genangan, foto menentukan kepekatan: latar hitam = tinta penuh,
  // sosok yang terang = kertas yang tidak terkena tinta.
  float L = smoothstep(0.05, 0.5, photoLum(px));
  float inkAmt = stain * (1.0 - L);
  // tinta menggenang lebih pekat di tepinya, dan sedikit berbintik
  float rim = stain * (1.0 - stain) * 3.2;
  inkAmt = clamp(inkAmt * (0.86 + 0.14 * edgeB) + rim * 0.35, 0.0, 1.0);

  float a = clamp(max(inkAmt, max(drop, splat)), 0.0, 1.0);
  col = mix(col, uInk, a);
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

// Posisi foto 960×1280: sosoknya ± 66% dari kiri foto.
// Layar lebar: di kanan. Layar tegak (HP): di tengah-bawah, di bawah teks.
function layout(W, H, aspect) {
  if (W >= H) {
    const h = H * 1.4;
    const w = h * aspect;
    return [W * 0.74 - w * 0.66, H - h, w, h];
  }
  const w = W * 1.3;
  const h = w / aspect;
  return [W * 0.55 - w * 0.66, H - h, w, h];
}

// Titik jatuh tetesan, relatif terhadap kotak foto: [x, y, radius (× lebar foto), mulai]
const DROP_PLAN = [
  [0.66, 0.58, 0.5, 0.04],
  [0.6, 0.27, 0.3, 0.14],
  [0.45, 0.78, 0.36, 0.24],
  [0.86, 0.74, 0.32, 0.31],
  [0.66, 0.94, 0.4, 0.38],
  [0.8, 0.42, 0.3, 0.46],
];

// Area yang harus tetap bersih dari tinta: teks di kiri (layar lebar) atau di atas (HP), dan menu.
function safeArea(W, H) {
  const stage = document.querySelector("[data-stage]");
  const text = stage.querySelector("[data-manifesto]").getBoundingClientRect();
  const box = stage.getBoundingClientRect();
  const k = W / box.width;
  const nav = 84 * k;
  if (W >= H) return [(text.right - box.left + 28) * k, nav];
  const hanko = stage.querySelector("[data-hanko]");
  const bottom = Math.max(text.bottom, hanko ? hanko.getBoundingClientRect().bottom : 0);
  return [0, Math.max(nav, (bottom - box.top + 24) * k)];
}

export function initStage({ reduced }) {
  const stage = document.querySelector("[data-stage]");
  const canvas = stage?.querySelector("[data-portrait]");
  const src = canvas?.dataset.src;
  if (!canvas || !src) return;

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return;

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn("[stage] WebGL gagal, pakai foto biasa.", err);
    return;
  }
  gl.useProgram(prog);
  stage.classList.add("has-gl");

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  ["uTex", "uRes", "uRect", "uProg", "uDpr", "uPaper", "uInk", "uDrops", "uSafe"].forEach((n) => (u[n] = gl.getUniformLocation(prog, n)));
  gl.uniform3fv(u.uPaper, rgb01("paper"));
  gl.uniform3fv(u.uInk, rgb01("deep"));

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
  gl.uniform1i(u.uTex, 0);

  const state = { prog: reduced ? 1 : 0 };
  let aspect = 3 / 4;
  let dpr = 1;
  let visible = true;
  let drawn = "";

  const img = new Image();
  img.onload = () => {
    aspect = img.naturalWidth / img.naturalHeight;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    drawn = "";
    render();
  };
  img.src = src;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    drawn = "";
  };

  function render() {
    const key = [state.prog.toFixed(4), canvas.width, canvas.height, aspect].join();
    if (key === drawn) return;
    drawn = key;
    const W = canvas.width;
    const H = canvas.height;
    const rect = layout(W, H, aspect);
    const drops = new Float32Array(DROPS * 4);
    DROP_PLAN.forEach(([fx, fy, fr, start], i) => {
      drops.set([rect[0] + rect[2] * fx, rect[1] + rect[3] * fy, rect[2] * fr, start], i * 4);
    });
    gl.uniform2f(u.uRes, W, H);
    gl.uniform4f(u.uRect, ...rect);
    gl.uniform1f(u.uProg, state.prog);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform4fv(u.uDrops, drops);
    gl.uniform2f(u.uSafe, ...safeArea(W, H));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  new ResizeObserver(() => {
    resize();
    render();
  }).observe(canvas);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  gsap.ticker.add(() => {
    if (visible && !document.hidden) render();
  });
  return state;
}

// Section di-pin: tinta jatuh dan merembes sementara kalimat menyala kata per kata,
// lalu stempel hanko merah tercap di akhir.
export function initStageScroll(state) {
  const stage = document.querySelector("[data-stage]");
  const manifesto = stage.querySelector("[data-manifesto]");
  const words = SplitText.create(manifesto, { type: "words", ignore: ".inline-img" }).words;
  const imgs = stage.querySelectorAll(".inline-img");
  const hanko = stage.querySelector("[data-hanko]");

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: stage, start: "top top", end: "+=180%", pin: true, scrub: true },
  });
  if (state) tl.fromTo(state, { prog: 0 }, { prog: 1, duration: 1 }, 0);
  tl.fromTo(words, { opacity: 0.14 }, { opacity: 1, duration: 0.2, stagger: 0.55 / words.length }, 0.05);
  tl.from(imgs, { scale: 0, rotate: -12, duration: 0.1, stagger: 0.25, ease: "back.out(2)" }, 0.15);
  if (hanko) tl.fromTo(hanko, { scale: 1.8, opacity: 0, rotate: 4 }, { scale: 1, opacity: 1, rotate: -6, duration: 0.05, ease: "back.out(3)" }, 0.9);
  tl.to({}, { duration: 0.08 });
}
