import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { RotateCcw, Square, Circle, Triangle, X, Crop, Smile, Type, Pencil, Send, Mic } from "lucide-react";
import { WhatsAppSimulatorOptions, ChatScript, SimulatorEventHandlers } from "../core/types";
import { useWhatsAppSimulator } from "./useWhatsAppSimulator";
import { ChatHeader } from "./components/ChatHeader";
import { MessageBubble } from "./components/MessageBubble";
import { ChatInput } from "./components/ChatInput";
import { VirtualKeyboard } from "./components/VirtualKeyboard";
import { ScriptSelector } from "./components/ScriptSelector";

export interface WhatSimuleProps extends WhatsAppSimulatorOptions, SimulatorEventHandlers {
    scripts?: Record<string, ChatScript>;
    className?: string;
    style?: React.CSSProperties;
}

export type WhatsAppSimulatorProps = WhatSimuleProps;

export const WhatSimule: React.FC<WhatSimuleProps> = ({
    scripts = {},
    customScripts,
    defaultActiveScriptId,
    assistantName = "RRORTEGA",
    assistantAvatarUrl,
    chatType = "direct",
    groupMembersText,
    wallpaperPattern = "doodle",
    customWallpaperUrl,
    typingMode = "direct",
    title,
    description,
    hideSelector = false,
    showRestartButton = true,
    restartButtonPosition = "bottom-right",
    restartButtonVisibility = "always",
    showEncryptionNotice = true,
    enableSound = true,
    soundTyping = true,
    soundSent = true,
    soundReceive = true,
    enable3DTilt,
    enableScrollTilt = true,
    enableHoverTilt = false,
    theme = "dark",
    deviceStyle = "iphone",
    width,
    height,
    speedMultiplier = 1,
    locale = "es",
    labels = {},
    className = "",
    style,
    onMessageSent,
    onScriptComplete,
    onScriptChange,
}) => {
    const activeScripts = customScripts || scripts;
    const containerRef = useRef<HTMLDivElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const [hoverRotation, setHoverRotation] = useState({ x: 0, y: 0 });

    const actualScrollTilt = enable3DTilt !== undefined ? enable3DTilt : enableScrollTilt;

    const { state, activeScriptId, startScript, restartCurrentScript } = useWhatsAppSimulator(
        activeScripts,
        {
            defaultActiveScriptId,
            assistantName,
            assistantAvatarUrl,
            enableSound,
            soundTyping,
            soundSent,
            soundReceive,
            speedMultiplier,
            typingMode,
            locale,
            labels,
        },
        { onMessageSent, onScriptComplete, onScriptChange }
    );

    // Scroll 3D perspective effect
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const rotateXRaw = useTransform(scrollYProgress, [0, 0.5, 1], [10, 2, -8]);
    const rotateYRaw = useTransform(scrollYProgress, [0, 0.5, 1], [-12, -4, 8]);
    const yFloatRaw = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);

    const springConfig = { stiffness: 100, damping: 20 };
    const rotateXSpring = useSpring(rotateXRaw, springConfig);
    const rotateYSpring = useSpring(rotateYRaw, springConfig);
    const yFloatSpring = useSpring(yFloatRaw, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!enableHoverTilt) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const maxTilt = 15;
        const rotateYVal = (x / (rect.width / 2)) * maxTilt;
        const rotateXVal = -(y / (rect.height / 2)) * maxTilt;
        setHoverRotation({ x: rotateXVal, y: rotateYVal });
    };

    const handleMouseLeave = () => {
        if (enableHoverTilt) {
            setHoverRotation({ x: 0, y: 0 });
        }
    };

    const captionTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll internal chat container to bottom on new messages, typing, or keyboard open
    useEffect(() => {
        const scrollToBottom = () => {
            if (chatBodyRef.current) {
                chatBodyRef.current.scrollTo({
                    top: chatBodyRef.current.scrollHeight,
                    behavior: "smooth"
                });
            }
        };

        scrollToBottom();

        // Additional timers ensure chat auto-scrolls cleanly as keyboard finishes opening
        const timer1 = setTimeout(scrollToBottom, 60);
        const timer2 = setTimeout(scrollToBottom, 180);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [state.messages, state.isTyping, state.isKeyboardOpen, state.inputValue]);

    // Auto-expand caption textarea in media preview screen
    useEffect(() => {
        if (captionTextareaRef.current) {
            captionTextareaRef.current.style.height = "auto";
            const newHeight = Math.min(captionTextareaRef.current.scrollHeight, 120);
            captionTextareaRef.current.style.height = `${newHeight}px`;
        }
    }, [state.mediaPreview?.captionText]);

    const progressPercentage = state.totalDuration > 0
        ? Math.min(100, Math.round((state.elapsedTime / state.totalDuration) * 100))
        : 0;

    // Combine motion styles for scroll & hover tilt
    const motionStyle = {
        rotateX: enableHoverTilt ? hoverRotation.x : (actualScrollTilt ? rotateXSpring : 0),
        rotateY: enableHoverTilt ? hoverRotation.y : (actualScrollTilt ? rotateYSpring : 0),
        y: actualScrollTilt && !enableHoverTilt ? yFloatSpring : 0,
        transformStyle: "preserve-3d" as const,
    };

    const shouldShowRestart = (() => {
        if (!showRestartButton) return false;
        if (restartButtonVisibility === "never") return false;
        if (restartButtonVisibility === "on-complete") return !!state.isComplete;
        return true;
    })();

    return (
        <div ref={containerRef} className={`rws-container ${className}`} style={style}>
            {/* Title & Selector section */}
            {(title || description || !hideSelector) && (
                <div className="rws-meta-header">
                    {title && <h2 className="rws-title">{title}</h2>}
                    {description && <p className="rws-description">{description}</p>}

                    {!hideSelector && (
                        <ScriptSelector
                            scripts={activeScripts}
                            activeScriptId={activeScriptId}
                            onSelectScript={startScript}
                        />
                    )}
                </div>
            )}

            {/* 3D Perspective Wrapper */}
            <div
                className="rws-perspective-container"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <motion.div
                    style={{
                        ...motionStyle,
                        maxWidth: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
                    }}
                    className={`rws-phone-wrapper rws-device-${deviceStyle}`}
                >
                    {/* Physical Side Hardware Buttons on Wrapper */}
                    {deviceStyle === "iphone" ? (
                        <>
                            <div className="rws-side-btn rws-iphone-mute" />
                            <div className="rws-side-btn rws-iphone-vol-up" />
                            <div className="rws-side-btn rws-iphone-vol-down" />
                            <div className="rws-side-btn rws-iphone-power" />
                        </>
                    ) : deviceStyle === "android" ? (
                        <>
                            <div className="rws-side-btn rws-android-vol" />
                            <div className="rws-side-btn rws-android-power" />
                        </>
                    ) : null}

                    {/* Phone Frame with OVERFLOW: HIDDEN to clip content cleanly to rounded corners */}
                    <div
                        className={`rws-phone-frame rws-theme-${theme} rws-device-${deviceStyle}`}
                        style={height !== undefined ? { height: typeof height === "number" ? `${height}px` : height } : undefined}
                    >
                        {/* Top Camera Notch / Punch-hole */}
                        {deviceStyle === "iphone" ? (
                            <div className="rws-phone-notch-container">
                                <div className="rws-dynamic-island">
                                    <div className="rws-camera-lens" />
                                    <div className="rws-speaker-grille" />
                                </div>
                            </div>
                        ) : deviceStyle === "android" ? (
                            <div className="rws-android-punchhole-container">
                                <div className="rws-android-speaker-slit" />
                                <div className="rws-android-punchhole" />
                            </div>
                        ) : null}

                        {/* WhatsApp Header & Status Bar */}
                        <ChatHeader
                            assistantName={assistantName}
                            assistantAvatarUrl={assistantAvatarUrl}
                            chatType={chatType}
                            groupMembersText={groupMembersText}
                            isTyping={state.isTyping}
                            isRecordingAudio={state.isRecordingAudio}
                            onlineStatusText={labels.onlineStatus || (locale === "es" ? "en línea" : "online")}
                            typingStatusText={labels.typingStatus || (locale === "es" ? "escribiendo..." : "typing...")}
                            recordingStatusText={labels.recordingStatus || (locale === "es" ? "grabando audio..." : "recording audio...")}
                            deviceStyle={deviceStyle}
                        />

                        {/* Chat Messages Body */}
                        <div
                            ref={chatBodyRef}
                            className={`rws-chat-body rws-wallpaper-${wallpaperPattern}`}
                            style={
                                customWallpaperUrl
                                    ? {
                                        backgroundImage: `url("${customWallpaperUrl}")`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }
                                    : undefined
                            }
                        >
                            {showEncryptionNotice && (
                                <div className="rws-encryption-notice">
                                    <span>🔒 {locale === "es" ? "Los mensajes y llamadas están cifrados de extremo a extremo." : "Messages and calls are end-to-end encrypted."}</span>
                                </div>
                            )}

                            <div className="rws-messages-list">
                                <AnimatePresence mode="popLayout">
                                    {state.messages.map((message) => (
                                        <MessageBubble key={message.id} message={message} />
                                    ))}
                                </AnimatePresence>

                                {/* Recording audio indicator */}
                                {state.isRecordingAudio ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="rws-recording-indicator"
                                    >
                                        <Mic size={14} className="rws-rec-dot-mic" />
                                        <span>{locale === "es" ? "grabando audio..." : "recording audio..."}</span>
                                    </motion.div>
                                ) : state.isTyping ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="rws-typing-indicator"
                                    >
                                        <span className="rws-dot rws-dot-1" />
                                        <span className="rws-dot rws-dot-2" />
                                        <span className="rws-dot rws-dot-3" />
                                    </motion.div>
                                ) : null}
                            </div>
                        </div>

                        {/* Input Bar */}
                        <ChatInput
                            inputValue={state.inputValue}
                            attachedImage={state.attachedImage}
                            audioRecording={state.audioRecording}
                            sendRipple={state.sendRipple}
                            placeholder={labels.inputPlaceholder || (locale === "es" ? "Escribe un mensaje" : "Type a message")}
                        />

                        {/* Interactive Virtual Mobile Keyboard */}
                        <VirtualKeyboard
                            isOpen={state.isKeyboardOpen}
                            pressedKey={state.pressedKey}
                            deviceStyle={deviceStyle}
                            theme={theme}
                        />

                        {/* Full Screen WhatsApp Media Preview Screen */}
                        <AnimatePresence>
                            {state.mediaPreview && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.2 }}
                                    className="rws-media-preview-screen"
                                >
                                    <div className="rws-media-preview-header">
                                        <button type="button" className="rws-media-icon-btn" aria-label="Cerrar">
                                            <X size={20} />
                                        </button>
                                        <div className="rws-media-tools">
                                            <Crop size={18} className="rws-media-tool-icon" />
                                            <Smile size={18} className="rws-media-tool-icon" />
                                            <Type size={18} className="rws-media-tool-icon" />
                                            <Pencil size={18} className="rws-media-tool-icon" />
                                        </div>
                                    </div>

                                    <div className="rws-media-preview-body">
                                        <img
                                            src={state.mediaPreview.imageUrl}
                                            alt="Preview"
                                            className="rws-media-preview-img"
                                        />
                                    </div>

                                    <div className="rws-media-preview-footer">
                                        <div className="rws-media-caption-box">
                                            <Smile size={20} className="rws-caption-smile-icon" />
                                            <textarea
                                                ref={captionTextareaRef}
                                                readOnly
                                                rows={1}
                                                value={state.mediaPreview.captionText}
                                                placeholder={locale === "es" ? "Añade un comentario..." : "Add a caption..."}
                                                className="rws-media-caption-input"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className={`rws-send-btn ${state.sendRipple ? "rws-btn-ripple" : ""}`}
                                            aria-label="Enviar"
                                        >
                                            <Send size={18} className="rws-send-icon" />
                                        </button>
                                    </div>

                                    <VirtualKeyboard
                                        isOpen={!!state.mediaPreview.isKeyboardOpen}
                                        pressedKey={state.mediaPreview.pressedKey || null}
                                        deviceStyle={deviceStyle}
                                        theme={theme}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Device Bottom Navigation Bar */}
                        {deviceStyle === "iphone" ? (
                            <div className="rws-phone-home-indicator">
                                <div className="rws-home-bar" />
                            </div>
                        ) : deviceStyle === "android" ? (
                            <div className="rws-android-nav-bar">
                                <button type="button" className="rws-android-nav-btn" aria-label="Recientes">
                                    <Square size={12} />
                                </button>
                                <button type="button" className="rws-android-nav-btn" aria-label="Inicio">
                                    <Circle size={12} />
                                </button>
                                <button type="button" className="rws-android-nav-btn" aria-label="Atrás">
                                    <Triangle size={12} style={{ transform: "rotate(-90deg)" }} />
                                </button>
                            </div>
                        ) : null}

                        {/* Floating Restart Action Button */}
                        {shouldShowRestart && (
                            <button
                                type="button"
                                onClick={restartCurrentScript}
                                className={`rws-restart-btn rws-restart-pos-${restartButtonPosition}`}
                                title={labels.restartTooltip || "Reiniciar conversación"}
                                aria-label="Reiniciar conversación"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export const WhatsAppSimulator = WhatSimule;
