// Popup UI — settings panel and timer status

const i18n = (key) => chrome.i18n.getMessage(key) || key;

const DELAY_OPTIONS = [
  { key: "min15", value: 15 * 60 },
  { key: "min30", value: 30 * 60 },
  { key: "hour1", value: 60 * 60 },
  { key: "hour15", value: 90 * 60 },
  { key: "hour2", value: 120 * 60 },
  { key: "hour3", value: 180 * 60 },
];

const DURATION_OPTIONS = [
  { key: "sec15", value: 15 },
  { key: "sec30", value: 30 },
  { key: "min1", value: 60 },
  { key: "min2", value: 120 },
  { key: "min5", value: 300 },
  { key: "min10", value: 600 },
];

let currentSettings = { delaySeconds: 30 * 60, durationSeconds: 30 };
let currentElapsed = 0;

// ── Option grid renderer ─────────────────────────────────────────────────────

function renderGrid(containerId, options, currentValue, onChange) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";

  options.forEach(({ key, value }) => {
    const btn = document.createElement("button");
    btn.className = `btn btn--default${value === currentValue ? " btn--active" : ""}`;
    btn.textContent = i18n(key);
    btn.addEventListener("click", () => {
      onChange(value);
      renderGrid(containerId, options, value, onChange);
    });
    grid.appendChild(btn);
  });
}

// ── Timer bar ────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateTimerBar(elapsed, delay) {
  const remaining = Math.max(0, delay - elapsed);
  const pct = Math.min(100, (elapsed / delay) * 100);

  document.getElementById("timer-label").textContent =
    `${i18n("nextBreak")} ${formatTime(remaining)}`;
  document.getElementById("timer-fill").style.width = `${pct}%`;
}

// ── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  // Labels
  document.getElementById("label-delay").textContent = i18n("delayLabel");
  document.getElementById("label-duration").textContent = i18n("durationLabel");
  document.getElementById("btn-preview").textContent = i18n("preview");

  // Load state from background
  chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
    if (!response) return;

    currentSettings = response.settings ?? currentSettings;
    currentElapsed = response.elapsedSeconds ?? 0;

    renderGrid("grid-delay", DELAY_OPTIONS, currentSettings.delaySeconds, (v) => {
      currentSettings = { ...currentSettings, delaySeconds: v };
      saveSettings();
    });

    renderGrid("grid-duration", DURATION_OPTIONS, currentSettings.durationSeconds, (v) => {
      currentSettings = { ...currentSettings, durationSeconds: v };
      saveSettings();
    });

    updateTimerBar(currentElapsed, currentSettings.delaySeconds);
  });

  // Refresh timer bar every second
  setInterval(() => {
    chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
      if (!response) return;
      currentElapsed = response.elapsedSeconds ?? currentElapsed;
      updateTimerBar(currentElapsed, currentSettings.delaySeconds);
    });
  }, 1000);

  // Preview button
  document.getElementById("btn-preview").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "PREVIEW_SCREENSAVER" });
    window.close();
  });
}

function saveSettings() {
  chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", settings: currentSettings });
}

document.addEventListener("DOMContentLoaded", init);
