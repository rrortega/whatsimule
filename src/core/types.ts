import React from "react";

export type MessageSender = "user" | "resident" | "assistant" | "asistenxa";
export type MessageType = "text" | "image" | "audio";

export interface LinkPreviewData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
}

export interface Message {
    id: string;
    sender: MessageSender;
    type: MessageType;
    content: string;
    timestamp: string;
    isUploading?: boolean;
    uploadProgress?: number;
    senderName?: string;
    senderColor?: string;
    caption?: string;
    audioDuration?: string;
    audioUrl?: string;
    linkPreview?: LinkPreviewData;
}

export interface ScriptStep {
    sender: MessageSender;
    type: MessageType;
    content: string;
    delay: number; // Delay before executing step (in ms)
    senderName?: string;
    senderColor?: string;
    caption?: string;
    audioDuration?: string;
    audioUrl?: string;
    linkPreview?: LinkPreviewData;
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
    chatType?: "direct" | "group";
    groupMembersText?: string;
    wallpaperPattern?: "doodle" | "dots" | "grid";
    customWallpaperUrl?: string;
    typingMode?: "direct" | "keyboard";
    title?: string;
    description?: string;
    hideSelector?: boolean;
    showRestartButton?: boolean;
    restartButtonPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center" | "center-left" | "center-right";
    restartButtonVisibility?: "always" | "on-complete" | "never";
    showEncryptionNotice?: boolean;
    enableSound?: boolean;
    soundTyping?: boolean;
    soundSent?: boolean;
    soundReceive?: boolean;
    enable3DTilt?: boolean;
    enableScrollTilt?: boolean;
    enableHoverTilt?: boolean;
    theme?: "dark" | "light";
    deviceStyle?: "iphone" | "android" | "none";
    width?: string | number;
    height?: string | number;
    speedMultiplier?: number;
    locale?: "es" | "en";
    labels?: {
        onlineStatus?: string;
        typingStatus?: string;
        recordingStatus?: string;
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
