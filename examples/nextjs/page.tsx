"use client";

import React from "react";
import { WhatSimule, ChatScript } from "rrortega-whatsimule";
import "rrortega-whatsimule/dist/whatsapp-simulator.css";

const demoScripts: Record<string, ChatScript> = {
  welcome: {
    id: "welcome",
    label: "Welcome Demo",
    description: "Interactive AI Landing Demo",
    steps: [
      { sender: "user", type: "text", content: "Hello! How can this simulator help my landing page?", delay: 800 },
      { sender: "assistant", type: "text", content: "It showcases your product's capabilities with real-time interactive typing and audio! 🚀", delay: 1500 }
    ]
  }
};

export default function NextJSExamplePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
      <WhatSimule
        scripts={demoScripts}
        assistantName="Rolando AI"
        deviceStyle="iphone"
        theme="dark"
        enableSound={true}
      />
    </main>
  );
}
