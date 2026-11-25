# Portfolio

Vite + GSAP (ScrollTrigger, SplitText) + Lenis. Tanpa framework, semua konten dari satu file.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil di /dist, siap deploy ke Vercel/Netlify
```

## Cara isi konten

Edit **`src/data.js`** saja:

| Bagian        | Apa yang diisi                                               |
| ------------- | ------------------------------------------------------------ |
| `profile`     | nama, role, tagline, email, sosmed, foto, CV                 |
| `about`       | kalimat manifesto (`[img]` = gambar kecil, `*kata*` = italic) |
| `stack`       | daftar tools (dipakai di beberapa bagian)                    |
| `projects`    | `featured: true` → galeri horizontal, sisanya → Archive      |
| `capabilities`| 3–5 keahlian utama                                           |
| `experience`  | magang, organisasi, asisten lab, lomba, pendidikan           |

Gambar taruh di `public/images/` lalu tulis `"/images/nama.jpg"`.
Kalau `image: null`, otomatis muncul placeholder grafis berwarna.

Tips gambar project: rasio **4:3**, lebar ±1600px, format `.webp`/`.jpg`.

## Video

| Tempat              | Field di `data.js`        | Perilaku                                              |
| ------------------- | ------------------------- | ----------------------------------------------------- |
| Reel di hero        | `reel.video`              | Kapsul kecil → layar penuh saat scroll, ada tombol suara |
| Kartu Selected Work | `projects[].video`        | Main otomatis saat terlihat, jeda saat keluar layar   |
| Preview Archive     | `projects[].video`        | Main saat baris di-hover                              |
| Gambar di kalimat About | `about.inlineImages`  | Boleh `.mp4` juga                                     |

Selama `reel.video` masih `null`, reel menampilkan animasi ASCII.

### Relief 3D di About (`modules/portrait.js`)

`profile.photo` dirender dengan WebGL jadi titik-titik dither, lalu saat discroll tiap titik
menonjol sesuai terangnya sehingga foto jadi relief 3D yang miring (seperti mainan pin art).
Mouse ikut memiringkannya.

Foto paling cocok kalau **latarnya hitam pekat**. Area foto yang dipakai diatur di `CROP`,
posisinya di layar di fungsi `layout()`.

Supaya ringan: mp4 (H.264), 10–20 detik, ≤ 8 MB untuk reel dan ≤ 3 MB per project,
tanpa audio kecuali reel. Kompres dengan ffmpeg:

```bash
ffmpeg -i input.mov -vf "scale=1920:-2" -c:v libx264 -crf 26 -preset slow -an -movflags +faststart public/videos/reel.mp4
```

(hapus `-an` kalau reel mau ada suaranya)

## Struktur

```
src/
  data.js            ← konten
  render.js          ← data → HTML
  styles/main.css    ← warna, font, layout (token di :root)
  modules/
    hero.js          ← intro nama, reel yang membuka, HUD
    sections.js      ← galeri horizontal, reveal teks, archive hover
    portrait.js      ← relief 3D foto (WebGL)
    ascii.js         ← animasi ASCII pengganti video reel
    scroll.js        ← Lenis smooth scroll
    utils.js         ← jam, copy email, auto-fit teks
```

Warna (kuning, hijau, merah Melayu Riau) diatur di token `:root` pada `src/styles/main.css`.
Ikon teknologi dari Simple Icons ada di `src/icons.js`; tambahkan nama alat baru di `MAP` kalau perlu.
Animasi otomatis dimatikan untuk pengguna yang mengaktifkan *reduce motion*.
