import React from "react";
import { Phone, Video, MoreVertical, ArrowLeft, Wifi, WifiOff, Users } from "lucide-react";

interface ChatHeaderProps {
    contactName?: string;
    assistantName?: string;
    contactAvatarUrl?: string;
    assistantAvatarUrl?: string;
    chatType?: "direct" | "group";
    groupMembersText?: string;
    isTyping?: boolean;
    isRecordingAudio?: boolean;
    onlineStatusText?: string;
    typingStatusText?: string;
    recordingStatusText?: string;
    deviceStyle?: "iphone" | "android" | "none";
    batteryLevel?: number;
    networkType?: "2G" | "3G" | "4G" | "5G";
    wifiSignalStrength?: number | string;
    statusBarTime?: string;
    onAvatarClick?: () => void;
    avatarRipple?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    contactName,
    assistantName,
    contactAvatarUrl,
    assistantAvatarUrl,
    chatType = "direct",
    groupMembersText,
    isTyping = false,
    isRecordingAudio = false,
    onlineStatusText = "en línea",
    typingStatusText = "escribiendo...",
    recordingStatusText = "grabando audio...",
    deviceStyle = "iphone",
    batteryLevel = 63,
    networkType = "5G",
    wifiSignalStrength = 4,
    statusBarTime = "09:41",
    onAvatarClick,
    avatarRipple = false,
}) => {
    const nameToDisplay = contactName || assistantName || "RRORTEGA";
    const avatarToDisplay = contactAvatarUrl || assistantAvatarUrl;

    const avatarContent = (() => {
        if (avatarToDisplay) {
            return <img src={avatarToDisplay} alt={nameToDisplay} className="rws-avatar-img" />;
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
                <span>{nameToDisplay.charAt(0).toUpperCase()}</span>
            </div>
        );
    })();

    const statusText = (() => {
        if (isRecordingAudio) return recordingStatusText;
        if (isTyping) return typingStatusText;
        if (chatType === "group") return groupMembersText || `Tú, Alex, Sofía, ${nameToDisplay}`;
        return onlineStatusText;
    })();

    const isLowBattery = batteryLevel <= 15;
    const batteryColor = isLowBattery ? "#ef4444" : "#25d366";
    const clampedBattery = Math.min(100, Math.max(0, batteryLevel));
    const fillWidth = Math.max(1.5, (14.5 * clampedBattery) / 100);

    const renderWifiIcon = () => {
        const val = String(wifiSignalStrength);
        if (val === "0" || val === "none") {
            return <WifiOff size={13} className="rws-status-icon" style={{ opacity: 0.4 }} />;
        }

        const num = val === "low" || val === "1" ? 1 : (val === "medium" || val === "2" ? 2 : (val === "3" ? 3 : 4));

        return (
            <div className="rws-status-wifi-box" title={`WiFi: ${num}/4`}>
                <svg width="15" height="13" viewBox="0 0 16 14" fill="none" className="rws-wifi-svg">
                    <circle cx="8" cy="11.5" r="1.5" fill="currentColor" opacity={num >= 1 ? 1 : 0.25} />
                    <path d="M5.5 8.5C6.9 7.2 9.1 7.2 10.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity={num >= 2 ? 1 : 0.25} />
                    <path d="M3.2 5.8C5.8 3.4 10.2 3.4 12.8 5.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity={num >= 3 ? 1 : 0.25} />
                    <path d="M1 3.2C4.9 -0.6 11.1 -0.6 15 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity={num >= 4 ? 1 : 0.25} />
                </svg>
            </div>
        );
    };

    return (
        <div className="rws-header-wrapper">
            {/* Phone Status Bar */}
            {deviceStyle !== "none" && (
                <div className={`rws-status-bar ${deviceStyle === "android" ? "rws-status-android" : "rws-status-iphone"}`}>
                    <span className="rws-status-time">{statusBarTime}</span>
                    <div className="rws-status-icons">
                        {renderWifiIcon()}
                        <span className="rws-status-5g">{networkType}</span>
                        {deviceStyle === "android" ? (
                            /* Android Battery: percentage number inside the battery bar */
                            <div className="rws-battery-icon-box rws-battery-android" title={`Batería: ${clampedBattery}%`}>
                                <svg width="27" height="13" viewBox="0 0 27 13" fill="none" className="rws-battery-svg">
                                    <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.85" />
                                    <path d="M24.5 4C25 4.2 25.5 4.8 25.5 6.5C25.5 8.2 25 8.8 24.5 9V4Z" fill="currentColor" opacity="0.85" />
                                    <rect
                                        x="2"
                                        y="2"
                                        width={Math.max(1.5, (19 * clampedBattery) / 100)}
                                        height="9"
                                        rx="2"
                                        fill={batteryColor}
                                    />
                                    <text
                                        x="11.5"
                                        y="9.2"
                                        textAnchor="middle"
                                        fontSize="8"
                                        fontWeight="800"
                                        fill="#ffffff"
                                        style={{ fontFamily: "sans-serif", pointerEvents: "none" }}
                                    >
                                        {clampedBattery}
                                    </text>
                                </svg>
                            </div>
                        ) : (
                            /* iPhone Battery: Icon only with dynamic fill, no text percentage */
                            <div className="rws-battery-icon-box rws-battery-iphone" title={`Batería: ${clampedBattery}%`}>
                                <svg width="22" height="11" viewBox="0 0 22 11" fill="none" className="rws-battery-svg">
                                    <rect x="0.5" y="0.5" width="17.5" height="10" rx="2.5" stroke="currentColor" strokeWidth="1" opacity="0.85" />
                                    <path d="M19.5 3.5C20 3.7 20.5 4.2 20.5 5.5C20.5 6.8 20 7.3 19.5 7.5V3.5Z" fill="currentColor" opacity="0.85" />
                                    <rect
                                        x="2"
                                        y="2"
                                        width={fillWidth}
                                        height="7"
                                        rx="1.5"
                                        fill={batteryColor}
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main WhatsApp Header */}
            <div className="rws-header">
                <div className="rws-header-left">
                    <button type="button" className="rws-back-button" aria-label="Volver">
                        <ArrowLeft size={20} className="rws-header-icon" />
                    </button>
                    <div
                        className={`rws-avatar-container rws-avatar-clickable ${avatarRipple ? "rws-avatar-ripple-active" : ""}`}
                        onClick={onAvatarClick}
                        title="Ver foto e información del contacto"
                        role="button"
                        tabIndex={0}
                    >
                        {avatarContent}
                        {chatType !== "group" && <span className="rws-status-indicator" />}
                        {avatarRipple && (
                            <div className="rws-finger-avatar-indicator">
                                <span className="rws-finger-circle rws-finger-pressing" />
                                <span className="rws-finger-wave" />
                            </div>
                        )}
                    </div>
                    <div className="rws-header-info">
                        <h3 className="rws-header-title">{nameToDisplay}</h3>
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
