import React from "react";
import { WhatsAppSimulator, ChatScript } from "rrortega-whatsimule";
import "rrortega-whatsimule/dist/whatsapp-simulator.css";

const demoScripts: Record<string, ChatScript> = {
  demo: {
    id: "demo",
    label: "Vite Demo",
    description: "Vite React Integration Example",
    steps: [
      { sender: "user", type: "text", content: "Hi! Testing whatsimule in Vite.", delay: 600 },
      { sender: "assistant", type: "text", content: "Works fast and seamlessly with Vite! ⚡", delay: 1200 }
    ]
  }
};

export default function App() {
  return (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
      <WhatsAppSimulator
        scripts={demoScripts}
        assistantName="Vite Assistant"
        deviceStyle="android"
        theme="dark"
      />
    </div>
  );
}
