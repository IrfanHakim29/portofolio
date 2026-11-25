// Warna tema dibaca dari token CSS (:root), supaya canvas/WebGL ikut tema yang aktif.
export function color(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

// "#rrggbb" → [r, g, b] dalam 0..1 (untuk WebGL)
export function rgb01(name) {
  const hex = color(name).replace("#", "");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

// "#rrggbb" + alpha → "rgba(...)" (untuk canvas 2D)
export function rgba(name, a) {
  const [r, g, b] = rgb01(name).map((v) => Math.round(v * 255));
  return `rgba(${r},${g},${b},${a})`;
}
