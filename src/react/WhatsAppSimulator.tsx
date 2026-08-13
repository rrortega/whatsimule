import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { RotateCcw, Square, Circle, Triangle, X, Crop, Smile, Type, Pencil, Send, Mic, Lock } from "lucide-react";
import { WhatsAppSimulatorOptions, ChatScript, SimulatorEventHandlers, PerspectiveKeyframe, WhatSimuleRef, SoundType } from "../core/types";
import { useWhatsAppSimulator } from "./useWhatsAppSimulator";
import { ChatHeader } from "./components/ChatHeader";
import { MessageBubble } from "./components/MessageBubble";
import { ChatInput } from "./components/ChatInput";
import { VirtualKeyboard } from "./components/VirtualKeyboard";
import { ScriptSelector } from "./components/ScriptSelector";
import { AvatarModal } from "./components/AvatarModal";
import { IncomingCallModal } from "./components/IncomingCallModal";
import { PushNotificationBanner } from "./components/PushNotificationBanner";

export interface WhatSimuleProps extends WhatsAppSimulatorOptions, SimulatorEventHandlers {
    scripts?: Record<string, ChatScript>;
    className?: string;
    style?: React.CSSProperties;
}

export type WhatsAppSimulatorProps = WhatSimuleProps;

export const WhatSimule = forwardRef<WhatSimuleRef, WhatSimuleProps>(({
    scripts = {},
    customScripts,
    defaultActiveScriptId,
    initialStepIndex,
    contactName,
    assistantName = "RRORTEGA",
    contactAvatarUrl,
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
    enableStepTilt = true,
    enableTimelineTilt = true,
    perspectiveTimeline,
    theme = "dark",
    deviceStyle = "iphone",
    batteryLevel = 63,
    networkType = "5G",
    wifiSignalStrength = 4,
    statusBarTime = "09:41",
    width,
    height,
    speedMultiplier = 1,
    locale = "es",
    labels = {},
    className = "",
    style,
    onMessageSent,
    onScriptComplete,
    onComplete,
    onScriptChange,
    onSound,
}, ref) => {
    const activeScripts = customScripts || scripts;
    const containerRef = useRef<HTMLDivElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const [hoverRotation, setHoverRotation] = useState({ x: 0, y: 0 });

    const actualScrollTilt = enable3DTilt !== undefined ? enable3DTilt : enableScrollTilt;

    const handleScriptComplete = (scriptId: string) => {
        onScriptComplete?.(scriptId);
        onComplete?.(scriptId);
        if (containerRef.current) {
            containerRef.current.dispatchEvent(
                new CustomEvent("complete", { detail: { scriptId }, bubbles: true, composed: true })
            );
            containerRef.current.dispatchEvent(
                new CustomEvent("scriptcomplete", { detail: { scriptId }, bubbles: true, composed: true })
            );
        }
    };

    const handleSound = (type: SoundType) => {
        onSound?.(type);
        if (containerRef.current) {
            const elem = containerRef.current as any;
            if (typeof elem.onSound === "function") {
                elem.onSound(type);
            } else if (typeof elem.onsound === "function") {
                elem.onsound(type);
            }
            containerRef.current.dispatchEvent(
                new CustomEvent("sound", { detail: { type }, bubbles: true, composed: true })
            );
            containerRef.current.dispatchEvent(
                new CustomEvent("whatsimule:sound", { detail: { type }, bubbles: true, composed: true })
            );
        }
    };

    const sim = useWhatsAppSimulator(
        activeScripts,
        {
            defaultActiveScriptId,
            initialStepIndex,
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
            onSound: handleSound,
        },
        { onMessageSent, onScriptComplete: handleScriptComplete, onComplete, onScriptChange, onSound: handleSound }
    );
    const { state, activeScriptId, startScript, restartCurrentScript } = sim;

    useImperativeHandle(ref, () => ({
        setPerspective: (perspectiveOrX, rotateY, rotateZ, zoom, duration) =>
            sim.setPerspective(perspectiveOrX, rotateY, rotateZ, zoom, duration),
        resetPerspective: () => sim.resetPerspective(),
        goToStep: (index) => sim.goToStep(index),
        jumpToStep: (index) => sim.jumpToStep(index),
        nextStep: () => sim.nextStep(),
        previousStep: () => sim.previousStep(),
        play: () => sim.play(),
        resume: () => sim.resume(),
        pause: () => sim.pause(),
        stop: () => sim.stop(),
        restart: () => sim.restart(),
        setSpeedMultiplier: (speed) => sim.setSpeedMultiplier(speed),
        setSpeed: (speed) => sim.setSpeed(speed),
        setScript: (scriptId, startIndex) => sim.setScript(scriptId, startIndex),
        openAvatarModal: () => sim.openAvatarModal(),
        closeAvatarModal: () => sim.closeAvatarModal(),
        toggleAvatarModal: () => sim.toggleAvatarModal(),
    }), [sim]);

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

    // Step-defined Perspective Keyframe logic
    const activeStepPerspective = useMemo(() => {
        if (enableStepTilt === false) return null;
        if (state.activeStepPerspective) return state.activeStepPerspective;
        for (let i = state.messages.length - 1; i >= 0; i--) {
            if (state.messages[i].perspective) {
                return state.messages[i].perspective;
            }
        }
        return null;
    }, [enableStepTilt, state.activeStepPerspective, state.messages]);

    // Timeline Perspective Keyframes logic
    const activeKeyframe = useMemo(() => {
        if (!perspectiveTimeline || perspectiveTimeline.length === 0) return null;
        const currentSecond = state.elapsedTime / 1000;
        const sorted = [...perspectiveTimeline].sort((a, b) => a.second - b.second);
        let current: PerspectiveKeyframe | null = sorted[0];
        for (const kf of sorted) {
            if (kf.second <= currentSecond) {
                current = kf;
            } else {
                break;
            }
        }
        return current;
    }, [perspectiveTimeline, state.elapsedTime]);

    const isCustomPerspectiveActive = !!state.customPerspective;
    const isStepPerspectiveActive = !isCustomPerspectiveActive && !!(enableStepTilt !== false && activeStepPerspective);
    const isTimelineActive = !isCustomPerspectiveActive && !isStepPerspectiveActive && !!(perspectiveTimeline && perspectiveTimeline.length > 0 && enableTimelineTilt !== false);
    const isUserHovering = enableHoverTilt && (hoverRotation.x !== 0 || hoverRotation.y !== 0);
    const isAnimatedPerspectiveActive = (isCustomPerspectiveActive || isStepPerspectiveActive || isTimelineActive) && !isUserHovering;

    const targetRotateX = isCustomPerspectiveActive && state.customPerspective?.rotateX !== undefined
        ? state.customPerspective.rotateX
        : (isStepPerspectiveActive && activeStepPerspective?.rotateX !== undefined
            ? activeStepPerspective.rotateX
            : (isTimelineActive && activeKeyframe?.rotateX !== undefined
                ? activeKeyframe.rotateX
                : 0));

    const targetRotateY = isCustomPerspectiveActive && state.customPerspective?.rotateY !== undefined
        ? state.customPerspective.rotateY
        : (isStepPerspectiveActive && activeStepPerspective?.rotateY !== undefined
            ? activeStepPerspective.rotateY
            : (isTimelineActive && activeKeyframe?.rotateY !== undefined
                ? activeKeyframe.rotateY
                : 0));

    const targetRotateZ = isCustomPerspectiveActive && state.customPerspective?.rotateZ !== undefined
        ? state.customPerspective.rotateZ
        : (isStepPerspectiveActive && activeStepPerspective?.rotateZ !== undefined
            ? activeStepPerspective.rotateZ
            : (isTimelineActive && activeKeyframe?.rotateZ !== undefined
                ? (activeKeyframe.rotateZ || 0)
                : 0));

    const targetScale = isCustomPerspectiveActive && state.customPerspective?.zoom !== undefined
        ? state.customPerspective.zoom
        : (isStepPerspectiveActive && activeStepPerspective?.zoom !== undefined
            ? activeStepPerspective.zoom
            : (isTimelineActive && activeKeyframe?.zoom !== undefined
                ? (activeKeyframe.zoom || 1)
                : 1));

    const targetYOffset = isCustomPerspectiveActive && state.customPerspective?.yOffset !== undefined
        ? (state.customPerspective.yOffset || 0)
        : (isTimelineActive && activeKeyframe?.yOffset !== undefined
            ? (activeKeyframe.yOffset || 0)
            : 0);

    // Motion styles calculation (omits static numeric transform props when Framer Motion `animate` controls them)
    const motionStyle = isAnimatedPerspectiveActive
        ? { transformStyle: "preserve-3d" as const }
        : {
            rotateX: isUserHovering ? hoverRotation.x : (actualScrollTilt ? rotateXSpring : 0),
            rotateY: isUserHovering ? hoverRotation.y : (actualScrollTilt ? rotateYSpring : 0),
            rotateZ: 0,
            scale: 1,
            y: isUserHovering ? 0 : (actualScrollTilt ? yFloatSpring : 0),
            transformStyle: "preserve-3d" as const,
        };

    const currentDuration = isCustomPerspectiveActive
        ? (state.customPerspective?.duration ?? 1.2)
        : (isStepPerspectiveActive
            ? (activeStepPerspective?.duration ?? 1.2)
            : (isTimelineActive && activeKeyframe ? (activeKeyframe.duration ?? 1.2) : 1.2));

    const motionTransition = isAnimatedPerspectiveActive
        ? {
            type: "tween" as const,
            duration: currentDuration,
            ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
          }
        : undefined;

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
                    animate={isAnimatedPerspectiveActive ? {
                        rotateX: targetRotateX,
                        rotateY: targetRotateY,
                        rotateZ: targetRotateZ,
                        scale: targetScale,
                        y: targetYOffset,
                    } : undefined}
                    transition={motionTransition}
                    className={`rws-phone-wrapper rws-device-${deviceStyle}`}
                >
                    {/* Physical 3D Back Chassis Layer for Phone Depth Thickness */}
                    {deviceStyle !== "none" && (
                        <div className={`rws-phone-3d-back rws-device-${deviceStyle}`} />
                    )}

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
                        {/* Dynamic Realistic 3D Screen Glass Reflection & Sheen */}
                        <motion.div
                            className="rws-glass-reflection"
                            animate={{
                                opacity: isAnimatedPerspectiveActive
                                    ? Math.min(0.9, Math.max(0.25, Math.abs(targetRotateX) * 0.035 + Math.abs(targetRotateY) * 0.025 + 0.22))
                                    : (isUserHovering
                                        ? Math.min(0.9, Math.max(0.25, Math.abs(hoverRotation.x) * 0.035 + Math.abs(hoverRotation.y) * 0.025 + 0.22))
                                        : (actualScrollTilt ? 0.35 : 0.22)),
                            }}
                            transition={motionTransition || { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <motion.div
                                className="rws-glass-sheen"
                                animate={{
                                    y: isAnimatedPerspectiveActive
                                        ? -targetRotateX * 6
                                        : (isUserHovering ? -hoverRotation.x * 6 : (actualScrollTilt ? -5 : 0)),
                                    x: isAnimatedPerspectiveActive
                                        ? targetRotateY * 5
                                        : (isUserHovering ? hoverRotation.y * 5 : (actualScrollTilt ? 5 : 0)),
                                    rotate: isAnimatedPerspectiveActive
                                        ? targetRotateY * 0.8
                                        : (isUserHovering ? hoverRotation.y * 0.8 : 0),
                                }}
                                transition={motionTransition || { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </motion.div>
                        <div className="rws-glass-rim" />

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
                            contactName={contactName}
                            assistantName={assistantName}
                            contactAvatarUrl={contactAvatarUrl}
                            assistantAvatarUrl={assistantAvatarUrl}
                            chatType={chatType}
                            groupMembersText={groupMembersText}
                            isTyping={state.isTyping}
                            isRecordingAudio={state.isRecordingAudio}
                            onlineStatusText={labels.onlineStatusText || (locale === "es" ? "en línea" : "online")}
                            typingStatusText={labels.typingStatusText || (locale === "es" ? "escribiendo..." : "typing...")}
                            recordingStatusText={labels.recordingStatusText || (locale === "es" ? "grabando audio..." : "recording audio...")}
                            deviceStyle={deviceStyle}
                            batteryLevel={batteryLevel}
                            networkType={networkType}
                            wifiSignalStrength={wifiSignalStrength}
                            statusBarTime={statusBarTime}
                            onAvatarClick={sim.toggleAvatarModal}
                            avatarRipple={state.avatarRipple}
                        />

                        {/* Push Notification Banner */}
                        <PushNotificationBanner
                            notificationState={state.pushNotification}
                            onDismiss={() => {}}
                            deviceStyle={deviceStyle}
                            theme={theme}
                        />

                        {/* Incoming Call Screen Banner */}
                        <IncomingCallModal
                            callState={state.incomingCall}
                            onDecline={() => {}}
                            deviceStyle={deviceStyle}
                            theme={theme}
                        />

                        {/* Contact Profile Photo & Info Viewer Modal */}
                        <AvatarModal
                            isOpen={Boolean(state.isAvatarModalOpen)}
                            onClose={sim.closeAvatarModal}
                            contactName={contactName}
                            assistantName={assistantName}
                            contactAvatarUrl={contactAvatarUrl}
                            assistantAvatarUrl={assistantAvatarUrl}
                            chatType={chatType}
                            theme={theme}
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
                                    <Lock size={12} className="rws-encryption-icon" />
                                    <span>{locale === "es" ? "Los mensajes y llamadas están cifrados de extremo a extremo." : "Messages and calls are end-to-end encrypted."}</span>
                                </div>
                            )}

                            <div className="rws-messages-list">
                                <AnimatePresence mode="popLayout">
                                    {state.messages.map((message) => (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                            chatType={chatType}
                                            assistantAvatarUrl={assistantAvatarUrl}
                                            assistantName={assistantName}
                                        />
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
});

export const WhatsAppSimulator = WhatSimule;
