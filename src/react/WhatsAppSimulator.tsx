import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { WhatsAppSimulatorOptions, ChatScript, SimulatorEventHandlers } from "../core/types";
import { useWhatsAppSimulator } from "./useWhatsAppSimulator";
import { ChatHeader } from "./components/ChatHeader";
import { MessageBubble } from "./components/MessageBubble";
import { ChatInput } from "./components/ChatInput";
import { ScriptSelector } from "./components/ScriptSelector";

export interface WhatsAppSimulatorProps extends WhatsAppSimulatorOptions, SimulatorEventHandlers {
    scripts?: Record<string, ChatScript>;
    className?: string;
    style?: React.CSSProperties;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
    scripts = {},
    customScripts,
    defaultActiveScriptId,
    assistantName = "Asistenxa AI",
    assistantAvatarUrl,
    title,
    description,
    hideSelector = false,
    enableSound = true,
    enable3DTilt = true,
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
    const chatEndRef = useRef<HTMLDivElement>(null);

    const { state, activeScriptId, startScript, restartCurrentScript } = useWhatsAppSimulator(
        activeScripts,
        {
            defaultActiveScriptId,
            assistantName,
            assistantAvatarUrl,
            enableSound,
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

    const rotateXRaw = useTransform(scrollYProgress, [0, 0.5, 1], [15, 6, -12]);
    const rotateYRaw = useTransform(scrollYProgress, [0, 0.5, 1], [-18, -8, 12]);
    const yFloatRaw = useTransform(scrollYProgress, [0, 0.5, 1], [25, 0, -25]);

    const rotateX = useSpring(rotateXRaw, { stiffness: 70, damping: 25 });
    const rotateY = useSpring(rotateYRaw, { stiffness: 70, damping: 25 });
    const yFloat = useSpring(yFloatRaw, { stiffness: 70, damping: 25 });

    // Auto-scroll chat to bottom on new messages or typing
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [state.messages, state.isTyping]);

    const progressPercentage = state.totalDuration > 0
        ? Math.min(100, Math.round((state.elapsedTime / state.totalDuration) * 100))
        : 0;

    return (
        <div ref={containerRef} className={`rws-container ${className}`} style={style}>
            {/* Title & Selector section if provided */}
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

            {/* Main Phone Simulator Outer Container */}
            <motion.div
                style={
                    enable3DTilt
                        ? {
                              rotateX,
                              rotateY,
                              y: yFloat,
                              transformStyle: "preserve-3d",
                              perspective: 1000,
                          }
                        : undefined
                }
                className="rws-phone-frame"
            >
                {/* Phone Top Notch / Camera bar */}
                <div className="rws-phone-notch">
                    <div className="rws-camera-lens" />
                    <div className="rws-speaker-grille" />
                </div>

                {/* WhatsApp Chat Header */}
                <ChatHeader
                    assistantName={assistantName}
                    assistantAvatarUrl={assistantAvatarUrl}
                    isTyping={state.isTyping}
                    onlineStatusText={labels.onlineStatus || (locale === "es" ? "en línea" : "online")}
                    typingStatusText={labels.typingStatus || (locale === "es" ? "escribiendo..." : "typing...")}
                />

                {/* Progress bar overlay */}
                <div className="rws-progress-bar-container">
                    <div
                        className="rws-progress-bar-fill"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Chat Messages Body */}
                <div className="rws-chat-body">
                    <div className="rws-encryption-notice">
                        <span>🔒 Los mensajes y llamadas están cifrados de extremo a extremo.</span>
                    </div>

                    <div className="rws-messages-list">
                        <AnimatePresence mode="popLayout">
                            {state.messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                        </AnimatePresence>

                        {/* Typing indicator dots */}
                        {state.isTyping && (
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
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Bar */}
                <ChatInput
                    inputValue={state.inputValue}
                    attachedImage={state.attachedImage}
                    sendRipple={state.sendRipple}
                    placeholder={labels.inputPlaceholder || (locale === "es" ? "Escribe un mensaje" : "Type a message")}
                />

                {/* Restart Floating Action Button */}
                <button
                    type="button"
                    onClick={restartCurrentScript}
                    className="rws-restart-btn"
                    title={labels.restartTooltip || "Reiniciar conversación"}
                    aria-label="Reiniciar conversación"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    );
};
