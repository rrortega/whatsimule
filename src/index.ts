// Core framework-agnostic exports
export { WhatsAppSimulatorEngine } from "./core/simulator-engine";
export { playKeyClickSound, playClickSound, playSentSound, playReceiveSound, playNotificationSound, playCallRingtoneSound, playHangupSound } from "./core/audio-synth";
export type {
    Message,
    MessageSender,
    MessageType,
    ScriptStep,
    ChatScript,
    StepPerspective,
    PerspectiveKeyframe,
    WhatsAppSimulatorOptions,
    SimulatorEventHandlers,
    WhatSimuleRef,
    SoundType,
    ContactCardData,
    CallData,
    IncomingCallData,
} from "./core/types";

// React exports
export { WhatSimule, WhatsAppSimulator } from "./react/WhatsAppSimulator";
export { useWhatsAppSimulator } from "./react/useWhatsAppSimulator";
export { VirtualKeyboard } from "./react/components/VirtualKeyboard";
export type { WhatSimuleProps, WhatsAppSimulatorProps } from "./react/WhatsAppSimulator";

// Web Component export
export { WhatSimuleElement } from "./web-component/whatsimule-element";
