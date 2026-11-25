import { profile, reel, about, stack, projects, capabilities, experience } from "./data.js";
import { icon, toolList } from "./icons.js";

const $ = (s) => document.querySelector(s);
const pad = (n) => String(n).padStart(2, "0");
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// *word* -> <em>word</em>. Tanda baca sesudahnya diikat (nowrap) supaya
// koma/titik tidak terlempar sendirian ke baris baru setelah teks dipecah SplitText.
const rich = (s) =>
  esc(s).replace(/\*(.+?)\*([.,!?;:]?)/g, (_, w, p) => (p ? `<span class="nowrap"><em>${w}</em>${p}</span>` : `<em>${w}</em>`));

const STAR = `<svg viewBox="-24 -24 48 48" aria-hidden="true"><g fill="currentColor"><rect x="-4" y="-24" width="8" height="48"/><rect x="-4" y="-24" width="8" height="48" transform="rotate(60)"/><rect x="-4" y="-24" width="8" height="48" transform="rotate(120)"/></g></svg>`;
const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

// Placeholder grafis untuk gambar yang belum ada (warna dari token tema di CSS).
const SWATCHES = [
  { bg: "var(--pop)", fg: "#ffffff", pattern: "stripes" },
  { bg: "var(--soft)", fg: "var(--deep)", pattern: "grid" },
  { bg: "var(--deep-2)", fg: "var(--on-deep)", pattern: "dots" },
  { bg: "var(--paper)", fg: "var(--deep)", pattern: "rings" },
];

// Sampul poster untuk project yang belum punya screenshot: nama, angka, ikon stack.
// Ukurannya pakai container query, jadi rapi dari thumbnail 88px sampai kartu besar.
const COVERS = ["yellow", "green", "paper"];
function cover(p, i) {
  return `<span class="cover cover--${COVERS[i % COVERS.length]}" role="img" aria-label="${esc(p.title)}">
    <span class="cover__top"><span>${pad(i + 1)}</span><span>${esc(p.year)}</span></span>
    <span class="cover__title" translate="no">${esc(p.title)}</span>
    <span class="cover__mono" aria-hidden="true">${esc(p.title.charAt(0))}</span>
    ${p.stat ? `<span class="cover__stat"><b>${esc(p.stat.value)}</b>${esc(p.stat.label)}</span>` : ""}
    ${toolList(p.stack, "tools cover__tools")}
  </span>`;
}
const projectMedia = (p, i, opts = {}) =>
  p.image || p.video ? media({ image: p.image, video: p.video, alt: p.title, i, ...opts }) : cover(p, i);

// video > gambar > placeholder.
// autoplay: video diputar/dijeda otomatis sesuai terlihat di layar (lihat modules/video.js).
function media({ image, video, alt = "", i = 0, label = "", autoplay = true }) {
  if (video) {
    return `<video src="${esc(video)}"${image ? ` poster="${esc(image)}"` : ""} muted loop playsinline preload="none"${
      autoplay ? " data-autoplay" : ""
    } aria-label="${esc(alt)}"></video>`;
  }
  if (image) return `<img src="${esc(image)}" alt="${esc(alt)}" loading="lazy" decoding="async" />`;
  const s = SWATCHES[i % SWATCHES.length];
  // <span>, bukan <div>: placeholder juga dipakai di dalam <p> dan <h1>.
  return `<span class="ph ph--${s.pattern}" style="--ph-bg:${s.bg};--ph-fg:${s.fg}" role="img" aria-label="${esc(alt)}">${
    label ? `<span class="ph__label">${esc(label)}</span>` : ""
  }</span>`;
}

// Bingkai lukisan emas berukir (seperti bingkai lukisan klasik di museum).
const CORNER = `<svg class="frame__c" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="url(#gold)" stroke-linecap="round"><path d="M8 44 C 8 22 22 8 44 8" stroke-width="5"/><path d="M15 54 C 11 30 30 11 54 15" stroke-width="2.5"/><path d="M44 8 c 9 0 11 9 5 11 c -4 1 -6 -3 -3 -5" stroke-width="3"/><path d="M8 44 c 0 9 9 11 11 5 c 1 -4 -3 -6 -5 -3" stroke-width="3"/></g><circle cx="17" cy="17" r="9.5" fill="url(#gold)" stroke="#4a3208" stroke-width="1.4"/><circle cx="17" cy="17" r="4" fill="#7a5413"/></svg>`;
const FRAME_CORNERS = ["tl", "tr", "br", "bl"].map((c) => CORNER.replace('class="frame__c"', `class="frame__c frame__c--${c}"`)).join("");
const framed = (inner, cls = "") => `<div class="frame ${cls}">${inner}${FRAME_CORNERS}</div>`;

const featured = projects.filter((p) => p.featured);
const projectUrl = (p) => p.links?.live || p.links?.repo || "";
const linkAttrs = (url) => (url ? `href="${esc(url)}" target="_blank" rel="noopener"` : "");

function renderNav() {
  $("[data-nav]").innerHTML = `
    <a href="#top" class="nav__logo" aria-label="Back to top" translate="no">${esc(profile.initials)}</a>
    <nav class="nav__links" aria-label="Primary" translate="no">
      <a href="#work" data-fx="syut">Work</a><span>,</span>
      <a href="#about" data-fx="syut">About</a><span>,</span>
      <a href="#contact" data-fx="syut">Contact</a>
    </nav>`;
}

function renderHero() {
  const lines = profile.nameLines.slice(0, 3);
  const caption = `<span class="hero__caption">${profile.caption.map(esc).join("<br />")}</span>`;
  const text = (s) => `<span class="hero__text" data-hero-text translate="no">${esc(s)}</span>`;

  const lineHtml = lines
    .map((word, i) => {
      let inner = text(word);
      if (i === 0) inner += `<span class="hero__star" data-fx="duar" title="Klik aku">${STAR}</span>`;
      if (i === 1) inner = `<span class="hero__pill" data-pill></span>` + inner;
      if (i === lines.length - 1 && i > 0) inner += caption;
      return `<span class="hero__line hero__line--${i + 1}" data-fit-line>${inner}</span>`;
    })
    .join("");

  $("[data-hero]").innerHTML = `
    <h1 class="hero__name" data-fit data-fit-max="${lines.length > 2 ? 24 : 34}" aria-label="${esc(profile.fullName)}">${lineHtml}</h1>

    <!-- Di HP, video tampil di jendela besar ini (bukan kapsul kecil). -->
    <span class="hero__window" data-pill aria-hidden="true"></span>

    <p class="hero__tagline">${rich(profile.tagline)}</p>

    <div class="reel" data-reel>
      <div class="reel__media">
        ${
          reel.video
            ? `<video src="${esc(reel.video)}"${reel.poster ? ` poster="${esc(reel.poster)}"` : ""} muted loop playsinline autoplay preload="auto" data-reel-video></video>`
            : `<canvas data-entrance aria-hidden="true"></canvas>`
        }
      </div>
      ${reel.video ? "" : `<button type="button" class="lamp-pull" data-lamp-pull aria-pressed="true" aria-label="Turn the lamp off"><span>Pull</span></button>`}
      <div class="reel__hud" aria-hidden="true">
        <span class="hud reel__rec">Gallery I</span>
        <span class="hud reel__tc">Free entry</span>
        <span class="hud reel__cap">Exhibition · Selected work, 2023 to now</span>
      </div>
      ${reel.video ? `<button type="button" class="reel__sound" data-sound>Sound off</button>` : ""}
      <div class="reel__lines">
        ${reel.lines.map((l) => `<span class="reel__line" translate="no"><span>${rich(l)}</span></span>`).join("")}
      </div>
    </div>`;
}

function renderWorks() {
  const cards = featured
    .map((p, i) => {
      const url = projectUrl(p);
      const tag = url ? "a" : "div";
      return `
      <article class="card">
        <${tag} class="card__link" ${linkAttrs(url)}>
          <div class="card__art">
            <i class="card__light" aria-hidden="true"></i>
            <i class="card__nail" data-nail aria-hidden="true"></i>
            ${framed(`<div class="card__media"><div class="card__img" data-card-img>${projectMedia(p, i)}</div></div>`)}
          </div>
          <div class="card__info placard">
            <span class="num card__num" translate="no">No. ${pad(i + 1)}</span>
            <h3 class="card__title" translate="no">${esc(p.title)}</h3>
            <p class="card__sub">${esc(p.type)}, <span translate="no">${esc(p.year)}</span></p>
            ${p.stat ? `<p class="card__stat"><strong translate="no">${esc(p.stat.value)}</strong><span>${esc(p.stat.label)}</span></p>` : ""}
            <p class="card__desc">${esc(p.description)}</p>
            <p class="card__meta"><span class="card__medium" translate="no">Medium</span>${toolList(p.stack)}</p>
          </div>
        </${tag}>
      </article>`;
    })
    .join("");

  $("[data-works]").innerHTML = `
    <div class="works__pin" data-works-pin>
      <div class="works__top">
        <span class="label">Gallery I · Selected work</span>
        <span class="num" translate="no"><span data-works-current>01</span>/${pad(featured.length)}</span>
      </div>
      <div class="works__track" data-works-track>
        <svg class="thread" data-thread aria-hidden="true"><path class="thread__shadow" /><path class="thread__glow" /><path class="thread__line" /><g class="needle" data-needle style="opacity:0"><path d="M-2,0 L30,-1.6 L34,0 L30,1.6 Z" fill="url(#steel)" /><ellipse cx="4" cy="0" rx="3.2" ry="1" fill="none" stroke="#3a3f47" stroke-width="0.8" /></g></svg>
        <div class="works__intro">
          <h2 class="display" translate="no">Selected<br /><em>work</em></h2>
          <p>Client work, my own products and research projects, across web, Android and machine learning.</p>
        </div>
        ${cards}
        <div class="works__outro">
          <a href="#archive" class="label">All projects ↓</a>
        </div>
      </div>
      <div class="works__bar"><span data-works-progress></span></div>
    </div>`;
}

function renderArchive() {
  const rows = projects
    .map((p, i) => {
      const url = projectUrl(p);
      const tag = url ? "a" : "div";
      return `
      <li class="row" data-row="${i}">
        <${tag} class="row__link" ${linkAttrs(url)}>
          <span class="num row__num">${pad(i + 1)}</span>
          <span class="row__thumb">${projectMedia(p, i)}</span>
          <span class="row__title" translate="no">${esc(p.title)}</span>
          <span class="row__type">${esc(p.type)}</span>
          <span class="row__stack">${toolList(p.stack, "tools row__tools")}</span>
          <span class="num row__year" translate="no">${esc(p.year)}</span>
          <span class="row__arrow">${ARROW}</span>
        </${tag}>
        <i data-rule></i>
      </li>`;
    })
    .join("");

  $("[data-archive]").innerHTML = `
    <h2 class="display" data-reveal-lines translate="no">All <em>projects</em></h2>
    <div class="archive__head label" aria-hidden="true">
      <span></span><span>Project</span><span>Type</span><span>Built with</span><span>Year</span><span></span>
    </div>
    <div class="archive__body">
      <svg class="vthread" data-vthread aria-hidden="true"><path class="thread__shadow" /><path class="thread__line" /><g class="vthread__knots" data-knots></g><g class="vthread__tassel" data-tassel></g></svg>
      <ul class="archive__list" data-archive-list>${rows}</ul>
    </div>`;

  $("[data-preview-frame]").insertAdjacentHTML("beforeend", FRAME_CORNERS);

  // Video di preview tidak autoplay; diputar hanya saat barisnya di-hover.
  $("[data-preview-inner]").innerHTML = projects
    .map((p, i) => `<div class="preview__item">${projectMedia(p, i, { autoplay: false })}</div>`)
    .join("");
}

function renderAbout() {
  let n = 0;
  const statement = rich(about.statement).replace(/\[img\]/g, () => {
    const i = n++;
    const src = about.inlineImages?.[i];
    const isVideo = /\.(mp4|webm|mov)$/i.test(src || "");
    return `<span class="inline-img">${media({ image: isVideo ? null : src, video: isVideo ? src : null, i: i * 2 })}</span>`;
  });

  // Foto/video dirender oleh shader di modules/portrait.js; <img> hanya cadangan tanpa WebGL.
  const portraitSrc = profile.photo || "";
  $("[data-stage]").innerHTML = `
    <canvas class="stage__canvas" data-portrait data-src="${esc(portraitSrc)}" aria-hidden="true"></canvas>
    ${profile.photo ? `<img class="stage__fallback" src="${esc(profile.photo)}" alt="${esc(profile.fullName)}" />` : ""}
    <p class="manifesto" data-manifesto>${statement}</p>
    <div class="hanko" data-hanko aria-hidden="true" translate="no"><span>イルファン</span></div>`;

  // Bio sebagai katalog pameran tua yang terbuka (halaman kanan membuka saat discroll).
  const [first, ...rest] = about.bio;
  $("[data-about]").innerHTML = `
    <div class="book" data-book>
      <div class="book__page book__page--l">
        <p class="book__run" translate="no">Exhibition catalogue · ${esc(profile.fullName)}</p>
        <h2 class="book__h">On the <em>artist</em></h2>
        <p class="book__lead">${esc(first)}</p>
        ${rest.map((p) => `<p>${esc(p)}</p>`).join("")}
        <span class="book__folio" translate="no">12</span>
      </div>
      <div class="book__leaf" data-book-leaf>
        <div class="book__page book__page--r">
          <p class="book__run" translate="no">Plate I</p>
          <h3 class="book__h book__h--sm">Particulars</h3>
          <dl class="book__facts">
            ${about.facts.map((f) => `<div><dt>${esc(f.label)}</dt><i></i><dd>${esc(f.value)}</dd></div>`).join("")}
          </dl>
          <p class="book__sign" translate="no">${esc(profile.shortName)}</p>
          <span class="book__seal" aria-hidden="true" translate="no">イルファン</span>
          <span class="book__folio" translate="no">13</span>
        </div>
        <div class="book__cover" aria-hidden="true">
          <span class="book__cover-t" translate="no">${esc(profile.fullName)}</span>
          <span class="book__cover-s">Selected works &amp; notes</span>
        </div>
      </div>
    </div>`;
}

// Skill sebagai laci koleksi spesimen museum: tiap alat "dipajang" dengan jarum & label tulisan tangan.
function renderCaps() {
  $("[data-caps]").innerHTML = `
    <h2 class="display" data-reveal-lines translate="no">The <em>collection</em></h2>
    <p class="caps__intro">Tools I work with, sorted into drawers. Every specimen here has been used in a real project.</p>
    <ol class="drawers">
      ${capabilities
        .map(
          (c, i) => `
        <li class="drawer" data-drawer>
          <div class="drawer__front">
            <span class="drawer__plate" translate="no">Drawer ${["I", "II", "III", "IV", "V", "VI"][i]} · ${esc(c.title)}</span>
            <span class="drawer__knob" aria-hidden="true"></span>
          </div>
          <div class="drawer__box">
            <ul class="specimens">
              ${c.tools
                .map(
                  (t, k) => `<li class="spec" style="--r:${((k * 37) % 9) - 4}deg">
                    <i class="spec__pin" aria-hidden="true"></i>
                    <span class="spec__icon">${icon(t) || `<b>${esc(t.charAt(0))}</b>`}</span>
                    <span class="spec__label" translate="no">${esc(t)}<small>fig. ${i + 1}.${k + 1}</small></span>
                  </li>`
                )
                .join("")}
            </ul>
          </div>
          <p class="drawer__note">${esc(c.description)}</p>
        </li>`
        )
        .join("")}
    </ol>`;
}

// Pengalaman sebagai gulungan kakejiku yang terbuka ke bawah mengikuti scroll.
function renderExp() {
  const year = (p) => (p || "").match(/d{4}/)?.[0] || "";
  $("[data-exp]").innerHTML = `
    <div class="exp__grid">
      <div class="exp__head">
        <h2 class="display" data-reveal-lines translate="no">Work<br /><em>experience</em></h2>
        <p class="exp__note">Unroll the scroll to read it.</p>
      </div>
      <div class="kake" data-kake>
        <div class="kake__rod kake__rod--top" aria-hidden="true"><i></i></div>
        <div class="kake__paper" data-kake-paper>
          <ol class="kake__list">
            ${experience
              .map(
                (e) => `
              <li class="kake__entry">
                ${year(e.period) ? `<span class="kake__stamp" translate="no">${year(e.period)}</span>` : `<span class="kake__stamp kake__stamp--blank" aria-hidden="true">印</span>`}
                <div>
                  <h3 class="kake__role">${esc(e.role)}</h3>
                  <p class="kake__place"><span translate="no">${esc(e.place)}</span> · ${esc(e.location)}</p>
                  ${e.period ? `<p class="kake__period" translate="no">${esc(e.period)}</p>` : ""}
                </div>
              </li>`
              )
              .join('<li class="kake__stroke" aria-hidden="true"></li>')}
          </ol>
        </div>
        <div class="kake__rod kake__rod--bottom" data-kake-rod aria-hidden="true"><i></i></div>
      </div>
    </div>`;
}

function renderContact() {
  $("[data-contact]").innerHTML = `
    <h2 class="contact__title" data-reveal-lines>Have something<br class="br-wide" /> to build? <em>Email me.</em></h2>

    <div class="contact__mail">
      <a href="mailto:${esc(profile.email)}" data-fx="ting">${esc(profile.email)}</a>
      <button type="button" class="btn" data-copy="${esc(profile.email)}" data-fx="duar">Copy</button>
    </div>

    <div class="contact__grid">
      <p class="contact__note">${esc(profile.lookingFor)} Based in ${esc(profile.place)}, Indonesia, where it's <span data-clock>--:--</span> right now.</p>
      <ul class="contact__socials">
        ${profile.socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" data-fx="klik">${icon(s.label)}${esc(s.label)} ${ARROW}</a></li>`).join("")}
        ${profile.resume ? `<li><a href="${esc(profile.resume)}" target="_blank" rel="noopener">CV ${ARROW}</a></li>` : ""}
      </ul>
    </div>

    <div class="contact__bottom">
      <span>© ${new Date().getFullYear()} ${esc(profile.fullName)}</span>
      <button type="button" data-to-top data-fx="syut">Back to top ↑</button>
    </div>

    <div class="contact__giant" data-fit aria-hidden="true"><span data-fit-line data-giant translate="no">${esc(profile.shortName)}</span></div>`;
}

export function renderAll() {
  document.title = `${profile.fullName}, ${profile.role.toLowerCase()}`;
  renderNav();
  renderHero();
  renderWorks();
  renderArchive();
  renderAbout();
  renderCaps();
  renderExp();
  renderContact();
}

export { profile };
