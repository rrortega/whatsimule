// Core framework-agnostic exports
export { WhatsAppSimulatorEngine } from "./core/simulator-engine";
export { playKeyClickSound, playSentSound, playReceiveSound } from "./core/audio-synth";
export type {
    Message,
    MessageSender,
    MessageType,
    ScriptStep,
    ChatScript,
    WhatsAppSimulatorOptions,
    SimulatorEventHandlers,
} from "./core/types";

// React exports
export { WhatsAppSimulator } from "./react/WhatsAppSimulator";
export { useWhatsAppSimulator } from "./react/useWhatsAppSimulator";
export { VirtualKeyboard } from "./react/components/VirtualKeyboard";
export type { WhatsAppSimulatorProps } from "./react/WhatsAppSimulator";

// Web Component export
export { WhatsAppSimulatorElement } from "./web-component/whatsapp-simulator-element";
