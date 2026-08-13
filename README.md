[🇪🇸 Leer en Español](README.es.md) | 🇬🇧 English

# rrortega-whatsimule

[![npm version](https://img.shields.io/npm/v/rrortega-whatsimule.svg?color=00a884)](https://www.npmjs.com/package/rrortega-whatsimule)
[![license](https://img.shields.io/npm/l/rrortega-whatsimule.svg?color=green)](LICENSE)
[![build status](https://github.com/rrortega/whatsimule/actions/workflows/deploy-demo.yml/badge.svg)](https://github.com/rrortega/whatsimule/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6.svg)](https://www.typescriptlang.org/)

An interactive, pixel-perfect WhatsApp conversation simulator library for **React** and **Next.js** applications. Designed to showcase AI assistants, customer support flows, incident intake, and sales lead qualification with real-time QWERTY typing simulation, fullscreen image upload staging, hands-free voice note recording, Web Audio API sound synthesis, and 3D perspective tilt effects.

---

## 🌐 Live Interactive Demo

Try the live playground and customize all options in real-time:
👉 **[https://rrortega.github.io/whatsimule/](https://rrortega.github.io/whatsimule/)**

![whatsimule Cinematic Demo](demo.gif)
<p align="center">
  <sub>Demo video recorded with <a href="https://openvid.dev/">OpenVid</a> by <a href="https://github.com/CristianOlivera1">Cristian Olivera Chávez</a></sub>
</p>

---

## ✨ Features

- 📱 **Pixel-Perfect WhatsApp UI**: Identical to WhatsApp Web and Mobile with dark & light themes, iPhone and Android device frames, status bar indicators, read receipts, and custom link preview cards.
- 📞 **Fullscreen Native Incoming Calls**: Simulates authentic iOS & Android full-screen voice/video calls. Features 2-stage interaction: floating decline/accept circles in ringing state, animated tap, scale press, icon rotation, glassmorphism slide track reveal, horizontal swipe to decline, red highlight, and `zoomOut` exit.
- 🔔 **Interactive Push Notifications**: Real-time iOS glassmorphism & Android Material push notification banners with sound alerts and animated touch/swipe dismiss gestures.
- 💻 **Code Blocks & WhatsApp Markdown**: Monospace code blocks (```code```), inline code, bullet points (- / *), line breaks (\n), bold, italic, strikethrough, and draft text erasing simulation (`eraseBeforeSend`).
- ⌨️ **Interactive Virtual Keyboard**: Letter-by-letter QWERTY typing simulation with keypress elevation, visual feedback, top-only shadows, and Web Audio API keyclick sounds.
- 📸 **Fullscreen Image Upload & Staging**: Fullscreen media preview modal, caption field with auto-height expansion, in-chat progress blur, and a circular SVG upload ring.
- 🎙️ **Voice Notes & Hands-Free Audio Bar**: Realistic voice note recording bar featuring real-time audio waveforms, `"Recording audio..."` header status, and automatic italic transcriptions.
- 🎨 **Fully Customizable**: Live control over dimensions (width/height sliders), custom wallpaper patterns (Doodle, Dots, Custom image upload), avatar initials, and script steps.
- 🎛️ **3D Tilt & Smooth Motion**: Interactive hover tilt, scroll tilt perspective, and smooth auto-scrolling to the latest messages.
- 🔊 **Zero External Sound Dependencies**: Built-in sound synthesis using the Web Audio API for typing clicks, sent sounds, and receive chime.
- 📇 **Contact Sharing & 8-Option Attachment Menu**: Full contact sharing flow (`type: "contact"`). Features official WhatsApp bottom attachment panel (Gallery, Camera, Location, Contact, Document, Poll, Event, AI Images), contact list picker sheet with search keyboard filtering, avatars (`avatarUrl`), green send button, and official WhatsApp Contact Card message bubbles.
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
import { WhatSimule, ChatScript } from "rrortega-whatsimule";
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
    <WhatSimule
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
| `initialStepIndex` | `number` | `0` | 0-based step index to start typing animation from (prior messages are pre-rendered). |
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
| `enableScrollTilt` | `boolean` | `true` | Enables subtle 3D perspective tilt as container scrolls into view. |
| `enableHoverTilt` | `boolean` | `false` | Enables mouse hover-driven 3D perspective rotation. |
| `enableStepTilt` | `boolean` | `true` | Enables step-defined 3D tilt perspective animations as messages arrive. |
| `enableTimelineTilt` | `boolean` | `true` | Enables automatic keyframe perspective timeline animations. |
| `perspectiveTimeline` | `PerspectiveKeyframe[]` | `undefined` | Keyframe array setting perspective angles & zoom at specific seconds of conversation. |
| `speedMultiplier` | `number` | `1` | Animation speed multiplier (`0.5x`, `1x`, `1.5x`, `2x`). |
| `enableSound` | `boolean` | `true` | Enable or disable Web Audio API sound synthesis. |
| `showRestartButton` | `boolean` | `true` | Show floating restart button. |
| `restartButtonPosition` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left" \| "center"` | `"center"` | Floating restart button location. |
| `locale` | `"es" \| "en"` | `"es"` | Built-in UI language string translations. |
| `onMessageSent` | `(message: Message) => void` | `undefined` | Event callback fired whenever a message is sent. |
| `onScriptComplete` / `onComplete` | `(scriptId: string) => void` | `undefined` | Event callback fired when a conversation script finishes (all messages rendered). |

---

### 🎨 Step-Defined 3D Perspective Keyframes (`step.perspective`)

You can define 3D tilt angles (`rotateX`, `rotateY`, `rotateZ`, `zoom`, `duration`) directly on individual script steps so the camera smoothly rotates and zooms dynamically as specific messages arrive:

```tsx
{
  sender: "assistant",
  type: "text",
  content: "Here is our product catalog!",
  delay: 1500,
  perspective: {
    rotateX: -6,   // Tilt X angle (-45° to 45°)
    rotateY: 10,   // Tilt Y angle (-45° to 45°)
    zoom: 1.05,    // Scale zoom factor
    duration: 0.8  // Transition duration in seconds
  }
}
```

---

### 👥 Group Chat & Member Avatars (`chatType="group"`)

When configuring a group chat (`chatType="group"`):
- Messages sent by group members (`assistant` / non-user senders) display an avatar next to the message bubble on the left.
- You can specify a custom `senderAvatarUrl` in any `ScriptStep` to render the member's profile image.
- If no `senderAvatarUrl` is supplied, an avatar badge with the sender's initial letter and custom `senderColor` background is automatically rendered.

```tsx
{
  sender: "assistant",
  type: "text",
  content: "Hi everyone! Here is the latest update.",
  delay: 1200,
  senderName: "Sofia M.",
  senderColor: "#00a884",
  senderAvatarUrl: "https://example.com/avatar.jpg" // Optional member photo URL
}
```

---

### 🕹️ External Imperative Control API (`ref` & DOM `element`)

You can control `<WhatSimule ref={simRef} />` in React via `ref` or `<what-simule id="sim">` in Vanilla JS / Web Component via `document.getElementById(...)`:

```tsx
// React ref usage:
import { useRef } from 'react';
import { WhatSimule, WhatSimuleRef } from 'rrortega-whatsimule';

const simRef = useRef<WhatSimuleRef>(null);

// Set camera 3D perspective / rotation dynamically from outside:
simRef.current?.setPerspective({ rotateX: 12, rotateY: -15, zoom: 1.06, duration: 1.2 });
// Or with positional arguments: simRef.current?.setPerspective(12, -15, 0, 1.06, 1.2);
simRef.current?.resetPerspective(); // Reverts to step perspective

// Navigation & Playback Controls:
simRef.current?.goToStep(3);        // Jump to step index 3
simRef.current?.nextStep();        // Advance to next step
simRef.current?.previousStep();    // Go to previous step
simRef.current?.pause();           // Pause execution
simRef.current?.play();            // Resume / play execution
simRef.current?.stop();            // Stop simulation
simRef.current?.restart();         // Restart script from beginning
simRef.current?.setSpeed(2);       // Set speed multiplier (e.g. 2x)
simRef.current?.setScript('demo'); // Switch active script
```

```javascript
// Web Component DOM usage:
const sim = document.getElementById('my-sim');
sim.setPerspective({ rotateX: 10, rotateY: -10, zoom: 1.04, duration: 1.0 });
sim.goToStep(2);
sim.pause();
sim.play();
sim.setSpeedMultiplier(1.5);
```

#### Imperative Methods Summary:

| Method | Signature | Description |
| --- | --- | --- |
| `setPerspective` | `(perspectiveOrX, rotateY?, rotateZ?, zoom?, duration?)` | Set/override custom 3D rotation angles & zoom dynamically |
| `resetPerspective` | `()` | Clear custom perspective override and return to default / step tilt |
| `goToStep` / `jumpToStep` | `(index: number)` | Jump directly to a step index, pre-rendering prior steps |
| `nextStep` | `()` | Instantly advance to the next step |
| `previousStep` | `()` | Instantly go back to the previous step |
| `play` / `resume` | `()` | Resume or start conversation playback |
| `pause` | `()` | Pause conversation playback |
| `stop` | `()` | Stop simulation and reset state |
| `restart` | `()` | Restart current script from step 0 |
| `setSpeed` / `setSpeedMultiplier` | `(multiplier: number)` | Change playback speed multiplier (e.g. `0.5`, `1`, `1.5`, `2`) |
| `setScript` | `(scriptId: string, startIndex?: number)` | Switch active script |

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

