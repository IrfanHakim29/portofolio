import {
  siNextdotjs, siTypescript, siJavascript, siPostgresql, siReact, siExpo, siRedux, siKotlin,
  siPython, siFastapi, siFfmpeg, siFlask, siScikitlearn, siTensorflow, siKeras, siJupyter,
  siOdoo, siUnity, siDotnet, siPhp, siSupabase, siMongodb, siMysql, siDocker, siFigma, siGit,
  siGithub, siVuedotjs, siD3, siNodedotjs, siLaravel, siTailwindcss, siHtml5, siGreensock,
  siAndroidstudio, siMaterialdesign, siPrisma, siSqlite, siGo, siXml, siLinux, siVercel,
  siGithubactions,
} from "simple-icons";

// Ikon teknologi (Simple Icons, CC0), digambar satu warna mengikuti tema.
// Nama di data.js → ikon. Nama yang tidak ada di sini tampil sebagai teks saja.
const MAP = {
  "Next.js": siNextdotjs,
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  PostgreSQL: siPostgresql,
  React: siReact,
  "React Native": siReact,
  Expo: siExpo,
  "Redux Toolkit": siRedux,
  Kotlin: siKotlin,
  Python: siPython,
  FastAPI: siFastapi,
  FFmpeg: siFfmpeg,
  Flask: siFlask,
  "Scikit-learn": siScikitlearn,
  TensorFlow: siTensorflow,
  Keras: siKeras,
  "Keras Tuner": siKeras,
  Jupyter: siJupyter,
  Odoo: siOdoo,
  Unity: siUnity,
  "C#": siDotnet,
  PHP: siPhp,
  Supabase: siSupabase,
  MongoDB: siMongodb,
  MySQL: siMysql,
  Docker: siDocker,
  Figma: siFigma,
  Git: siGit,
  GitHub: siGithub,
  Vue: siVuedotjs,
  "D3.js": siD3,
  "Node.js": siNodedotjs,
  Laravel: siLaravel,
  Tailwind: siTailwindcss,
  "HTML/CSS": siHtml5,
  GSAP: siGreensock,
  "Android Studio": siAndroidstudio,
  "Material 3": siMaterialdesign,
  Prisma: siPrisma,
  SQLite: siSqlite,
  Go: siGo,
  XML: siXml,
  Linux: siLinux,
  Vercel: siVercel,
  "GitHub Actions": siGithubactions,
};

export const hasIcon = (name) => Boolean(MAP[name]);

export function icon(name, cls = "ico") {
  const si = MAP[name];
  if (!si) return "";
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${si.path}" fill="currentColor"/></svg>`;
}

// "ikon Nama" per alat, dipisah titik tengah.
export function toolList(tools, cls = "tools") {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  return `<span class="${cls}">${tools
    .map((t) => `<span class="tool" translate="no">${icon(t)}<span>${esc(t)}</span></span>`)
    .join("")}</span>`;
}

// Hanya ikon (untuk sampul & tempat sempit); alat tanpa ikon dilewati.
export function iconRow(tools, cls = "icons") {
  const seen = new Set();
  const items = tools.filter((t) => MAP[t] && !seen.has(MAP[t]) && seen.add(MAP[t]));
  return `<span class="${cls}">${items.map((t) => icon(t)).join("")}</span>`;
}
