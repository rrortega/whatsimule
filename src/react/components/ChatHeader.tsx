import React from "react";
import { Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
    assistantName?: string;
    assistantAvatarUrl?: string;
    isTyping?: boolean;
    onlineStatusText?: string;
    typingStatusText?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    assistantName = "Asistenxa AI",
    assistantAvatarUrl,
    isTyping = false,
    onlineStatusText = "en línea",
    typingStatusText = "escribiendo...",
}) => {
    return (
        <div className="rws-header">
            <div className="rws-header-left">
                <button type="button" className="rws-back-button" aria-label="Volver">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="rws-avatar-container">
                    {assistantAvatarUrl ? (
                        <img src={assistantAvatarUrl} alt={assistantName} className="rws-avatar-img" />
                    ) : (
                        <div className="rws-avatar-fallback">
                            <span>{assistantName.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <span className="rws-status-indicator" />
                </div>
                <div className="rws-header-info">
                    <h3 className="rws-header-title">{assistantName}</h3>
                    <p className="rws-header-status">
                        {isTyping ? typingStatusText : onlineStatusText}
                    </p>
                </div>
            </div>
            <div className="rws-header-actions">
                <button type="button" className="rws-icon-btn" aria-label="Llamada de voz">
                    <Phone className="w-4 h-4" />
                </button>
                <button type="button" className="rws-icon-btn" aria-label="Videollamada">
                    <Video className="w-4 h-4" />
                </button>
                <button type="button" className="rws-icon-btn" aria-label="Más opciones">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
