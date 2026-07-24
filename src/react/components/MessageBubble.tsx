import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCheck, Play, Pause, Mic, X } from "lucide-react";
import { Message } from "../../core/types";
import { LinkPreviewBadge } from "./LinkPreviewBadge";

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const isUser = message.sender === "resident" || message.sender === "user";

    const parseLinkFromContent = (content: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = content.match(urlRegex);
        if (!match) return { cleanContent: content, link: null };

        const link = match[0];
        let clean = content.replace(link, "");
        const prefixRegex = /(?:puedes seguir el avance aquí|sigue el reporte en|seguimiento en|consulta el estado aquí|ver progreso en|you can track the progress here|track the report at|follow-up at|check the status here|see progress at|view progress at)[\s:.,]*$/i;
        clean = clean.replace(prefixRegex, "").trim().replace(/[\s:.,]+$/, "");
        if (!clean.endsWith(".") && clean.length > 0) {
            clean += ".";
        }
        return { cleanContent: clean, link };
    };

    const { cleanContent, link } = parseLinkFromContent(message.content || "");
    const progressPercent = message.uploadProgress || 0;
    const strokeDashoffset = 125.66 - (125.66 * progressPercent) / 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`rws-message-wrapper ${isUser ? "rws-message-user" : "rws-message-assistant"}`}
        >
            <div className="rws-message-bubble">
                {/* SVG Bubble Tail */}
                <svg
                    className={`rws-bubble-tail ${isUser ? "rws-tail-right" : "rws-tail-left"}`}
                    width="8"
                    height="13"
                    viewBox="0 0 8 13"
                >
                    <path
                        d={
                            isUser
                                ? "M0 0v13l5.886-4.505a6.6 6.6 0 0 0 2.114-4.995V0H0z"
                                : "M8 0v13L2.114 8.495A6.6 6.6 0 0 1 0 3.5V0h8z"
                        }
                        className="rws-bubble-tail-path"
                    />
                </svg>

                {message.senderName && (
                    <div
                        className="rws-sender-name"
                        style={{ color: message.senderColor || (isUser ? "#25d366" : "#e542a3") }}
                    >
                        {message.senderName}
                    </div>
                )}

                {message.type === "image" ? (
                    <div className="rws-image-container">
                        <img
                            src={message.content}
                            alt="Evidencia"
                            className={`rws-message-image ${message.isUploading ? "rws-image-blur" : ""}`}
                        />
                        {message.isUploading && (
                            <div className="rws-upload-overlay">
                                <div className="rws-upload-ring-box">
                                    <svg className="rws-upload-circle-svg" width="48" height="48" viewBox="0 0 48 48">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            className="rws-upload-circle-bg"
                                        />
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            className="rws-upload-circle-progress"
                                            style={{ strokeDashoffset }}
                                        />
                                    </svg>
                                    <div className="rws-upload-center-icon">
                                        <X size={16} strokeWidth={2.5} color="#ffffff" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {message.caption && (
                            <div className="rws-image-caption">
                                {message.caption}
                            </div>
                        )}
                    </div>
                ) : message.type === "audio" ? (
                    <div className="rws-audio-box">
                        <div className="rws-audio-player">
                            <div className="rws-audio-avatar-badge">
                                <Mic size={15} className="rws-audio-mic-icon" />
                            </div>
                            <button
                                type="button"
                                className="rws-audio-play-btn"
                                onClick={() => setIsPlaying(!isPlaying)}
                                aria-label="Reproducir Nota de Voz"
                            >
                                {isPlaying ? (
                                    <Pause size={16} fill="currentColor" className="rws-play-icon" />
                                ) : (
                                    <Play size={16} fill="currentColor" className="rws-play-icon" style={{ marginLeft: "2px" }} />
                                )}
                            </button>
                            <div className="rws-audio-waveform-container">
                                <div className="rws-audio-waveform-track">
                                    {[35, 60, 40, 85, 50, 75, 90, 45, 65, 80, 55, 30, 70, 95, 40, 60, 50, 75, 35, 65, 45].map((h, i) => (
                                        <span
                                            key={i}
                                            className={`rws-waveform-bar ${i < 10 ? "active" : ""}`}
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                                <div className="rws-audio-duration">{message.audioDuration || "0:14"}</div>
                            </div>
                        </div>

                        {message.content && (
                            <div className="rws-audio-transcription">
                                <em>"{message.content}"</em>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rws-text-content">
                        <span>{cleanContent}</span>
                        {link && <LinkPreviewBadge linkUrl={link} previewData={message.linkPreview} />}
                    </div>
                )}

                <div className="rws-message-meta">
                    <span className="rws-message-timestamp">{message.timestamp}</span>
                    {isUser && <CheckCheck size={15} className="rws-read-receipt" />}
                </div>
            </div>
        </motion.div>
    );
};
