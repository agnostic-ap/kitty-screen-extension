# Kitty Screen Extension

[中文说明](README.zh.md) · [Desktop App](https://github.com/agnostic-ap/kitty-screen)

A browser extension that shows a cat animation after extended screen time — reminding you to look away and rest your eyes. Supports **Chrome**, **Edge**, and **Safari**.

## How It Works

1. The extension tracks how long your screen has been in active use.
2. After the configured delay, a transparent cat animation slides in and covers your browser window.
3. A countdown timer appears. When it ends — or when you click the close button — the cat leaves and the timer resets.

The popup icon in the toolbar opens a settings panel where you can configure the delay, duration, and preview the screensaver at any time.

## Install

### Chrome / Edge

1. Download or clone this repo.
2. Add your cat animation files to `assets/cat/` (see [Adding Your Cat](#adding-your-cat)).
3. Add extension icons to `assets/icons/` (see [Icons](#icons)).
4. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
5. Enable **Developer mode**.
6. Click **Load unpacked** and select this folder.

### Safari

Safari requires an Xcode conversion step:

```bash
# Requires macOS with Xcode installed
xcrun safari-web-extension-converter /path/to/kitty-screen-extension
```

This generates an Xcode project. Build and run it to install the extension in Safari. Enable it in **Safari → Settings → Extensions**.

---

## Adding Your Cat

The extension plays two video files from `assets/cat/`:

| File | Description |
|---|---|
| `assets/cat/kitty.webm` | Entrance animation (cat walks in and settles) |
| `assets/cat/kitty-loop.webm` | Idle loop (subtle motion while blocking screen) |

MP4 fallbacks are also supported:

| File | Description |
|---|---|
| `assets/cat/kitty.mp4` | MP4 fallback for entrance |
| `assets/cat/kitty-loop.mp4` | MP4 fallback for loop |

The browser will automatically prefer WebM (which supports transparent alpha) over MP4.

To create your own cat animation, follow the step-by-step guide in the [desktop app repo](https://github.com/agnostic-ap/kitty-screen):

1. Prepare reference photos.
2. Generate 12 green-screen keyframes with GPT-4o Image.
3. Generate entrance and loop videos with Runway, Kling, or Sora.
4. Remove the green background with FFmpeg (`bun run videos` in the desktop repo).
5. Copy the resulting `.webm` files here.

```bash
# After running `bun run videos` in the kitty-screen desktop repo:
cp ../kitty-screen/resources/videos/windows/kitty-screen.webm assets/cat/kitty.webm
# (loop video: export a separate clip from your video tool)
```

---

## Icons

Place PNG icons at:

```
assets/icons/icon-16.png
assets/icons/icon-48.png
assets/icons/icon-128.png
```

You can export them from the desktop app's `assets/icon.png` using any image editor or the `scripts/generate-icons.mjs` script in the desktop repo.

---

## Settings

| Setting | Options | Default |
|---|---|---|
| Show after | 15 min / 30 min / 1 h / 1.5 h / 2 h / 3 h | 30 min |
| Duration | 15 s / 30 s / 1 min / 2 min / 5 min / 10 min | 30 s |

Settings are saved to `chrome.storage.sync` and synced across devices when signed in.

The timer resets when:
- The screensaver is dismissed.
- The system goes idle or the screen locks.
- Settings are changed.

---

## Extension Structure

```
kitty-screen-extension/
├── manifest.json          # MV3 manifest
├── background/
│   └── worker.js          # Service worker: timer + trigger logic
├── content/
│   ├── overlay.js         # Injected screensaver overlay
│   └── overlay.css        # Overlay styles
├── popup/
│   ├── popup.html         # Settings popup
│   ├── popup.js           # Popup logic
│   └── popup.css          # Popup styles
├── assets/
│   ├── icons/             # Extension icons (user-supplied)
│   └── cat/               # Cat animation videos (user-supplied)
└── _locales/
    ├── en/messages.json   # English strings
    └── zh_CN/messages.json # Simplified Chinese strings
```

---

## Browser Compatibility

| Browser | Engine | Manifest | Notes |
|---|---|---|---|
| Chrome 88+ | Chromium | MV3 | Full support |
| Edge 88+ | Chromium | MV3 | Full support |
| Safari 16+ | WebKit | MV3 | Requires Xcode conversion |
| Firefox | Gecko | MV2/MV3 | Not officially tested |

---

## Credits

Cat character and animation workflow by [Elliot](https://github.com/elliothux).
