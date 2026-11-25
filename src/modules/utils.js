// Jam lokal yang berjalan (nav + footer).
export function initClock(timezone) {
  const els = document.querySelectorAll("[data-clock]");
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone });
  const tick = () => {
    const now = fmt.format(new Date());
    els.forEach((el) => (el.textContent = now));
  };
  tick();
  setInterval(tick, 15000);
}

// Tombol "Copy" email.
export function initCopy() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const original = btn.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied ✓";
      } catch {
        window.location.href = `mailto:${btn.dataset.copy}`;
      }
      setTimeout(() => (btn.textContent = original), 1800);
    });
  });
}

// Mengatur font-size [data-fit] supaya baris terpanjang pas selebar wadahnya.
// data-fit-max (dalam vh) membatasi ukuran maksimum.
export function fitText() {
  document.querySelectorAll("[data-fit]").forEach((el) => {
    const lines = el.querySelectorAll("[data-fit-line]");
    el.style.fontSize = "100px";
    const widest = Math.max(...Array.from(lines, (l) => l.scrollWidth));
    let size = (el.clientWidth / widest) * 100;
    if (el.dataset.fitMax) size = Math.min(size, (window.innerHeight * Number(el.dataset.fitMax)) / 100);
    el.style.fontSize = `${size}px`;
  });
}

// Tunggu font utama (maks. 3 detik) supaya ukuran teks & potongan SplitText akurat.
export function fontsReady() {
  const loads = [
    '800 100px "Archivo"',
    '500 16px "JetBrains Mono"',
  ].map((f) => document.fonts.load(f));
  const timeout = new Promise((r) => setTimeout(r, 3000));
  return Promise.race([Promise.all(loads).then(() => document.fonts.ready), timeout]);
}

// Warna nav mengikuti apa yang ada tepat di bawahnya: section gelap
// ([data-theme="dark"]) atau reel di hero yang sudah membuka.
export function initNavTheme(ticker) {
  const nav = document.querySelector("[data-nav]");
  let lastY = -1;
  let lastW = -1;
  ticker.add(() => {
    // hanya dicek saat halaman bergeser atau ukuran layar berubah
    if (window.scrollY === lastY && window.innerWidth === lastW) return;
    lastY = window.scrollY;
    lastW = window.innerWidth;
    const y = nav.offsetHeight / 2;
    const under = document
      .elementsFromPoint(window.innerWidth / 2, y)
      .find((el) => !nav.contains(el) && el !== document.documentElement && el !== document.body);
    const dark = Boolean(under?.closest('[data-theme="dark"], .reel'));
    nav.dataset.on = dark ? "dark" : "";
  });
}
