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

export interface StepPerspective {
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    zoom?: number;
    yOffset?: number;
    duration?: number;
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
    senderAvatarUrl?: string;
    senderColor?: string;
    caption?: string;
    audioDuration?: string;
    audioUrl?: string;
    linkPreview?: LinkPreviewData;
    perspective?: StepPerspective;
}

export interface ScriptStep {
    sender: MessageSender;
    type: MessageType;
    content: string;
    delay: number; // Delay before executing step (in ms)
    senderName?: string;
    senderAvatarUrl?: string;
    senderColor?: string;
    caption?: string;
    audioDuration?: string;
    audioUrl?: string;
    linkPreview?: LinkPreviewData;
    perspective?: StepPerspective;
}

export interface ChatScript {
    id: string;
    label: string;
    icon?: React.ReactNode | string;
    description: string;
    steps: ScriptStep[];
}

export interface PerspectiveKeyframe {
    id?: string;
    second: number;
    duration?: number;
    rotateX: number;
    rotateY: number;
    rotateZ?: number;
    zoom?: number;
    yOffset?: number;
}

export interface WhatsAppSimulatorOptions {
    customScripts?: Record<string, ChatScript>;
    defaultActiveScriptId?: string;
    initialStepIndex?: number;
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
    enableStepTilt?: boolean;
    enableTimelineTilt?: boolean;
    perspectiveTimeline?: PerspectiveKeyframe[];
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
    onComplete?: (scriptId: string) => void;
    onScriptChange?: (scriptId: string) => void;
}

export interface WhatSimuleRef {
    setPerspective: (
        perspectiveOrX?: StepPerspective | number,
        rotateY?: number,
        rotateZ?: number,
        zoom?: number,
        duration?: number
    ) => void;
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
