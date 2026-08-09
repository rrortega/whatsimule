import React from "react";
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
    if (!callState) return null;

    const { callerName, callerAvatarUrl, callType = "voice", isFingerDeclineActive = false } = callState;
    const isIos = deviceStyle === "iphone";
    const isAndroid = deviceStyle === "android";

    return (
        <AnimatePresence>
            {isIos ? (
                /* iOS Authentic Full Screen Call UI with Both Decline and Accept Buttons Visible at Both Ends */
                <motion.div
                    className={`rws-ios-call-screen rws-theme-${theme}`}
                    initial={{ opacity: 0, scale: 0.72 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Top Caller Info Header */}
                    <div className="rws-ios-call-header">
                        {callerAvatarUrl && (
                            <img src={callerAvatarUrl} alt={callerName} className="rws-ios-call-avatar-top" />
                        )}
                        <h2 className="rws-ios-caller-name">{callerName}</h2>
                        <p className="rws-ios-call-type-label">
                            {callType === "video" ? "Videollamada de WhatsApp" : "Llamada de voz de WhatsApp"}
                        </p>
                    </div>

                    {/* Middle Utility Action Buttons */}
                    <div className="rws-ios-call-mid-actions">
                        <div className="rws-ios-mid-btn-group">
                            <button type="button" className="rws-ios-mid-btn">
                                <Clock size={20} />
                            </button>
                            <span className="rws-ios-mid-label">Recordármelo</span>
                        </div>
                        <div className="rws-ios-mid-btn-group">
                            <button type="button" className="rws-ios-mid-btn">
                                <MessageSquare size={20} />
                            </button>
                            <span className="rws-ios-mid-label">Mensaje</span>
                        </div>
                    </div>

                    {/* Bottom Controls: Both Red Decline (Left) & Green Accept (Right) Visible at Both Extremes */}
                    <div className="rws-ios-call-bottom-section">
                        <div className="rws-ios-slide-track">
                            {/* Draggable Red Decline Knob (Left) */}
                            <motion.div
                                className="rws-ios-slide-knob rws-ios-knob-decline"
                                animate={isFingerDeclineActive ? { x: 170 } : { x: 0 }}
                                transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
                            >
                                <PhoneOff size={22} className="rws-ios-knob-icon" />

                                {isFingerDeclineActive && (
                                    <div className="rws-finger-slider-indicator">
                                        <span className="rws-finger-circle rws-finger-pressing" />
                                        <span className="rws-finger-wave" />
                                    </div>
                                )}
                            </motion.div>

                            {/* Center Track Hint Text */}
                            <div className="rws-ios-slide-text-box">
                                <span className="rws-ios-slide-text">desliza a la derecha</span>
                                <div className="rws-ios-slide-arrows">
                                    <ChevronRight size={15} className="rws-arrow-1" />
                                    <ChevronRight size={15} className="rws-arrow-2" />
                                    <ChevronRight size={15} className="rws-arrow-3" />
                                </div>
                            </div>

                            {/* Green Accept Knob (Right) */}
                            <div className="rws-ios-slide-knob rws-ios-knob-accept-static">
                                {callType === "video" ? <Video size={22} /> : <Phone size={22} />}
                            </div>
                        </div>

                        <div className="rws-call-labels-row">
                            <span className="rws-call-action-label-decline">Rechazar</span>
                            <span className="rws-call-action-label-accept">Aceptar</span>
                        </div>
                    </div>
                </motion.div>
            ) : isAndroid ? (
                /* Android Material Full Screen Call UI with Both Buttons Visible at Both Extremes */
                <motion.div
                    className={`rws-android-call-screen rws-theme-${theme}`}
                    initial={{ opacity: 0, scale: 0.72 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="rws-android-call-header">
                        {callerAvatarUrl ? (
                            <img src={callerAvatarUrl} alt={callerName} className="rws-android-call-avatar" />
                        ) : (
                            <div className="rws-android-avatar-fallback">
                                <span>{callerName.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        <h2 className="rws-android-caller-name">{callerName}</h2>
                        <p className="rws-android-call-type">
                            {callType === "video" ? "Videollamada de WhatsApp" : "Llamada de voz de WhatsApp"}
                        </p>
                    </div>

                    <div className="rws-android-call-bottom">
                        <div className="rws-android-slide-track">
                            <motion.div
                                className="rws-android-slide-knob rws-android-knob-decline"
                                animate={isFingerDeclineActive ? { x: 170 } : { x: 0 }}
                                transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
                            >
                                <PhoneOff size={22} />
                                {isFingerDeclineActive && (
                                    <div className="rws-finger-slider-indicator">
                                        <span className="rws-finger-circle rws-finger-pressing" />
                                        <span className="rws-finger-wave" />
                                    </div>
                                )}
                            </motion.div>

                            <div className="rws-android-slide-text-box">
                                <span className="rws-android-slide-text">desliza para rechazar</span>
                                <div className="rws-ios-slide-arrows">
                                    <ChevronRight size={15} className="rws-arrow-1" />
                                    <ChevronRight size={15} className="rws-arrow-2" />
                                    <ChevronRight size={15} className="rws-arrow-3" />
                                </div>
                            </div>

                            <div className="rws-android-slide-knob rws-android-knob-accept-static">
                                {callType === "video" ? <Video size={22} /> : <Phone size={22} />}
                            </div>
                        </div>

                        <div className="rws-call-labels-row">
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
                    exit={{ opacity: 0, scale: 0.85, y: -20 }}
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

                            <div className="rws-call-btn-wrapper">
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
