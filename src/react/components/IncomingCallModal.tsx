import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video, MessageSquare, Clock, ChevronRight } from "lucide-react";
import { IncomingCallState } from "../../core/simulator-engine";

interface IncomingCallModalProps {
    callState: IncomingCallState | null;
    onDecline: () => void;
    deviceStyle?: "iphone" | "android" | "none";
    theme?: "dark" | "light";
    locale?: "es" | "en";
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
    callState,
    onDecline,
    deviceStyle = "iphone",
    theme = "dark",
    locale = "es",
}) => {
    const [hasStartedSlide, setHasStartedSlide] = useState(false);
    const [slideDistancePx, setSlideDistancePx] = useState(0);
    const iosTrackRef = useRef<HTMLDivElement>(null);
    const androidTrackRef = useRef<HTMLDivElement>(null);

    const isFingerDeclineActive = callState?.isFingerDeclineActive ?? false;
    const isOutgoing = callState?.direction === "outgoing";

    // Immediate inline styles to hide the green accept knob the instant decline tap starts.
    const acceptHiddenStyle: React.CSSProperties = isFingerDeclineActive
        ? { opacity: 0, visibility: "hidden", pointerEvents: "none" }
        : {};

    // Measure track width and compute slide distance in pixels when finger activates
    useEffect(() => {
        if (isFingerDeclineActive) {
            const trackEl = iosTrackRef.current || androidTrackRef.current;
            if (trackEl) {
                const trackWidth = trackEl.getBoundingClientRect().width;
                setSlideDistancePx(trackWidth - 48 - 10);
            }
            const timer = setTimeout(() => {
                setHasStartedSlide(true);
            }, 200);
            return () => clearTimeout(timer);
        } else {
            setHasStartedSlide(false);
            setSlideDistancePx(0);
        }
    }, [isFingerDeclineActive]);

    if (!callState) return null;

    const { callerName, callerAvatarUrl, callType = "voice", statusText } = callState;
    const isIos = deviceStyle === "iphone";
    const isAndroid = deviceStyle === "android";

    // i18n labels
    const t = {
        voiceCall: locale === "es" ? "Llamada de voz de WhatsApp" : "WhatsApp Voice Call",
        videoCall: locale === "es" ? "Videollamada de WhatsApp" : "WhatsApp Video Call",
        incomingCall: locale === "es" ? "Llamada entrante de WhatsApp" : "Incoming WhatsApp Call",
        voiceCallSub: locale === "es" ? "Llamada de voz de WhatsApp..." : "WhatsApp Voice Call...",
        videoCallSub: locale === "es" ? "Videollamada de WhatsApp..." : "WhatsApp Video Call...",
        message: locale === "es" ? "Mensaje" : "Message",
        remindMe: locale === "es" ? "Recordármelo" : "Remind Me",
        slideToDecline: locale === "es" ? "desliza para rechazar" : "slide to decline",
        decline: locale === "es" ? "Rechazar" : "Decline",
        accept: locale === "es" ? "Aceptar" : "Accept",
        declineLabel: locale === "es" ? "Rechazar llamada" : "Decline call",
        acceptLabel: locale === "es" ? "Aceptar llamada" : "Accept call",
        calling: locale === "es" ? "Llamando..." : "Calling...",
    };

    const callHeaderSubText = isOutgoing
        ? (statusText || t.calling)
        : (callType === "video" ? t.videoCall : t.voiceCall);

    return (
        <AnimatePresence>
            {isIos ? (
                /* iOS Authentic Full Screen Call UI */
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
                            {callHeaderSubText}
                        </p>
                        <h2 className="rws-ios-caller-name">{callerName}</h2>
                    </div>

                    {/* Middle Action Buttons */}
                    {!isOutgoing && (
                        <div className="rws-ios-call-mid-actions">
                            <div className="rws-ios-mid-btn-group">
                                <button type="button" className="rws-ios-mid-btn">
                                    <MessageSquare size={20} />
                                </button>
                                <span className="rws-ios-mid-label">{t.message}</span>
                            </div>
                            <div className="rws-ios-mid-btn-group">
                                <button type="button" className="rws-ios-mid-btn">
                                    <Clock size={20} />
                                </button>
                                <span className="rws-ios-mid-label">{t.remindMe}</span>
                            </div>
                        </div>
                    )}

                    {/* Bottom Section */}
                    <div className="rws-ios-call-bottom-section">
                        {isOutgoing ? (
                            <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "20px 0" }}>
                                <button
                                    type="button"
                                    className="rws-call-btn rws-call-decline-btn"
                                    style={{ width: 62, height: 62, borderRadius: "50%", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "none", boxShadow: "0 4px 15px rgba(239,68,68,0.4)" }}
                                    aria-label={t.declineLabel}
                                >
                                    <PhoneOff size={26} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <motion.div
                                    ref={iosTrackRef}
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
                                    <motion.div
                                        className="rws-ios-slide-knob rws-ios-knob-decline"
                                        animate={{
                                            x: hasStartedSlide ? slideDistancePx : 0,
                                            scale: isFingerDeclineActive && !hasStartedSlide ? 1.15 : 1,
                                        }}
                                        transition={{
                                            x: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
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

                                    <motion.div
                                        className="rws-ios-slide-text-box"
                                        animate={{ opacity: isFingerDeclineActive ? 1 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <span className="rws-ios-slide-text">{t.slideToDecline}</span>
                                        <div className="rws-ios-slide-arrows">
                                            <ChevronRight size={15} className="rws-arrow-1" />
                                            <ChevronRight size={15} className="rws-arrow-2" />
                                            <ChevronRight size={15} className="rws-arrow-3" />
                                        </div>
                                    </motion.div>

                                    <div
                                        className="rws-ios-slide-knob rws-ios-knob-accept-static"
                                        style={acceptHiddenStyle}
                                    >
                                        {callType === "video" ? <Video size={24} /> : <Phone size={24} />}
                                    </div>
                                </motion.div>

                                <div className="rws-call-labels-row" style={acceptHiddenStyle}>
                                    <span className="rws-call-action-label-decline">{t.decline}</span>
                                    <span className="rws-call-action-label-accept">{t.accept}</span>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            ) : isAndroid ? (
                /* Android Material Full Screen Call UI */
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
                            {callHeaderSubText}
                        </p>
                        <h2 className="rws-android-caller-name">{callerName}</h2>
                    </div>

                    <div className="rws-android-call-bottom">
                        {isOutgoing ? (
                            <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "20px 0" }}>
                                <button
                                    type="button"
                                    className="rws-call-btn rws-call-decline-btn"
                                    style={{ width: 62, height: 62, borderRadius: "50%", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "none", boxShadow: "0 4px 15px rgba(239,68,68,0.4)" }}
                                    aria-label={t.declineLabel}
                                >
                                    <PhoneOff size={26} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <motion.div
                                    ref={androidTrackRef}
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
                                            x: hasStartedSlide ? slideDistancePx : 0,
                                            scale: isFingerDeclineActive && !hasStartedSlide ? 1.15 : 1,
                                        }}
                                        transition={{
                                            x: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
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
                                        <span className="rws-android-slide-text">{t.slideToDecline}</span>
                                        <div className="rws-ios-slide-arrows">
                                            <ChevronRight size={15} className="rws-arrow-1" />
                                            <ChevronRight size={15} className="rws-arrow-2" />
                                            <ChevronRight size={15} className="rws-arrow-3" />
                                        </div>
                                    </motion.div>

                                    <div
                                        className="rws-android-slide-knob rws-android-knob-accept-static"
                                        style={acceptHiddenStyle}
                                    >
                                        {callType === "video" ? <Video size={24} /> : <Phone size={24} />}
                                    </div>
                                </motion.div>

                                <div className="rws-call-labels-row" style={acceptHiddenStyle}>
                                    <span className="rws-call-action-label-decline">{t.decline}</span>
                                    <span className="rws-call-action-label-accept">{t.accept}</span>
                                </div>
                            </>
                        )}
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
                                <span className="rws-call-app-tag">{isOutgoing ? t.calling : t.incomingCall}</span>
                                <h3 className="rws-call-caller-name">{callerName}</h3>
                                <p className="rws-call-sub-text">
                                    {callHeaderSubText}
                                </p>
                            </div>
                        </div>

                        <div className="rws-call-actions-row">
                            <div className="rws-call-btn-wrapper" style={{ width: isOutgoing ? "100%" : "auto" }}>
                                <button
                                    type="button"
                                    className={`rws-call-btn rws-call-decline-btn ${isFingerDeclineActive ? "rws-call-btn-pressing" : ""}`}
                                    onClick={onDecline}
                                    aria-label={t.declineLabel}
                                >
                                    <PhoneOff size={22} />
                                    {isFingerDeclineActive && (
                                        <div className="rws-finger-btn-indicator">
                                            <span className="rws-finger-circle rws-finger-pressing" />
                                            <span className="rws-finger-wave" />
                                        </div>
                                    )}
                                </button>
                                <span className="rws-call-btn-label">{t.decline}</span>
                            </div>

                            {!isOutgoing && (
                                <div className="rws-call-btn-wrapper" style={acceptHiddenStyle}>
                                    <button type="button" className="rws-call-btn rws-call-accept-btn" aria-label={t.acceptLabel}>
                                        {callType === "video" ? <Video size={22} /> : <Phone size={22} />}
                                    </button>
                                    <span className="rws-call-btn-label">{t.accept}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
