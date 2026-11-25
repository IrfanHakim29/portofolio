// Video [data-autoplay] diputar saat terlihat di layar dan dijeda saat keluar,
// jadi halaman tidak memutar banyak video sekaligus.
export function initVideos(reduced) {
  const videos = document.querySelectorAll("video[data-autoplay], video[data-reel-video]");
  if (reduced) {
    videos.forEach((v) => {
      v.removeAttribute("autoplay");
      v.preload = "metadata";
      v.pause();
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          v.preload = "auto";
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }),
    { rootMargin: "10% 10%", threshold: 0.1 }
  );
  videos.forEach((v) => io.observe(v));
}
