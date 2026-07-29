# AGENTS.md - AI Agent & Developer Guide

> **Package:** `rrortega-whatsimule`  
> **Repository:** `whatsimule`  
> **Purpose:** Interactive, animated 3D WhatsApp conversation simulator component (`<WhatSimule />`) for React and Web Applications with procedural Web Audio API sound synthesis.

---

## 🚀 Quick Overview & Installation

`rrortega-whatsimule` provides a framework-agnostic core engine, a native React component (`WhatSimule`), a headless hook (`useWhatsAppSimulator`), and a Web Component (`<what-simule>`) for Vue, Svelte, or Vanilla JS.

### 1. Install Package & Peer Dependencies

```bash
# pnpm (recommended)
pnpm add rrortega-whatsimule framer-motion lucide-react

# npm
npm install rrortega-whatsimule framer-motion lucide-react

# yarn
yarn add rrortega-whatsimule framer-motion lucide-react

# bun
bun add rrortega-whatsimule framer-motion lucide-react
```

> **Note:** `framer-motion` (>=10.0.0) and `lucide-react` (>=0.200.0) are peer dependencies for the React component.

### 2. Import Required CSS Stylesheet

You **must** import the library CSS file in your application entry point (e.g. `main.tsx`, `App.tsx`, or Next.js `layout.tsx` / `_app.tsx`):

```tsx
import 'rrortega-whatsimule/dist/whatsapp-simulator.css';
```

---

## 💻 Usage Patterns

### A. Basic React Component (`WhatSimule`)

`<WhatSimule />` is the primary React component (with `WhatsAppSimulator` kept as an export alias).

```tsx
'use client'; // Required if using Next.js App Router

import React from 'react';
import { WhatSimule, ChatScript } from 'rrortega-whatsimule';
import 'rrortega-whatsimule/dist/whatsapp-simulator.css';

const demoScripts: Record<string, ChatScript> = {
  sales_demo: {
    id: 'sales_demo',
    label: 'Sales Assistant Demo',
    description: 'Automated lead qualification flow',
    steps: [
      {
        sender: 'user',
        type: 'text',
        content: 'Hi! I want to schedule a demo of your product.',
        delay: 800,
      },
      {
        sender: 'assistant',
        type: 'text',
        content: 'Awesome! I can help you with that. What is your full name and company name?',
        delay: 1500,
        senderName: 'AI Sales Lead',
      },
      {
        sender: 'user',
        type: 'text',
        content: 'Alex Rivera from Acme Corp.',
        delay: 1200,
      },
      {
        sender: 'assistant',
        type: 'text',
        content: 'Great! You can pick a slot directly from our calendar:',
        delay: 1600,
        senderName: 'AI Sales Lead',
        linkPreview: {
          url: 'https://example.com/booking',
          title: 'Schedule a 15-min Demo',
          description: 'Pick a convenient date and time on Cal.com',
          siteName: 'cal.com',
        },
      },
    ],
  },
};

export function SimulatorWidget() {
  return (
    <div style={{ height: '700px', display: 'flex', justifyContent: 'center' }}>
      <WhatSimule
        customScripts={demoScripts}
        defaultActiveScriptId="sales_demo"
        assistantName="ChambaPro AI"
        theme="dark"
        deviceStyle="iphone"
        typingMode="direct"
        enableSound={true}
        speedMultiplier={1}
        locale="en"
        onScriptComplete={(scriptId) => console.log(`Script ${scriptId} completed!`)}
      />
    </div>
  );
}
```

---

### B. Headless React Hook (`useWhatsAppSimulator`)

For custom rendering when you want full control over the DOM and styles using the core engine state machine:

```tsx
import { useWhatsAppSimulator } from 'rrortega-whatsimule';

function CustomChatUI({ scripts }) {
  const {
    messages,
    activeScriptId,
    activeScript,
    isRunning,
    isTyping,
    typingSender,
    speedMultiplier,
    startScript,
    pauseScript,
    resumeScript,
    restartScript,
    setSpeedMultiplier,
  } = useWhatsAppSimulator({
    customScripts: scripts,
    defaultActiveScriptId: 'sales_demo',
    enableSound: true,
  });

  return (
    <div>
      <p>Status: {isTyping ? `${typingSender} is typing...` : 'Idle'}</p>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.sender}:</strong> {msg.content}
          </li>
        ))}
      </ul>
      <button onClick={() => restartScript()}>Restart</button>
    </div>
  );
}
```

---

### C. Web Component / HTML / Vue / Svelte (`<what-simule>`)

Register `WhatSimuleElement` as a Web Component for non-React projects:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>WhatSimule Web Component</title>
  <link rel="stylesheet" href="node_modules/rrortega-whatsimule/dist/whatsapp-simulator.css">
</head>
<body>
  <what-simule
    id="sim-element"
    assistant-name="AI Assistant"
    locale="en"
    enable-sound="true">
  </what-simule>

  <script type="module">
    import { WhatSimuleElement } from 'rrortega-whatsimule';

    if (!customElements.get('what-simule')) {
      customElements.define('what-simule', WhatSimuleElement);
    }

    const sim = document.getElementById('sim-element');
    sim.setScripts({
      demo: {
        id: 'demo',
        label: 'Demo Flow',
        description: 'Web component example script',
        steps: [
          { sender: 'user', type: 'text', content: 'Hello world!', delay: 1000 },
          { sender: 'assistant', type: 'text', content: 'Hi there!', delay: 1200 }
        ]
      }
    });
  </script>
</body>
</html>
```

---

## ⚙️ Props & Configuration Reference

### `WhatSimuleProps` / `WhatsAppSimulatorProps` / `WhatsAppSimulatorOptions`

| Option / Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `customScripts` / `scripts` | `Record<string, ChatScript>` | `{}` | Key-value map of playable conversation scripts |
| `defaultActiveScriptId` | `string` | First key in `customScripts` | ID of script to run automatically on load |
| `initialStepIndex` | `number` | `0` | 0-based step index to start simulation from (prior steps are pre-rendered) |
| `assistantName` | `string` | `"RRORTEGA"` | Name displayed in chat header |
| `assistantAvatarUrl` | `string` | `undefined` | Custom avatar image URL for chat header |
| `chatType` | `"direct" \| "group"` | `"direct"` | Single contact or group chat interface |
| `groupMembersText` | `string` | `undefined` | Subtitle listing members when `chatType="group"` |
| `wallpaperPattern` | `"doodle" \| "dots" \| "grid"` | `"doodle"` | Built-in WhatsApp chat background pattern |
| `customWallpaperUrl` | `string` | `undefined` | Custom background image URL override |
| `typingMode` | `"direct" \| "keyboard"` | `"direct"` | `"direct"` shows bubble typing indicator; `"keyboard"` animates on-screen keys |
| `title` | `string` | `undefined` | Header title string |
| `description` | `string` | `undefined` | Subtitle description string |
| `hideSelector` | `boolean` | `false` | Hides script switcher dropdown if `true` |
| `showRestartButton` | `boolean` | `true` | Enables floating restart button |
| `restartButtonPosition` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left" \| "center" \| "center-left" \| "center-right"` | `"bottom-right"` | Position of floating restart button |
| `restartButtonVisibility` | `"always" \| "on-complete" \| "never"` | `"always"` | When floating restart button is visible |
| `showEncryptionNotice` | `boolean` | `true` | Displays end-to-end encryption badge at top of chat |
| `enableSound` | `boolean` | `true` | Global audio toggle |
| `soundTyping` | `boolean` | `true` | Web Audio keypress clicking sound |
| `soundSent` | `boolean` | `true` | Web Audio message send pop sound |
| `soundReceive` | `boolean` | `true` | Web Audio incoming message chime |
| `enable3DTilt` | `boolean` | `undefined` | Enables 3D perspective tilt effect |
| `enableScrollTilt` | `boolean` | `true` | Applies subtle tilt as container scrolls into view |
| `enableHoverTilt` | `boolean` | `false` | Applies tilt on mouse hover |
| `enableStepTilt` | `boolean` | `true` | Enables step-defined 3D tilt perspective animations as messages arrive |
| `enableTimelineTilt` | `boolean` | `true` | Enables automatic keyframe perspective animation during conversation timeline |
| `perspectiveTimeline` | `PerspectiveKeyframe[]` | `undefined` | Keyframe array setting perspective angles & zoom at specific seconds of conversation |
| `theme` | `"dark" \| "light"` | `"dark"` | UI theme |
| `deviceStyle` | `"iphone" \| "android" \| "none"` | `"iphone"` | Phone bezel casing frame style |
| `width` | `string \| number` | `undefined` | Explicit container width |
| `height` | `string \| number` | `undefined` | Explicit container height |
| `speedMultiplier` | `number` | `1` | Playback speed multiplier (e.g. `1.5`, `2`) |
| `locale` | `"es" \| "en"` | `"es"` | Built-in i18n label set |
| `labels` | `object` | `{}` | Custom string overrides for UI labels |
| `onMessageSent` | `(message: Message) => void` | `undefined` | Callback fired when a message renders |
| `onScriptComplete` / `onComplete` | `(scriptId: string) => void` | `undefined` | Callback fired when script finishes playback (all messages rendered) |
| `onScriptChange` | `(scriptId: string) => void` | `undefined` | Callback fired when user switches active script |

---

### 🕹️ Imperative Remote Control Methods (`WhatSimuleRef` / DOM Element)

Both `<WhatSimule ref={simRef} />` (React) and `<what-simule id="sim">` (Web Component) expose mnemonic imperative control methods for external manipulation:

```ts
export interface WhatSimuleRef {
  setPerspective: (perspectiveOrX?: StepPerspective | number, rotateY?: number, rotateZ?: number, zoom?: number, duration?: number) => void;
  resetPerspective: () => void;
  goToStep: (index: number) => void;
  jumpToStep: (index: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  play: () => void;
  resume: () => void;
  pause: () => void;
  stop: () => void;
  restart: () => void;
  setSpeedMultiplier: (multiplier: number) => void;
  setSpeed: (multiplier: number) => void;
  setScript: (scriptId: string, startIndex?: number) => void;
}
```

```javascript
// Example Vanilla JS DOM call:
const sim = document.getElementById('my-sim');
sim.setPerspective({ rotateX: 10, rotateY: -15, zoom: 1.05, duration: 1.2 });
sim.goToStep(3);
sim.pause();
sim.play();
```

---

### Data Structures (`ChatScript` & `ScriptStep`)

```ts
export type MessageSender = "user" | "resident" | "assistant" | "asistenxa";
export type MessageType = "text" | "image" | "audio";

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface StepPerspective {
  rotateX?: number; // Tilt angle X in degrees (-45 to 45)
  rotateY?: number; // Tilt angle Y in degrees (-45 to 45)
  rotateZ?: number; // Rotation angle Z in degrees
  zoom?: number; // Scale zoom factor (e.g. 1.05)
  duration?: number; // Transition duration in seconds (default 0.8s)
}

export interface ScriptStep {
  sender: MessageSender;
  type: MessageType;
  content: string;
  delay: number; // Delay in milliseconds before executing this step
  senderName?: string; // Display name shown above message in group chats
  senderAvatarUrl?: string; // Custom avatar URL for member photo in group chats
  senderColor?: string; // Color for name & initial avatar background
  caption?: string;
  audioDuration?: string;
  audioUrl?: string;
  linkPreview?: LinkPreviewData;
  perspective?: StepPerspective; // Step-defined 3D tilt angles & zoom
}

export interface ChatScript {
  id: string;
  label: string;
  icon?: React.ReactNode | string;
  description: string;
  steps: ScriptStep[];
}
```

#### Group Chat Avatars (`chatType="group"`)

When `chatType="group"` is set:
- Incoming/assistant messages display an avatar to the left of the message bubble.
- If `senderAvatarUrl` is provided in the step (or `assistantAvatarUrl` on `<WhatSimule />`), the avatar photo image is rendered.
- If no avatar URL is provided, an initial circle badge is automatically rendered using the first letter of `senderName` (or `assistantName`) and colored with `senderColor` (or `#00a884`).

```tsx
const groupScript: ChatScript = {
  id: 'team_group',
  label: 'Team Group Chat',
  description: 'Group simulation with member avatars',
  steps: [
    {
      sender: 'assistant',
      type: 'text',
      content: 'Welcome to the project launch group!',
      delay: 1000,
      senderName: 'Carlos M.',
      senderColor: '#34b7f1',
      senderAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    },
    {
      sender: 'assistant',
      type: 'text',
      content: 'All systems are go 🚀',
      delay: 1400,
      senderName: 'Ana R.',
      senderColor: '#e542a3', // Fallback to initial 'A' with pink background
    },
  ],
};
```

---

## 🏗️ Codebase Architecture

```text
src/
├── core/                       # 1. Pure TypeScript Framework-Agnostic Layer
│   ├── types.ts                # Master TypeScript interfaces & options
│   ├── audio-synth.ts          # Web Audio API procedural sound synthesizer
│   └── simulator-engine.ts     # Core state machine & script runner
│
├── react/                      # 2. React UI & Motion Layer
│   ├── WhatsAppSimulator.tsx   # Primary React component (<WhatSimule /> / WhatsAppSimulator alias)
│   ├── useWhatsAppSimulator.ts # React state binding hook for engine
│   └── components/             # Subcomponents (ChatHeader, MessageBubble, VirtualKeyboard, etc.)
│
├── web-component/              # 3. Web Component Layer
│   └── whatsimule-element.ts   # CustomElement adapter (<what-simule>)
│
├── styles/                     # 4. CSS Styling Layer
│   └── whatsapp-simulator.css  # Scoped library stylesheet (rws-* namespace)
│
└── index.ts                    # Main entry point exporting components, hooks, engine & types
```

---

## 🎯 Mandatory Development & Transformation Rules

When modifying or contributing to this repository:

1. **No Application-Specific Imports (`@/utils/*` or Next.js internals)**
   - Do NOT import `next/image`, `next/link`, or host project utils.
   - Pass custom localization, labels, or callbacks through props.

2. **No Binary Sound Files in NPM Package**
   - Sound effects for keypresses, message send, and message receive are generated procedurally via `audio-synth.ts` using the browser's `AudioContext`.
   - Do NOT add binary `.mp3` or `.wav` files into the package assets.

3. **Strict CSS Scope Isolation (`rws-`)**
   - All CSS class names MUST use the `rws-` prefix (e.g., `.rws-phone-frame`, `.rws-chat-body`, `.rws-message-bubble`).
   - Do NOT depend on external Tailwind CSS or global utility classes.

4. **Public Media URLs**
   - Media items in scripts (images/audio) must be supplied as valid HTTP/HTTPS URLs or base64 data URIs. Do not rely on local file paths.

---

## 🛠️ Build & Verification Commands

| Command | Action |
| --- | --- |
| `pnpm run build` | Builds ESM (`dist/index.mjs`), CJS (`dist/index.js`), typings (`dist/index.d.ts`), and CSS (`dist/whatsapp-simulator.css`) using `tsup`. |
| `pnpm run dev` | Starts `tsup` watcher during development. |
| `pnpm run typecheck` | Runs `tsc --noEmit` to verify strict TypeScript safety. |
| `pnpm run lint` | Lints typescript files in `src/`. |

---

## 📋 Quality Assurance Checklist

Before pushing changes or releasing new npm versions:

1. [ ] Run `pnpm run typecheck` to confirm zero TypeScript compilation errors.
2. [ ] Run `pnpm run build` to confirm all output files compile cleanly into `dist/`.
3. [ ] Verify `dist/whatsapp-simulator.css` is present and correctly linked in `package.json`.
4. [ ] Ensure peer dependencies (`framer-motion`, `lucide-react`, `react`, `react-dom`) are not bundled into `dist/`.
