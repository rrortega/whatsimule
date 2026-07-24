import React from "react";
import { Phone, Video, MoreVertical, ArrowLeft, Wifi, Battery, Users } from "lucide-react";

interface ChatHeaderProps {
    assistantName?: string;
    assistantAvatarUrl?: string;
    chatType?: "direct" | "group";
    groupMembersText?: string;
    isTyping?: boolean;
    isRecordingAudio?: boolean;
    onlineStatusText?: string;
    typingStatusText?: string;
    recordingStatusText?: string;
    deviceStyle?: "iphone" | "android" | "none";
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    assistantName = "RRORTEGA",
    assistantAvatarUrl,
    chatType = "direct",
    groupMembersText,
    isTyping = false,
    isRecordingAudio = false,
    onlineStatusText = "en línea",
    typingStatusText = "escribiendo...",
    recordingStatusText = "grabando audio...",
    deviceStyle = "iphone",
}) => {
    const avatarContent = (() => {
        if (assistantAvatarUrl) {
            return <img src={assistantAvatarUrl} alt={assistantName} className="rws-avatar-img" />;
        }
        if (chatType === "group") {
            return (
                <div className="rws-avatar-fallback rws-avatar-group">
                    <Users size={18} />
                </div>
            );
        }
        return (
            <div className="rws-avatar-fallback">
                <span>{assistantName.charAt(0).toUpperCase()}</span>
            </div>
        );
    })();

    const statusText = (() => {
        if (isRecordingAudio) return recordingStatusText;
        if (isTyping) return typingStatusText;
        if (chatType === "group") return groupMembersText || `Tú, Alex, Sofía, ${assistantName}`;
        return onlineStatusText;
    })();

    return (
        <div className="rws-header-wrapper">
            {/* Phone Status Bar */}
            {deviceStyle !== "none" && (
                <div className={`rws-status-bar ${deviceStyle === "android" ? "rws-status-android" : "rws-status-iphone"}`}>
                    <span className="rws-status-time">09:41</span>
                    <div className="rws-status-icons">
                        <Wifi size={13} className="rws-status-icon" />
                        {deviceStyle === "iphone" && <span className="rws-status-5g">5G</span>}
                        {deviceStyle === "android" && <span className="rws-status-battery-pct">100%</span>}
                        <Battery size={15} className="rws-status-icon" />
                    </div>
                </div>
            )}

            {/* Main WhatsApp Header */}
            <div className="rws-header">
                <div className="rws-header-left">
                    <button type="button" className="rws-back-button" aria-label="Volver">
                        <ArrowLeft size={20} className="rws-header-icon" />
                    </button>
                    <div className="rws-avatar-container">
                        {avatarContent}
                        {chatType !== "group" && <span className="rws-status-indicator" />}
                    </div>
                    <div className="rws-header-info">
                        <h3 className="rws-header-title">{assistantName}</h3>
                        <p className={`rws-header-status ${isTyping || isRecordingAudio ? "rws-status-active" : ""}`}>
                            {statusText}
                        </p>
                    </div>
                </div>
                <div className="rws-header-actions">
                    {chatType === "group" ? (
                        <button type="button" className="rws-icon-btn" aria-label="Iniciar chat de voz grupal" title="Chat de voz grupal">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rws-header-icon">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                <line x1="8" y1="8" x2="16" y2="8" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                                <line x1="8" y1="14" x2="11" y2="14" />
                            </svg>
                        </button>
                    ) : (
                        <>
                            <button type="button" className="rws-icon-btn" aria-label="Videollamada">
                                <Video size={18} className="rws-header-icon" />
                            </button>
                            <button type="button" className="rws-icon-btn" aria-label="Llamada de voz">
                                <Phone size={17} className="rws-header-icon" />
                            </button>
                        </>
                    )}
                    <button type="button" className="rws-icon-btn" aria-label="Más opciones">
                        <MoreVertical size={18} className="rws-header-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
};
