// Injected into the active tab to show the screensaver overlay.
// Safe to inject multiple times — guards against duplicate overlays.

(function () {
  if (document.getElementById("kitty-screen-overlay")) return;

  const CLOCK_REVEAL_DELAY = 10_000;

  let endsAt = 0;
  let clockTimer = null;
  let countdownInterval = null;

  // ── Build overlay DOM ────────────────────────────────────────────────────

  const overlay = document.createElement("div");
  overlay.id = "kitty-screen-overlay";

  // Cat video (entrance + loop)
  const video = document.createElement("video");
  video.id = "kitty-screen-video";
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  const srcWebm = document.createElement("source");
  srcWebm.src = chrome.runtime.getURL("assets/cat/kitty.webm");
  srcWebm.type = "video/webm";

  const srcMp4 = document.createElement("source");
  srcMp4.src = chrome.runtime.getURL("assets/cat/kitty.mp4");
  srcMp4.type = "video/mp4";

  video.appendChild(srcWebm);
  video.appendChild(srcMp4);

  // Loop video element
  const loopVideo = document.createElement("video");
  loopVideo.id = "kitty-screen-video";
  loopVideo.style.display = "none";
  loopVideo.autoplay = false;
  loopVideo.muted = true;
  loopVideo.playsInline = true;
  loopVideo.loop = true;
  loopVideo.preload = "auto";

  const loopSrcWebm = document.createElement("source");
  loopSrcWebm.src = chrome.runtime.getURL("assets/cat/kitty-loop.webm");
  loopSrcWebm.type = "video/webm";

  const loopSrcMp4 = document.createElement("source");
  loopSrcMp4.src = chrome.runtime.getURL("assets/cat/kitty-loop.mp4");
  loopSrcMp4.type = "video/mp4";

  loopVideo.appendChild(loopSrcWebm);
  loopVideo.appendChild(loopSrcMp4);

  video.addEventListener("ended", () => {
    video.style.display = "none";
    loopVideo.style.display = "";
    loopVideo.play().catch(() => {});
  });

  // Countdown clock
  const clock = document.createElement("div");
  clock.id = "kitty-screen-clock";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.id = "kitty-screen-close";
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", dismiss);

  overlay.appendChild(video);
  overlay.appendChild(loopVideo);
  overlay.appendChild(clock);
  overlay.appendChild(closeBtn);
  document.documentElement.appendChild(overlay);

  // ── Clock ────────────────────────────────────────────────────────────────

  function formatTime(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function startClock() {
    clockTimer = setTimeout(() => {
      clock.classList.add("visible");
      countdownInterval = setInterval(() => {
        const remaining = endsAt - Date.now();
        clock.textContent = formatTime(remaining);
        if (remaining <= 0) dismiss();
      }, 500);
      clock.textContent = formatTime(endsAt - Date.now());
    }, CLOCK_REVEAL_DELAY);
  }

  // ── Dismiss ──────────────────────────────────────────────────────────────

  function dismiss() {
    clearTimeout(clockTimer);
    clearInterval(countdownInterval);
    overlay.remove();
    chrome.runtime.sendMessage({ type: "SCREENSAVER_DISMISSED" });
  }

  // ── Message listener ─────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type !== "SHOW_SCREENSAVER") return;
    endsAt = Date.now() + msg.durationSeconds * 1000;
    video.currentTime = 0;
    video.play().catch(() => {});
    startClock();
  });
})();
