import React from "react";

export type MessageSender = "user" | "resident" | "assistant" | "asistenxa";
export type MessageType = "text" | "image";

export interface Message {
    id: string;
    sender: MessageSender;
    type: MessageType;
    content: string;
    timestamp: string;
    isUploading?: boolean;
    uploadProgress?: number;
}

export interface ScriptStep {
    sender: MessageSender;
    type: MessageType;
    content: string;
    delay: number; // Delay before executing step (in ms)
}

export interface ChatScript {
    id: string;
    label: string;
    icon?: React.ReactNode | string;
    description: string;
    steps: ScriptStep[];
}

export interface WhatsAppSimulatorOptions {
    customScripts?: Record<string, ChatScript>;
    defaultActiveScriptId?: string;
    assistantName?: string;
    assistantAvatarUrl?: string;
    title?: string;
    description?: string;
    hideSelector?: boolean;
    enableSound?: boolean;
    enable3DTilt?: boolean;
    locale?: "es" | "en";
    labels?: {
        onlineStatus?: string;
        typingStatus?: string;
        inputPlaceholder?: string;
        speedMultiplier?: string;
        restartTooltip?: string;
        trackerLinkText?: string;
    };
}

export interface SimulatorEventHandlers {
    onMessageSent?: (message: Message) => void;
    onScriptComplete?: (scriptId: string) => void;
    onScriptChange?: (scriptId: string) => void;
}
