(function () {
    "use strict";
    var list = document.getElementById("publication-list");
    if (!list) return;

    // Enhance image fallbacks and video previews. All publications remain visible.
    list.querySelectorAll(".publication-media img[data-fallback-src]").forEach(function (image) {
      function useFallback() {
        var fallback = image.dataset.fallbackSrc;
        if (!fallback) return;
        delete image.dataset.fallbackSrc;
        image.src = fallback;
      }
      image.addEventListener("error", useFallback);
      if (image.complete && image.naturalWidth === 0) useFallback();
    });

    var videos = Array.prototype.slice.call(list.querySelectorAll("video"));
    var reducedMotion = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var visibleVideos = new Set();
    function playPreview(video) {
      if (document.hidden || (reducedMotion && reducedMotion.matches) || video.closest(".publication-card").hidden) return;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.loop = true;
      try {
        var request = video.play();
        if (request && typeof request.catch === "function") request.catch(function () {});
      } catch (_) {}
    }
    function pausePreview(video) { try { video.pause(); } catch (_) {} }
    if (typeof window.IntersectionObserver === "function") {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            visibleVideos.add(entry.target);
            playPreview(entry.target);
          } else {
            visibleVideos.delete(entry.target);
            pausePreview(entry.target);
          }
        });
      }, { threshold: [0, 0.25, 0.75] });
      videos.forEach(function (video) { observer.observe(video); });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) videos.forEach(pausePreview);
      else visibleVideos.forEach(playPreview);
    });
    function updateMotion() {
      if (reducedMotion && reducedMotion.matches) videos.forEach(pausePreview);
      else visibleVideos.forEach(playPreview);
    }
    if (reducedMotion) {
      if (typeof reducedMotion.addEventListener === "function") reducedMotion.addEventListener("change", updateMotion);
      else if (typeof reducedMotion.addListener === "function") reducedMotion.addListener(updateMotion);
    }
  }());
  