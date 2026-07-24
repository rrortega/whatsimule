[🇪🇸 Leer en Español](README.es.md) | 🇬🇧 English

# rrortega-whatsimule

[![npm version](https://img.shields.io/npm/v/rrortega-whatsimule.svg)](https://www.npmjs.com/package/rrortega-whatsimule)
[![license](https://img.shields.io/npm/l/rrortega-whatsimule.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

An interactive, pixel-perfect WhatsApp conversation simulator library for **React** and **Next.js** applications. Designed to showcase AI assistants, customer support flows, incident intake, and sales lead qualification with real-time QWERTY typing simulation, fullscreen image upload staging, hands-free voice note recording, Web Audio API sound synthesis, and 3D perspective tilt effects.

---

## 🌐 Live Interactive Demo

Try the live playground and customize all options in real-time:
👉 **[https://rrortega.github.io/whatsimule/](https://rrortega.github.io/whatsimule/)**

---

## ✨ Features

- 📱 **Pixel-Perfect WhatsApp UI**: Identical to WhatsApp Web and Mobile with dark & light themes, iPhone and Android device frames, status bar indicators, read receipts, and custom link preview cards.
- ⌨️ **Interactive Virtual Keyboard**: Letter-by-letter QWERTY typing simulation with keypress elevation, visual feedback, top-only shadows, and Web Audio API keyclick sounds.
- 📸 **Fullscreen Image Upload & Staging**: Fullscreen media preview modal, caption field with auto-height expansion, in-chat progress blur, and a circular SVG upload ring.
- 🎙️ **Voice Notes & Hands-Free Audio Bar**: Realistic voice note recording bar featuring real-time audio waveforms, `"Recording audio..."` header status, and automatic italic transcriptions.
- 🎨 **Fully Customizable**: Live control over dimensions (width/height sliders), custom wallpaper patterns (Doodle, Dots, Custom image upload), avatar initials, and script steps.
- 🎛️ **3D Tilt & Smooth Motion**: Interactive hover tilt, scroll tilt perspective, and smooth auto-scrolling to the latest messages.
- 🔊 **Zero External Sound Dependencies**: Built-in sound synthesis using the Web Audio API for typing clicks, sent sounds, and receive chime.
- 📦 **Production Ready**: Optimized TypeScript build with ESM and CJS bundle formats.

---

## 📦 Installation

Install `rrortega-whatsimule` using your package manager of choice:

```bash
npm install rrortega-whatsimule
# or
pnpm add rrortega-whatsimule
# or
yarn add rrortega-whatsimule
# or
bun add rrortega-whatsimule
```

### Import Stylesheet

Import the library CSS stylesheet in your root application file (e.g. `App.tsx`, `main.tsx`, `_app.tsx`, or `layout.tsx`):

```tsx
import "rrortega-whatsimule/dist/whatsapp-simulator.css";
```

---

## 🚀 Quick Start Example

```tsx
import React from "react";
import { WhatsAppSimulator, ChatScript } from "rrortega-whatsimule";
import "rrortega-whatsimule/dist/whatsapp-simulator.css";

const customScripts: Record<string, ChatScript> = {
  ai_support: {
    id: "ai_support",
    label: "🤖 AI Support Assistant",
    description: "Automated customer support demonstration",
    steps: [
      { sender: "user", type: "text", content: "Hello! I need help with my ticket #4092.", delay: 800 },
      { sender: "assistant", type: "text", content: "Hello! I'm checking your ticket in the system... 🔍", delay: 1500 },
      { sender: "user", type: "audio", content: "Voice note describing the issue.", audioDuration: "0:12", delay: 1600 },
      { sender: "assistant", type: "audio", content: "Audio instructions for resolving ticket #4092.", audioDuration: "0:24", delay: 2000 },
      { sender: "user", type: "image", content: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500", caption: "Photo of the equipment error.", delay: 1800 },
      { sender: "assistant", type: "text", content: "Your request is approved and a technician is on the way! 🛠️", delay: 1200 }
    ]
  }
};

export default function App() {
  return (
    <WhatsAppSimulator
      scripts={customScripts}
      defaultActiveScriptId="ai_support"
      assistantName="Rolando AI"
      chatType="direct"
      wallpaperPattern="doodle"
      typingMode="keyboard"
      theme="dark"
      deviceStyle="iphone"
      width="380px"
      height="680px"
      enableSound={true}
      onMessageSent={(message) => console.log("Message sent:", message)}
      onScriptComplete={(scriptId) => console.log("Script completed:", scriptId)}
    />
  );
}
```

---

## 🎛️ Component API Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `scripts` | `Record<string, ChatScript>` | `{}` | Dictionary of conversation scripts with steps (`text`, `image`, `audio`). |
| `defaultActiveScriptId` | `string` | `undefined` | ID of the default active script to run automatically. |
| `assistantName` | `string` | `"RRORTEGA"` | Contact or group name displayed in the header. |
| `assistantAvatarUrl` | `string` | `undefined` | Image URL for the contact profile picture. |
| `chatType` | `"direct" \| "group"` | `"direct"` | Chat header layout mode (Direct or Group chat). |
| `wallpaperPattern` | `"doodle" \| "dots" \| "grid"` | `"doodle"` | Built-in chat background pattern style. |
| `customWallpaperUrl` | `string` | `undefined` | Custom image background URL for the chat body. |
| `typingMode` | `"direct" \| "keyboard"` | `"keyboard"` | Simulation mode: instant typing or interactive virtual QWERTY keyboard. |
| `theme` | `"dark" \| "light"` | `"dark"` | Visual theme of the WhatsApp simulator. |
| `deviceStyle` | `"iphone" \| "android" \| "none"` | `"iphone"` | Phone frame layout wrapper with notch/punch-hole. |
| `width` | `string \| number` | `undefined` | Custom simulator container width. |
| `height` | `string \| number` | `undefined` | Custom simulator container height. |
| `speedMultiplier` | `number` | `1` | Animation speed multiplier (`0.5x`, `1x`, `1.5x`, `2x`). |
| `enableSound` | `boolean` | `true` | Enable or disable Web Audio API sound synthesis. |
| `showRestartButton` | `boolean` | `true` | Show floating restart button. |
| `restartButtonPosition` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left" \| "center"` | `"center"` | Floating restart button location. |
| `locale` | `"es" \| "en"` | `"es"` | Built-in UI language string translations. |
| `onMessageSent` | `(message: Message) => void` | `undefined` | Event callback fired whenever a message is sent. |
| `onScriptComplete` | `(scriptId: string) => void` | `undefined` | Event callback fired when a conversation script finishes. |

---

## 👨‍💻 Author & Open Source Community

Created and maintained by **Rolando R. Ortega**.

Contributions, issue reports, and feature requests are very welcome!

- ⭐ **Star on GitHub**: If you like this project, please give it a star on [GitHub](https://github.com/rrortega/whatsimule)!
- 👔 **LinkedIn**: Connect on [LinkedIn](https://www.linkedin.com/in/rrortega/).
- 🐛 **Open an Issue**: Found a bug or have a feature idea? Open an issue on [GitHub Issues](https://github.com/rrortega/whatsimule/issues).
- 🔀 **Submit a PR**: Feel free to submit a Pull Request on [GitHub Pull Requests](https://github.com/rrortega/whatsimule/pulls).

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE). Anyone is free to use, modify, and distribute it in personal or commercial projects.

