// Service worker — timer management and screensaver triggering

const ALARM_NAME = "kitty-tick";
const TICK_MINUTES = 1; // alarm granularity

const DEFAULT_SETTINGS = {
  delaySeconds: 30 * 60,
  durationSeconds: 30,
};

// ── Lifecycle ────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({ elapsedSeconds: 0, isShowing: false });
  scheduleAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleAlarm();
});

function scheduleAlarm() {
  chrome.alarms.get(ALARM_NAME, (existing) => {
    if (!existing) {
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: TICK_MINUTES });
    }
  });
}

// ── Alarm tick ───────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const [local, sync] = await Promise.all([
    chrome.storage.local.get(["elapsedSeconds", "isShowing"]),
    chrome.storage.sync.get(DEFAULT_SETTINGS),
  ]);

  if (local.isShowing) return;

  // Pause timer when system is idle or screen is locked
  const idleState = await chrome.idle.queryState(60);
  if (idleState !== "active") {
    await chrome.storage.local.set({ elapsedSeconds: 0 });
    return;
  }

  const elapsed = (local.elapsedSeconds ?? 0) + TICK_MINUTES * 60;
  const delay = sync.delaySeconds ?? DEFAULT_SETTINGS.delaySeconds;

  if (elapsed >= delay) {
    await chrome.storage.local.set({ elapsedSeconds: 0, isShowing: true });
    await triggerScreensaver(sync.durationSeconds ?? DEFAULT_SETTINGS.durationSeconds);
  } else {
    await chrome.storage.local.set({ elapsedSeconds: elapsed });
  }
});

// ── Screensaver trigger ───────────────────────────────────────────────────────

async function triggerScreensaver(durationSeconds) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];

  if (!tab?.id || !tab.url?.startsWith("http")) {
    // Can't inject into restricted pages — reset and wait for next tick
    await chrome.storage.local.set({ isShowing: false });
    return;
  }

  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["content/overlay.css"],
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content/overlay.js"],
    });
    await chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_SCREENSAVER",
      durationSeconds,
    });
  } catch (err) {
    console.error("[Kitty Screen] Failed to inject screensaver:", err);
    await chrome.storage.local.set({ isShowing: false });
  }
}

// ── Message handling ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  switch (msg.type) {
    case "SCREENSAVER_DISMISSED":
      chrome.storage.local.set({ isShowing: false, elapsedSeconds: 0 });
      respond({ ok: true });
      break;

    case "PREVIEW_SCREENSAVER":
      chrome.storage.local
        .set({ isShowing: true })
        .then(() => triggerScreensaver(20))
        .then(() => respond({ ok: true }))
        .catch(() => respond({ ok: false }));
      return true; // async

    case "GET_STATE": {
      Promise.all([
        chrome.storage.local.get(["elapsedSeconds", "isShowing"]),
        chrome.storage.sync.get(DEFAULT_SETTINGS),
      ]).then(([local, sync]) => {
        respond({ ...local, settings: sync });
      });
      return true; // async
    }

    case "SAVE_SETTINGS":
      chrome.storage.sync
        .set(msg.settings)
        .then(() => chrome.storage.local.set({ elapsedSeconds: 0 }))
        .then(() => respond({ ok: true }));
      return true; // async
  }
});
