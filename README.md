# react-whatsapp-simulator

[![npm version](https://img.shields.io/npm/v/react-whatsapp-simulator.svg)](https://www.npmjs.com/package/react-whatsapp-simulator)
[![license](https://img.shields.io/npm/l/react-whatsapp-simulator.svg)](LICENSE)

An interactive, 3D animated WhatsApp conversation simulator component for **React**, **Next.js**, **Vue**, **Svelte**, and **Vanilla HTML/JS** applications. Designed to showcase AI assistants, customer support flows, incident intake, and lead qualification with real-time typing simulation, image upload progress, Web Audio API sound synthesis, and perspective tilt effects.

---

## ✨ Features

- 📱 **Realistic WhatsApp UI**: Authentic dark-mode WhatsApp interface with typing indicator dots, green send ripples, read receipts, and custom link preview badges.
- 🎨 **3D Scroll Tilt**: Smooth perspective rotation and elevation powered by `framer-motion` as the user scrolls the page.
- 🔊 **Web Audio API Sound Effects**: Built-in sound synthesis for keystrokes, message sent, and message received. Zero external mp3 dependencies!
- ⚡ **Framework Agnostic Engine**: Core TypeScript state machine with React bindings and Custom Element (`<whatsapp-simulator>`) support for Vue, Svelte, and HTML.
- 📜 **Custom Script Engine**: Define arbitrary conversation steps with custom text, delay timings, and image attachments.
- 🌐 **Localization & Custom Labels**: Native support for English, Spanish, or custom dictionary labels.

---

## 🚀 Installation

```bash
npm install react-whatsapp-simulator framer-motion lucide-react
# or
pnpm add react-whatsapp-simulator framer-motion lucide-react
# or
yarn add react-whatsapp-simulator framer-motion lucide-react
```

### Import Styles
Import the CSS stylesheet in your app entry point (e.g., `main.tsx`, `_app.tsx`, or `layout.tsx`):

```tsx
import "react-whatsapp-simulator/dist/whatsapp-simulator.css";
```

---

## 📖 React Usage

```tsx
import React from "react";
import { WhatsAppSimulator, ChatScript } from "react-whatsapp-simulator";
import "react-whatsapp-simulator/dist/whatsapp-simulator.css";

const demoScripts: Record<string, ChatScript> = {
    support: {
        id: "support",
        label: "Atención al Cliente",
        description: "Demostración de atención 24/7",
        steps: [
            { sender: "user", type: "text", content: "Hola, quisiera consultar sobre mi pedido.", delay: 500 },
            { sender: "assistant", type: "text", content: "¡Hola! Con gusto te ayudo. ¿Podrías darme tu número de orden?", delay: 1500 },
            { sender: "user", type: "text", content: "Es el #ORD-9841", delay: 1200 },
            { sender: "assistant", type: "text", content: "¡Gracias! Tu paquete está en camino y llegará hoy antes de las 6 PM. Puedes darle seguimiento aquí: https://mi-tienda.com/t/ORD-9841", delay: 2000 },
        ],
    },
};

export default function LandingDemo() {
    return (
        <WhatsAppSimulator
            title="Simulador de Asistente Virtual"
            description="Observá cómo responde nuestra IA en tiempo real por WhatsApp."
            assistantName="Soporte IA"
            scripts={demoScripts}
            enable3DTilt={true}
            enableSound={true}
            locale="es"
        />
    );
}
```

---

## 🌐 Web Component / Vue / Svelte / HTML Usage

Include the Web Component in non-React applications:

```html
<!-- HTML / Vue / Svelte -->
<script type="module">
  import { WhatsAppSimulatorElement } from 'react-whatsapp-simulator';
</script>

<whatsapp-simulator
  id="my-simulator"
  assistant-name="Asistente Virtual"
  locale="es"
  enable-sound="true">
</whatsapp-simulator>

<script>
  const simulator = document.getElementById('my-simulator');
  simulator.setScripts({
    demo: {
      id: 'demo',
      label: 'Demostración',
      description: 'Flujo inicial',
      steps: [
        { sender: 'user', type: 'text', content: 'Hola', delay: 500 },
        { sender: 'assistant', type: 'text', content: '¡Hola! ¿En qué te ayudamos hoy?', delay: 1200 }
      ]
    }
  });
</script>
```

---

## ⚙️ Props & API Reference

### `<WhatsAppSimulator />` (React)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scripts` | `Record<string, ChatScript>` | `{}` | Map of conversation scripts available in selector |
| `defaultActiveScriptId` | `string` | `first script id` | Initial script to play automatically |
| `assistantName` | `string` | `"Asistenxa AI"` | Name displayed in WhatsApp header |
| `assistantAvatarUrl` | `string` | `undefined` | Optional avatar image URL |
| `title` | `string` | `undefined` | Optional title heading above phone frame |
| `description` | `string` | `undefined` | Optional subtitle text above phone frame |
| `hideSelector` | `boolean` | `false` | Hide chip selector bar |
| `enable3DTilt` | `boolean` | `true` | Enable 3D scroll rotation effect |
| `enableSound` | `boolean` | `true` | Enable Web Audio keypress and send/receive sounds |
| `locale` | `'es' \| 'en'` | `'es'` | Preset language for default labels |
| `onMessageSent` | `(msg: Message) => void` | `undefined` | Callback fired when a message is added |
| `onScriptComplete` | `(scriptId: string) => void` | `undefined` | Callback fired when script reaches end |

---

## 📄 License

MIT © Asistenxa
