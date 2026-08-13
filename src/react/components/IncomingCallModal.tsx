import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video, MessageSquare, Clock, ChevronRight } from "lucide-react";
import { IncomingCallState } from "../../core/simulator-engine";

interface IncomingCallModalProps {
    callState: IncomingCallState | null;
    onDecline: () => void;
    deviceStyle?: "iphone" | "android" | "none";
    theme?: "dark" | "light";
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
    callState,
    onDecline,
    deviceStyle = "iphone",
    theme = "dark",
}) => {
    const [hasStartedSlide, setHasStartedSlide] = useState(false);

    const isFingerDeclineActive = callState?.isFingerDeclineActive ?? false;

    // Immediate inline styles to hide the green accept knob the instant decline tap starts.
    // AnimatePresence exit animations introduced a ~100ms delay where both knobs coexisted
    // in the DOM, causing the green to visually overlap the red. Direct style binding is
    // synchronous with the React render — zero delay.
    const acceptHiddenStyle: React.CSSProperties = isFingerDeclineActive
        ? { opacity: 0, visibility: "hidden", pointerEvents: "none" }
        : {};

    useEffect(() => {
        if (isFingerDeclineActive) {
            const timer = setTimeout(() => {
                setHasStartedSlide(true);
            }, 200);
            return () => clearTimeout(timer);
        } else {
            setHasStartedSlide(false);
        }
    }, [isFingerDeclineActive]);

    if (!callState) return null;

    const { callerName, callerAvatarUrl, callType = "voice" } = callState;
    const isIos = deviceStyle === "iphone";
    const isAndroid = deviceStyle === "android";

    return (
        <AnimatePresence>
            {isIos ? (
                /* iOS Authentic Full Screen Call UI with ZoomOut + FadeOut Exit */
                <motion.div
                    className={`rws-ios-call-screen rws-theme-${theme}`}
                    initial={{ opacity: 0, scale: 0.72 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.65 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Top Caller Header */}
                    <div className="rws-ios-call-header">
                        {callerAvatarUrl && (
                            <img src={callerAvatarUrl} alt={callerName} className="rws-ios-call-avatar-top" />
                        )}
                        <p className="rws-ios-call-sub-tag">
                            {callType === "video" ? "Videollamada de WhatsApp" : "Llamada de voz de WhatsApp"}
                        </p>
                        <h2 className="rws-ios-caller-name">{callerName}</h2>
                    </div>

                    {/* Middle Action Buttons */}
                    <div className="rws-ios-call-mid-actions">
                        <div className="rws-ios-mid-btn-group">
                            <button type="button" className="rws-ios-mid-btn">
                                <MessageSquare size={20} />
                            </button>
                            <span className="rws-ios-mid-label">Mensaje</span>
                        </div>
                        <div className="rws-ios-mid-btn-group">
                            <button type="button" className="rws-ios-mid-btn">
                                <Clock size={20} />
                            </button>
                            <span className="rws-ios-mid-label">Recordármelo</span>
                        </div>
                    </div>

                    {/* Bottom Section: Decline slide track */}
                    <div className="rws-ios-call-bottom-section">
                        <motion.div
                            className="rws-ios-slide-track"
                            animate={{
                                background: hasStartedSlide
                                    ? "rgba(239, 68, 68, 0.4)"
                                    : isFingerDeclineActive
                                    ? "rgba(255, 255, 255, 0.16)"
                                    : "transparent",
                                borderColor: hasStartedSlide
                                    ? "rgba(239, 68, 68, 0.8)"
                                    : isFingerDeclineActive
                                    ? "rgba(255, 255, 255, 0.25)"
                                    : "transparent",
                                boxShadow: hasStartedSlide
                                    ? "0 0 24px rgba(239, 68, 68, 0.5)"
                                    : isFingerDeclineActive
                                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                                    : "none",
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Left Red Decline Knob: animates left (parent %) not x (element %) */}
                            <motion.div
                                className="rws-ios-slide-knob rws-ios-knob-decline"
                                animate={{
                                    left: hasStartedSlide ? "calc(100% - 53px)" : "5px",
                                    scale: isFingerDeclineActive && !hasStartedSlide ? 1.15 : 1,
                                }}
                                transition={{
                                    left: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                                    scale: { duration: 0.2, ease: "easeOut" },
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: isFingerDeclineActive ? 135 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                    <PhoneOff size={24} className="rws-ios-knob-icon" />
                                </motion.div>

                                {isFingerDeclineActive && (
                                    <div className="rws-finger-slider-indicator">
                                        <span className="rws-finger-circle rws-finger-pressing" />
                                        <span className="rws-finger-wave" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Center Slide Track Text */}
                            <motion.div
                                className="rws-ios-slide-text-box"
                                animate={{ opacity: isFingerDeclineActive ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <span className="rws-ios-slide-text">desliza para rechazar</span>
                                <div className="rws-ios-slide-arrows">
                                    <ChevronRight size={15} className="rws-arrow-1" />
                                    <ChevronRight size={15} className="rws-arrow-2" />
                                    <ChevronRight size={15} className="rws-arrow-3" />
                                </div>
                            </motion.div>

                            {/* Right Green Accept Knob: hidden instantly via inline style */}
                            <div
                                className="rws-ios-slide-knob rws-ios-knob-accept-static"
                                style={acceptHiddenStyle}
                            >
                                {callType === "video" ? <Video size={24} /> : <Phone size={24} />}
                            </div>
                        </motion.div>

                        {/* Button Labels Row */}
                        <div className="rws-call-labels-row" style={acceptHiddenStyle}>
                            <span className="rws-call-action-label-decline">Rechazar</span>
                            <span className="rws-call-action-label-accept">Aceptar</span>
                        </div>
                    </div>
                </motion.div>
            ) : isAndroid ? (
                /* Android Material Full Screen Call UI with ZoomOut + FadeOut Exit */
                <motion.div
                    className={`rws-android-call-screen rws-theme-${theme}`}
                    initial={{ opacity: 0, scale: 0.72 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.65 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="rws-android-call-header">
                        {callerAvatarUrl ? (
                            <img src={callerAvatarUrl} alt={callerName} className="rws-android-call-avatar" />
                        ) : (
                            <div className="rws-android-avatar-fallback">
                                <span>{callerName.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        <p className="rws-android-call-type">
                            {callType === "video" ? "Videollamada de WhatsApp" : "Llamada de voz de WhatsApp"}
                        </p>
                        <h2 className="rws-android-caller-name">{callerName}</h2>
                    </div>

                    <div className="rws-android-call-bottom">
                        <motion.div
                            className="rws-android-slide-track"
                            animate={{
                                background: hasStartedSlide
                                    ? "rgba(239, 68, 68, 0.4)"
                                    : isFingerDeclineActive
                                    ? "#334155"
                                    : "transparent",
                                borderColor: hasStartedSlide
                                    ? "rgba(239, 68, 68, 0.8)"
                                    : isFingerDeclineActive
                                    ? "rgba(255, 255, 255, 0.12)"
                                    : "transparent",
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="rws-android-slide-knob rws-android-knob-decline"
                                animate={{
                                    left: hasStartedSlide ? "calc(100% - 53px)" : "5px",
                                    scale: isFingerDeclineActive && !hasStartedSlide ? 1.15 : 1,
                                }}
                                transition={{
                                    left: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                                    scale: { duration: 0.2, ease: "easeOut" },
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: isFingerDeclineActive ? 135 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                    <PhoneOff size={24} />
                                </motion.div>

                                {isFingerDeclineActive && (
                                    <div className="rws-finger-slider-indicator">
                                        <span className="rws-finger-circle rws-finger-pressing" />
                                        <span className="rws-finger-wave" />
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                className="rws-android-slide-text-box"
                                animate={{ opacity: isFingerDeclineActive ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <span className="rws-android-slide-text">desliza para rechazar</span>
                                <div className="rws-ios-slide-arrows">
                                    <ChevronRight size={15} className="rws-arrow-1" />
                                    <ChevronRight size={15} className="rws-arrow-2" />
                                    <ChevronRight size={15} className="rws-arrow-3" />
                                </div>
                            </motion.div>

                            {/* Green Accept Knob: hidden instantly via inline style */}
                            <div
                                className="rws-android-slide-knob rws-android-knob-accept-static"
                                style={acceptHiddenStyle}
                            >
                                {callType === "video" ? <Video size={24} /> : <Phone size={24} />}
                            </div>
                        </motion.div>

                        <div className="rws-call-labels-row" style={acceptHiddenStyle}>
                            <span className="rws-call-action-label-decline">Rechazar</span>
                            <span className="rws-call-action-label-accept">Aceptar</span>
                        </div>
                    </div>
                </motion.div>
            ) : (
                /* Fallback Banner Call UI */
                <motion.div
                    className={`rws-call-modal-overlay rws-device-${deviceStyle} rws-theme-${theme}`}
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.65, y: -20 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="rws-call-card">
                        <div className="rws-call-card-top">
                            {callerAvatarUrl ? (
                                <img src={callerAvatarUrl} alt={callerName} className="rws-call-avatar" />
                            ) : (
                                <div className="rws-call-avatar-fallback">
                                    <span>{callerName.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <div className="rws-call-info">
                                <span className="rws-call-app-tag">Llamada entrante de WhatsApp</span>
                                <h3 className="rws-call-caller-name">{callerName}</h3>
                                <p className="rws-call-sub-text">
                                    {callType === "video" ? "Videollamada de WhatsApp..." : "Llamada de voz de WhatsApp..."}
                                </p>
                            </div>
                        </div>

                        <div className="rws-call-actions-row">
                            <div className="rws-call-btn-wrapper">
                                <button
                                    type="button"
                                    className={`rws-call-btn rws-call-decline-btn ${isFingerDeclineActive ? "rws-call-btn-pressing" : ""}`}
                                    onClick={onDecline}
                                    aria-label="Rechazar llamada"
                                >
                                    <PhoneOff size={22} />
                                    {isFingerDeclineActive && (
                                        <div className="rws-finger-btn-indicator">
                                            <span className="rws-finger-circle rws-finger-pressing" />
                                            <span className="rws-finger-wave" />
                                        </div>
                                    )}
                                </button>
                                <span className="rws-call-btn-label">Rechazar</span>
                            </div>

                            {/* Green Accept button: hidden instantly via inline style */}
                            <div className="rws-call-btn-wrapper" style={acceptHiddenStyle}>
                                <button type="button" className="rws-call-btn rws-call-accept-btn" aria-label="Aceptar llamada">
                                    {callType === "video" ? <Video size={22} /> : <Phone size={22} />}
                                </button>
                                <span className="rws-call-btn-label">Aceptar</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
