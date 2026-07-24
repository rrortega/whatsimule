🇪🇸 Español | [🇬🇧 Read in English](README.md)

# rrortega-whatsimule (`react-whatsapp-simulator`)

[![npm version](https://img.shields.io/npm/v/rrortega-whatsimule.svg)](https://www.npmjs.com/package/rrortega-whatsimule)
[![licencia](https://img.shields.io/npm/l/rrortega-whatsimule.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Listo-blue.svg)](https://www.typescriptlang.org/)

Una librería interactiva y pixel-perfect para **React** y **Next.js** que simula conversaciones reales de WhatsApp. Diseñada para presentar asistentes de Inteligencia Artificial, flujos de atención al cliente, recepción de incidentes y calificación de leads con simulación de tipeo en tiempo real con teclado QWERTY, pantalla de subida de imágenes, grabación de notas de voz manos libres, síntesis de sonido con Web Audio API y efectos de inclinación 3D.

---

## 🌐 Demo Interactivo en Vivo

Prueba el playground interactivo y personaliza todas las opciones en tiempo real:
👉 **[https://rrortega.github.io/whatsimule/](https://rrortega.github.io/whatsimule/)**

---

## ✨ Características Principales

- 📱 **Interfaz Pixel-Perfect de WhatsApp**: Fiel a la experiencia oficial de WhatsApp Web y Mobile con temas Claro y Oscuro, marcos de teléfono para iPhone y Android, barra de estado, confirmaciones de lectura y tarjetas de vista previa de enlaces.
- ⌨️ **Teclado Virtual Interactivo**: Animación de tipeo letra por letra con teclado QWERTY dinámico, respuesta háptica visual, sombras superiores ultra realistas y sonidos de teclas con Web Audio API.
- 📸 **Envío & Carga de Medios**: Pantalla completa de previsualización de imagen con campo de comentario autoajustable, desenfoque progresivo en chat y anillo SVG circular de carga.
- 🎙️ **Notas de Voz & Grabación Manos Libres**: Barra de grabación de voz interactiva con espectro de ondas en tiempo real, estado de encabezado `"Grabando audio..."` y transcripción automática en cursiva.
- 🎨 **Totalmente Personalizable**: Control directo de dimensiones (ancho y alto), patrones de fondo (Doodle, Puntos o imagen propia), avatares, nombres y pasos de la conversación.
- 🎛️ **Perspectiva & Inclinación 3D**: Efectos sutiles de inclinación 3D al hacer hover o scroll, auto-scroll fluido a mensajes recientes y control de velocidad.
- 🔊 **Sin Archivos de Sonido Externos**: Síntesis de sonido nativa con Web Audio API para pulsación de teclas, envío de mensajes y tono de recepción. Cero dependencias mp3 pesadas.
- 📦 **Listo para Producción**: Código optimizado en TypeScript con distribución dual en formatos ESM y CJS.

---

## 📦 Instalación

Instala `rrortega-whatsimule` utilizando tu gestor de paquetes preferido:

```bash
npm install rrortega-whatsimule
# o
pnpm add rrortega-whatsimule
# o
yarn add rrortega-whatsimule
# o
bun add rrortega-whatsimule
```

### Importar Estilos CSS

Importa los estilos de la librería en el archivo raíz de tu aplicación (por ejemplo `App.tsx`, `main.tsx`, `_app.tsx` o `layout.tsx`):

```tsx
import "rrortega-whatsimule/dist/whatsapp-simulator.css";
```

---

## 🚀 Ejemplo de Uso Rápido

```tsx
import React from "react";
import { WhatsAppSimulator, ChatScript } from "rrortega-whatsimule";
import "rrortega-whatsimule/dist/whatsapp-simulator.css";

const demoScripts: Record<string, ChatScript> = {
  soporte_ia: {
    id: "soporte_ia",
    label: "🤖 Asistente IA 24/7",
    description: "Demostración de atención automatizada",
    steps: [
      { sender: "user", type: "text", content: "¡Hola! Quisiera consultar sobre mi ticket #4092.", delay: 800 },
      { sender: "assistant", type: "text", content: "¡Hola! Con gusto te ayudo. Estoy verificando en el sistema... 🔍", delay: 1500 },
      { sender: "user", type: "audio", content: "Nota de voz explicando el inconveniente.", audioDuration: "0:12", delay: 1600 },
      { sender: "assistant", type: "audio", content: "Instrucciones de audio para resolver la consulta.", audioDuration: "0:24", delay: 2000 },
      { sender: "user", type: "image", content: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500", caption: "Foto de la falla en el equipo.", delay: 1800 },
      { sender: "assistant", type: "text", content: "¡Tu solicitud ha sido aprobada y el técnico va en camino! 🛠️", delay: 1200 }
    ]
  }
};

export default function App() {
  return (
    <WhatsAppSimulator
      scripts={demoScripts}
      defaultActiveScriptId="soporte_ia"
      assistantName="Rolando IA"
      chatType="direct"
      wallpaperPattern="doodle"
      typingMode="keyboard"
      theme="dark"
      deviceStyle="iphone"
      width="380px"
      height="680px"
      enableSound={true}
      locale="es"
      onMessageSent={(message) => console.log("Mensaje enviado:", message)}
      onScriptComplete={(scriptId) => console.log("Script completado:", scriptId)}
    />
  );
}
```

---

## 🎛️ Propiedades del Componente (API)

| Propiedad | Tipo | Predeterminado | Descripción |
| :--- | :--- | :--- | :--- |
| `scripts` | `Record<string, ChatScript>` | `{}` | Diccionario de guiones conversacionales con pasos (`text`, `image`, `audio`). |
| `defaultActiveScriptId` | `string` | `undefined` | ID del guión activo predeterminado a ejecutar. |
| `assistantName` | `string` | `"Asistenxa AI"` | Nombre del contacto o grupo mostrado en el encabezado. |
| `assistantAvatarUrl` | `string` | `undefined` | URL de la imagen de perfil del contacto. |
| `chatType` | `"direct" \| "group"` | `"direct"` | Modo de conversación en encabezado (Chat Privado o Grupal). |
| `wallpaperPattern` | `"doodle" \| "dots" \| "grid"` | `"doodle"` | Patrón de fondo del chat. |
| `customWallpaperUrl` | `string` | `undefined` | URL de imagen propia para el fondo del chat. |
| `typingMode` | `"direct" \| "keyboard"` | `"keyboard"` | Modo de tipeo: directo rápido o Teclado Virtual QWERTY interactivo. |
| `theme` | `"dark" \| "light"` | `"dark"` | Tema de color de WhatsApp (Oscuro o Claro). |
| `deviceStyle` | `"iphone" \| "android" \| "none"` | `"iphone"` | Marco de teléfono para el simulador (iPhone, Android o sin marco). |
| `width` | `string \| number` | `undefined` | Ancho personalizado del contenedor. |
| `height` | `string \| number` | `undefined` | Alto personalizado del contenedor. |
| `speedMultiplier` | `number` | `1` | Multiplicador de velocidad de animación (`0.5x`, `1x`, `1.5x`, `2x`). |
| `enableSound` | `boolean` | `true` | Habilitar o deshabilitar sonidos sintéticos con Web Audio API. |
| `showRestartButton` | `boolean` | `true` | Mostrar u ocultar el botón flotante de reinicio. |
| `restartButtonPosition` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left" \| "center"` | `"center"` | Ubicación del botón flotante de reinicio. |
| `locale` | `"es" \| "en"` | `"es"` | Idioma de las etiquetas de la interfaz. |
| `onMessageSent` | `(message: Message) => void` | `undefined` | Callback disparado al enviar cada mensaje. |
| `onScriptComplete` | `(scriptId: string) => void` | `undefined` | Callback disparado al finalizar un guión conversacional. |

---

## 👨‍💻 Autor & Comunidad Open Source

Creado y mantenido por **Rolando R. Ortega**.

¡Las contribuciones, sugerencias y reportes de errores son más que bienvenidos!

- ⭐ **Deja tu estrella en GitHub**: Si esta librería te fue útil, ¡deja tu estrella en [GitHub](https://github.com/rrortega/whatsimule) para apoyar el proyecto!
- 🐛 **Abre un Issue**: ¿Encontraste un bug o tienes una idea para mejorar? Abre un issue en [GitHub Issues](https://github.com/rrortega/whatsimule/issues).
- 🔀 **Envía tu Pull Request**: Siente libre de enviar un Pull Request en [GitHub Pull Requests](https://github.com/rrortega/whatsimule/pulls).

---

## 📄 Licencia

Este proyecto es open-source y está licenciado bajo la [Licencia MIT](LICENSE). Cualquiera es libre de usarlo, modificarlo y distribuirlo en proyectos personales o comerciales.
