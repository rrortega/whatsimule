import React from "react";
import { motion } from "framer-motion";
import { CheckCheck } from "lucide-react";
import { Message } from "../../core/types";
import { LinkPreviewBadge } from "./LinkPreviewBadge";

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
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

    const { cleanContent, link } = parseLinkFromContent(message.content);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`rws-message-wrapper ${isUser ? "rws-message-user" : "rws-message-assistant"}`}
        >
            <div className="rws-message-bubble">
                {/* Bubble SVG Tail */}
                <div className={`rws-bubble-tail ${isUser ? "rws-tail-right" : "rws-tail-left"}`} />

                {message.type === "image" ? (
                    <div className="rws-image-container">
                        <img src={message.content} alt="Evidencia" className="rws-message-image" />
                        {message.isUploading && (
                            <div className="rws-upload-overlay">
                                <div className="rws-progress-circle">
                                    <span>{message.uploadProgress || 0}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rws-text-content">
                        <span>{cleanContent}</span>
                        {link && <LinkPreviewBadge linkUrl={link} />}
                    </div>
                )}

                <div className="rws-message-meta">
                    <span className="rws-message-timestamp">{message.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 rws-read-receipt" />}
                </div>
            </div>
        </motion.div>
    );
};
