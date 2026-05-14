# Kitty Screen 浏览器插件

[English README](README.md) · [桌面版](https://github.com/agnostic-ap/kitty-screen)

一个浏览器插件，在你长时间盯着屏幕之后弹出猫咪动画，提醒你把视线移开、让眼睛休息。支持 **Chrome**、**Edge** 和 **Safari**。

## 工作原理

1. 插件统计浏览器的活跃使用时长。
2. 超过设定的触发延迟后，一只猫咪动画会滑入并覆盖浏览器窗口。
3. 倒计时结束或点击关闭按钮后，猫咪离开，计时器重置。

点击工具栏里的猫咪图标可以打开设置面板，调整延迟、显示时长，也可以随时预览效果。

## 安装

### Chrome / Edge

1. 下载或克隆本仓库。
2. 把猫咪动画文件放到 `assets/cat/`（见[添加你的猫](#添加你的猫)）。
3. 把插件图标放到 `assets/icons/`（见[图标](#图标)）。
4. 打开 `chrome://extensions`（Chrome）或 `edge://extensions`（Edge）。
5. 开启右上角的**开发者模式**。
6. 点击**加载已解压的扩展程序**，选择本文件夹。

### Safari

Safari 需要通过 Xcode 做一步转换：

```bash
# 需要安装了 Xcode 的 macOS
xcrun safari-web-extension-converter /path/to/kitty-screen-extension
```

这会生成一个 Xcode 项目，构建并运行后即可在 Safari 安装插件。安装后在 **Safari → 偏好设置 → 扩展程序** 中启用。

---

## 添加你的猫

插件从 `assets/cat/` 读取两个视频文件：

| 文件 | 说明 |
|---|---|
| `assets/cat/kitty.webm` | 入场动画（猫咪走入画面并趴好） |
| `assets/cat/kitty-loop.webm` | 待机循环（趴好后的轻微动作） |

同时支持 MP4 兜底：

| 文件 | 说明 |
|---|---|
| `assets/cat/kitty.mp4` | 入场动画 MP4 兜底 |
| `assets/cat/kitty-loop.mp4` | 待机循环 MP4 兜底 |

浏览器会自动优先加载 WebM（支持透明通道），找不到时回退到 MP4。

制作自己的猫咪动画，请参考[桌面版仓库](https://github.com/agnostic-ap/kitty-screen)的详细教程：

1. 准备猫咪参考照片
2. 用 GPT-4o Image 生成 12 张绿幕关键帧
3. 用 Runway、Kling 或 Sora 生成入场视频和待机循环
4. 用 FFmpeg 去掉绿幕（在桌面版仓库运行 `bun run videos`）
5. 把生成的 `.webm` 文件复制到这里

```bash
# 在桌面版仓库运行完 bun run videos 之后：
cp ../kitty-screen/resources/videos/windows/kitty-screen.webm assets/cat/kitty.webm
# 待机循环：从你的视频工具里单独导出一段循环片段
```

---

## 图标

把 PNG 图标放到：

```
assets/icons/icon-16.png
assets/icons/icon-48.png
assets/icons/icon-128.png
```

可以用任意图片编辑器从桌面版 `assets/icon.png` 导出，或用桌面版里的 `scripts/generate-icons.mjs` 脚本生成。

---

## 设置项

| 设置 | 选项 | 默认 |
|---|---|---|
| 多久后出现 | 15分钟 / 30分钟 / 1小时 / 1.5小时 / 2小时 / 3小时 | 30分钟 |
| 持续多久 | 15秒 / 30秒 / 1分钟 / 2分钟 / 5分钟 / 10分钟 | 30秒 |

设置保存在 `chrome.storage.sync`，登录账号后可跨设备同步。

以下情况会重置计时器：
- 关闭屏保后
- 系统进入空闲状态或屏幕锁定时
- 更改设置时

---

## 目录结构

```
kitty-screen-extension/
├── manifest.json          # MV3 插件清单
├── background/
│   └── worker.js          # Service worker：计时和触发逻辑
├── content/
│   ├── overlay.js         # 注入页面的屏保遮罩
│   └── overlay.css        # 遮罩样式
├── popup/
│   ├── popup.html         # 设置弹窗
│   ├── popup.js           # 弹窗逻辑
│   └── popup.css          # 弹窗样式
├── assets/
│   ├── icons/             # 插件图标（用户提供）
│   └── cat/               # 猫咪动画视频（用户提供）
└── _locales/
    ├── en/messages.json   # 英文字符串
    └── zh_CN/messages.json # 简体中文字符串
```

---

## 浏览器兼容性

| 浏览器 | 内核 | Manifest | 说明 |
|---|---|---|---|
| Chrome 88+ | Chromium | MV3 | 完整支持 |
| Edge 88+ | Chromium | MV3 | 完整支持 |
| Safari 16+ | WebKit | MV3 | 需要 Xcode 转换 |
| Firefox | Gecko | MV2/MV3 | 未正式测试 |

---

## 致谢

猫咪形象和动画制作流程来自 [Elliot](https://github.com/elliothux)。
