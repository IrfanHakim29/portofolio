// ============================================================
//  SEMUA KONTEN PORTOFOLIO ADA DI FILE INI.
//
//  Gambar  → taruh di /public/images, tulis "/images/nama.jpg"
//  Video   → taruh di /public/videos, tulis "/videos/nama.mp4"
//  Kalau dibiarkan null, akan muncul placeholder grafis.
//
//  Yang bertanda  // TODO  masih perlu kamu isi/cek.
// ============================================================

export const profile = {
  nameLines: ["Muhammad", "Irfan", "Hakim"], // satu kata per baris (2–3 baris)
  fullName: "Muhammad Irfan Hakim",
  shortName: "Irfan Hakim", // nama raksasa di footer
  initials: "MIH",
  role: "Full-stack developer",
  caption: ["Full-stack developer", "Web, mobile & ML"], // teks kecil di samping nama
  // *kata* = serif italic berwarna
  tagline: "I build web and mobile apps. One of them is used by *two businesses* every day.",
  place: "Pekanbaru",
  timezone: "Asia/Jakarta",
  lookingFor: "Available for freelance projects and team roles.",
  email: "muhammadirfanhakim29@gmail.com",
  // Foto berlatar hitam → dirender jadi relief 3D dari titik-titik di section About.
  photo: "/images/irfan.jpg",
  resume: null, // TODO: "/cv.pdf" (taruh file di /public)
  socials: [
    { label: "GitHub", url: "https://github.com/IrfanHakim29" },
    // { label: "LinkedIn", url: "https://linkedin.com/in/..." }, // TODO: buka komentar kalau ada
  ],
};

// Video yang "membuka" dari kapsul di hero sampai penuh layar saat discroll.
// Paling bagus: rekaman layar Lapaku, gameplay Math For Speed, dan app parkir,
// dipotong cepat jadi 10–20 detik.
export const reel = {
  video: null, // TODO: "/videos/reel.mp4"  (null = animasi ASCII)
  poster: null,
  lines: ["Some things", "I've *made*"],
};

export const about = {
  // [img] = gambar kecil di tengah kalimat, *kata* = serif italic.
  statement:
    "I'm Irfan, a full-stack developer based in Pekanbaru. I build web and mobile products [img] that people rely on, like a point-of-sale system [img] that two businesses run on *every day*.",
  inlineImages: [null, null], // gambar/video untuk tiap [img], mis. screenshot app & screenshot Lapaku
  bio: [
    "Lapaku started as a freelance engagement and grew into a full POS system: cashier, stock, multiple branches, financial reports, and five levels of user access. I built it on my own with Next.js, TypeScript and PostgreSQL.",
    "At PT Matrica Consulting I worked as an Odoo developer on a clinic system for Klinik InHarmony, as part of a client delivery team.", // TODO: tambah 1 kalimat, apa yang paling kamu pelajari di sana
    "I also build and maintain my own products: FlowTrack, an offline cash-flow tracker for Android, and Nada Studio, a music player with a built-in audio studio.",
    "Other work includes native Android apps, a Unity 3D game, an admin dashboard, two machine learning systems, and research on e-learning acceptance.",
  ],
  facts: [
    { label: "Based in", value: "Pekanbaru, Riau" },
    { label: "Education", value: "D4 Informatics, Politeknik Caltex Riau" },
    { label: "Into", value: "Full-stack web, mobile apps, machine learning" },
    { label: "Available for", value: "Freelance projects and team roles" },
  ],
};

// Teks di pita berjalan.
export const stack = [
  "Next.js", "TypeScript", "PostgreSQL", "React", "Supabase", "Python", "Flask",
  "TensorFlow", "Scikit-learn", "Kotlin", "React Native", "Odoo", "Unity", "C#", "PHP", "Docker", "Figma",
];

// summary: satu baris di struk · role + details: isi lembar lampiran saat item diklik
// featured: true  -> galeri "Selected work"
// featured: false -> hanya di daftar "All projects"
// stat: satu angka nyata yang ditonjolkan di kartu (boleh dihapus)
// video: diputar otomatis saat terlihat (image dipakai sebagai poster)
// links: isi live / repo GitHub kalau ada, kartu otomatis jadi bisa diklik
export const projects = [
  {
    title: "Lapaku",
    year: 2025, // TODO: cek
    type: "POS web app, freelance",
    summary: "Multi-branch point-of-sale system, built solo",
    role: "Sole developer, freelance",
    details: [
      "Cashier, stock, branch transfers and financial reports in one system.",
      "Five levels of user access, from cashier up to owner.",
      "Running in production for two businesses.",
    ],
    description:
      "A multi-branch point-of-sale system I built on my own. It covers the whole store routine: cashier, stock, branches and financial reports, with five levels of user access.",
    stat: { value: "2", label: "businesses use it every day" },
    stack: ["Next.js", "TypeScript", "PostgreSQL"],
    image: null,
    video: null,
    links: { live: "", repo: "" },
    featured: true,
  },
  {
    title: "FlowTrack",
    year: 2026,
    type: "Android app",
    summary: "Offline cash-flow tracker for Android",
    role: "Design and development",
    details: [
      "Reads BRImo and DANA notifications on the phone and records each payment automatically.",
      "Daily spending limits, recurring income and expenses, and multi-day plans like trips.",
      "Projects the balance day by day, up to two years ahead.",
      "No internet permission, so every record stays on the device. Includes a home-screen widget.",
    ],
    description:
      "A personal cash-flow tracker that logs BRImo and DANA payments from Android notifications and projects my balance two years ahead. It has no internet permission, so the data stays on the phone.",
    stat: { value: "2 yrs", label: "of balance forecast, fully offline" },
    stack: ["React Native", "Expo", "TypeScript", "Redux Toolkit", "Kotlin"],
    image: null,
    video: null, // TODO: rekaman layar HP, mis. "/videos/flowtrack.mp4"
    links: { live: "", repo: "" },
    featured: true,
  },
  {
    title: "Nada Studio",
    year: 2026,
    type: "Music app, Android & desktop",
    summary: "Offline music player with a built-in audio studio",
    role: "Design and development",
    details: [
      "Library, playlists, lyrics and background playback on Android.",
      "Studio with tempo, pitch, 10-band EQ, reverb and 14 presets, previewed in real time.",
      "AI stem separation with Demucs: vocals, drums, bass and melody.",
      "Exports to MP3, FLAC, WAV and other formats.",
    ],
    description:
      "An offline music player with a studio built in: playlists, lyrics and background playback, plus tempo, pitch, EQ, reverb and AI vocal separation.",
    stat: { value: "4", label: "AI stems: vocals, drums, bass, melody" },
    stack: ["Kotlin", "Python", "FastAPI", "FFmpeg", "Demucs"],
    image: null,
    video: null, // TODO: rekaman layar, mis. "/videos/nada-studio.mp4"
    links: { live: "", repo: "" },
    featured: true,
  },
  {
    title: "Klinik InHarmony", // TODO: cek penulisan nama kliniknya
    year: 2025, // TODO: cek
    type: "Client project, Odoo",
    summary: "Clinic system on Odoo, client project",
    role: "Odoo developer, internship at PT Matrica Consulting",
    details: [
      "Worked in the PT Matrica Consulting team building the clinic's system on Odoo.",
      "Python, Odoo ORM, XML views and PostgreSQL.",
    ],
    description:
      "A clinic system built on Odoo for Klinik InHarmony. I worked on it as an Odoo developer with the PT Matrica Consulting team.",
    // TODO: tambahkan 1 kalimat soal bagian yang kamu kerjakan, mis. modul apa / fitur apa.
    // Kalau ada angka nyata (jumlah modul, pasien, dll.), isi stat: { value: "...", label: "..." }
    stack: ["Odoo", "Python", "PostgreSQL", "XML"],
    image: null,
    video: null,
    links: { live: "", repo: "" },
    featured: true,
  },
  {
    title: "Math For Speed",
    year: 2025, // TODO: cek
    type: "3D game",
    summary: "Educational 3D racing game",
    role: "Game developer",
    details: [
      "Answering math questions correctly is how the car goes faster.",
      "Real-time game logic and physics-based driving in Unity.",
    ],
    description:
      "An educational racing game where answering math questions is how you go faster. Real-time game logic and physics-based driving.",
    stat: { value: "3D", label: "built in Unity with C#" },
    stack: ["Unity", "C#"],
    image: null,
    video: null, // video gameplay bakal keren banget di sini
    links: { live: "", repo: "" },
    featured: true,
  },
  {
    title: "AgriPredict",
    year: 2025, // TODO: cek
    type: "Machine learning",
    summary: "Crop yield prediction with Random Forest",
    role: "Machine learning and web",
    details: [
      "Random Forest Regressor trained on 99,850+ rows from 16 regions in India.",
      "Covers 52+ crop types.",
      "R² score of 78.7%, served through a Flask web app.",
    ],
    description:
      "A web app that predicts crop yield for 52+ crops, using a Random Forest model trained on 99,850+ rows of data from 16 regions in India.",
    stat: { value: "78.7%", label: "R² score" },
    stack: ["Python", "Flask", "Scikit-learn"],
    image: null,
    video: null,
    links: { live: "", repo: "" },
    featured: true,
  },
  {
    title: "Smart Parking",
    year: 2025, // TODO: cek
    type: "Android app",
    summary: "Parking and digital tickets on Android",
    role: "Android developer",
    details: [
      "QR code tickets scanned with Google ML Kit.",
      "Retrofit for the API, Room for offline storage, Material Design 3.",
    ],
    description: "Parking management and digital tickets on Android, with QR code scanning through Google ML Kit.",
    stat: { value: "QR", label: "tickets scanned with ML Kit" },
    stack: ["Kotlin", "Retrofit", "Room", "Material 3", "ML Kit"],
    image: null,
    video: null,
    links: { live: "", repo: "" },
    featured: false,
  },
  {
    title: "EPLPredict",
    year: 2025, // TODO: cek
    type: "Machine learning",
    summary: "Premier League result prediction with LSTM",
    role: "Machine learning and web",
    details: [
      "Two-layer LSTM trained on 9,380 matches from 25 seasons.",
      "Hyperparameters tuned with Keras Tuner, served with Flask.",
    ],
    description:
      "Predicts Premier League results with a two-layer LSTM trained on 9,380 matches from 25 seasons, tuned with Keras Tuner.",
    stack: ["Flask", "TensorFlow", "Keras Tuner"],
    image: null,
    video: null,
    links: { live: "", repo: "" },
    featured: false,
  },
  {
    title: "SuperMart Dashboard",
    year: 2024, // TODO: cek
    type: "Team project",
    summary: "Store admin dashboard, team project",
    role: "Frontend developer, team project",
    details: [
      "Orders, customer bookings, product stock and employee data in one place.",
      "Built with React and Supabase as a team.",
    ],
    description: "A store admin dashboard for orders, customer bookings, product stock and employee data, built as a team.",
    stack: ["React", "Supabase"],
    image: null,
    video: null,
    links: { live: "", repo: "" },
    featured: false,
  },
];

export const capabilities = [
  {
    title: "Web",
    description: "Where I spend most of my time. Full-stack apps from the database to the interface, Lapaku included.",
    tools: ["Next.js", "React", "TypeScript", "PHP", "Odoo", "PostgreSQL", "Supabase", "MongoDB"],
  },
  {
    title: "Mobile",
    description: "Android apps in Kotlin and React Native, from offline storage to reading bank notifications on the phone.",
    tools: ["Kotlin", "React Native", "Expo", "Retrofit", "Room", "Material 3"],
  },
  {
    title: "ML",
    description: "Training and tuning models in Python, then putting them behind a web app people can try.",
    tools: ["Python", "Scikit-learn", "TensorFlow", "Keras", "Flask", "Jupyter"],
  },
  {
    title: "Games",
    description: "2D and 3D games, mostly in Unity. Math For Speed is the latest one.",
    tools: ["Unity", "C#", "RPG Maker"],
  },
];

export const experience = [
  { period: "2025 to now", role: "Freelance full-stack developer", place: "Lapaku", location: "Pekanbaru" }, // TODO: cek tahun
  { period: "2025", role: "Odoo developer (internship)", place: "PT Matrica Consulting", location: "Pekanbaru" }, // TODO: cek tahun & kota
  { period: "", role: "Research assistant, e-learning systems", place: "Politeknik Caltex Riau", location: "Pekanbaru" }, // TODO: tahun
  { period: "2023 to now", role: "D4 Informatics", place: "Politeknik Caltex Riau", location: "Pekanbaru" },
];
